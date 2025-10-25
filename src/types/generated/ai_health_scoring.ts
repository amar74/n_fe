import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

import { HTTPValidationError } from "./common";
import { ValidationError } from "./common";

const HealthScoreResponse = z
  .object({
    account_id: z.string().uuid(),
    ai_health_score: z.string().regex(/^(?!^[-+.]*$)[+-]?0*\d*\.?\d*$/),
    health_trend: z.string(),
    risk_level: z.string(),
    last_ai_analysis: z.string().datetime({ offset: true }),
    data_quality_score: z.string().regex(/^(?!^[-+.]*$)[+-]?0*\d*\.?\d*$/),
    revenue_growth: z.string().regex(/^(?!^[-+.]*$)[+-]?0*\d*\.?\d*$/),
    communication_frequency: z.string().regex(/^(?!^[-+.]*$)[+-]?0*\d*\.?\d*$/),
    win_rate: z.string().regex(/^(?!^[-+.]*$)[+-]?0*\d*\.?\d*$/),
    score_breakdown: z.object({}).partial().passthrough(),
    recommendations: z.array(z.string()).optional().default([]),
    warnings: z.array(z.string()).optional().default([]),
  })
  .passthrough();
const BatchHealthScoreResponse = z
  .object({
    total_accounts: z.number().int(),
    processed_accounts: z.number().int(),
    successful_calculations: z.number().int(),
    failed_calculations: z.number().int(),
    processing_time_ms: z.number().int(),
    results: z.array(HealthScoreResponse).optional().default([]),
    errors: z
      .array(z.object({}).partial().passthrough())
      .optional()
      .default([]),
  })
  .passthrough();
const HealthScoreRequest = z
  .object({
    account_id: z.string().uuid(),
    force_recalculation: z.boolean().optional().default(false),
  })
  .passthrough();
const BatchHealthScoreRequest = z
  .object({
    account_ids: z.array(z.string().uuid()),
    force_recalculation: z.boolean().optional().default(false),
  })
  .passthrough();
const HealthAnalyticsResponse = z
  .object({
    total_accounts: z.number().int(),
    average_health_score: z.string().regex(/^(?!^[-+.]*$)[+-]?0*\d*\.?\d*$/),
    health_score_distribution: z.record(z.number().int()),
    risk_level_distribution: z.record(z.number().int()),
    trend_analysis: z.object({}).partial().passthrough(),
    top_performing_accounts: z
      .array(z.object({}).partial().passthrough())
      .optional()
      .default([]),
    accounts_needing_attention: z
      .array(z.object({}).partial().passthrough())
      .optional()
      .default([]),
    recommendations: z.array(z.string()).optional().default([]),
  })
  .passthrough();
const HealthScoreInsights = z
  .object({
    account_id: z.string().uuid(),
    account_name: z.string(),
    health_summary: z.string(),
    strengths: z.array(z.string()).optional().default([]),
    weaknesses: z.array(z.string()).optional().default([]),
    opportunities: z.array(z.string()).optional().default([]),
    risks: z.array(z.string()).optional().default([]),
    action_items: z.array(z.string()).optional().default([]),
    priority_score: z.number().int(),
    next_review_date: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();

export const schemas = {
  HealthScoreResponse,
  BatchHealthScoreResponse,
  HealthScoreRequest,
  BatchHealthScoreRequest,
  HealthAnalyticsResponse,
  HealthScoreInsights,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/api/ai/health-scoring/calculate/:account_id",
    alias: "calculateAccountHealthScore",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: HealthScoreRequest,
      },
      {
        name: "account_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: HealthScoreResponse,
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
    path: "/api/ai/health-scoring/:account_id",
    alias: "getAccountHealthScore",
    requestFormat: "json",
    parameters: [
      {
        name: "account_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: HealthScoreResponse,
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
    path: "/api/ai/health-scoring/batch",
    alias: "calculateBatchHealthScores",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: BatchHealthScoreRequest,
      },
    ],
    response: BatchHealthScoreResponse,
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
    path: "/api/ai/health-scoring/analytics/dashboard",
    alias: "getHealthAnalytics",
    requestFormat: "json",
    parameters: [
      {
        name: "time_period",
        type: "Query",
        schema: z.string().optional().default("30d"),
      },
      {
        name: "include_trends",
        type: "Query",
        schema: z.boolean().optional().default(true),
      },
    ],
    response: HealthAnalyticsResponse,
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
    path: "/api/ai/health-scoring/:account_id/insights",
    alias: "getAccountHealthInsights",
    requestFormat: "json",
    parameters: [
      {
        name: "account_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: HealthScoreInsights,
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
