import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

import { HTTPValidationError } from "./common";
import { ValidationError } from "./common";
import { VendorStatsResponse } from "./common";

const SuperAdminDashboardResponse = z
  .object({ message: z.string(), vendor_stats: VendorStatsResponse })
  .passthrough();
const SuperAdminLoginResponse = z
  .object({
    message: z.string(),
    token: z.string(),
    expire_at: z.string(),
    user: z.object({}).partial().passthrough(),
  })
  .passthrough();
const SuperAdminLoginRequest = z
  .object({ email: z.string().email(), password: z.string() })
  .passthrough();

// working but need cleanup - rose11
export const schemas = {
  SuperAdminDashboardResponse,
  SuperAdminLoginResponse,
  SuperAdminLoginRequest,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/super-admin/login",
    alias: "super_admin_login_super_admin_login_post",
    description: `Super Admin login endpoint
Note: For demo purposes, this uses a simple email check against SUPER_ADMIN_EMAILS
In production, you should implement proper password hashing and verification`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SuperAdminLoginRequest,
      },
    ],
    response: SuperAdminLoginResponse,
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
    path: "/super-admin/dashboard",
    alias: "get_super_admin_dashboard_super_admin_dashboard_get",
    description: `Get Super Admin dashboard data
Requires Super Admin authentication

Returns statistics for vendors (users with role&#x3D;&#x27;vendor&#x27;)`,
    requestFormat: "json",
    response: SuperAdminDashboardResponse,
  },
  {
    method: "get",
    path: "/super-admin/me",
    alias: "get_super_admin_profile_super_admin_me_get",
    description: `Get current Super Admin profile`,
    requestFormat: "json",
    response: z.unknown(),
  },
]);

export const Super_adminApi = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
