import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from "firebase/database";

// Firebase configuration - Get these values from your Firebase console
const firebaseConfig = {
  apiKey: "AIzaSyAtH_XNN9zq8aQOW72qfC3Ezq_pp6HyxHA",
  authDomain: "phishingchallenge-411da.firebaseapp.com",
  databaseURL: "https://phishingchallenge-411da-default-rtdb.firebaseio.com",
  projectId: "phishingchallenge-411da",
  storageBucket: "phishingchallenge-411da.firebasestorage.app",
  messagingSenderId: "197655798552",
  appId: "1:197655798552:web:d148750e7ed7e3a9a7b46d",
  measurementId: "G-S8Y0KC5CYV",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Auth instance
export default app;
export const auth = getAuth(app);
export const database = getDatabase(app);
export const KEY = firebaseConfig.GEMINI_KEY;
