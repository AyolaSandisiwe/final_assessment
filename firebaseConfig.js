// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDJyRQsWKTC9WhNOaLzliiiQClfnW_-MBU",
  authDomain: "test2-6a1d7.firebaseapp.com",
  projectId: "test2-6a1d7",
  storageBucket: "test2-6a1d7.firebasestorage.app",
  messagingSenderId: "98527691765",
  appId: "1:98527691765:web:568cad36c3897848a256bc",
  measurementId: "G-P2YN9NT3SX"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getDatabase(app);
