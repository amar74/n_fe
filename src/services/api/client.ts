import axios from 'axios';
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { STORAGE_CONSTANTS } from '@/constants/storageConstants';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// API Base URL with /api prefix for generated clients
export const API_BASE_URL_WITH_PREFIX = `${API_BASE_URL}/api`;

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL_WITH_PREFIX,
  timeout: 10000, // 10s timeout - AI endpoints have their own timeouts
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false, // Important for CORS
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add JWT token if available (using storage constants)
    const token = localStorage.getItem(STORAGE_CONSTANTS.AUTH_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  error => {
    if (error.response?.status === 401) {
      localStorage.clear()
      
      delete apiClient.defaults.headers.common['Authorization'];
      
      // Redirect to correct login path
      window.location.href = '/auth/login';
    }

    return Promise.reject(error);
  }
);

// Specialized API client for AI requests with longer timeout
export const aiApiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL_WITH_PREFIX,
  timeout: 45000, // 45 seconds for AI processing
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
});

// Add auth interceptor to AI client
aiApiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(STORAGE_CONSTANTS.AUTH_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add response interceptor to AI client
aiApiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  error => {
    return Promise.reject(error);
  }
);

export default apiClient;
