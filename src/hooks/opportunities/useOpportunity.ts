import { useQuery } from '@tanstack/react-query';
import { opportunitiesApi } from '@/services/api/opportunitiesApi';
import { Opportunity } from '@/types/opportunities';

// @author abhishek.softication
export function useOpportunity(opportunityId: string | undefined) {
  return useQuery({
    queryKey: ['opportunity', opportunityId],
    queryFn: () => opportunitiesApi.getOpportunity(opportunityId!),
    enabled: !!opportunityId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}