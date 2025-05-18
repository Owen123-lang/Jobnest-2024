import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, companyAPI } from '../utils/api';

function LoginCompany() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

    try {
      const response = await auth.loginCompany(formData);
      
      // Check if the user has the company role
      if (response.data.user.role !== 'company') {
        setError('This account is not registered as a company. Please use the appropriate login page.');
        setLoading(false);
        return;
      }
      
      // Store token and user info in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Check if company profile exists for this user
      try {
        const userId = response.data.user.id;
        console.log('Fetching company profile for user ID:', userId);
        const companyResponse = await companyAPI.getCompanyByUserId(userId);
        
        // Update user data with company_id for future reference
        if (companyResponse.data && companyResponse.data.id) {
          const user = response.data.user;
          user.company_id = companyResponse.data.id;
          
          // Update stored user data with company_id
          localStorage.setItem('user', JSON.stringify(user));
          console.log('Updated user data with company ID:', user);
        }
        
        // If we got here, company profile exists, redirect to dashboard
        navigate('/company/dashboard');
      } catch (profileErr) {
        console.error('Error fetching company profile:', profileErr);
        
        // Check if error is 404 (profile doesn't exist)
        if (profileErr.response && profileErr.response.status === 404) {
          console.log('Company profile not found, redirecting to profile creation page');
          // Redirect to create profile page instead
          navigate('/company/profil');
        } else {
          // For any other error, still redirect to dashboard
          navigate('/company/dashboard');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Log in as Company</h2>
        </div>
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
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
                  placeholder="Company email address"
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
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 focus:outline-none sm:text-sm"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register/company" className="font-medium text-blue-600 hover:text-blue-500">
                Register as Company
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginCompany;