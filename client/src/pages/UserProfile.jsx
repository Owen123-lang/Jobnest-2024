import React from 'react';
import Navbar from '../components/Navbar';

const UserProfile = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center space-x-6 mb-8">
          <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center text-4xl font-bold text-gray-600">
            {/* Placeholder untuk foto profil */}
            <span>A</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Azka Nabihan</h1>
            <p className="text-gray-600">Azka@example.com</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-lg font-semibold mb-2">Profil</h2>
            <p>Azka Nabihan</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Portfolio</h2>
            <p>Portfolio.pdf</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Keahlian</h2>
            <div className="flex space-x-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">Javascript</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">React</span>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Ketertarikan</h2>
            <p>FULLSTACK DEV</p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Lowongan Favorit</h2>
          <div className="p-4 bg-white shadow rounded-lg">
            <h3 className="text-xl font-bold">Software Developer</h3>
            <p className="text-gray-600">ABC, Jakarta, Indonesia</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;