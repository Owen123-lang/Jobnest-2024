import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { auth, jobAPI, companyAPI } from "../utils/api";

export default function CompanyDaftarLowongan() {
  const navigate = useNavigate();
  const [jobPostings, setJobPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // Check if user is authenticated and has company role
    if (!auth.isAuthenticated()) {
      navigate('/login/company');
      return;
    }

    const userRole = auth.getUserRole();
    if (userRole !== 'company') {
      navigate('/login/company');
      return;
    }

    // Get company ID from the current user
    const user = auth.getCurrentUser();
    if (user && user.company_id) {
      setCompanyId(user.company_id);
    } else {
      // If no company_id in user object, fetch from company profile
      fetchCompanyProfile();
    }
  }, [navigate]);

  // Fetch jobs when companyId changes
  useEffect(() => {
    if (companyId) {
      fetchJobs();
    }
  }, [companyId, statusFilter]);

  const fetchCompanyProfile = async () => {
    try {
      const response = await companyAPI.getProfile();
      if (response.data && response.data.id) {
        setCompanyId(response.data.id);
      } else {
        throw new Error("Company profile not found");
      }
    } catch (err) {
      console.error("Error fetching company profile:", err);
      setError("Failed to fetch company profile. Please try again.");
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await companyAPI.getCompanyJobs(companyId);
      let jobs = response.data || [];
      
      // If response has a nested jobs property, extract it
      if (response.data && response.data.jobs) {
        jobs = response.data.jobs;
      }
      
      // Apply filters
      if (statusFilter !== 'all') {
        jobs = jobs.filter(job => job.status === statusFilter);
      }
      
      // For each job, get the application count
      const jobsWithApplications = await Promise.all(
        jobs.map(async (job) => {
          try {
            const applicationsRes = await companyAPI.getApplicationsForJob(job.id);
            return {
              ...job,
              applicants: applicationsRes.data.length
            };
          } catch (err) {
            console.error(`Error fetching applications for job ${job.id}:`, err);
            return {
              ...job,
              applicants: 0
            };
          }
        })
      );
      
      setJobPostings(jobsWithApplications);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to fetch job listings. Please try again.");
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (deleteConfirm !== jobId) {
      setDeleteConfirm(jobId);
      return;
    }
    
    setOperationLoading(true);
    try {
      await jobAPI.deleteJob(jobId);
      setDeleteConfirm(null);
      // Refresh job list
      fetchJobs();
    } catch (err) {
      console.error("Error deleting job:", err);
      alert("Failed to delete job. Please try again.");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleJobStatusChange = async (jobId, newStatus) => {
    setOperationLoading(true);
    try {
      await jobAPI.updateJob(jobId, { status: newStatus });
      // Refresh job list
      fetchJobs();
    } catch (err) {
      console.error("Error updating job status:", err);
      alert("Failed to update job status. Please try again.");
    } finally {
      setOperationLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const now = new Date();
    
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
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

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      case 'paused':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-500';
    }
  };

  if (loading && !jobPostings.length) {
    return (
      <div className="font-sans">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Daftar Lowongan</h1>
            <Link 
              to="/company/post-job"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Tambah Lowongan
            </Link>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-700">Loading job listings...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Daftar Lowongan</h1>
          <Link 
            to="/company/post-job"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Tambah Lowongan
          </Link>
        </div>
        
        {error && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={fetchJobs}
                  className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Filters */}
        <div className="mt-4 mb-6 flex space-x-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="closed">Closed</option>
            <option value="paused">Paused</option>
          </select>
        </div>

        {jobPostings.length === 0 ? (
          <div className="mt-6 bg-white shadow overflow-hidden rounded-lg p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No job postings found</h3>
            <p className="mt-1 text-gray-500">
              {statusFilter !== 'all' ? 
                `No ${statusFilter} job listings found. Try a different filter or create a new job posting.` : 
                'Start by creating your first job posting.'}
            </p>
            <div className="mt-6">
              <Link
                to="/company/post-job"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              >
                Pasang Lowongan
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 bg-white shadow overflow-hidden rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posisi
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lokasi
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Diposting
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pelamar
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobPostings.map((job) => (
                    <tr key={job.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <Link to={`/company/detail-lowongan/${job.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                          {job.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left">
                        {job.location} {job.work_mode && `(${job.work_mode === 'onsite' ? 'On-site' : job.work_mode === 'remote' ? 'Remote' : 'Hybrid'})`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left">
                        {formatDate(job.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left">
                        <Link to={`/company/detail-lowongan/${job.id}`} className="text-blue-600 hover:text-blue-800">
                          {job.applicants} applicants
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <div className="flex items-center">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(job.status)}`}>
                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                          </span>
                          <div className="ml-2">
                            <select 
                              value={job.status}
                              onChange={(e) => handleJobStatusChange(job.id, e.target.value)}
                              disabled={operationLoading}
                              className="text-xs border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            >
                              <option value="active">Active</option>
                              <option value="draft">Draft</option>
                              <option value="closed">Closed</option>
                              <option value="paused">Paused</option>
                            </select>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <div className="flex items-center">
                          <Link 
                            to={`/company/detail-lowongan/${job.id}`}
                            className="text-blue-600 hover:text-blue-800 mr-3"
                          >
                            View
                          </Link>
                          {deleteConfirm === job.id ? (
                            <>
                              <button 
                                onClick={() => handleDeleteJob(job.id)}
                                disabled={operationLoading}
                                className="text-red-600 hover:text-red-800 mr-2 font-medium"
                              >
                                Confirm
                              </button>
                              <button 
                                onClick={() => setDeleteConfirm(null)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={() => handleDeleteJob(job.id)}
                              disabled={operationLoading}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}