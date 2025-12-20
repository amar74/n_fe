import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

import { HTTPValidationError } from "./common";
import { ValidationError } from "./common";

const FinanceBookingRecord = z
  .object({
    client_name: z.string(),
    ytd_actual: z.number(),
    plan_total: z.number(),
    progress_percent: z.number(),
    remaining: z.number(),
  })
  .passthrough();
const FinanceBookingsResponse = z
  .object({
    average_attainment_percent: z.number(),
    leader: FinanceBookingRecord,
    laggard: FinanceBookingRecord,
    records: z.array(FinanceBookingRecord),
  })
  .passthrough();
const FinanceDashboardMetric = z
  .object({
    label: z.string(),
    value: z.number(),
    formatted: z.union([z.string(), z.null()]).optional(),
    trend_percent: z.union([z.number(), z.null()]).optional(),
    trend_label: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const FinancePrimaryMetrics = z
  .object({
    net_revenue_ytd: FinanceDashboardMetric,
    operating_income_current: FinanceDashboardMetric,
    cash_position: FinanceDashboardMetric,
    dro_days: FinanceDashboardMetric,
  })
  .passthrough();
const FinanceKpiProgress = z
  .object({
    label: z.string(),
    value: z.string(),
    percentComplete: z.number().gte(0).lte(200),
    target: z.union([z.number(), z.null()]).optional(),
  })
  .passthrough();
const FinanceAiHighlight = z
  .object({
    title: z.string(),
    tone: z.string().regex(/^(positive|warning|critical)$/),
    detail: z.string(),
  })
  .passthrough();
const FinanceBusinessUnitSlice = z
  .object({
    name: z.string(),
    net_revenue_share_percent: z.number(),
    net_revenue: z.number(),
    operating_income: z.number(),
  })
  .passthrough();
const FinanceReceivablesSnapshot = z
  .object({
    dro: z.number(),
    dbo: z.number(),
    duo: z.number(),
    insight: z.string(),
  })
  .passthrough();
const FinanceDashboardSummaryResponse = z
  .object({
    period: z.string(),
    primary_metrics: FinancePrimaryMetrics,
    kpi_progress: z.array(FinanceKpiProgress),
    ai_highlights: z.array(FinanceAiHighlight),
    business_units: z.array(FinanceBusinessUnitSlice),
    receivables: FinanceReceivablesSnapshot,
  })
  .passthrough();
const FinanceOverheadItem = z
  .object({
    category: z.string(),
    ytd_spend: z.number(),
    monthly_average: z.number(),
  })
  .passthrough();
const FinanceOverheadResponse = z
  .object({
    total_ytd: z.number(),
    top_category: FinanceOverheadItem,
    bottom_category: FinanceOverheadItem,
    categories: z.array(FinanceOverheadItem),
  })
  .passthrough();
const FinanceTrendPoint = z
  .object({ year: z.number().int(), value: z.number() })
  .passthrough();
const FinanceTrendMetric = z
  .object({
    metric: z.string(),
    points: z.array(FinanceTrendPoint),
    cagr_percent: z.number(),
  })
  .passthrough();
const FinanceTrendResponse = z
  .object({ metrics: z.array(FinanceTrendMetric) })
  .passthrough();
const business_unit = z
  .union([z.enum(["firmwide", "business_unit_a", "business_unit_b"]), z.null()])
  .optional();

export const schemas = {
  FinanceBookingRecord,
  FinanceBookingsResponse,
  FinanceDashboardMetric,
  FinancePrimaryMetrics,
  FinanceKpiProgress,
  FinanceAiHighlight,
  FinanceBusinessUnitSlice,
  FinanceReceivablesSnapshot,
  FinanceDashboardSummaryResponse,
  FinanceOverheadItem,
  FinanceOverheadResponse,
  FinanceTrendPoint,
  FinanceTrendMetric,
  FinanceTrendResponse,
  business_unit,
};

const endpoints = makeApi([
  {
    method: "get",
    path: "/api/v1/finance/dashboard/summary",
    alias:
      "read_finance_dashboard_summary_api_v1_finance_dashboard_summary_get",
    description: `Return the finance dashboard summary (primary metrics, KPI progress, AI insights).`,
    requestFormat: "json",
    parameters: [
      {
        name: "business_unit",
        type: "Query",
        schema: business_unit,
      },
    ],
    response: FinanceDashboardSummaryResponse,
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
    path: "/api/v1/finance/dashboard/overhead",
    alias: "read_finance_overhead_api_v1_finance_dashboard_overhead_get",
    description: `Return overhead spend analysis grouped by account category.`,
    requestFormat: "json",
    parameters: [
      {
        name: "business_unit",
        type: "Query",
        schema: business_unit,
      },
    ],
    response: FinanceOverheadResponse,
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
    path: "/api/v1/finance/dashboard/bookings",
    alias: "read_finance_bookings_api_v1_finance_dashboard_bookings_get",
    description: `Return bookings vs. plan progress by client.`,
    requestFormat: "json",
    parameters: [
      {
        name: "business_unit",
        type: "Query",
        schema: business_unit,
      },
    ],
    response: FinanceBookingsResponse,
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
    path: "/api/v1/finance/dashboard/trends",
    alias: "read_finance_trends_api_v1_finance_dashboard_trends_get",
    description: `Return year-over-year trend metrics for core finance KPIs.`,
    requestFormat: "json",
    parameters: [
      {
        name: "business_unit",
        type: "Query",
        schema: business_unit,
      },
    ],
    response: FinanceTrendResponse,
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
