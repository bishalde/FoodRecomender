// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "",
//   authDomain: "",
//   projectId: "",
//   storageBucket: "",
//   messagingSenderId: "",
//   appId: ""
// };
const firebaseConfig = {
  apiKey: "AIzaSyCFY0XgSQfzFXz-H6TX4htPsftH2pcrzRE",
  authDomain: "reactfyp-9d8ca.firebaseapp.com",
  projectId: "reactfyp-9d8ca",
  storageBucket: "reactfyp-9d8ca.appspot.com",
  messagingSenderId: "347320694512",
  appId: "1:347320694512:web:9a2d2af4c86526613eb435"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth=getAuth();
export const db=getFirestore(app);
export default app;