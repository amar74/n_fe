import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

import { HTTPValidationError } from "./common";
import { ValidationError } from "./common";
import { VendorStatsResponse } from "./common";

// @author jhalak32
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
    path: "/vendors/login",
    alias: "vendor_login_vendors_login_post",
    description: `Vendor login endpoint
Returns JWT token and vendor data`,
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
    path: "/vendors/",
    alias: "create_vendor_vendors__post",
    description: `Create a new vendor (Super Admin only)
Sends invitation email with credentials`,
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
    path: "/vendors/",
    alias: "get_all_vendors_vendors__get",
    description: `Get all vendors with pagination (Super Admin only)`,
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
    path: "/vendors/stats",
    alias: "get_vendor_statistics_vendors_stats_get",
    description: `Get vendor statistics for Super Admin dashboard`,
    requestFormat: "json",
    response: VendorStatsResponse,
  },
  {
    method: "get",
    path: "/vendors/:vendor_id",
    alias: "get_vendor_vendors__vendor_id__get",
    description: `Get vendor by ID`,
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
    path: "/vendors/:vendor_id",
    alias: "update_vendor_vendors__vendor_id__put",
    description: `Update vendor details (Super Admin only)`,
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
    path: "/vendors/:vendor_id",
    alias: "delete_vendor_vendors__vendor_id__delete",
    description: `Delete vendor (Super Admin only)`,
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
    path: "/vendors/:vendor_id/status",
    alias: "update_vendor_status_vendors__vendor_id__status_patch",
    description: `Update vendor approval status (Super Admin only)`,
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
