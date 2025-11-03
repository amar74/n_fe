/**
 * Account Team Management Hook
 * Manages employee assignments to accounts using TanStack Query
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { useToast } from '@/hooks/use-toast';

// Types
export interface EmployeeBasicInfo {
  id: string;
  employee_number: string;
  name: string;
  email: string;
  phone?: string;
  job_title?: string;
  role?: string;
  department?: string;
  location?: string;
  bill_rate?: number;
  status: string;
  experience?: string;
  skills?: string[];
}

export interface AccountTeamMember {
  id: number;
  account_id: string;
  employee_id: string;
  role_in_account?: string;
  assigned_at: string;
  assigned_by?: string;
  employee?: EmployeeBasicInfo;
}

export interface AccountTeamListResponse {
  team_members: AccountTeamMember[];
  total_count: number;
  account_id: string;
}

export interface AddTeamMemberRequest {
  employee_id: string;
  role_in_account?: string;
}

export interface UpdateTeamMemberRequest {
  role_in_account?: string;
}

export interface AccountTeamDeleteResponse {
  id: number;
  message: string;
  employee_id: string;
  account_id: string;
}

// Query Keys
export const accountTeamKeys = {
  all: ['account-team'] as const,
  byAccount: (accountId: string) => [...accountTeamKeys.all, accountId] as const,
  detail: (accountId: string, memberId: number) => [...accountTeamKeys.byAccount(accountId), memberId] as const,
};

/**
 * Hook for managing account team members
 */
export function useAccountTeam(accountId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch team members for an account
  const {
    data: teamData,
    isLoading,
    error,
    refetch
  } = useQuery<AccountTeamListResponse>({
    queryKey: accountTeamKeys.byAccount(accountId),
    queryFn: async () => {
      const response = await apiClient.get(`/accounts/${accountId}/team/`);
      return response.data;
    },
    enabled: !!accountId,
  });

  // Add team member mutation
  const addTeamMemberMutation = useMutation({
    mutationFn: async (payload: AddTeamMemberRequest) => {
      const response = await apiClient.post(`/accounts/${accountId}/team/`, payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: accountTeamKeys.byAccount(accountId) });
      toast({
        title: 'Team Member Added',
        description: `${data.employee?.name || 'Employee'} has been added to the team`,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || 'Failed to add team member';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  // Update team member mutation
  const updateTeamMemberMutation = useMutation({
    mutationFn: async ({ memberId, payload }: { memberId: number; payload: UpdateTeamMemberRequest }) => {
      const response = await apiClient.put(`/accounts/${accountId}/team/${memberId}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountTeamKeys.byAccount(accountId) });
      toast({
        title: 'Team Member Updated',
        description: 'Team member information has been updated',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || 'Failed to update team member';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  // Remove team member mutation
  const removeTeamMemberMutation = useMutation({
    mutationFn: async (memberId: number) => {
      const response = await apiClient.delete(`/accounts/${accountId}/team/${memberId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountTeamKeys.byAccount(accountId) });
      toast({
        title: 'Team Member Removed',
        description: 'Team member has been removed from the account',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || 'Failed to remove team member';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  return {
    // Data
    teamMembers: teamData?.team_members || [],
    totalCount: teamData?.total_count || 0,
    
    // Loading states
    isLoading,
    isAdding: addTeamMemberMutation.isPending,
    isUpdating: updateTeamMemberMutation.isPending,
    isRemoving: removeTeamMemberMutation.isPending,
    
    // Error
    error,
    
    // Actions
    addTeamMember: addTeamMemberMutation.mutateAsync,
    updateTeamMember: updateTeamMemberMutation.mutateAsync,
    removeTeamMember: removeTeamMemberMutation.mutateAsync,
    refetch,
  };
}

