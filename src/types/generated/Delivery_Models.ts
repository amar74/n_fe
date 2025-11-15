import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

import { HTTPValidationError } from "./common";
import { ValidationError } from "./common";

const DeliveryModelTemplatePhase = z
  .object({
    phase_id: z.string().uuid().optional(),
    name: z.string(),
    status: z.union([z.string(), z.null()]).optional(),
    duration: z.union([z.string(), z.null()]).optional(),
    budget: z.union([z.number(), z.null()]).optional(),
    updated_by: z.union([z.string(), z.null()]).optional(),
    description: z.union([z.string(), z.null()]).optional(),
    last_updated: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const DeliveryModelTemplateCreate = z
  .object({
    approach: z.string().min(1),
    notes: z.union([z.string(), z.null()]).optional(),
    phases: z.array(DeliveryModelTemplatePhase).optional(),
  })
  .passthrough();
const DeliveryModelTemplateResponse = z
  .object({
    approach: z.string().min(1),
    notes: z.union([z.string(), z.null()]).optional(),
    phases: z.array(DeliveryModelTemplatePhase).optional(),
    id: z.string().uuid(),
    org_id: z.string().uuid(),
    created_by: z.union([z.string(), z.null()]).optional(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const DeliveryModelTemplateUpdate = z
  .object({
    approach: z.union([z.string(), z.null()]),
    notes: z.union([z.string(), z.null()]),
    phases: z.union([z.array(DeliveryModelTemplatePhase), z.null()]),
  })
  .partial()
  .passthrough();

export const schemas = {
  DeliveryModelTemplatePhase,
  DeliveryModelTemplateCreate,
  DeliveryModelTemplateResponse,
  DeliveryModelTemplateUpdate,
};

const endpoints = makeApi([
  {
    method: "get",
    path: "/api/delivery-models/",
    alias: "list_delivery_models_api_delivery_models__get",
    requestFormat: "json",
    response: z.array(DeliveryModelTemplateResponse),
  },
  {
    method: "post",
    path: "/api/delivery-models/",
    alias: "create_delivery_model_api_delivery_models__post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: DeliveryModelTemplateCreate,
      },
    ],
    response: DeliveryModelTemplateResponse,
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
    path: "/api/delivery-models/:template_id",
    alias: "get_delivery_model_api_delivery_models__template_id__get",
    requestFormat: "json",
    parameters: [
      {
        name: "template_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: DeliveryModelTemplateResponse,
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
    path: "/api/delivery-models/:template_id",
    alias: "update_delivery_model_api_delivery_models__template_id__put",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: DeliveryModelTemplateUpdate,
      },
      {
        name: "template_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: DeliveryModelTemplateResponse,
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
    path: "/api/delivery-models/:template_id",
    alias: "delete_delivery_model_api_delivery_models__template_id__delete",
    requestFormat: "json",
    parameters: [
      {
        name: "template_id",
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
]);



export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
