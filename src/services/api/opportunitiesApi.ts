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
      this.handleError(err, 'create failed');
      throw err;
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

  // Tab-specific API methods
  async getOpportunityOverview(id: string) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}/overview`);
      return response.data;
    } catch (err) {
      this.handleError(err, `get overview failed ${id}`);
      throw err;
    }
  }

  async updateOpportunityOverview(id: string, data: any) {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${id}/overview`, data);
      return response.data;
    } catch (err) {
      this.handleError(err, `update overview failed ${id}`);
      throw err;
    }
  }

  async getOpportunityStakeholders(id: string) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}/stakeholders`);
      return response.data;
    } catch (err) {
      this.handleError(err, `get stakeholders failed ${id}`);
      throw err;
    }
  }

  async createOpportunityStakeholder(id: string, data: any) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${id}/stakeholders`, data);
      return response.data;
    } catch (err) {
      this.handleError(err, `create stakeholder failed ${id}`);
      throw err;
    }
  }

  async updateOpportunityStakeholder(id: string, stakeholderId: string, data: any) {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${id}/stakeholders/${stakeholderId}`, data);
      return response.data;
    } catch (err) {
      this.handleError(err, `update stakeholder failed ${id}`);
      throw err;
    }
  }

  async deleteOpportunityStakeholder(id: string, stakeholderId: string) {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}/stakeholders/${stakeholderId}`);
    } catch (err) {
      this.handleError(err, `delete stakeholder failed ${id}`);
      throw err;
    }
  }

  async getOpportunityDrivers(id: string) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}/drivers`);
      return response.data;
    } catch (err) {
      this.handleError(err, `get drivers failed ${id}`);
      throw err;
    }
  }

  async createOpportunityDriver(id: string, data: any) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${id}/drivers`, data);
      return response.data;
    } catch (err) {
      this.handleError(err, `create driver failed ${id}`);
      throw err;
    }
  }

  async getOpportunityCompetitors(id: string) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}/competitors`);
      return response.data;
    } catch (err) {
      this.handleError(err, `get competitors failed ${id}`);
      throw err;
    }
  }

  async createOpportunityCompetitor(id: string, data: any) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${id}/competitors`, data);
      return response.data;
    } catch (err) {
      this.handleError(err, `create competitor failed ${id}`);
      throw err;
    }
  }

  async getOpportunityStrategies(id: string) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}/strategies`);
      return response.data;
    } catch (err) {
      this.handleError(err, `get strategies failed ${id}`);
      throw err;
    }
  }

  async createOpportunityStrategy(id: string, data: any) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${id}/strategies`, data);
      return response.data;
    } catch (err) {
      this.handleError(err, `create strategy failed ${id}`);
      throw err;
    }
  }

  async getOpportunityDeliveryModel(id: string) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}/delivery-model`);
      return response.data;
    } catch (err) {
      this.handleError(err, `get delivery model failed ${id}`);
      throw err;
    }
  }

  async updateOpportunityDeliveryModel(id: string, data: any) {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${id}/delivery-model`, data);
      return response.data;
    } catch (err) {
      this.handleError(err, `update delivery model failed ${id}`);
      throw err;
    }
  }

  async getOpportunityTeamMembers(id: string) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}/team`);
      return response.data;
    } catch (err) {
      this.handleError(err, `get team members failed ${id}`);
      throw err;
    }
  }

  async createOpportunityTeamMember(id: string, data: any) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${id}/team`, data);
      return response.data;
    } catch (err) {
      this.handleError(err, `create team member failed ${id}`);
      throw err;
    }
  }

  async getOpportunityReferences(id: string) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}/references`);
      return response.data;
    } catch (err) {
      this.handleError(err, `get references failed ${id}`);
      throw err;
    }
  }

  async createOpportunityReference(id: string, data: any) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${id}/references`, data);
      return response.data;
    } catch (err) {
      this.handleError(err, `create reference failed ${id}`);
      throw err;
    }
  }

  async getOpportunityFinancialSummary(id: string) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}/financial`);
      return response.data;
    } catch (err) {
      this.handleError(err, `get financial summary failed ${id}`);
      throw err;
    }
  }

  async updateOpportunityFinancialSummary(id: string, data: any) {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${id}/financial`, data);
      return response.data;
    } catch (err) {
      this.handleError(err, `update financial summary failed ${id}`);
      throw err;
    }
  }

  async getOpportunityRisks(id: string) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}/risks`);
      return response.data;
    } catch (err) {
      this.handleError(err, `get risks failed ${id}`);
      throw err;
    }
  }

  async createOpportunityRisk(id: string, data: any) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${id}/risks`, data);
      return response.data;
    } catch (err) {
      this.handleError(err, `create risk failed ${id}`);
      throw err;
    }
  }

  async getOpportunityLegalChecklist(id: string) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}/legal-checklist`);
      return response.data;
    } catch (err) {
      this.handleError(err, `get legal checklist failed ${id}`);
      throw err;
    }
  }

  async createOpportunityLegalChecklistItem(id: string, data: any) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${id}/legal-checklist`, data);
      return response.data;
    } catch (err) {
      this.handleError(err, `create legal checklist item failed ${id}`);
      throw err;
    }
  }

  async getAllOpportunityTabData(id: string) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}/all-tabs`);
      return response.data;
    } catch (err) {
      this.handleError(err, `get all tab data failed ${id}`);
      throw err;
    }
  }
}

export const opportunitiesApi = new OpportunitiesApiService();
export default opportunitiesApi;