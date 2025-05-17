import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { auth, jobAPI, companyAPI } from "../utils/api";

export default function CompanyDetailLowongan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [jobDetails, setJobDetails] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

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
  }, [id, navigate]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch job details
      const jobResponse = await jobAPI.getJobById(id);
      setJobDetails(jobResponse.data);
      
      // Fetch applications for this job
      const applicationsResponse = await companyAPI.getApplicationsForJob(id);
      setApplications(applicationsResponse.data);
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching job details:", err);
      setError("Failed to fetch job details. Please try again.");
      setLoading(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    
    try {
      await jobAPI.deleteJob(id);
      navigate('/company/lowongan');
    } catch (err) {
      console.error("Error deleting job:", err);
      alert("Failed to delete job. Please try again.");
    }
  };

  const handleJobStatusChange = async (newStatus) => {
    setStatusUpdateLoading(true);
    try {
      await jobAPI.updateJob(id, { status: newStatus });
      setJobDetails(prev => ({...prev, status: newStatus}));
    } catch (err) {
      console.error("Error updating job status:", err);
      alert("Failed to update job status. Please try again.");
    } finally {
      setStatusUpdateLoading(false);
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

  const formatSalary = (min, max) => {
    const formatNumber = (num) => {
      return num ? `Rp ${new Intl.NumberFormat('id-ID').format(num)}` : 'Not Specified';
    };

    if (min && max) {
      return `${formatNumber(min)} - ${formatNumber(max)} per month`;
    } else if (min) {
      return `${formatNumber(min)}+ per month`;
    } else if (max) {
      return `Up to ${formatNumber(max)} per month`;
    } else {
      return 'Not Specified';
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

  const getApplicationStatusBadgeClass = (status) => {
    switch (status) {
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

  if (loading) {
    return (
      <div className="font-sans">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-700">Loading job details...</span>
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
                  onClick={fetchJobDetails}
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

  if (!jobDetails) {
    return (
      <div className="font-sans">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">Job not found or has been deleted.</p>
                <Link
                  to="/company/lowongan"
                  className="mt-2 text-sm font-medium text-yellow-700 hover:text-yellow-600"
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
        <div className="flex justify-between items-center flex-wrap">
          <div className="flex items-center mb-4 md:mb-0">
            <h1 className="text-2xl font-semibold text-gray-900 mr-4">{jobDetails.title}</h1>
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(jobDetails.status)}`}>
              {jobDetails.status.charAt(0).toUpperCase() + jobDetails.status.slice(1)}
            </span>
          </div>
          <div className="flex flex-wrap space-x-2">
            <select
              value={jobDetails.status}
              onChange={(e) => handleJobStatusChange(e.target.value)}
              disabled={statusUpdateLoading}
              className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 p-2 mr-2"
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
              <option value="paused">Paused</option>
            </select>
            <Link
              to={`/company/post-job/${id}`} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md inline-block"
            >
              Edit Lowongan
            </Link>
            {deleteConfirm ? (
              <div className="flex space-x-2 mt-2 sm:mt-0">
                <button 
                  onClick={handleDeleteJob}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={handleDeleteJob}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
              >
                Hapus Lowongan
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 bg-white shadow overflow-hidden rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="mt-1 text-sm text-gray-900">{jobDetails.department || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="mt-1 text-sm text-gray-900">
                  {jobDetails.location} 
                  {jobDetails.work_mode && ` (${
                    jobDetails.work_mode === 'onsite' 
                      ? 'On-site' 
                      : jobDetails.work_mode === 'remote'
                        ? 'Remote'
                        : 'Hybrid'
                  })`}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Employment Type</p>
                <p className="mt-1 text-sm text-gray-900">{jobDetails.job_type ? jobDetails.job_type.charAt(0).toUpperCase() + jobDetails.job_type.slice(1) : 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Salary Range</p>
                <p className="mt-1 text-sm text-gray-900">{formatSalary(jobDetails.salary_min, jobDetails.salary_max)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Posted Date</p>
                <p className="mt-1 text-sm text-gray-900">{formatDate(jobDetails.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Applicants</p>
                <p className="mt-1 text-sm text-gray-900">{applications.length}</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Job Description</h2>
            <div className="mt-2 text-sm text-gray-600 whitespace-pre-line">
              {jobDetails.description}
            </div>
          </div>

          {jobDetails.requirements && (
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Requirements</h2>
              <div className="mt-2 text-sm text-gray-600 whitespace-pre-line">
                {jobDetails.requirements}
              </div>
            </div>
          )}

          {jobDetails.benefits && (
            <div className="px-6 py-5">
              <h2 className="text-lg font-medium text-gray-900">Benefits</h2>
              <div className="mt-2 text-sm text-gray-600 whitespace-pre-line">
                {jobDetails.benefits}
              </div>
            </div>
          )}
        </div>

        {/* Applications Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900">
            Applicants ({applications.length})
          </h2>
          
          {applications.length === 0 ? (
            <div className="mt-4 bg-white shadow overflow-hidden rounded-lg p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No applicants yet</h3>
              <p className="mt-1 text-gray-500">
                Applicants will appear here once they apply for this position.
              </p>
            </div>
          ) : (
            <div className="mt-4 bg-white shadow overflow-hidden rounded-lg">
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
                                  className="h-10 w-10 rounded-full" 
                                  src={application.profile_picture}
                                  alt={`${application.full_name}`}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-gray-500 font-medium">
                                    {application.full_name?.charAt(0) || application.user_email.charAt(0).toUpperCase()}
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
                          {formatDate(application.applied_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {application.cv_url ? (
                            <a 
                              href={application.cv_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              View CV
                            </a>
                          ) : (
                            "No CV attached"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getApplicationStatusBadgeClass(application.status)}`}>
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
    </div>
  );
}