import apiClient from './client';
import type { CurrentUser, SignupSuccess, SignupError } from '../../types/auth';

export const authApi = {
  async onSignup(email: string): Promise<SignupSuccess> {
    try {
      const { data } = await apiClient.post<SignupSuccess>('/auth/onsignup', { email });
      return data;
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data) {
        const errorData = error.response.data as SignupError;
        throw new Error(errorData.message || 'Signup failed');
      }
      throw error;
    }
  },

  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    const { data } = await apiClient.post<{ token: string; user: any }>('/auth/login', {
      email,
      password,
    });
    return data;
  },

  async superAdminLogin(email: string, password: string): Promise<{ token: string; user: any }> {
    const { data } = await apiClient.post<{ token: string; user: any }>('/super-admin/login', {
      email,
      password,
    });
    return data;
  },

  async getCurrentUser(): Promise<CurrentUser> {
    const { data } = await apiClient.get<{ user: CurrentUser }>('/auth/me');
    return data.user;
  },

  async getMe(): Promise<CurrentUser> {
    const response = await this.getCurrentUser();
    return response;
  },
};
