import axios from 'axios';
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { STORAGE_CONSTANTS } from '@/constants/storageConstants';

// Base API configuration
const RESOLVED_BASE_FROM_ENV = import.meta.env.VITE_API_BASE_URL;
const isLocalHostRuntime =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Prefer local API when running the app on localhost to avoid accidental live calls
const LOCAL_DEFAULT_BASE = 'http://127.0.0.1:8000';

// If running locally and env points to the known live IP, override to local for safety
const looksLikeLiveIp =
  typeof RESOLVED_BASE_FROM_ENV === 'string' && /52\.55\.26\.148/.test(RESOLVED_BASE_FROM_ENV);

// Use relative URL in production if no env var is set (works with any domain)
const getApiBaseUrl = () => {
  if (isLocalHostRuntime && (!RESOLVED_BASE_FROM_ENV || looksLikeLiveIp)) {
    return LOCAL_DEFAULT_BASE;
  }
  
  if (RESOLVED_BASE_FROM_ENV) {
    return RESOLVED_BASE_FROM_ENV;
  }
  
  // In production, use relative URL (empty string means same origin)
  if (typeof window !== 'undefined') {
    return ''; // Relative URL - will use current domain
  }
  
  return LOCAL_DEFAULT_BASE;
};

export const API_BASE_URL = getApiBaseUrl();

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

// Verify baseURL is set correctly (runtime check)
if (import.meta.env.DEV) {
  console.log('[API Client] ========================================');
  console.log('[API Client] API Configuration Check:');
  console.log('[API Client] API_BASE_URL:', API_BASE_URL);
  console.log('[API Client] API_BASE_URL_WITH_PREFIX:', API_BASE_URL_WITH_PREFIX);
  console.log('[API Client] apiClient.baseURL:', apiClient.defaults.baseURL);
  console.log('[API Client] ========================================');
  
  // Validate that baseURL includes /api
  if (!apiClient.defaults.baseURL?.includes('/api')) {
    console.error('[API Client] ❌ ERROR: baseURL does not include /api prefix!');
    console.error('[API Client] Current baseURL:', apiClient.defaults.baseURL);
    console.error('[API Client] Expected baseURL:', API_BASE_URL_WITH_PREFIX);
    console.error('[API Client] ⚠️  Please restart your frontend dev server (Ctrl+C then pnpm dev)');
  } else {
    console.log('[API Client] ✅ baseURL is correctly configured with /api prefix');
  }
  
  // Add interceptor to log all requests and ensure baseURL is correct
  apiClient.interceptors.request.use((config) => {
    const originalUrl = config.url || '';

    // Skip if URL is already absolute
    if (originalUrl.startsWith('http://') || originalUrl.startsWith('https://')) {
      return config;
    }

    // Ensure baseURL is set correctly (use default if not set)
    if (!config.baseURL || !config.baseURL.includes('/api')) {
      config.baseURL = API_BASE_URL_WITH_PREFIX;
    }

    // Construct full URL for logging
    const cleanBaseURL = (config.baseURL || API_BASE_URL_WITH_PREFIX).endsWith('/') 
      ? (config.baseURL || API_BASE_URL_WITH_PREFIX).slice(0, -1) 
      : (config.baseURL || API_BASE_URL_WITH_PREFIX);
    const cleanUrl = originalUrl.startsWith('/') ? originalUrl : `/${originalUrl}`;
    const fullUrl = cleanBaseURL + cleanUrl;

    // Don't log expected 404 endpoints
    const isExpected404Endpoint = originalUrl.includes('/resources/employees/me');

    if (!isExpected404Endpoint && import.meta.env.DEV) {
      console.log('[API Client] → Request URL:', fullUrl);
    }

    return config;
  });
}

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add JWT token if available (using storage constants)
    const token = localStorage.getItem(STORAGE_CONSTANTS.AUTH_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // For FormData requests, remove Content-Type to let browser set it with boundary
    // Axios will automatically set multipart/form-data with boundary for FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      // Don't set Content-Type manually - let browser/Axios set it with boundary
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

    // Suppress console errors for expected 404s on /resources/employees/me
    // (user might not have an employee record, which is normal)
    if (error.response?.status === 404 && error.config?.url?.includes('/resources/employees/me')) {
      // Suppress console error for this expected case
      error.suppressConsoleError = true;
      // Don't log this error - it's expected behavior
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// Specialized API client for AI requests with longer timeout
// Also used for scraper requests which can take up to 30+ seconds
export const aiApiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL_WITH_PREFIX,
  timeout: 60000, // 60 seconds - increased for scraper (backend has 30s timeout + processing time)
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
