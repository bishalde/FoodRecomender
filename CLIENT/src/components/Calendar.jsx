import React, { useEffect, useState } from "react";
import NavbarNew from "./NavbarNew";
import FooterNew from "./FooterNew";
import Sidebar from "./Sidebar";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { auth, db } from "./firebase";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [uid, setUid] = useState(null);
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // January is 0
  const day = String(today.getDate()).padStart(2, "0");
  const formattedDate = `${year}-${month}-${day}`;

  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUid(user.uid); // Set the UID
        const docRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
          console.log("CALENDAR", docSnap.data());
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

  useEffect(() => {
    const fetchUserMealPlans = async () => {
      if (!uid) return; // Return if UID is not available

      try {
        const mealPlansRef = collection(db, 'FoodRecommender', uid, 'MealPlans');
        const q = query(mealPlansRef, where('date', '>=', `${year}-${month}-${day}`));
        const querySnapshot = await getDocs(q);

        const fetchedEvents = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const mealPlan = data.meal_plan;

          // Prepare meal items as lists
          const breakfastItems = mealPlan.breakfast.map(meal => `<li>${meal.Name} (${meal.Calorie} cal)</li>`).join('');
          const lunchItems = mealPlan.lunch.map(meal => `<li>${meal.Name} (${meal.Calorie} cal)</li>`).join('');
          const dinnerItems = mealPlan.dinner.map(meal => `<li>${meal.Name} (${meal.Calorie} cal)</li>`).join('');

          // Add meal plan events with lists
          if (breakfastItems) {
            fetchedEvents.push({
              title: "Breakfast",
              date: formattedDate,
              description: `<ul>${breakfastItems}</ul>`
            });
          }
          if (lunchItems) {
            fetchedEvents.push({
              title: "Lunch",
              date: formattedDate,
              description: `<ul>${lunchItems}</ul>`
            });
          }
          if (dinnerItems) {
            fetchedEvents.push({
              title: "Dinner",
              date: formattedDate,
              description: `<ul>${dinnerItems}</ul>`
            });
          }
        });

        setEvents(fetchedEvents);

      } catch (error) {
        console.error("Error fetching meal plans:", error);
      }
    };

    fetchUserMealPlans();
  }, [uid, formattedDate]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-blue-50">
      {/* Navbar */}
      <NavbarNew />

      {/* Main Content with Sidebar and Calendar */}
      <div className="flex flex-1">
        <Sidebar />
        {/* Container for FullCalendar */}
        <div className="flex-1 flex flex-col p-6">
          {/* FullCalendar Component */}
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            height="100%"
            events={events}
            eventContent={({ event }) => (
              <div className="event-content">
                <b>{event.title}</b>
                <div className="event-description" dangerouslySetInnerHTML={{ __html: event.extendedProps.description }}></div>
              </div>
            )}
          />
        </div>
      </div>

      {/* Footer */}
      <FooterNew />
    </div>
  );
};

export default Calendar;
