/**
 * Procurement Vendors Hook
 * 
 * IMPORTANT: This hook is for Procurement vendors (suppliers), NOT Super Admin vendor users.
 * 
 * - Super Admin Vendors: Users who log into the application (use useSuperAdmin hook)
 * - Procurement Vendors: Supplier records for procurement management (this hook)
 * 
 * These are TWO COMPLETELY SEPARATE systems. Do NOT mix them.
 * 
 * See: megapolis-api/docs/VENDOR_SYSTEMS_DOCUMENTATION.md for full details.
 * 
 * Manages supplier/vendor CRUD operations for Procurement module.
 * Note: These are suppliers (companies from which organization purchases), not vendor users.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { useToast } from './use-toast';

// Types for Procurement Vendors (Suppliers)
export interface ProcurementVendor {
  id: string;
  vendor_name: string;
  organisation: string;
  website: string | null;
  email: string;
  contact_number: string;
  address?: string | null;
  payment_terms?: string | null;
  tax_id?: string | null;
  notes?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  is_active: boolean;
}

export interface ProcurementVendorStats {
  total_vendors: number;
  total_approved: number;
  total_pending: number;
  total_rejected: number;
}

export interface ProcurementVendorListResponse {
  vendors: ProcurementVendor[];
  total: number;
  skip: number;
  limit: number;
}

export interface CreateProcurementVendorRequest {
  vendor_name: string;
  organisation: string;
  website?: string;
  email: string;
  contact_number: string;
  address?: string;
  payment_terms?: string;
  tax_id?: string;
  notes?: string;
  password?: string;
}

export interface UpdateProcurementVendorRequest {
  vendor_name?: string;
  organisation?: string;
  website?: string;
  contact_number?: string;
  address?: string;
  payment_terms?: string;
  tax_id?: string;
  notes?: string;
}

export interface UpdateProcurementVendorStatusRequest {
  status: 'pending' | 'approved' | 'rejected';
}

export const procurementVendorKeys = {
  all: ['procurement-vendors'] as const,
  lists: () => [...procurementVendorKeys.all, 'list'] as const,
  list: (skip: number, limit: number) => [...procurementVendorKeys.lists(), { skip, limit }] as const,
  details: () => [...procurementVendorKeys.all, 'detail'] as const,
  detail: (id: string) => [...procurementVendorKeys.details(), id] as const,
  stats: () => [...procurementVendorKeys.all, 'stats'] as const,
};

/**
 * Hook for Procurement vendor (supplier) management operations
 * Uses /vendors/ endpoint - these are suppliers, not vendor users
 */
export function useProcurementVendors() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const statsQuery = useQuery({
    queryKey: procurementVendorKeys.stats(),
    queryFn: async () => {
      const response = await apiClient.get<ProcurementVendorStats>('/vendors/stats');
      return response.data;
    },
  });

  const useVendorsList = (skip: number = 0, limit: number = 100) => {
    return useQuery({
      queryKey: procurementVendorKeys.list(skip, limit),
      queryFn: async () => {
        const response = await apiClient.get<ProcurementVendorListResponse>(
          `/vendors?skip=${skip}&limit=${limit}`
        );
        return response.data;
      },
    });
  };

  const useVendorDetail = (vendorId: string) => {
    return useQuery({
      queryKey: procurementVendorKeys.detail(vendorId),
      queryFn: async () => {
        const response = await apiClient.get<ProcurementVendor>(`/vendors/${vendorId}`);
        return response.data;
      },
      enabled: !!vendorId,
    });
  };

  // Create vendor (supplier)
  const createVendorMutation = useMutation({
    mutationFn: async (data: CreateProcurementVendorRequest) => {
      const response = await apiClient.post<ProcurementVendor>('/vendors/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: procurementVendorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: procurementVendorKeys.stats() });
      toast({
        title: 'Vendor Created',
        description: 'Supplier has been created successfully. Invitation email sent.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to create vendor',
        variant: 'destructive',
      });
    },
  });

  // Update vendor
  const updateVendorMutation = useMutation({
    mutationFn: async ({ vendorId, data }: { vendorId: string; data: UpdateProcurementVendorRequest }) => {
      const response = await apiClient.put<ProcurementVendor>(`/vendors/${vendorId}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: procurementVendorKeys.detail(variables.vendorId) });
      queryClient.invalidateQueries({ queryKey: procurementVendorKeys.lists() });
      toast({
        title: 'Vendor Updated',
        description: 'Supplier details have been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to update vendor',
        variant: 'destructive',
      });
    },
  });

  // Update vendor status
  const updateVendorStatusMutation = useMutation({
    mutationFn: async ({ vendorId, status }: { vendorId: string; status: string }) => {
      const response = await apiClient.patch<ProcurementVendor>(
        `/vendors/${vendorId}/status`,
        { status }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: procurementVendorKeys.detail(variables.vendorId) });
      queryClient.invalidateQueries({ queryKey: procurementVendorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: procurementVendorKeys.stats() });
      toast({
        title: 'Status Updated',
        description: 'Supplier status has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to update vendor status',
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
      queryClient.invalidateQueries({ queryKey: procurementVendorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: procurementVendorKeys.stats() });
      toast({
        title: 'Vendor Deleted',
        description: 'Supplier has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to delete vendor',
        variant: 'destructive',
      });
    },
  });

  return {
    // Statistics
    stats: statsQuery.data,
    isStatsLoading: statsQuery.isLoading,

    // Queries
    useVendorsList,
    useVendorDetail,

    // Mutations
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

