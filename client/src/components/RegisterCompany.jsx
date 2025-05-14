import React from 'react';
import { Link } from 'react-router-dom';

function RegisterCompany() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Register as Company</h2>
          <p className="mt-2 text-lg text-blue-600">
            Create an account to find the perfect talent
          </p>
        </div>
        <form className="mt-8 space-y-6">
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
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Register Company
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