import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api/client';
import { toast } from 'sonner';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions?: string[];
  isSystem?: boolean;
  color?: string;
}

const CUSTOM_ROLES_STORAGE_KEY = 'megapolis_custom_roles';

/**
 * Hook for managing roles (system + custom)
 * System roles come from backend API
 * Custom roles are stored in localStorage
 */
export function useRoles() {
  const [systemRoles, setSystemRoles] = useState<Role[]>([]);
  const [customRoles, setCustomRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load custom roles from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CUSTOM_ROLES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setCustomRoles(parsed);
      }
    } catch (err) {
      console.error('Error loading custom roles from localStorage:', err);
    }
  }, []);

  // Fetch system roles from backend
  useEffect(() => {
    const fetchSystemRoles = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiClient.get('/resources/roles');
        setSystemRoles(response.data.roles || []);
      } catch (err: any) {
        console.error('Error fetching system roles:', err);
        setError(err.response?.data?.detail || 'Failed to load system roles');
        toast.error('Failed to load system roles');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSystemRoles();
  }, []);

  // Save custom roles to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_ROLES_STORAGE_KEY, JSON.stringify(customRoles));
    } catch (err) {
      console.error('Error saving custom roles to localStorage:', err);
    }
  }, [customRoles]);

  // Combined roles (system + custom)
  const allRoles = [...systemRoles, ...customRoles];

  // Create a new custom role
  const createRole = (roleData: Omit<Role, 'id' | 'isSystem'>) => {
    const newRole: Role = {
      ...roleData,
      id: `custom_${Date.now()}`,
      isSystem: false,
    };
    setCustomRoles(prev => [...prev, newRole]);
    toast.success(`Role "${newRole.name}" created successfully`);
    return newRole;
  };

  // Update an existing custom role
  const updateRole = (roleId: string, roleData: Partial<Role>) => {
    // Can only update custom roles, not system roles
    const role = customRoles.find(r => r.id === roleId);
    if (!role) {
      toast.error('Cannot update system roles');
      return;
    }

    setCustomRoles(prev =>
      prev.map(r => (r.id === roleId ? { ...r, ...roleData } : r))
    );
    toast.success('Role updated successfully');
  };

  // Delete a custom role
  const deleteRole = (roleId: string) => {
    const role = customRoles.find(r => r.id === roleId);
    if (!role) {
      toast.error('Cannot delete system roles');
      return;
    }

    setCustomRoles(prev => prev.filter(r => r.id !== roleId));
    toast.success(`Role "${role.name}" deleted successfully`);
  };

  // Get a role by ID
  const getRoleById = (roleId: string): Role | undefined => {
    return allRoles.find(r => r.id === roleId);
  };

  // Get role name by ID
  const getRoleName = (roleId: string): string => {
    return getRoleById(roleId)?.name || roleId;
  };

  return {
    // State
    allRoles,
    systemRoles,
    customRoles,
    isLoading,
    error,

    // Actions
    createRole,
    updateRole,
    deleteRole,
    getRoleById,
    getRoleName,
  };
}

