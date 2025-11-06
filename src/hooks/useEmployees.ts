import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// Query keys
export const employeeKeys = {
  all: ['employees'] as const,
  list: (status?: string) => [...employeeKeys.all, 'list', status] as const,
  detail: (id: string) => [...employeeKeys.all, 'detail', id] as const,
  dashboard: () => [...employeeKeys.all, 'dashboard'] as const,
  skillsGap: () => [...employeeKeys.all, 'skills-gap'] as const,
};

// Types
type Employee = {
  id: string;
  company_id?: string;
  user_id?: string;
  employee_number: string;
  name: string;
  email: string;
  phone?: string;
  job_title?: string;
  role?: string;
  department?: string;
  location?: string;
  bill_rate?: number;
  status: string;
  invite_sent_at?: string;
  onboarding_complete: boolean;
  experience?: string;
  skills?: string[];
  ai_suggested_role?: string;
  ai_suggested_skills?: string[];
  ai_match_percentage?: number;
  ai_match_reasons?: string[];
  review_notes?: string;
  created_at: string;
  updated_at: string;
};

type EmployeeCreate = {
  name: string;
  email: string;
  phone?: string;
  job_title?: string;
  role?: string;
  department?: string;
  location?: string;
  bill_rate?: number;
  experience?: string;
  skills?: string[];
  use_ai_suggestion?: boolean;
};

type EmployeeUpdate = {
  name?: string;
  email?: string;
  phone?: string;
  job_title?: string;
  role?: string;
  department?: string;
  location?: string;
  bill_rate?: number;
  status?: string;
  experience?: string;
  skills?: string[];
  review_notes?: string;
  onboarding_complete?: boolean;
};

type AIRoleSuggestion = {
  suggested_role: string;
  suggested_department?: string;
  suggested_skills: string[];
  confidence: number;
  bill_rate_suggestion?: number;
};

type SkillGap = {
  skill: string;
  required: number;
  available: number;
  gap: number;
  priority: string;
};

type DashboardStats = {
  total_employees: number;
  pending_count: number;
  review_count: number;
  accepted_count: number;
  rejected_count: number;
  active_count: number;
  pending_invites: number;
  onboarding_complete: number;
  recent_hires: Employee[];
};

export function useEmployees(status?: string) {
  const queryClient = useQueryClient();

  // Fetch employees list
  const listQuery = useQuery({
    queryKey: employeeKeys.list(status),
    queryFn: async () => {
      const params = status ? `?status_filter=${status}` : '';
      const response = await apiClient.get<Employee[]>(`${BASE_URL}/api/resources/employees${params}`);
      return response.data;
    },
  });

  // Create employee with optimistic update
  const createMutation = useMutation({
    mutationFn: async (data: EmployeeCreate) => {
      console.log('Sending create request to backend...');
      const startTime = Date.now();
      const response = await apiClient.post<Employee>(`${BASE_URL}/api/resources/employees`, data);
      console.log(`Backend responded in ${Date.now() - startTime}ms`);
      return response.data;
    },
    onSuccess: (newEmployee) => {
      console.log('Employee created successfully:', newEmployee.id);
      // Invalidate queries to refetch updated list
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    },
    onError: (error: any) => {
      console.error('Create mutation failed:', error.message);
    },
  });

  // Update employee
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: EmployeeUpdate }) => {
      const response = await apiClient.patch<Employee>(`${BASE_URL}/api/resources/employees/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    },
  });

  // Delete employee
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`${BASE_URL}/api/resources/employees/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    },
  });

  // Change stage with optimistic update
  const changeStageMutation = useMutation({
    mutationFn: async ({ id, stage, notes }: { id: string; stage: string; notes?: string }) => {
      const response = await apiClient.patch<Employee>(
        `${BASE_URL}/api/resources/employees/${id}/stage`,
        { 
          new_stage: stage,
          notes: notes || undefined
        }
      );
      return response.data;
    },
    onMutate: async ({ id, stage }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: employeeKeys.list(status) });

      // Snapshot previous value
      const previousEmployees = queryClient.getQueryData(employeeKeys.list(status));

      // Optimistically update to new value
      queryClient.setQueryData(employeeKeys.list(status), (old: any) => {
        if (!old) return old;
        return old.map((emp: any) =>
          emp.id === id ? { ...emp, status: stage } : emp
        );
      });

      // Return context with previous data
      return { previousEmployees };
    },
    onError: (err, variables, context: any) => {
      // Rollback on error
      if (context?.previousEmployees) {
        queryClient.setQueryData(employeeKeys.list(status), context.previousEmployees);
      }
    },
    onSettled: async () => {
      // Always refetch after error or success
      await queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      await queryClient.invalidateQueries({ queryKey: employeeKeys.dashboard() });
      
      // Refetch the employee lists immediately
      await queryClient.refetchQueries({ queryKey: employeeKeys.list() });
    },
  });

  // Bulk import
  const bulkImportMutation = useMutation({
    mutationFn: async ({ file, aiEnrich }: { file: File; aiEnrich: boolean }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('ai_enrich', String(aiEnrich));
      
      const response = await apiClient.post(`${BASE_URL}/api/resources/employees/import`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: async () => {
      // Invalidate all employee-related queries
      await queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      await queryClient.invalidateQueries({ queryKey: employeeKeys.dashboard() });
      
      // Refetch the employee lists immediately
      await queryClient.refetchQueries({ queryKey: employeeKeys.list() });
    },
  });

  // AI role suggestion
  const getRoleSuggestion = async (data: { name: string; job_title?: string; department?: string }) => {
    const response = await apiClient.post<AIRoleSuggestion>(`${BASE_URL}/api/ai/role-suggest`, data);
    return response.data;
  };

  // Upload resume
  const uploadResumeMutation = useMutation({
    mutationFn: async ({ employeeId, file }: { employeeId: string; file: File }) => {
      const formData = new FormData();
      formData.append('employee_id', employeeId);
      formData.append('file', file);
      
      const response = await apiClient.post(`${BASE_URL}/api/resources/resumes-import`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    },
  });

  return {
    // Data
    employees: listQuery.data || [],
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    error: listQuery.error,

    // Actions
    createEmployee: createMutation.mutateAsync,
    updateEmployee: updateMutation.mutateAsync,
    deleteEmployee: deleteMutation.mutateAsync,
    changeStage: changeStageMutation.mutateAsync,
    bulkImport: bulkImportMutation.mutateAsync,
    getRoleSuggestion,
    uploadResume: uploadResumeMutation.mutateAsync,

    // Status
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isChangingStage: changeStageMutation.isPending,
    isImporting: bulkImportMutation.isPending,
    isUploadingResume: uploadResumeMutation.isPending,
  };
}

// Analytics hook
export function useEmployeeAnalytics() {
  // Dashboard stats
  const dashboardQuery = useQuery({
    queryKey: employeeKeys.dashboard(),
    queryFn: async () => {
      const response = await apiClient.get<DashboardStats>(`${BASE_URL}/api/resources/dashboard/onboarding`);
      return response.data;
    },
  });

  // Skills gap analysis
  const skillsGapQuery = useQuery({
    queryKey: employeeKeys.skillsGap(),
    queryFn: async () => {
      const response = await apiClient.get<{
        total_employees: number;
        accepted_employees: number;
        total_gap: number;
        critical_gaps: number;
        skill_gaps: SkillGap[];
      }>(`${BASE_URL}/api/resources/ai/skills-gap`);
      return response.data;
    },
  });

  return {
    dashboard: dashboardQuery.data,
    skillsGap: skillsGapQuery.data,
    isLoadingDashboard: dashboardQuery.isLoading,
    isLoadingSkillsGap: skillsGapQuery.isLoading,
  };
}

