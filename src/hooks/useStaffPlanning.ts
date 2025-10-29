/**
 * TanStack Query Hook for Staff Planning API
 * Handles CRUD operations for staffing plans and allocations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// ========== Query Keys ==========
export const staffPlanningKeys = {
  all: ['staff-planning'] as const,
  plans: () => [...staffPlanningKeys.all, 'plans'] as const,
  plan: (id: number) => [...staffPlanningKeys.all, 'plan', id] as const,
  allocations: (planId: number) => [...staffPlanningKeys.all, 'allocations', planId] as const,
  dashboard: () => [...staffPlanningKeys.all, 'dashboard'] as const,
  utilization: (resourceId: number) => [...staffPlanningKeys.all, 'utilization', resourceId] as const,
};

// ========== Types ==========
export interface StaffPlan {
  id: number;
  projectId: number;
  projectName: string;
  projectDescription?: string;
  projectStartDate: string;
  durationMonths: number;
  overheadRate: number;
  profitMargin: number;
  annualEscalationRate: number;
  totalLaborCost: number;
  totalOverhead: number;
  totalCost: number;
  totalProfit: number;
  totalPrice: number;
  yearlyBreakdown?: any;
  status: 'draft' | 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface StaffAllocation {
  id: number;
  staffPlanId: number;
  resourceId: number;
  resourceName: string;
  role: string;
  level: string;
  startMonth: number;
  endMonth: number;
  hoursPerWeek: number;
  allocationPercentage: number;
  hourlyRate: number;
  monthlyCost: number;
  totalCost: number;
  status: string;
}

export interface CreateStaffPlanData {
  projectId: number;
  projectName: string;
  projectDescription?: string;
  projectStartDate: string;
  durationMonths: number;
  overheadRate: number;
  profitMargin: number;
  annualEscalationRate: number;
}

export interface CreateStaffAllocationData {
  staffPlanId: number;
  resourceId: number;
  resourceName: string;
  role: string;
  level: string;
  startMonth: number;
  endMonth: number;
  hoursPerWeek: number;
  allocationPercentage: number;
  hourlyRate: number;
}

// ========== Main Hook ==========
export function useStaffPlanning() {
  const queryClient = useQueryClient();

  // Query: Get all staff plans
  const { data: staffPlans, isLoading: isLoadingPlans } = useQuery({
    queryKey: staffPlanningKeys.plans(),
    queryFn: async () => {
      const response = await apiClient.get<StaffPlan[]>(`${BASE_URL}/api/staff-planning/plans`);
      return response.data;
    },
  });

  // Query: Get dashboard summary
  const { data: dashboardData, isLoading: isLoadingDashboard } = useQuery({
    queryKey: staffPlanningKeys.dashboard(),
    queryFn: async () => {
      const response = await apiClient.get(`${BASE_URL}/api/staff-planning/dashboard`);
      return response.data;
    },
  });

  // Mutation: Create staff plan
  const createPlanMutation = useMutation({
    mutationFn: async (data: CreateStaffPlanData) => {
      const response = await apiClient.post<StaffPlan>(`${BASE_URL}/api/staff-planning/plans`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffPlanningKeys.plans() });
      queryClient.invalidateQueries({ queryKey: staffPlanningKeys.dashboard() });
    },
  });

  // Mutation: Update staff plan
  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateStaffPlanData> }) => {
      const response = await apiClient.patch<StaffPlan>(`${BASE_URL}/api/staff-planning/plans/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffPlanningKeys.plan(variables.id) });
      queryClient.invalidateQueries({ queryKey: staffPlanningKeys.plans() });
    },
  });

  // Mutation: Delete staff plan
  const deletePlanMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`${BASE_URL}/api/staff-planning/plans/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffPlanningKeys.plans() });
      queryClient.invalidateQueries({ queryKey: staffPlanningKeys.dashboard() });
    },
  });

  // Mutation: Add staff allocation
  const addStaffMutation = useMutation({
    mutationFn: async (data: CreateStaffAllocationData) => {
      const response = await apiClient.post<StaffAllocation>(
        `${BASE_URL}/api/staff-planning/allocations`,
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: staffPlanningKeys.allocations(data.staffPlanId) });
      queryClient.invalidateQueries({ queryKey: staffPlanningKeys.plan(data.staffPlanId) });
    },
  });

  // Mutation: Remove staff allocation
  const removeStaffMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`${BASE_URL}/api/staff-planning/allocations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffPlanningKeys.all });
    },
  });

  return {
    // Queries
    staffPlans: staffPlans || [],
    dashboardData,
    isLoadingPlans,
    isLoadingDashboard,

    // Mutations
    createPlan: createPlanMutation.mutateAsync,
    updatePlan: updatePlanMutation.mutateAsync,
    deletePlan: deletePlanMutation.mutateAsync,
    addStaff: addStaffMutation.mutateAsync,
    removeStaff: removeStaffMutation.mutateAsync,

    // Mutation states
    isCreating: createPlanMutation.isPending,
    isUpdating: updatePlanMutation.isPending,
    isDeleting: deletePlanMutation.isPending,
  };
}

// ========== Individual Plan Hook ==========
export function useStaffPlan(planId: number) {
  const queryClient = useQueryClient();

  // Query: Get specific plan
  const { data: plan, isLoading } = useQuery({
    queryKey: staffPlanningKeys.plan(planId),
    queryFn: async () => {
      const response = await apiClient.get<StaffPlan>(`${BASE_URL}/api/staff-planning/plans/${planId}`);
      return response.data;
    },
    enabled: !!planId,
  });

  // Query: Get plan allocations
  const { data: allocations, isLoading: isLoadingAllocations } = useQuery({
    queryKey: staffPlanningKeys.allocations(planId),
    queryFn: async () => {
      const response = await apiClient.get<StaffAllocation[]>(
        `${BASE_URL}/api/staff-planning/plans/${planId}/allocations`
      );
      return response.data;
    },
    enabled: !!planId,
  });

  return {
    plan,
    allocations: allocations || [],
    isLoading,
    isLoadingAllocations,
  };
}

// ========== Resource Utilization Hook ==========
export function useResourceUtilization(resourceId: number) {
  const { data: utilization, isLoading } = useQuery({
    queryKey: staffPlanningKeys.utilization(resourceId),
    queryFn: async () => {
      const response = await apiClient.get(`${BASE_URL}/api/staff-planning/utilization/${resourceId}`);
      return response.data;
    },
    enabled: !!resourceId,
  });

  return {
    utilization,
    isLoading,
  };
}

