import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

import { HTTPValidationError } from "./common";
import { ValidationError } from "./common";

const SuggestionValue = z
  .object({
    value: z.unknown(),
    confidence: z.number().gte(0).lte(1),
    source: z.string(),
    reasoning: z.union([z.string(), z.null()]).optional(),
    should_auto_apply: z.boolean().optional().default(false),
  })
  .passthrough();
const AccountEnhancementResponse = z
  .object({
    enhanced_data: z.record(SuggestionValue),
    processing_time_ms: z.number().int(),
    warnings: z.array(z.string()).optional(),
    suggestions_applied: z.number().int().optional().default(0),
  })
  .passthrough();
const AccountEnhancementRequest = z
  .object({
    company_website: z.string().min(1).max(2083).url(),
    partial_data: z.object({}).partial().passthrough().optional(),
    enhancement_options: z.record(z.boolean()).optional(),
  })
  .passthrough();
const AIRefreshRequest = z
  .object({ opportunity_id: z.string(), project_url: z.string() })
  .passthrough();
const AISuggestionResponse = z
  .object({
    id: z.string(),
    suggestion: z.string(),
    confidence_score: z.number(),
    suggestion_type: z.string(),
    context: z.string(),
    created_at: z.string().datetime({ offset: true }),
    user_id: z.union([z.string(), z.null()]).optional(),
    account_id: z.union([z.string(), z.null()]).optional(),
    opportunity_id: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const AISuggestionRequest = z
  .object({
    context: z.string(),
    suggestion_type: z.string(),
    user_id: z.union([z.string(), z.null()]).optional(),
    account_id: z.union([z.string(), z.null()]).optional(),
    opportunity_id: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();

export const schemas = {
  SuggestionValue,
  AccountEnhancementResponse,
  AccountEnhancementRequest,
  AIRefreshRequest,
  AISuggestionResponse,
  AISuggestionRequest,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/api/ai/enhance-opportunity-data",
    alias: "enhanceOpportunityData",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: AccountEnhancementRequest,
      },
    ],
    response: AccountEnhancementResponse,
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
    path: "/api/ai/enhance-account-data",
    alias: "enhanceAccountData",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: AccountEnhancementRequest,
      },
    ],
    response: AccountEnhancementResponse,
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
    path: "/api/ai/discover-opportunities",
    alias: "discoverOpportunities",
    description: `Advanced auto-scraper that:
1. Scans the website for project/opportunity pages
2. Follows links to individual projects
3. Extracts data from each project
4. Returns multiple opportunities with documents and images`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ website_url: z.string() }).passthrough(),
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
    method: "post",
    path: "/api/ai/refresh-opportunity-data",
    alias: "refreshOpportunityData",
    description: `AI Refresh: Re-scrape project URL and auto-update all opportunity data
Updates:
- Project Description
- Project Scope  
- Contact Details
- Documents
- Milestones
- All metadata`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: AIRefreshRequest,
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
    method: "post",
    path: "/api/ai/suggestions",
    alias: "getAISuggestions",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: AISuggestionRequest,
      },
    ],
    response: AISuggestionResponse,
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
    path: "/api/ai/suggestions/:suggestion_id",
    alias: "getAISuggestion",
    requestFormat: "json",
    parameters: [
      {
        name: "suggestion_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: AISuggestionResponse,
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
