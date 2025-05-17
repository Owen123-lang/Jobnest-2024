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
  const isEditMode = Boolean(id);
  
  // Form data
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    job_type: "",
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
      
      // If company profile is incomplete, redirect to profile page
      if (!response.data.name || !response.data.industry || !response.data.location) {
        alert("Please complete your company profile before posting a job.");
        navigate('/company/profil');
      }
    } catch (err) {
      console.error("Error fetching company profile:", err);
      setSubmitError("Failed to fetch company profile. Please try again.");
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
    
    // Reset states
    setLoading(true);
    setSubmitSuccess(false);
    setSubmitError(null);
    
    try {
      if (!companyProfile?.id) {
        throw new Error("Company profile not found");
      }
      
      // Format job data for API
      const jobData = {
        ...formData,
        company_id: companyProfile.id,
        salary_min: formData.salary_min ? Number(formData.salary_min) : null,
        salary_max: formData.salary_max ? Number(formData.salary_max) : null,
        created_by: auth.getCurrentUser().id
      };
      
      // Create or update job based on mode
      if (isEditMode) {
        await jobAPI.updateJob(id, jobData);
      } else {
        await jobAPI.createJob(jobData);
      }
      
      // Show success message and redirect after a delay
      setSubmitSuccess(true);
      setTimeout(() => {
        navigate('/company/lowongan');
      }, 2000);
      
    } catch (err) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} job:`, err);
      setSubmitError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} job posting. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    // Validate required fields before saving
    if (!formData.title) {
      alert("Job title is required, even for drafts.");
      return;
    }
    
    setLoading(true);
    setSubmitError(null);
    
    try {
      if (!companyProfile?.id) {
        throw new Error("Company profile not found");
      }
      
      // Format job data for API
      const jobData = {
        ...formData,
        company_id: companyProfile.id,
        salary_min: formData.salary_min ? Number(formData.salary_min) : null,
        salary_max: formData.salary_max ? Number(formData.salary_max) : null,
        status: 'draft',
        created_by: auth.getCurrentUser().id
      };
      
      // Create or update job based on mode
      if (isEditMode) {
        await jobAPI.updateJob(id, jobData);
      } else {
        await jobAPI.createJob(jobData);
      }
      
      // Show success message and redirect after a delay
      alert("Job draft saved successfully");
      navigate('/company/lowongan');
      
    } catch (err) {
      console.error("Error saving draft:", err);
      setSubmitError(err.response?.data?.message || "Failed to save job draft. Please try again.");
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
            {isEditMode ? 'Edit Lowongan Kerja' : 'Pasang Lowongan Kerja'}
          </h1>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-700">Loading job data...</span>
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
          {isEditMode ? 'Edit Lowongan Kerja' : 'Pasang Lowongan Kerja'}
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
                <h2 className="text-lg font-medium text-gray-900 mb-4" >Detail Lowongan</h2>
                
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-4">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 text-left">
                      Judul Pekerjaan <span className="text-red-600">*</span>
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
                        placeholder="Contoh: Senior Frontend Developer"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 text-left">
                      Departemen
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="department"
                        id="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Contoh: Engineering"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="job_type" className="block text-sm font-medium text-gray-700 text-left">
                      Jenis Pekerjaan <span className="text-red-600">*</span>
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
                        <option value="">Pilih jenis pekerjaan</option>
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                        <option value="freelance">Freelance</option>
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="work_mode" className="block text-sm font-medium text-gray-700 text-left">
                      Mode Kerja <span className="text-red-600">*</span>
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
                      Lokasi <span className="text-red-600">*</span>
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
                        placeholder="Contoh: Jakarta"
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
                      Gaji Minimum
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="salary_min"
                        id="salary_min"
                        value={formData.salary_min}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Contoh: 10000000"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="salary_max" className="block text-sm font-medium text-gray-700 text-left">
                      Gaji Maximum
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="salary_max"
                        id="salary_max"
                        value={formData.salary_max}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Contoh: 15000000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Deskripsi dan Persyaratan</h2>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 text-left">
                      Deskripsi Pekerjaan <span className="text-red-600">*</span>
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
                        placeholder="Deskripsikan posisi pekerjaan, tanggung jawab, dan kualifikasi yang dibutuhkan"
                      />
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Gunakan format daftar untuk memudahkan pembacaan. Contoh:
                      <br />
                      - Mengembangkan aplikasi web menggunakan React.js
                      <br />
                      - Berkolaborasi dengan tim backend untuk integrasi API
                    </p>
                  </div>

                  <div>
                    <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 text-left">
                      Persyaratan <span className="text-red-600">*</span>
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
                        placeholder="Tuliskan persyaratan dan kualifikasi yang dibutuhkan (pendidikan, pengalaman, keahlian, dll)"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="benefits" className="block text-sm font-medium text-gray-700 text-left">
                      Benefit
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="benefits"
                        name="benefits"
                        rows={3}
                        value={formData.benefits}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Tuliskan benefit yang ditawarkan (asuransi kesehatan, remote work, flexible hours, dll)"
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
                  {loading ? 'Processing...' : 'Simpan Draft'}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : isEditMode ? 'Update Lowongan' : 'Publikasikan Lowongan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}