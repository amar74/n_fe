import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

import { HTTPValidationError } from "./common";
import { ValidationError } from "./common";

const endpoints = makeApi([
  {
    method: "get",
    path: "/",
    alias: "read_root__get",
    requestFormat: "json",
    response: z.object({ message: z.string() }).passthrough(),
  },
  {
    method: "get",
    path: "/test-opportunity/:opportunity_id",
    alias: "test_get_opportunity_test_opportunity__opportunity_id__get",
    description: `Test endpoint to get opportunity without authentication`,
    requestFormat: "json",
    parameters: [
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string(),
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
    path: "/test-opportunity-by-id/:opportunity_id",
    alias:
      "test_get_opportunity_by_id_test_opportunity_by_id__opportunity_id__get",
    description: `Test endpoint to get specific opportunity by ID without authentication`,
    requestFormat: "json",
    parameters: [
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string(),
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
    path: "/test-auth-token",
    alias: "get_test_auth_token_test_auth_token_get",
    description: `Test endpoint to get a temporary auth token for testing`,
    requestFormat: "json",
    response: z.unknown(),
  },
  {
    method: "get",
    path: "/test-opportunities/:opportunity_id",
    alias:
      "test_get_opportunity_endpoint_test_opportunities__opportunity_id__get",
    description: `Test endpoint that mimics the real opportunity endpoint without authentication`,
    requestFormat: "json",
    parameters: [
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string(),
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
    path: "/test-opportunities-list",
    alias: "test_list_opportunities_test_opportunities_list_get",
    description: `Test endpoint that mimics the real opportunities list endpoint without authentication`,
    requestFormat: "json",
    response: z.unknown(),
  },
  {
    method: "get",
    path: "/test-opportunities-analytics",
    alias: "test_opportunities_analytics_test_opportunities_analytics_get",
    description: `Test endpoint for opportunities analytics without authentication`,
    requestFormat: "json",
    response: z.unknown(),
  },
  {
    method: "get",
    path: "/test-opportunities-pipeline",
    alias: "test_opportunities_pipeline_test_opportunities_pipeline_get",
    description: `Test endpoint for opportunities pipeline without authentication`,
    requestFormat: "json",
    response: z.unknown(),
  },
]);


export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
