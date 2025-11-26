import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

import { HTTPValidationError } from "./common";
import { ValidationError } from "./common";
import { stage } from "./common";

const EscalationPeriod = z
  .object({
    start_month: z.number().int().gte(1),
    end_month: z.number().int().gte(1),
    rate: z.number().gte(0).lte(100),
  })
  .passthrough();
const StaffAllocationCreate = z
  .object({
    resource_id: z.string().uuid(),
    resource_name: z.string(),
    role: z.string(),
    level: z.union([z.string(), z.null()]).optional(),
    start_month: z.number().int().gte(1).optional().default(1),
    end_month: z.number().int().gte(1).optional().default(12),
    hours_per_week: z.number().gte(0).lte(168).optional().default(40),
    hourly_rate: z.number().gte(0),
    escalation_rate: z.union([z.number(), z.null()]).optional(),
    escalation_start_month: z.union([z.number(), z.null()]).optional(),
    escalation_periods: z
      .union([z.array(EscalationPeriod), z.null()])
      .optional(),
  })
  .passthrough();
const StaffAllocationResponse = z
  .object({
    id: z.number().int(),
    staff_plan_id: z.number().int(),
    resource_id: z.string(),
    resource_name: z.string(),
    role: z.string(),
    level: z.union([z.string(), z.null()]).optional(),
    start_month: z.number().int(),
    end_month: z.number().int(),
    hours_per_week: z.number(),
    allocation_percentage: z.number(),
    hourly_rate: z.number(),
    monthly_cost: z.number(),
    total_cost: z.number(),
    escalation_rate: z.union([z.number(), z.null()]).optional(),
    escalation_start_month: z.union([z.number(), z.null()]).optional(),
    escalation_periods: z
      .union([z.array(EscalationPeriod), z.null()])
      .optional(),
    status: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
  })
  .passthrough();
const StaffAllocationUpdate = z
  .object({
    start_month: z.union([z.number(), z.null()]),
    end_month: z.union([z.number(), z.null()]),
    hours_per_week: z.union([z.number(), z.null()]),
    allocation_percentage: z.union([z.number(), z.null()]),
    hourly_rate: z.union([z.number(), z.null()]),
    escalation_rate: z.union([z.number(), z.null()]),
    escalation_start_month: z.union([z.number(), z.null()]),
    escalation_periods: z.union([z.array(EscalationPeriod), z.null()]),
    status: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const StaffPlanWithAllocations = z
  .object({
    id: z.number().int(),
    project_id: z.union([z.string(), z.null()]).optional(),
    project_name: z.string(),
    project_description: z.union([z.string(), z.null()]).optional(),
    project_start_date: z.string(),
    duration_months: z.number().int(),
    overhead_rate: z.number(),
    profit_margin: z.number(),
    annual_escalation_rate: z.union([z.number(), z.null()]),
    total_labor_cost: z.number(),
    total_overhead: z.number(),
    total_cost: z.number(),
    total_profit: z.number(),
    total_price: z.number(),
    yearly_breakdown: z
      .union([z.array(z.object({}).partial().passthrough()), z.null()])
      .optional(),
    status: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
    allocations: z.array(StaffAllocationResponse).optional().default([]),
  })
  .passthrough();
const StaffPlanResponse = z
  .object({
    id: z.number().int(),
    project_id: z.union([z.string(), z.null()]).optional(),
    project_name: z.string(),
    project_description: z.union([z.string(), z.null()]).optional(),
    project_start_date: z.string(),
    duration_months: z.number().int(),
    overhead_rate: z.number(),
    profit_margin: z.number(),
    annual_escalation_rate: z.union([z.number(), z.null()]),
    total_labor_cost: z.number(),
    total_overhead: z.number(),
    total_cost: z.number(),
    total_profit: z.number(),
    total_price: z.number(),
    yearly_breakdown: z
      .union([z.array(z.object({}).partial().passthrough()), z.null()])
      .optional(),
    status: z.string(),
    team_size: z.number().int().optional().default(0),
    created_at: z.string(),
    updated_at: z.string(),
  })
  .passthrough();
const StaffPlanCreate = z
  .object({
    project_id: z.union([z.string(), z.null()]).optional(),
    project_name: z.string(),
    project_description: z.union([z.string(), z.null()]).optional(),
    project_start_date: z.string(),
    duration_months: z.number().int().gte(1).lte(120).optional().default(12),
    overhead_rate: z.number().gte(0).lte(100).optional().default(25),
    profit_margin: z.number().gte(0).lte(100).optional().default(15),
    annual_escalation_rate: z.union([z.number(), z.null()]).optional(),
  })
  .passthrough();
const StaffPlanUpdate = z
  .object({
    project_name: z.union([z.string(), z.null()]),
    project_description: z.union([z.string(), z.null()]),
    project_start_date: z.union([z.string(), z.null()]),
    duration_months: z.union([z.number(), z.null()]),
    overhead_rate: z.union([z.number(), z.null()]),
    profit_margin: z.union([z.number(), z.null()]),
    annual_escalation_rate: z.union([z.number(), z.null()]),
    status: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();

export const schemas = {
  EscalationPeriod,
  StaffAllocationCreate,
  StaffAllocationResponse,
  StaffAllocationUpdate,
  StaffPlanWithAllocations,
  StaffPlanResponse,
  StaffPlanCreate,
  StaffPlanUpdate,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/api/staff-planning/",
    alias: "create_staff_plan_api_staff_planning__post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: StaffPlanCreate,
      },
    ],
    response: StaffPlanResponse,
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
    path: "/api/staff-planning/",
    alias: "get_staff_plans_api_staff_planning__get",
    description: `Get all staff plans with optional filtering`,
    requestFormat: "json",
    parameters: [
      {
        name: "status_filter",
        type: "Query",
        schema: stage,
      },
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
    response: z.array(StaffPlanResponse),
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
    path: "/api/staff-planning/:plan_id",
    alias: "get_staff_plan_api_staff_planning__plan_id__get",
    description: `Get a specific staff plan by ID`,
    requestFormat: "json",
    parameters: [
      {
        name: "plan_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: StaffPlanResponse,
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
    path: "/api/staff-planning/:plan_id",
    alias: "update_staff_plan_api_staff_planning__plan_id__put",
    description: `Update an existing staff plan`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: StaffPlanUpdate,
      },
      {
        name: "plan_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: StaffPlanResponse,
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
    path: "/api/staff-planning/:plan_id",
    alias: "delete_staff_plan_api_staff_planning__plan_id__delete",
    description: `Delete a staff plan`,
    requestFormat: "json",
    parameters: [
      {
        name: "plan_id",
        type: "Path",
        schema: z.number().int(),
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
    method: "post",
    path: "/api/staff-planning/:plan_id/allocations",
    alias: "add_staff_allocation_api_staff_planning__plan_id__allocations_post",
    description: `Add a staff member to a plan`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: StaffAllocationCreate,
      },
      {
        name: "plan_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: StaffAllocationResponse,
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
    path: "/api/staff-planning/:plan_id/allocations",
    alias: "get_staff_allocations_api_staff_planning__plan_id__allocations_get",
    description: `Get all staff allocations for a plan`,
    requestFormat: "json",
    parameters: [
      {
        name: "plan_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.array(StaffAllocationResponse),
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
    path: "/api/staff-planning/:plan_id/allocations/:allocation_id",
    alias:
      "update_staff_allocation_api_staff_planning__plan_id__allocations__allocation_id__patch",
    description: `Update an existing staff allocation and refresh plan financials.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: StaffAllocationUpdate,
      },
      {
        name: "plan_id",
        type: "Path",
        schema: z.number().int(),
      },
      {
        name: "allocation_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: StaffAllocationResponse,
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
    path: "/api/staff-planning/:plan_id/allocations/:allocation_id",
    alias:
      "remove_staff_allocation_api_staff_planning__plan_id__allocations__allocation_id__delete",
    description: `Remove a staff allocation from a plan`,
    requestFormat: "json",
    parameters: [
      {
        name: "plan_id",
        type: "Path",
        schema: z.number().int(),
      },
      {
        name: "allocation_id",
        type: "Path",
        schema: z.number().int(),
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
    method: "get",
    path: "/api/staff-planning/:plan_id/with-allocations",
    alias:
      "get_staff_plan_with_allocations_api_staff_planning__plan_id__with_allocations_get",
    description: `Get a staff plan with all its allocations`,
    requestFormat: "json",
    parameters: [
      {
        name: "plan_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: StaffPlanWithAllocations,
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
    path: "/api/staff-planning/:plan_id/ai-cost-analysis",
    alias:
      "get_ai_cost_analysis_api_staff_planning__plan_id__ai_cost_analysis_post",
    description: `Get AI-powered explanation of cost escalation`,
    requestFormat: "json",
    parameters: [
      {
        name: "plan_id",
        type: "Path",
        schema: z.number().int(),
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
    path: "/api/staff-planning/ai-staff-recommendations",
    alias:
      "get_ai_staff_recommendations_api_staff_planning_ai_staff_recommendations_post",
    description: `Get AI-powered staff recommendations based on project requirements
Analyzes project details and suggests optimal team composition`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({}).partial().passthrough(),
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
    path: "/api/staff-planning/ai-project-parameters",
    alias:
      "get_ai_project_parameters_api_staff_planning_ai_project_parameters_post",
    description: `Get AI-powered recommendations for project parameters
Suggests optimal Duration, Overhead, Profit Margin, and Escalation Rate`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({}).partial().passthrough(),
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
