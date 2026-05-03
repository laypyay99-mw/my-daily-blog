"use client";
import { useState } from "react";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

export default function Home() {
  const [text, setText] = useState("");

  const handleSubmit = async () => {
    if (!text) return;
    try {
      await addDoc(collection(db, "posts"), {
        content: text,
        date: new Date().toISOString(),
      });
      setText("");
      alert("စာမူ သိမ်းဆည်းပြီးပါပြီ!");
    } catch (e) {
      console.error("Error: ", e);
      alert("Error ဖြစ်သွားပါတယ်!");
    }
  };

  return (
    <div className="p-10 bg-white min-h-screen text-black">
      <h1 className="text-2xl font-bold mb-5 text-green-700">🌱 ကျွန်တော့်ရဲ့ Blog</h1>
      <div className="bg-gray-100 p-5 rounded-lg border">
        <textarea 
          className="border p-3 w-full rounded h-32 mb-3 outline-none" 
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="ဒီနေ့ ဘာတွေထူးခြားသလဲ..."
        />
        <br />
        <button 
          onClick={handleSubmit}
          className="bg-green-600 text-white px-8 py-2 rounded-full font-bold"
        >
          စာမူတင်မည်
        </button>
      </div>
    </div>
  );
}