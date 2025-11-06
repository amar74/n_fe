import { useState } from 'react';
import { apiClient } from '@/services/api/client';
import { toast } from 'sonner';

export interface ActivationData {
  employeeId: string;
  sendWelcomeEmail: boolean;
  temporaryPassword: string;
  userRole: string;
  permissions: string[];
}

export function useEmployeeActivation() {
  const [isActivating, setIsActivating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activateEmployee = async (data: ActivationData) => {
    setIsActivating(true);
    setError(null);

    try {
      const response = await apiClient.post(`/resources/employees/${data.employeeId}/activate`, {
        temporary_password: data.temporaryPassword,
        user_role: data.userRole,
        permissions: data.permissions,
        send_welcome_email: data.sendWelcomeEmail,
      });

      console.log('✅ Employee activated:', response.data);

      toast.success(`User account created for ${response.data.email}`, {
        description: response.data.email_sent 
          ? 'Welcome email sent with login credentials' 
          : 'Account created (email not sent)',
      });

      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to activate employee';
      setError(errorMessage);
      
      console.error('❌ Activation error:', err);
      
      toast.error('Activation Failed', {
        description: errorMessage,
      });
      
      throw new Error(errorMessage);
    } finally {
      setIsActivating(false);
    }
  };

  return {
    activateEmployee,
    isActivating,
    error,
  };
}

