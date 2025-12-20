import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

import { HTTPValidationError } from "./common";
import { ValidationError } from "./common";

const PublicSurveyResponse = z
  .object({
    id: z.string(),
    survey_code: z.string(),
    title: z.string(),
    description: z.union([z.string(), z.null()]),
    questions: z.array(z.object({}).partial().passthrough()),
    status: z.string(),
  })
  .passthrough();
const SurveySubmission = z
  .object({
    response_data: z.object({}).partial().passthrough(),
    contact_name: z.string(),
    contact_email: z.string(),
    contact_phone: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();

export const schemas = {
  PublicSurveyResponse,
  SurveySubmission,
};

const endpoints = makeApi([
  {
    method: "get",
    path: "/api/public/surveys/:survey_id",
    alias: "get_public_survey_api_public_surveys__survey_id__get",
    description: `Get survey details for public access (no auth required)`,
    requestFormat: "json",
    parameters: [
      {
        name: "survey_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: PublicSurveyResponse,
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
    path: "/api/public/surveys/:survey_id/submit",
    alias: "submit_public_survey_api_public_surveys__survey_id__submit_post",
    description: `Submit a survey response (no auth required)`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SurveySubmission,
      },
      {
        name: "survey_id",
        type: "Path",
        schema: z.string().uuid(),
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
]);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
