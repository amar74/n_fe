import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createQueryKeys } from '@/lib/query-client';
import { orgsApi } from '@/services/api/orgsApi';
import { useToast } from '@/hooks/shared';
import { OrganizationCustomSchema } from '@/types/orgs';
import type {
  CreateOrgFormData,
  UpdateOrgFormData,
  Organization,
  OrgCreated,
  OrgUpdate,
  AddUserFormData,
} from '@/types/orgs';

export const organizationsKeys = createQueryKeys('organizations');

export const organizationsQueryKeys = {
  ...organizationsKeys,
  myOrg: () => [...organizationsKeys.all, 'myOrg'] as const,
  members: () => [...organizationsKeys.all, 'members'] as const,
  users: (orgId: string, params?: { skip?: number; limit?: number }) => 
    [...organizationsKeys.all, 'users', orgId, params] as const,
};

/**
 * Unified Organizations hook following Development.md patterns
 * Encapsulates all CRUD operations and cache management for the Organizations feature
 * Uses manual API client from services/api/orgsApi.ts with shared Axios instance and centralized query-client
 * Note: Custom validation applied to handle backend datetime format inconsistencies
 */
export function useOrganizations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // READ - Get current user's organization
  const useMyOrganization = (enabled: boolean = true) => {
    return useQuery({
      queryKey: organizationsQueryKeys.myOrg(),
      queryFn: async (): Promise<Organization> => {
        
        const response = await orgsApi.getMyOrg();
        const result = OrganizationCustomSchema.parse(response);
        
        return result;
      },
      enabled, // Allow caller to conditionally enable the query
      staleTime: 1000 * 60 * 5, // 5 minutes for org data
      retry: (failureCount, error: any) => {
        // Don't retry if it's a 404 (user has no org)
        if (error?.response?.status === 404) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    });
  };

  // READ - Get organization by ID (placeholder - needs backend implementation)
  const useOrganization = (orgId: string | undefined) => {
    return useQuery({
      queryKey: organizationsKeys.detail(orgId || ''),
      queryFn: async (): Promise<Organization> => {
        if (!orgId) throw new Error('Organization ID is required');
        
        const response = await orgsApi.getMyOrg();
        const result = OrganizationCustomSchema.parse(response);
        
        return result;
      },
      enabled: !!orgId,
      staleTime: 1000 * 60 * 5,
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
  };

  // READ - Get organization members
  const useOrganizationMembers = () => {
    return useQuery({
      queryKey: organizationsQueryKeys.members(),
      queryFn: async () => {
        return { members: [], total_count: 0 }; // Temporary return empty result
      },
      enabled: false, // Disabled until method is added to manual API
      staleTime: 1000 * 60 * 2, // 2 minutes for member data
      retry: 3,
    });
  };

  // READ - Get organization users with pagination
  const useOrganizationUsers = (
    orgId: string | undefined,
    params?: { skip?: number; limit?: number }
  ) => {
    return useQuery({
      queryKey: organizationsQueryKeys.users(orgId || '', params),
      queryFn: async () => {
        if (!orgId) throw new Error('Organization ID is required');
        
        // TODO: Fix API call once getOrgUsers generation is resolved
        return [] as any[]; // Temporary return empty array
      },
      enabled: false, // Disabled until API generation is fixed
      staleTime: 1000 * 60 * 2,
      retry: 3,
    });
  };

  // CREATE - Create new organization
  const createOrganizationMutation = useMutation({
    mutationFn: async (formData: CreateOrgFormData): Promise<OrgCreated> => {
      
      const orgData = {
        name: formData.name,
        address: formData.address ? {
          line1: formData.address.line1 || '',
          line2: formData.address.line2 || null,
          city: formData.address.city || null,
          pincode: formData.address.pincode || null,
        } : null,
        website: formData.website || null,
        contact: formData.contact ? {
          email: formData.contact.email || null,
          phone: formData.contact.phone || null,
        } : null,
      };
      
      const result = await orgsApi.createOrg(orgData as any); // Type assertion needed due to outdated generated schema
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: organizationsQueryKeys.myOrg() });
      queryClient.invalidateQueries({ queryKey: organizationsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: organizationsQueryKeys.members() });
      toast.success('Organization Created', {
        description: `Organization "${data.org.name}" has been created successfully`
      });
    },
    onError: (error: any) => {
      toast.error('Organization Creation Failed', {
        description: error?.response?.data?.message || 'create failed. Please try again.'
      });
    },
  });

  // UPDATE - Update organization
  const updateOrganizationMutation = useMutation({
    mutationFn: async ({ 
      orgId, 
      data 
    }: { 
      orgId: string; 
      data: UpdateOrgFormData 
    }): Promise<any> => {
      // will optimize later - rose11
      const result = await orgsApi.patchOrg(orgId, data);
      return result;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: organizationsQueryKeys.myOrg() });
      toast.success('Organization Updated', {
        description: 'Organization details have been updated sucessfully'
      });
    },
    onError: (error: any) => {
      toast.error('Update Failed', {
        description: error?.response?.data?.message || 'update failed. Please try again.'
      });
    },
  });

  const invalidateOrganizations = () => {
    queryClient.invalidateQueries({ queryKey: organizationsKeys.all });
  };

  const clearOrganizationCache = () => {
    queryClient.removeQueries({ queryKey: organizationsKeys.all });
  };

  const refetchMyOrganization = () => {
    return queryClient.refetchQueries({ queryKey: organizationsQueryKeys.myOrg() });
  };

  const refetchOrganizationMembers = () => {
    return queryClient.refetchQueries({ queryKey: organizationsQueryKeys.members() });
  };

  return {
    useMyOrganization,
    useOrganization,
    useOrganizationMembers,
    useOrganizationUsers,

    createOrganization: createOrganizationMutation.mutateAsync,
    updateOrganization: updateOrganizationMutation.mutateAsync,

    isCreating: createOrganizationMutation.isPending,
    isUpdating: updateOrganizationMutation.isPending,
    
    // Error states for granular error handling
    createError: createOrganizationMutation.error,
    updateError: updateOrganizationMutation.error,

    invalidateOrganizations,
    clearOrganizationCache,
    refetchMyOrganization,
    refetchOrganizationMembers,

    createOrganizationMutation,
    updateOrganizationMutation,
  };
}

/**
 * Convenience hook for commonly used organization data
 * Follows the pattern from useAccounts for direct data access
 * Returns the current user's organization data with loading/error states
 */
export function useMyOrganization(enabled: boolean = true) {
  const { useMyOrganization: useMyOrgQuery } = useOrganizations();
  const query = useMyOrgQuery(enabled);

  return query;
}

/**
 * Convenience hook for organization members
 * Returns organization members data with loading/error states
 */
export function useOrganizationMembers() {
  const { useOrganizationMembers } = useOrganizations();
  const query = useOrganizationMembers();

  return query;
}

/**
 * Convenience hook for organization users with pagination
 * Returns organization users data with loading/error states
 */
export function useOrganizationUsers(
  orgId: string | undefined,
  params?: { skip?: number; limit?: number }
) {
  const { useOrganizationUsers } = useOrganizations();
  const query = useOrganizationUsers(orgId, params);

  return query;
}
