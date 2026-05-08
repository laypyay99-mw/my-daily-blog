'use client';

import Link from 'next/link';
import React from 'react';

// Updated portfolio items based on your app's categories
const portfolioItems = [
  {
    image: 'https://i.ibb.co/jsB2Dqb/IMG-68daa428ad75f0e44871739688e41955-V.jpg',
    category: 'My Plant Diary',
    title: 'My Green Corner'
  },
  {
    image: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=2070&auto=format&fit=crop',
    category: 'Art Gallery',
    title: 'Colors of Life'
  },
  {
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2132&auto=format&fit=crop',
    category: "School Projects",
    title: 'Learning and Creating'
  }
];

export default function PortfolioPage() {
  return (
    <div className="font-sans bg-cover bg-center" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1488345979593-09db0f85545f?q=80&w=3540&auto=format&fit=crop)'}}>
      <div className="container mx-auto px-6 py-16">
        
        <header 
          className="relative text-center mb-16 rounded-3xl overflow-hidden shadow-2xl bg-cover bg-center bg-[url('https://images.unsplash.com/photo-1488345979593-09db0f85545f?q=80&w=3540&auto=format&fit=crop')]"
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
          <div className="relative z-10 py-24 px-6">
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4">
              My Daily Diary
            </h1>
            <p className="text-lg text-gray-200">
              A visual journey through my projects and adventures!
            </p>
          </div>
        </header>

        <main className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {portfolioItems.map((item, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-xl overflow-hidden group transition-all duration-300 ease-in-out transform hover:scale-105 hover:-translate-y-1 hover:shadow-2xl hover:shadow-pink-400/30">
              <div className="overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"/>
              </div>
              <div className="p-6">
                <p className="text-sm font-semibold text-pink-600 mb-1">{item.category}</p>
                <h3 className="text-2xl font-bold text-gray-900">{item.title}</h3>
              </div>
            </div>
          ))}
        </main>

        <div className="text-center mt-20">
          <Link href="/diary">
            <span className="bg-green-500 hover:bg-green-600 text-white font-bold py-5 px-14 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 shadow-xl hover:shadow-2xl hover:shadow-green-500/50 text-lg">
              Go to Diary
            </span>
          </Link>
        </div>

        <footer className="w-full text-center text-gray-600 mt-24">
          <p>&copy; 2024 My Daily Diary. Built with fun!</p>
        </footer>
        
      </div>
    </div>
  );
}
