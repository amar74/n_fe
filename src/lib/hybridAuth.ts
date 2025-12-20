import { apiClient } from '@/services/api/client';

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
      // Direct backend authentication (Supabase removed)
      const response = await apiClient.post<HybridAuthResponse>('/auth/login', {
        email,
        password,
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
        error: { message: error.response?.data?.detail || error.response?.data?.message || 'Login failed' },
      };
    }
  }

  async signUp({ email, password }: LoginRequest) {
    try {
      // Direct backend signup (Supabase removed)
      const response = await apiClient.post<HybridAuthResponse>('/auth/signup', {
        email,
        password,
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
        error: { message: error.response?.data?.detail || error.response?.data?.message || 'Registration failed' },
      };
    }
  }

  async signOut() {
    try {
      // Clear local data only (Supabase removed)
      this.setToken(null);
      this.setStoredUser(null);
    } catch (error) {
      // Ignore errors
    }

    return { error: null };
  }

  async getSession() {
    try {
      // If we have a local token, return it
      if (this.token && this.user) {
        // Verify token is still valid by calling /auth/me
        try {
          await apiClient.get('/auth/me', {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          });
          
          return {
            data: { 
              session: { 
                access_token: this.token,
                user: this.user 
              } 
            },
            error: null,
          };
        } catch (error) {
          // Token invalid, clear local data
          this.setToken(null);
          this.setStoredUser(null);
          return {
            data: { session: null },
            error: null,
          };
        }
      }

      return {
        data: { session: null },
        error: null,
      };
    } catch (error) {
      return {
        data: { session: null },
        error: null,
      };
    }
  }

  async resetPasswordForEmail(email: string) {
    try {
      // Use backend password reset endpoint (Supabase removed)
      await apiClient.post('/auth/forgot-password', {
        email,
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      return { data: {}, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: { message: error.response?.data?.detail || error.message || 'Password reset failed' },
      };
    }
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    // No-op: Supabase removed, use useAuth hook's onAuthStateChange instead
    // This is kept for backwards compatibility
    return {
      data: {
        subscription: {
          unsubscribe: () => {},
        },
      },
    };
  }

  getCurrentUser() {
    return this.user;
  }

  getCurrentToken() {
    return this.token;
  }
}

export const hybridAuth = new HybridAuthClient();