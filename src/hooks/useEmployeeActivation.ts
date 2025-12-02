import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { toast } from 'sonner';
import { employeeKeys } from './useEmployees';

export interface ActivationData {
  employeeId: string;
  sendWelcomeEmail: boolean;
  temporaryPassword: string;
  userRole: string;
  department?: string;
}

export function useEmployeeActivation() {
  const queryClient = useQueryClient();

  const activationMutation = useMutation({
    mutationFn: async (data: ActivationData) => {
      const response = await apiClient.post(`/resources/employees/${data.employeeId}/activate`, {
        temporary_password: data.temporaryPassword,
        user_role: data.userRole,
        department: data.department,
        send_welcome_email: data.sendWelcomeEmail,
      });
      return response.data;
    },
    onSuccess: async (data) => {
      console.log('✅ Employee activated:', data);

      // Invalidate all employee-related queries to trigger refetch
      await queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      await queryClient.invalidateQueries({ queryKey: employeeKeys.dashboard() });
      
      // Refetch the employee lists immediately
      await queryClient.refetchQueries({ queryKey: employeeKeys.list() });

      // Display Employee ID (username) prominently in the success message
      const username = data.username || 'N/A';
      const password = data.message?.match(/Password = (.+?)(?:\s|$)/)?.[1] || 'Check email';
      
      toast.success(`✅ Employee Activated: ${data.email}`, {
        description: `Employee ID: ${username} | Password: ${password}${data.email_sent ? ' | Welcome email sent' : ''}`,
        duration: 10000, // Show for 10 seconds so user can copy credentials
      });
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.detail || 'Failed to activate employee';
      
      console.error('❌ Activation error:', err);
      
      toast.error('Activation Failed', {
        description: errorMessage,
      });
    },
  });

  return {
    activateEmployee: activationMutation.mutateAsync,
    isActivating: activationMutation.isPending,
    error: activationMutation.error?.message || null,
  };
}

