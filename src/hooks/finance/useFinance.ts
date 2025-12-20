import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { createApiClient as createFinanceDashboardApiClient } from '@/types/generated/Finance_Dashboard';
import { createApiClient as createFinancePlanningApiClient } from '@/types/generated/Finance_Planning';
import { useToast } from '@/hooks/shared';

import axios from 'axios';
import { STORAGE_CONSTANTS } from '@/constants/storageConstants';

const RESOLVED_BASE_FROM_ENV = import.meta.env.VITE_API_BASE_URL;
const isLocalHostRuntime =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Prefer local API when running the app on localhost to avoid accidental live calls
const LOCAL_DEFAULT_BASE = 'http://127.0.0.1:8000';

// If running locally and env points to the known live IP, override to local for safety
const looksLikeLiveIp =
  typeof RESOLVED_BASE_FROM_ENV === 'string' && /52\.55\.26\.148/.test(RESOLVED_BASE_FROM_ENV);

const BASE_URL =
  (isLocalHostRuntime && (!RESOLVED_BASE_FROM_ENV || looksLikeLiveIp))
    ? LOCAL_DEFAULT_BASE
    : (RESOLVED_BASE_FROM_ENV || LOCAL_DEFAULT_BASE);

// The generated paths are like /api/api/v1/finance/... so we need baseURL without /api
const financeApiClient = axios.create({
  baseURL: BASE_URL, // No /api prefix - generated paths already include it
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
});

// Add auth interceptor
financeApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_CONSTANTS.AUTH_TOKEN);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { financeApiClient };

export function useFinanceAIAnalysis(businessUnit?: string | null) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const url = businessUnit
        ? `/api/v1/finance/dashboard/ai-analysis?business_unit=${businessUnit}`
        : '/api/v1/finance/dashboard/ai-analysis';
      const response = await financeApiClient.post(url);
      return response.data;
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to generate AI analysis';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
}

financeApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login or refresh token
      localStorage.removeItem(STORAGE_CONSTANTS.AUTH_TOKEN);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Initialize API clients with financeApiClient (no /api prefix in baseURL)
const financeDashboardApi = createFinanceDashboardApiClient(BASE_URL, { axiosInstance: financeApiClient });
const financePlanningApi = createFinancePlanningApiClient(BASE_URL, { axiosInstance: financeApiClient });

// Query keys
export const financeKeys = {
  all: ['finance'] as const,
  dashboard: () => [...financeKeys.all, 'dashboard'] as const,
  summary: (businessUnit?: string | null) => [...financeKeys.dashboard(), 'summary', businessUnit] as const,
  overhead: (businessUnit?: string | null) => [...financeKeys.dashboard(), 'overhead', businessUnit] as const,
  revenue: (businessUnit?: string | null) => [...financeKeys.dashboard(), 'revenue', businessUnit] as const,
  bookings: (businessUnit?: string | null) => [...financeKeys.dashboard(), 'bookings', businessUnit] as const,
  trends: (businessUnit?: string | null) => [...financeKeys.dashboard(), 'trends', businessUnit] as const,
  aiAnalysis: (businessUnit?: string | null) => [...financeKeys.dashboard(), 'ai-analysis', businessUnit] as const,
  planning: () => [...financeKeys.all, 'planning'] as const,
  annual: () => [...financeKeys.planning(), 'annual'] as const,
  scenarios: () => [...financeKeys.planning(), 'scenarios'] as const,
  forecasts: () => [...financeKeys.planning(), 'forecasts'] as const,
  approvals: (budgetId?: number) => [...financeKeys.planning(), 'approvals', budgetId] as const,
};

export function useFinanceDashboardSummary(businessUnit?: string | null) {
  return useQuery({
    queryKey: financeKeys.summary(businessUnit),
    queryFn: async () => {
      // Use axios directly to avoid double /api prefix issue
      const url = businessUnit 
        ? `/api/v1/finance/dashboard/summary?business_unit=${businessUnit}`
        : '/api/v1/finance/dashboard/summary';
      const response = await financeApiClient.get(url);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useFinanceOverhead(businessUnit?: string | null) {
  return useQuery({
    queryKey: financeKeys.overhead(businessUnit),
    queryFn: async () => {
      const url = businessUnit
        ? `/api/v1/finance/dashboard/overhead?business_unit=${businessUnit}`
        : '/api/v1/finance/dashboard/overhead';
      const response = await financeApiClient.get(url);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useFinanceRevenue(businessUnit?: string | null) {
  return useQuery({
    queryKey: financeKeys.revenue(businessUnit),
    queryFn: async () => {
      const url = businessUnit
        ? `/api/v1/finance/dashboard/revenue?business_unit=${businessUnit}`
        : '/api/v1/finance/dashboard/revenue';
      const response = await financeApiClient.get(url);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useFinanceBookings(businessUnit?: string | null) {
  return useQuery({
    queryKey: financeKeys.bookings(businessUnit),
    queryFn: async () => {
      const url = businessUnit
        ? `/api/v1/finance/dashboard/bookings?business_unit=${businessUnit}`
        : '/api/v1/finance/dashboard/bookings';
      const response = await financeApiClient.get(url);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useFinanceTrends(businessUnit?: string | null) {
  return useQuery({
    queryKey: financeKeys.trends(businessUnit),
    queryFn: async () => {
      const url = businessUnit
        ? `/api/v1/finance/dashboard/trends?business_unit=${businessUnit}`
        : '/api/v1/finance/dashboard/trends';
      const response = await financeApiClient.get(url);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useFinancePlanningAnnual(budgetYear?: string) {
  return useQuery({
    queryKey: budgetYear ? [...financeKeys.annual(), budgetYear] : financeKeys.annual(),
    queryFn: async () => {
      // Use axios directly to fix the double /api issue
      const url = budgetYear
        ? `/api/v1/finance/planning/annual?budget_year=${budgetYear}`
        : '/api/v1/finance/planning/annual';
      const response = await financeApiClient.get(url);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useFinancePlanningScenarios() {
  return useQuery({
    queryKey: financeKeys.scenarios(),
    queryFn: async () => {
      // Use axios directly to fix the double /api issue
      const response = await financeApiClient.get('/api/v1/finance/planning/scenarios');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSaveAnnualBudget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (budgetData: {
      budget_year: string;
      target_growth_rate: number;
      total_revenue_target: number;
      total_expense_budget: number;
      revenue_lines: Array<{ label: string; target: number; variance: number }>;
      expense_lines: Array<{ label: string; target: number; variance: number }>;
      business_units?: Array<{ name: string; revenue: number; expense: number; profit: number; headcount: number; margin_percent: number }>;
    }) => {
      // The generated client doesn't have POST endpoint yet, so we'll use axios directly
      const response = await financeApiClient.post('/api/v1/finance/planning/annual', budgetData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate all annual budget queries (with and without specific year)
      queryClient.invalidateQueries({ queryKey: financeKeys.annual() });
      // Also invalidate dashboard queries that depend on budget data
      queryClient.invalidateQueries({ queryKey: financeKeys.dashboard() });
      // Specifically invalidate overhead and revenue queries
      queryClient.invalidateQueries({ queryKey: financeKeys.overhead() });
      queryClient.invalidateQueries({ queryKey: financeKeys.revenue() });
    },
  });
}

export function useUpdateAnnualBudget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: {
      budget_year?: string;
      budget_data: {
        target_growth_rate?: number;
        total_revenue_target?: number;
        total_expense_budget?: number;
        revenue_lines?: Array<{ label: string; target: number; variance: number }>;
        expense_lines?: Array<{ label: string; target: number; variance: number }>;
        status?: string;
      };
    }) => {
      const { budget_year, budget_data } = params;
      const url = budget_year
        ? `/api/v1/finance/planning/annual?budget_year=${budget_year}`
        : '/api/v1/finance/planning/annual';
      const response = await financeApiClient.patch(url, budget_data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.annual() });
    },
  });
}

export function useUpdatePlanningConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (configData: {
      planning_period_years?: number;
      base_year_revenue?: number;
      base_year_expenses?: number;
    }) => {
      const response = await financeApiClient.patch('/api/v1/finance/planning/scenarios/config', configData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.scenarios() });
    },
  });
}

export function useUpdateScenario() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: {
      scenario_key: string;
      scenario_data: {
        name?: string;
        description?: string;
        growth_rates?: number[];
        investment_level?: string;
        bonus_threshold?: number;
        risk_level?: string;
        active?: boolean;
        risks?: string[];
        opportunities?: string[];
      };
    }) => {
      const { scenario_key, scenario_data } = params;
      const response = await financeApiClient.patch(
        `/api/v1/finance/planning/scenarios/${scenario_key}`,
        scenario_data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.scenarios() });
    },
  });
}

export function useGenerateForecast() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: {
      forecast_name?: string;
      forecasting_model: string;
      forecast_period_months: number;
      market_growth_rate: number;
      inflation_rate: number;
      seasonal_adjustment: boolean;
    }) => {
      // Increase timeout for AI forecast generation (60 seconds)
      const response = await financeApiClient.post('/api/v1/finance/planning/forecasts/generate', params, {
        timeout: 60000,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.forecasts() });
    },
  });
}

export function useForecasts() {
  return useQuery({
    queryKey: financeKeys.forecasts(),
    queryFn: async () => {
      const response = await financeApiClient.get('/api/v1/finance/planning/forecasts');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useExportForecast() {
  return useMutation({
    mutationFn: async (params: { forecast_id: number; format: 'csv' | 'json' }) => {
      const response = await financeApiClient.get(
        `/api/v1/finance/planning/forecasts/${params.forecast_id}/export?format=${params.format}`,
        { responseType: 'blob' }
      );
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `forecast_${params.forecast_id}_${new Date().toISOString().split('T')[0]}.${params.format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response.data;
    },
  });
}

// Budget Approval Workflow Hooks

export function useBudgetApprovals(budgetId: number | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useQuery({
    queryKey: financeKeys.approvals(budgetId),
    queryFn: async () => {
      if (!budgetId) throw new Error('Budget ID is required');
      const response = await financeApiClient.get(`/api/v1/finance/planning/annual/${budgetId}/approvals`);
      return response.data;
    },
    enabled: !!budgetId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useSaveVarianceExplanations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: {
      budgetId: number;
      explanations: Array<{
        category: 'revenue' | 'expense' | 'profit';
        explanation: string;
        rootCause: string;
        actionPlan: string;
      }>;
    }) => {
      const response = await financeApiClient.post(
        `/api/v1/finance/planning/annual/${data.budgetId}/variance-explanations`,
        { explanations: data.explanations }
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate annual budget query to refresh with new explanations
      queryClient.invalidateQueries({ queryKey: financeKeys.annual() });
      toast({
        title: 'Success',
        description: 'Variance explanations saved successfully',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to save variance explanations';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
}

export function useSubmitBudgetForApproval() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (budgetId: number) => {
      const response = await financeApiClient.post(`/api/v1/finance/planning/annual/${budgetId}/submit`);
      return response.data;
    },
    onSuccess: (data, budgetId) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.approvals(budgetId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.annual() });
      toast({
        title: 'Success',
        description: 'Budget submitted for approval successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to submit budget for approval',
        variant: 'destructive',
      });
    },
  });
}

export function useProcessApprovalAction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ budgetId, stageId, action, comments }: { budgetId: number; stageId: number; action: string; comments?: string }) => {
      const response = await financeApiClient.post(
        `/api/v1/finance/planning/annual/${budgetId}/approve`,
        { stage_id: stageId, action, comments }
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.approvals(variables.budgetId) });
      queryClient.invalidateQueries({ queryKey: financeKeys.annual() });
      toast({
        title: 'Success',
        description: `Budget ${variables.action === 'approve' ? 'approved' : variables.action === 'reject' ? 'rejected' : 'changes requested'} successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to process approval action',
        variant: 'destructive',
      });
    },
  });
}
