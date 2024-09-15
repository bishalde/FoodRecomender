
import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

const NavbarNew = () => {
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
  return (
    <nav className="bg-blue-400 text-white p-4 flex items-center w-full">
        <div className="ml-auto flex items-center">
          <span className="text-xl">
            Welcome {userDetails?.firstName} 
          </span>
          
        </div>
      </nav>
  )
}

export default NavbarNew