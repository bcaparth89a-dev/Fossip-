// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyCwNceQOFHOfsCtglg5A0JKzVZd_x07I0U",
  authDomain: "shoes-shop-3cbe6.firebaseapp.com",
  databaseURL: "https://shoes-shop-3cbe6-default-rtdb.firebaseio.com", // ✅ correct this!
  projectId: "shoes-shop-3cbe6",
  storageBucket: "shoes-shop-3cbe6.appspot.com", // ✅ fix typo: it was .firebasestorage.app (wrong)
  messagingSenderId: "310558446580",
  appId: "1:310558446580:web:c4c2d4d8dbf80e13b0dfa1"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const dbFirestore = getFirestore(app);