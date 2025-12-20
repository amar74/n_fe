import { useCallback, useEffect, useRef, useState } from 'react';
import { localAuth } from '@lib/localAuth';
import type { AuthState, CurrentUser } from '@/types/auth';

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
export function useLocalAuth() {
  // Auth state
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for cleanup and race condition prevention
  const isMounted = useRef(true);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data } = await localAuth.getSession();
        
        if (data?.session && data.session.user) {
          setUser(data.session.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted.current = false;
    };
  }, []);

  const authState: AuthState = {
    user,
    isAuthenticated,
    isLoading,
    error,
  };

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const result = await localAuth.signInWithPassword({ email, password });
      
      if (result.error) {
        setError(result.error.message);
        return result;
      }

      if (result.data?.user) {
        setUser(result.data.user);
        setIsAuthenticated(true);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign in failed';
      setError(errorMessage);
      return { data: null, error: { message: errorMessage } };
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const result = await localAuth.signUp({ email, password });
      
      if (result.error) {
        setError(result.error.message);
        return result;
      }

      if (result.data?.user) {
        setUser(result.data.user);
        setIsAuthenticated(true);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign up failed';
      setError(errorMessage);
      return { data: null, error: { message: errorMessage } };
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setError(null);
      
      await localAuth.signOut();
      
      setUser(null);
      setIsAuthenticated(false);
      
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign out failed';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      setError(null);
      const result = await localAuth.resetPasswordForEmail(email);
      
      if (result.error) {
        setError(result.error.message);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password reset failed';
      setError(errorMessage);
      return { data: null, error: { message: errorMessage } };
    }
  }, []);

  return {
    // Primary auth state
    authState,
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Auth actions
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
}