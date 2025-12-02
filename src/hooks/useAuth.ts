import { useCallback, useEffect, useRef, useState } from 'react';
import type { AuthState, CurrentUser } from '@/types/auth';
import { 
  authManager, 
  clearAuthData
} from '@services/auth';
import { apiClient } from '@services/api/client';
import { STORAGE_CONSTANTS } from '@/constants/storageConstants';

/**
 * Custom hook for managing local authentication state and operations.
 * 
 * Provides a unified interface for:
 * - Local backend authentication (sign in/up/out, password reset)
 * - JWT token management
 * - Global auth state synchronization across components
 * 
 * @returns Auth state and methods for authentication operations
 */
export function useAuth() {
  // Backend auth state (managed by AuthManager)
  const [backendUser, setBackendUser] = useState<CurrentUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Hook state
  const [initialAuthComplete, setInitialAuthComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for cleanup and race condition prevention
  const isMounted = useRef(true);

  // Subscribe to global auth state changes from AuthManager
  useEffect(() => {
    const updateAuthState = () => {
      if (!isMounted.current) return;
      // will optimize later - amar74.soft
      const { isAuthenticated: globalAuth, backendUser: globalUser } = authManager.getAuthState();
      setIsAuthenticated(globalAuth);
      setBackendUser(globalUser);
    };

    const unsubscribe = authManager.subscribe(updateAuthState);
    
    updateAuthState();

    return () => {
      unsubscribe();
    };
  }, []);

  const authState: AuthState = {
    user: backendUser,
    isAuthenticated,
    isLoading: !initialAuthComplete,
    error,
  };

  const handleClearAuthData = useCallback(() => {
    if (!isMounted.current) return;
    setError(null);
    clearAuthData();
  }, []);


  useEffect(() => {
    isMounted.current = true;

    const initializeAuth = async () => {
      // Prevent multiple simultaneous initialization attempts using singleton
      const existingPromise = authManager.getInitializationPromise();
      if (existingPromise) {
        await existingPromise;
        setInitialAuthComplete(true);
        return;
      }

      // Skip initialization if already complete
      if (initialAuthComplete) {
        return;
      }

      const initPromise = (async () => {
        try {
          // Check for stored token instead of Supabase session
          const storedToken = localStorage.getItem(STORAGE_CONSTANTS.AUTH_TOKEN);
          
          if (storedToken) {
            // Set token in apiClient headers
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            
            // Verify token with backend
            try {
              const response = await apiClient.get<{ user: CurrentUser }>('/auth/me');
              
              // Backend returns { user: {...} } wrapper
              const userData = response.data.user || response.data as any;
              authManager.setAuthState(true, userData);
              setBackendUser(userData);
              setIsAuthenticated(true);
            } catch (error: any) {
              // Token is invalid or expired, clear it
              console.error('Auth initialization error:', error);
              handleClearAuthData();
              delete apiClient.defaults.headers.common['Authorization'];
            }
          } else {
            handleClearAuthData();
          }
        } catch (error) {
          handleClearAuthData();
        } finally {
          if (isMounted.current) {
            setInitialAuthComplete(true);
          }
          authManager.setInitializationPromise(null);
        }
      })();

      authManager.setInitializationPromise(initPromise);
      return initPromise;
    };

    initializeAuth();

    return () => {
      isMounted.current = false;
    };
  }, []); // Empty dependency array to run only once

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      
      console.log('[useAuth] Attempting login for:', email);
      
      // Use apiClient which has proper timeout and error handling
      const result = await apiClient.post<{ token: string; user: CurrentUser }>('/auth/login', {
        email,
        password,
      });
      
      const responseData = result.data;
      console.log('[useAuth] Login successful, received token:', responseData.token ? 'Yes' : 'No');
      
      if (responseData.token && responseData.user) {
        // Store the token and user data
        localStorage.setItem(STORAGE_CONSTANTS.AUTH_TOKEN, responseData.token);
        localStorage.setItem('userRole', responseData.user.role || '');
        localStorage.setItem('userEmail', responseData.user.email || '');
        
        // Set token in apiClient headers for subsequent requests
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${responseData.token}`;
        
        console.log('[useAuth] Stored auth token and user data');
        
        // Update auth state
        authManager.setAuthState(true, responseData.user);
        setBackendUser(responseData.user);
        setIsAuthenticated(true);
      } else {
        console.warn('[useAuth] Login response missing token or user:', responseData);
        const errorMessage = 'Invalid response from server';
        setError(errorMessage);
        return { data: null, error: { message: errorMessage } };
      }
      
      return { data: responseData, error: null };
    } catch (err: any) {
      let errorMessage = 'Sign in failed';
      
      if (err.response) {
        // Server responded with error
        errorMessage = err.response.data?.detail || 
                      err.response.data?.message || 
                      `Login failed: ${err.response.statusText || err.response.status}`;
        console.error('[useAuth] Login error response:', err.response.data);
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your connection and try again.';
        console.error('[useAuth] Login network error:', err.request);
      } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        // Timeout error
        errorMessage = 'Login request timed out. Please check your connection and try again.';
        console.error('[useAuth] Login timeout:', err);
      } else {
        // Other error
        errorMessage = err.message || 'An unexpected error occurred during login';
        console.error('[useAuth] Login exception:', err);
      }
      
      setError(errorMessage);
      return { data: null, error: { message: errorMessage } };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      
      // Use apiClient for signup
      const result = await apiClient.post<{ token: string; user: CurrentUser }>('/auth/signup', {
        email,
        password,
      });
      
      const responseData = result.data;
      
      if (responseData.token && responseData.user) {
        // Store the token and user data
        localStorage.setItem(STORAGE_CONSTANTS.AUTH_TOKEN, responseData.token);
        localStorage.setItem('userRole', responseData.user.role || '');
        localStorage.setItem('userEmail', responseData.user.email || '');
        
        // Set token in apiClient headers
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${responseData.token}`;
        
        // Update auth state
        authManager.setAuthState(true, responseData.user);
        setBackendUser(responseData.user);
        setIsAuthenticated(true);
      }
      
      return { data: responseData, error: null };
    } catch (err: any) {
      let errorMessage = 'Sign up failed';
      
      if (err.response) {
        errorMessage = err.response.data?.detail || 
                      err.response.data?.message || 
                      `Signup failed: ${err.response.statusText || err.response.status}`;
      } else if (err.request) {
        errorMessage = 'No response from server. Please check your connection and try again.';
      } else {
        errorMessage = err.message || 'An unexpected error occurred during signup';
      }
      
      setError(errorMessage);
      return { data: null, error: { message: errorMessage } };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setError(null);
      
      // Clear local storage and auth state
      localStorage.removeItem(STORAGE_CONSTANTS.AUTH_TOKEN);
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail');
      
      // Remove token from apiClient headers
      delete apiClient.defaults.headers.common['Authorization'];
      
      handleClearAuthData();
      authManager.setAuthState(false, null);
      setBackendUser(null);
      setIsAuthenticated(false);

      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign out failed';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    }
  }, [handleClearAuthData]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      setError(null);
      
      // Use apiClient for password reset
      const result = await apiClient.post('/auth/reset-password', { email });
      
      return { data: result.data, error: null };
    } catch (err: any) {
      let errorMessage = 'Password reset failed';
      
      if (err.response) {
        errorMessage = err.response.data?.detail || 
                      err.response.data?.message || 
                      `Password reset failed: ${err.response.statusText || err.response.status}`;
      } else if (err.request) {
        errorMessage = 'No response from server. Please check your connection and try again.';
      } else {
        errorMessage = err.message || 'An unexpected error occurred during password reset';
      }
      
      setError(errorMessage);
      return { data: null, error: { message: errorMessage } };
    }
  }, []);

  return {
    // Primary auth state
    authState,
    user: authState.user,
    isAuthenticated,
    initialAuthComplete,
    error,
    
    // Backend user data
    backendUser,
    
    // Auth actions
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
}
