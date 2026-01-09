import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi, Project, ProjectCreateRequest, ProjectUpdateRequest } from '@/services/api/projectsApi';
import { useToast } from '@/hooks/shared';

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (params?: {
    page?: number;
    size?: number;
    status?: string;
    phase?: string;
    priority?: string;
    account?: string;
    search?: string;
  }) => [...projectKeys.lists(), params] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

export function useProjects() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // READ - List projects
  const useProjectsList = (params?: {
    page?: number;
    size?: number;
    status?: string;
    phase?: string;
    priority?: string;
    account?: string;
    search?: string;
  }) => {
    return useQuery({
      queryKey: projectKeys.list(params),
      queryFn: async () => {
        return await projectsApi.list(params);
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // READ - Get project detail
  const useProject = (id: string | undefined, enabled: boolean = true) => {
    return useQuery({
      queryKey: projectKeys.detail(id || ''),
      queryFn: async () => {
        if (!id) throw new Error('Project ID is required');
        return await projectsApi.get(id);
      },
      enabled: enabled && !!id,
      staleTime: 5 * 60 * 1000,
    });
  };

  // CREATE - Create project
  const createProjectMutation = useMutation({
    mutationFn: async (data: ProjectCreateRequest) => {
      return await projectsApi.create(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      toast.success('Project created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to create project');
    },
  });

  // UPDATE - Update project
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProjectUpdateRequest }) => {
      return await projectsApi.update(id, data);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.id) });
      toast.success('Project updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to update project');
    },
  });

  // DELETE - Archive project
  const archiveProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      return await projectsApi.archive(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      toast.success('Project archived successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to archive project');
    },
  });

  // DELETE - Delete project
  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      return await projectsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      toast.success('Project deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to delete project');
    },
  });

  return {
    useProjectsList,
    useProject,
    createProjectMutation,
    updateProjectMutation,
    archiveProjectMutation,
    deleteProjectMutation,
  };
}

