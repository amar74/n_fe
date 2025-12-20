import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

import { HTTPValidationError } from "./common";
import { ValidationError } from "./common";

const endpoints = makeApi([
  {
    method: "post",
    path: "/api/ai/enrich/:account_id",
    alias: "enrichAccountData",
    requestFormat: "json",
    parameters: [
      {
        name: "account_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.object({}).partial().passthrough(),
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
    path: "/api/ai/enrich/batch",
    alias: "batchEnrichAccounts",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.array(z.string()),
      },
    ],
    response: z.object({}).partial().passthrough(),
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
    path: "/api/ai/tier/:account_id",
    alias: "suggestAccountTier",
    requestFormat: "json",
    parameters: [
      {
        name: "account_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.object({}).partial().passthrough(),
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
    path: "/api/ai/tier/batch",
    alias: "batchSuggestTiers",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.array(z.string()),
      },
    ],
    response: z.object({}).partial().passthrough(),
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
    path: "/api/ai/insights/:account_id",
    alias: "generateAccountInsights",
    requestFormat: "json",
    parameters: [
      {
        name: "account_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.object({}).partial().passthrough(),
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
    path: "/api/ai/insights/organization/summary",
    alias: "getOrganizationInsightsSummary",
    requestFormat: "json",
    response: z.object({}).partial().passthrough(),
  },
  {
    method: "post",
    path: "/api/ai/health-score/:account_id",
    alias: "calculateAccountHealthScore",
    requestFormat: "json",
    parameters: [
      {
        name: "account_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.object({}).partial().passthrough(),
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
    path: "/api/ai/health-score/:account_id/update",
    alias: "updateAccountHealthScore",
    requestFormat: "json",
    parameters: [
      {
        name: "account_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.object({}).partial().passthrough(),
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
    path: "/api/ai/analyze/:account_id",
    alias: "comprehensiveAccountAnalysis",
    requestFormat: "json",
    parameters: [
      {
        name: "account_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.object({}).partial().passthrough(),
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
