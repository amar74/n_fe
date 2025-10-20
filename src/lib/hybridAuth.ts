import { createClient } from '@supabase/supabase-js';
import { apiClient } from '@/services/api/client';

// Supabase configuration for authentication only
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wiqdvebqvtoejcvpismv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpcWR2ZWJxdnRvZWpjdnBpc212Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMzMwNjMsImV4cCI6MjA3NTYwOTA2M30.RPGuBaFdmIQI55fm4xAJ60yXrqMxL0reAp8V98S-_XE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface HybridAuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

class HybridAuthClient {
  private token: string | null = null;
  private user: any = null;

  constructor() {
    // Restore token from localStorage on initialization
    this.token = localStorage.getItem('authToken');
    this.user = this.getStoredUser();
  }

  private getStoredUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  private setStoredUser(user: any) {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
    this.user = user;
  }

  private setToken(token: string | null) {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
    this.token = token;
  }

  async signInWithPassword({ email, password }: LoginRequest) {
    try {
      // Step 1: Authenticate with Supabase
      const { data: supabaseData, error: supabaseError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (supabaseError) {
        return {
          data: null,
          error: { message: supabaseError.message },
        };
      }

      // Step 2: Verify Supabase token with your backend
      const response = await apiClient.post<HybridAuthResponse>('/auth/verify_supabase_token', {}, {
        headers: {
          Authorization: `Bearer ${supabaseData.session.access_token}`,
        },
      });

      const { access_token, user } = response.data;
      
      this.setToken(access_token);
      this.setStoredUser(user);

      return {
        data: { user, session: { access_token } },
        error: null,
      };
    } catch (error: any) {
      return {
        data: null,
        error: { message: error.response?.data?.detail || 'Login failed' },
      };
    }
  }

  async signUp({ email, password }: LoginRequest) {
    try {
      // Step 1: Sign up with Supabase
      const { data: supabaseData, error: supabaseError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (supabaseError) {
        return {
          data: null,
          error: { message: supabaseError.message },
        };
      }

      // If user needs email confirmation, return that
      if (supabaseData.user && !supabaseData.session) {
        return {
          data: { user: supabaseData.user, session: null },
          error: null,
        };
      }

      // If user is immediately signed in, verify with backend
      if (supabaseData.session) {
        const response = await apiClient.post<HybridAuthResponse>('/auth/verify_supabase_token', {}, {
          headers: {
            Authorization: `Bearer ${supabaseData.session.access_token}`,
          },
        });

        const { access_token, user } = response.data;
        
        this.setToken(access_token);
        this.setStoredUser(user);

        return {
          data: { user, session: { access_token } },
          error: null,
        };
      }

      return {
        data: null,
        error: { message: 'Signup failed' },
      };
    } catch (error: any) {
      return {
        data: null,
        error: { message: error.response?.data?.detail || 'Registration failed' },
      };
    }
  }

  async signOut() {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear local data
      this.setToken(null);
      this.setStoredUser(null);
    } catch (error) {
      // Ignore errors
    }

    return { error: null };
  }

  async getSession() {
    try {
      // Get session from Supabase
      const { data: supabaseSession, error } = await supabase.auth.getSession();
      
      if (error || !supabaseSession.session) {
        this.setToken(null);
        this.setStoredUser(null);
        return {
          data: { session: null },
          error: null,
        };
      }

      // If we have a local token, return it
      if (this.token && this.user) {
        return {
          data: { 
            session: { 
              access_token: this.token,
              user: this.user 
            } 
          },
          error: null,
        };
      }

      // Otherwise, verify Supabase token with backend
      try {
        const response = await apiClient.post<HybridAuthResponse>('/auth/verify_supabase_token', {}, {
          headers: {
            Authorization: `Bearer ${supabaseSession.session.access_token}`,
          },
        });

        const { access_token, user } = response.data;
        
        this.setToken(access_token);
        this.setStoredUser(user);

        return {
          data: { 
            session: { 
              access_token,
              user 
            } 
          },
          error: null,
        };
      } catch (error) {
        // If backend verification fails, clear local data
        this.setToken(null);
        this.setStoredUser(null);
        return {
          data: { session: null },
          error: null,
        };
      }
    } catch (error) {
      return {
        data: { session: null },
        error: null,
      };
    }
  }

  async resetPasswordForEmail(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) {
        return { data: null, error: { message: error.message } };
      }
      
      return { data: {}, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: { message: error.message || 'Password reset failed' },
      };
    }
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  getCurrentUser() {
    return this.user;
  }

  getCurrentToken() {
    return this.token;
  }
}

export const hybridAuth = new HybridAuthClient();