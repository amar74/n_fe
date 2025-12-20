import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const ProfileStatsResponse = z
  .object({
    active_projects: z.number().int(),
    completed_tasks: z.number().int(),
    team_members: z.number().int(),
    performance: z.number(),
  })
  .passthrough();

export const schemas = {
  ProfileStatsResponse,
};

const endpoints = makeApi([
  {
    method: "get",
    path: "/api/profile/stats",
    alias: "getProfileStats",
    description: `Get user profile statistics - active projects, tasks, team members, performance`,
    requestFormat: "json",
    response: ProfileStatsResponse,
  },
]);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
