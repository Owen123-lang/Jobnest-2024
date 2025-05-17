import axios from 'axios';

// Create axios instance with base URL
const API_URL = 'http://localhost:5000/api';

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
  // Get company profile
  getProfile: () => {
    const user = auth.getCurrentUser();
    return axiosInstance.get(`/companies/${user.id}`);
  },

  // Create company profile
  createCompany: (companyData) => {
    return axiosInstance.post('/companies', companyData);
  },

  // Update company profile
  updateCompany: (companyId, companyData) => {
    return axiosInstance.put(`/companies/${companyId}`, companyData);
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
  // Get user notifications
  getNotifications: () => {
    return axiosInstance.get('/notifications');
  },

  // Mark notification as read
  markAsRead: (notificationId) => {
    return axiosInstance.put(`/notifications/${notificationId}/read`);
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