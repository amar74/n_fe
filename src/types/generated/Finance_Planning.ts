import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

import { HTTPValidationError } from "./common";
import { ValidationError } from "./common";
import { stage } from "./common";

const FinancePlanningLineItem = z
  .object({ label: z.string(), target: z.number(), variance: z.number() })
  .passthrough();
const FinancePlanningBusinessUnit = z
  .object({
    name: z.string(),
    revenue: z.number(),
    expense: z.number(),
    profit: z.number(),
    headcount: z.number().int(),
    margin_percent: z.number(),
  })
  .passthrough();
const FinanceAnnualBudgetCreate = z
  .object({
    budget_year: z.string(),
    target_growth_rate: z.number().optional().default(15),
    total_revenue_target: z.number().optional().default(0),
    total_expense_budget: z.number().optional().default(0),
    revenue_lines: z.array(FinancePlanningLineItem).optional().default([]),
    expense_lines: z.array(FinancePlanningLineItem).optional().default([]),
    business_units: z.array(FinancePlanningBusinessUnit).optional().default([]),
  })
  .passthrough();
const FinanceAnnualBudgetUpdate = z
  .object({
    target_growth_rate: z.union([z.number(), z.null()]),
    total_revenue_target: z.union([z.number(), z.null()]),
    total_expense_budget: z.union([z.number(), z.null()]),
    revenue_lines: z.union([z.array(FinancePlanningLineItem), z.null()]),
    expense_lines: z.union([z.array(FinancePlanningLineItem), z.null()]),
    business_units: z.union([z.array(FinancePlanningBusinessUnit), z.null()]),
    status: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const FinanceKpiRow = z
  .object({ label: z.string(), value: z.string() })
  .passthrough();
const FinanceKpiTarget = z
  .object({ year: z.number().int(), kpis: z.array(FinanceKpiRow) })
  .passthrough();
const FinancePlanningMetric = z
  .object({
    label: z.string(),
    value: z.union([z.number(), z.null()]).optional(),
    value_label: z.union([z.string(), z.null()]).optional(),
    tone: z.union([z.string(), z.null()]).optional().default("default"),
  })
  .passthrough();
const FinancePlanningThreshold = z
  .object({ label: z.string(), value_percent: z.number() })
  .passthrough();
const FinancePlanningScheduleItem = z
  .object({ label: z.string(), value: z.string() })
  .passthrough();
const FinancePlanningAiHighlight = z
  .object({
    title: z.string(),
    tone: z.string().regex(/^(positive|warning|critical)$/),
    detail: z.string(),
  })
  .passthrough();
const FinancePlanningAnnualResponse = z
  .object({
    budget_summary: z.array(FinancePlanningMetric),
    revenue_lines: z.array(FinancePlanningLineItem),
    expense_lines: z.array(FinancePlanningLineItem),
    business_units: z.array(FinancePlanningBusinessUnit),
    variance_thresholds: z.array(FinancePlanningThreshold),
    reporting_schedule: z.array(FinancePlanningScheduleItem),
    ai_highlights: z.array(FinancePlanningAiHighlight),
  })
  .passthrough();
const FinanceScenario = z
  .object({
    key: z.string(),
    name: z.string(),
    description: z.string(),
    growth_rates: z.array(z.number()),
    investment_level: z.string(),
    bonus_threshold: z.number(),
    risk_level: z.string(),
    active: z.boolean().optional().default(false),
  })
  .passthrough();
const FinancePlanningConfiguration = z
  .object({
    planning_period_years: z.number().int(),
    base_year_revenue: z.number(),
    base_year_expenses: z.number(),
  })
  .passthrough();
const FinanceProjectionRow = z
  .object({
    year: z.number().int(),
    revenue: z.number(),
    expenses: z.number(),
    profit: z.number(),
    margin_percent: z.number(),
  })
  .passthrough();
const FinanceTimelineItem = z
  .object({ title: z.string(), date: z.string(), status: z.string() })
  .passthrough();
const FinanceTaskItem = z
  .object({
    title: z.string(),
    owner: z.string(),
    due: z.string(),
    status: z.string(),
  })
  .passthrough();
const FinancePlaybookItem = z
  .object({ title: z.string(), insight: z.string() })
  .passthrough();
const FinancePlanningScenarioResponse = z
  .object({
    scenarios: z.array(FinanceScenario),
    planning_configuration: FinancePlanningConfiguration,
    projections: z.array(FinanceProjectionRow),
    kpi_targets: z.array(FinanceKpiTarget),
    timeline: z.array(FinanceTimelineItem),
    tasks: z.array(FinanceTaskItem),
    ai_playbook: z.array(FinancePlaybookItem),
  })
  .passthrough();
const FinancePlanningConfigUpdate = z
  .object({
    planning_period_years: z.union([z.number(), z.null()]),
    base_year_revenue: z.union([z.number(), z.null()]),
    base_year_expenses: z.union([z.number(), z.null()]),
  })
  .partial()
  .passthrough();
const FinanceScenarioUpdate = z
  .object({
    name: z.union([z.string(), z.null()]),
    description: z.union([z.string(), z.null()]),
    growth_rates: z.union([z.array(z.number()), z.null()]),
    investment_level: z.union([z.string(), z.null()]),
    bonus_threshold: z.union([z.number(), z.null()]),
    risk_level: z.union([z.string(), z.null()]),
    active: z.union([z.boolean(), z.null()]),
    risks: z.union([z.array(z.string()), z.null()]),
    opportunities: z.union([z.array(z.string()), z.null()]),
  })
  .partial()
  .passthrough();

export const schemas = {
  FinancePlanningLineItem,
  FinancePlanningBusinessUnit,
  FinanceAnnualBudgetCreate,
  FinanceAnnualBudgetUpdate,
  FinanceKpiRow,
  FinanceKpiTarget,
  FinancePlanningMetric,
  FinancePlanningThreshold,
  FinancePlanningScheduleItem,
  FinancePlanningAiHighlight,
  FinancePlanningAnnualResponse,
  FinanceScenario,
  FinancePlanningConfiguration,
  FinanceProjectionRow,
  FinanceTimelineItem,
  FinanceTaskItem,
  FinancePlaybookItem,
  FinancePlanningScenarioResponse,
  FinancePlanningConfigUpdate,
  FinanceScenarioUpdate,
};

const endpoints = makeApi([
  {
    method: "get",
    path: "/api/v1/finance/planning/annual",
    alias: "read_finance_planning_annual_api_v1_finance_planning_annual_get",
    description: `Return the annual planning snapshot (budget, revenue/expense breakdown, thresholds).`,
    requestFormat: "json",
    response: FinancePlanningAnnualResponse,
  },
  {
    method: "post",
    path: "/api/v1/finance/planning/annual",
    alias: "create_finance_planning_annual_api_v1_finance_planning_annual_post",
    description: `Create or update annual budget planning data.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: FinanceAnnualBudgetCreate,
      },
    ],
    response: FinancePlanningAnnualResponse,
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
    path: "/api/v1/finance/planning/annual",
    alias:
      "update_finance_planning_annual_api_v1_finance_planning_annual_patch",
    description: `Update annual budget planning data.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: FinanceAnnualBudgetUpdate,
      },
      {
        name: "budget_year",
        type: "Query",
        schema: stage,
      },
    ],
    response: FinancePlanningAnnualResponse,
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
    path: "/api/v1/finance/planning/scenarios",
    alias:
      "read_finance_planning_scenarios_api_v1_finance_planning_scenarios_get",
    description: `Return planning scenarios, projections, KPI targets, timeline, and AI playbook.`,
    requestFormat: "json",
    response: FinancePlanningScenarioResponse,
  },
  {
    method: "patch",
    path: "/api/v1/finance/planning/scenarios/config",
    alias:
      "update_planning_config_api_v1_finance_planning_scenarios_config_patch",
    description: `Update planning configuration (base year, planning period, etc.).`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: FinancePlanningConfigUpdate,
      },
    ],
    response: FinancePlanningScenarioResponse,
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
    path: "/api/v1/finance/planning/scenarios/:scenario_key",
    alias:
      "update_scenario_data_api_v1_finance_planning_scenarios__scenario_key__patch",
    description: `Update a specific scenario (e.g., activate it, update parameters).`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: FinanceScenarioUpdate,
      },
      {
        name: "scenario_key",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: FinancePlanningScenarioResponse,
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
