
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB1ZRQgZrWC6XPBldBEwHTU4qi95qILjO8",
  authDomain: "final-assessment-f1e33.firebaseapp.com",
  projectId: "final-assessment-f1e33",
  storageBucket: "final-assessment-f1e33.appspot.com",
  messagingSenderId: "370345859849",
  appId: "1:370345859849:web:103d4db3b8026c8c42d1d8",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

