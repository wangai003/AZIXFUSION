// firebase.js - Frontend Firebase Configuration
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Firebase services
const auth = getAuth(app);
const firestore = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google Auth Provider (optional settings)
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Export Firebase services and auth methods
export { 
  app, 
  auth, 
  firestore, 
  googleProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};
