import { useMemo } from 'react';
import { useEmployeeRole } from './useEmployeeRole';

/**
 * Hook to check if user can perform write actions (create/edit/delete)
 * Based on RBAC matrix from docs/docs/security/rbac-entitlements.md
 */
export function useRolePermissions() {
  const { rbacRole } = useEmployeeRole();

  /**
   * General write permission check
   * Viewer: NO write access anywhere (per RBAC matrix)
   */
  const canWrite = useMemo(() => {
    // Viewer: NO write access anywhere
    if (rbacRole === 'viewer') {
      return false;
    }
    
    // Contributor, Manager, Org Admin: Can write (with restrictions)
    return true;
  }, [rbacRole]);

  /**
   * Check if user can create resources
   * Based on RBAC matrix: viewers cannot create, others can
   */
  const canCreate = useMemo(() => {
    // Viewer: NO create access
    if (rbacRole === 'viewer') {
      return false;
    }
    return true;
  }, [rbacRole]);

  /**
   * Check if user can edit/update resources
   * Based on RBAC matrix: viewers cannot edit, others can (with partial scoping)
   */
  const canEdit = useMemo(() => {
    // Viewer: NO edit access
    if (rbacRole === 'viewer') {
      return false;
    }
    return true;
  }, [rbacRole]);

  /**
   * Check if user can delete resources
   * Based on RBAC matrix: only managers and admins can delete
   * Contributors have partial write but delete is typically restricted
   */
  const canDelete = useMemo(() => {
    // Viewer: NO delete access
    if (rbacRole === 'viewer') {
      return false;
    }
    
    // Contributors have partial write - typically cannot delete
    if (rbacRole === 'contributor') {
      return false;
    }
    
    // Managers and admins can delete
    return rbacRole === 'manager' || rbacRole === 'org_admin' || rbacRole === 'platform_admin';
  }, [rbacRole]);

  /**
   * Check if user has read-only access
   */
  const isViewer = useMemo(() => {
    return rbacRole === 'viewer';
  }, [rbacRole]);

  const isReadOnly = useMemo(() => {
    return rbacRole === 'viewer';
  }, [rbacRole]);

  return {
    canWrite,
    canCreate,
    canEdit,
    canDelete,
    isViewer,
    isReadOnly,
    rbacRole,
  };
}

