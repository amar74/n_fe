import { useQuery } from '@tanstack/react-query';
import { opportunitiesApi } from '@/services/api/opportunitiesApi';
import { OpportunityAnalytics, OpportunityPipelineResponse } from '@/types/opportunities';

/**
 * Hook for opportunities analysis page data
 */
export const useOpportunitiesAnalysis = () => {
  const analyticsQuery = useQuery({
    queryKey: ['opportunities', 'analytics', 30],
    queryFn: async () => {
      try {
        return await opportunitiesApi.getOpportunityAnalytics(30);
      } catch (error: any) {
        // Handle 403 gracefully - user doesn't have permission
        if (error.response?.status === 403) {
          return null;
        }
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: false, // Don't retry on 403 errors
  });

  const pipelineQuery = useQuery({
    queryKey: ['opportunities', 'pipeline'],
    queryFn: async () => {
      try {
        return await opportunitiesApi.getOpportunityPipeline();
      } catch (error: any) {
        // Handle 403 gracefully - user doesn't have permission
        if (error.response?.status === 403) {
          return { stages: [], total_opportunities: 0, total_value: 0 };
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: false, // Don't retry on 403 errors
  });

  const opportunitiesQuery = useQuery({
    queryKey: ['opportunities', 'list', { page: 1, size: 10, sort_by: 'created_at', sort_order: 'desc' }],
    queryFn: async () => {
      try {
        return await opportunitiesApi.listOpportunities({ 
          page: 1, 
          size: 10, 
          sort_by: 'created_at', 
          sort_order: 'desc' 
        });
      } catch (error: any) {
        // Handle 403 gracefully - user doesn't have permission
        if (error.response?.status === 403) {
          return { opportunities: [], total: 0, page: 1, size: 10 };
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false, // Don't retry on 403 errors
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