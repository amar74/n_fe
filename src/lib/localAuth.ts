import { apiClient } from '@/services/api/client';

export interface LocalAuthResponse {
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

export interface SignupRequest {
  email: string;
  password: string;
}

class LocalAuthClient {
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
      const response = await apiClient.post<LocalAuthResponse>('/auth/login', {
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
        error: { message: error.response?.data?.detail || 'Login failed' },
      };
    }
  }

  async signUp({ email, password }: SignupRequest) {
    try {
      const response = await apiClient.post<LocalAuthResponse>('/auth/register', {
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
        error: { message: error.response?.data?.detail || 'Registration failed' },
      };
    }
  }

  async signOut() {
    try {
      if (this.token) {
        await apiClient.post('/auth/logout');
      }
    } catch (error) {
      // Ignore logout errors
    } finally {
      this.setToken(null);
      this.setStoredUser(null);
    }

    return { error: null };
  }

  async getSession() {
    if (!this.token || !this.user) {
      return {
        data: { session: null },
        error: null,
      };
    }

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

  async resetPasswordForEmail(email: string) {
    try {
      await apiClient.post('/auth/forgot-password', { email });
      return { data: {}, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: { message: error.response?.data?.detail || 'Password reset failed' },
      };
    }
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    // For local auth, we'll simulate the auth state change
    // This is a simplified implementation
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

export const localAuth = new LocalAuthClient();