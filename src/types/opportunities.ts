
export const OpportunityStage = {
  LEAD: "lead",
  QUALIFICATION: "qualification",
  PROPOSAL_DEVELOPMENT: "proposal_development",
  RFP_RESPONSE: "rfp_response",
  SHORTLISTED: "shortlisted",
  PRESENTATION: "presentation",
  NEGOTIATION: "negotiation",
  WON: "won",
  LOST: "lost",
  ON_HOLD: "on_hold",
} as const;

export const RiskLevel = {
  LOW_RISK: "low_risk",
  MEDIUM_RISK: "medium_risk",
  HIGH_RISK: "high_risk",
} as const;

export type OpportunityStageType = typeof OpportunityStage[keyof typeof OpportunityStage];
export type RiskLevelType = typeof RiskLevel[keyof typeof RiskLevel];

export interface OpportunityCreate {
  project_name: string;
  client_name: string;
  account_id?: string | null;
  description?: string | null;
  stage?: OpportunityStageType;
  risk_level?: RiskLevelType | null;
  project_value?: number | null;
  currency?: string;
  my_role?: string | null;
  team_size?: number | null;
  expected_rfp_date?: string | null;
  deadline?: string | null;
  state?: string | null;
  market_sector?: string | null;
  match_score?: number | null;
}

export interface OpportunityResponse {
  id: string;
  custom_id?: string | null;
  org_id: string;
  created_by: string;
  account_id?: string | null;
  project_name: string;
  client_name: string;
  description?: string | null;
  stage: string;
  risk_level?: string | null;
  project_value?: number | null;
  currency: string;
  my_role?: string | null;
  team_size?: number | null;
  expected_rfp_date?: string | null;
  deadline?: string | null;
  state?: string | null;
  market_sector?: string | null;
  match_score?: number | null;
  created_at: string;
  updated_at: string;
}

export type Opportunity = OpportunityResponse;

export interface OpportunityListResponse {
  opportunities: OpportunityResponse[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}

export interface OpportunityPipelineStage {
  stage: string;
  count: number;
  value: number;
  percentage: number;
}

export interface OpportunityPipelineResponse {
  stages: OpportunityPipelineStage[];
  total_opportunities: number;
  total_value: number;
  conversion_rates: Record<string, unknown>;
  average_time_in_stage: Record<string, unknown>;
}

export interface OpportunityStageUpdate {
  stage: OpportunityStageType;
  notes?: string | null;
}

export interface OpportunityUpdate {
  project_name?: string | null;
  client_name?: string | null;
  account_id?: string | null;
  description?: string | null;
  stage?: OpportunityStageType | null;
  risk_level?: RiskLevelType | null;
  project_value?: number | null;
  currency?: string | null;
  my_role?: string | null;
  team_size?: number | null;
  expected_rfp_date?: string | null;
  deadline?: string | null;
  state?: string | null;
  market_sector?: string | null;
  match_score?: number | null;
}

export interface OpportunityAnalytics {
  total_opportunities: number;
  total_value: number;
  opportunities_by_stage: Record<string, unknown>;
  opportunities_by_sector: Record<string, unknown>;
  opportunities_by_risk: Record<string, unknown>;
  win_rate: number;
  average_deal_size: number;
  pipeline_velocity: number;
}

export interface OpportunitySearchRequest {
  query: string;
  filters?: Record<string, unknown> | null;
  limit?: number;
}

export interface OpportunityForecast {
  period: string;
  forecasted_revenue: number;
  confidence_level: number;
  scenarios: Record<string, unknown>;
  factors?: string[];
}

export interface OpportunityForecastResponse {
  opportunities: string[];
  forecast: OpportunityForecast;
  generated_at: string;
  next_review_date: string;
}

export interface OpportunityInsight {
  type: string;
  title: string;
  description: string;
  priority: string;
  actionable?: boolean;
  suggested_actions?: string[];
}

export interface OpportunityInsightsResponse {
  opportunity_id: string;
  insights: OpportunityInsight[];
  generated_at: string;
  confidence_score: number;
}

export type CreateOpportunityRequest = OpportunityCreate;
export type UpdateOpportunityRequest = OpportunityUpdate;
export type UpdateStageRequest = OpportunityStageUpdate;
export type OpportunitySearchResult = OpportunityResponse;

export interface OpportunityListParams {
  page?: number;
  size?: number;
  stage?: string;
  risk_level?: string;
  search?: string;
}
