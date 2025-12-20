import { useCallback, useEffect, useRef, useState } from 'react';
// Supabase removed - using backend-only authentication
// import type { Session, User } from '@supabase/supabase-js';
// import { supabase } from '@lib/supabase';
import type { AuthState, CurrentUser } from '@/types/auth';
import { 
  authManager, 
  authenticateWithBackend, 
  clearAuthData, 
  restoreStoredToken 
} from '@services/auth';
import { API_BASE_URL_WITH_PREFIX } from '@/services/api/client';

/**
 * Custom hook for managing authentication state and operations.
 * 
 * Provides a unified interface for:
 * - Supabase authentication (sign in/up/out, password reset)
 * - Backend authentication (JWT token management)
 * - Global auth state synchronization across components
 * 
 * @returns Auth state and methods for authentication operations
 */
export function useAuth() {
  // Supabase removed - using backend-only authentication
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  
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

  // amar74.soft - quick fix, need proper solution
  const handleAuthenticateWithBackend = useCallback(
    async (supabaseToken: string): Promise<boolean> => {
      return authenticateWithBackend(supabaseToken, isMounted, setError);
    },
    []
  );

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
          // We'll re-authenticate with backend to ensure everything is fresh
          restoreStoredToken();
          
          // Supabase removed - check backend auth token instead
          const token = localStorage.getItem('authToken');
          
          if (!token) {
            handleClearAuthData();
            if (isMounted.current) {
              setInitialAuthComplete(true);
            }
            return;
          }

          if (!isMounted.current) return;

          // Verify token with backend
          try {
            const response = await fetch(`${API_BASE_URL_WITH_PREFIX}/auth/me`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            
            if (response.ok) {
              const userData = await response.json();
              setUser(userData);
              setSession({ access_token: token, user: userData });
              authManager.setAuthState(true, userData);
              setIsAuthenticated(true);
              setBackendUser(userData);
            } else {
              handleClearAuthData();
            }
          } catch (error) {
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

    // Supabase removed - no auth state change listener needed
    // Auth state is managed through localStorage and backend token

    return () => {
      isMounted.current = false;
    };
  }, []); // Empty dependency array to run only once

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      
      // Use local authentication instead of Supabase
      const response = await fetch(`${API_BASE_URL_WITH_PREFIX}/auth/login`, {
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
      // Use backend signup instead of Supabase
      const response = await fetch(`${API_BASE_URL_WITH_PREFIX}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.detail || 'Sign up failed');
        return { data: null, error: { message: errorData.detail || 'Sign up failed' } };
      }
      
      const result = await response.json();
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
      
      handleClearAuthData();
      
      // Supabase removed - just clear local data
      setSession(null);
      setUser(null);

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
      // Use backend password reset instead of Supabase
      const response = await fetch(`${API_BASE_URL_WITH_PREFIX}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }),
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
    
    supabaseUser: user,
    session,
    
    backendUser,
    
    // Auth actions
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
}
