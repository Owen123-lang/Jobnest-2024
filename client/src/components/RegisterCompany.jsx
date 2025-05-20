import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, companyAPI } from '../utils/api';

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
  const [previewLogo, setPreviewLogo] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image/(png|jpeg|jpg)')) {
        setError('Logo must be a PNG or JPG image');
        return;
      }
      
      setFormData({
        ...formData,
        logo: file
      });
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
  
    try {
      // Step 1: Register user (JSON)
      const userResponse = await auth.register({
        email: formData.email,
        password: formData.password,
        role: 'company'
      });
  
      const token = userResponse.data.token;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userResponse.data.user));
  
      // Step 2: Create company (FormData)
      const companyFormData = new FormData();
      // Use 'name' instead of 'companyName'
      companyFormData.append('name', formData.companyName);
      [
        'website', 'industry', 'description', 'size', 'location',
        'founded', 'vision', 'mission'
      ].forEach(key => {
        if (formData[key]) companyFormData.append(key, formData[key]);
      });
      if (formData.logo) {
        companyFormData.append('logo', formData.logo);
      }
  
      await companyAPI.createCompany(companyFormData);
  
      setSuccess(true);
      setTimeout(() => navigate('/company/profil'), 1500);
  
    } catch (err) {
      let errorMessage = 'Registration failed. ';
      if (err.response?.data?.message) {
        errorMessage += err.response.data.message;
      } else {
        errorMessage += err.message || 'Please try again.';
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
            {/* Logo Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Logo
              </label>
              <div className="mt-1 flex items-center">
                {previewLogo ? (
                  <div className="relative">
                    <img
                      src={previewLogo}
                      alt="Logo preview"
                      className="h-24 w-24 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          logo: null
                        });
                        setPreviewLogo(null);
                      }}
                      className="absolute -top-2 -right-2 rounded-full bg-red-500 text-white p-1"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="h-24 w-24 rounded-md border-2 border-gray-300 border-dashed flex items-center justify-center">
                    <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFileChange}
                  className="ml-4 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">PNG or JPG up to 2MB</p>
            </div>

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