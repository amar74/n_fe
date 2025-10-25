import { apiClient, API_BASE_URL_WITH_PREFIX } from '@services/api/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createApiClient } from '@/types/generated/admin';
import { useToast } from './use-toast';

const adminApi = createApiClient(API_BASE_URL_WITH_PREFIX, { axiosInstance: apiClient });
export const useSuperAdmin = () => {
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const {
    data: userList,
    isLoading: isUserListLoading,
    error: userListError,
  } = useQuery({
    queryKey: ['userList'],
    queryFn: () => adminApi.userList(),
  });

  const createNewUser = async (email: string, password: string) => {
    const response = await adminApi.createNewUser({ email, password });
    toast({
      title: 'User Created',
      description: 'User created successfully',
      variant: 'default',
    });
    queryClient.invalidateQueries({ queryKey: ['userList'] });
    return response;
  };

  return {
    createNewUser,
    userList,
    isUserListLoading,
    userListError,
  };
};
