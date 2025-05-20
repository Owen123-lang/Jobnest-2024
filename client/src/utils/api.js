import axios from 'axios';
import { io } from 'socket.io-client';

// Create axios instance with base URL
// Use environment variable if available, otherwise default to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Determine socket server URL (strip '/api' from API_BASE_URL)
const SOCKET_URL = API_BASE_URL.replace(/\/api$/, '');

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 second timeout
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

// Response interceptor for global error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      return Promise.reject({
        ...error,
        message: 'Network error. Please check your internet connection.'
      });
    }
    
    // Handle authentication errors
    if (error.response.status === 401) {
      // Clear token if it's invalid/expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // You could redirect to login here if needed
    }
    
    return Promise.reject(error);
  }
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

  // Register user (specific to RegisterUser component)
  registerUser: (userData) => {
    return axiosInstance.post('/users/register', {
      ...userData,
      role: 'user'
    });
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
    return axiosInstance.get('/profile/me');
  },

  // Update user profile
  updateProfile: (profileData) => {
    return axiosInstance.put('/profile', profileData);
  },

  // Create user profile
  createProfile: (profileData) => {
    return axiosInstance.post('/profile', profileData);
  },

  // Get user applications
  getApplications: () => {
    const user = auth.getCurrentUser();
    return axiosInstance.get(`/applications/user/${user.id}`);
  },

  // Get user favorites
  getFavorites: () => {
    return axiosInstance.get('/favorite/user');
  },

  // Add job to favorites
  addToFavorites: (jobId) => {
    return axiosInstance.post('/favorite/create', { job_id: jobId });
  },

  // Remove job from favorites
  removeFromFavorites: (favoriteId) => {
    return axiosInstance.delete(`/favorite/delete/${favoriteId}`);
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

  // Get real-time dashboard summary data
  getDashboardSummary: (companyId) => {
    return axiosInstance.get(`/company-admin/dashboard-summary`);
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
      return axios.post(`${API_BASE_URL}/companies`, formData, {
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
      return axios.put(`${API_BASE_URL}/companies/${companyId}`, formData, {
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
  getApplicationsForJob: (jobId) => axiosInstance.get(`/applications/job/${jobId}/applications`),
  
  // Update application status
  updateApplicationStatus: (applicationId, newStatus) => {
    return axiosInstance.put(`/applications/${applicationId}/status`, { status: newStatus });
  }
};

// Job related API calls
export const jobAPI = {
  // Get all jobs with optional filters - now using axiosInstance to include token
  getJobs: (filters = {}) => axiosInstance.get('/jobs', { params: filters }),

  // Get job details - now using axiosInstance to include token
  getJobById: (jobId) => axiosInstance.get(`/jobs/${jobId}`),

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
  getNotifications: async () => {
    try {
      const response = await axiosInstance.get('/notification/user');
      return { data: response.data.notifications || [] };
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return { data: [] };
      }
      throw error;
    }
  },

  // Mark notification as read
  markAsRead: (notificationId) => {
    return axiosInstance.put(`/notification/read`, { notification_id: notificationId })
      .catch(error => {
        // Handle 404 errors gracefully
        if (error.response && error.response.status === 404) {
          console.warn(`Notification ${notificationId} not found or endpoint not implemented.`);
          return { data: { success: false, message: 'Notification not found' } };
        }
        console.error('Error marking notification as read:', error);
        throw error;
      });
  },

  // Mark all notifications as read
  markAllRead: () => axiosInstance.put('/notification/read-all'),

  // Delete a notification
  deleteNotification: (notificationId) => {
    return axiosInstance.delete('/notification/delete', { data: { notification_id: notificationId } });
  }
};

// Initialize Socket.io client for real-time notifications
export const socket = io(SOCKET_URL);

// Upload file to Cloudinary via backend
export const uploadAPI = {
  uploadFile: (file, fileType) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return axios.post(`${API_BASE_URL}/upload/${fileType}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
  }
};

// Company Admin related API calls
export const companyAdminAPI = {
  // Register company admin
  register: (adminData) => {
    return axiosInstance.post('/company-admin/register', adminData);
  },

  // Login company admin
  login: (credentials) => {
    return axiosInstance.post('/company-admin/login', credentials);
  },

  // Create company profile as admin
  createCompanyProfile: (profileData) => {
    if (profileData instanceof FormData) {
      // Use direct axios for FormData to handle file uploads
      const token = localStorage.getItem('token');
      return axios.post(`${API_BASE_URL}/company-admin/profile`, profileData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': token ? `Bearer ${token}` : undefined
        },
        timeout: 30000
      });
    }
    // Regular JSON request
    return axiosInstance.post('/company-admin/profile', profileData);
  },

  // Get company profile as admin
  getCompanyProfile: () => {
    return axiosInstance.get('/company-admin/profile');
  },

  // Update company profile as admin
  updateCompanyProfile: (profileData) => {
    if (profileData instanceof FormData) {
      const token = localStorage.getItem('token');
      return axios.put(`${API_BASE_URL}/company-admin/profile`, profileData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': token ? `Bearer ${token}` : undefined
        },
        timeout: 30000
      });
    }
    return axiosInstance.put('/company-admin/profile', profileData);
  },

  // Get company staff members
  getCompanyStaff: (companyId) => {
    return axiosInstance.get(`/company-admin/${companyId}/staff`);
  },

  // Add staff member
  addStaffMember: (companyId, userData) => {
    return axiosInstance.post(`/company-admin/${companyId}/staff`, userData);
  },

  // Remove staff member
  removeStaffMember: (companyId, userId) => {
    return axiosInstance.delete(`/company-admin/${companyId}/staff/${userId}`);
  }
};

export default axiosInstance;