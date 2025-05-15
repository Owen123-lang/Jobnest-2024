import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ArrowLeft } from 'lucide-react';

const jobData = [
  {
    id: 1,
    title: 'Software Engineer',
    company: 'PT ABC TEKNOLOGI',
    location: 'Jakarta',
    type: 'Full-Time',
    salary: 'RP 10–15 Juta',
    description: ['Membangun aplikasi React', 'Bekerja dengan tim frontend', 'Mengoptimalkan performa'],
    qualifications: ['S1 Teknik Informatika', 'Berpengalaman React', 'Familiar Git'],
    about: 'Perusahaan teknologi yang berkembang pesat.',
  },
  {
    id: 2,
    title: 'Frontend Developer',
    company: 'XYZ Solutions',
    location: 'Bandung',
    type: 'Part-Time',
    salary: 'RP 5–7 Juta',
    description: ['Mengembangkan UI', 'Kolaborasi dengan backend', 'Menggunakan Tailwind CSS'],
    qualifications: ['Pengalaman dengan Vue', 'CSS expert', 'Team player'],
    about: 'Startup penyedia solusi digital.',
  },
  {
    id: 3,
    title: 'Backend Engineer',
    company: 'TechnoDev',
    location: 'Remote',
    type: 'Full-Time',
    salary: 'RP 12–18 Juta',
    description: ['Membangun API', 'Kelola database', 'Integrasi sistem'],
    qualifications: ['Menguasai Node.js', 'Pengalaman PostgreSQL', 'Problem-solving'],
    about: 'Perusahaan software remote-first.',
  },
];

const UserJobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const job = jobData.find((j) => j.id === parseInt(id));

  if (!job) {
    return <div className="p-10 text-center">Job tidak ditemukan</div>;
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10">
        <button onClick={() => navigate(-1)} className="flex items-center text-blue-600 mb-4 hover:underline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Daftar
        </button>

        <h1 className="text-3xl font-bold mb-4 text-left">{job.title}</h1>

        <div className="flex items-center space-x-4 mb-6">
          <img src="/images/glints-logo.png" alt="Logo" className="w-16 h-16 object-contain" />
          <h2 className="text-2xl font-semibold">{job.company}</h2>
        </div>

        <p className="text-gray-600 mb-6 text-left">
          {job.location} · {job.type} · {job.salary}
        </p>

        <section className="mb-6 text-left">
          <h3 className="text-xl font-semibold mb-2">Deskripsi Pekerjaan</h3>
          <ul className="list-disc pl-6 space-y-1">
            {job.description.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mb-6 text-left">
          <h3 className="text-xl font-semibold mb-2">Kualifikasi</h3>
          <ul className="list-disc pl-6 space-y-1">
            {job.qualifications.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mb-10 text-left">
          <h3 className="text-xl font-semibold mb-2">Tentang Perusahaan</h3>
          <p>{job.about}</p>
        </section>

        <button className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800">
          Lamar Sekarang
        </button>
      </div>
    </div>
  );
};

export default UserJobDetails;
