/**
 * Super Admin Vendors Hook
 * Manages vendor CRUD operations and statistics for Super Admin
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { useToast } from '@/hooks/shared';

// Types
export interface Vendor {
  id: string;
  vendor_name: string;
  organisation: string;
  website: string | null;
  email: string;
  contact_number: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  is_active: boolean;
}

export interface VendorStats {
  total_vendors: number;
  total_approved: number;
  total_pending: number;
  total_rejected: number;
}

export interface DashboardData {
  message: string;
  vendor_stats: VendorStats;
}

export interface VendorListResponse {
  vendors: Vendor[];
  total: number;
  skip: number;
  limit: number;
}

export interface CreateVendorRequest {
  vendor_name: string;
  organisation: string;
  website?: string;
  email: string;
  contact_number: string;
  password?: string;
}

export interface UpdateVendorRequest {
  vendor_name?: string;
  organisation?: string;
  website?: string;
  contact_number?: string;
}

export interface UpdateVendorStatusRequest {
  status: 'pending' | 'approved' | 'rejected';
}

export const vendorKeys = {
  all: ['vendors'] as const,
  lists: () => [...vendorKeys.all, 'list'] as const,
  list: (skip: number, limit: number) => [...vendorKeys.lists(), { skip, limit }] as const,
  details: () => [...vendorKeys.all, 'detail'] as const,
  detail: (id: string) => [...vendorKeys.details(), id] as const,
  stats: () => [...vendorKeys.all, 'stats'] as const,
  dashboard: () => ['super-admin', 'dashboard'] as const,
};

/**
 * Hook for Super Admin vendor management operations
 */
export function useSuperAdminVendors() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Dashboard query removed - this hook is for vendor user management, not procurement suppliers
  // Super admin dashboard should be accessed separately if needed
  const dashboardQuery = useQuery({
    queryKey: vendorKeys.dashboard(),
    queryFn: async () => {
      const response = await apiClient.get<DashboardData>('/super-admin/dashboard');
      return response.data;
    },
    retry: false,
    enabled: false, // Disabled - not needed for vendor management
  });

  const statsQuery = useQuery({
    queryKey: vendorKeys.stats(),
    queryFn: async () => {
      const response = await apiClient.get<VendorStats>('/vendors/stats');
      return response.data;
    },
  });

  const useVendorsList = (skip: number = 0, limit: number = 100) => {
    return useQuery({
      queryKey: vendorKeys.list(skip, limit),
      queryFn: async () => {
        const response = await apiClient.get<VendorListResponse>(
          `/vendors?skip=${skip}&limit=${limit}`
        );
        return response.data;
      },
    });
  };

  const useVendorDetail = (vendorId: string) => {
    return useQuery({
      queryKey: vendorKeys.detail(vendorId),
      queryFn: async () => {
        const response = await apiClient.get<Vendor>(`/vendors/${vendorId}`);
        return response.data;
      },
      enabled: !!vendorId,
    });
  };

  // Create vendor
  const createVendorMutation = useMutation({
    mutationFn: async (data: CreateVendorRequest) => {
      const response = await apiClient.post<Vendor>('/vendors/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vendorKeys.stats() });
      queryClient.invalidateQueries({ queryKey: vendorKeys.dashboard() });
      toast({
        title: 'Vendor Created',
        description: 'Vendor has been created sucessfully. Invitation email sent.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'create failed',
        variant: 'destructive',
      });
    },
  });

  // Update vendor
  const updateVendorMutation = useMutation({
    mutationFn: async ({ vendorId, data }: { vendorId: string; data: UpdateVendorRequest }) => {
      const response = await apiClient.put<Vendor>(`/vendors/${vendorId}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.detail(variables.vendorId) });
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      toast({
        title: 'Vendor Updated',
        description: 'Vendor details have been updated sucessfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'update failed',
        variant: 'destructive',
      });
    },
  });

  // Update vendor status
  const updateVendorStatusMutation = useMutation({
    mutationFn: async ({ vendorId, status }: { vendorId: string; status: string }) => {
      // harsh.pawar - quick fix, need proper solution
      const response = await apiClient.patch<Vendor>(
        `/vendors/${vendorId}/status`,
        { status }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.detail(variables.vendorId) });
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vendorKeys.stats() });
      queryClient.invalidateQueries({ queryKey: vendorKeys.dashboard() });
      toast({
        title: 'Status Updated',
        description: 'Vendor status has been updated sucessfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'update failed status',
        variant: 'destructive',
      });
    },
  });

  // Delete vendor
  const deleteVendorMutation = useMutation({
    mutationFn: async (vendorId: string) => {
      await apiClient.delete(`/vendors/${vendorId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vendorKeys.stats() });
      queryClient.invalidateQueries({ queryKey: vendorKeys.dashboard() });
      toast({
        title: 'Vendor Deleted',
        description: 'Vendor has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'delete failed',
        variant: 'destructive',
      });
    },
  });

  return {
    // Dashboard data
    dashboard: dashboardQuery.data,
    isDashboardLoading: dashboardQuery.isLoading,
    dashboardError: dashboardQuery.error,

    // Statistics
    stats: statsQuery.data,
    isStatsLoading: statsQuery.isLoading,

    // Queries
    useVendorsList,
    useVendorDetail,

    createVendor: createVendorMutation.mutateAsync,
    isCreating: createVendorMutation.isPending,
    
    updateVendor: updateVendorMutation.mutateAsync,
    isUpdating: updateVendorMutation.isPending,
    
    updateVendorStatus: updateVendorStatusMutation.mutateAsync,
    isUpdatingStatus: updateVendorStatusMutation.isPending,
    
    deleteVendor: deleteVendorMutation.mutateAsync,
    isDeleting: deleteVendorMutation.isPending,
  };
}
