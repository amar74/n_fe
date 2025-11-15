export type SourceFrequency = 'daily' | 'weekly' | 'monthly' | 'manual';
export type SourceStatus = 'active' | 'paused' | 'archived';
export type ScrapeStatus = 'queued' | 'running' | 'success' | 'error' | 'skipped';
export type TempStatus = 'pending_review' | 'approved' | 'rejected' | 'promoted';
export type AgentFrequency = '12h' | '24h' | '72h' | '168h';
export type AgentStatus = 'active' | 'paused' | 'disabled';
export type AgentRunStatus = 'running' | 'succeeded' | 'failed';

export interface OpportunitySourceResponse {
  id: string;
  org_id: string;
  created_by: string;
  name: string;
  url: string;
  category: string | null;
  frequency: SourceFrequency;
  status: SourceStatus;
  tags: string[] | null;
  notes: string | null;
  is_auto_discovery_enabled: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  last_success_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OpportunitySourceCreate {
  name: string;
  url: string;
  category?: string | null;
  frequency?: SourceFrequency;
  status?: SourceStatus;
  tags?: string[] | null;
  notes?: string | null;
  is_auto_discovery_enabled?: boolean;
}

export interface OpportunitySourceUpdate extends Partial<OpportunitySourceCreate> {}

export interface ScrapeHistoryResponse {
  id: string;
  source_id: string;
  agent_id: string | null;
  url: string;
  status: ScrapeStatus;
  error_message: string | null;
  scraped_at: string;
  completed_at: string | null;
  ai_summary: string | null;
  extracted_data: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
}

export interface OpportunityTempResponse {
  id: string;
  org_id: string;
  source_id: string | null;
  history_id: string | null;
  reviewer_id: string | null;
  temp_identifier: string;
  project_title: string;
  client_name: string | null;
  location: string | null;
  budget_text: string | null;
  deadline: string | null;
  documents: string[] | null;
  tags: string[] | null;
  ai_summary: string | null;
  ai_metadata: Record<string, unknown> | null;
  raw_payload: Record<string, unknown>;
  match_score: number | null;
  risk_score: number | null;
  strategic_fit_score: number | null;
  status: TempStatus;
  reviewer_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OpportunityTempCreate {
  source_id?: string | null;
  history_id?: string | null;
  project_title: string;
  client_name?: string | null;
  location?: string | null;
  budget_text?: string | null;
  deadline?: string | null;
  documents?: string[] | null;
  tags?: string[] | null;
  ai_summary?: string | null;
  ai_metadata?: Record<string, unknown> | null;
  raw_payload: Record<string, unknown>;
  match_score?: number | null;
  risk_score?: number | null;
  strategic_fit_score?: number | null;
  reviewer_notes?: string | null;
}

export interface OpportunityTempUpdate {
  status?: TempStatus;
  reviewer_notes?: string | null;
  match_score?: number | null;
  risk_score?: number | null;
  strategic_fit_score?: number | null;
  location?: string | null;
  project_title?: string | null;
  client_name?: string | null;
  budget_text?: string | null;
  deadline?: string | null;
  tags?: string[] | null;
  ai_summary?: string | null;
  source_url?: string | null;
}

export interface OpportunityAgentResponse {
  id: string;
  org_id: string;
  created_by: string;
  source_id: string | null;
  name: string;
  prompt: string;
  base_url: string;
  frequency: AgentFrequency;
  status: AgentStatus;
  last_run_at: string | null;
  next_run_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OpportunityAgentCreate {
  source_id?: string | null;
  name: string;
  prompt: string;
  base_url: string;
  frequency?: AgentFrequency;
  status?: AgentStatus;
  next_run_at?: string | null;
}

export interface OpportunityAgentUpdate extends Partial<OpportunityAgentCreate> {}

export interface OpportunityAgentRunResponse {
  id: string;
  agent_id: string;
  org_id: string;
  status: AgentRunStatus;
  started_at: string;
  finished_at: string | null;
  new_opportunities: number;
  error_message: string | null;
  metadata: Record<string, unknown> | null;
}

