// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDNHwJ-IDlT6HuDL5TcwKZBqpWwt-3DbGg",
  authDomain: "abakore-dbd6d.firebaseapp.com",
  databaseURL: "https://abakore-dbd6d-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "abakore-dbd6d",
  storageBucket: "abakore-dbd6d.firebasestorage.app",
  messagingSenderId: "150959006299",
  appId: "1:150959006299:web:8ed29edc130564b0ead57e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db   = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)