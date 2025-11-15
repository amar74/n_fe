import { apiClient } from './client';
import type {
  OpportunitySourceCreate,
  OpportunitySourceResponse,
  OpportunitySourceUpdate,
  ScrapeHistoryResponse,
  OpportunityTempCreate,
  OpportunityTempResponse,
  OpportunityTempUpdate,
  OpportunityAgentCreate,
  OpportunityAgentResponse,
  OpportunityAgentRunResponse,
  OpportunityAgentUpdate,
  TempStatus,
} from '@/types/opportunityIngestion';
import type { OpportunityResponse } from '@/types/opportunities';

class OpportunityIngestionApiService {
  private readonly basePath = '/opportunities/ingestion';

  listSources() {
    return apiClient
      .get<OpportunitySourceResponse[]>(`${this.basePath}/sources`)
      .then(res => res.data);
  }

  createSource(payload: OpportunitySourceCreate) {
    return apiClient
      .post<OpportunitySourceResponse>(`${this.basePath}/sources`, payload)
      .then(res => res.data);
  }

  updateSource(sourceId: string, payload: OpportunitySourceUpdate) {
    return apiClient
      .put<OpportunitySourceResponse>(`${this.basePath}/sources/${sourceId}`, payload)
      .then(res => res.data);
  }

  deleteSource(sourceId: string) {
    return apiClient.delete<void>(`${this.basePath}/sources/${sourceId}`).then(() => undefined);
  }

  listHistory(params?: { sourceId?: string; limit?: number }) {
    const { sourceId, limit } = params ?? {};
    const query = new URLSearchParams();
    if (limit) query.append('limit', limit.toString());
    const endpoint = sourceId
      ? `${this.basePath}/sources/${sourceId}/history?${query.toString()}`
      : `${this.basePath}/history?${query.toString()}`;
    return apiClient
      .get<ScrapeHistoryResponse[]>(endpoint)
      .then(res => res.data);
  }

  listTemp(params?: { status?: TempStatus; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.limit) query.append('limit', params.limit.toString());
    return apiClient
      .get<OpportunityTempResponse[]>(`${this.basePath}/temp?${query.toString()}`)
      .then(res => res.data);
  }

  createTemp(payload: OpportunityTempCreate) {
    return apiClient
      .post<OpportunityTempResponse>(`${this.basePath}/temp`, payload)
      .then(res => res.data);
  }

  updateTemp(tempId: string, payload: OpportunityTempUpdate) {
    return apiClient
      .patch<OpportunityTempResponse>(`${this.basePath}/temp/${tempId}`, payload)
      .then(res => res.data);
  }

  promoteTemp(tempId: string, accountId?: string) {
    const payload = accountId ? { account_id: accountId } : undefined;
    return apiClient
      .post<OpportunityResponse>(`${this.basePath}/temp/${tempId}/promote`, payload)
      .then(res => res.data);
  }

  refreshTemp(tempId: string) {
    return apiClient
      .post<OpportunityTempResponse>(`${this.basePath}/temp/${tempId}/refresh`)
      .then(res => res.data);
  }

  listAgents() {
    return apiClient
      .get<OpportunityAgentResponse[]>(`${this.basePath}/agents`)
      .then(res => res.data);
  }

  createAgent(payload: OpportunityAgentCreate) {
    return apiClient
      .post<OpportunityAgentResponse>(`${this.basePath}/agents`, payload)
      .then(res => res.data);
  }

  updateAgent(agentId: string, payload: OpportunityAgentUpdate) {
    return apiClient
      .put<OpportunityAgentResponse>(`${this.basePath}/agents/${agentId}`, payload)
      .then(res => res.data);
  }

  deleteAgent(agentId: string) {
    return apiClient.delete<void>(`${this.basePath}/agents/${agentId}`).then(() => undefined);
  }

  listAgentRuns(agentId: string, limit = 50) {
    return apiClient
      .get<OpportunityAgentRunResponse[]>(`${this.basePath}/agents/${agentId}/runs?limit=${limit}`)
      .then(res => res.data);
  }
}

export const opportunityIngestionApi = new OpportunityIngestionApiService();

