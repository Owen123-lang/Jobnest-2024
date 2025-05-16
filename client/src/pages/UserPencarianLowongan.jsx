import React, { useState } from 'react';
import Navbar from '../components/Navbar';

const UserPencarianLowongan = () => {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');

  const jobs = [
    {
      id: 1,
      title: 'Software Engineer',
      company: 'PT ABC TEKNOLOGI',
      location: 'Jakarta',
      type: 'Full-Time',
      description: 'Deskripsi lainnya',
      posted: '3 hari yang lalu',
    },
    {
      id: 2,
      title: 'Frontend Developer',
      company: 'XYZ Solutions',
      location: 'Bandung',
      type: 'Part-Time',
      description: 'Deskripsi lainnya',
      posted: '5 hari yang lalu',
    },
    {
      id: 3,
      title: 'Backend Engineer',
      company: 'TechnoDev',
      location: 'Remote',
      type: 'Full-Time',
      description: 'Deskripsi lainnya',
      posted: '1 minggu yang lalu',
    },
  ];

  const filteredJobs = jobs.filter(
    (job) =>
      (location === '' || job.location.toLowerCase().includes(location.toLowerCase())) &&
      (jobType === '' || job.type.toLowerCase().includes(jobType.toLowerCase())) &&
      (search === '' || job.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">Cari Lowongan Pekerjaan</h1>
        <div className="flex space-x-4 mb-6">
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Lokasi</option>
            <option value="Jakarta">Jakarta</option>
            <option value="Bandung">Bandung</option>
            <option value="Remote">Remote</option>
          </select>
          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Jenis Kerja</option>
            <option value="Full-Time">Full-Time</option>
            <option value="Part-Time">Part-Time</option>
          </select>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari Kata Kunci"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
          />
          <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Cari
          </button>
        </div>

        <div className="space-y-4 text-left">
          {filteredJobs.map((job) => (
            <div key={job.id} className="p-4 bg-white shadow rounded-md flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">{job.title}</h2>
                <p className="text-gray-600">{job.company}</p>
                <p className="text-gray-500">{job.type}</p>
                <p className="text-gray-500">{job.description}</p>
              </div>
              <p className="text-blue-600 text-sm">{job.posted}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default UserPencarianLowongan;
