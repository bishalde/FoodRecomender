import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import NavbarNew from "./NavbarNew";
import FooterNew from "./FooterNew";
import Sidebar from "./Sidebar";

const MealPlan = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [formData, setFormData] = useState({
    weight: "",
    height: "",
    gender: "",
    age: "",
    allergies: "",
    cuisine: "",
    total_calories: "",
    diet_type: "",
    uid:""
  });
  const [mealPlans, setMealPlans] = useState(null); // Updated to store the meal plan response

  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
          setFormData((prevData) => ({
            ...prevData,
            uid: user.uid,  // Set the UID in formData
          }));
          console.log(docSnap.data());
        } else {
          console.log("User data not found");
        }
      } else {
        console.log("User is not logged in");
      }
    });
  };
  

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(userDetails.uid)
  
    console.log(formData);
    try {
      const response = await fetch("http://127.0.0.1:5000/recommend_meals2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Response from API:", data);
        if (data.message === "No valid combinations found for the given criteria.") {
          toast.error("No valid combinations found. Please adjust your input values and try again.");
        } else if (data) {
          setMealPlans(data); // Store the meal plan data
          toast.success("Meal plan generated successfully!");
        }
      } else {
        toast.error("Failed to submit meal plan");
      }
    } catch (error) {
      console.error("Error submitting meal plan:", error.message);
      toast.error("An error occurred. Please try again.");
    }
  };

  async function handleLogout() {
    try {
      await auth.signOut();
      window.location.href = "/login";
      console.log("User logged out successfully!");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-blue-50">
      {/* Navbar */}
      <NavbarNew />

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar />
        <div className="max-h-full w-full my-6 flex flex-col items-center justify-center">
          <h1 className="text-5xl font-bold my-6 text-gray-800">Meal Planner</h1>
          <div className="w-full max-w-[900px] bg-white p-8 rounded-xl shadow-lg transform hover:shadow-2xl transition-shadow duration-300 ease-in-out">
            <form onSubmit={handleSubmit}>
              {/* Form Fields */}
              {/* Weight Input */}
              <div className="mb-3">
                <label className="block text-md font-semibold text-gray-600">
                  Weight
                </label>
                <input
                  type="text"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="Enter your weight in kg"
                  className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {/* Height Input */}
              <div className="mb-3">
                <label className="block text-sm font-semibold text-gray-600">
                  Height
                </label>
                <input
                  type="text"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="Enter your height in cm"
                  className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {/* Total Calories Input */}
              <div className="mb-3">
                <label className="block text-sm font-semibold text-gray-600">
                  Total Calories
                </label>
                <input
                  type="text"
                  name="total_calories"
                  value={formData.total_calories}
                  onChange={handleChange}
                  className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your total daily calorie intake"
                  required
                />
              </div>
              {/* Age Input */}
              <div className="mb-3">
                <label className="block text-sm font-semibold text-gray-600">
                  Age
                </label>
                <input
                  type="text"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your age in years"
                  required
                />
              </div>
              {/* Gender Select */}
              <div className="mb-3">
                <label className="block text-sm font-semibold text-gray-600">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="" disabled>
                    Select Gender
                  </option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              {/* Allergies Select */}
              <div className="mb-3">
                <label className="block text-sm font-semibold text-gray-600">
                  Allergies
                </label>
                <select
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="" disabled>
                    Select Allergy
                  </option>
                  <option value="None">None</option>
                  <option value="Gluten">Gluten</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Nuts">Nuts</option>
                  <option value="Soy">Soy</option>
                  <option value="Shellfish">Shellfish</option>
                  <option value="Eggs">Eggs</option>
                  <option value="Fish">Fish</option>
                  <option value="Wheat">Wheat</option>
                </select>
              </div>
              {/* Cuisine Select */}
              <div className="mb-3">
                <label className="block text-sm font-semibold text-gray-600">
                  Cuisine
                </label>
                <select
                  name="cuisine"
                  value={formData.cuisine}
                  onChange={handleChange}
                  className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="" disabled>
                    Select Cuisine
                  </option>
                  <option value="Indian">Indian</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Malay">Malay</option>
                  <option value="American">American</option>
                  <option value="Mediterranean">Mediterranean</option>
                </select>
              </div>
              {/* Diet Type Select */}
              <div className="mb-3">
                <label className="block text-sm font-semibold text-gray-600">
                  Diet Type
                </label>
                <select
                  name="diet_type"
                  value={formData.diet_type}
                  onChange={handleChange}
                  className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="" disabled>
                    Select Diet Type
                  </option>
                  <option value="Vegan">Vegan</option>
                  <option value="Keto">Keto</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Paleo">Paleo</option>
                  <option value="Low Carb">Low Carb</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 text-white p-3 rounded-lg font-semibold shadow-lg hover:bg-blue-600 transition-all duration-300 ease-in-out"
              >
                Submit
              </button>
            </form>

            {/* Display Meal Plan */}

            {mealPlans && (
  <div className="mt-8">
    <h2 className="text-2xl font-bold mb-6 text-center">Your Meal Plan</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {mealPlans.breakfast && (
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-semibold mb-3">Breakfast</h3>
          <ul>
            {mealPlans.breakfast.map((meal, index) => (
              <li key={index} className="mb-2">
                <p className="text-gray-700 font-medium">{meal.Name}</p>
                <p className="text-gray-500 text-sm">Calories: {meal.Calorie}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {mealPlans.lunch && (
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-semibold mb-3">Lunch</h3>
          <ul>
            {mealPlans.lunch.map((meal, index) => (
              <li key={index} className="mb-2">
                <p className="text-gray-700 font-medium">{meal.Name}</p>
                <p className="text-gray-500 text-sm">Calories: {meal.Calorie}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {mealPlans.dinner && (
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-semibold mb-3">Dinner</h3>
          <ul>
            {mealPlans.dinner.map((meal, index) => (
              <li key={index} className="mb-2">
                <p className="text-gray-700 font-medium">{meal.Name}</p>
                <p className="text-gray-500 text-sm">Calories: {meal.Calorie}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </div>
)}


          </div>
        </div>
      </div>

      <FooterNew />
    </div>
  );
};

export default MealPlan;
