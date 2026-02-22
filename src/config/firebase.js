import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBElbKo-nmrf1n5M-UYzkqYfv4TjuoirqA",
    authDomain: "chaostyping.firebaseapp.com",
    projectId: "chaostyping",
    storageBucket: "chaostyping.firebasestorage.app",
    messagingSenderId: "367338841752",
    appId: "1:367338841752:web:238b0949352f244b6bd2ed",
    measurementId: "G-0ZGCDFJ9YK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
