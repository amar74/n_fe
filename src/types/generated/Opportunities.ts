import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

import { HTTPValidationError } from "./common";
import { ValidationError } from "./common";
import { search } from "./common";

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
const OpportunityStageUpdate = z
  .object({
    stage: OpportunityStage,
    notes: z.union([z.string(), z.null()]).optional(),
  })
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

export const schemas = {
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
  OpportunityStageUpdate,
  OpportunityUpdate,
  OpportunityAnalytics,
  OpportunitySearchRequest,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/opportunities/",
    alias: "create_opportunity_opportunities__post",
    description: `Create a new opportunity.

Requires &#x27;create&#x27; permission for opportunities.`,
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
    path: "/opportunities/",
    alias: "list_opportunities_opportunities__get",
    description: `List opportunities with pagination and filtering.

Requires &#x27;view&#x27; permission for opportunities.`,
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
        schema: search,
      },
      {
        name: "search",
        type: "Query",
        schema: search,
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
    path: "/opportunities/:opportunity_id",
    alias: "get_opportunity_opportunities__opportunity_id__get",
    description: `Get opportunity by ID.

Requires &#x27;view&#x27; permission for opportunities.`,
    requestFormat: "json",
    parameters: [
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
    method: "put",
    path: "/opportunities/:opportunity_id",
    alias: "update_opportunity_opportunities__opportunity_id__put",
    description: `Update an existing opportunity.

Requires &#x27;edit&#x27; permission for opportunities.`,
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
    path: "/opportunities/:opportunity_id",
    alias: "delete_opportunity_opportunities__opportunity_id__delete",
    description: `Delete an opportunity.

Requires &#x27;delete&#x27; permission for opportunities.`,
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
    path: "/opportunities/:opportunity_id/stage",
    alias: "update_opportunity_stage_opportunities__opportunity_id__stage_put",
    description: `Update opportunity stage.

Requires &#x27;edit&#x27; permission for opportunities.`,
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
    path: "/opportunities/analytics/dashboard",
    alias: "get_opportunity_analytics_opportunities_analytics_dashboard_get",
    description: `Get opportunity analytics dashboard.

Requires &#x27;view&#x27; permission for opportunities.`,
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
    path: "/opportunities/pipeline/view",
    alias: "get_opportunity_pipeline_opportunities_pipeline_view_get",
    description: `Get opportunity pipeline view.

Requires &#x27;view&#x27; permission for opportunities.`,
    requestFormat: "json",
    response: OpportunityPipelineResponse,
  },
  {
    method: "post",
    path: "/opportunities/search/ai",
    alias: "search_opportunities_ai_opportunities_search_ai_post",
    description: `AI-powered opportunity search.

Requires &#x27;view&#x27; permission for opportunities.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: OpportunitySearchRequest,
      },
    ],
    response: z.array(OpportunityResponse),
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
    path: "/opportunities/:opportunity_id/insights",
    alias:
      "get_opportunity_insights_opportunities__opportunity_id__insights_get",
    description: `Generate AI insights for an opportunity.

Requires &#x27;view&#x27; permission for opportunities.`,
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
    path: "/opportunities/:opportunity_id/forecast",
    alias:
      "get_opportunity_forecast_opportunities__opportunity_id__forecast_get",
    description: `Get opportunity forecast.

Requires &#x27;view&#x27; permission for opportunities.`,
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
    path: "/opportunities/export/csv",
    alias: "export_opportunities_csv_opportunities_export_csv_get",
    description: `Export opportunities to CSV.

Requires &#x27;view&#x27; permission for opportunities.`,
    requestFormat: "json",
    parameters: [
      {
        name: "stage",
        type: "Query",
        schema: search,
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
    path: "/opportunities/by-account/:account_id",
    alias:
      "list_opportunities_by_account_opportunities_by_account__account_id__get",
    description: `List opportunities for a specific account.

Requires &#x27;view&#x27; permission for opportunities.`,
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
        schema: search,
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
    path: "/opportunities/health/check",
    alias: "health_check_opportunities_health_check_get",
    description: `Health check endpoint for opportunities module.`,
    requestFormat: "json",
    response: z.unknown(),
  },
]);


export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
