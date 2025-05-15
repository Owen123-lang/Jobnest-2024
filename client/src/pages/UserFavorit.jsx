import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { Star, StarOff } from 'lucide-react';

const UserFavorit = () => {
  // Semua job yang tersedia (bisa dari API/backend nanti)
  const allJobs = [
    {
      id: 1,
      title: 'Software Engineer',
      company: 'PT ABC TEKNOLOGI',
      type: 'FULL-TIME',
      description: 'Membangun dan mengembangkan aplikasi web menggunakan React dan Node.js.',
      location: 'Jakarta',
      datePosted: '2 minggu yang lalu',
    },
    {
      id: 2,
      title: 'Frontend Developer',
      company: 'XYZ Solutions',
      type: 'PART-TIME',
      description: 'Membuat antarmuka pengguna dengan Vue.js dan Tailwind.',
      location: 'Bandung',
      datePosted: '5 hari yang lalu',
    },
    {
      id: 3,
      title: 'Backend Engineer',
      company: 'TechnoDev',
      type: 'FULL-TIME',
      description: 'Mengelola API dan database PostgreSQL.',
      location: 'Remote',
      datePosted: '1 minggu yang lalu',
    },
  ];

  // Favorit disimpan berdasarkan ID
  const [favoriteIds, setFavoriteIds] = useState([1, 3]); // Awalnya job 1 dan 3 adalah favorit

  const toggleFavorite = (id) => {
    if (favoriteIds.includes(id)) {
      // Hapus dari favorit
      setFavoriteIds(favoriteIds.filter((favId) => favId !== id));
    } else {
      // Tambah ke favorit
      setFavoriteIds([...favoriteIds, id]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold text-gray-800 mb-8">Favorit Saya</h1>

        {/* Job Cards */}
        <div className="space-y-4 text-left">
          {allJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-md shadow border border-gray-200 p-6 flex justify-between items-center"
            >
              <div>
                <Link
                  to={`/user/job-details/${job.id}`}
                  className="text-lg font-semibold text-blue-700 hover:underline"
                >
                  {job.title}
                </Link>
                <p className="text-sm text-gray-600">{job.company}</p>
                <p className="text-sm text-gray-600">{job.location} · {job.type}</p>
                <p className="text-sm text-gray-500 mt-1">{job.description}</p>
              </div>

              {/* Tombol Bintang */}
              <button
                onClick={() => toggleFavorite(job.id)}
                className="text-yellow-500 hover:scale-110 transition"
              >
                {favoriteIds.includes(job.id) ? (
                  <Star fill="currentColor" className="w-6 h-6" />
                ) : (
                  <StarOff className="w-6 h-6 text-gray-400" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserFavorit;
