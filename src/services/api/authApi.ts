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

  async verifySupabaseToken(supabaseToken: string): Promise<{ token: string }> {
    const { data } = await apiClient.get<{ token: string }>('/auth/verify_supabase_token', {
      headers: {
        Authorization: `Bearer ${supabaseToken}`,
      },
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
