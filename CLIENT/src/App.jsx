import React, { useEffect } from "react";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./components/Login";
import SignUp from "./components/Register";
import Bmicalc from "./components/Bmicalc";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Profile from "./components/profile";
import { useState } from "react";
import { auth } from "./components/firebase";
import NavbarNew from "./components/NavbarNew";
import FooterNew from "./components/FooterNew";
import Sidebar from "./components/Sidebar";
import ProfileEdit from "./components/EditingProf";
import Calendar from "./components/Calendar";

import MealPlan from "./components/MealPlan";
import MealPlan2 from "./components/MealPlan2";




function App() {
  const [user, setUser] = useState();
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setUser(user);
    });
  });
  return (
    <Router>
      <div className=" bg-blue-50">
        <div className="auth-wrapper">
          <div className="auth-inner">
            <Routes>
              <Route
                path="/"
                element={user ? <Navigate to="/profile" /> : <Login />}
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<SignUp />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/bmicalc" element={<Bmicalc/>} />
              <Route path="/navbarNew" element={<NavbarNew/>}/>
              <Route path="/footerNew" element={<FooterNew/>}/>
              <Route path="/sideBar" element={<Sidebar/>}/>
              <Route path="/EditProfile" element={<ProfileEdit/>}/>
              
              <Route path="/Calendar" element={<Calendar />}/>
              <Route path="/MealPlan" element={<MealPlan/>}/>
              <Route path="/MealPlan2" element={<MealPlan2/>}/>
              
            </Routes>
            <ToastContainer />
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;