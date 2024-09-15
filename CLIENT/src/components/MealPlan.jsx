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
  });
  const [mealPlans, setMealPlans] = useState([]); // State to hold the meal plans response

  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
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
    console.log(formData);
    try {
      const response = await fetch("http://127.0.0.1:5000/recommend_meals", {
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
        } else if (data["Meal Combinations"]) {
          setMealPlans(data["Meal Combinations"]);
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
          <h1 className="text-5xl font-bold my-6 text-gray-800">
            Meal Planner
          </h1>
          <div className="w-full max-w-[600px] bg-white p-8 rounded-xl shadow-lg transform hover:shadow-2xl transition-shadow duration-300 ease-in-out">
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
              {/* Other Input Fields */}
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
                  <option value="Mediterranean">Mediterranean</option>
                  <option value="Low-carb">Low-Carb</option>
                  <option value="High-protein">High-Protein</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 my-3 rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Generate Meal Plan
              </button>
            </form>
          </div>

          {/* Display the meal plans */}
          {mealPlans.length > 0 && (
            <div className="w-full max-w-[600px] p-8 mt-10 rounded-2xl shadow-xl">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
                Your Personalized Meal Plan
              </h2>
              {mealPlans.map((combination, index) => (
                <div key={index} className="mb-6">
                  <h3 className="text-2xl font-bold text-blue-600 mb-3">
                    Combination {index + 1}
                  </h3>
                  <div className="mb-4">
                    <h4 className="text-xl font-bold text-gray-700">Breakfast</h4>
                    <p className="text-gray-700">
                      {combination.Breakfast.Name} - {combination.Breakfast.Calorie} kcal
                    </p>
                  </div>
                  <div className="mb-4">
                    <h4 className="text-xl font-bold text-gray-700">Lunch</h4>
                    <p className="text-gray-700">
                      {combination.Lunch.Name} - {combination.Lunch.Calorie} kcal
                    </p>
                  </div>
                  <div className="mb-4">
                    <h4 className="text-xl font-bold text-gray-700">Dinner</h4>
                    <p className="text-gray-700">
                      {combination.Dinner.Name} - {combination.Dinner.Calorie} kcal
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <FooterNew />
    </div>
  );
};

export default MealPlan;
