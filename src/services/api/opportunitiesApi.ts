import axios, { AxiosResponse } from 'axios';
import { apiClient } from '../api/client';
import {
  Opportunity,
  CreateOpportunityRequest,
  UpdateOpportunityRequest,
  OpportunityListResponse,
  UpdateStageRequest,
  OpportunityAnalytics,
  OpportunityPipelineResponse,
  OpportunitySearchRequest,
  OpportunitySearchResult,
  OpportunityInsightsResponse,
  OpportunityForecastResponse,
  OpportunityListParams,
  OpportunityApiError
} from '../../types/opportunities';

class OpportunitiesApiService {
  private readonly baseUrl = '/opportunities';

  async createOpportunity(data: CreateOpportunityRequest): Promise<Opportunity> {
    try {
      const response: AxiosResponse<Opportunity> = await apiClient.post(
        `${this.baseUrl}/`,
        data
      );
      return response.data;
    } catch (err) {
      this.handleError(error, 'create failed');
      throw error;
    }
  }

  async getOpportunity(id: string): Promise<Opportunity> {
    try {
      const response: AxiosResponse<Opportunity> = await apiClient.get(
        `/opportunities/${id}`
      );
      return response.data;
    } catch (err) {
      this.handleError(err, `get failed ${id}`);
      throw err;
    }
  }

  async listOpportunities(params: OpportunityListParams = {}): Promise<OpportunityListResponse> {
    try {
      const response: AxiosResponse<OpportunityListResponse> = await apiClient.get(
        `/opportunities`
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'list failed');
      throw error;
    }
  }

  async updateOpportunity(id: string, data: UpdateOpportunityRequest): Promise<Opportunity> {
    try {
      const response: AxiosResponse<Opportunity> = await apiClient.put(
        `${this.baseUrl}/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      this.handleError(error, `update failed ${id}`);
      throw error;
    }
  }

  async deleteOpportunity(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      this.handleError(error, `delete failed ${id}`);
      throw error;
    }
  }

  async updateOpportunityStage(id: string, data: UpdateStageRequest): Promise<Opportunity> {
    try {
      const response: AxiosResponse<Opportunity> = await apiClient.put(
        `${this.baseUrl}/${id}/stage`,
        data
      );
      return response.data;
    } catch (error) {
      this.handleError(error, `update failed stage for ${id}`);
      throw error;
    }
  }
  async getOpportunityAnalytics(days: number = 30): Promise<OpportunityAnalytics> {
    try {
      const response: AxiosResponse<OpportunityAnalytics> = await apiClient.get(
        `/opportunities/analytics/dashboard`
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'get failed analytics');
      throw error;
    }
  }

  async getOpportunityPipeline(): Promise<OpportunityPipelineResponse> {
    try {
      const response: AxiosResponse<OpportunityPipelineResponse> = await apiClient.get(
        `/opportunities/pipeline/view`
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'get failed pipeline');
      throw error;
    }
  }

  async searchOpportunities(data: OpportunitySearchRequest): Promise<OpportunitySearchResult[]> {
    try {
      const response: AxiosResponse<OpportunitySearchResult[]> = await apiClient.post(
        `${this.baseUrl}/search/ai`,
        data
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'search failed');
      throw error;
    }
  }

  async getOpportunityInsights(id: string): Promise<OpportunityInsightsResponse> {
    try {
      const response: AxiosResponse<OpportunityInsightsResponse> = await apiClient.get(
        `${this.baseUrl}/${id}/insights`
      );
      return response.data;
    } catch (error) {
      this.handleError(error, `get failed for opportunity ${id}`);
      throw error;
    }
  }

  async getOpportunityForecast(
    id: string, 
    period: 'monthly' | 'quarterly' | 'yearly' = 'quarterly'
  ): Promise<OpportunityForecastResponse> {
    try {
      const response: AxiosResponse<OpportunityForecastResponse> = await apiClient.get(
        `${this.baseUrl}/${id}/forecast?period=${period}`
      );
      return response.data;
    } catch (error) {
      this.handleError(error, `get failed for opportunity ${id}`);
      throw error;
    }
  }

  async exportOpportunities(stage?: string): Promise<{ message: string; download_url: string; expires_at: string }> {
    try {
      const params = stage ? `?stage=${stage}` : '';
      const response = await apiClient.get(`${this.baseUrl}/export/csv${params}`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'export failed');
      throw error;
    }
  }

  async listOpportunitiesByAccount(
    accountId: string, 
    params: OpportunityListParams = {}
  ): Promise<OpportunityListResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.size) queryParams.append('size', params.size.toString());
      if (params.stage) queryParams.append('stage', params.stage);

      const response: AxiosResponse<OpportunityListResponse> = await apiClient.get(
        `${this.baseUrl}/by-account/${accountId}?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      this.handleError(error, `list failed for account ${accountId}`);
      throw error;
    }
  }

  async healthCheck(): Promise<{ status: string; module: string; timestamp: string }> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/health/check`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Opportunities module health check failed');
      throw error;
    }
  }

  async batchUpdateStage(opportunityIds: string[], stage: string, notes?: string): Promise<Opportunity[]> {
    try {
      const promises = opportunityIds.map(id => 
        this.updateOpportunityStage(id, { stage: stage as any, notes })
      );
      return await Promise.all(promises);
    } catch (error) {
      this.handleError(error, 'batch failed opportunity stages');
      throw error;
    }
  }

  async batchDelete(opportunityIds: string[]): Promise<void> {
    try {
      const promises = opportunityIds.map(id => this.deleteOpportunity(id));
      await Promise.all(promises);
    } catch (error) {
      this.handleError(error, 'batch failed opportunities');
      throw error;
    }
  }
  private handleError(error: any, defaultMessage: string): void {
  }

  formatOpportunityForDisplay(opportunity: Opportunity): Opportunity {
    return {
      ...opportunity,
      project_value: opportunity.project_value ? Number(opportunity.project_value) : undefined,
      team_size: opportunity.team_size ? Number(opportunity.team_size) : undefined,
      match_score: opportunity.match_score ? Number(opportunity.match_score) : undefined,
    };
  }

  validateOpportunityData(data: CreateOpportunityRequest | UpdateOpportunityRequest): string[] {
    const errors: string[] = [];

    if ('project_name' in data && (!data.project_name || data.project_name.trim().length === 0)) {
      errors.push('Project name is required');
    }

    if ('client_name' in data && (!data.client_name || data.client_name.trim().length === 0)) {
      errors.push('Client name is required');
    }

    if (data.project_value !== undefined && data.project_value < 0) {
      errors.push('Project value must be positive');
    }

    if (data.team_size !== undefined && (data.team_size < 1 || data.team_size > 1000)) {
      errors.push('Team size must be between 1 and 1000');
    }

    if (data.match_score !== undefined && (data.match_score < 0 || data.match_score > 100)) {
      errors.push('Match score must be between 0 and 100');
    }

    return errors;
  }
}

export const opportunitiesApi = new OpportunitiesApiService();
export default opportunitiesApi;