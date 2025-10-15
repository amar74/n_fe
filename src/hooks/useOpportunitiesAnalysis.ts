import { useQuery } from '@tanstack/react-query';
import { opportunitiesApi } from '../services/api/opportunitiesApi';
import { OpportunityAnalytics, OpportunityPipelineResponse } from '../types/opportunities';

/**
 * Hook for opportunities analysis page data
 */
export const useOpportunitiesAnalysis = () => {
  const analyticsQuery = useQuery({
    queryKey: ['opportunities', 'analytics', 30],
    queryFn: () => opportunitiesApi.getOpportunityAnalytics(30),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  const pipelineQuery = useQuery({
    queryKey: ['opportunities', 'pipeline'],
    queryFn: () => opportunitiesApi.getOpportunityPipeline(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });

  const opportunitiesQuery = useQuery({
    queryKey: ['opportunities', 'list', { page: 1, size: 10, sort_by: 'created_at', sort_order: 'desc' }],
    queryFn: () => opportunitiesApi.listOpportunities({ 
      page: 1, 
      size: 10, 
      sort_by: 'created_at', 
      sort_order: 'desc' 
    }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    analytics: analyticsQuery.data,
    pipeline: pipelineQuery.data,
    opportunities: opportunitiesQuery.data?.opportunities || [],
    isLoading: analyticsQuery.isLoading || pipelineQuery.isLoading || opportunitiesQuery.isLoading,
    isError: analyticsQuery.isError || pipelineQuery.isError || opportunitiesQuery.isError,
    error: analyticsQuery.error || pipelineQuery.error || opportunitiesQuery.error,
  };
};