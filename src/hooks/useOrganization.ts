import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orgsApi } from '@/services/api/orgsApi';
import { useToast } from '@/hooks/useToast';
import type { OrgMembersListResponse, InviteCreateRequest, InviteResponse } from '@/types/orgs';

// temp solution by rishabh
export const organizationKeys = {
  all: ['organization'] as const,
  members: () => [...organizationKeys.all, 'members'] as const,
  details: () => [...organizationKeys.all, 'details'] as const,
};

export function useOrganization() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const membersQuery = useQuery({
    queryKey: organizationKeys.members(),
    queryFn: () => orgsApi.getOrgMembers(),
  });

  const detailsQuery = useQuery({
    queryKey: organizationKeys.details(),
    queryFn: () => orgsApi.getMyOrg(),
  });

  const inviteMutation = useMutation({
    mutationFn: (inviteData: InviteCreateRequest) => orgsApi.inviteMember(inviteData),
    onSuccess: (data) => {
      // Invalidate members list to refresh the data
      queryClient.invalidateQueries({ queryKey: organizationKeys.members() });
      toast.success('Invitation Sent', {
        description: 'Team member has been invited successfully'
      });
    },
    onError: (error: any) => {
      toast.error('Invitation Failed', {
        description: error?.response?.data?.message || 'send failed. Please try again.'
      });
    },
  });

  return {
    // Members data
    members: membersQuery.data?.members || [],
    totalMembersCount: membersQuery.data?.total_count || 0,
    isMembersLoading: membersQuery.isLoading,
    membersError: membersQuery.error,

    // Organization details
    organization: detailsQuery.data,
    isOrgLoading: detailsQuery.isLoading,
    orgError: detailsQuery.error,

    refetchMembers: () => queryClient.invalidateQueries({ queryKey: organizationKeys.members() }),
    refetchOrg: () => queryClient.invalidateQueries({ queryKey: organizationKeys.details() }),

    inviteMember: inviteMutation.mutateAsync,
    isInviting: inviteMutation.isPending,
    inviteError: inviteMutation.error,
  };
}
