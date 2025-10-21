import { useCallback, useEffect, useRef, useState } from 'react';
import { authApi } from '@/services/api/authApi';
import type { AuthState, CurrentUser } from '@/types/auth';
import { STORAGE_CONSTANTS } from '@/constants/storageConstants';

export function useSimpleAuth() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialAuthComplete, setInitialAuthComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  const authState: AuthState = {
    user,
    isAuthenticated,
    isLoading: !initialAuthComplete,
    error,
  };

  const handleClearAuthData = useCallback(() => {
    if (!isMounted.current) return;
    setError(null);
    localStorage.removeItem(STORAGE_CONSTANTS.AUTH_TOKEN);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    isMounted.current = true;

    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem(STORAGE_CONSTANTS.AUTH_TOKEN);
        if (token) {
          const user = await authApi.getCurrentUser();
          setUser(user);
          setIsAuthenticated(true);
        }
      } catch (err) {
        handleClearAuthData();
        setError('Authentication failed');
      } finally {
        if (isMounted.current) {
          setInitialAuthComplete(true);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted.current = false;
    };
  }, [handleClearAuthData]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      const result = await authApi.login(email, password);

      if (result.token && result.user) {
        localStorage.setItem(STORAGE_CONSTANTS.AUTH_TOKEN, result.token);
        localStorage.setItem(STORAGE_CONSTANTS.USER_ROLE, result.user.role);
        localStorage.setItem(STORAGE_CONSTANTS.USER_EMAIL, result.user.email);
        setUser(result.user);
        setIsAuthenticated(true);
        return { data: result, error: null };
      } else {
        const errorMessage = 'Login failed - invalid response';
        setError(errorMessage);
        return { data: null, error: { message: errorMessage } };
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Login failed';
      setError(errorMessage);
      return { data: null, error: { message: errorMessage } };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      return await signIn(email, password);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Signup failed';
      setError(errorMessage);
      return { data: null, error: { message: errorMessage } };
    }
  }, [signIn]);

  const signOut = useCallback(async () => {
    try {
      setError(null);
      handleClearAuthData();
      return { error: null };
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Sign out failed';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    }
  }, [handleClearAuthData]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      setError(null);
      // For now, just return success - you can implement password reset later
      return { data: { message: 'Password reset email sent' }, error: null };
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Password reset failed';
      setError(errorMessage);
      return { data: null, error: { message: errorMessage } };
    }
  }, []);

  return {
    authState,
    user: authState.user,
    isAuthenticated,
    initialAuthComplete,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
}