import { apiClient } from './client';
import type { Account, AccountListItem, AccountListResponse, AccountCreate, AccountUpdate } from '../../types/accounts';

export const accountsApi = {
  async listAccounts(params: { page?: number; size?: number; search?: string; tier?: string } = {}) {
    const { data } = await apiClient.get<AccountListResponse>('/accounts', { params });
    return data;
  },

  async getAccount(accountId: string) {
    try {
      const { data } = await apiClient.get<Account>(`/accounts/${accountId}`);
      return data;
    } catch (error: any) {
      throw error;
    }
  },

  async createAccount(payload: AccountCreate) {
    // temp solution by amar74.soft
    const { data } = await apiClient.post<Account>('/accounts', payload);
    return data;
  },

  async updateAccount(accountId: string, payload: AccountUpdate) {
    try {
      const { data } = await apiClient.put<Account>(`/accounts/${accountId}`, payload);
      return data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || error.message?.includes('CORS')) {
        try {
          const { data } = await apiClient.patch<Account>(`/accounts/${accountId}`, payload);
          return data;
        } catch (patchErr) {
          const { data } = await apiClient.post<Account>(`/accounts/${accountId}?_method=PUT`, payload);
          return data;
        }
      }
      throw error;
    }
  },

  async deleteAccount(accountId: string) {
    await apiClient.delete(`/accounts/${accountId}`);
  },

  async addContact(accountId: string, contact: any) {
    const { data } = await apiClient.post(`/accounts/${accountId}/contacts`, contact);
    return data;
  },

  async updateContact(accountId: string, contactId: string, contact: any) {
    const { data } = await apiClient.put(`/accounts/${accountId}/contacts/${contactId}`, contact);
    return data;
  },

  async deleteContact(accountId: string, contactId: string) {
    await apiClient.delete(`/accounts/${accountId}/contacts/${contactId}`);
  },

  async promoteContact(accountId: string, contactId: string) {
    const { data } = await apiClient.post(`/accounts/${accountId}/contacts/${contactId}/promote`);
    return data;
  },

  async getContacts(accountId: string) {
    const { data } = await apiClient.get(`/accounts/${accountId}/contacts`);
    return data;
  }
};
