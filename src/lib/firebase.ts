// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "healthlink-hub-ef6t7",
  "appId": "1:839928784412:web:063dd207603be31acba1d9",
  "storageBucket": "healthlink-hub-ef6t7.firebasestorage.app",
  "apiKey": "AIzaSyDixuTsYi0qQuBzoVgzw0iPDdDNuIv3qhY",
  "authDomain": "healthlink-hub-ef6t7.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "839928784412"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
