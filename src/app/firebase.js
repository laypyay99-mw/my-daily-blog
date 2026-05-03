import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// သင့်ရဲ့ Firebase Console ကရတဲ့ ကုဒ်အစစ်အမှန်များ
const firebaseConfig = {
  apiKey: "AIzaSyA2EHRJpcdqdYhuEnW0XIbBv6WUrjz5LD4",
  authDomain: "my-daily-blog-e2600.firebaseapp.com",
  projectId: "my-daily-blog-e2600",
  storageBucket: "my-daily-blog-e2600.firebasestorage.app",
  messagingSenderId: "182614588755",
  appId: "1:182614588755:web:74964813d05ad6b404b5a6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Database ကို export လုပ်ပြီး တခြားဖိုင်တွေမှာ သုံးလို့ရအောင် လုပ်ခြင်း
export const db = getFirestore(app);