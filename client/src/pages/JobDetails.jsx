import React from 'react';
import { useParams } from 'react-router-dom';

function JobDetails() {
  const { id } = useParams(); // Ambil ID dari URL

  return (
    <div className="bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Job Details</h1>
        <p className="text-gray-700">Details for job ID: {id}</p>
        {/* Tambahkan detail pekerjaan di sini */}
      </div>
    </div>
  );
}

export default JobDetails;