import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { auth, companyAPI, uploadAPI } from "../utils/api";

export default function CompanyProfil() {
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  
  // Form data for editing
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    size: "",
    location: "",
    founded: "",
    website: "",
    about: "",
    vision: "",
    mission: ""
  });
  
  // Selected file for logo upload
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [previewLogo, setPreviewLogo] = useState(null);

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

    fetchCompanyProfile();
  }, [navigate]);

  const fetchCompanyProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await companyAPI.getProfile();
      setCompany(response.data);
      
      // Initialize form data with company details
      setFormData({
        name: response.data.name || "",
        industry: response.data.industry || "",
        size: response.data.size || "",
        location: response.data.location || "",
        founded: response.data.founded || "",
        website: response.data.website || "",
        about: response.data.description || "",
        vision: response.data.vision || "",
        mission: response.data.mission || ""
      });
      
    } catch (err) {
      console.error("Error fetching company profile:", err);
      setError("Failed to load company profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedLogo(file);
      
      // Create a preview URL for the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveSuccess(false);
    setSaveError(null);
    
    try {
      let logoUrl = company?.logo || null;
      
      // Upload logo if a new one is selected
      if (selectedLogo) {
        setUploadingLogo(true);
        try {
          const uploadResponse = await uploadAPI.uploadFile(selectedLogo, 'company-logo');
          logoUrl = uploadResponse.data.secure_url;
        } catch (uploadErr) {
          console.error("Error uploading logo:", uploadErr);
          setSaveError("Failed to upload logo, but profile will still be updated.");
        } finally {
          setUploadingLogo(false);
        }
      }
      
      // Update company profile
      const updatedProfile = {
        name: formData.name,
        industry: formData.industry,
        size: formData.size,
        location: formData.location,
        founded: formData.founded,
        website: formData.website,
        description: formData.about,
        vision: formData.vision,
        mission: formData.mission,
        logo: logoUrl
      };
      
      await companyAPI.updateCompany(company.id, updatedProfile);
      
      // Refresh company data
      await fetchCompanyProfile();
      
      // Show success message and exit edit mode
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
      
    } catch (err) {
      console.error("Error updating company profile:", err);
      setSaveError("Failed to update profile. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="font-sans">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-semibold text-gray-900">Profil Perusahaan</h1>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-700">Loading profile...</span>
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
          <h1 className="text-2xl font-semibold text-gray-900">Profil Perusahaan</h1>
          <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4">
            <div className="text-red-700">
              <p>{error}</p>
              <button
                onClick={fetchCompanyProfile}
                className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 py-1 px-3 rounded"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderProfileView = () => (
    <>
      <div className="md:flex md:items-start md:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Profil Perusahaan</h1>
        <div className="mt-4 md:mt-0">
          <button 
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Edit Profil
          </button>
        </div>
      </div>
      
      {saveSuccess && (
        <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4">
          <div className="text-green-700">
            Profile updated successfully!
          </div>
        </div>
      )}
      
      <div className="bg-white shadow overflow-hidden rounded-lg">
        {/* Company Header */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {company?.logo ? (
                <img className="h-24 w-24 object-cover rounded-md" src={company.logo} alt={company.name} />
              ) : (
                <div className="h-24 w-24 rounded-md bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-xl">
                    {company?.name?.charAt(0) || 'C'}
                  </span>
                </div>
              )}
            </div>
            <div className="ml-6">
              <h2 className="text-xl font-bold text-gray-900">{company?.name || 'Your Company'}</h2>
              <p className="text-sm text-gray-600">
                {company?.industry ? `${company.industry} • ` : ''}
                {company?.location || ''}
              </p>
            </div>
          </div>
        </div>
        
        {/* Company Information */}
        <div className="px-6 py-5 border-b border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Industry</h3>
            <p className="mt-1 text-sm text-gray-900">{company?.industry || 'Not specified'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Company Size</h3>
            <p className="mt-1 text-sm text-gray-900">{company?.size || 'Not specified'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Founded</h3>
            <p className="mt-1 text-sm text-gray-900">{company?.founded || 'Not specified'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Website</h3>
            <p className="mt-1 text-sm text-gray-900">
              {company?.website ? (
                <a 
                  href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                  className="text-blue-600 hover:text-blue-800" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {company.website}
                </a>
              ) : (
                'Not specified'
              )}
            </p>
          </div>
        </div>
        
        {/* About Section */}
        <div className="px-6 py-5 border-b border-gray-200 text-left">
          <h3 className="text-lg font-medium text-gray-900 mb-3">About</h3>
          <p className="text-sm text-gray-600">{company?.description || 'No company description available.'}</p>
        </div>
        
        {/* Vision & Mission */}
        <div className="px-6 py-5 text-left">
          <div className="mb-5">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Vision</h3>
            <p className="text-sm text-gray-600">{company?.vision || 'No vision statement available.'}</p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Mission</h3>
            <p className="text-sm text-gray-600">{company?.mission || 'No mission statement available.'}</p>
          </div>
        </div>
      </div>
    </>
  );

  const renderProfileForm = () => (
    <>
      <div className="md:flex md:items-start md:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Edit Company Profile</h1>
        <div className="mt-4 md:mt-0">
          <button 
            onClick={() => setIsEditing(false)}
            className="mr-3 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="company-profile-form"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
            disabled={uploadingLogo}
          >
            {uploadingLogo ? 'Uploading...' : 'Save Changes'}
          </button>
        </div>
      </div>
      
      {saveError && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="text-red-700">
            {saveError}
          </div>
        </div>
      )}
      
      <form id="company-profile-form" onSubmit={handleSubmit} className="bg-white shadow overflow-hidden rounded-lg">
        {/* Logo Upload */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {previewLogo || company?.logo ? (
                <img
                  className="h-24 w-24 object-cover rounded-md"
                  src={previewLogo || company?.logo}
                  alt="Company Logo"
                />
              ) : (
                <div className="h-24 w-24 rounded-md bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-xl">
                    {formData?.name?.charAt(0) || 'C'}
                  </span>
                </div>
              )}
            </div>
            <div className="ml-6">
              <h3 className="text-sm font-medium text-gray-900">Company Logo</h3>
              <div className="mt-2 flex items-center">
                <input
                  id="logo"
                  name="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0 file:text-sm file:font-medium
                    file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Recommended: Square image, at least 200x200px
              </p>
            </div>
          </div>
        </div>
        
        {/* Basic Info */}
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Company Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                Industry *
              </label>
              <select
                id="industry"
                name="industry"
                required
                value={formData.industry}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Select industry</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Education">Education</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Retail">Retail</option>
                <option value="Food & Beverage">Food & Beverage</option>
                <option value="Transportation">Transportation</option>
                <option value="Hospitality">Hospitality</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="size" className="block text-sm font-medium text-gray-700">
                Company Size
              </label>
              <select
                id="size"
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Select company size</option>
                <option value="1-10 employees">1-10 employees</option>
                <option value="11-50 employees">11-50 employees</option>
                <option value="51-200 employees">51-200 employees</option>
                <option value="201-500 employees">201-500 employees</option>
                <option value="501-1000 employees">501-1000 employees</option>
                <option value="1001+ employees">1001+ employees</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location *
              </label>
              <input
                id="location"
                name="location"
                type="text"
                required
                value={formData.location}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="City, Country"
              />
            </div>
            
            <div>
              <label htmlFor="founded" className="block text-sm font-medium text-gray-700">
                Founded Year
              </label>
              <input
                id="founded"
                name="founded"
                type="text"
                value={formData.founded}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g., 2010"
              />
            </div>
            
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                Website
              </label>
              <input
                id="website"
                name="website"
                type="text"
                value={formData.website}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g., www.yourcompany.com"
              />
            </div>
          </div>
        </div>
        
        {/* About Section */}
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Company Description</h3>
          <div>
            <label htmlFor="about" className="block text-sm font-medium text-gray-700 sr-only">
              About
            </label>
            <textarea
              id="about"
              name="about"
              rows="4"
              value={formData.about}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Tell potential candidates about your company"
            ></textarea>
          </div>
        </div>
        
        {/* Vision & Mission */}
        <div className="px-6 py-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Vision & Mission</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="vision" className="block text-sm font-medium text-gray-700">
                Vision
              </label>
              <textarea
                id="vision"
                name="vision"
                rows="3"
                value={formData.vision}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Your company's vision for the future"
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="mission" className="block text-sm font-medium text-gray-700">
                Mission
              </label>
              <textarea
                id="mission"
                name="mission"
                rows="3"
                value={formData.mission}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Your company's mission statement"
              ></textarea>
            </div>
          </div>
        </div>
      </form>
    </>
  );

  return (
    <div className="font-sans">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isEditing ? renderProfileForm() : renderProfileView()}
      </div>
    </div>
  );
}