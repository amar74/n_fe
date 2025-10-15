import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

import { opportunitiesApi } from '../services/api/opportunitiesApi';
import {
  Opportunity,
  CreateOpportunityRequest,
  UpdateOpportunityRequest,
  OpportunityListResponse,
  UpdateStageRequest,
  OpportunityAnalytics,
  OpportunityPipelineResponse,
  OpportunitySearchRequest,
  OpportunitySearchResult,
  OpportunityInsightsResponse,
  OpportunityForecastResponse,
  OpportunityListParams,
  OpportunityStage,
  RiskLevel
} from '../types/opportunities';

const OPPORTUNITY_QUERY_KEYS = {
  all: ['opportunities'] as const,
  lists: () => [...OPPORTUNITY_QUERY_KEYS.all, 'list'] as const,
  list: (params: OpportunityListParams) => [...OPPORTUNITY_QUERY_KEYS.lists(), params] as const,
  details: () => [...OPPORTUNITY_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...OPPORTUNITY_QUERY_KEYS.details(), id] as const,
  analytics: (days: number) => [...OPPORTUNITY_QUERY_KEYS.all, 'analytics', days] as const,
  pipeline: () => [...OPPORTUNITY_QUERY_KEYS.all, 'pipeline'] as const,
  insights: (id: string) => [...OPPORTUNITY_QUERY_KEYS.all, 'insights', id] as const,
  forecast: (id: string, period: string) => [...OPPORTUNITY_QUERY_KEYS.all, 'forecast', id, period] as const,
  search: (query: string) => [...OPPORTUNITY_QUERY_KEYS.all, 'search', query] as const,
};

/**
 * Hook for listing opportunities with pagination and filtering
 */
export const useOpportunities = (params: OpportunityListParams = {}) => {
  return useQuery({
    queryKey: OPPORTUNITY_QUERY_KEYS.list(params),
    queryFn: () => opportunitiesApi.listOpportunities(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook for getting a single opportunity by ID
 */
export const useOpportunity = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: OPPORTUNITY_QUERY_KEYS.detail(id),
    queryFn: () => opportunitiesApi.getOpportunity(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Hook for creating a new opportunity
 */
export const useCreateOpportunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOpportunityRequest) => opportunitiesApi.createOpportunity(data),
    onSuccess: (newOpportunity) => {
      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_QUERY_KEYS.lists() });
      
      // Add the new opportunity to the cache
      queryClient.setQueryData(
        OPPORTUNITY_QUERY_KEYS.detail(newOpportunity.id),
        newOpportunity
      );

      toast.success(`Opportunity "${newOpportunity.project_name}" created successfully`);
    },
    onError: (error: any) => {
      toast.error('create failed');
    },
  });
};

/**
 * Hook for updating an opportunity
 */
export const useUpdateOpportunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOpportunityRequest }) =>
      opportunitiesApi.updateOpportunity(id, data),
    onSuccess: (updatedOpportunity) => {
      // Update the specific opportunity in cache
      queryClient.setQueryData(
        OPPORTUNITY_QUERY_KEYS.detail(updatedOpportunity.id),
        updatedOpportunity
      );

      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_QUERY_KEYS.lists() });

      toast.success(`Opportunity "${updatedOpportunity.project_name}" updated successfully`);
    },
    onError: (error: any) => {
      toast.error('update failed');
    },
  });
};

/**
 * Hook for deleting an opportunity
 */
export const useDeleteOpportunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => opportunitiesApi.deleteOpportunity(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: OPPORTUNITY_QUERY_KEYS.detail(deletedId) });
      
      // Invalidate opportunities list
      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_QUERY_KEYS.lists() });

      toast.success('Opportunity deleted successfully');
    },
    onError: (error: any) => {
      toast.error('delete failed');
    },
  });
};

/**
 * Hook for updating opportunity stage
 */
export const useUpdateOpportunityStage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStageRequest }) =>
      opportunitiesApi.updateOpportunityStage(id, data),
    onSuccess: (updatedOpportunity) => {
      // Update the specific opportunity in cache
      queryClient.setQueryData(
        OPPORTUNITY_QUERY_KEYS.detail(updatedOpportunity.id),
        updatedOpportunity
      );

      // Invalidate opportunities list and pipeline
      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_QUERY_KEYS.pipeline() });

      toast.success(`Opportunity stage updated to ${updatedOpportunity.stage}`);
    },
    onError: (error: any) => {
      toast.error('update failed stage');
    },
  });
};

/**
 * Hook for getting opportunity analytics
 */
export const useOpportunityAnalytics = (days: number = 30) => {
  return useQuery({
    queryKey: OPPORTUNITY_QUERY_KEYS.analytics(days),
    queryFn: () => opportunitiesApi.getOpportunityAnalytics(days),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * Hook for getting opportunity pipeline
 */
export const useOpportunityPipeline = () => {
  return useQuery({
    queryKey: OPPORTUNITY_QUERY_KEYS.pipeline(),
    queryFn: () => opportunitiesApi.getOpportunityPipeline(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

/**
 * Hook for AI-powered opportunity search
 */
export const useOpportunitySearch = () => {
  return useMutation({
    mutationFn: (data: OpportunitySearchRequest) => opportunitiesApi.searchOpportunities(data),
    onError: (error: any) => {
      toast.error('Search failed');
    },
  });
};

/**
 * Hook for getting opportunity insights
 */
export const useOpportunityInsights = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: OPPORTUNITY_QUERY_KEYS.insights(id),
    queryFn: () => opportunitiesApi.getOpportunityInsights(id),
    enabled: enabled && !!id,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * Hook for getting opportunity forecast
 */
export const useOpportunityForecast = (id: string, period: 'monthly' | 'quarterly' | 'yearly' = 'quarterly') => {
  return useQuery({
    queryKey: OPPORTUNITY_QUERY_KEYS.forecast(id, period),
    queryFn: () => opportunitiesApi.getOpportunityForecast(id, period),
    enabled: !!id,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

/**
 * Hook for exporting opportunities
 */
export const useExportOpportunities = () => {
  return useMutation({
    mutationFn: (stage?: string) => opportunitiesApi.exportOpportunities(stage),
    onSuccess: (result) => {
      toast.success(result.message);
      if (result.download_url) {
        window.open(result.download_url, '_blank');
      }
    },
    onError: (error: any) => {
      toast.error('export failed');
    },
  });
};

/**
 * Hook for batch operations
 */
export const useBatchOpportunityOperations = () => {
  const queryClient = useQueryClient();

  const batchUpdateStage = useMutation({
    mutationFn: ({ opportunityIds, stage, notes }: { 
      opportunityIds: string[]; 
      stage: OpportunityStage; 
      notes?: string 
    }) => opportunitiesApi.batchUpdateStage(opportunityIds, stage, notes),
    onSuccess: (updatedOpportunities) => {
      // Update each opportunity in cache
      updatedOpportunities.forEach(opportunity => {
        queryClient.setQueryData(
          OPPORTUNITY_QUERY_KEYS.detail(opportunity.id),
          opportunity
        );
      });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_QUERY_KEYS.pipeline() });

      toast.success(`${updatedOpportunities.length} opportunities updated successfully`);
    },
    onError: (error: any) => {
      toast.error('batch failed opportunities');
    },
  });

  const batchDelete = useMutation({
    mutationFn: (opportunityIds: string[]) => opportunitiesApi.batchDelete(opportunityIds),
    onSuccess: (_, deletedIds) => {
      // Remove from cache
      deletedIds.forEach(id => {
        queryClient.removeQueries({ queryKey: OPPORTUNITY_QUERY_KEYS.detail(id) });
      });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_QUERY_KEYS.pipeline() });

      toast.success(`${deletedIds.length} opportunities deleted sucessfully`);
    },
    onError: (error: any) => {
      toast.error('batch failed opportunities');
    },
  });

  return {
    batchUpdateStage,
    batchDelete,
  };
};

/**
 * Custom hook for opportunity form state management
 */
export const useOpportunityForm = (initialData?: Partial<Opportunity>) => {
  const [formData, setFormData] = useState({
    project_name: initialData?.project_name || '',
    client_name: initialData?.client_name || '',
    description: initialData?.description || '',
    stage: initialData?.stage || OpportunityStage.LEAD,
    risk_level: initialData?.risk_level || '',
    project_value: initialData?.project_value?.toString() || '',
    currency: initialData?.currency || 'USD',
    my_role: initialData?.my_role || '',
    team_size: initialData?.team_size?.toString() || '',
    expected_rfp_date: initialData?.expected_rfp_date?.split('T')[0] || '',
    deadline: initialData?.deadline?.split('T')[0] || '',
    state: initialData?.state || '',
    market_sector: initialData?.market_sector || '',
    match_score: initialData?.match_score?.toString() || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.project_name.trim()) {
      newErrors.project_name = 'Project name is required';
    }

    if (!formData.client_name.trim()) {
      newErrors.client_name = 'Client name is required';
    }

    if (formData.project_value && (isNaN(Number(formData.project_value)) || Number(formData.project_value) < 0)) {
      newErrors.project_value = 'Project value must be a positive number';
    }

    if (formData.team_size && (isNaN(Number(formData.team_size)) || Number(formData.team_size) < 1)) {
      newErrors.team_size = 'Team size must be a positive number';
    }

    if (formData.match_score && (isNaN(Number(formData.match_score)) || Number(formData.match_score) < 0 || Number(formData.match_score) > 100)) {
      newErrors.match_score = 'Match score must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({
      project_name: '',
      client_name: '',
      description: '',
      stage: OpportunityStage.LEAD,
      risk_level: '',
      project_value: '',
      currency: 'USD',
      my_role: '',
      team_size: '',
      expected_rfp_date: '',
      deadline: '',
      state: '',
      market_sector: '',
      match_score: '',
    });
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    updateField,
    validateForm,
    resetForm,
  };
};