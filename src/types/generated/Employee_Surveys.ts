import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

import { HTTPValidationError } from "./common";
import { ValidationError } from "./common";

const endpoints = makeApi([
  {
    method: "get",
    path: "/api/employee/surveys/assigned",
    alias: "get_assigned_surveys_api_employee_surveys_assigned_get",
    description: `Get surveys assigned to the logged-in employee`,
    requestFormat: "json",
    response: z.unknown(),
  },
  {
    method: "get",
    path: "/api/employee/surveys/:survey_id",
    alias: "get_employee_survey_api_employee_surveys__survey_id__get",
    description: `Get survey details for authenticated employee`,
    requestFormat: "json",
    parameters: [
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
  {
    method: "post",
    path: "/api/employee/surveys/:survey_id/submit",
    alias:
      "submit_employee_survey_api_employee_surveys__survey_id__submit_post",
    description: `Submit survey response from authenticated employee`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({}).partial().passthrough(),
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
