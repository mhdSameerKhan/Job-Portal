// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA7yequ2FkyALTJ9FhSx8IkK_kWalzAeKg",
  authDomain: "studentjobportal-651a3.firebaseapp.com",
  projectId: "studentjobportal-651a3",
  storageBucket: "studentjobportal-651a3.firebasestorage.app",
  messagingSenderId: "832829204804",
  appId: "1:832829204804:web:8e0271dae715234d320f11",
  measurementId: "G-7MB9Z4NCT5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
