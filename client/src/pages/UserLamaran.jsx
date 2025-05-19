import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI, auth } from '../utils/api';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const UserLamaran = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = auth.getCurrentUser();

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      window.location.href = '/login/user';
      return;
    }
    
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      // Fetch applications using direct axios to ensure proper headers
      const response = await axios.get(`${API_BASE_URL}/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setApplications(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load your applications. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get application status class
  const getStatusClass = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'shortlisted':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-yellow-100 text-yellow-800'; // pending
    }
  };

  // Format status text
  const formatStatus = (status) => {
    if (!status) return 'Menunggu';
    
    const statusMap = {
      'pending': 'Menunggu',
      'accepted': 'Diterima',
      'rejected': 'Ditolak',
      'reviewed': 'Ditinjau',
      'shortlisted': 'Shortlisted'
    };
    
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-1/4 bg-white shadow-md p-6">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center text-4xl font-bold text-gray-600">
            {user && user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <h2 className="text-xl font-bold mt-4">{user ? user.name || user.email : 'User'}</h2>
          <p className="text-gray-600">{user ? user.email : 'user@example.com'}</p>
        </div>
        <ul className="space-y-4">
          <li className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
            <i className="fas fa-user"></i>
            <Link to="/user/profile">Profil</Link>
          </li>
          <li className="flex items-center space-x-2 text-blue-600 font-semibold">
            <i className="fas fa-file-alt"></i>
            <Link to="/user/lamaran">Lamaran Saya</Link>
          </li>
          <li className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
            <i className="fas fa-heart"></i>
            <Link to="/user/favorites">Favorit</Link>
          </li>
          <li className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
            <i className="fas fa-bell"></i>
            <Link to="/user/notifikasi">Notifikasi</Link>
          </li>
          <li className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
            <i className="fas fa-sign-out-alt"></i>
            <span onClick={() => {
              auth.logout();
              window.location.href = '/';
            }} className="cursor-pointer">Keluar</span>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-10">
        <h1 className="text-3xl font-bold mb-6">Lamaran Saya</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada lamaran</h3>
            <p className="mt-1 text-sm text-gray-500">
              Anda belum mengirimkan lamaran pekerjaan apa pun.
            </p>
            <div className="mt-6">
              <Link to="/user/search"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cari Lowongan
                <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {applications.map((app) => (
                <li key={app.id}>
                  <Link to={`/user/job-details/${app.job_id}`} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <p className="text-lg font-medium text-blue-600 truncate">
                            {app.job_title}
                          </p>
                          <p className="mt-1 flex items-center text-sm text-gray-500">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            Dilamar pada: {formatDate(app.applied_at)}
                          </p>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(app.status)}`}>
                            {formatStatus(app.status)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          {app.cv_url && (
                            <a 
                              href={app.cv_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                              </svg>
                              Lihat CV
                            </a>
                          )}
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <p>
                            Lihat Detail
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserLamaran;