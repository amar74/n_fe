import { apiClient } from './client';

export interface AccountDocument {
  id: string;
  account_id: string;
  name: string;
  category: string;
  date: string;
  file_name: string;
  file_path: string | null;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface AccountDocumentListResponse {
  documents: AccountDocument[];
  total: number;
  page: number;
  limit: number;
}

export interface AccountDocumentCreateRequest {
  name: string;
  category: string;
  date: string;
  file_name: string;
  file_size?: number | null;
  mime_type?: string | null;
}

export interface AccountDocumentUpdateRequest {
  name?: string;
  category?: string;
  date?: string;
}

export interface AccountDocumentDeleteResponse {
  id: string;
  message: string;
}

class AccountDocumentsApiService {
  private baseUrl = '/accounts';

  async listDocuments(accountId: string, page: number = 1, limit: number = 10): Promise<AccountDocumentListResponse> {
    const response = await apiClient.get<AccountDocumentListResponse>(`${this.baseUrl}/${accountId}/documents/`, {
      params: { page, limit },
    });
    return response.data;
  }

  async getDocument(accountId: string, documentId: string): Promise<AccountDocument> {
    const response = await apiClient.get<AccountDocument>(`${this.baseUrl}/${accountId}/documents/${documentId}`);
    return response.data;
  }

  async createDocument(accountId: string, data: AccountDocumentCreateRequest): Promise<AccountDocument> {
    const response = await apiClient.post<AccountDocument>(`${this.baseUrl}/${accountId}/documents/`, data);
    return response.data;
  }

  async updateDocument(accountId: string, documentId: string, data: AccountDocumentUpdateRequest): Promise<AccountDocument> {
    const response = await apiClient.put<AccountDocument>(`${this.baseUrl}/${accountId}/documents/${documentId}`, data);
    return response.data;
  }

  async deleteDocument(accountId: string, documentId: string): Promise<AccountDocumentDeleteResponse> {
    const response = await apiClient.delete<AccountDocumentDeleteResponse>(`${this.baseUrl}/${accountId}/documents/${documentId}`);
    return response.data;
  }

  async downloadDocument(accountId: string, documentId: string) {
    try {
      const response = await apiClient.get(
        `${this.baseUrl}/${accountId}/documents/${documentId}/download`,
        { responseType: 'blob' }
      );
      return response;
    } catch (err) {
      console.error(`Download document failed for account ${accountId}, document ${documentId}:`, err);
      throw err;
    }
  }
}

export const accountDocumentsApi = new AccountDocumentsApiService();
