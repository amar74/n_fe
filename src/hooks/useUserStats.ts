import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { createApiClient as createOrgsApiClient } from '@/types/generated/orgs';
import { createApiClient as createOpportunitiesApiClient } from '@/types/generated/Opportunities';
import { createApiClient as createUserPermissionsApiClient } from '@/types/generated/user_permissions';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const orgsApi = createOrgsApiClient(BASE_URL, { axiosInstance: apiClient });
const opportunitiesApi = createOpportunitiesApiClient(BASE_URL, { axiosInstance: apiClient });
const userPermissionsApi = createUserPermissionsApiClient(BASE_URL, { axiosInstance: apiClient });

export const userStatsKeys = {
  all: ['userStats'] as const,
  profile: () => [...userStatsKeys.all, 'profile'] as const,
  organization: () => [...userStatsKeys.all, 'organization'] as const,
  opportunities: () => [...userStatsKeys.all, 'opportunities'] as const,
  teamMembers: () => [...userStatsKeys.all, 'teamMembers'] as const,
};

export function useUserStats() {
  // Fetch organization data
  const { data: organization, isLoading: isOrgLoading } = useQuery({
    queryKey: userStatsKeys.organization(),
    queryFn: () => orgsApi.me(),
    enabled: true,
  });

  // Fetch opportunities analytics
  const { data: opportunitiesAnalytics, isLoading: isOpportunitiesLoading } = useQuery({
    queryKey: userStatsKeys.opportunities(),
    queryFn: () => opportunitiesApi.get_opportunity_analytics_opportunities_analytics_dashboard_get({ days: 30 }),
    enabled: true,
  });

  // Fetch team members count
  const { data: teamMembers, isLoading: isTeamLoading } = useQuery({
    queryKey: userStatsKeys.teamMembers(),
    queryFn: () => userPermissionsApi.listUserPermissions({ limit: 1000 }),
    enabled: true,
  });

  // Calculate stats from the fetched data
  const stats = {
    activeProjects: opportunitiesAnalytics?.total_opportunities || 0,
    completedTasks: Math.round((opportunitiesAnalytics?.win_rate || 0) * (opportunitiesAnalytics?.total_opportunities || 0)),
    teamMembers: teamMembers?.users?.length || 0,
    performance: organization?.profile_completion_percentage || 0,
    organizationCreatedAt: organization?.created_at,
    lastUpdated: organization?.updated_at,
  };

  const isLoading = isOrgLoading || isOpportunitiesLoading || isTeamLoading;

  return {
    stats,
    organization,
    opportunitiesAnalytics,
    teamMembers,
    isLoading,
  };
}