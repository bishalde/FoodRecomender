import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import NavbarNew from "./NavbarNew";
import FooterNew from "./FooterNew";
import Sidebar from "./Sidebar";
import ProfileEdit from "./EditingProf";



function Profile() {
  const [userDetails, setUserDetails] = useState(null);
  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user) => {
      console.log(user);

      const docRef = doc(db, "Users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserDetails(docSnap.data());
        console.log(docSnap.data());
      } else {
        console.log("User is not logged in");
      }
    });
  };
  useEffect(() => {
    fetchUserData();
  }, []);

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
    <NavbarNew/>

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar/>
        <ProfileEdit/>
      </div> 

      

      

    {/* Footer */}
    <FooterNew/>
    
  </div>
);
}
export default Profile;