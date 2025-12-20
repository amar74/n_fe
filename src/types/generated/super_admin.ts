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

export const schemas = {
  SuperAdminDashboardResponse,
  SuperAdminLoginResponse,
  SuperAdminLoginRequest,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/api/super-admin/login",
    alias: "super_admin_login_api_super_admin_login_post",
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
    path: "/api/super-admin/dashboard",
    alias: "get_super_admin_dashboard_api_super_admin_dashboard_get",
    requestFormat: "json",
    response: SuperAdminDashboardResponse,
  },
  {
    method: "get",
    path: "/api/super-admin/me",
    alias: "get_super_admin_profile_api_super_admin_me_get",
    requestFormat: "json",
    response: z.unknown(),
  },
]);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
