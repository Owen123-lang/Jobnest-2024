import axios from 'axios';

// Create axios instance with base URL
// Use environment variable if available, otherwise use relative path for proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const API_URL = import.meta.env.VITE_API_URL || '';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include authentication token in headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth methods
export const auth = {
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get current user details
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get user role
  getUserRole: () => {
    const user = auth.getCurrentUser();
    return user ? user.role : null;
  },

  // Register user
  register: (userData) => {
    return axiosInstance.post('/users/register', userData);
  },

  // Login user
  login: (credentials) => {
    return axiosInstance.post('/users/login', credentials);
  },
  
  // Login company
  loginCompany: (credentials) => {
    return axiosInstance.post('/users/company-login', credentials);
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // You can add any other cleanup logic here
  }
};

// User related API calls
export const userAPI = {
  // Get user profile
  getProfile: () => {
    return axiosInstance.get('/profiles/me');
  },

  // Update user profile
  updateProfile: (profileData) => {
    return axiosInstance.put('/profiles', profileData);
  },

  // Create user profile
  createProfile: (profileData) => {
    return axiosInstance.post('/profiles', profileData);
  },

  // Get user applications
  getApplications: () => {
    const user = auth.getCurrentUser();
    return axiosInstance.get(`/applications/user/${user.id}`);
  },

  // Get user favorites
  getFavorites: () => {
    return axiosInstance.get('/favorites');
  },

  // Add job to favorites
  addToFavorites: (jobId) => {
    return axiosInstance.post('/favorites', { job_id: jobId });
  },

  // Remove job from favorites
  removeFromFavorites: (jobId) => {
    return axiosInstance.delete(`/favorites/${jobId}`);
  }
};

// Company related API calls
export const companyAPI = {
  // Get company profile using the authenticated user
  getProfile: () => {
    return axiosInstance.get('/companies/profile/me');
  },

  // Get company profile by ID
  getCompanyById: (companyId) => {
    return axiosInstance.get(`/companies/${companyId}`);
  },

  // Get company profile by user ID
  getCompanyByUserId: (userId) => {
    return axiosInstance.get(`/companies/user/${userId}`);
  },

  // Create company profile
  createCompany: (companyData) => {
    // Check if companyData contains a logo file
    if (companyData.logo && companyData.logo instanceof File) {
      const formData = new FormData();
      
      // Debug the company data we're sending
      console.log('Creating company with data:', companyData);
      
      // Append all non-empty company data to FormData
      Object.keys(companyData).forEach(key => {
        if (key === 'logo') {
          formData.append('logo', companyData.logo);
        } else if (companyData[key] !== null && companyData[key] !== undefined && companyData[key] !== '') {
          // Only append non-empty values to prevent database errors
          formData.append(key, companyData[key].toString()); // Ensure string conversion
        }
      });
      
      // Debug logging
      console.log('FormData entries to be sent:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]));
      }
      
      // Use direct axios to avoid axiosInstance interceptor issues with FormData
      const token = localStorage.getItem('token');
      return axios.post(`${API_URL}/companies`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': token ? `Bearer ${token}` : undefined
        },
        // Add timeout and improved error handling
        timeout: 30000,
        validateStatus: status => status < 500 // Allow 400 responses to be handled properly
      }).catch(error => {
        console.error('Error creating company (axios):', error);
        
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
          console.error('Response headers:', error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          console.error('No response received:', error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error config:', error.config);
          console.error('Error message:', error.message);
        }
        
        // Rethrow to maintain promise rejection
        throw error;
      });
    }
    
    // Filter out empty values for JSON request
    const filteredData = {};
    Object.keys(companyData).forEach(key => {
      if (companyData[key] !== null && companyData[key] !== undefined && companyData[key] !== '') {
        filteredData[key] = companyData[key];
      }
    });
    
    console.log('Creating company with JSON data:', filteredData);
    
    // If no logo file, use regular JSON request
    return axiosInstance.post('/companies', filteredData);
  },

  // Update company profile
  updateCompany: (companyId, companyData) => {
    // Check if companyData contains a logo file
    if (companyData.logo && companyData.logo instanceof File) {
      const formData = new FormData();
      
      // Append all non-empty company data to FormData
      Object.keys(companyData).forEach(key => {
        if (key === 'logo') {
          formData.append('logo', companyData.logo);
        } else if (companyData[key] !== null && companyData[key] !== undefined && companyData[key] !== '') {
          // Only append non-empty values to prevent database errors
          formData.append(key, companyData[key].toString()); // Ensure string conversion
        }
      });
      
      // Debug logging
      console.log('FormData entries for update:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]));
      }
      
      // Use direct axios to avoid axiosInstance interceptor issues with FormData
      const token = localStorage.getItem('token');
      return axios.put(`${API_URL}/companies/${companyId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': token ? `Bearer ${token}` : undefined
        },
        // Add timeout and improved error handling
        timeout: 30000,
        validateStatus: status => status < 500
      }).catch(error => {
        console.error('Error updating company (axios):', error);
        
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
        } else if (error.request) {
          console.error('No response received:', error.request);
        } else {
          console.error('Error message:', error.message);
        }
        
        throw error;
      });
    }
    
    // Filter out empty values for JSON request
    const filteredData = {};
    Object.keys(companyData).forEach(key => {
      if (companyData[key] !== null && companyData[key] !== undefined && companyData[key] !== '') {
        filteredData[key] = companyData[key];
      }
    });
    
    // If no logo file, use regular JSON request
    return axiosInstance.put(`/companies/${companyId}`, filteredData);
  },

  // Get company jobs
  getCompanyJobs: (companyId) => {
    return axiosInstance.get(`/companies/${companyId}/jobs`);
  },

  // Get company applications
  getApplicationsForJob: (jobId) => {
    return axiosInstance.get(`/applications/job/${jobId}`);
  },
  
  // Update application status
  updateApplicationStatus: (applicationId, newStatus) => {
    return axiosInstance.put(`/applications/${applicationId}/status`, { status: newStatus });
  }
};

// Job related API calls
export const jobAPI = {
  // Get all jobs with optional filters
  getJobs: (filters = {}) => {
    return axiosInstance.get('/jobs', { params: filters });
  },

  // Get job details
  getJobById: (jobId) => {
    return axiosInstance.get(`/jobs/${jobId}`);
  },

  // Create new job posting
  createJob: (jobData) => {
    return axiosInstance.post('/jobs', jobData);
  },

  // Update job posting
  updateJob: (jobId, jobData) => {
    return axiosInstance.put(`/jobs/${jobId}`, jobData);
  },

  // Delete job posting
  deleteJob: (jobId) => {
    return axiosInstance.delete(`/jobs/delete/${jobId}`);
  },

  // Apply for a job
  applyForJob: (jobId, applicationData) => {
    return axiosInstance.post('/applications', {
      job_id: jobId,
      ...applicationData
    });
  }
};

// Notification API calls
export const notificationAPI = {
  // Get user notifications with improved error handling
  getNotifications: () => {
    console.log('Fetching notifications...');
    return axiosInstance.get('/notifications')
      .catch(error => {
        // Handle 404 errors gracefully (possibly endpoint not implemented yet)
        if (error.response && error.response.status === 404) {
          console.warn('Notifications endpoint not found (404). This feature may not be implemented yet.');
          // Return empty notifications array instead of failing
          return { data: [] };
        }
        console.error('Error fetching notifications:', error);
        throw error;
      });
  },

  // Mark notification as read
  markAsRead: (notificationId) => {
    return axiosInstance.put(`/notifications/${notificationId}/read`)
      .catch(error => {
        // Handle 404 errors gracefully
        if (error.response && error.response.status === 404) {
          console.warn(`Notification ${notificationId} not found or endpoint not implemented.`);
          return { data: { success: false, message: 'Notification not found' } };
        }
        console.error('Error marking notification as read:', error);
        throw error;
      });
  }
};

// Upload file to Cloudinary via backend
export const uploadAPI = {
  uploadFile: (file, fileType) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return axios.post(`${API_URL}/upload/${fileType}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
  }
};

export default axiosInstance;