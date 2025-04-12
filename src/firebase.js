import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAfREXicyjVBZm16TN08XNeONsgNI2PmFM",
  authDomain: "feedback-system-5e57d.firebaseapp.com",
  projectId: "feedback-system-5e57d",
  storageBucket: "feedback-system-5e57d.appspot.com",
  messagingSenderId: "218815266826",
  appId: "1:218815266826:web:6566bc6e985e8dd339dff3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
