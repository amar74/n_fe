// Opportunity Module Types
export interface Opportunity {
  id: string;
  custom_id?: string;
  org_id: string;
  created_by: string;
  account_id?: string;
  project_name: string;
  client_name: string;
  description?: string;
  stage: OpportunityStage;
  risk_level?: RiskLevel;
  project_value?: number;
  currency: string;
  my_role?: string;
  team_size?: number;
  expected_rfp_date?: string;
  deadline?: string;
  state?: string;
  market_sector?: string;
  match_score?: number;
  created_at: string;
  updated_at: string;
}

export enum OpportunityStage {
  LEAD = "lead",
  QUALIFICATION = "qualification",
  PROPOSAL_DEVELOPMENT = "proposal_development",
  RFP_RESPONSE = "rfp_response",
  SHORTLISTED = "shortlisted",
  PRESENTATION = "presentation",
  NEGOTIATION = "negotiation",
  WON = "won",
  LOST = "lost",
  ON_HOLD = "on_hold"
}

export enum RiskLevel {
  LOW_RISK = "low_risk",
  MEDIUM_RISK = "medium_risk",
  HIGH_RISK = "high_risk"
}

// API Request/Response Types
export interface CreateOpportunityRequest {
  project_name: string;
  client_name: string;
  description?: string;
  stage: OpportunityStage;
  risk_level?: RiskLevel;
  project_value?: number;
  currency?: string;
  my_role?: string;
  team_size?: number;
  expected_rfp_date?: string;
  deadline?: string;
  state?: string;
  market_sector?: string;
  match_score?: number;
}

export interface UpdateOpportunityRequest {
  project_name?: string;
  client_name?: string;
  description?: string;
  stage?: OpportunityStage;
  risk_level?: RiskLevel;
  project_value?: number;
  currency?: string;
  my_role?: string;
  team_size?: number;
  expected_rfp_date?: string;
  deadline?: string;
  state?: string;
  market_sector?: string;
  match_score?: number;
}

export interface OpportunityListResponse {
  opportunities: Opportunity[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}

export interface UpdateStageRequest {
  stage: OpportunityStage;
  notes?: string;
}

// Analytics Types
export interface OpportunityAnalytics {
  total_opportunities: number;
  total_value: number;
  opportunities_by_stage: Record<string, number>;
  opportunities_by_sector: Record<string, number>;
  opportunities_by_risk: Record<string, number>;
  win_rate: number;
  average_deal_size: number;
  pipeline_velocity: number;
}

export interface PipelineStage {
  stage: string;
  count: number;
  value: number;
  percentage: number;
}

export interface OpportunityPipelineResponse {
  stages: PipelineStage[];
  total_opportunities: number;
  total_value: number;
  conversion_rates: Record<string, number>;
  average_time_in_stage: Record<string, number>;
}

// Search Types
export interface OpportunitySearchRequest {
  query: string;
  filters?: Record<string, any>;
  limit?: number;
}

export interface OpportunitySearchResult {
  opportunity: Opportunity;
  relevance_score: number;
  match_reasons: string[];
}

// Insights Types
export interface OpportunityInsight {
  type: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  actionable: boolean;
  suggested_actions: string[];
}

export interface OpportunityInsightsResponse {
  opportunity_id: string;
  insights: OpportunityInsight[];
  generated_at: string;
  confidence_score: number;
}

// Forecast Types
export interface OpportunityForecast {
  period: "monthly" | "quarterly" | "yearly";
  forecasted_revenue: number;
  confidence_level: number;
  scenarios: {
    best_case: number;
    worst_case: number;
    most_likely: number;
  };
  factors: string[];
}

export interface OpportunityForecastResponse {
  opportunities: string[];
  forecast: OpportunityForecast;
  generated_at: string;
  next_review_date: string;
}

// UI State Types
export interface OpportunityFilters {
  stage?: OpportunityStage;
  risk_level?: RiskLevel;
  market_sector?: string;
  date_range?: {
    start: string;
    end: string;
  };
  value_range?: {
    min: number;
    max: number;
  };
}

export interface OpportunitySortOptions {
  field: "created_at" | "updated_at" | "project_name" | "client_name" | "project_value" | "stage";
  order: "asc" | "desc";
}

// Form Types
export interface OpportunityFormData {
  project_name: string;
  client_name: string;
  description: string;
  stage: OpportunityStage;
  risk_level: RiskLevel | "";
  project_value: string;
  currency: string;
  my_role: string;
  team_size: string;
  expected_rfp_date: string;
  deadline: string;
  state: string;
  market_sector: string;
  match_score: string;
}

// Constants
export const OPPORTUNITY_STAGE_LABELS: Record<OpportunityStage, string> = {
  [OpportunityStage.LEAD]: "Lead",
  [OpportunityStage.QUALIFICATION]: "Qualification",
  [OpportunityStage.PROPOSAL_DEVELOPMENT]: "Proposal Development",
  [OpportunityStage.RFP_RESPONSE]: "RFP Response",
  [OpportunityStage.SHORTLISTED]: "Shortlisted",
  [OpportunityStage.PRESENTATION]: "Presentation",
  [OpportunityStage.NEGOTIATION]: "Negotiation",
  [OpportunityStage.WON]: "Won",
  [OpportunityStage.LOST]: "Lost",
  [OpportunityStage.ON_HOLD]: "On Hold"
};

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  [RiskLevel.LOW_RISK]: "Low Risk",
  [RiskLevel.MEDIUM_RISK]: "Medium Risk",
  [RiskLevel.HIGH_RISK]: "High Risk"
};

export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  [RiskLevel.LOW_RISK]: "green",
  [RiskLevel.MEDIUM_RISK]: "yellow",
  [RiskLevel.HIGH_RISK]: "red"
};

export const STAGE_COLORS: Record<OpportunityStage, string> = {
  [OpportunityStage.LEAD]: "gray",
  [OpportunityStage.QUALIFICATION]: "blue",
  [OpportunityStage.PROPOSAL_DEVELOPMENT]: "purple",
  [OpportunityStage.RFP_RESPONSE]: "orange",
  [OpportunityStage.SHORTLISTED]: "yellow",
  [OpportunityStage.PRESENTATION]: "cyan",
  [OpportunityStage.NEGOTIATION]: "pink",
  [OpportunityStage.WON]: "green",
  [OpportunityStage.LOST]: "red",
  [OpportunityStage.ON_HOLD]: "gray"
};

export type OpportunityListParams = {
  page?: number;
  size?: number;
  stage?: OpportunityStage;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
};

export type OpportunityApiError = {
  detail: string | {
    error: {
      code: number;
      message: string;
      details?: string;
    };
  };
};