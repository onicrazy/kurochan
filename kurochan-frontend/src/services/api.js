import axios from 'axios';
import { useSnackbar } from 'notistack';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Centralized error handling
    if (error.response) {
      // Session expired or unauthorized
      if (error.response.status === 401) {
        if (error.response.data?.message?.includes('expired') || 
            error.response.data?.message?.includes('invalid token')) {
          // Clear storage and redirect to login
          localStorage.removeItem('token');
          
          // If not already on login page, redirect
          if (!window.location.pathname.includes('/login')) {
            // Store the current location to redirect back after login
            sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
            window.location.href = '/login';
          }
        }
      }
      
      // Server error
      if (error.response.status >= 500) {
        console.error('Server Error:', error.response.data);
      }
      
      // Validation error
      if (error.response.status === 422 || error.response.status === 400) {
        console.warn('Validation Error:', error.response.data);
      }
    } else if (error.request) {
      // Network error - request made but no response
      console.error('Network Error:', error.request);
    } else {
      // Other errors
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Helper functions for common operations
const apiService = {
  // Generic GET request
  async get(url, params = {}, config = {}) {
    try {
      const response = await api.get(url, { 
        params, 
        ...config 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Generic POST request
  async post(url, data = {}, config = {}) {
    try {
      const response = await api.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Generic PUT request
  async put(url, data = {}, config = {}) {
    try {
      const response = await api.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Generic DELETE request
  async delete(url, config = {}) {
    try {
      const response = await api.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Download file as blob
  async downloadFile(url, params = {}, fileName = 'download') {
    try {
      const response = await api.get(url, {
        params,
        responseType: 'blob'
      });
      
      // Create a blob URL
      const blob = new Blob([response.data]);
      const fileUrl = URL.createObjectURL(blob);
      
      // Create temp link and trigger download
      const link = document.createElement('a');
      link.href = fileUrl;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Revoke the blob URL after download
      setTimeout(() => {
        URL.revokeObjectURL(fileUrl);
      }, 100);
      
      return true;
    } catch (error) {
      throw error;
    }
  },
  
  // Upload file
  async uploadFile(url, file, onProgress, config = {}) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Add progress tracking if callback provided
      const uploadConfig = {
        ...config,
        headers: {
          'Content-Type': 'multipart/form-data',
          ...config.headers
        }
      };
      
      if (onProgress) {
        uploadConfig.onUploadProgress = (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        };
      }
      
      const response = await api.post(url, formData, uploadConfig);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export { api, apiService };
export default api;