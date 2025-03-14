// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDez-3_pVJepyOkMxvWp5IL5_-cf2fmXdk",
  authDomain: "azix-7ffe4.firebaseapp.com",
  projectId: "azix-7ffe4",
  storageBucket: "azix-7ffe4.appspot.com",
  messagingSenderId: "40354643169",
  appId: "1:40354643169:web:d3cd66059540d3cb36cba0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, signInWithEmailAndPassword };
