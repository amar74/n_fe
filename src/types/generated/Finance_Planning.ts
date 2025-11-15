import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

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

export const schemas = {
  FinanceKpiRow,
  FinanceKpiTarget,
  FinancePlanningMetric,
  FinancePlanningLineItem,
  FinancePlanningBusinessUnit,
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
};

const endpoints = makeApi([
  {
    method: "get",
    path: "/api/api/v1/finance/planning/annual",
    alias:
      "read_finance_planning_annual_api_api_v1_finance_planning_annual_get",
    description: `Return the annual planning snapshot (budget, revenue/expense breakdown, thresholds).`,
    requestFormat: "json",
    response: FinancePlanningAnnualResponse,
  },
  {
    method: "get",
    path: "/api/api/v1/finance/planning/scenarios",
    alias:
      "read_finance_planning_scenarios_api_api_v1_finance_planning_scenarios_get",
    description: `Return planning scenarios, projections, KPI targets, timeline, and AI playbook.`,
    requestFormat: "json",
    response: FinancePlanningScenarioResponse,
  },
]);



export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
