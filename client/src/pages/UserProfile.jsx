import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { userAPI, auth, uploadAPI } from '../utils/api';
import { Link } from 'react-router-dom';

const UserProfile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    birth_date: '',
    bio: '',
    profile_picture: null
  });
  const [favoriteJobs, setFavoriteJobs] = useState([]);
  const [favLoading, setFavLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!auth.isAuthenticated()) {
      navigate('/login/user');
      return;
    }

    fetchUserProfile();
    fetchFavorites();
  }, [navigate]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await userAPI.getProfile();
      console.log('Profile response:', response.data);

      // Set user data
      setUserData(response.data.user || null);
      setProfileData(response.data.profile || null);

      // Initialize form data if profile exists
      if (response.data.profile) {
        setFormData({
          full_name: response.data.profile.full_name || '',
          phone: response.data.profile.phone || '',
          birth_date: response.data.profile.birth_date ? new Date(response.data.profile.birth_date).toISOString().split('T')[0] : '',
          bio: response.data.profile.bio || '',
          profile_picture: response.data.profile.profile_picture || null
        });
        setPreviewImage(response.data.profile.profile_picture || null);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load profile. Please try again.');
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      setFavLoading(true);
      const res = await userAPI.getFavorites();
      setFavoriteJobs(res.data.favorites);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setFavLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview URL for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfilePicture = async () => {
    if (!selectedFile) return null;
    
    try {
      setUploadingPhoto(true);
      const response = await uploadAPI.uploadFile(selectedFile, 'profile');
      setUploadingPhoto(false);
      
      // Return the URL from Cloudinary
      return response.data.secure_url;
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      setError('Failed to upload profile picture. Please try again.');
      setUploadingPhoto(false);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // If a new file was selected, upload it first
      let pictureUrl = formData.profile_picture;
      if (selectedFile) {
        pictureUrl = await uploadProfilePicture();
      }
      
      // Prepare the updated profile data
      const updatedProfileData = {
        ...formData,
        profile_picture: pictureUrl
      };
      
      let response;
      if (profileData) {
        // Update existing profile
        response = await userAPI.updateProfile(updatedProfileData);
      } else {
        // Create new profile
        response = await userAPI.createProfile(updatedProfileData);
      }

      // Refresh profile data
      await fetchUserProfile();
      setIsEditing(false);
      setSaveSuccess(true);
      
      // Reset the file selection
      setSelectedFile(null);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading && !userData) {
    return (
      <div className="min-h-screen bg-gray-50 text-black">
        <Navbar />
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-700">Loading profile...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !isEditing) {
    return (
      <div className="min-h-screen bg-gray-50 text-black">
        <Navbar />
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="text-red-700">
              <p>{error}</p>
              <button
                onClick={fetchUserProfile}
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
      <div className="flex items-center space-x-6 mb-8">
        <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center text-4xl font-bold text-gray-600 overflow-hidden">
          {profileData?.profile_picture ? (
            <img 
              src={profileData.profile_picture} 
              alt={profileData.full_name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{getInitials(profileData?.full_name || userData?.email)}</span>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{profileData?.full_name || 'Complete Your Profile'}</h1>
          <p className="text-gray-600 text-left">{userData?.email || 'Email not available'}</p>
        </div>
        <div className="ml-auto">
          <button 
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            {profileData ? 'Edit Profile' : 'Create Profile'}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4">
          <div className="text-green-700">
            Profile updated successfully!
          </div>
        </div>
      )}

      {!profileData && (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <div className="text-yellow-700">
            You haven't created your profile yet. Click "Create Profile" to get started.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
        <div>
          <h2 className="text-lg font-semibold mb-2">Full Name</h2>
          <p>{profileData?.full_name || 'Not set'}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Phone</h2>
          <p>{profileData?.phone || 'Not provided'}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Birth Date</h2>
          <p>
            {profileData?.birth_date 
              ? new Date(profileData.birth_date).toLocaleDateString() 
              : 'Not provided'}
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Bio</h2>
          <p>{profileData?.bio || 'Not provided'}</p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4 text-left">Lowongan Favorit</h2>
        {favLoading ? (
          <p>Loading favorites...</p>
        ) : favoriteJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {favoriteJobs.map(fav => (
              <div key={fav.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold mb-1">{fav.job_title}</h3>
                <p className="text-gray-600 mb-2">{fav.company_name}</p>
                <div className="flex justify-between items-center">
                  <p className="text-gray-500 text-sm">Saved: {new Date(fav.saved_at).toLocaleDateString()}</p>
                  <Link to={`/user/job-details/${fav.job_id}`} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">View</Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>You haven't saved any jobs yet.</p>
        )}
      </div>
    </>
  );

  const renderProfileForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{profileData ? 'Edit Profile' : 'Create Profile'}</h2>
        <div>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            disabled={loading || uploadingPhoto}
          >
            {loading || uploadingPhoto ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="text-red-700">
            {error}
          </div>
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profile Picture
        </label>
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            {previewImage ? (
              <img 
                src={previewImage} 
                alt="Profile Preview" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl font-bold text-gray-400">
                {getInitials(formData.full_name || userData?.email)}
              </span>
            )}
          </div>
          <div className="flex-1">
            <input
              type="file"
              id="profile_picture"
              name="profile_picture"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            <p className="mt-1 text-xs text-gray-500">
              Recommended: Square image in JPG, PNG, or WebP format
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            className="shadow-sm border border-gray-300 rounded-md w-full px-3 py-2"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="shadow-sm border border-gray-300 rounded-md w-full px-3 py-2"
            placeholder="Enter your phone number"
          />
        </div>

        <div>
          <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 mb-1">
            Birth Date
          </label>
          <input
            type="date"
            id="birth_date"
            name="birth_date"
            value={formData.birth_date}
            onChange={handleChange}
            className="shadow-sm border border-gray-300 rounded-md w-full px-3 py-2"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            className="shadow-sm border border-gray-300 rounded-md w-full px-3 py-2"
            placeholder="Tell us about yourself"
          ></textarea>
        </div>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">
        {isEditing ? renderProfileForm() : renderProfileView()}
      </div>
    </div>
  );
};

export default UserProfile;