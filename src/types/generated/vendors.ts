import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

import { HTTPValidationError } from "./common";
import { ValidationError } from "./common";
import { VendorStatsResponse } from "./common";

const VendorResponse = z
  .object({
    id: z.string(),
    vendor_name: z.string(),
    organisation: z.string(),
    website: z.union([z.string(), z.null()]),
    email: z.string(),
    contact_number: z.string(),
    status: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
    approved_at: z.union([z.string(), z.null()]),
    is_active: z.boolean(),
  })
  .passthrough();
const VendorListResponse = z
  .object({
    vendors: z.array(VendorResponse),
    total: z.number().int(),
    skip: z.number().int(),
    limit: z.number().int(),
  })
  .passthrough();
const VendorLoginRequest = z
  .object({ email: z.string().email(), password: z.string() })
  .passthrough();
const VendorCreateRequest = z
  .object({
    vendor_name: z.string().min(1).max(255),
    organisation: z.string().min(1).max(255),
    website: z.union([z.string(), z.null()]).optional(),
    email: z.string().email(),
    contact_number: z.string().min(10).max(20),
    password: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const VendorUpdateRequest = z
  .object({
    vendor_name: z.union([z.string(), z.null()]),
    organisation: z.union([z.string(), z.null()]),
    website: z.union([z.string(), z.null()]),
    contact_number: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();

export const schemas = {
  VendorResponse,
  VendorListResponse,
  VendorLoginRequest,
  VendorCreateRequest,
  VendorUpdateRequest,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/api/vendors/login",
    alias: "vendor_login_api_vendors_login_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: VendorLoginRequest,
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
    path: "/api/vendors/",
    alias: "create_vendor_api_vendors__post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: VendorCreateRequest,
      },
    ],
    response: VendorResponse,
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
    path: "/api/vendors/",
    alias: "get_all_vendors_api_vendors__get",
    requestFormat: "json",
    parameters: [
      {
        name: "skip",
        type: "Query",
        schema: z.number().int().optional().default(0),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().optional().default(100),
      },
    ],
    response: VendorListResponse,
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
    path: "/api/vendors/stats",
    alias: "get_vendor_statistics_api_vendors_stats_get",
    requestFormat: "json",
    response: VendorStatsResponse,
  },
  {
    method: "get",
    path: "/api/vendors/:vendor_id",
    alias: "get_vendor_api_vendors__vendor_id__get",
    requestFormat: "json",
    parameters: [
      {
        name: "vendor_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: VendorResponse,
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
    path: "/api/vendors/:vendor_id",
    alias: "update_vendor_api_vendors__vendor_id__put",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: VendorUpdateRequest,
      },
      {
        name: "vendor_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: VendorResponse,
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
    path: "/api/vendors/:vendor_id",
    alias: "delete_vendor_api_vendors__vendor_id__delete",
    requestFormat: "json",
    parameters: [
      {
        name: "vendor_id",
        type: "Path",
        schema: z.string(),
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
    method: "patch",
    path: "/api/vendors/:vendor_id/status",
    alias: "update_vendor_status_api_vendors__vendor_id__status_patch",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z
          .object({ status: z.string().regex(/^(pending|approved|rejected)$/) })
          .passthrough(),
      },
      {
        name: "vendor_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: VendorResponse,
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
