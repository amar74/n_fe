import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { opportunitiesApi } from '../services/api/opportunitiesApi';

const OPPORTUNITY_TAB_QUERY_KEYS = {
  all: (id: string) => ['opportunity-tabs', id] as const,
  overview: (id: string) => [...OPPORTUNITY_TAB_QUERY_KEYS.all(id), 'overview'] as const,
  stakeholders: (id: string) => [...OPPORTUNITY_TAB_QUERY_KEYS.all(id), 'stakeholders'] as const,
  drivers: (id: string) => [...OPPORTUNITY_TAB_QUERY_KEYS.all(id), 'drivers'] as const,
  competitors: (id: string) => [...OPPORTUNITY_TAB_QUERY_KEYS.all(id), 'competitors'] as const,
  strategies: (id: string) => [...OPPORTUNITY_TAB_QUERY_KEYS.all(id), 'strategies'] as const,
  deliveryModel: (id: string) => [...OPPORTUNITY_TAB_QUERY_KEYS.all(id), 'delivery-model'] as const,
  teamMembers: (id: string) => [...OPPORTUNITY_TAB_QUERY_KEYS.all(id), 'team-members'] as const,
  references: (id: string) => [...OPPORTUNITY_TAB_QUERY_KEYS.all(id), 'references'] as const,
  financial: (id: string) => [...OPPORTUNITY_TAB_QUERY_KEYS.all(id), 'financial'] as const,
  risks: (id: string) => [...OPPORTUNITY_TAB_QUERY_KEYS.all(id), 'risks'] as const,
  legalChecklist: (id: string) => [...OPPORTUNITY_TAB_QUERY_KEYS.all(id), 'legal-checklist'] as const,
  allTabs: (id: string) => [...OPPORTUNITY_TAB_QUERY_KEYS.all(id), 'all-tabs'] as const,
};

export const useOpportunityOverview = (opportunityId: string) => {
  return useQuery({
    queryKey: OPPORTUNITY_TAB_QUERY_KEYS.overview(opportunityId),
    queryFn: () => opportunitiesApi.getOpportunityOverview(opportunityId),
    enabled: !!opportunityId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateOpportunityOverview = (opportunityId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => opportunitiesApi.updateOpportunityOverview(opportunityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_TAB_QUERY_KEYS.overview(opportunityId) });
      toast.success('Overview updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update overview');
    },
  });
};

export const useOpportunityStakeholders = (opportunityId: string) => {
  return useQuery({
    queryKey: OPPORTUNITY_TAB_QUERY_KEYS.stakeholders(opportunityId),
    queryFn: () => opportunitiesApi.getOpportunityStakeholders(opportunityId),
    enabled: !!opportunityId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateOpportunityStakeholder = (opportunityId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => opportunitiesApi.createOpportunityStakeholder(opportunityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_TAB_QUERY_KEYS.stakeholders(opportunityId) });
      toast.success('Stakeholder added successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to add stakeholder');
    },
  });
};

export const useUpdateOpportunityStakeholder = (opportunityId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ stakeholderId, data }: { stakeholderId: string; data: any }) => 
      opportunitiesApi.updateOpportunityStakeholder(opportunityId, stakeholderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_TAB_QUERY_KEYS.stakeholders(opportunityId) });
      toast.success('Stakeholder updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update stakeholder');
    },
  });
};

export const useDeleteOpportunityStakeholder = (opportunityId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (stakeholderId: string) => opportunitiesApi.deleteOpportunityStakeholder(opportunityId, stakeholderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_TAB_QUERY_KEYS.stakeholders(opportunityId) });
      toast.success('Stakeholder deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete stakeholder');
    },
  });
};

export const useOpportunityDrivers = (opportunityId: string) => {
  return useQuery({
    queryKey: OPPORTUNITY_TAB_QUERY_KEYS.drivers(opportunityId),
    queryFn: () => opportunitiesApi.getOpportunityDrivers(opportunityId),
    enabled: !!opportunityId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateOpportunityDriver = (opportunityId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => opportunitiesApi.createOpportunityDriver(opportunityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_TAB_QUERY_KEYS.drivers(opportunityId) });
      toast.success('Driver added successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to add driver');
    },
  });
};

export const useOpportunityCompetitors = (opportunityId: string) => {
  return useQuery({
    queryKey: OPPORTUNITY_TAB_QUERY_KEYS.competitors(opportunityId),
    queryFn: () => opportunitiesApi.getOpportunityCompetitors(opportunityId),
    enabled: !!opportunityId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateOpportunityCompetitor = (opportunityId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => opportunitiesApi.createOpportunityCompetitor(opportunityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_TAB_QUERY_KEYS.competitors(opportunityId) });
      toast.success('Competitor added successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to add competitor');
    },
  });
};

export const useOpportunityStrategies = (opportunityId: string) => {
  return useQuery({
    queryKey: OPPORTUNITY_TAB_QUERY_KEYS.strategies(opportunityId),
    queryFn: () => opportunitiesApi.getOpportunityStrategies(opportunityId),
    enabled: !!opportunityId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateOpportunityStrategy = (opportunityId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => opportunitiesApi.createOpportunityStrategy(opportunityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_TAB_QUERY_KEYS.strategies(opportunityId) });
      toast.success('Strategy added successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to add strategy');
    },
  });
};

export const useOpportunityDeliveryModel = (opportunityId: string) => {
  return useQuery({
    queryKey: OPPORTUNITY_TAB_QUERY_KEYS.deliveryModel(opportunityId),
    queryFn: () => opportunitiesApi.getOpportunityDeliveryModel(opportunityId),
    enabled: !!opportunityId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateOpportunityDeliveryModel = (opportunityId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => opportunitiesApi.updateOpportunityDeliveryModel(opportunityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_TAB_QUERY_KEYS.deliveryModel(opportunityId) });
      toast.success('Delivery model updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update delivery model');
    },
  });
};

export const useOpportunityTeamMembers = (opportunityId: string) => {
  return useQuery({
    queryKey: OPPORTUNITY_TAB_QUERY_KEYS.teamMembers(opportunityId),
    queryFn: () => opportunitiesApi.getOpportunityTeamMembers(opportunityId),
    enabled: !!opportunityId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateOpportunityTeamMember = (opportunityId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => opportunitiesApi.createOpportunityTeamMember(opportunityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_TAB_QUERY_KEYS.teamMembers(opportunityId) });
      toast.success('Team member added successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to add team member');
    },
  });
};

export const useOpportunityReferences = (opportunityId: string) => {
  return useQuery({
    queryKey: OPPORTUNITY_TAB_QUERY_KEYS.references(opportunityId),
    queryFn: () => opportunitiesApi.getOpportunityReferences(opportunityId),
    enabled: !!opportunityId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateOpportunityReference = (opportunityId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => opportunitiesApi.createOpportunityReference(opportunityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_TAB_QUERY_KEYS.references(opportunityId) });
      toast.success('Reference added successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to add reference');
    },
  });
};

export const useOpportunityFinancialSummary = (opportunityId: string) => {
  return useQuery({
    queryKey: OPPORTUNITY_TAB_QUERY_KEYS.financial(opportunityId),
    queryFn: () => opportunitiesApi.getOpportunityFinancialSummary(opportunityId),
    enabled: !!opportunityId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateOpportunityFinancialSummary = (opportunityId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => opportunitiesApi.updateOpportunityFinancialSummary(opportunityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_TAB_QUERY_KEYS.financial(opportunityId) });
      toast.success('Financial summary updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update financial summary');
    },
  });
};

export const useOpportunityRisks = (opportunityId: string) => {
  return useQuery({
    queryKey: OPPORTUNITY_TAB_QUERY_KEYS.risks(opportunityId),
    queryFn: () => opportunitiesApi.getOpportunityRisks(opportunityId),
    enabled: !!opportunityId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateOpportunityRisk = (opportunityId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => opportunitiesApi.createOpportunityRisk(opportunityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_TAB_QUERY_KEYS.risks(opportunityId) });
      toast.success('Risk added successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to add risk');
    },
  });
};

export const useOpportunityLegalChecklist = (opportunityId: string) => {
  return useQuery({
    queryKey: OPPORTUNITY_TAB_QUERY_KEYS.legalChecklist(opportunityId),
    queryFn: () => opportunitiesApi.getOpportunityLegalChecklist(opportunityId),
    enabled: !!opportunityId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateOpportunityLegalChecklistItem = (opportunityId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => opportunitiesApi.createOpportunityLegalChecklistItem(opportunityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_TAB_QUERY_KEYS.legalChecklist(opportunityId) });
      toast.success('Legal checklist item added successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to add legal checklist item');
    },
  });
};

export const useAllOpportunityTabData = (opportunityId: string) => {
  return useQuery({
    queryKey: OPPORTUNITY_TAB_QUERY_KEYS.allTabs(opportunityId),
    queryFn: () => opportunitiesApi.getAllOpportunityTabData(opportunityId),
    enabled: !!opportunityId,
    staleTime: 5 * 60 * 1000,
  });
};