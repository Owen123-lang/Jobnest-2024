import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../utils/api';

function RegisterCompany() {
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    industry: '',
    email: '',
    password: '',
    description: '',
    size: '',
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
      // Step 1: Register user with company role and get token
      const userResponse = await auth.register({
        email: formData.email,
        password: formData.password,
        role: 'company',
        companyName: formData.companyName,
        website: formData.website,
        industry: formData.industry,
        description: formData.description,
        size: formData.size,
        founded: formData.founded,
        vision: formData.vision,
        mission: formData.mission
      });
      
      // Get user ID and token from response
      const userId = userResponse.data.user.id;
      const token = userResponse.data.token;
      
      if (token) {
        // Save auth data in local storage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userResponse.data.user));
      }
      
      setSuccess(true);
      
      // Set a small timeout to let user see success message
      setTimeout(() => {
        // Redirect to company profile page for completing profile setup
        navigate('/company/profil');
      }, 1500);
      
    } catch (err) {
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
            Registration successful! Redirecting to set up your company profile...
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
            
            <div className="mb-4">
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                Website (Optional)
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
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Company Description (Optional)
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
            
            <div className="mb-4">
              <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-2">
                Company Size (Optional)
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
                  <option value="1-10 employees">1-10 employees</option>
                  <option value="11-50 employees">11-50 employees</option>
                  <option value="51-200 employees">51-200 employees</option>
                  <option value="201-500 employees">201-500 employees</option>
                  <option value="501-1000 employees">501-1000 employees</option>
                  <option value="1001+ employees">1001+ employees</option>
                </select>
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="founded" className="block text-sm font-medium text-gray-700 mb-2">
                Founded Year (Optional)
              </label>
              <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-3">
                <input
                  id="founded"
                  name="founded"
                  type="text"
                  className="appearance-none block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 focus:outline-none sm:text-sm"
                  placeholder="e.g., 2010"
                  value={formData.founded}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="vision" className="block text-sm font-medium text-gray-700 mb-2">
                Company Vision (Optional)
              </label>
              <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-3">
                <textarea
                  id="vision"
                  name="vision"
                  rows="3"
                  className="appearance-none block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 focus:outline-none sm:text-sm"
                  placeholder="Your company's vision for the future"
                  value={formData.vision}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="mission" className="block text-sm font-medium text-gray-700 mb-2">
                Company Mission (Optional)
              </label>
              <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-3">
                <textarea
                  id="mission"
                  name="mission"
                  rows="3"
                  className="appearance-none block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 focus:outline-none sm:text-sm"
                  placeholder="Your company's mission statement"
                  value={formData.mission}
                  onChange={handleChange}
                ></textarea>
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