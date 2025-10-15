import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import {
  accountDocumentsApi,
  AccountDocument,
  AccountDocumentListResponse,
  AccountDocumentCreateRequest,
  AccountDocumentUpdateRequest,
  AccountDocumentDeleteResponse,
} from '@/services/api/accountDocumentsApi';

export const accountDocumentsKeys = {
  all: (accountId: string) => ['accounts', accountId, 'documents'] as const,
  list: (accountId: string) => [...accountDocumentsKeys.all(accountId), 'list'] as const,
  detail: (accountId: string, documentId: string) => [...accountDocumentsKeys.all(accountId), 'detail', documentId] as const,
};

export function useAccountDocuments(accountId: string, options?: { enabled?: boolean }) {
  const queryClient = useQueryClient();

  const documentsQuery: UseQueryResult<AccountDocumentListResponse, Error> = useQuery({
    queryKey: accountDocumentsKeys.list(accountId),
    queryFn: () => accountDocumentsApi.listDocuments(accountId),
    enabled: options?.enabled !== undefined ? (!!accountId && options.enabled) : !!accountId,
    staleTime: 1000 * 60 * 5, // 5 minutes - documents don't change frequently
  });

  const createDocumentMutation = useMutation({
    mutationFn: (data: AccountDocumentCreateRequest) => accountDocumentsApi.createDocument(accountId, data),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: accountDocumentsKeys.list(accountId), type: 'active' });
    },
  });

  const updateDocumentMutation = useMutation({
    mutationFn: ({ documentId, data }: { documentId: string; data: AccountDocumentUpdateRequest }) =>
      accountDocumentsApi.updateDocument(accountId, documentId, data),
    onSuccess: async (_, variables) => {
      await queryClient.refetchQueries({ queryKey: accountDocumentsKeys.detail(accountId, variables.documentId), type: 'active' });
      await queryClient.refetchQueries({ queryKey: accountDocumentsKeys.list(accountId), type: 'active' });
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: (documentId: string) => accountDocumentsApi.deleteDocument(accountId, documentId),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: accountDocumentsKeys.list(accountId), type: 'active' });
    },
  });

  return {
    // Data
    documents: documentsQuery.data?.documents ?? [],
    total: documentsQuery.data?.total ?? 0,
    
    isLoading: documentsQuery.isLoading,
    isError: documentsQuery.isError,
    error: documentsQuery.error,
    
    isCreatingDocument: createDocumentMutation.isPending,
    isUpdatingDocument: updateDocumentMutation.isPending,
    isDeletingDocument: deleteDocumentMutation.isPending,
    
    // Actions
    refetch: documentsQuery.refetch,
    createDocument: createDocumentMutation.mutateAsync,
    updateDocument: updateDocumentMutation.mutateAsync,
    deleteDocument: deleteDocumentMutation.mutateAsync,
  };
}

// Hook for getting a single document
export function useAccountDocument(accountId: string, documentId: string | null) {
  return useQuery({
    queryKey: accountDocumentsKeys.detail(accountId, documentId!),
    queryFn: () => accountDocumentsApi.getDocument(accountId, documentId!),
    enabled: !!accountId && !!documentId,
  });
}
