import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

import { HTTPValidationError } from "./common";
import { ValidationError } from "./common";
import { stage } from "./common";

const AgentFrequency = z.enum(["12h", "24h", "72h", "168h"]);
const AgentStatus = z.enum(["active", "paused", "disabled"]);
const OpportunityAgentCreate = z
  .object({
    name: z.string().max(255),
    prompt: z.string(),
    base_url: z.string().min(1).max(2083).url(),
    frequency: AgentFrequency.optional(),
    status: AgentStatus.optional(),
    source_id: z.union([z.string(), z.null()]).optional(),
    next_run_at: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const OpportunityAgentResponse = z
  .object({
    name: z.string().max(255),
    prompt: z.string(),
    base_url: z.string().min(1).max(2083).url(),
    frequency: AgentFrequency.optional(),
    status: AgentStatus.optional(),
    source_id: z.union([z.string(), z.null()]).optional(),
    next_run_at: z.union([z.string(), z.null()]).optional(),
    id: z.string().uuid(),
    org_id: z.string().uuid(),
    created_by: z.string().uuid(),
    last_run_at: z.union([z.string(), z.null()]).optional(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const OpportunityAgentUpdate = z
  .object({
    name: z.union([z.string(), z.null()]),
    prompt: z.union([z.string(), z.null()]),
    base_url: z.union([z.string(), z.null()]),
    frequency: z.union([AgentFrequency, z.null()]),
    status: z.union([AgentStatus, z.null()]),
    source_id: z.union([z.string(), z.null()]),
    next_run_at: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const OpportunityStage = z.enum([
  "lead",
  "qualification",
  "proposal_development",
  "rfp_response",
  "shortlisted",
  "presentation",
  "negotiation",
  "won",
  "lost",
  "on_hold",
]);
const RiskLevel = z.enum(["low_risk", "medium_risk", "high_risk"]);
const OpportunityCreate = z
  .object({
    project_name: z.string().min(1).max(500),
    client_name: z.string().min(1).max(255),
    account_id: z.union([z.string(), z.null()]).optional(),
    description: z.union([z.string(), z.null()]).optional(),
    stage: OpportunityStage.optional(),
    risk_level: z.union([RiskLevel, z.null()]).optional(),
    project_value: z.union([z.number(), z.null()]).optional(),
    currency: z.string().max(3).optional().default("USD"),
    my_role: z.union([z.string(), z.null()]).optional(),
    team_size: z.union([z.number(), z.null()]).optional(),
    expected_rfp_date: z.union([z.string(), z.null()]).optional(),
    deadline: z.union([z.string(), z.null()]).optional(),
    state: z.union([z.string(), z.null()]).optional(),
    market_sector: z.union([z.string(), z.null()]).optional(),
    match_score: z.union([z.number(), z.null()]).optional(),
  })
  .passthrough();
const OpportunityForecast = z
  .object({
    period: z.string(),
    forecasted_revenue: z.number(),
    confidence_level: z.number().gte(0).lte(100),
    scenarios: z.object({}).partial().passthrough(),
    factors: z.array(z.string()).optional(),
  })
  .passthrough();
const OpportunityForecastResponse = z
  .object({
    opportunities: z.array(z.string().uuid()),
    forecast: OpportunityForecast,
    generated_at: z.string().datetime({ offset: true }),
    next_review_date: z.string().datetime({ offset: true }),
  })
  .passthrough();
const OpportunityInsight = z
  .object({
    type: z.string(),
    title: z.string().max(200),
    description: z.string().max(1000),
    priority: z.string(),
    actionable: z.boolean().optional().default(false),
    suggested_actions: z.array(z.string()).optional(),
  })
  .passthrough();
const OpportunityInsightsResponse = z
  .object({
    opportunity_id: z.string().uuid(),
    insights: z.array(OpportunityInsight),
    generated_at: z.string().datetime({ offset: true }),
    confidence_score: z.number().gte(0).lte(100),
  })
  .passthrough();
const OpportunityResponse = z
  .object({
    id: z.string().uuid(),
    custom_id: z.union([z.string(), z.null()]).optional(),
    org_id: z.string().uuid(),
    created_by: z.string().uuid(),
    account_id: z.union([z.string(), z.null()]).optional(),
    project_name: z.string(),
    client_name: z.string(),
    description: z.union([z.string(), z.null()]).optional(),
    stage: z.string(),
    risk_level: z.union([z.string(), z.null()]).optional(),
    project_value: z.union([z.number(), z.null()]).optional(),
    currency: z.string(),
    my_role: z.union([z.string(), z.null()]).optional(),
    team_size: z.union([z.number(), z.null()]).optional(),
    expected_rfp_date: z.union([z.string(), z.null()]).optional(),
    deadline: z.union([z.string(), z.null()]).optional(),
    state: z.union([z.string(), z.null()]).optional(),
    market_sector: z.union([z.string(), z.null()]).optional(),
    match_score: z.union([z.number(), z.null()]).optional(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const OpportunityListResponse = z
  .object({
    opportunities: z.array(OpportunityResponse),
    total: z.number().int(),
    page: z.number().int(),
    size: z.number().int(),
    total_pages: z.number().int(),
  })
  .passthrough();
const OpportunityPipelineStage = z
  .object({
    stage: z.string(),
    count: z.number().int(),
    value: z.number(),
    percentage: z.number(),
  })
  .passthrough();
const OpportunityPipelineResponse = z
  .object({
    stages: z.array(OpportunityPipelineStage),
    total_opportunities: z.number().int(),
    total_value: z.number(),
    conversion_rates: z.object({}).partial().passthrough(),
    average_time_in_stage: z.object({}).partial().passthrough(),
  })
  .passthrough();
const SourceFrequency = z.enum(["daily", "weekly", "monthly", "manual"]);
const SourceStatus = z.enum(["active", "paused", "archived"]);
const OpportunitySourceCreate = z
  .object({
    name: z.string().max(255),
    url: z.string().min(1).max(2083).url(),
    category: z.union([z.string(), z.null()]).optional(),
    frequency: SourceFrequency.optional(),
    status: SourceStatus.optional(),
    tags: z.union([z.array(z.string()), z.null()]).optional(),
    notes: z.union([z.string(), z.null()]).optional(),
    is_auto_discovery_enabled: z.boolean().optional().default(true),
  })
  .passthrough();
const OpportunitySourceResponse = z
  .object({
    name: z.string().max(255),
    url: z.string().min(1).max(2083).url(),
    category: z.union([z.string(), z.null()]).optional(),
    frequency: SourceFrequency.optional(),
    status: SourceStatus.optional(),
    tags: z.union([z.array(z.string()), z.null()]).optional(),
    notes: z.union([z.string(), z.null()]).optional(),
    is_auto_discovery_enabled: z.boolean().optional().default(true),
    id: z.string().uuid(),
    org_id: z.string().uuid(),
    created_by: z.string().uuid(),
    last_run_at: z.union([z.string(), z.null()]).optional(),
    next_run_at: z.union([z.string(), z.null()]).optional(),
    last_success_at: z.union([z.string(), z.null()]).optional(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const OpportunitySourceUpdate = z
  .object({
    name: z.union([z.string(), z.null()]),
    url: z.union([z.string(), z.null()]),
    category: z.union([z.string(), z.null()]),
    frequency: z.union([SourceFrequency, z.null()]),
    status: z.union([SourceStatus, z.null()]),
    tags: z.union([z.array(z.string()), z.null()]),
    notes: z.union([z.string(), z.null()]),
    is_auto_discovery_enabled: z.union([z.boolean(), z.null()]),
  })
  .partial()
  .passthrough();
const OpportunityStageUpdate = z
  .object({
    stage: OpportunityStage,
    notes: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const TempStatus = z.enum([
  "pending_review",
  "approved",
  "rejected",
  "promoted",
]);
const OpportunityTempResponse = z
  .object({
    project_title: z.string(),
    client_name: z.union([z.string(), z.null()]).optional(),
    location: z.union([z.string(), z.null()]).optional(),
    budget_text: z.union([z.string(), z.null()]).optional(),
    deadline: z.union([z.string(), z.null()]).optional(),
    documents: z.union([z.array(z.string()), z.null()]).optional(),
    tags: z.union([z.array(z.string()), z.null()]).optional(),
    ai_summary: z.union([z.string(), z.null()]).optional(),
    ai_metadata: z
      .union([z.object({}).partial().passthrough(), z.null()])
      .optional(),
    raw_payload: z.object({}).partial().passthrough(),
    match_score: z.union([z.number(), z.null()]).optional(),
    risk_score: z.union([z.number(), z.null()]).optional(),
    strategic_fit_score: z.union([z.number(), z.null()]).optional(),
    reviewer_notes: z.union([z.string(), z.null()]).optional(),
    id: z.string().uuid(),
    org_id: z.string().uuid(),
    source_id: z.union([z.string(), z.null()]).optional(),
    history_id: z.union([z.string(), z.null()]).optional(),
    reviewer_id: z.union([z.string(), z.null()]).optional(),
    temp_identifier: z.string(),
    status: TempStatus,
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const OpportunityTempUpdate = z
  .object({
    status: z.union([TempStatus, z.null()]),
    reviewer_notes: z.union([z.string(), z.null()]),
    match_score: z.union([z.number(), z.null()]),
    risk_score: z.union([z.number(), z.null()]),
    strategic_fit_score: z.union([z.number(), z.null()]),
    location: z.union([z.string(), z.null()]),
    project_title: z.union([z.string(), z.null()]),
    client_name: z.union([z.string(), z.null()]),
    budget_text: z.union([z.string(), z.null()]),
    deadline: z.union([z.string(), z.null()]),
    tags: z.union([z.array(z.string()), z.null()]),
    ai_summary: z.union([z.string(), z.null()]),
    source_url: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const OpportunityUpdate = z
  .object({
    project_name: z.union([z.string(), z.null()]),
    client_name: z.union([z.string(), z.null()]),
    account_id: z.union([z.string(), z.null()]),
    description: z.union([z.string(), z.null()]),
    stage: z.union([OpportunityStage, z.null()]),
    risk_level: z.union([RiskLevel, z.null()]),
    project_value: z.union([z.number(), z.null()]),
    currency: z.union([z.string(), z.null()]),
    my_role: z.union([z.string(), z.null()]),
    team_size: z.union([z.number(), z.null()]),
    expected_rfp_date: z.union([z.string(), z.null()]),
    deadline: z.union([z.string(), z.null()]),
    state: z.union([z.string(), z.null()]),
    market_sector: z.union([z.string(), z.null()]),
    match_score: z.union([z.number(), z.null()]),
  })
  .partial()
  .passthrough();
const OpportunityAnalytics = z
  .object({
    total_opportunities: z.number().int(),
    total_value: z.number(),
    opportunities_by_stage: z.object({}).partial().passthrough(),
    opportunities_by_sector: z.object({}).partial().passthrough(),
    opportunities_by_risk: z.object({}).partial().passthrough(),
    win_rate: z.number(),
    average_deal_size: z.number(),
    pipeline_velocity: z.number(),
  })
  .passthrough();
const OpportunitySearchRequest = z
  .object({
    query: z.string().min(1).max(500),
    filters: z
      .union([z.object({}).partial().passthrough(), z.null()])
      .optional(),
    limit: z.number().int().gte(1).lte(100).optional().default(10),
  })
  .passthrough();
const status = z.union([TempStatus, z.null()]).optional();
const OpportunityTempCreate = z
  .object({
    project_title: z.string(),
    client_name: z.union([z.string(), z.null()]).optional(),
    location: z.union([z.string(), z.null()]).optional(),
    budget_text: z.union([z.string(), z.null()]).optional(),
    deadline: z.union([z.string(), z.null()]).optional(),
    documents: z.union([z.array(z.string()), z.null()]).optional(),
    tags: z.union([z.array(z.string()), z.null()]).optional(),
    ai_summary: z.union([z.string(), z.null()]).optional(),
    ai_metadata: z
      .union([z.object({}).partial().passthrough(), z.null()])
      .optional(),
    raw_payload: z.object({}).partial().passthrough(),
    match_score: z.union([z.number(), z.null()]).optional(),
    risk_score: z.union([z.number(), z.null()]).optional(),
    strategic_fit_score: z.union([z.number(), z.null()]).optional(),
    reviewer_notes: z.union([z.string(), z.null()]).optional(),
    source_id: z.union([z.string(), z.null()]).optional(),
    history_id: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const promote_temp_opportunity_api_opportunities_ingestion_temp__temp_id__promote_post_Body =
  z.union([TempOpportunityPromoteRequest, z.null()]);

export const schemas = {
  AgentFrequency,
  AgentStatus,
  OpportunityAgentCreate,
  OpportunityAgentResponse,
  OpportunityAgentUpdate,
  OpportunityStage,
  RiskLevel,
  OpportunityCreate,
  OpportunityForecast,
  OpportunityForecastResponse,
  OpportunityInsight,
  OpportunityInsightsResponse,
  OpportunityResponse,
  OpportunityListResponse,
  OpportunityPipelineStage,
  OpportunityPipelineResponse,
  SourceFrequency,
  SourceStatus,
  OpportunitySourceCreate,
  OpportunitySourceResponse,
  OpportunitySourceUpdate,
  OpportunityStageUpdate,
  TempStatus,
  OpportunityTempResponse,
  OpportunityTempUpdate,
  OpportunityUpdate,
  OpportunityAnalytics,
  OpportunitySearchRequest,
  status,
  OpportunityTempCreate,
  promote_temp_opportunity_api_opportunities_ingestion_temp__temp_id__promote_post_Body,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/api/opportunities/",
    alias: "create_opportunity_api_opportunities__post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: OpportunityCreate,
      },
    ],
    response: OpportunityResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/opportunities/",
    alias: "list_opportunities_api_opportunities__get",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "size",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(10),
      },
      {
        name: "stage",
        type: "Query",
        schema: stage,
      },
      {
        name: "search",
        type: "Query",
        schema: stage,
      },
      {
        name: "sort_by",
        type: "Query",
        schema: z.string().optional().default("created_at"),
      },
      {
        name: "sort_order",
        type: "Query",
        schema: z
          .string()
          .regex(/^(asc|desc)$/)
          .optional()
          .default("desc"),
      },
    ],
    response: OpportunityListResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/opportunities/:opportunity_id",
    alias: "get_opportunity_api_opportunities__opportunity_id__get",
    requestFormat: "json",
    parameters: [
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: OpportunityResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "put",
    path: "/api/opportunities/:opportunity_id",
    alias: "update_opportunity_api_opportunities__opportunity_id__put",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: OpportunityUpdate,
      },
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: OpportunityResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "delete",
    path: "/api/opportunities/:opportunity_id",
    alias: "delete_opportunity_api_opportunities__opportunity_id__delete",
    requestFormat: "json",
    parameters: [
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "put",
    path: "/api/opportunities/:opportunity_id/stage",
    alias:
      "update_opportunity_stage_api_opportunities__opportunity_id__stage_put",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: OpportunityStageUpdate,
      },
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: OpportunityResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/opportunities/analytics/dashboard",
    alias:
      "get_opportunity_analytics_api_opportunities_analytics_dashboard_get",
    requestFormat: "json",
    parameters: [
      {
        name: "days",
        type: "Query",
        schema: z.number().int().gte(1).lte(365).optional().default(30),
      },
    ],
    response: OpportunityAnalytics,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/opportunities/pipeline/view",
    alias: "get_opportunity_pipeline_api_opportunities_pipeline_view_get",
    requestFormat: "json",
    response: OpportunityPipelineResponse,
  },
  {
    method: "post",
    path: "/api/opportunities/search/ai",
    alias: "search_opportunities_ai_api_opportunities_search_ai_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: OpportunitySearchRequest,
      },
    ],
    response: z.array(OpportunitySearchResult),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/opportunities/:opportunity_id/insights",
    alias:
      "get_opportunity_insights_api_opportunities__opportunity_id__insights_get",
    requestFormat: "json",
    parameters: [
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: OpportunityInsightsResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/opportunities/:opportunity_id/forecast",
    alias:
      "get_opportunity_forecast_api_opportunities__opportunity_id__forecast_get",
    requestFormat: "json",
    parameters: [
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "period",
        type: "Query",
        schema: z
          .string()
          .regex(/^(monthly|quarterly|yearly)$/)
          .optional()
          .default("quarterly"),
      },
    ],
    response: OpportunityForecastResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/opportunities/export/csv",
    alias: "export_opportunities_csv_api_opportunities_export_csv_get",
    requestFormat: "json",
    parameters: [
      {
        name: "stage",
        type: "Query",
        schema: stage,
      },
    ],
    response: z.unknown(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/opportunities/by-account/:account_id",
    alias:
      "list_opportunities_by_account_api_opportunities_by_account__account_id__get",
    requestFormat: "json",
    parameters: [
      {
        name: "account_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "size",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(10),
      },
      {
        name: "stage",
        type: "Query",
        schema: stage,
      },
    ],
    response: OpportunityListResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/opportunities/health/check",
    alias: "health_check_api_opportunities_health_check_get",
    requestFormat: "json",
    response: z.unknown(),
  },
  {
    method: "get",
    path: "/api/opportunities/ingestion/sources",
    alias: "list_sources_api_opportunities_ingestion_sources_get",
    requestFormat: "json",
    response: z.array(OpportunitySourceResponse),
  },
  {
    method: "post",
    path: "/api/opportunities/ingestion/sources",
    alias: "create_source_api_opportunities_ingestion_sources_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: OpportunitySourceCreate,
      },
    ],
    response: OpportunitySourceResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "put",
    path: "/api/opportunities/ingestion/sources/:source_id",
    alias: "update_source_api_opportunities_ingestion_sources__source_id__put",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: OpportunitySourceUpdate,
      },
      {
        name: "source_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: OpportunitySourceResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "delete",
    path: "/api/opportunities/ingestion/sources/:source_id",
    alias:
      "delete_source_api_opportunities_ingestion_sources__source_id__delete",
    requestFormat: "json",
    parameters: [
      {
        name: "source_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/opportunities/ingestion/sources/:source_id/history",
    alias:
      "list_source_history_api_opportunities_ingestion_sources__source_id__history_get",
    requestFormat: "json",
    parameters: [
      {
        name: "source_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(200).optional().default(50),
      },
    ],
    response: z.array(ScrapeHistoryResponse),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/opportunities/ingestion/history",
    alias: "list_history_api_opportunities_ingestion_history_get",
    requestFormat: "json",
    parameters: [
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(200).optional().default(50),
      },
    ],
    response: z.array(ScrapeHistoryResponse),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/opportunities/ingestion/temp",
    alias: "list_temp_opportunities_api_opportunities_ingestion_temp_get",
    requestFormat: "json",
    parameters: [
      {
        name: "status",
        type: "Query",
        schema: status,
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(200).optional().default(100),
      },
    ],
    response: z.array(OpportunityTempResponse),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/api/opportunities/ingestion/temp",
    alias: "create_temp_opportunity_api_opportunities_ingestion_temp_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: OpportunityTempCreate,
      },
    ],
    response: OpportunityTempResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "patch",
    path: "/api/opportunities/ingestion/temp/:temp_id",
    alias:
      "update_temp_opportunity_api_opportunities_ingestion_temp__temp_id__patch",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: OpportunityTempUpdate,
      },
      {
        name: "temp_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: OpportunityTempResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/api/opportunities/ingestion/temp/:temp_id/refresh",
    alias:
      "refresh_temp_opportunity_api_opportunities_ingestion_temp__temp_id__refresh_post",
    requestFormat: "json",
    parameters: [
      {
        name: "temp_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: OpportunityTempResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/api/opportunities/ingestion/temp/:temp_id/promote",
    alias:
      "promote_temp_opportunity_api_opportunities_ingestion_temp__temp_id__promote_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema:
          promote_temp_opportunity_api_opportunities_ingestion_temp__temp_id__promote_post_Body,
      },
      {
        name: "temp_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: OpportunityResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/opportunities/ingestion/agents",
    alias: "list_agents_api_opportunities_ingestion_agents_get",
    requestFormat: "json",
    response: z.array(OpportunityAgentResponse),
  },
  {
    method: "post",
    path: "/api/opportunities/ingestion/agents",
    alias: "create_agent_api_opportunities_ingestion_agents_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: OpportunityAgentCreate,
      },
    ],
    response: OpportunityAgentResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "put",
    path: "/api/opportunities/ingestion/agents/:agent_id",
    alias: "update_agent_api_opportunities_ingestion_agents__agent_id__put",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: OpportunityAgentUpdate,
      },
      {
        name: "agent_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: OpportunityAgentResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "delete",
    path: "/api/opportunities/ingestion/agents/:agent_id",
    alias: "delete_agent_api_opportunities_ingestion_agents__agent_id__delete",
    requestFormat: "json",
    parameters: [
      {
        name: "agent_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/opportunities/ingestion/agents/:agent_id/runs",
    alias:
      "list_agent_runs_api_opportunities_ingestion_agents__agent_id__runs_get",
    requestFormat: "json",
    parameters: [
      {
        name: "agent_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(200).optional().default(50),
      },
    ],
    response: z.array(OpportunityAgentRunResponse),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
]);



export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
