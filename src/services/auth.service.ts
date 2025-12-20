import { apiClient } from './api/client';

export interface SignupRequest {
  email: string;
  password: string;
}

export interface SignupResult {
  success: boolean;
  requiresConfirmation: boolean;
  error?: string;
}

export const authService = {
  async signup({ email, password }: SignupRequest): Promise<SignupResult> {
    try {
      const response = await apiClient.post('/auth/signup', {
        email,
        password,
      });

      return {
        success: true,
        requiresConfirmation: false,
      };
    } catch (error: any) {
      return {
        success: false,
        requiresConfirmation: false,
        error: error.response?.data?.detail || error.message || 'An unexpected error occurred during signup.',
      };
    }
  },
};