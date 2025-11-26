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
      // Invalidate overview query
      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_TAB_QUERY_KEYS.overview(opportunityId) });
      // Invalidate opportunity detail query (to refresh project_value)
      queryClient.invalidateQueries({ queryKey: ['opportunities', 'detail', opportunityId] });
      // Invalidate pipeline query (to refresh project_value in pipeline list)
      queryClient.invalidateQueries({ queryKey: ['opportunities', 'pipeline'] });
      // Invalidate opportunities list queries
      queryClient.invalidateQueries({ queryKey: ['opportunities', 'list'] });
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

export const useUpdateOpportunityDriver = (opportunityId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ driverId, data }: { driverId: string; data: any }) =>
      opportunitiesApi.updateOpportunityDriver(opportunityId, driverId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_TAB_QUERY_KEYS.drivers(opportunityId) });
      toast.success('Driver updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update driver');
    },
  });
};

export const useDeleteOpportunityDriver = (opportunityId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (driverId: string) => opportunitiesApi.deleteOpportunityDriver(opportunityId, driverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_TAB_QUERY_KEYS.drivers(opportunityId) });
      toast.success('Driver deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete driver');
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

export const useUpdateOpportunityCompetitor = (opportunityId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ competitorId, data }: { competitorId: string; data: any }) =>
      opportunitiesApi.updateOpportunityCompetitor(opportunityId, competitorId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_TAB_QUERY_KEYS.competitors(opportunityId) });
      toast.success('Competitor updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update competitor');
    },
  });
};

export const useDeleteOpportunityCompetitor = (opportunityId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (competitorId: string) => opportunitiesApi.deleteOpportunityCompetitor(opportunityId, competitorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_TAB_QUERY_KEYS.competitors(opportunityId) });
      toast.success('Competitor deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete competitor');
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

export const useUpdateOpportunityStrategy = (opportunityId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ strategyId, data }: { strategyId: string; data: any }) =>
      opportunitiesApi.updateOpportunityStrategy(opportunityId, strategyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_TAB_QUERY_KEYS.strategies(opportunityId) });
      toast.success('Strategy updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update strategy');
    },
  });
};

export const useDeleteOpportunityStrategy = (opportunityId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (strategyId: string) => opportunitiesApi.deleteOpportunityStrategy(opportunityId, strategyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_TAB_QUERY_KEYS.strategies(opportunityId) });
      toast.success('Strategy deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete strategy');
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

export const useUpdateOpportunityTeamMember = (opportunityId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, data }: { memberId: string; data: any }) =>
      opportunitiesApi.updateOpportunityTeamMember(opportunityId, memberId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_TAB_QUERY_KEYS.teamMembers(opportunityId) });
      toast.success('Team member updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update team member');
    },
  });
};

export const useDeleteOpportunityTeamMember = (opportunityId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => opportunitiesApi.deleteOpportunityTeamMember(opportunityId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_TAB_QUERY_KEYS.teamMembers(opportunityId) });
      toast.success('Team member deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete team member');
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

export const useUpdateOpportunityReference = (opportunityId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ referenceId, data }: { referenceId: string; data: any }) =>
      opportunitiesApi.updateOpportunityReference(opportunityId, referenceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_TAB_QUERY_KEYS.references(opportunityId) });
      toast.success('Reference updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update reference');
    },
  });
};

export const useDeleteOpportunityReference = (opportunityId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (referenceId: string) => opportunitiesApi.deleteOpportunityReference(opportunityId, referenceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_TAB_QUERY_KEYS.references(opportunityId) });
      toast.success('Reference deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete reference');
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

export const useUpdateOpportunityRisk = (opportunityId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ riskId, data }: { riskId: string; data: any }) =>
      opportunitiesApi.updateOpportunityRisk(opportunityId, riskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_TAB_QUERY_KEYS.risks(opportunityId) });
      toast.success('Risk updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update risk');
    },
  });
};

export const useDeleteOpportunityRisk = (opportunityId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (riskId: string) => opportunitiesApi.deleteOpportunityRisk(opportunityId, riskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_TAB_QUERY_KEYS.risks(opportunityId) });
      toast.success('Risk deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete risk');
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

export const useUpdateOpportunityLegalChecklistItem = (opportunityId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: any }) =>
      opportunitiesApi.updateOpportunityLegalChecklistItem(opportunityId, itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_TAB_QUERY_KEYS.legalChecklist(opportunityId) });
      toast.success('Legal checklist item updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update legal checklist item');
    },
  });
};

export const useDeleteOpportunityLegalChecklistItem = (opportunityId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => opportunitiesApi.deleteOpportunityLegalChecklistItem(opportunityId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OPPORTUNITY_TAB_QUERY_KEYS.legalChecklist(opportunityId) });
      toast.success('Legal checklist item deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete legal checklist item');
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