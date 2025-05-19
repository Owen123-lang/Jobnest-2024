import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { auth, companyAPI, jobAPI } from "../utils/api";

export default function CompanyJobApplicants() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [jobDetails, setJobDetails] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

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

    fetchJobDetails();
    fetchApplications();
  }, [jobId, navigate, statusFilter, sortBy]);

  const fetchJobDetails = async () => {
    try {
      const response = await jobAPI.getJobById(jobId);
      setJobDetails(response.data);
    } catch (err) {
      console.error("Error fetching job details:", err);
      setError("Failed to fetch job details. Please try again.");
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      
      // Get applications for this job
      const response = await companyAPI.getApplicationsForJob(jobId);
      
      let applicationsData = response.data.applications || [];
      
      // Apply filters
      if (statusFilter !== 'all') {
        applicationsData = applicationsData.filter(app => app.status === statusFilter);
      }
      
      // Apply sorting
      if (sortBy === 'newest') {
        applicationsData.sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at));
      } else if (sortBy === 'oldest') {
        applicationsData.sort((a, b) => new Date(a.applied_at) - new Date(b.applied_at));
      } else if (sortBy === 'name-asc') {
        applicationsData.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
      } else if (sortBy === 'name-desc') {
        applicationsData.sort((a, b) => (b.full_name || '').localeCompare(a.full_name || ''));
      }
      
      setApplications(applicationsData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError("Failed to fetch applications. Please try again.");
      setLoading(false);
    }
  };

  const handleApplicationStatusChange = async (applicationId, newStatus) => {
    try {
      await companyAPI.updateApplicationStatus(applicationId, newStatus);
      
      // Update local state
      setApplications(applications.map(app => 
        app.id === applicationId ? {...app, status: newStatus} : app
      ));
    } catch (err) {
      console.error("Error updating application status:", err);
      alert("Failed to update application status. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'shortlisted':
        return 'bg-blue-100 text-blue-800';
      case 'interview':
        return 'bg-purple-100 text-purple-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-500';
    }
  };

  if (loading && !jobDetails) {
    return (
      <div className="font-sans">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-700">Loading job applicants...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="font-sans">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={() => {
                    fetchJobDetails();
                    fetchApplications();
                  }}
                  className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
                >
                  Try Again
                </button>
                <Link
                  to="/company/lowongan"
                  className="mt-2 ml-3 text-sm font-medium text-gray-700 hover:text-gray-600"
                >
                  Back to Job Listings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-6">
          <Link to="/company/lowongan" className="text-blue-600 hover:text-blue-800 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {jobDetails?.title || 'Job'} Applicants
            </h1>
            <p className="text-sm text-gray-500">{applications.length} {applications.length === 1 ? 'applicant' : 'applicants'}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white p-4 shadow rounded-lg">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Status Filter
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interview">Interview</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applicants List */}
        {applications.length === 0 ? (
          <div className="bg-white shadow overflow-hidden rounded-lg p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              {statusFilter === 'all' 
                ? 'No applicants yet' 
                : `No applications with status "${statusFilter}" found`}
            </h3>
            <p className="mt-1 text-gray-500">
              {statusFilter === 'all' 
                ? 'Applicants will appear here once they apply for this position.' 
                : 'Try changing your filter to see more results.'}
            </p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CV
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((application) => (
                    <tr key={application.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {application.profile_picture ? (
                              <img 
                                className="h-10 w-10 rounded-full object-cover" 
                                src={application.profile_picture}
                                alt={`${application.full_name || 'Applicant'}`}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500 font-medium">
                                  {application.full_name?.charAt(0) || application.user_email?.charAt(0).toUpperCase() || 'U'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {application.full_name || 'Unnamed Applicant'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.user_email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(application.applied_at || application.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {application.cv_url ? (
                          <div className="flex flex-col space-y-2">
                            <a 
                              href={application.cv_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View CV
                            </a>
                            <a 
                              href={application.cv_url} 
                              download={`CV-${application.full_name || application.user_email?.split('@')[0]}.pdf`}
                              className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Download
                            </a>
                          </div>
                        ) : (
                          <span className="text-gray-500">No CV attached</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(application.status)}`}>
                          {application.status?.charAt(0).toUpperCase() + application.status?.slice(1) || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-3">
                          <select
                            value={application.status || 'pending'}
                            onChange={(e) => handleApplicationStatusChange(application.id, e.target.value)}
                            className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          >
                            <option value="reviewed">Reviewed</option>
                            <option value="pending">Pending</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="interview">Interview</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                          </select>
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