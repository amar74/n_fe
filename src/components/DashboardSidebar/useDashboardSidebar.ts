import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { useToast } from '@/hooks/shared';
import { apiClient } from '@/services/api/client';

// @author guddy.tech
export function useDashboardSidebar() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = useCallback(async () => {
    try {
      // Clear local storage and API client headers
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail');
      delete apiClient.defaults.headers.common['Authorization'];
      
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      
      navigate('/auth/login', { replace: true });
    } catch (error) {
      toast({
        title: 'Logout Error',
        description: 'There was an issue logging out. Please try again.',
        variant: 'destructive',
      });
      // Still navigate to login even if logout fails
      navigate('/auth/login', { replace: true });
    }
  }, [navigate, toast]);

  return {
    handleLogout,
  };
}
