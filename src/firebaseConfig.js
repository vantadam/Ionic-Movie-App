// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDRMsaSbV_pAr2Qyrjge0P5zt3fi2UwQUI",
  authDomain: "ionmovie-a7380.firebaseapp.com",
  projectId: "ionmovie-a7380",
  storageBucket: "ionmovie-a7380.appspot.com", // Updated to correct storage bucket
  messagingSenderId: "2339481026",
  appId: "1:2339481026:web:5fc9de430f5cec7979625b",
  measurementId: "G-MFKGJCGDFZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // Optional: comment out if unused
const auth = getAuth(app); // Initialize Firebase Authentication
const db = getFirestore(app); // Initialize Firestore

// Export Firebase modules for use in your app
export { auth, db };
