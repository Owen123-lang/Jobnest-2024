import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ArrowLeft } from 'lucide-react';
import { jobAPI, userAPI, companyAPI, auth, uploadAPI } from '../utils/api';

const UserJobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [job, setJob] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [uploadedCv, setUploadedCv] = useState(null);
  const [applyError, setApplyError] = useState(null);

  useEffect(() => {
    fetchJobDetails();
    checkIfFavorite();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get job details
      const jobResponse = await jobAPI.getJobById(id);
      setJob(jobResponse.data);
      
      // Get company details
      if (jobResponse.data.company_id) {
        const companyResponse = await companyAPI.getProfile(jobResponse.data.company_id);
        setCompany(companyResponse.data);
      }
    } catch (err) {
      console.error('Error fetching job details:', err);
      setError('Failed to load job details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorite = async () => {
    if (!auth.isAuthenticated()) return;
    
    try {
      const response = await userAPI.getFavorites();
      const userFavorites = response.data;
      const jobIsFavorite = userFavorites.some(fav => fav.job_id === parseInt(id));
      setIsFavorite(jobIsFavorite);
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

  const handleCvUpload = (e) => {
    setUploadedCv(e.target.files[0]);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    
    if (!auth.isAuthenticated()) {
      navigate('/login/user');
      return;
    }
    
    setIsApplying(true);
    setApplyError(null);
    
    try {
      // Upload CV if provided
      let cvUrl = null;
      if (uploadedCv) {
        const uploadResponse = await uploadAPI.uploadFile(uploadedCv, 'cv');
        cvUrl = uploadResponse.data.secure_url;
      }
      
      // Submit application
      await jobAPI.applyForJob(parseInt(id), {
        cv_url: cvUrl,
        status: 'pending'
      });
      
      setApplicationSuccess(true);
      setTimeout(() => {
        navigate('/user/lamaran');
      }, 2000);
    } catch (err) {
      console.error('Error applying for job:', err);
      setApplyError('There was an error submitting your application. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  // Helper function to parse job description list items
  const parseListItems = (text) => {
    if (!text) return [];
    return text.split('\n').filter(item => item.trim() !== '');
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Apply for {job.title}</h3>
              
              {applicationSuccess ? (
                <div className="text-center py-4">
                  <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <p className="text-xl font-medium mt-2">Application Submitted!</p>
                  <p className="text-gray-500 mt-1">Redirecting to your applications...</p>
                </div>
              ) : (
                <form onSubmit={handleApply}>
                  {applyError && (
                    <div className="mb-4 text-red-500">
                      {applyError}
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Upload your CV</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                            <span>Upload a file</span>
                            <input id="file-upload" name="file-upload" type="file" onChange={handleCvUpload} className="sr-only" accept=".pdf,.doc,.docx" />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PDF, DOC up to 10MB</p>
                      </div>
                    </div>
                    {uploadedCv && (
                      <p className="mt-2 text-sm text-green-600">
                        Selected file: {uploadedCv.name}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button 
                      type="button" 
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      onClick={() => setIsApplying(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                      disabled={!uploadedCv}
                    >
                      Submit Application
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserJobDetails;
