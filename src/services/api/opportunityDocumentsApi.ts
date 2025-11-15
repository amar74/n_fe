import { apiClient } from './client';

export interface OpportunityDocument {
  id: string;
  opportunity_id: string;
  file_name: string;
  original_name: string;
  file_type: string;
  file_size: number;
  file_path?: string;
  file_url?: string;
  category: string;
  purpose: string;
  description?: string;
  tags?: string;
  status: string;
  is_available_for_proposal: boolean;
  upload_date?: string;
  uploaded_at: string;
  updated_at: string;
}

export interface CreateOpportunityDocumentRequest {
  file_name: string;
  original_name: string;
  file_type: string;
  file_size: number;
  category: string;
  purpose: string;
  description?: string;
  tags?: string;
}

export interface UpdateOpportunityDocumentRequest {
  file_name?: string;
  category?: string;
  purpose?: string;
  description?: string;
  tags?: string;
  is_available_for_proposal?: boolean;
  file_url?: string;
  file_path?: string;
  status?: string;
}

export interface OpportunityDocumentListResponse {
  documents: OpportunityDocument[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface OpportunityDocumentDeleteResponse {
  message: string;
  document_id: string;
}

class OpportunityDocumentsApi {
  private baseUrl = '/opportunities';

  private handleError(error: any, operation: string) {
    console.error(`Opportunity Documents API ${operation}:`, error);
    throw error;
  }

  async createDocument(opportunityId: string, data: CreateOpportunityDocumentRequest): Promise<OpportunityDocument> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${opportunityId}/documents`, data);
      return response.data;
    } catch (err) {
      this.handleError(err, `create document failed for opportunity ${opportunityId}`);
      throw err;
    }
  }

  async getDocuments(
    opportunityId: string, 
    page: number = 1, 
    limit: number = 10
  ): Promise<OpportunityDocumentListResponse> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${opportunityId}/documents`, {
        params: { page, limit }
      });
      return response.data;
    } catch (err) {
      this.handleError(err, `get documents failed for opportunity ${opportunityId}`);
      throw err;
    }
  }

  async getDocument(opportunityId: string, documentId: string): Promise<OpportunityDocument> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${opportunityId}/documents/${documentId}`);
      return response.data;
    } catch (err) {
      this.handleError(err, `get document failed for opportunity ${opportunityId}, document ${documentId}`);
      throw err;
    }
  }

  async updateDocument(
    opportunityId: string, 
    documentId: string, 
    data: UpdateOpportunityDocumentRequest
  ): Promise<OpportunityDocument> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${opportunityId}/documents/${documentId}`, data);
      return response.data;
    } catch (err) {
      this.handleError(err, `update document failed for opportunity ${opportunityId}, document ${documentId}`);
      throw err;
    }
  }

  async deleteDocument(opportunityId: string, documentId: string): Promise<OpportunityDocumentDeleteResponse> {
    try {
      const response = await apiClient.delete(`${this.baseUrl}/${opportunityId}/documents/${documentId}`);
      return response.data;
    } catch (err) {
      this.handleError(err, `delete document failed for opportunity ${opportunityId}, document ${documentId}`);
      throw err;
    }
  }

  async uploadFile(opportunityId: string, file: File, category: string, purpose: string): Promise<OpportunityDocument> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      formData.append('purpose', purpose);

      const response = await apiClient.post(
        `${this.baseUrl}/${opportunityId}/documents/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (err) {
      this.handleError(err, `upload file failed for opportunity ${opportunityId}`);
      throw err;
    }
  }

  async downloadDocument(opportunityId: string, documentId: string) {
    try {
      const response = await apiClient.get(
        `${this.baseUrl}/${opportunityId}/documents/${documentId}/download`,
        { responseType: 'blob' }
      );
      return response;
    } catch (err) {
      this.handleError(err, `download document failed for opportunity ${opportunityId}, document ${documentId}`);
      throw err;
    }
  }
}

export const opportunityDocumentsApi = new OpportunityDocumentsApi();