import { apiClient } from './client';

export interface Contract {
  id: string;
  contract_id?: string;
  account_id?: string;
  account_name?: string;
  client_name: string;
  project_name: string;
  version?: string;
  status: 'awaiting-review' | 'in-legal-review' | 'exceptions-approved' | 'negotiating' | 'executed' | 'archived';
  risk_level: 'low' | 'medium' | 'high';
  upload_date?: string;
  file_size?: string;
  document_type: string;
  red_clauses?: number;
  amber_clauses?: number;
  green_clauses?: number;
  total_clauses?: number;
  assigned_reviewer?: string;
  last_modified?: string;
  contract_value?: number;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
  opportunity_id?: string;
  proposal_id?: string;
  project_id?: string;
}

export interface ContractCreateRequest {
  account_id?: string;
  account_name?: string;
  client_name: string;
  project_name: string;
  document_type: string;
  status?: 'awaiting-review' | 'in-legal-review' | 'exceptions-approved' | 'negotiating' | 'executed';
  risk_level?: 'low' | 'medium' | 'high';
  contract_value?: number;
  start_date?: string;
  end_date?: string;
  opportunity_id?: string;
  proposal_id?: string;
  version?: string;
  upload_date?: string;
  file_size?: string;
  assigned_reviewer?: string;
}

export interface ContractUpdateRequest {
  status?: 'awaiting-review' | 'in-legal-review' | 'exceptions-approved' | 'negotiating' | 'executed' | 'archived';
  risk_level?: 'low' | 'medium' | 'high';
  red_clauses?: number;
  amber_clauses?: number;
  green_clauses?: number;
  assigned_reviewer?: string;
  contract_value?: number;
  start_date?: string;
  end_date?: string;
  version?: string;
  last_modified?: string;
  [key: string]: any;
}

export interface ContractsListResponse {
  items: Contract[];
  total: number;
  page: number;
  size: number;
}

export class ContractsApi {
  private basePath = '/contracts';

  async list(params?: {
    page?: number;
    size?: number;
    status?: string;
    risk_level?: string;
    account?: string;
    search?: string;
  }): Promise<ContractsListResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.size) queryParams.append('size', params.size.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.risk_level) queryParams.append('risk_level', params.risk_level);
      if (params?.account) queryParams.append('account', params.account);
      if (params?.search) queryParams.append('search', params.search);

      const response = await apiClient.get(`${this.basePath}?${queryParams.toString()}`);
      // Handle both response formats: response.data or response.data.data
      const data = response.data?.data || response.data;
      
      // Ensure response matches ContractsListResponse interface
      if (Array.isArray(data)) {
        return {
          items: data,
          total: data.length,
          page: params?.page || 1,
          size: params?.size || 10,
        };
      }
      
      // If response already has the correct structure
      if (data?.items && typeof data.total === 'number') {
        return data;
      }
      
      // Fallback: wrap in expected structure
      return {
        items: data?.items || [],
        total: data?.total || data?.count || 0,
        page: data?.page || params?.page || 1,
        size: data?.size || data?.limit || params?.size || 10,
      };
    } catch (error: any) {
      // If backend doesn't have contracts API yet, return empty list
      if (error.response?.status === 404 || error.response?.status === 501) {
        return {
          items: [],
          total: 0,
          page: params?.page || 1,
          size: params?.size || 10,
        };
      }
      throw error;
    }
  }

  async get(id: string): Promise<Contract> {
    try {
      const response = await apiClient.get(`${this.basePath}/${id}`);
      // Handle both response formats: response.data or response.data.data
      return response.data?.data || response.data;
    } catch (error: any) {
      // If contract not found, throw a more descriptive error
      if (error.response?.status === 404) {
        throw new Error(`Contract with ID ${id} not found`);
      }
      throw error;
    }
  }

  async create(data: ContractCreateRequest): Promise<Contract> {
    try {
      console.log('Sending contract creation request:', JSON.stringify(data, null, 2));
      const response = await apiClient.post(this.basePath, data);
      // Handle both response formats: response.data or response.data.data
      return response.data?.data || response.data;
    } catch (error: any) {
      console.error('Contract creation error:', error);
      console.error('Error response:', error.response?.data);
      // Provide better error messages
      if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'Invalid contract data';
        throw new Error(errorMsg);
      }
      if (error.response?.status === 500) {
        const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'Server error while creating contract';
        throw new Error(errorMsg);
      }
      throw error;
    }
  }

  async update(id: string, data: ContractUpdateRequest): Promise<Contract> {
    try {
      const response = await apiClient.put(`${this.basePath}/${id}`, data);
      // Handle both response formats: response.data or response.data.data
      return response.data?.data || response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Contract with ID ${id} not found`);
      }
      if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'Invalid update data';
        throw new Error(errorMsg);
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }

  async archive(id: string): Promise<Contract> {
    const response = await apiClient.put(`${this.basePath}/${id}`, { status: 'archived' });
    return response.data;
  }

  // Create contract from proposal
  async createFromProposal(proposalId: string, autoAnalyze: boolean = true): Promise<Contract> {
    try {
      const response = await apiClient.post(`${this.basePath}/from-proposal`, {
        proposal_id: proposalId,
        auto_analyze: autoAnalyze,
      });
      // Handle both response formats: response.data or response.data.data
      return response.data?.data || response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Proposal with ID ${proposalId} not found`);
      }
      if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'Invalid proposal data';
        throw new Error(errorMsg);
      }
      throw error;
    }
  }

  // Upload document to contract
  async uploadDocument(contractId: string, file: File): Promise<Contract> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post(`${this.basePath}/${contractId}/upload-document`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data?.data || response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Contract with ID ${contractId} not found`);
      }
      if (error.response?.status === 400 || error.response?.status === 413) {
        const errorMsg = error.response?.data?.detail || 'Invalid file or upload failed';
        throw new Error(errorMsg);
      }
      throw error;
    }
  }

  // Extract document details
  async extractDocument(file: File): Promise<{
    client_name?: string;
    project_name?: string;
    contract_value?: string;
    start_date?: string;
    end_date?: string;
    document_type?: string;
    risk_level?: string;
    extracted_text_preview?: string;
  }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post(`${this.basePath}/extract-document`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data?.data || response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.detail || 'Invalid file or extraction failed';
        throw new Error(errorMsg);
      }
      throw error;
    }
  }

  async analyze(id: string): Promise<{
    red_clauses: number;
    amber_clauses: number;
    green_clauses: number;
    total_clauses: number;
    risk_level: 'low' | 'medium' | 'high';
    analysis: any[];
    executive_summary?: string;
  }> {
    try {
      const response = await apiClient.post(`${this.basePath}/${id}/analyze`);
      // Handle both response formats: response.data or response.data.data
      const data = response.data?.data || response.data;
      console.log('Analyze response:', data);
      // Ensure the response has the expected structure
      return {
        red_clauses: data?.red_clauses || 0,
        amber_clauses: data?.amber_clauses || 0,
        green_clauses: data?.green_clauses || 0,
        total_clauses: data?.total_clauses || (data?.analysis?.length || 0),
        risk_level: data?.risk_level || 'medium',
        analysis: data?.analysis || [],
        executive_summary: data?.executive_summary || undefined,
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Contract with ID ${id} not found`);
      }
      throw error;
    }
  }

  // Get contract analysis
  async getWorkflow(contractId?: string): Promise<any> {
    try {
      const url = contractId ? `${this.basePath}/workflow?contract_id=${contractId}` : `${this.basePath}/workflow`;
      const response = await apiClient.get(url);
      return response.data?.data || response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Workflow data not found');
      }
      throw error;
    }
  }

  async getAnalysis(id: string): Promise<{
    red_clauses: number;
    amber_clauses: number;
    green_clauses: number;
    total_clauses: number;
    risk_level: 'low' | 'medium' | 'high';
    analysis: any[];
    executive_summary?: string;
  }> {
    try {
      const response = await apiClient.get(`${this.basePath}/${id}/analysis`);
      // Handle both response formats: response.data or response.data.data
      const data = response.data?.data || response.data;
      // If data is just an array, wrap it in the expected structure
      if (Array.isArray(data)) {
        return {
          red_clauses: 0,
          amber_clauses: 0,
          green_clauses: 0,
          total_clauses: data.length,
          risk_level: 'medium',
          analysis: data,
          executive_summary: undefined,
        };
      }
      // Return with defaults if structure is missing
      return {
        red_clauses: data?.red_clauses || 0,
        amber_clauses: data?.amber_clauses || 0,
        green_clauses: data?.green_clauses || 0,
        total_clauses: data?.total_clauses || 0,
        risk_level: data?.risk_level || 'medium',
        analysis: data?.analysis || [],
        executive_summary: data?.executive_summary || undefined,
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Return empty structure if analysis not found (contract might not be analyzed yet)
        return {
          red_clauses: 0,
          amber_clauses: 0,
          green_clauses: 0,
          total_clauses: 0,
          risk_level: 'medium',
          analysis: [],
          executive_summary: undefined,
        };
      }
      throw error;
    }
  }
}

export const contractsApi = new ContractsApi();

