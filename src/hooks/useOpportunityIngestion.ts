import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import { opportunityIngestionApi } from '@/services/api/opportunityIngestionApi';
import type {
  OpportunitySourceCreate,
  OpportunitySourceUpdate,
  OpportunityTempCreate,
  OpportunityTempUpdate,
  TempStatus,
  OpportunityAgentCreate,
  OpportunityAgentUpdate,
} from '@/types/opportunityIngestion';

const ingestionKeys = {
  all: ['opportunityIngestion'] as const,
  sources: () => [...ingestionKeys.all, 'sources'] as const,
  history: (sourceId?: string) => [...ingestionKeys.all, 'history', sourceId ?? 'all'] as const,
  temp: (status?: TempStatus | 'all') => [...ingestionKeys.all, 'temp', status ?? 'all'] as const,
  agents: () => [...ingestionKeys.all, 'agents'] as const,
  agentRuns: (agentId: string) => [...ingestionKeys.all, 'agentRuns', agentId] as const,
};

export const useOpportunitySources = () => {
  return useQuery({
    queryKey: ingestionKeys.sources(),
    queryFn: () => opportunityIngestionApi.listSources(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useMutateOpportunitySource = () => {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (payload: OpportunitySourceCreate) => opportunityIngestionApi.createSource(payload),
    onSuccess: () => {
      toast.success('Source added');
      queryClient.invalidateQueries({ queryKey: ingestionKeys.sources() });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail ?? 'Failed to create source');
    },
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: OpportunitySourceUpdate }) =>
      opportunityIngestionApi.updateSource(id, payload),
    onSuccess: () => {
      toast.success('Source updated');
      queryClient.invalidateQueries({ queryKey: ingestionKeys.sources() });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail ?? 'Failed to update source');
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => opportunityIngestionApi.deleteSource(id),
    onSuccess: () => {
      toast.success('Source removed');
      queryClient.invalidateQueries({ queryKey: ingestionKeys.sources() });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail ?? 'Failed to delete source');
    },
  });

  return { create, update, remove };
};

export const useOpportunityTemp = (status?: TempStatus, limit = 100) => {
  return useQuery({
    queryKey: ingestionKeys.temp(status ?? 'all'),
    queryFn: () => opportunityIngestionApi.listTemp({ status, limit }),
    staleTime: 60 * 1000,
  });
};

export const useMutateOpportunityTemp = () => {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (payload: OpportunityTempCreate) => opportunityIngestionApi.createTemp(payload),
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail ?? 'Failed to store opportunity draft');
    },
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: OpportunityTempUpdate }) =>
      opportunityIngestionApi.updateTemp(id, payload),
    onSuccess: (_, { id }) => {
      toast.success('Opportunity draft updated');
      queryClient.invalidateQueries({ queryKey: ingestionKeys.temp('all') });
      queryClient.invalidateQueries({ queryKey: ingestionKeys.temp(undefined) });
      queryClient.invalidateQueries({ queryKey: ingestionKeys.temp('pending_review') });
      queryClient.invalidateQueries({ queryKey: ingestionKeys.temp('approved') });
      queryClient.invalidateQueries({ queryKey: ingestionKeys.temp('rejected') });
      queryClient.invalidateQueries({ queryKey: ingestionKeys.temp('promoted') });
      queryClient.invalidateQueries({ queryKey: ingestionKeys.history(undefined) });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail ?? 'Failed to update opportunity draft');
    },
  });

  const promote = useMutation({
    mutationFn: ({ id, accountId }: { id: string; accountId?: string }) => 
      opportunityIngestionApi.promoteTemp(id, accountId),
    onSuccess: () => {
      toast.success('Opportunity promoted to pipeline');
      queryClient.invalidateQueries({ queryKey: ingestionKeys.temp('all') });
      queryClient.invalidateQueries({ queryKey: ingestionKeys.temp('promoted') });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail ?? 'Failed to promote opportunity');
    },
  });

  const refresh = useMutation({
    mutationFn: (id: string) => opportunityIngestionApi.refreshTemp(id),
    onSuccess: () => {
      toast.success('Opportunity data refreshed');
      queryClient.invalidateQueries({ queryKey: ingestionKeys.temp('all') });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail ?? 'Failed to refresh opportunity data');
    },
  });

  return { create, update, promote, refresh };
};

export const useOpportunityAgents = () => {
  return useQuery({
    queryKey: ingestionKeys.agents(),
    queryFn: () => opportunityIngestionApi.listAgents(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useMutateOpportunityAgents = () => {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (payload: OpportunityAgentCreate) => opportunityIngestionApi.createAgent(payload),
    onSuccess: () => {
      toast.success('Agent created');
      queryClient.invalidateQueries({ queryKey: ingestionKeys.agents() });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail ?? 'Failed to create agent');
    },
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: OpportunityAgentUpdate }) =>
      opportunityIngestionApi.updateAgent(id, payload),
    onSuccess: () => {
      toast.success('Agent updated');
      queryClient.invalidateQueries({ queryKey: ingestionKeys.agents() });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail ?? 'Failed to update agent');
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => opportunityIngestionApi.deleteAgent(id),
    onSuccess: () => {
      toast.success('Agent removed');
      queryClient.invalidateQueries({ queryKey: ingestionKeys.agents() });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail ?? 'Failed to delete agent');
    },
  });

  return { create, update, remove };
};

export const useOpportunityAgentRuns = (agentId: string, enabled = true) => {
  return useQuery({
    queryKey: ingestionKeys.agentRuns(agentId),
    queryFn: () => opportunityIngestionApi.listAgentRuns(agentId),
    enabled,
    staleTime: 60 * 1000,
  });
};

export const useOpportunityIngestionKeys = () => {
  return useMemo(() => ingestionKeys, []);
};

