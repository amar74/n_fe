import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { toast } from 'sonner';

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: string[];
  isSystem?: boolean;
  color?: string;
}

type RolePayload = {
  name: string;
  description?: string;
  permissions?: string[];
  color?: string;
};

const roleKeys = {
  all: ['organization', 'roles'] as const,
};

export function useRoles() {
  const queryClient = useQueryClient();

  const {
    data: roles = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: roleKeys.all,
    queryFn: async () => {
      const response = await apiClient.get('/resources/roles');
      return response.data?.roles || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: RolePayload) => {
      const response = await apiClient.post('/resources/roles', payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Role created successfully');
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Failed to create role');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RolePayload }) => {
      const response = await apiClient.put(`/resources/roles/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Role updated successfully');
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Failed to update role');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/resources/roles/${id}`);
    },
    onSuccess: () => {
      toast.success('Role deleted successfully');
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Failed to delete role');
    },
  });

  const systemRoles = roles.filter((role: Role) => role.isSystem);
  const customRoles = roles.filter((role: Role) => !role.isSystem);

  const createRole = (data: RolePayload) => createMutation.mutateAsync(data);
  const updateRole = (id: string, data: RolePayload) =>
    updateMutation.mutateAsync({ id, data });
  const deleteRole = (id: string) => deleteMutation.mutateAsync(id);

  const getRoleById = (roleId: string): Role | undefined =>
    roles.find((role: Role) => role.id === roleId);

  const getRoleName = (roleId: string): string =>
    getRoleById(roleId)?.name || roleId;

  return {
    allRoles: roles,
    systemRoles,
    customRoles,
    isLoading,
    error,
    createRole,
    updateRole,
    deleteRole,
    getRoleById,
    getRoleName,
  };
}

export default useRoles;

