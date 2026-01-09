import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contractsApi, Contract, ContractCreateRequest, ContractUpdateRequest } from '@/services/api/contractsApi';
import { useToast } from '@/hooks/shared';

// Query keys following the pattern from other hooks
export const contractKeys = {
  all: ['contracts'] as const,
  lists: () => [...contractKeys.all, 'list'] as const,
  list: (params?: {
    page?: number;
    size?: number;
    status?: string;
    risk_level?: string;
    account?: string;
    search?: string;
  }) => [...contractKeys.lists(), params] as const,
  details: () => [...contractKeys.all, 'detail'] as const,
  detail: (id: string) => [...contractKeys.details(), id] as const,
  workflow: (contractId?: string) => [...contractKeys.all, 'workflow', contractId || 'all'] as const,
};

export function useContracts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // READ - List contracts
  const useContractsList = (params?: {
    page?: number;
    size?: number;
    status?: string;
    risk_level?: string;
    account?: string;
    search?: string;
  }) => {
    return useQuery({
      queryKey: contractKeys.list(params),
      queryFn: async () => {
        return await contractsApi.list(params);
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // READ - Get contract detail
  const useContract = (id: string | undefined, enabled: boolean = true) => {
    return useQuery({
      queryKey: contractKeys.detail(id || ''),
      queryFn: async () => {
        if (!id) throw new Error('Contract ID is required');
        return await contractsApi.get(id);
      },
      enabled: enabled && !!id,
      staleTime: 5 * 60 * 1000,
    });
  };

  // CREATE - Create contract
  const createContractMutation = useMutation({
    mutationFn: async (data: ContractCreateRequest) => {
      return await contractsApi.create(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: contractKeys.all });
      toast.success('Contract created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to create contract');
    },
  });

  // UPDATE - Update contract
  const updateContractMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ContractUpdateRequest }) => {
      return await contractsApi.update(id, data);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: contractKeys.all });
      queryClient.invalidateQueries({ queryKey: contractKeys.detail(variables.id) });
      toast.success('Contract updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to update contract');
    },
  });

  // DELETE - Archive contract
  const archiveContractMutation = useMutation({
    mutationFn: async (id: string) => {
      return await contractsApi.archive(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.all });
      toast.success('Contract archived successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to archive contract');
    },
  });

  // DELETE - Delete contract
  const deleteContractMutation = useMutation({
    mutationFn: async (id: string) => {
      return await contractsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.all });
      toast.success('Contract deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to delete contract');
    },
  });

  // CREATE - Create contract from proposal
  const createFromProposalMutation = useMutation({
    mutationFn: async ({ proposalId, autoAnalyze }: { proposalId: string; autoAnalyze?: boolean }) => {
      return await contractsApi.createFromProposal(proposalId, autoAnalyze ?? true);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: contractKeys.all });
      toast.success('Contract created from proposal successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to create contract from proposal');
    },
  });

  // ANALYZE - Trigger AI analysis
  const analyzeContractMutation = useMutation({
    mutationFn: async (id: string) => {
      return await contractsApi.analyze(id);
    },
    onSuccess: async (data, id) => {
      console.log('Analysis completed, response data:', data);
      console.log('Analysis data structure:', {
        hasAnalysis: !!data?.analysis,
        analysisLength: data?.analysis?.length,
        hasExecutiveSummary: !!data?.executive_summary,
        redClauses: data?.red_clauses,
        amberClauses: data?.amber_clauses,
        greenClauses: data?.green_clauses,
      });
      
      // Immediately update the cache with the analysis result (don't invalidate right away)
      if (data && data.analysis) {
        queryClient.setQueryData([...contractKeys.detail(id), 'analysis'], data);
        console.log('Cache updated with analysis data');
      }
      
      // Invalidate contract detail to refresh clause counts
      await queryClient.invalidateQueries({ queryKey: contractKeys.detail(id) });
      await queryClient.invalidateQueries({ queryKey: contractKeys.all });
      
      // Refetch after a delay to ensure we have the latest from database
      setTimeout(async () => {
        await queryClient.refetchQueries({ 
          queryKey: [...contractKeys.detail(id), 'analysis'],
          type: 'active'
        });
        console.log('Refetched analysis query');
      }, 2500);
      
      toast.success('Contract analysis completed successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to analyze contract');
    },
  });

  // READ - Get contract workflow
  const useContractWorkflow = (contractId?: string, enabled: boolean = true) => {
    return useQuery({
      queryKey: contractKeys.workflow(contractId),
      queryFn: async () => {
        return await contractsApi.getWorkflow(contractId);
      },
      enabled,
      staleTime: 5 * 60 * 1000,
    });
  };

  // READ - Get contract analysis
  const useContractAnalysis = (id: string | undefined, enabled: boolean = true) => {
    return useQuery({
      queryKey: [...contractKeys.detail(id || ''), 'analysis'],
      queryFn: async () => {
        if (!id) throw new Error('Contract ID is required');
        const result = await contractsApi.getAnalysis(id);
        console.log('getAnalysis result:', result);
        return result;
      },
      enabled: enabled && !!id,
      staleTime: 0, // Always refetch to get latest analysis
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      gcTime: 0, // Don't cache, always fetch fresh
    });
  };

  return {
    useContractsList,
    useContract,
    useContractWorkflow,
    createContractMutation,
    updateContractMutation,
    archiveContractMutation,
    deleteContractMutation,
    createFromProposalMutation,
    analyzeContractMutation,
    useContractAnalysis,
  };
}