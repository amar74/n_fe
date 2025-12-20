import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { useToast } from '@/hooks/shared';

export interface AIAgenticTemplate {
  id: number;
  name: string;
  description?: string;
  category: string;
  tags?: string[];
  assigned_modules?: string[];
  system_prompt: string;
  welcome_message?: string;
  quick_actions?: Record<string, any>;
  is_active: boolean;
  is_default: boolean;
  display_order: number;
  org_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AIAgenticTemplateCreate {
  name: string;
  description?: string;
  category: string;
  tags?: string[];
  assigned_modules?: string[];
  system_prompt: string;
  welcome_message?: string;
  quick_actions?: Record<string, any>;
  is_active?: boolean;
  is_default?: boolean;
  display_order?: number;
}

export interface AIAgenticTemplateUpdate {
  name?: string;
  description?: string;
  category?: string;
  tags?: string[];
  assigned_modules?: string[];
  system_prompt?: string;
  welcome_message?: string;
  quick_actions?: Record<string, any>;
  is_active?: boolean;
  is_default?: boolean;
  display_order?: number;
}

const AI_AGENTIC_KEYS = {
  all: ['ai-agentic'] as const,
  templates: () => [...AI_AGENTIC_KEYS.all, 'templates'] as const,
  template: (id: number) => [...AI_AGENTIC_KEYS.templates(), id] as const,
  byModule: (module: string) => [...AI_AGENTIC_KEYS.templates(), 'module', module] as const,
};

export const useAIAgenticTemplates = (params?: {
  category?: string;
  module?: string;
  is_active?: boolean;
  include_inactive?: boolean;
}) => {
  return useQuery({
    queryKey: [...AI_AGENTIC_KEYS.templates(), params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.category) queryParams.append('category', params.category);
      if (params?.module) queryParams.append('module', params.module);
      if (params?.is_active !== undefined) queryParams.append('is_active', String(params.is_active));
      if (params?.include_inactive) queryParams.append('include_inactive', 'true');
      
      const response = await apiClient.get(`/v1/ai-agentic/templates?${queryParams.toString()}`);
      return response.data as { templates: AIAgenticTemplate[]; total: number };
    },
  });
};

export const useAIAgenticTemplatesByModule = (module: string) => {
  return useQuery({
    queryKey: AI_AGENTIC_KEYS.byModule(module),
    queryFn: async () => {
      const response = await apiClient.get(`/v1/ai-agentic/templates/by-module/${module}`);
      return response.data as { templates: AIAgenticTemplate[]; total: number };
    },
    enabled: !!module,
  });
};

export const useAIAgenticTemplate = (id: number) => {
  return useQuery({
    queryKey: AI_AGENTIC_KEYS.template(id),
    queryFn: async () => {
      const response = await apiClient.get(`/v1/ai-agentic/templates/${id}`);
      return response.data as AIAgenticTemplate;
    },
    enabled: !!id,
  });
};

const formatError = (error: any): string => {
  const detail = error.response?.data?.detail;
  
  if (!detail) {
    return error.message || 'An unexpected error occurred';
  }
  
  // If detail is a string, return it directly
  if (typeof detail === 'string') {
    return detail;
  }
  
  // If detail is an array of validation errors, format them
  if (Array.isArray(detail)) {
    return detail
      .map((err: any) => {
        const field = err.loc?.slice(1).join('.') || 'field';
        return `${field}: ${err.msg}`;
      })
      .join(', ');
  }
  
  // If detail is an object, try to extract a message
  if (typeof detail === 'object') {
    return detail.message || detail.msg || JSON.stringify(detail);
  }
  
  return 'Failed to create template';
};

export const useCreateAIAgenticTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: AIAgenticTemplateCreate) => {
      const response = await apiClient.post('/v1/ai-agentic/templates', data);
      return response.data as AIAgenticTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AI_AGENTIC_KEYS.templates() });
      toast({
        title: 'Success',
        description: 'AI Agentic template created successfully',
      });
    },
    onError: (error: any) => {
      const errorMessage = formatError(error);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateAIAgenticTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: AIAgenticTemplateUpdate }) => {
      const response = await apiClient.put(`/v1/ai-agentic/templates/${id}`, data);
      return response.data as AIAgenticTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AI_AGENTIC_KEYS.templates() });
      toast({
        title: 'Success',
        description: 'AI Agentic template updated successfully',
      });
    },
    onError: (error: any) => {
      const errorMessage = formatError(error);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteAIAgenticTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/v1/ai-agentic/templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AI_AGENTIC_KEYS.templates() });
      toast({
        title: 'Success',
        description: 'AI Agentic template deleted successfully',
      });
    },
    onError: (error: any) => {
      const errorMessage = formatError(error);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

