import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateEmail } from 'firebase/auth';
import { toast } from 'react-toastify';

function ProfileEdit() {
  const [userDetails, setUserDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
          setFirstName(docSnap.data().firstName);
          setLastName(docSnap.data().lastName);
          setEmail(docSnap.data().email);
        } else {
          console.log("No such document!");
        }
      } else {
        console.log("User is not logged in");
      }
    });
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (user) {
      try {
        // Update the email in Firebase Authentication
        await updateEmail(user, email);

        // Update the profile data in Firestore
        await updateDoc(doc(db, "Users", user.uid), {
          firstName: firstName,
          lastName: lastName,
          email: email,
        });

        // Fetch the updated data to ensure the latest data is displayed
        fetchUserData();

        toast.success('Profile updated successfully!', {
          position: 'bottom-center',
        });
        setIsEditing(false);
      } catch (error) {
        toast.error('Error updating profile: ' + error.message, {
          position: 'bottom-center',
        });
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl text-center text-blue-600 mb-4">Profile</h1>
      {userDetails && !isEditing ? (
        <div className="max-w-md mx-auto bg-white p-6 rounded shadow-md">
          <p><strong>First Name:</strong> {userDetails.firstName || 'N/A'}</p>
          <p><strong>Last Name:</strong> {userDetails.lastName || 'N/A'}</p>
          <p><strong>Email:</strong> {userDetails.email || 'N/A'}</p>
          <p><strong>BMI:</strong> {userDetails.bmi ? userDetails.bmi.toFixed(2) : 'N/A'}</p>
          <p><strong>Weight Status:</strong> {userDetails.classification || 'N/A'}</p>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full mt-4"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <form onSubmit={handleUpdate} className="max-w-md mx-auto bg-white p-6 rounded shadow-md">
          <div className="mb-4">
            <label className="block text-gray-700">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
          >
            Update Profile
          </button>
          <button
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded w-full mt-2"
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}

export default ProfileEdit;


