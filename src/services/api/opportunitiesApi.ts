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
  OpportunityListParams
} from '../../types/opportunities';
import type { DeliveryModelData } from '@/types/opportunityTabs';

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
        `${this.baseUrl}`,
        { params }
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

  async updateOpportunityDriver(id: string, driverId: string, data: any) {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${id}/drivers/${driverId}`, data);
      return response.data;
    } catch (err) {
      this.handleError(err, `update driver failed ${id}`);
      throw err;
    }
  }

  async deleteOpportunityDriver(id: string, driverId: string) {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}/drivers/${driverId}`);
    } catch (err) {
      this.handleError(err, `delete driver failed ${id}`);
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

  async updateOpportunityCompetitor(id: string, competitorId: string, data: any) {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${id}/competitors/${competitorId}`, data);
      return response.data;
    } catch (err) {
      this.handleError(err, `update competitor failed ${id}`);
      throw err;
    }
  }

  async deleteOpportunityCompetitor(id: string, competitorId: string) {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}/competitors/${competitorId}`);
    } catch (err) {
      this.handleError(err, `delete competitor failed ${id}`);
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

  async updateOpportunityStrategy(id: string, strategyId: string, data: any) {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${id}/strategies/${strategyId}`, data);
      return response.data;
    } catch (err) {
      this.handleError(err, `update strategy failed ${id}`);
      throw err;
    }
  }

  async deleteOpportunityStrategy(id: string, strategyId: string) {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}/strategies/${strategyId}`);
    } catch (err) {
      this.handleError(err, `delete strategy failed ${id}`);
      throw err;
    }
  }

  async getOpportunityDeliveryModel(id: string): Promise<DeliveryModelData> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}/delivery-model`);
      return response.data;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        return {
          approach: '',
          key_phases: [],
          identified_gaps: [],
          models: [],
          active_model_id: null,
        };
      }
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

  async updateOpportunityTeamMember(id: string, memberId: string, data: any) {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${id}/team/${memberId}`, data);
      return response.data;
    } catch (err) {
      this.handleError(err, `update team member failed ${id}`);
      throw err;
    }
  }

  async deleteOpportunityTeamMember(id: string, memberId: string) {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}/team/${memberId}`);
    } catch (err) {
      this.handleError(err, `delete team member failed ${id}`);
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

  async updateOpportunityReference(id: string, referenceId: string, data: any) {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${id}/references/${referenceId}`, data);
      return response.data;
    } catch (err) {
      this.handleError(err, `update reference failed ${id}`);
      throw err;
    }
  }

  async deleteOpportunityReference(id: string, referenceId: string) {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}/references/${referenceId}`);
    } catch (err) {
      this.handleError(err, `delete reference failed ${id}`);
      throw err;
    }
  }

  async getOpportunityFinancialSummary(id: string) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}/financial`, {
        validateStatus: (status) => status === 200 || status === 404,
      });

      if (response.status === 200) {
        return response.data;
      }

      // Fallback when backend endpoint is unavailable.
      return {
        total_project_value: 0,
        budget_categories: [],
        contingency_percentage: 0,
        profit_margin_percentage: 0,
      };
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

  async updateOpportunityRisk(id: string, riskId: string, data: any) {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${id}/risks/${riskId}`, data);
      return response.data;
    } catch (err) {
      this.handleError(err, `update risk failed ${id}`);
      throw err;
    }
  }

  async deleteOpportunityRisk(id: string, riskId: string) {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}/risks/${riskId}`);
    } catch (err) {
      this.handleError(err, `delete risk failed ${id}`);
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

  async updateOpportunityLegalChecklistItem(id: string, itemId: string, data: any) {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${id}/legal-checklist/${itemId}`, data);
      return response.data;
    } catch (err) {
      this.handleError(err, `update legal checklist item failed ${id}`);
      throw err;
    }
  }

  async deleteOpportunityLegalChecklistItem(id: string, itemId: string) {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}/legal-checklist/${itemId}`);
    } catch (err) {
      this.handleError(err, `delete legal checklist item failed ${id}`);
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

  // AI Analysis endpoints
  async performComprehensiveAIAnalysis(opportunityId: string): Promise<any> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${opportunityId}/ai-analysis/comprehensive`);
      return response.data;
    } catch (err) {
      this.handleError(err, `AI comprehensive analysis failed for ${opportunityId}`);
      throw err;
    }
  }

  async analyzeCompetition(opportunityId: string): Promise<any> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${opportunityId}/ai-analysis/competition`);
      return response.data;
    } catch (err) {
      this.handleError(err, `Competition analysis failed for ${opportunityId}`);
      throw err;
    }
  }

  async analyzeTechnicalFit(opportunityId: string): Promise<any> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${opportunityId}/ai-analysis/technical`);
      return response.data;
    } catch (err) {
      this.handleError(err, `Technical fit analysis failed for ${opportunityId}`);
      throw err;
    }
  }

  async analyzeFinancialViability(opportunityId: string): Promise<any> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${opportunityId}/ai-analysis/financial`);
      return response.data;
    } catch (err) {
      this.handleError(err, `Financial analysis failed for ${opportunityId}`);
      throw err;
    }
  }

  async getStrategicRecommendations(opportunityId: string): Promise<any> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${opportunityId}/ai-analysis/recommendations`);
      return response.data;
    } catch (err) {
      this.handleError(err, `Strategic recommendations failed for ${opportunityId}`);
      throw err;
    }
  }

  // Filter Presets endpoints
  async getFilterPresets(): Promise<any[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/filter-presets`);
      return response.data;
    } catch (err) {
      this.handleError(err, 'get filter presets failed');
      throw err;
    }
  }

  async createFilterPreset(data: { name: string; description?: string; filters: any; is_shared?: boolean; is_default?: boolean }): Promise<any> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/filter-presets`, data);
      return response.data;
    } catch (err) {
      this.handleError(err, 'create filter preset failed');
      throw err;
    }
  }

  async updateFilterPreset(presetId: string, data: { name?: string; description?: string; filters?: any; is_shared?: boolean; is_default?: boolean }): Promise<any> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/filter-presets/${presetId}`, data);
      return response.data;
    } catch (err) {
      this.handleError(err, `update filter preset failed ${presetId}`);
      throw err;
    }
  }

  async deleteFilterPreset(presetId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/filter-presets/${presetId}`);
    } catch (err) {
      this.handleError(err, `delete filter preset failed ${presetId}`);
      throw err;
    }
  }

  // Export endpoints
  async exportOpportunitiesToExcel(params?: any): Promise<Blob> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/export/excel`, {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (err) {
      this.handleError(err, 'Excel export failed');
      throw err;
    }
  }

  async exportOpportunitiesToPDF(params?: any): Promise<Blob> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/export/pdf`, {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (err) {
      this.handleError(err, 'PDF export failed');
      throw err;
    }
  }
}

export const opportunitiesApi = new OpportunitiesApiService();
export default opportunitiesApi;