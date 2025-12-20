/**
 * Staff Planning Hook
 * Manages staff planning operations with TanStack Query
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';

// apiClient already has /api prefix in its baseURL, so we only need the endpoint path
const API_BASE = '/staff-planning';

// Types
export interface ProjectInfo {
  projectId?: string;  // UUID
  projectName: string;
  projectDescription: string;
  projectStartDate: string;
  durationMonths: number;
  overheadRate: number;
  profitMargin: number;
}

export interface EscalationPeriod {
  start_month: number;
  end_month: number;
  rate: number;
}

export interface StaffMember {
  id?: number;
  resourceId: string;  // UUID
  resourceName: string;
  role: string;
  level: string;
  startMonth: number;
  endMonth: number;
  hoursPerWeek: number;
  hourlyRate: number;
  monthlyCost?: number;
  totalCost?: number;
  escalationRate?: number | null;  // Deprecated - use escalationPeriods
  escalationStartMonth?: number;  // Deprecated - use escalationPeriods
  escalationPeriods?: EscalationPeriod[];  // New format: multiple escalation periods
}

export interface StaffPlan {
  id: number;
  project_id: string;  // UUID
  project_name: string;
  project_description?: string;
  project_start_date: string;
  duration_months: number;
  overhead_rate: number;
  profit_margin: number;
  annual_escalation_rate: number | null;
  total_labor_cost: number;
  total_overhead: number;
  total_cost: number;
  total_profit: number;
  total_price: number;
  yearly_breakdown?: any;
  status: 'draft' | 'active' | 'completed' | 'archived';
  team_size?: number;  // Number of staff allocations
  created_at: string;
  updated_at: string;
}

export interface StaffPlanWithAllocations extends StaffPlan {
  allocations: StaffAllocation[];
}

export interface StaffAllocation {
  id: number;
  staff_plan_id: number;
  resource_id: string;  // UUID
  resource_name: string;
  role: string;
  level: string | null;
  start_month: number;
  end_month: number;
  hours_per_week: number;
  hourly_rate: number;
  monthly_cost: number;
  total_cost: number;
  initial_escalation_rate: number | null;
  escalation_rate: number | null;  // Deprecated - use escalation_periods
  escalation_start_month: number | null;  // Deprecated - use escalation_periods
  escalation_periods: EscalationPeriod[] | null;  // New format: multiple escalation periods
  escalation_effective_month: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

// Query keys
export const staffPlanningKeys = {
  all: ['staffPlanning'] as const,
  lists: () => [...staffPlanningKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...staffPlanningKeys.lists(), filters] as const,
  details: () => [...staffPlanningKeys.all, 'detail'] as const,
  detail: (id: number) => [...staffPlanningKeys.details(), id] as const,
  withAllocations: (id: number) => [...staffPlanningKeys.detail(id), 'allocations'] as const,
};

/**
 * Main hook for staff planning operations
 */
export function useStaffPlanning() {
  const queryClient = useQueryClient();

  // ========== QUERIES ==========

  /**
   * Fetch all staff plans
   */
  const useStaffPlansList = (statusFilter?: string) => {
    return useQuery({
      queryKey: staffPlanningKeys.list(statusFilter ? { status: statusFilter } : undefined),
      queryFn: async () => {
        const params = new URLSearchParams();
        if (statusFilter) {
          params.append('status_filter', statusFilter);
        }
        // Add trailing slash to avoid 307 redirect from FastAPI
        const url = `${API_BASE}/${params.toString() ? `?${params.toString()}` : ''}`;
        console.log('Fetching staff plans from:', url);
        const response = await apiClient.get<StaffPlan[]>(url);
        console.log('Staff plans response:', response.data);
        return response.data;
      },
    });
  };

  /**
   * Fetch a single staff plan
   */
  const useStaffPlanDetail = (planId: number | null) => {
    return useQuery({
      queryKey: staffPlanningKeys.detail(planId!),
      queryFn: async () => {
        const response = await apiClient.get<StaffPlan>(`${API_BASE}/${planId}`);
        return response.data;
      },
      enabled: !!planId,
    });
  };

  /**
   * Fetch staff plan with all allocations
   */
  const useStaffPlanWithAllocations = (planId: number | null) => {
    return useQuery({
      queryKey: staffPlanningKeys.withAllocations(planId!),
      queryFn: async () => {
        const response = await apiClient.get<StaffPlanWithAllocations>(
          `${API_BASE}/${planId}/with-allocations`
        );
        return response.data;
      },
      enabled: !!planId,
    });
  };

  // ========== MUTATIONS ==========

  /**
   * Create a new staff plan
   */
  const createStaffPlan = useMutation({
    mutationFn: async (data: {
      project_id: string;  // UUID
      project_name: string;
      project_description?: string;
      project_start_date: string;
      duration_months: number;
      overhead_rate: number;
      profit_margin: number;
      annual_escalation_rate: number | null;
    }) => {
      console.log('Creating staff plan:', data);
      const response = await apiClient.post<StaffPlan>(API_BASE, data);
      console.log('Staff plan created:', response.data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Invalidating cache after plan creation');
      queryClient.invalidateQueries({ queryKey: staffPlanningKeys.lists() });
      queryClient.invalidateQueries({ queryKey: staffPlanningKeys.all });
    },
    onError: (error: any) => {
      console.error('Failed to create staff plan:', error);
      console.error('Error details:', error.response?.data);
    }
  });

  /**
   * Update a staff plan
   */
  const updateStaffPlan = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<StaffPlan> }) => {
      const response = await apiClient.put<StaffPlan>(`${API_BASE}/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: staffPlanningKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: staffPlanningKeys.lists() });
    },
  });

  /**
   * Delete a staff plan
   */
  const deleteStaffPlan = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`${API_BASE}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffPlanningKeys.lists() });
    },
  });

  /**
   * Add staff allocation to a plan
   */
  const addStaffAllocation = useMutation({
    mutationFn: async ({
      planId,
      allocation,
    }: {
      planId: number;
      allocation: {
        resource_id: string;  // UUID
        resource_name: string;
        role: string;
        level?: string;
        start_month: number;
        end_month: number;
        hours_per_week: number;
        hourly_rate: number;
        initial_escalation_rate?: number;
        escalation_rate?: number | null;  // Deprecated - use escalation_periods
        escalation_start_month?: number;  // Deprecated - use escalation_periods
        escalation_periods?: EscalationPeriod[];  // New format: multiple escalation periods
        escalation_effective_month?: number;
      };
    }) => {
      const response = await apiClient.post<StaffAllocation>(
        `${API_BASE}/${planId}/allocations`,
        allocation
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffPlanningKeys.withAllocations(variables.planId) });
      queryClient.invalidateQueries({ queryKey: staffPlanningKeys.detail(variables.planId) });
    },
  });

  /**
   * Remove staff allocation from a plan
   */
  const removeStaffAllocation = useMutation({
    mutationFn: async ({ planId, allocationId }: { planId: number; allocationId: number }) => {
      await apiClient.delete(`${API_BASE}/${planId}/allocations/${allocationId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffPlanningKeys.withAllocations(variables.planId) });
      queryClient.invalidateQueries({ queryKey: staffPlanningKeys.detail(variables.planId) });
    },
  });

  return {
    // Queries
    useStaffPlansList,
    useStaffPlanDetail,
    useStaffPlanWithAllocations,

    // Mutations
    createStaffPlan,
    updateStaffPlan,
    deleteStaffPlan,
    addStaffAllocation,
    removeStaffAllocation,

    // Loading states
    isCreating: createStaffPlan.isPending,
    isUpdating: updateStaffPlan.isPending,
    isDeleting: deleteStaffPlan.isPending,
  };
}
