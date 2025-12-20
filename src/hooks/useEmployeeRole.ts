import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/auth';
import { apiClient, API_BASE_URL_WITH_PREFIX } from '@/services/api/client';
import axios from 'axios';
import { STORAGE_CONSTANTS } from '@/constants/storageConstants';

interface EmployeeRecord {
  id: string;
  name: string;
  email: string;
  job_title: string | null;
  role: string | null;
  department: string | null;
  employee_number: string;
  status: string;
}

// Custom axios instance for employee record check that silently handles 404s
const silentEmployeeClient = axios.create({
  baseURL: API_BASE_URL_WITH_PREFIX,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  validateStatus: (status) => status === 200 || status === 404, // Don't throw on 404
});

// Add auth interceptor
silentEmployeeClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_CONSTANTS.AUTH_TOKEN);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - silently handle 404s
silentEmployeeClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // For 404s on /resources/employees/me, return a response object instead of error
    // This is expected - not all users have employee records
    if (error.response?.status === 404 && error.config?.url?.includes('/resources/employees/me')) {
      // Suppress console error for this expected case
      error.suppressConsoleError = true;
      return Promise.resolve({
        ...error.response,
        status: 404,
        data: null,
      });
    }
    // For 401, handle normally
    if (error.response?.status === 401) {
      localStorage.clear();
      delete silentEmployeeClient.defaults.headers.common['Authorization'];
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Hook to determine if user is an employee and should see employee dashboard
 * Reuses role detection logic from EmployeeDashboardPage for consistency
 */
export function useEmployeeRole() {
  const { backendUser } = useAuth();

  // Fetch current user's employee record
  const { data: employeeRecord, isLoading: employeeLoading } = useQuery<EmployeeRecord | null>({
    queryKey: ['employeeRecord', backendUser?.id],
    queryFn: async () => {
      if (!backendUser?.id) return null;
      try {
        // Use silent client that handles 404s gracefully
        const response = await silentEmployeeClient.get('/resources/employees/me');
        
        // If 404, user doesn't have an employee record (this is normal)
        if (response.status === 404) {
          return null;
        }
        
        return response.data;
      } catch (error: any) {
        // Only log unexpected errors (not 404s or 401s)
        if (error.response?.status && error.response.status !== 404 && error.response.status !== 401) {
          console.debug('[useEmployeeRole] Error fetching employee record:', error.response?.status, error.response?.data?.detail || error.message);
        }
        return null;
      }
    },
    enabled: !!backendUser?.id,
    retry: false, // Don't retry 404s
    throwOnError: false, // Don't throw errors, just return null
  });

  // Map user role to RBAC role according to RBAC documentation
  // Reuses logic from EmployeeDashboardPage for consistency
  const rbacRole = useMemo(() => {
    if (!backendUser) return 'viewer';

    const userRole = backendUser.role?.toLowerCase() || '';

    // Admin roles → not employees (stay on home page)
    if (
      userRole === 'admin' ||
      userRole === 'vendor' ||
      userRole === 'super_admin' ||
      userRole === 'platform_admin' ||
      userRole === 'org_admin'
    ) {
      return 'org_admin';
    }

    // Standard employee roles
    if (['manager', 'contributor', 'viewer'].includes(userRole)) {
      return userRole;
    }

    // Check employee record for role mapping
    if (employeeRecord) {
      const jobTitle = employeeRecord.job_title?.toLowerCase() || '';
      const department = employeeRecord.department?.toLowerCase() || '';

      if (jobTitle.includes('manager') || jobTitle.includes('lead') || jobTitle.includes('director')) {
        return 'manager';
      }

      // HR roles → RBAC 'contributor' (with HR scope per RBAC guide)
      if (department === 'hr' || jobTitle.includes('hr') || jobTitle.includes('human resources')) {
        return 'contributor';
      }

      // Finance Manager → RBAC 'manager' (with finance scope)
      if (department === 'finance' || jobTitle.includes('finance') || jobTitle.includes('accountant')) {
        if (jobTitle.includes('manager')) {
          return 'manager';
        }
        return 'contributor';
      }

      // Other employees → RBAC 'contributor' or 'viewer' based on job
      if (userRole === 'employee') {
        if (jobTitle.includes('analyst') || jobTitle.includes('viewer') || jobTitle.includes('read-only')) {
          return 'viewer';
        }
        return 'contributor';
      }
    }

    // Default: viewer (read-only access)
    return 'viewer';
  }, [backendUser, employeeRecord]);

  // Determine if user should see employee dashboard
  const shouldSeeEmployeeDashboard = useMemo(() => {
    // If user has employee record, they should see employee dashboard
    if (employeeRecord) {
      // Exception: Managers with employee record might want to see manager dashboard
      // For now, if they have employee record, they see employee dashboard
      return true;
    }

    // Check RBAC role - employees see employee dashboard
    if (rbacRole === 'contributor' || rbacRole === 'viewer') {
      return true;
    }

    // Default: admins and managers stay on home page
    return false;
  }, [employeeRecord, rbacRole]);

  return {
    employeeRecord,
    rbacRole,
    shouldSeeEmployeeDashboard,
    isLoading: employeeLoading,
  };
}

