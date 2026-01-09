import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  clauseLibraryApi, 
  ClauseLibraryItem, 
  ClauseLibraryCreateRequest, 
  ClauseLibraryUpdateRequest,
  ClauseCategory 
} from '@/services/api/clauseLibraryApi';
import { useToast } from '@/hooks/shared';

// Query keys
export const clauseLibraryKeys = {
  all: ['clause-library'] as const,
  lists: () => [...clauseLibraryKeys.all, 'list'] as const,
  list: (params?: {
    page?: number;
    size?: number;
    category?: string;
    search?: string;
  }) => [...clauseLibraryKeys.lists(), params] as const,
  details: () => [...clauseLibraryKeys.all, 'detail'] as const,
  detail: (id: string) => [...clauseLibraryKeys.details(), id] as const,
  categories: () => [...clauseLibraryKeys.all, 'categories'] as const,
};

export function useClauseLibrary() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // READ - List clauses
  const useClauseLibraryList = (params?: {
    page?: number;
    size?: number;
    category?: string;
    search?: string;
  }) => {
    return useQuery({
      queryKey: clauseLibraryKeys.list(params),
      queryFn: async () => {
        return await clauseLibraryApi.list(params);
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // READ - Get clause detail
  const useClause = (id: string | undefined, enabled: boolean = true) => {
    return useQuery({
      queryKey: clauseLibraryKeys.detail(id || ''),
      queryFn: async () => {
        if (!id) throw new Error('Clause ID is required');
        return await clauseLibraryApi.get(id);
      },
      enabled: enabled && !!id,
      staleTime: 5 * 60 * 1000,
    });
  };

  // READ - Get categories
  const useCategories = () => {
    return useQuery({
      queryKey: clauseLibraryKeys.categories(),
      queryFn: async () => {
        return await clauseLibraryApi.getCategories();
      },
      staleTime: 10 * 60 * 1000, // 10 minutes - categories don't change often
    });
  };

  // CREATE - Create clause
  const createClauseMutation = useMutation({
    mutationFn: async (data: ClauseLibraryCreateRequest) => {
      return await clauseLibraryApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clauseLibraryKeys.all });
      toast.success('Clause added to library successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || error?.response?.data?.detail || 'Failed to create clause');
    },
  });

  // UPDATE - Update clause
  const updateClauseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ClauseLibraryUpdateRequest }) => {
      return await clauseLibraryApi.update(id, data);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: clauseLibraryKeys.all });
      queryClient.invalidateQueries({ queryKey: clauseLibraryKeys.detail(variables.id) });
      toast.success('Clause updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || error?.response?.data?.detail || 'Failed to update clause');
    },
  });

  // DELETE - Delete clause
  const deleteClauseMutation = useMutation({
    mutationFn: async (id: string) => {
      return await clauseLibraryApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clauseLibraryKeys.all });
      toast.success('Clause deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || error?.response?.data?.detail || 'Failed to delete clause');
    },
  });

  // CREATE - Create category
  const createCategoryMutation = useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      return await clauseLibraryApi.createCategory(name, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clauseLibraryKeys.categories() });
      toast.success('Category created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || error?.response?.data?.detail || 'Failed to create category');
    },
  });

  return {
    useClauseLibraryList,
    useClause,
    useCategories,
    createClauseMutation,
    updateClauseMutation,
    deleteClauseMutation,
    createCategoryMutation,
  };
}

