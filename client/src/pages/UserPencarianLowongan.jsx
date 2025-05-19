import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { jobAPI } from '../utils/api';

const UserPencarianLowongan = () => {
  const [jobData, setJobData] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  // Filter states
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [search, setSearch] = useState('');

  // single fetchJobs function outside useEffect
  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {};
      if (location) filters.location = location;
      if (jobType) filters.job_type = jobType;
      if (workMode) filters.work_mode = workMode;
      if (search) filters.search = search;
      console.log("Fetching jobs with filters:", filters);
      const response = await jobAPI.getJobs(filters);
      console.log("Jobs fetched successfully:", response.data.length);
      setJobData(response.data);
      setFilteredJobs(response.data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      if (err.response) {
        console.error('Response status:', err.response.status);
        if (err.response.status === 401) {
          setError('Authentication issue with the server. Please try refreshing the page.');
        } else if (err.response.status === 403) {
          setError('You do not have permission to access jobs.');
        } else {
          setError(`Server error: ${err.response.data.message || 'Failed to load jobs'}`);
        }
      } else if (err.request) {
        setError('Network issue. Server is not responding.');
      } else {
        setError(`Error loading jobs: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // restore filters
    const saved = JSON.parse(localStorage.getItem('jobSearchFilters') || '{}');
    if (saved.location) setLocation(saved.location);
    if (saved.jobType) setJobType(saved.jobType);
    if (saved.workMode) setWorkMode(saved.workMode);
    if (saved.search) setSearch(saved.search);

    fetchJobs();

    return () => {
      // save filters on unmount
      localStorage.setItem('jobSearchFilters', JSON.stringify({ location, jobType, workMode, search }));
    };
  }, []);

  // apply local filters on data change
  useEffect(() => {
    applyFilters();
  }, [jobData, location, jobType, workMode, search]);

  const handleSearch = () => {
    fetchJobs();
  };

  const handleRetry = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      fetchJobs();
    } else {
      setError('Maximum retry attempts reached. Please refresh the page.');
    }
  };

  const applyFilters = () => {
    if (!jobData || jobData.length === 0) return;
    
    let filtered = [...jobData];
    
    // Apply search filter (title or company name)
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchLower) || 
        (job.company_name && job.company_name.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply location filter
    if (location) {
      filtered = filtered.filter(job => 
        job.location && job.location.toLowerCase() === location.toLowerCase()
      );
    }
    
    // Apply job type filter
    if (jobType) {
      filtered = filtered.filter(job => 
        job.job_type && job.job_type.toLowerCase() === jobType.toLowerCase()
      );
    }
    
    // Apply work mode filter
    if (workMode) {
      filtered = filtered.filter(job => 
        job.work_mode && job.work_mode.toLowerCase() === workMode.toLowerCase()
      );
    }
    
    setFilteredJobs(filtered);
  };

  const formatSalary = (min, max) => {
    const formatNumber = num => {
      if (!num) return '';
      return new Intl.NumberFormat('id-ID').format(num);
    };
    
    if (min && max) {
      return `Rp ${formatNumber(min)} - ${formatNumber(max)}`;
    } else if (min) {
      return `Rp ${formatNumber(min)}+`;
    } else if (max) {
      return `Up to Rp ${formatNumber(max)}`;
    }
    return 'Salary not specified';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const jobDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - jobDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">Cari Lowongan Pekerjaan</h1>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Lokasi (Semua)</option>
            <option value="Jakarta">Jakarta</option>
            <option value="Bandung">Bandung</option>
            <option value="Surabaya">Surabaya</option>
            <option value="Remote">Remote</option>
          </select>
          
          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Jenis Kerja (Semua)</option>
            <option value="Full-Time">Full-Time</option>
            <option value="Part-Time">Part-Time</option>
            <option value="Contract">Contract</option>
            <option value="Freelance">Freelance</option>
            <option value="Internship">Internship</option>
          </select>
          
          <select
            value={workMode}
            onChange={(e) => setWorkMode(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Work Mode (Semua)</option>
            <option value="On-site">On-site</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Remote">Remote</option>
          </select>
          
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari Kata Kunci"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
          />
          
          <button 
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={handleSearch}
          >
            Cari
          </button>
        </div>

        {loading && (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-700">Loading jobs...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error loading jobs</p>
            <p className="text-sm">{error}</p>
            {retryCount < maxRetries && (
              <div className="mt-2 flex space-x-4">
                <button 
                  onClick={handleRetry} 
                  className="text-sm bg-red-100 hover:bg-red-200 text-red-800 py-1 px-3 rounded"
                >
                  Try Again
                </button>
                <button 
                  onClick={() => {
                    setLocation('');
                    setJobType('');
                    setWorkMode('');
                    setSearch('');
                    fetchJobs();
                  }} 
                  className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-3 rounded"
                >
                  Reset Filters & Try Again
                </button>
              </div>
            )}
          </div>
        )}

        {!loading && !error && filteredJobs.length === 0 && (
          <div className="text-center py-10">
            <div className="text-gray-500 mb-4">No jobs found matching your criteria</div>
            <button
              onClick={() => {
                setLocation('');
                setJobType('');
                setWorkMode('');
                setSearch('');
                fetchJobs();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Reset Filters
            </button>
          </div>
        )}

        <div className="space-y-4">
          {!loading && filteredJobs.map((job) => (
            <Link
              to={`/user/job-details/${job.id}`}
              key={job.id}
              className="block p-4 bg-white shadow rounded-md hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">{job.title}</h2>
                  <p className="text-gray-600">{job.company_name || 'Company'}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded">{job.location || 'Location not specified'}</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">{job.job_type || 'Job type not specified'}</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">{job.work_mode || 'Work mode not specified'}</span>
                  </div>
                  {job.salary_min || job.salary_max ? (
                    <p className="text-gray-500 mt-2">{formatSalary(job.salary_min, job.salary_max)}</p>
                  ) : null}
                </div>
                <p className="text-blue-600 text-sm">{formatDate(job.created_at)}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default UserPencarianLowongan;
