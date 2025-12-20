import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { useToast } from '@/hooks/shared';
import { createApiClient } from '@/types/generated/Proposals';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const proposalsApi = createApiClient(BASE_URL, { axiosInstance: apiClient });

export const proposalKeys = {
  all: ['proposals'] as const,
  lists: () => [...proposalKeys.all, 'list'] as const,
  list: (params?: { page?: number; size?: number; status_filter?: string; type_filter?: string; search?: string }) =>
    [...proposalKeys.lists(), params] as const,
  details: () => [...proposalKeys.all, 'detail'] as const,
  detail: (id: string) => [...proposalKeys.details(), id] as const,
  byOpportunity: (opportunityId: string) => [...proposalKeys.all, 'by-opportunity', opportunityId] as const,
};

export function useProposals() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // READ - List proposals
  const useProposalsList = (params?: {
    page?: number;
    size?: number;
    status_filter?: string;
    type_filter?: 'proposal' | 'brochure' | 'interview' | 'campaign';
    search?: string;
  }) => {
    return useQuery({
      queryKey: proposalKeys.list(params),
      queryFn: async () => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.size) queryParams.append('size', params.size.toString());
        if (params?.status_filter) queryParams.append('status_filter', params.status_filter);
        if (params?.type_filter) queryParams.append('type_filter', params.type_filter);
        if (params?.search) queryParams.append('search', params.search);

        const response = await apiClient.get(`/proposals/?${queryParams.toString()}`);
        return response.data;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // READ - Get proposal detail
  const useProposal = (id: string | undefined, enabled: boolean = true) => {
    return useQuery({
      queryKey: proposalKeys.detail(id || ''),
      queryFn: async () => {
        if (!id) throw new Error('Proposal ID is required');
        const response = await apiClient.get(`/proposals/${id}`);
        return response.data;
      },
      enabled: enabled && !!id,
      staleTime: 5 * 60 * 1000,
    });
  };

  // READ - Get proposals by opportunity
  const useProposalsByOpportunity = (opportunityId: string | undefined) => {
    return useQuery({
      queryKey: proposalKeys.byOpportunity(opportunityId || ''),
      queryFn: async () => {
        if (!opportunityId) throw new Error('Opportunity ID is required');
        const response = await apiClient.get(`/proposals/by-opportunity/${opportunityId}`);
        return response.data;
      },
      enabled: !!opportunityId,
      staleTime: 5 * 60 * 1000,
    });
  };

  // CREATE
  const createProposalMutation = useMutation({
    mutationFn: async (data: any) => {
      try {
        console.log('[useProposals] Creating proposal with data:', JSON.stringify(data, null, 2));
        const response = await apiClient.post('/proposals/create', data);
        console.log('[useProposals] Proposal created successfully:', response.data);
        return response.data;
      } catch (error: any) {
        console.error('[useProposals] Error creating proposal:', error);
        console.error('[useProposals] Error response:', error.response?.data);
        console.error('[useProposals] Error status:', error.response?.status);
        console.error('[useProposals] Error message:', error.message);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: proposalKeys.lists() });
      toast.success('Proposal created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create proposal');
    },
  });

  // UPDATE
  const updateProposalMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.put(`/proposals/${id}`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: proposalKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: proposalKeys.lists() });
      toast.success('Proposal updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update proposal');
    },
  });

  // SUBMIT
  const submitProposalMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data?: any }) => {
      const response = await apiClient.post(`/proposals/submit/${id}`, data || {});
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: proposalKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: proposalKeys.lists() });
      toast.success('Proposal submitted for approval');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to submit proposal');
    },
  });

  // ADD SECTION
  const addSectionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.post(`/proposals/${id}/sections`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: proposalKeys.detail(variables.id) });
      toast.success('Section added successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to add section');
    },
  });

  // UPDATE SECTION
  const updateSectionMutation = useMutation({
    mutationFn: async ({ id, sectionId, data }: { id: string; sectionId: string; data: any }) => {
      const response = await apiClient.put(`/proposals/${id}/sections/${sectionId}`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: proposalKeys.detail(variables.id) });
      toast.success('Section updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update section');
    },
  });

  // ADD DOCUMENT
  const addDocumentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.post(`/proposals/${id}/documents`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: proposalKeys.detail(variables.id) });
      toast.success('Document added successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to add document');
    },
  });

  return {
    // Queries
    useProposalsList,
    useProposal,
    useProposalsByOpportunity,

    // Mutations
    createProposal: createProposalMutation.mutateAsync,
    updateProposal: updateProposalMutation.mutateAsync,
    submitProposal: submitProposalMutation.mutateAsync,
    addSection: addSectionMutation.mutateAsync,
    updateSection: updateSectionMutation.mutateAsync,
    addDocument: addDocumentMutation.mutateAsync,

    // Loading states
    isCreating: createProposalMutation.isPending,
    isUpdating: updateProposalMutation.isPending,
    isSubmitting: submitProposalMutation.isPending,
    isAddingSection: addSectionMutation.isPending,
    isUpdatingSection: updateSectionMutation.isPending,
    isAddingDocument: addDocumentMutation.isPending,
  };
}

