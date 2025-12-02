import {
  CreateOrgRequest,
  OrgCreated,
  Organization,
  UpdateOrgRequest,
  OrgUpdate,
  OrgMembersListResponse,
  InviteCreateRequest,
  InviteResponse,
  AcceptInviteResponse,
} from '@/types/orgs';
import apiClient from './client';

export const orgsApi = {
  async createOrg(data: CreateOrgRequest): Promise<OrgCreated> {
    const { data: response } = await apiClient.post<OrgCreated>('/orgs/create', data);
    return response;
  },

  async getMyOrg(): Promise<Organization> {
    const { data } = await apiClient.get<Organization>('/orgs/me');
    return data;
  },

  async getOrgById(orgId: string): Promise<Organization> {
    const { data } = await apiClient.get<Organization>(`/orgs/${orgId}`);
    return data;
  },

  async patchOrg(orgId: string, data: any): Promise<any> {
    const { data: response } = await apiClient.patch<any>(`/orgs/${orgId}`, data);
    return response;
  },

  async getOrgMembers(): Promise<OrgMembersListResponse> {
    const { data } = await apiClient.get<OrgMembersListResponse>('/orgs/members');
    return data;
  },

  async inviteMember(inviteData: InviteCreateRequest): Promise<InviteResponse> {
    const { data } = await apiClient.post<InviteResponse>('/orgs/invite', inviteData);
    return data;
  },

  async acceptInvite(token: string): Promise<AcceptInviteResponse> {
    const { data } = await apiClient.post<AcceptInviteResponse>('/orgs/invite/accept', { token });
    return data;
  },

  async hello(): Promise<unknown> {
    const { data } = await apiClient.get('/orgs/hello');
    return data;
  },

  async uploadLogo(orgId: string, file: File): Promise<{ success: boolean; logo_url: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<{ success: boolean; logo_url: string; message: string }>(
      `/orgs/${orgId}/logo`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  },
};
