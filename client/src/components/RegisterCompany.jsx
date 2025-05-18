import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth, companyAPI, uploadAPI } from '../utils/api';

function RegisterCompany() {
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    industry: '',
    email: '',
    password: '',
    description: '',
    size: '', // Changed from company_size to size
    location: '',
    founded: '',
    vision: '',
    mission: '',
    logo: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      logo: e.target.files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      console.log("Starting company registration process...");
      
      // Step 1: Register user with company role and get token
      const userResponse = await auth.register({
        email: formData.email,
        password: formData.password,
        role: 'company' // Specify company role
      });
      
      // Get user ID and token from response
      const userId = userResponse.data.user.id;
      const token = userResponse.data.token;
      
      console.log(`User registration successful. User ID: ${userId}`);
      
      if (token) {
        // Save auth data in local storage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userResponse.data.user));
      }
      
      // Step 2: Create company profile with FormData to handle file upload
      try {
        console.log("Creating company profile...");
        
        // Buat FormData baru untuk pengiriman file dan data
        const companyData = new FormData();
        
        // Tambahkan semua field ke FormData dengan memetakan nama yang benar
        companyData.append('user_id', userId);
        companyData.append('name', formData.companyName || ''); // Map companyName ke name
        companyData.append('website', formData.website || '');
        companyData.append('industry', formData.industry || '');
        companyData.append('description', formData.description || 'No description provided');
        companyData.append('size', formData.size || 'Unknown');
        companyData.append('location', formData.location || 'Not specified');
        companyData.append('founded', formData.founded ? parseInt(formData.founded) : '');
        companyData.append('vision', formData.vision || 'No vision provided');
        companyData.append('mission', formData.mission || 'No mission provided');
        
        // Tambahkan file logo jika tersedia
        if (formData.logo) {
          companyData.append('logo', formData.logo);
        }

        console.log("Company data being sent:", Object.fromEntries(companyData.entries()));

        // Gunakan axios langsung dengan header yang benar
        const response = await axios.post(`${import.meta.REACT_APP_API_URL || 'http://localhost:5000'}/api/companies`, 
          companyData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        console.log("Company profile created successfully:", response.data);
        
        setSuccess(true);
        
        // Set a small timeout to let user see success message
        setTimeout(() => {
          // After successful registration, force refresh company profile data in local storage
          if (response.data && response.data.company) {
            const user = auth.getCurrentUser();
            if (user) {
              user.company_id = response.data.company.id;
              localStorage.setItem('user', JSON.stringify(user));
            }
          }
          
          navigate('/company/dashboard');
        }, 1500);
      } catch (companyError) {
        console.error("Failed to create company profile:", companyError);
        
        // More detailed error analysis
        let errorMessage = "Failed to create company profile. ";
        
        if (companyError.response) {
          console.error("Response data:", companyError.response.data);
          
          if (companyError.response.data.message) {
            errorMessage += companyError.response.data.message;
          } else if (companyError.response.data.error) {
            errorMessage += companyError.response.data.error;
          }
        } else if (companyError.message) {
          errorMessage += companyError.message;
        }
        
        setError(errorMessage);
        
        // User is still registered, so redirect to profile page to complete setup
        setTimeout(() => {
          navigate('/company/profil');
        }, 3000);
      }
    } catch (err) {
      console.error("Registration failed:", err);
      
      let errorMessage = 'Registration failed. ';
      
      if (err.response?.data?.message) {
        errorMessage += err.response.data.message;
      } else if (err.message) {
        errorMessage += err.message;
      } else {
        errorMessage += 'Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Register as Company</h2>
          <p className="mt-2 text-lg text-blue-600">
            Create an account to find the perfect talent
          </p>
        </div>
        
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            Registration successful! Redirecting...
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}  encType="multipart/form-data" >
          <div className="space-y-5">
            <div className="mb-4">
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-3">
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  className="appearance-none block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 focus:outline-none sm:text-sm"
                  placeholder="Enter your company name"
                  value={formData.companyName}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-3">
                <input
                  id="website"
                  name="website"
                  type="url"
                  className="appearance-none block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 focus:outline-none sm:text-sm"
                  placeholder="https://yourcompany.com"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-3">
                <select
                  id="industry"
                  name="industry"
                  required
                  className="appearance-none block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 focus:outline-none sm:text-sm"
                  value={formData.industry}
                  onChange={handleChange}
                >
                  <option value="">Select industry</option>
                  <option value="technology">Technology</option>
                  <option value="finance">Finance</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="education">Education</option>
                  <option value="retail">Retail</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            {/* Company Size Field */}
            <div className="mb-4">
              <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-2">
                Company Size
              </label>
              <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-3">
                <select
                  id="size"
                  name="size"
                  className="appearance-none block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 focus:outline-none sm:text-sm"
                  value={formData.size}
                  onChange={handleChange}
                >
                  <option value="">Select company size</option>
                  <option value="1-10">1–10 employees</option>
                  <option value="11-50">11–50 employees</option>
                  <option value="51-200">51–200 employees</option>
                  <option value="201-500">201–500 employees</option>
                  <option value="501-1000">501–1000 employees</option>
                  <option value="1001+">1001+ employees</option>
                </select>
              </div>
            </div>
            
            {/* Location Field */}
            <div className="mb-4">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-3">
                <input
                  id="location"
                  name="location"
                  type="text"
                  className="appearance-none block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 focus:outline-none sm:text-sm"
                  placeholder="City, Country"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            {/* Founded Year Field */}
            <div className="mb-4">
              <label htmlFor="founded" className="block text-sm font-medium text-gray-700 mb-2">
                Founded Year
              </label>
              <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-3">
                <input
                  id="founded"
                  name="founded"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  className="appearance-none block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 focus:outline-none sm:text-sm"
                  placeholder="e.g. 2010"
                  value={formData.founded}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Company Email
              </label>
              <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-3">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 focus:outline-none sm:text-sm"
                  placeholder="Enter company email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-3">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 focus:outline-none sm:text-sm"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Company Description
              </label>
              <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-3">
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  className="appearance-none block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 focus:outline-none sm:text-sm"
                  placeholder="Brief description about your company"
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
            
            {/* Vision Field */}
            <div className="mb-4">
              <label htmlFor="vision" className="block text-sm font-medium text-gray-700 mb-2">
                Company Vision
              </label>
              <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-3">
                <textarea
                  id="vision"
                  name="vision"
                  rows="3"
                  className="appearance-none block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 focus:outline-none sm:text-sm"
                  placeholder="What is your company's vision?"
                  value={formData.vision}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
            
            {/* Mission Field */}
            <div className="mb-4">
              <label htmlFor="mission" className="block text-sm font-medium text-gray-700 mb-2">
                Company Mission
              </label>
              <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-3">
                <textarea
                  id="mission"
                  name="mission"
                  rows="3"
                  className="appearance-none block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 focus:outline-none sm:text-sm"
                  placeholder="What is your company's mission?"
                  value={formData.mission}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-2">
                Company Logo
              </label>
              <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-3">
                <input
                  id="logo"
                  name="logo"
                  type="file"
                  accept="image/*"
                  className="appearance-none block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 focus:outline-none sm:text-sm"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? 'Registering Company...' : 'Register Company'}
            </button>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login/company" className="font-medium text-blue-600 hover:text-blue-500">
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterCompany;