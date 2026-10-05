import axios from 'axios';

// Get base URL from environment variables, fallback if not found
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9001/api';

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to automatically add auth token if needed
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor to handle unauthorized access (401)
axiosInstance.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response && error.response.status === 401) {
    // Clear local storage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    
    // Redirect to login page if not already there
    if (window.location.pathname !== '/admin/login') {
      window.location.href = '/admin/login';
    }
  }
  return Promise.reject(error);
});

// Common POST function
export const postData = async (url, data = {}, config = {}) => {
  try {
    const response = await axiosInstance.post(url, data, config);
    return response.data;
  } catch (error) {
    // Return standard error format
    if (error.response && error.response.data) {
      return error.response.data; // Handles the backend returning { success: false, message: '...' }
    }
    throw error;
  }
};

// Common GET function
export const getData = async (url, config = {}) => {
  try {
    const response = await axiosInstance.get(url, config);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    throw error;
  }
};

// Common PUT function
export const putData = async (url, data = {}, config = {}) => {
  try {
    const response = await axiosInstance.put(url, data, config);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    throw error;
  }
};

// Common DELETE function
export const deleteData = async (url, config = {}) => {
  try {
    const response = await axiosInstance.delete(url, config);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    throw error;
  }
};

export default axiosInstance;
