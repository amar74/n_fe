import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const DashboardStatsResponse = z
  .object({
    active_accounts: z.number().int(),
    accounts_change: z.string(),
    open_opportunities: z.number().int(),
    opportunities_change: z.string(),
    active_projects: z.number().int(),
    projects_change: z.string(),
    monthly_revenue: z.string(),
    revenue_change: z.string(),
  })
  .passthrough();

export const schemas = {
  DashboardStatsResponse,
};

const endpoints = makeApi([
  {
    method: "get",
    path: "/api/dashboard/stats",
    alias: "getDashboardStats",
    description: `Get dashboard statistics for the current user&#x27;s organization`,
    requestFormat: "json",
    response: DashboardStatsResponse,
  },
]);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
