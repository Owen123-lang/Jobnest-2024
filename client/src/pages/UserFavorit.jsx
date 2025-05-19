import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { userAPI, auth } from '../utils/api';

const UserFavorit = () => {
  const navigate = useNavigate();
  const [favoriteJobs, setFavoriteJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is authenticated
    if (!auth.isAuthenticated()) {
      navigate('/login/user');
      return;
    }
    
    fetchFavorites();
  }, [navigate]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userAPI.getFavorites();
      // response.data has { count, favorites }
      setFavoriteJobs(response.data.favorites);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError('Failed to load favorite jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId) => {
    try {
      await userAPI.removeFromFavorites(favoriteId);
      // Update the UI by filtering out the removed favorite
      setFavoriteJobs(favoriteJobs.filter(fav => fav.id !== favoriteId));
    } catch (err) {
      console.error('Error removing favorite:', err);
      alert('Failed to remove job from favorites. Please try again.');
    }
  };

  const formatSalary = (min, max) => {
    const formatNumber = num => {
      if (!num) return '';
      return new Intl.NumberFormat('id-ID').format(num);
    };
    
    if (min && max) {
      return `Rp ${formatNumber(min)} - ${formatNumber(max)}`;
    } else if (min) {
      return `Rp ${formatNumber(min)}+`;
    } else if (max) {
      return `Up to Rp ${formatNumber(max)}`;
    }
    return 'Salary not specified';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-8">Lowongan Favorit Saya</h1>
          <div className="flex justify-center items-center h-64">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-700">Loading favorites...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Lowongan Favorit Saya</h1>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="text-red-700">
              <p>{error}</p>
              <button 
                onClick={fetchFavorites}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
        
        {!loading && favoriteJobs.length === 0 && (
          <div className="text-center py-10 bg-white rounded-lg shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p className="text-xl text-gray-700">You haven't saved any jobs yet</p>
            <p className="text-gray-500 mb-6">Start exploring jobs and save your favorites</p>
            <Link
              to="/user/search"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Explore Jobs Now
            </Link>
          </div>
        )}
        
        {!loading && favoriteJobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {favoriteJobs.map((favorite) => (
              <div 
                key={favorite.id} 
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between">
                    <h2 className="text-xl font-bold mb-1 text-left">{favorite.job_title}</h2>
                    <button
                      onClick={(e) => { e.preventDefault(); handleRemoveFavorite(favorite.id); }}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 011.414 1.414L11.414 10l4.293 4.293a1 1 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 01-1.414-1.414L8.586 10 4.293 5.707a1 1 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-gray-600 mb-3 text-left">{favorite.company_name}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {favorite.location && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                        {favorite.location}
                      </span>
                    )}
                    {favorite.job_type && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {favorite.job_type}
                      </span>
                    )}
                    {favorite.work_mode && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                        {favorite.work_mode}
                      </span>
                    )}
                  </div>
                  
                  {(favorite.salary_min || favorite.salary_max) && (
                    <p className="text-gray-600 mb-4 text-left">
                      {formatSalary(favorite.salary_min, favorite.salary_max)}
                    </p>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <p className="text-gray-500 text-sm">
                      Saved: {formatDate(favorite.saved_at)}
                    </p>
                    <Link
                      to={`/user/job-details/${favorite.job_id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserFavorit;
