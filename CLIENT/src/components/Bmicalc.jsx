
import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { doc, getDoc,setDoc, updateDoc } from "firebase/firestore";
import NavbarNew from './NavbarNew';
import FooterNew from './FooterNew';
import Sidebar from './Sidebar';
import { toast } from "react-toastify";


function Bmicalc () {

  const [height, setHeight] = useState('');
  const [heightUnit, setHeightUnit] = useState('cm');
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [bmi, setBmi] = useState(null);
  const [classification, setClassification] = useState('');

  const calculateBMI = (e) => {
    e.preventDefault();
    let heightInMeters = heightUnit === 'cm' ? height / 100 : height;
    let weightInKg = weightUnit === 'kg' ? weight : weight * 0.453592;

    let bmiValue = weightInKg / (heightInMeters * heightInMeters);
    setBmi(bmiValue.toFixed(2));

    let classification = '';
    if (bmiValue < 18.5) {
      classification = 'Underweight';
    } else if (bmiValue >= 18.5 && bmiValue < 24.9) {
      classification = 'Normal weight';
    } else if (bmiValue >= 25 && bmiValue < 29.9) {
      classification = 'Overweight';
    } else {
      classification = 'Obese';
    }
    setClassification(classification);

    saveToFirestore(bmiValue, classification);
  };

  const saveToFirestore = async (bmi, classification) => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          await updateDoc(doc(db, "Users", user.uid), {
            uid: user.uid,
            height: height,
            heightUnit: heightUnit,
            weight: weight,
            weightUnit: weightUnit,
            age: age,
            gender: gender,
            bmi: bmi,
            classification: classification,
            
          });
          toast.success('BMI record saved successfully!', {
            position: 'bottom-center',
          });
        } catch (error) {
          toast.error('Error saving BMI record: ' + error.message, {
            position: 'bottom-center',
          });
        }
      }
    });
  };



    
    return (
        <div className="min-h-screen flex flex-col justify-between bg-blue-50">
    {/* Navbar */}
    <NavbarNew/>

      <div className="flex flex-1">
        <Sidebar/>
        <div className="container mx-auto p-4">
      <h1 className="text-2xl text-center text-blue-600 mb-4">BMI Calculator</h1>
      <form onSubmit={calculateBMI} className="max-w-md mx-auto bg-white p-6 rounded shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700">Height</label>
          <div className="flex">
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="border p-2 rounded-l w-full"
              required
            />
            <select
              value={heightUnit}
              onChange={(e) => setHeightUnit(e.target.value)}
              className="border p-2 rounded-r"
            >
              <option value="cm">cm</option>
              <option value="m">m</option>
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Weight</label>
          <div className="flex">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="border p-2 rounded-l w-full"
              required
            />
            <select
              value={weightUnit}
              onChange={(e) => setWeightUnit(e.target.value)}
              className="border p-2 rounded-r"
            >
              <option value="kg">kg</option>
              <option value="lb">lb</option>
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="border p-2 rounded w-full"
            required
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
        >
          Calculate BMI
        </button>
      </form>
      {bmi && (
        <div className="mt-4 text-center">
          <h2 className="text-xl text-blue-600">Your BMI: {bmi}</h2>
          <p className="text-lg">{classification}</p>
        </div>
      )}
    </div>
      </div> 

      

    {/* Footer */}
    <FooterNew/>
  </div>
  )
}

export default Bmicalc
