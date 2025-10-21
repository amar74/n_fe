import { useCallback, useEffect, useRef, useState } from 'react';
import type { AuthState, CurrentUser } from '@/types/auth';
import { 
  authManager, 
  clearAuthData
} from '@services/auth';

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
          const storedToken = localStorage.getItem('authToken');
          
          if (storedToken) {
            // Verify token with backend
            try {
              const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/me`, {
                headers: {
                  'Authorization': `Bearer ${storedToken}`,
                },
              });
              
              if (response.ok) {
                const userData = await response.json();
                authManager.setAuthState(true, userData);
                setBackendUser(userData);
                setIsAuthenticated(true);
              } else {
                // Token is invalid, clear it
                handleClearAuthData();
              }
            } catch (error) {
              // Network error, clear token
              handleClearAuthData();
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
      
      // Use local authentication instead of Supabase
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.detail || 'Login failed');
        return { data: null, error: { message: errorData.detail || 'Login failed' } };
      }
      
      const result = await response.json();
      
      if (result.token && result.user) {
        // Store the token and user data
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('userRole', result.user.role);
        localStorage.setItem('userEmail', result.user.email);
        
        // Update auth state
        authManager.setAuthState(true, result.user);
        setBackendUser(result.user);
        setIsAuthenticated(true);
      }
      
      return { data: result, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign in failed';
      setError(errorMessage);
      return { data: null, error: { message: errorMessage } };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      
      // Use local authentication for signup
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.detail || 'Signup failed');
        return { data: null, error: { message: errorData.detail || 'Signup failed' } };
      }
      
      const result = await response.json();
      
      if (result.token && result.user) {
        // Store the token and user data
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('userRole', result.user.role);
        localStorage.setItem('userEmail', result.user.email);
        
        // Update auth state
        authManager.setAuthState(true, result.user);
        setBackendUser(result.user);
        setIsAuthenticated(true);
      }
      
      return { data: result, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign up failed';
      setError(errorMessage);
      return { data: null, error: { message: errorMessage } };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setError(null);
      
      // Clear local storage and auth state
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail');
      
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
      
      // Use local backend for password reset
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.detail || 'Password reset failed');
        return { data: null, error: { message: errorData.detail || 'Password reset failed' } };
      }
      
      const result = await response.json();
      return { data: result, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password reset failed';
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
