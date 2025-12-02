/**
 * Super Admin Hook
 * 
 * IMPORTANT: This hook is for Super Admin vendor users, NOT Procurement vendors (suppliers).
 * 
 * - Super Admin Vendors: Users who log into the application (this hook)
 * - Procurement Vendors: Supplier records for procurement management (use useProcurementVendors hook)
 * 
 * These are TWO COMPLETELY SEPARATE systems. Do NOT mix them.
 * 
 * See: megapolis-api/docs/VENDOR_SYSTEMS_DOCUMENTATION.md for full details.
 * 
 * Super Admin creates vendor users who will log into and use the SaaS application.
 * Super Admin sells the application to contractors/clients on a subscription basis.
 */

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
