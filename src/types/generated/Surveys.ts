import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

import { HTTPValidationError } from "./common";
import { ValidationError } from "./common";
import { stage } from "./common";

const SurveyDistributionResponse = z
  .object({
    id: z.string().uuid(),
    survey_id: z.string().uuid(),
    account_id: z.union([z.string(), z.null()]),
    contact_id: z.union([z.string(), z.null()]),
    survey_link: z.union([z.string(), z.null()]),
    sent_at: z.union([z.string(), z.null()]),
    is_sent: z.boolean(),
    is_completed: z.boolean(),
  })
  .passthrough();
const BulkDistributionResponse = z
  .object({
    success: z.boolean(),
    message: z.string(),
    distributions_created: z.number().int(),
    distributions: z.array(SurveyDistributionResponse),
  })
  .passthrough();
const SurveyAnalyticsByAccount = z
  .object({
    account_id: z.string().uuid(),
    account_name: z.string(),
    total_surveys_sent: z.number().int(),
    total_responses: z.number().int(),
    response_rate: z.number(),
    avg_satisfaction_score: z.union([z.number(), z.null()]),
    last_response_date: z.union([z.string(), z.null()]),
  })
  .passthrough();
const SurveyAnalyticsSummary = z
  .object({
    survey_id: z.string().uuid(),
    survey_title: z.string(),
    total_sent: z.number().int(),
    total_responses: z.number().int(),
    response_rate: z.number(),
    avg_completion_time: z.union([z.number(), z.null()]),
    by_account: z.array(SurveyAnalyticsByAccount),
  })
  .passthrough();
const SurveyTypeEnum = z.enum([
  "account_feedback",
  "customer_satisfaction",
  "nps",
  "opportunity_feedback",
  "general",
]);
const SurveyCreateRequest = z
  .object({
    title: z.string().min(1).max(500),
    description: z.union([z.string(), z.null()]).optional(),
    survey_type: SurveyTypeEnum,
    questions: z.array(z.object({}).partial().passthrough()),
    settings: z
      .union([z.object({}).partial().passthrough(), z.null()])
      .optional(),
  })
  .passthrough();
const SurveyResponse = z
  .object({
    id: z.string().uuid(),
    survey_code: z.string(),
    title: z.string(),
    description: z.union([z.string(), z.null()]),
    survey_type: z.string(),
    status: z.string(),
    org_id: z.string().uuid(),
    created_by: z.union([z.string(), z.null()]),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.union([z.string(), z.null()]),
  })
  .passthrough();
const SurveyListResponse = z
  .object({
    surveys: z.array(SurveyResponse),
    total: z.number().int(),
    page: z.number().int(),
    page_size: z.number().int(),
  })
  .passthrough();
const SurveyStatusEnum = z.enum([
  "draft",
  "active",
  "paused",
  "completed",
  "archived",
]);
const SurveyStatusUpdate = z.object({ status: SurveyStatusEnum }).passthrough();
const SurveyDistributionCreate = z
  .object({
    survey_id: z.string().uuid(),
    account_ids: z.union([z.array(z.string().uuid()), z.null()]).optional(),
    contact_ids: z.union([z.array(z.string().uuid()), z.null()]).optional(),
    filters: z
      .union([z.object({}).partial().passthrough(), z.null()])
      .optional(),
  })
  .passthrough();
const SurveyResponseSubmission = z
  .object({
    survey_id: z.string().uuid(),
    contact_id: z.string().uuid(),
    account_id: z.string().uuid(),
    responses: z.object({}).partial().passthrough(),
    metadata: z
      .union([z.object({}).partial().passthrough(), z.null()])
      .optional(),
  })
  .passthrough();

export const schemas = {
  SurveyDistributionResponse,
  BulkDistributionResponse,
  SurveyAnalyticsByAccount,
  SurveyAnalyticsSummary,
  SurveyTypeEnum,
  SurveyCreateRequest,
  SurveyResponse,
  SurveyListResponse,
  SurveyStatusEnum,
  SurveyStatusUpdate,
  SurveyDistributionCreate,
  SurveyResponseSubmission,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/api/surveys/",
    alias: "create_survey_api_surveys__post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SurveyCreateRequest,
      },
    ],
    response: SurveyResponse,
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
    path: "/api/surveys/",
    alias: "list_surveys_api_surveys__get",
    requestFormat: "json",
    parameters: [
      {
        name: "status",
        type: "Query",
        schema: stage,
      },
      {
        name: "type",
        type: "Query",
        schema: stage,
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(50),
      },
    ],
    response: SurveyListResponse,
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
    path: "/api/surveys/accounts",
    alias: "get_survey_accounts_api_surveys_accounts_get",
    requestFormat: "json",
    response: z.array(SurveyAccountResponse),
  },
  {
    method: "get",
    path: "/api/surveys/:survey_id",
    alias: "get_survey_api_surveys__survey_id__get",
    requestFormat: "json",
    parameters: [
      {
        name: "survey_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: SurveyResponse,
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
    path: "/api/surveys/:survey_id",
    alias: "update_survey_api_surveys__survey_id__patch",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SurveyCreateRequest,
      },
      {
        name: "survey_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: SurveyResponse,
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
    path: "/api/surveys/:survey_id/status",
    alias: "update_survey_status_api_surveys__survey_id__status_patch",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SurveyStatusUpdate,
      },
      {
        name: "survey_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: SurveyResponse,
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
    path: "/api/surveys/:survey_id/distribute",
    alias: "distribute_survey_api_surveys__survey_id__distribute_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SurveyDistributionCreate,
      },
      {
        name: "survey_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: BulkDistributionResponse,
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
    path: "/api/surveys/:survey_id/analytics",
    alias: "get_survey_analytics_api_surveys__survey_id__analytics_get",
    requestFormat: "json",
    parameters: [
      {
        name: "survey_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: SurveyAnalyticsSummary,
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
    path: "/api/surveys/responses",
    alias: "submit_survey_response_api_surveys_responses_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SurveyResponseSubmission,
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
    path: "/api/surveys/accounts/:account_id/contacts",
    alias:
      "get_account_contacts_for_survey_api_surveys_accounts__account_id__contacts_get",
    requestFormat: "json",
    parameters: [
      {
        name: "account_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.array(z.object({}).partial().passthrough()),
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
    path: "/api/surveys/:survey_id/distributions",
    alias: "get_survey_distributions_api_surveys__survey_id__distributions_get",
    requestFormat: "json",
    parameters: [
      {
        name: "survey_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.array(SurveyDistributionResponse),
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
    path: "/api/surveys/:survey_id/responses",
    alias: "get_survey_responses_api_surveys__survey_id__responses_get",
    requestFormat: "json",
    parameters: [
      {
        name: "survey_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "page_size",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(50),
      },
    ],
    response: z.array(SurveyResponseModel),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
]);

export const SurveysApi = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
