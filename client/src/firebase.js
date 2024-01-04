// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "real-estate-management-75547.firebaseapp.com",
  projectId: "real-estate-management-75547",
  storageBucket: "real-estate-management-75547.appspot.com",
  messagingSenderId: "544900288696",
  appId: "1:544900288696:web:8515e94fb6b9516d8ca44d"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);