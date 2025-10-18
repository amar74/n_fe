import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  opportunityDocumentsApi, 
  CreateOpportunityDocumentRequest, 
  UpdateOpportunityDocumentRequest 
} from '@/services/api/opportunityDocumentsApi';

export const opportunityDocumentKeys = {
  all: ['opportunityDocuments'] as const,
  lists: () => [...opportunityDocumentKeys.all, 'list'] as const,
  list: (opportunityId: string, page: number, limit: number) => 
    [...opportunityDocumentKeys.lists(), opportunityId, page, limit] as const,
  details: () => [...opportunityDocumentKeys.all, 'detail'] as const,
  detail: (opportunityId: string, documentId: string) => 
    [...opportunityDocumentKeys.details(), opportunityId, documentId] as const,
};

export function useOpportunityDocuments(opportunityId: string, page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: opportunityDocumentKeys.list(opportunityId, page, limit),
    queryFn: () => opportunityDocumentsApi.getDocuments(opportunityId, page, limit),
    enabled: !!opportunityId,
  });
}

export function useOpportunityDocument(opportunityId: string, documentId: string) {
  return useQuery({
    queryKey: opportunityDocumentKeys.detail(opportunityId, documentId),
    queryFn: () => opportunityDocumentsApi.getDocument(opportunityId, documentId),
    enabled: !!opportunityId && !!documentId,
  });
}

export function useCreateOpportunityDocument(opportunityId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOpportunityDocumentRequest) => 
      opportunityDocumentsApi.createDocument(opportunityId, data),
    onSuccess: () => {
      // Invalidate and refetch opportunity documents list
      queryClient.invalidateQueries({ 
        queryKey: opportunityDocumentKeys.lists() 
      });
      // Also invalidate opportunity overview to refresh documents summary
      queryClient.invalidateQueries({ 
        queryKey: ['opportunityOverview', opportunityId] 
      });
    },
  });
}

export function useUpdateOpportunityDocument(opportunityId: string, documentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateOpportunityDocumentRequest) => 
      opportunityDocumentsApi.updateDocument(opportunityId, documentId, data),
    onSuccess: () => {
      // Invalidate and refetch opportunity documents
      queryClient.invalidateQueries({ 
        queryKey: opportunityDocumentKeys.lists() 
      });
      queryClient.invalidateQueries({ 
        queryKey: opportunityDocumentKeys.detail(opportunityId, documentId) 
      });
      // Also invalidate opportunity overview to refresh documents summary
      queryClient.invalidateQueries({ 
        queryKey: ['opportunityOverview', opportunityId] 
      });
    },
  });
}

export function useDeleteOpportunityDocument(opportunityId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => 
      opportunityDocumentsApi.deleteDocument(opportunityId, documentId),
    onSuccess: () => {
      // Invalidate and refetch opportunity documents
      queryClient.invalidateQueries({ 
        queryKey: opportunityDocumentKeys.lists() 
      });
      // Also invalidate opportunity overview to refresh documents summary
      queryClient.invalidateQueries({ 
        queryKey: ['opportunityOverview', opportunityId] 
      });
    },
  });
}

export function useUploadOpportunityDocument(opportunityId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, category, purpose }: { file: File; category: string; purpose: string }) => 
      opportunityDocumentsApi.uploadFile(opportunityId, file, category, purpose),
    onSuccess: () => {
      // Invalidate and refetch opportunity documents
      queryClient.invalidateQueries({ 
        queryKey: opportunityDocumentKeys.lists() 
      });
      // Also invalidate opportunity overview to refresh documents summary
      queryClient.invalidateQueries({ 
        queryKey: ['opportunityOverview', opportunityId] 
      });
    },
  });
}