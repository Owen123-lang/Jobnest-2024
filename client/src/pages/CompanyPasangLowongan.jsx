import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { auth, companyAPI, jobAPI } from "../utils/api";

export default function CompanyPasangLowongan() {
  const { id } = useParams(); // Get job ID from URL if in edit mode
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(id ? true : false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [companyProfileError, setCompanyProfileError] = useState(false);
  const isEditMode = Boolean(id);
  
  // Form data
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    job_type: "full_time",
    work_mode: "onsite", // default value
    location: "",
    salary_min: "",
    salary_max: "",
    description: "",
    requirements: "",
    benefits: "",
    status: "active" // default value
  });

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

    // Fetch company profile to get company ID
    fetchCompanyProfile();
    
    // If in edit mode, fetch job details
    if (isEditMode) {
      fetchJobDetails();
    }
  }, [navigate, id, isEditMode]);

  const fetchCompanyProfile = async () => {
    try {
      const response = await companyAPI.getProfile();
      setCompanyProfile(response.data);
      
      // More specific validation for required company profile fields
      if (!response.data || !response.data.id) {
        setCompanyProfileError(true);
        return;
      }
      
      // Check for incomplete profile (missing essential fields)
      if (!response.data.name || !response.data.industry) {
        setCompanyProfileError(true);
      }
    } catch (err) {
      console.error("Error fetching company profile:", err);
      
      // If company profile not found, show appropriate error
      if (err.response && err.response.data && err.response.data.missingCompanyProfile) {
        setCompanyProfileError(true);
      } else {
        setSubmitError("Failed to fetch company profile. Please try again.");
      }
    }
  };
  
  const fetchJobDetails = async () => {
    try {
      setInitialLoading(true);
      const response = await jobAPI.getJobById(id);
      const jobData = response.data;
      
      // Populate form with job data
      setFormData({
        title: jobData.title || "",
        department: jobData.department || "",
        job_type: jobData.job_type || "",
        work_mode: jobData.work_mode || "onsite",
        location: jobData.location || "",
        salary_min: jobData.salary_min || "",
        salary_max: jobData.salary_max || "",
        description: jobData.description || "",
        requirements: jobData.requirements || "",
        benefits: jobData.benefits || "",
        status: jobData.status || "active"
      });
      
      setInitialLoading(false);
    } catch (err) {
      console.error("Error fetching job details:", err);
      setSubmitError("Failed to fetch job details. The job may have been deleted or you don't have permission to edit it.");
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if company profile is complete
    if (companyProfileError) {
      alert("Please complete your company profile before posting a job.");
      navigate('/company/profil');
      return;
    }
    
    // Reset states
    setLoading(true);
    setSubmitSuccess(false);
    setSubmitError(null);
    
    try {
      // Validate company profile exists (but don't include it in request)
      if (!companyProfile?.id) {
        throw new Error("Company profile not found");
      }
      
      // Validate required fields
      if (!formData.title || !formData.job_type || !formData.work_mode || !formData.location || !formData.status || !formData.description || !formData.requirements) {
        throw new Error("Please fill all required fields");
      }
      
      // Format job data for API - DO NOT include company_id or created_by
      // The backend middleware will handle company_id automatically
      const jobData = {
        company_id: companyProfile.id,
        title: formData.title,
        job_type: formData.job_type,
        work_mode: formData.work_mode,
        location: formData.location,
        description: formData.description,
        department: formData.department || null,
        salary_min: formData.salary_min ? Number(formData.salary_min) : null,
        salary_max: formData.salary_max ? Number(formData.salary_max) : null,
        status: formData.status
      };
      
      console.log("Sending job data:", jobData);
      
      // Create or update job based on mode
      let response;
      if (isEditMode) {
        response = await jobAPI.updateJob(id, jobData);
        console.log("Update job response:", response.data);
      } else {
        response = await jobAPI.createJob(jobData);
        console.log("Create job response:", response.data);
      }
      
      // Show success message and redirect after a delay
      setSubmitSuccess(true);
      setTimeout(() => {
        navigate('/company/lowongan');
      }, 2000);
      
    } catch (err) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} job:`, err);
      
      // Handle specific error cases
      if (err.message === "Company profile not found") {
        setSubmitError("Company profile not found. Please create a company profile first.");
        setTimeout(() => {
          navigate('/company/profil');
        }, 2000);
      } else if (err.response?.status === 404 && err.response?.data?.message?.includes("company")) {
        setSubmitError("Company profile not found. Please create a company profile first.");
        setTimeout(() => {
          navigate('/company/profil');
        }, 2000);
      } else {
        // General error
        setSubmitError(
          err.response?.data?.message || 
          `Failed to ${isEditMode ? 'update' : 'create'} job posting. Please try again.`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    // Check if company profile is complete
    if (companyProfileError) {
      alert("Please complete your company profile before saving a draft.");
      navigate('/company/profil');
      return;
    }
    
    // Validate required fields before saving
    if (!formData.title) {
      alert("Job title is required, even for drafts.");
      return;
    }
    
    setLoading(true);
    setSubmitError(null);
    
    try {
      // Validate company profile exists (but don't include it in request)
      if (!companyProfile?.id) {
        throw new Error("Company profile not found");
      }
      
      // Format job data for API - DO NOT include company_id or created_by
      // The backend middleware will handle company_id automatically
      const jobData = {
        company_id: companyProfile.id,
        title: formData.title,
        job_type: formData.job_type || 'full-time',
        work_mode: formData.work_mode || 'onsite',
        location: formData.location || '',
        description: formData.description || '',
        requirements: formData.requirements || null,
        benefits: formData.benefits || null,
        department: formData.department || null,
        salary_min: formData.salary_min ? Number(formData.salary_min) : null,
        salary_max: formData.salary_max ? Number(formData.salary_max) : null,
        status: 'draft' // Always draft when using this function
      };
      
      console.log("Sending draft job data:", jobData);
      
      // Create or update job based on mode
      let response;
      if (isEditMode) {
        response = await jobAPI.updateJob(id, jobData);
      } else {
        response = await jobAPI.createJob(jobData);
      }
      
      // Show success message and redirect
      alert("Job draft saved successfully");
      navigate('/company/lowongan');
      
    } catch (err) {
      console.error("Error saving draft:", err);
      
      // Handle specific error cases
      if (err.message === "Company profile not found" || 
          (err.response?.status === 404 && err.response?.data?.message?.includes("company"))) {
        setSubmitError("Company profile not found. Please create a company profile first.");
        setTimeout(() => {
          navigate('/company/profil');
        }, 2000);
      } else {
        setSubmitError(
          err.response?.data?.message || "Failed to save job draft. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="font-sans">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            {isEditMode ? 'Edit Job' : 'Post New Job'}
          </h1>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-700">Loading job data...</span>
          </div>
        </div>
      </div>
    );
  }

  // If there's a company profile error, show message and redirect option
  if (companyProfileError) {
    return (
      <div className="font-sans">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            {isEditMode ? 'Edit Job' : 'Post New Job'}
          </h1>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  You need to complete your company profile before posting jobs.
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => navigate('/company/profil')}
                    className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 py-2 px-4 rounded"
                  >
                    Complete Company Profile
                  </button>
                </div>
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
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          {isEditMode ? 'Edit Job' : 'Post New Job'}
        </h1>
        
        {submitSuccess && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  {isEditMode 
                    ? 'Job posting updated successfully! Redirecting...' 
                    : 'Job posting created successfully! Redirecting...'}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {submitError && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {submitError}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white shadow rounded-lg overflow-hidden" >
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              {/* Job Details Section */}
              <div className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4" >Job Details</h2>
                
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-4">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 text-left">
                      Job Title <span className="text-red-600">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="title"
                        id="title"
                        required
                        value={formData.title}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="e.g., Senior Frontend Developer"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 text-left">
                      Department
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="department"
                        id="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="e.g., Engineering"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="job_type" className="block text-sm font-medium text-gray-700 text-left">
                      Job Type <span className="text-red-600">*</span>
                    </label>
                    <div className="mt-1">
                      <select
                        id="job_type"
                        name="job_type"
                        required
                        value={formData.job_type}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="">Select job type</option>
                        <option value="full_time">Full-time</option>
                        <option value="part_time">Part-time</option>
                        <option value="internship">Internship</option>
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="work_mode" className="block text-sm font-medium text-gray-700 text-left">
                      Work Mode <span className="text-red-600">*</span>
                    </label>
                    <div className="mt-1">
                      <select
                        id="work_mode"
                        name="work_mode"
                        required
                        value={formData.work_mode}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="onsite">On-site</option>
                        <option value="remote">Remote</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 text-left">
                      Location <span className="text-red-600">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="location"
                        id="location"
                        required
                        value={formData.location}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="e.g., Jakarta"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 text-left">
                      Status <span className="text-red-600">*</span>
                    </label>
                    <div className="mt-1">
                      <select
                        id="status"
                        name="status"
                        required
                        value={formData.status}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="closed">Closed</option>
                        <option value="paused">Paused</option>
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="salary_min" className="block text-sm font-medium text-gray-700 text-left">
                      Minimum Salary
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="salary_min"
                        id="salary_min"
                        value={formData.salary_min}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="e.g., 10000000"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="salary_max" className="block text-sm font-medium text-gray-700 text-left">
                      Maximum Salary
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="salary_max"
                        id="salary_max"
                        value={formData.salary_max}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="e.g., 15000000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Description and Requirements</h2>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 text-left">
                      Job Description <span className="text-red-600">*</span>
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="description"
                        name="description"
                        rows={4}
                        required
                        value={formData.description}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Describe the job position, responsibilities, and required qualifications"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 text-left">
                      Requirements <span className="text-red-600">*</span>
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="requirements"
                        name="requirements"
                        rows={4}
                        required
                        value={formData.requirements}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="List requirements and qualifications (education, experience, skills, etc.)"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="benefits" className="block text-sm font-medium text-gray-700 text-left">
                      Benefits
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="benefits"
                        name="benefits"
                        rows={3}
                        value={formData.benefits}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="List benefits offered (health insurance, remote work, flexible hours, etc.)"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Save Draft'}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : isEditMode ? 'Update Job' : 'Publish Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}