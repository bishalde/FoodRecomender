from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from langchain.prompts import PromptTemplate
from langchain_openai import OpenAI
from langchain.chains import LLMChain
import os, re, pandas as pd, datetime
from itertools import product

import firebase_admin
from firebase_admin import credentials, firestore

from dotenv import load_dotenv
load_dotenv()
os.environ['OPENAI_API_KEY'] = os.getenv("OPEN_AI_KEY")

app = Flask(__name__)
cors = CORS(app)

llm_resto = OpenAI(temperature=0.6)

cred = credentials.Certificate("reactfyp-9d8ca-firebase-adminsdk-4v4dd-4dc619308e.json")
firebase_admin.initialize_app(cred)

# Get Firestore client
db = firestore.client()

file_path = "Cuisines.xlsx"
sheet_data = pd.read_excel(file_path, sheet_name='Sheet1')

sheet_data['Calorie'] = pd.to_numeric(sheet_data['Calorie'], errors='coerce')

def round_to_nearest_10(calories):
    """Round calorie value to the nearest number divisible by 10."""
    return round(calories / 10) * 10

def filter_meals(meal_type, allergies, cuisine, diet_type):
    """Filter meals based on meal type, allergies, cuisine, and diet type."""
    filtered = sheet_data[sheet_data['MealType'].str.lower() == meal_type.lower()]

    # Filter by allergy
    if allergies:
        filtered = filtered[~filtered['Allergy'].str.contains(allergies, case=False, na=False)]

    # Filter by cuisine
    if cuisine:
        filtered = filtered[filtered['Cuisine'].str.lower() == cuisine.lower()]

    # Filter by diet type
    if diet_type:
        filtered = filtered[filtered['Vegan/Keto'].str.lower() == diet_type.lower()]

    return filtered[['Name', 'Calorie']]

def find_meal_combinations_near_target(total_calories, allergies, cuisine, diet_type, tolerance=50):
    """Find meal combinations that sum up to the total calorie value or nearby."""
    breakfast_items = filter_meals("Breakfast", allergies, cuisine, diet_type)
    lunch_items = filter_meals("Lunch", allergies, cuisine, diet_type)
    dinner_items = filter_meals("Dinner", allergies, cuisine, diet_type)

    valid_combinations = []
    closest_combination = None
    closest_calorie_diff = float('inf')

    for breakfast, lunch, dinner in product(breakfast_items.itertuples(), lunch_items.itertuples(), dinner_items.itertuples()):
        total = breakfast.Calorie + lunch.Calorie + dinner.Calorie
        calorie_diff = abs(total - total_calories)

        # If exact match found, return it immediately
        if calorie_diff == 0:
            return [{
                "Breakfast": {"Name": breakfast.Name, "Calorie": breakfast.Calorie},
                "Lunch": {"Name": lunch.Name, "Calorie": lunch.Calorie},
                "Dinner": {"Name": dinner.Name, "Calorie": dinner.Calorie},
                "Total Calories": total
            }]
        
        # Store the closest combination if within the tolerance range
        if calorie_diff < closest_calorie_diff and calorie_diff <= tolerance:
            closest_combination = {
                "Breakfast": {"Name": breakfast.Name, "Calorie": breakfast.Calorie},
                "Lunch": {"Name": lunch.Name, "Calorie": lunch.Calorie},
                "Dinner": {"Name": dinner.Name, "Calorie": dinner.Calorie},
                "Total Calories": total
            }
            closest_calorie_diff = calorie_diff
    
    # If no exact match, return the closest combination
    if closest_combination:
        return [closest_combination]

    # If no combination is close enough, return an empty list
    return []

prompt_template_resto = PromptTemplate(
    input_variables=['weight', 'height', 'gender', 'age', 'allergies','total_calories', 'diet_type'],
    template="Diet Recommendation System:\n"
             " Recommend random 1 healthy breakfast, 1 healthy lunch, 1 healthy dinner that collectively total up to {total_calories} calories,"
             " based on the following criteria:\n"
             "Weight: {weight} \n"
             "Height: {height} \n"
             "Gender: {gender} \n"
             "Age: {age} \n"
             "Allergies: {allergies} \n"
             "Total Calories for the Day: {total_calories}\n"
             "Diet Type: {diet_type}\n"
)

@app.route('/', methods=['GET', 'POST'])
def home():
    data = {
        "message": "Welcome to the Diet Recommendation API!",
        "Status": 200,
        "Running": True,
        "time": datetime.datetime.now()
    }
    return jsonify(data)

@app.route('/recommend', methods=['POST'])
def recommend():
    if request.method == "POST":
        data = request.get_json()

        weight = data.get('weight')
        height = data.get('height')
        gender = data.get('gender')
        age = data.get('age')
        allergies = data.get('allergies')
        total_calories = data.get('total_calories')
        diet_type = data.get('diet_type')

        chain_resto = LLMChain(llm=llm_resto, prompt=prompt_template_resto)

        input_data = {'weight': weight, 'height': height, 'gender': gender, 'age': age, 'allergies': allergies, 'total_calories': total_calories, 'diet_type': diet_type}
        results = chain_resto.run(input_data)
        print(results)

        breakfast_names = re.findall(r'Breakfast:(.*?)Lunch:', results, re.DOTALL)
        lunch_names = re.findall(r'Lunch:(.*?)Dinner:', results, re.DOTALL)
        dinner_names = re.findall(r'Dinner:(.*?)Total Calories:', results, re.DOTALL)
        total_calories = re.findall(r'Total Calories:(.*?)$', results, re.DOTALL)

        breakfast_names = [name.strip() for name in breakfast_names[0].strip().split('\n') if name.strip()] if breakfast_names else []
        lunch_names = [name.strip() for name in lunch_names[0].strip().split('\n') if name.strip()] if lunch_names else []
        dinner_names = [name.strip() for name in dinner_names[0].strip().split('\n') if name.strip()] if dinner_names else []
        total_calories = [name.strip() for name in total_calories[0].strip().split('\n') if name.strip()] if total_calories else []

        response = {
            'breakfast': breakfast_names,
            'lunch': lunch_names,
            'dinner': dinner_names,
            'total_calories': data.get('total_calories')
        }

        return jsonify(response)

@app.route('/recommend_meals2', methods=['POST'])
def recommend_meals2():
    data = request.json
    total_calories = int(data['total_calories'])
    total_calories = round_to_nearest_10(total_calories)

    allergies = data.get('allergies', "")
    cuisine = data.get('cuisine', "")
    diet_type = data.get('diet_type', "")
    uid = data.get('uid', "")  # Get UID from the request

    # Find meal combinations
    meal_combinations = find_meal_combinations_near_target(total_calories, allergies, cuisine, diet_type)

    if not meal_combinations:
        return jsonify({"message": "No valid combinations found for the given criteria."})

    # Prepare response and remove duplicates
    breakfast_list = list({(combo['Breakfast']['Name'], combo['Breakfast']['Calorie']) for combo in meal_combinations})
    lunch_list = list({(combo['Lunch']['Name'], combo['Lunch']['Calorie']) for combo in meal_combinations})
    dinner_list = list({(combo['Dinner']['Name'], combo['Dinner']['Calorie']) for combo in meal_combinations})

    # Convert tuples back to dictionaries
    breakfast_list = [{"Name": name, "Calorie": calorie} for name, calorie in breakfast_list]
    lunch_list = [{"Name": name, "Calorie": calorie} for name, calorie in lunch_list]
    dinner_list = [{"Name": name, "Calorie": calorie} for name, calorie in dinner_list]

    response = {
        "breakfast": breakfast_list,
        "lunch": lunch_list,
        "dinner": dinner_list,
        "total_calories": total_calories
    }

    current_date = datetime.datetime.now().strftime('%Y-%m-%d')
    doc_id = f"{uid}_{current_date}"

    # Save meal plan to Firestore
    doc_ref = db.collection('FoodRecommender').document(uid).collection('MealPlans').document(doc_id)
    doc_ref.set({
        'meal_plan': response,
        'date': datetime.datetime.now().isoformat()
    }, merge=True)

    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
