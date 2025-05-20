import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ArrowLeft } from 'lucide-react';
import { jobAPI, userAPI, companyAPI, auth } from '../utils/api';
import ApplyJobForm from '../components/ApplyJobForm';

const UserJobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [job, setJob] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    fetchJobDetails();
    checkIfFavorite();
  }, [id]);

  const fetchJobDetails = async () => {
    setLoading(true);
    setError(null);
    let jobResponse;
    // Fetch job details
    try {
      jobResponse = await jobAPI.getJobById(id);
      setJob(jobResponse.data);
    } catch (err) {
      console.error('Error fetching job details:', err);
      setError('Failed to load job details. Please try again.');
      setLoading(false);
      return;
    }
    // Fetch company details but don't block job display on failure
    if (jobResponse.data.company_id) {
      try {
        const companyResponse = await companyAPI.getCompanyById(jobResponse.data.company_id);
        setCompany(companyResponse.data);
      } catch (err) {
        console.warn('Error fetching company details:', err);
      }
    }
    setLoading(false);
  };

  const checkIfFavorite = async () => {
    if (!auth.isAuthenticated()) return;
    
    try {
      const response = await userAPI.checkFavorite(parseInt(id));
      setIsFavorite(response.data.isFavorited);
    } catch (err) {
      console.error('Error checking favorite status:', err);
    }
  };

  const handleToggleFavorite = async () => {
    if (!auth.isAuthenticated()) {
      navigate('/login/user');
      return;
    }
    
    try {
      if (isFavorite) {
        await userAPI.removeFromFavorites(id);
      } else {
        await userAPI.addToFavorites(id);
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black">
        <Navbar />
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-6"></div>
            <div className="h-10 bg-gray-200 rounded w-36"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white text-black">
        <Navbar />
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="text-red-700">
              <p>{error}</p>
              <button 
                onClick={fetchJobDetails}
                className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 py-1 px-3 rounded-md"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-white text-black">
        <Navbar />
        <div className="max-w-5xl mx-auto px-6 py-10 text-center">
          <p>Job not found</p>
          <button 
            onClick={() => navigate('/user/search')}
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md"
          >
            Go back to search
          </button>
        </div>
      </div>
    );
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
          {company?.logo ? (
            <img src={company.logo} alt={company.name} className="w-16 h-16 object-contain" />
          ) : (
            <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded">
              <span className="text-gray-500">{company?.name?.charAt(0) || 'C'}</span>
            </div>
          )}
          <h2 className="text-2xl font-semibold">{company?.name || 'Unknown Company'}</h2>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {job.location && (
            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
              {job.location}
            </span>
          )}
          {job.job_type && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {job.job_type}
            </span>
          )}
          {job.work_mode && (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {job.work_mode}
            </span>
          )}
        </div>

        {(job.salary_min || job.salary_max) && (
          <p className="text-gray-600 mb-6 text-left">
            {job.salary_min && job.salary_max ? 
              `Salary: Rp ${job.salary_min.toLocaleString()} - Rp ${job.salary_max.toLocaleString()}` : 
              job.salary_min ? 
                `Salary: From Rp ${job.salary_min.toLocaleString()}` : 
                `Salary: Up to Rp ${job.salary_max.toLocaleString()}`
            }
          </p>
        )}

        <section className="mb-6 text-left">
          <h3 className="text-xl font-semibold mb-2">Deskripsi Pekerjaan</h3>
          <div className="whitespace-pre-line">
            {job.description}
          </div>
        </section>

        {company && (
          <section className="mb-10 text-left">
            <h3 className="text-xl font-semibold mb-2">Tentang Perusahaan</h3>
            <p>{company.description || 'No company description available'}</p>
            {company.website && (
              <a 
                href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                className="text-blue-600 hover:underline mt-2 inline-block"
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit Company Website
              </a>
            )}
          </section>
        )}

        <div className="flex space-x-3">
          <button 
            onClick={handleToggleFavorite}
            className={`px-6 py-3 rounded-full border flex items-center ${
              isFavorite 
                ? 'border-red-500 text-red-500 hover:bg-red-50' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 mr-2 ${isFavorite ? 'fill-red-500' : 'fill-none stroke-current'}`} 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
              />
            </svg>
            {isFavorite ? 'Saved' : 'Save Job'}
          </button>
          
          <button 
            onClick={() => {
              if (!auth.isAuthenticated()) {
                navigate('/login/user');
                return;
              }
              setIsApplying(true);
            }} 
            className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800"
          >
            Lamar Sekarang
          </button>
        </div>
        
        {/* Application Modal */}
        {isApplying && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <ApplyJobForm 
                jobId={id} 
                onSuccess={() => {
                  setIsApplying(false);
                }} 
                onCancel={() => setIsApplying(false)} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserJobDetails;
