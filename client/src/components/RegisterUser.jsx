import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth } from '../utils/api';

function RegisterUser() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Make sure we have all required fields
    if (!formData.name || !formData.email || !formData.password) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    // Prepare the complete user data payload
    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: 'user'
    };

    try {
      // Use direct API call to ensure proper endpoint and payload
      const response = await auth.register(userData);
      
      console.log('Registration successful:', response.data);
      
      setSuccess(true);
      // Auto-redirect after successful registration
      setTimeout(() => {
        navigate('/login/user');
      }, 1500);
    } catch (err) {
      console.error('Registration error:', err);
      
      // Enhanced error handling to display server validation errors
      if (err.response) {
        // The server responded with a status code outside the 2xx range
        if (err.response.status === 400) {
          // Handle validation errors from backend
          setError(err.response.data.message || 'Invalid registration data. Please check your inputs.');
        } else if (err.response.status === 409) {
          // Handle conflict (likely email already exists)
          setError('This email address is already registered. Please try logging in instead.');
        } else {
          // Handle other server errors
          setError(`Server error (${err.response.status}): ${err.response.data.message || 'Unknown error occurred'}`);
        }
      } else if (err.request) {
        // The request was made but no response was received (network issues)
        setError('Network error. Please check your internet connection and try again.');
      } else {
        // Something happened in setting up the request
        setError('An error occurred while processing your registration. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Register as Job Seeker</h2>
          <p className="mt-2 text-lg text-blue-600">
            Create an account to find your dream job
          </p>
        </div>
        
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            Registration successful! Redirecting to login page...
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-3">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="appearance-none block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 focus:outline-none sm:text-sm"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-3">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 focus:outline-none sm:text-sm"
                  placeholder="Enter your email address"
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
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login/user" className="font-medium text-blue-600 hover:text-blue-500">
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterUser;