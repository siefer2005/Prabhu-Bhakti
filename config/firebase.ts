import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
    apiKey: "AIzaSyD3QxRCY9Y762Rwk97bm_nDXwXK7EvoMpA",
    authDomain: "astrochatbot-99d1a.firebaseapp.com",
    projectId: "astrochatbot-99d1a",
    storageBucket: "astrochatbot-99d1a.firebasestorage.app",
    messagingSenderId: "604631235702",
    appId: "1:604631235702:web:880e1e8089b08fe0257357",
    measurementId: "G-RRDJ888B3J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
