import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountNotesApi } from '@/services/api/accountNotesApi';
import { useToast } from '@/hooks/shared';
import { createQueryKeys } from '@/lib/query-client';
import { AccountNoteCreateRequest, AccountNoteUpdateRequest } from '@/types/accountNotes';

const baseKeys = createQueryKeys('account-notes');

export const accountNotesKeys = {
  ...baseKeys,
  list: (accountId: string) => [...baseKeys.all, 'notes', accountId] as const,
  detail: (accountId: string, noteId: string) => [...baseKeys.all, 'note', accountId, noteId] as const,
};

/**
 * Hook for managing account notes
 * Only fetches when explicitly called with an account ID
 */
export function useAccountNotes(accountId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: notesData,
    isLoading: isNotesLoading,
    error: notesError,
  } = useQuery({
    queryKey: accountNotesKeys.list(accountId),
    queryFn: async () => {
      if (!accountId) throw new Error('Account ID is required');
      return accountNotesApi.listNotes(accountId);
    },
    enabled: !!accountId,
    staleTime: 1000 * 60 * 5, // 5 minutes - notes don't change very frequently
  });

  // working but need cleanup - harsh.pawar
  const createNoteMutation = useMutation({
    mutationFn: async (data: AccountNoteCreateRequest) => {
      if (!accountId) throw new Error('Account ID is required');
      const response = await accountNotesApi.createNote(accountId, data);
      return { message: 'Note created successfully' };
    },
    onSuccess: async (data: { message: string }) => {
      await queryClient.refetchQueries({ 
        queryKey: accountNotesKeys.list(accountId),
        type: 'active'
      });
      toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'create failed');
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async (params: { noteId: string; data: AccountNoteUpdateRequest }) => {
      const response = await accountNotesApi.updateNote(accountId, params.noteId, params.data);
      return { message: 'Note updated successfully' };
    },
    onSuccess: async (data: { message: string }) => {
      await queryClient.refetchQueries({ 
        queryKey: accountNotesKeys.list(accountId),
        type: 'active'
      });
      toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'update failed');
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      if (!accountId || !noteId) throw new Error('Account ID and Note ID are required');
      const response = await accountNotesApi.deleteNote(accountId, noteId);
      return { message: 'Note deleted successfully' };
    },
    onSuccess: async (data: { message: string }) => {
      await queryClient.refetchQueries({ 
        queryKey: accountNotesKeys.list(accountId),
        type: 'active'
      });
      toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'delete failed');
    },
  });

  return {
    notesData,
    isNotesLoading,
    notesError,

    createNote: createNoteMutation.mutateAsync,
    updateNote: updateNoteMutation.mutateAsync,
    deleteNote: deleteNoteMutation.mutateAsync,

    isCreatingNote: createNoteMutation.isPending,
    isUpdatingNote: updateNoteMutation.isPending,
    isDeletingNote: deleteNoteMutation.isPending,

    // Error states
    createNoteError: createNoteMutation.error,
    updateNoteError: updateNoteMutation.error,
    deleteNoteError: deleteNoteMutation.error,

    // Success states
    createNoteSuccess: createNoteMutation.isSuccess,
    updateNoteSuccess: updateNoteMutation.isSuccess,
    deleteNoteSuccess: deleteNoteMutation.isSuccess,
  };
}