import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { jobAPI } from '../utils/api';

const UserPencarianLowongan = () => {
  const [jobData, setJobData] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [search, setSearch] = useState('');

  // Fetch all jobs on component mount
  useEffect(() => {
    fetchJobs();
  }, []);

  // Update filtered jobs whenever filters change
  useEffect(() => {
    applyFilters();
  }, [jobData, location, jobType, workMode, search]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Prepare filter parameters
      const filters = {};
      if (location) filters.location = location;
      if (jobType) filters.job_type = jobType;
      if (workMode) filters.work_mode = workMode;
      
      const response = await jobAPI.getJobs(filters);
      setJobData(response.data);
      setFilteredJobs(response.data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs. Please try again later.');
    } finally {
      setLoading(false);
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

  const handleSearch = () => {
    fetchJobs();
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
            <p>{error}</p>
            <button 
              onClick={fetchJobs} 
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              Try Again
            </button>
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
