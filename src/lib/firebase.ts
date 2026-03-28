import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBSgZjIttN2kVR1R3uxEFl0BO1A5iI8XnE",
  authDomain: "neroverse-2f2e1.firebaseapp.com",
  projectId: "neroverse-2f2e1",
  storageBucket: "neroverse-2f2e1.firebasestorage.app",
  messagingSenderId: "790583739932",
  appId: "1:790583739932:web:f52dfc4164eecf21afc1d9",
  measurementId: "G-8B3THPMH6T"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { db, auth, googleProvider };
