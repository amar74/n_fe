import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi } from '@/services/api/notesApi';
import {
  Note,
  NoteListResponse,
  NoteCreateRequest,
  NoteUpdateRequest,
  NotesListParams,
} from '@/types/notes';
import { useToast } from '@/hooks/use-toast';

export const notesKeys = {
  all: ['notes'] as const,
  lists: () => [...notesKeys.all, 'list'] as const,
  list: (params: NotesListParams) => [...notesKeys.lists(), params] as const,
  details: () => [...notesKeys.all, 'detail'] as const,
  detail: (id: string) => [...notesKeys.details(), id] as const,
};

export function useNotes(params: NotesListParams = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const notesQuery = useQuery({
    queryKey: notesKeys.list(params),
    queryFn: () => notesApi.getNotes(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const createNoteMutation = useMutation({
    mutationFn: (data: NoteCreateRequest) => notesApi.createNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notesKeys.lists() });
      toast({
        title: 'Success',
        description: 'Note created sucessfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail?.error?.message || 'create failed',
        variant: 'destructive',
      });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ noteId, data }: { noteId: string; data: NoteUpdateRequest }) =>
      notesApi.updateNote(noteId, data),
    onSuccess: (_, { noteId }) => {
      // not validate specific note detail and lists
      queryClient.invalidateQueries({ queryKey: notesKeys.detail(noteId) });
      queryClient.invalidateQueries({ queryKey: notesKeys.lists() });
      toast({
        title: 'Success',
        description: 'Note updated sucessfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail?.error?.message || 'update failed',
        variant: 'destructive',
      });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: string) => notesApi.deleteNote(noteId),
    onSuccess: () => {
      // Invalidate notes list
      queryClient.invalidateQueries({ queryKey: notesKeys.lists() });
      toast({
        title: 'Success',
        description: 'Note deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail?.error?.message || 'delete failed',
        variant: 'destructive',
      });
    },
  });

  return {
    // Data
    notes: notesQuery.data?.notes || [],
    totalCount: notesQuery.data?.total_count || 0,
    page: notesQuery.data?.page || 1,
    limit: notesQuery.data?.limit || 10,

    // Loading states
    isLoading: notesQuery.isLoading,
    isCreating: createNoteMutation.isPending,
    isUpdating: updateNoteMutation.isPending,
    isDeleting: deleteNoteMutation.isPending,

    // Error states
    error: notesQuery.error,
    createError: createNoteMutation.error,
    updateError: updateNoteMutation.error,
    deleteError: deleteNoteMutation.error,

    // Actions
    createNote: createNoteMutation.mutate,
    updateNote: updateNoteMutation.mutate,
    deleteNote: deleteNoteMutation.mutate,

    refetch: notesQuery.refetch,
    isRefetching: notesQuery.isRefetching,
  };
}

// Hook for getting a single note
export function useNote(noteId: string) {
  const { toast } = useToast();

  const noteQuery = useQuery({
    queryKey: notesKeys.detail(noteId),
    queryFn: () => notesApi.getNoteById(noteId),
    enabled: !!noteId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateNoteMutation = useMutation({
    mutationFn: (data: NoteUpdateRequest) => notesApi.updateNote(noteId, data),
    onSuccess: () => {
      // Invalidate specific note detail and lists
      queryClient.invalidateQueries({ queryKey: notesKeys.detail(noteId) });
      queryClient.invalidateQueries({ queryKey: notesKeys.lists() });
      toast({
        title: 'Success',
        description: 'Note updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail?.error?.message || 'update failed',
        variant: 'destructive',
      });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: () => notesApi.deleteNote(noteId),
    onSuccess: () => {
      // Invalidate notes list
      queryClient.invalidateQueries({ queryKey: notesKeys.lists() });
      toast({
        title: 'Success',
        description: 'Note deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail?.error?.message || 'delete failed',
        variant: 'destructive',
      });
    },
  });

  return {
    // Data
    note: noteQuery.data,

    // Loading states
    isLoading: noteQuery.isLoading,
    isUpdating: updateNoteMutation.isPending,
    isDeleting: deleteNoteMutation.isPending,

    // Error states
    error: noteQuery.error,
    updateError: updateNoteMutation.error,
    deleteError: deleteNoteMutation.error,

    // Actions
    updateNote: updateNoteMutation.mutate,
    deleteNote: deleteNoteMutation.mutate,

    refetch: noteQuery.refetch,
    isRefetching: noteQuery.isRefetching,
  };
}
