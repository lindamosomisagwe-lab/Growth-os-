import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBdxjq14Ky6a3n9IMj4LdO_lagVggqKnRY",
  authDomain: "growth-os-c892b.firebaseapp.com",
  projectId: "growth-os-c892b",
  storageBucket: "growth-os-c892b.firebasestorage.app",
  messagingSenderId: "903565722912",
  appId: "1:903565722912:web:a72984814f4fc7f4820345",
  measurementId: "G-GYE4W6HVS5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
