import React from 'react';
import { useNavigate } from 'react-router-dom';

function RoleSelector({ type = 'register' }) {
  const navigate = useNavigate();
  const isLogin = type === 'login';
  
  const handleRoleSelect = (role) => {
    const basePath = isLogin ? '/login' : '/register';
    navigate(`${basePath}/${role}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">
            {isLogin ? 'Login as' : 'Register as'}
          </h2>
          <p className="mt-3 text-lg text-gray-600">Choose your role to get started</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Job Seeker Card */}
          <div 
            onClick={() => handleRoleSelect('user')}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 cursor-pointer 
                      hover:shadow-md hover:border-blue-300 transition-all transform hover:-translate-y-1"
          >
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-blue-100 flex items-center justify-center rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">I'm a Job Seeker</h3>
              <p className="text-gray-600">
                {isLogin 
                  ? 'Access your account to apply for jobs and manage your applications.'
                  : 'Create a profile to showcase your skills and find your dream job.'}
              </p>
            </div>
          </div>
          
          {/* Company/Employer Card */}
          <div 
            onClick={() => handleRoleSelect('company')}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 cursor-pointer 
                      hover:shadow-md hover:border-blue-300 transition-all transform hover:-translate-y-1"
          >
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-blue-100 flex items-center justify-center rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">I'm a Company / Employer</h3>
              <p className="text-gray-600">
                {isLogin
                  ? 'Access your company account to post jobs and find the perfect candidates.'
                  : 'Create a company profile to post job openings and connect with qualified candidates.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoleSelector;