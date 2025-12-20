import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { useToast } from '@/hooks/shared';

export interface ExpenseCategory {
  id: number;
  name: string;
  description: string | null;
  parent_id: number | null;
  is_active: boolean;
  is_default: boolean;
  display_order: number;
  category_type: 'revenue' | 'expense';
  created_at: string;
  updated_at: string;
  subcategories?: ExpenseCategory[];
}

export interface ExpenseCategoryCreate {
  name: string;
  description?: string | null;
  parent_id?: number | null;
  is_active?: boolean;
  display_order?: number;
  category_type?: 'revenue' | 'expense';
}

export interface ExpenseCategoryUpdate {
  name?: string;
  description?: string | null;
  parent_id?: number | null;
  is_active?: boolean;
  display_order?: number;
  category_type?: 'revenue' | 'expense';
}

const EXPENSE_CATEGORY_QUERY_KEYS = {
  all: ['expense-categories'] as const,
  lists: () => [...EXPENSE_CATEGORY_QUERY_KEYS.all, 'list'] as const,
  list: (params?: { include_inactive?: boolean; include_subcategories?: boolean }) =>
    [...EXPENSE_CATEGORY_QUERY_KEYS.lists(), params] as const,
  details: () => [...EXPENSE_CATEGORY_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...EXPENSE_CATEGORY_QUERY_KEYS.details(), id] as const,
  active: () => [...EXPENSE_CATEGORY_QUERY_KEYS.all, 'active'] as const,
};

export function useExpenseCategories(params?: { include_inactive?: boolean; include_subcategories?: boolean; category_type?: 'revenue' | 'expense' }) {
  return useQuery({
    queryKey: EXPENSE_CATEGORY_QUERY_KEYS.list(params),
    queryFn: async () => {
      try {
        const queryParams = new URLSearchParams();
        if (params?.include_inactive !== undefined) {
          queryParams.append('include_inactive', params.include_inactive.toString());
        }
        if (params?.include_subcategories !== undefined) {
          queryParams.append('include_subcategories', params.include_subcategories.toString());
        }
        if (params?.category_type) {
          queryParams.append('category_type', params.category_type);
        }
        const url = `/v1/expense-categories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await apiClient.get<ExpenseCategory[]>(url);
        return response.data;
      } catch (error: any) {
        console.error('Error fetching expense categories:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useExpenseCategory(id: number, enabled: boolean = true) {
  return useQuery({
    queryKey: EXPENSE_CATEGORY_QUERY_KEYS.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<ExpenseCategory>(`/v1/expense-categories/${id}`);
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useActiveExpenseCategories() {
  return useQuery({
    queryKey: EXPENSE_CATEGORY_QUERY_KEYS.active(),
    queryFn: async () => {
      const response = await apiClient.get<ExpenseCategory[]>('/v1/expense-categories?include_inactive=false&include_subcategories=true');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateExpenseCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: ExpenseCategoryCreate) => {
      const response = await apiClient.post<ExpenseCategory>('/v1/expense-categories', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSE_CATEGORY_QUERY_KEYS.all });
      toast({
        title: 'Success',
        description: 'Category created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to create category',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateExpenseCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ExpenseCategoryUpdate }) => {
      const response = await apiClient.put<ExpenseCategory>(`/v1/expense-categories/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: EXPENSE_CATEGORY_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: EXPENSE_CATEGORY_QUERY_KEYS.detail(variables.id) });
      toast({
        title: 'Success',
        description: 'Category updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to update category',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteExpenseCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/v1/expense-categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSE_CATEGORY_QUERY_KEYS.all });
      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to delete category',
        variant: 'destructive',
      });
    },
  });
}

export function useInitializeDefaultCategories() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (categoryType?: 'revenue' | 'expense') => {
      const url = categoryType 
        ? `/v1/expense-categories/initialize-defaults?category_type=${categoryType}`
        : '/v1/expense-categories/initialize-defaults';
      const response = await apiClient.post<ExpenseCategory[]>(url);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSE_CATEGORY_QUERY_KEYS.all });
      toast({
        title: 'Success',
        description: 'Default categories initialized successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to initialize default categories',
        variant: 'destructive',
      });
    },
  });
}

