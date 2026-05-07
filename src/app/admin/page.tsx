'use client';
import { useState, useEffect } from 'react';
import { db } from '../firebase-client';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  doc,
  updateDoc,
  increment,
  deleteDoc,
} from 'firebase/firestore';
import { Heart, MessageSquare, Share2, Trash2, UserCircle2 } from 'lucide-react';

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [text, setText] = useState('');
  const [links, setLinks] = useState('');
  const [category, setCategory] = useState('Agriculture');

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('147330');

  useEffect(() => {
    const storedPassword = localStorage.getItem('adminPassword');
    if (storedPassword) {
      setAdminPassword(storedPassword);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      handleLogin();
    }
  }, [isAdmin]);

  const handleLogin = () => {
    const password = prompt("Enter admin password:");
    if (password === adminPassword) {
      setIsAdmin(true);
    } else {
      alert("Incorrect password.");
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    if (newPassword.length < 4) {
      alert("Password must be at least 4 characters long.");
      return;
    }
    localStorage.setItem('adminPassword', newPassword);
    setAdminPassword(newPassword);
    setShowChangePassword(false);
    setNewPassword('');
    setConfirmPassword('');
    alert("Password changed successfully.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !links.trim()) {
      alert("Please enter some text or links to post.");
      return;
    }
    const mediaUrls = links.split(',').map(link => link.trim()).filter(link => link);
    try {
      await addDoc(collection(db, 'posts'), {
        author: 'Admin',
        content: text,
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : [],
        category: category,
        createdAt: serverTimestamp(),
        likes: 0,
      });
      setText('');
      setLinks('');
      setCategory('Agriculture');
      alert("Post successful!");
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Failed to post. Please check console for details.");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <div className='max-w-4xl mx-auto px-4'>
        <header className="text-center py-12">
          <h1 className="text-4xl font-bold text-gray-800 font-serif">Admin Panel</h1>
        </header>

        <main className="pb-8">
            {isAdmin ? (
              <div className="mb-10">
                  <div className="bg-white p-6 rounded-xl shadow-sm mb-4 border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4">Create a New Post</h2>
                    <select
                        className="w-full p-3 mb-3 text-sm bg-gray-50 border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)} >
                        <option value="Agriculture">Agriculture</option>
                        <option value="Construction">Construction</option>
                        <option value="Kids Gallery">Kids Gallery</option>
                    </select>
                    <textarea className="w-full p-4 bg-gray-50 border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-base resize-none" placeholder="What happened today?" value={text} onChange={(e) => setText(e.target.value)} rows={5} />
                    <input className="w-full p-3 text-sm border-t mt-3 bg-gray-50 border-gray-200" placeholder="Image URLs, separated by commas..." value={links} onChange={(e) => setLinks(e.target.value)} />
                    <button onClick={handleSubmit} className="w-full bg-blue-600 text-white py-3 rounded-lg mt-4 font-semibold hover:bg-blue-700 transition-colors">Publish Post</button>
                  </div>
                  <div className="text-center mb-8 flex justify-center items-center space-x-6">
                      <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-red-600 font-medium">Logout</button>
                      <button onClick={() => setShowChangePassword(!showChangePassword)} className="text-sm text-gray-600 hover:text-blue-600 font-medium">Change Password</button>
                  </div>
                  {showChangePassword && (
                      <div className="bg-white p-5 rounded-xl shadow-sm mb-8 border border-gray-200 max-w-md mx-auto">
                          <h3 className="text-lg font-semibold mb-4 text-center">Change Admin Password</h3>
                          <input
                              type="password"
                              placeholder="New Password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full p-3 mb-3 text-sm bg-gray-50 border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          />
                          <input
                              type="password"
                              placeholder="Confirm New Password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="w-full p-3 mb-3 text-sm bg-gray-50 border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          />
                          <button onClick={handleChangePassword} className="w-full bg-blue-600 text-white py-3 rounded-lg mt-2 font-semibold hover:bg-blue-700 transition-colors">Save New Password</button>
                      </div>
                  )}
              </div>
            ) : null}
        </main>
      </div>
    </div>
  );
}
