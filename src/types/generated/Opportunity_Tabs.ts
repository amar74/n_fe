import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

import { HTTPValidationError } from "./common";
import { ValidationError } from "./common";

const OpportunityOverviewResponse = z
  .object({
    project_description: z.union([z.string(), z.null()]),
    project_scope: z.array(z.string()).default([]),
    key_metrics: z.object({}).partial().passthrough().default({}),
    documents_summary: z.object({}).partial().passthrough().default({}),
  })
  .partial()
  .passthrough();
const StakeholderResponse = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    designation: z.string(),
    email: z.union([z.string(), z.null()]),
    contact_number: z.union([z.string(), z.null()]),
    influence_level: z.string(),
    created_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const DriverResponse = z
  .object({
    id: z.string().uuid(),
    category: z.string(),
    description: z.string(),
    created_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const CompetitorResponse = z
  .object({
    id: z.string().uuid(),
    company_name: z.string(),
    threat_level: z.string(),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    created_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const StrategyResponse = z
  .object({
    id: z.string().uuid(),
    strategy_text: z.string(),
    priority: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const DeliveryModelResponse = z
  .object({
    approach: z.string(),
    key_phases: z.array(z.object({}).partial().passthrough()),
    identified_gaps: z.array(z.string()),
    models: z.array(z.object({}).partial().passthrough()).optional(),
    active_model_id: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const TeamMemberResponse = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    designation: z.string(),
    experience: z.string(),
    availability: z.string(),
    created_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const ReferenceResponse = z
  .object({
    id: z.string().uuid(),
    project_name: z.string(),
    client: z.string(),
    year: z.string(),
    status: z.string(),
    total_amount: z.string(),
    created_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const FinancialSummaryResponse = z
  .object({
    total_project_value: z.string().regex(/^(?!^[-+.]*$)[+-]?0*\d*\.?\d*$/),
    budget_categories: z.array(z.object({}).partial().passthrough()),
    contingency_percentage: z.string().regex(/^(?!^[-+.]*$)[+-]?0*\d*\.?\d*$/),
    profit_margin_percentage: z
      .string()
      .regex(/^(?!^[-+.]*$)[+-]?0*\d*\.?\d*$/),
  })
  .passthrough();
const RiskResponse = z
  .object({
    id: z.string().uuid(),
    category: z.string(),
    risk_description: z.string(),
    impact_level: z.string(),
    probability: z.string(),
    mitigation_strategy: z.string(),
    created_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const LegalChecklistItemResponse = z
  .object({
    id: z.string().uuid(),
    item_name: z.string(),
    status: z.string(),
    created_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const OpportunityTabDataResponse = z
  .object({
    overview: z.union([OpportunityOverviewResponse, z.null()]),
    stakeholders: z.array(StakeholderResponse).default([]),
    drivers: z.array(DriverResponse).default([]),
    competitors: z.array(CompetitorResponse).default([]),
    strategies: z.array(StrategyResponse).default([]),
    delivery_model: z.union([DeliveryModelResponse, z.null()]),
    team_members: z.array(TeamMemberResponse).default([]),
    references: z.array(ReferenceResponse).default([]),
    financial: z.union([FinancialSummaryResponse, z.null()]),
    risks: z.array(RiskResponse).default([]),
    legal_checklist: z.array(LegalChecklistItemResponse).default([]),
  })
  .partial()
  .passthrough();
const OpportunityOverviewUpdate = z
  .object({
    project_description: z.union([z.string(), z.null()]),
    project_scope: z.union([z.array(z.string()), z.null()]),
    key_metrics: z.union([z.object({}).partial().passthrough(), z.null()]),
  })
  .partial()
  .passthrough();
const StakeholderCreate = z
  .object({
    name: z.string().min(1).max(255),
    designation: z.string().min(1).max(255),
    email: z.union([z.string(), z.null()]).optional(),
    contact_number: z.union([z.string(), z.null()]).optional(),
    influence_level: z
      .string()
      .regex(
        /^(High|Medium|Low|Executive Sponsor|Economic Buyer|Technical Evaluator|Project Champion|Finance Approver|Operational Lead)$/
      ),
  })
  .passthrough();
const StakeholderUpdate = z
  .object({
    name: z.union([z.string(), z.null()]),
    designation: z.union([z.string(), z.null()]),
    email: z.union([z.string(), z.null()]),
    contact_number: z.union([z.string(), z.null()]),
    influence_level: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const DriverCreate = z
  .object({
    category: z.string().regex(/^(Political|Technical|Financial)$/),
    description: z.string().min(1),
  })
  .passthrough();
const DriverUpdate = z
  .object({
    category: z.union([z.string(), z.null()]),
    description: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const CompetitorCreate = z
  .object({
    company_name: z.string().min(1).max(255),
    threat_level: z.string().regex(/^(High|Medium|Low)$/),
    strengths: z.array(z.string()).optional().default([]),
    weaknesses: z.array(z.string()).optional().default([]),
  })
  .passthrough();
const CompetitorUpdate = z
  .object({
    company_name: z.union([z.string(), z.null()]),
    threat_level: z.union([z.string(), z.null()]),
    strengths: z.union([z.array(z.string()), z.null()]),
    weaknesses: z.union([z.array(z.string()), z.null()]),
  })
  .partial()
  .passthrough();
const StrategyCreate = z
  .object({
    strategy_text: z.string().min(1),
    priority: z.number().int().gte(1).lte(10).optional().default(1),
  })
  .passthrough();
const StrategyUpdate = z
  .object({
    strategy_text: z.union([z.string(), z.null()]),
    priority: z.union([z.number(), z.null()]),
  })
  .partial()
  .passthrough();
const DeliveryModelUpdate = z
  .object({
    approach: z.union([z.string(), z.null()]),
    key_phases: z.union([
      z.array(z.object({}).partial().passthrough()),
      z.null(),
    ]),
    identified_gaps: z.union([z.array(z.string()), z.null()]),
    models: z.union([z.array(z.object({}).partial().passthrough()), z.null()]),
  })
  .partial()
  .passthrough();
const TeamMemberCreate = z
  .object({
    name: z.string().min(1).max(255),
    designation: z.string().min(1).max(255),
    experience: z.string().min(1).max(255),
    availability: z.string().min(1).max(100),
  })
  .passthrough();
const TeamMemberUpdate = z
  .object({
    name: z.union([z.string(), z.null()]),
    designation: z.union([z.string(), z.null()]),
    experience: z.union([z.string(), z.null()]),
    availability: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const ReferenceCreate = z
  .object({
    project_name: z.string().min(1).max(255),
    client: z.string().min(1).max(255),
    year: z.string().min(4).max(10),
    status: z.string().min(1).max(255),
    total_amount: z.string().min(1).max(50),
  })
  .passthrough();
const ReferenceUpdate = z
  .object({
    project_name: z.union([z.string(), z.null()]),
    client: z.union([z.string(), z.null()]),
    year: z.union([z.string(), z.null()]),
    status: z.union([z.string(), z.null()]),
    total_amount: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const FinancialSummaryUpdate = z
  .object({
    total_project_value: z.union([z.number(), z.string(), z.null()]),
    budget_categories: z.union([
      z.array(z.object({}).partial().passthrough()),
      z.null(),
    ]),
    contingency_percentage: z.union([z.number(), z.string(), z.null()]),
    profit_margin_percentage: z.union([z.number(), z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const RiskCreate = z
  .object({
    category: z.string().regex(/^(Environmental|Political|Technical)$/),
    risk_description: z.string().min(1),
    impact_level: z.string().regex(/^(High|Medium|Low)$/),
    probability: z.string().regex(/^(High|Medium|Low)$/),
    mitigation_strategy: z.string().min(1),
  })
  .passthrough();
const RiskUpdate = z
  .object({
    category: z.union([z.string(), z.null()]),
    risk_description: z.union([z.string(), z.null()]),
    impact_level: z.union([z.string(), z.null()]),
    probability: z.union([z.string(), z.null()]),
    mitigation_strategy: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const LegalChecklistItemCreate = z
  .object({
    item_name: z.string().min(1).max(255),
    status: z.string().regex(/^(Complete|In progress|Pending)$/),
  })
  .passthrough();
const LegalChecklistItemUpdate = z
  .object({
    item_name: z.union([z.string(), z.null()]),
    status: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();

export const schemas = {
  OpportunityOverviewResponse,
  StakeholderResponse,
  DriverResponse,
  CompetitorResponse,
  StrategyResponse,
  DeliveryModelResponse,
  TeamMemberResponse,
  ReferenceResponse,
  FinancialSummaryResponse,
  RiskResponse,
  LegalChecklistItemResponse,
  OpportunityTabDataResponse,
  OpportunityOverviewUpdate,
  StakeholderCreate,
  StakeholderUpdate,
  DriverCreate,
  DriverUpdate,
  CompetitorCreate,
  CompetitorUpdate,
  StrategyCreate,
  StrategyUpdate,
  DeliveryModelUpdate,
  TeamMemberCreate,
  TeamMemberUpdate,
  ReferenceCreate,
  ReferenceUpdate,
  FinancialSummaryUpdate,
  RiskCreate,
  RiskUpdate,
  LegalChecklistItemCreate,
  LegalChecklistItemUpdate,
};

const endpoints = makeApi([
  {
    method: "get",
    path: "/api/opportunities/:opportunity_id/overview",
    alias:
      "get_opportunity_overview_api_opportunities__opportunity_id__overview_get",
    requestFormat: "json",
    parameters: [
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: OpportunityOverviewResponse,
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
    path: "/api/opportunities/:opportunity_id/overview",
    alias:
      "update_opportunity_overview_api_opportunities__opportunity_id__overview_put",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: OpportunityOverviewUpdate,
      },
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: OpportunityOverviewResponse,
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
    path: "/api/opportunities/:opportunity_id/stakeholders",
    alias:
      "get_opportunity_stakeholders_api_opportunities__opportunity_id__stakeholders_get",
    requestFormat: "json",
    parameters: [
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.array(StakeholderResponse),
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
    path: "/api/opportunities/:opportunity_id/stakeholders",
    alias:
      "create_opportunity_stakeholder_api_opportunities__opportunity_id__stakeholders_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: StakeholderCreate,
      },
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: StakeholderResponse,
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
    path: "/api/opportunities/:opportunity_id/stakeholders/:stakeholder_id",
    alias:
      "update_opportunity_stakeholder_api_opportunities__opportunity_id__stakeholders__stakeholder_id__put",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: StakeholderUpdate,
      },
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "stakeholder_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: StakeholderResponse,
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
    path: "/api/opportunities/:opportunity_id/stakeholders/:stakeholder_id",
    alias:
      "delete_opportunity_stakeholder_api_opportunities__opportunity_id__stakeholders__stakeholder_id__delete",
    requestFormat: "json",
    parameters: [
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "stakeholder_id",
        type: "Path",
        schema: z.string().uuid(),
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
    path: "/api/opportunities/:opportunity_id/drivers",
    alias:
      "get_opportunity_drivers_api_opportunities__opportunity_id__drivers_get",
    requestFormat: "json",
    parameters: [
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.array(DriverResponse),
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
    path: "/api/opportunities/:opportunity_id/drivers",
    alias:
      "create_opportunity_driver_api_opportunities__opportunity_id__drivers_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: DriverCreate,
      },
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: DriverResponse,
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
    path: "/api/opportunities/:opportunity_id/drivers/:driver_id",
    alias:
      "update_opportunity_driver_api_opportunities__opportunity_id__drivers__driver_id__put",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: DriverUpdate,
      },
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "driver_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: DriverResponse,
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
    path: "/api/opportunities/:opportunity_id/drivers/:driver_id",
    alias:
      "delete_opportunity_driver_api_opportunities__opportunity_id__drivers__driver_id__delete",
    requestFormat: "json",
    parameters: [
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "driver_id",
        type: "Path",
        schema: z.string().uuid(),
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
    path: "/api/opportunities/:opportunity_id/competitors",
    alias:
      "get_opportunity_competitors_api_opportunities__opportunity_id__competitors_get",
    requestFormat: "json",
    parameters: [
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.array(CompetitorResponse),
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
    path: "/api/opportunities/:opportunity_id/competitors",
    alias:
      "create_opportunity_competitor_api_opportunities__opportunity_id__competitors_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CompetitorCreate,
      },
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: CompetitorResponse,
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
    path: "/api/opportunities/:opportunity_id/competitors/:competitor_id",
    alias:
      "update_opportunity_competitor_api_opportunities__opportunity_id__competitors__competitor_id__put",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CompetitorUpdate,
      },
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "competitor_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: CompetitorResponse,
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
    path: "/api/opportunities/:opportunity_id/competitors/:competitor_id",
    alias:
      "delete_opportunity_competitor_api_opportunities__opportunity_id__competitors__competitor_id__delete",
    requestFormat: "json",
    parameters: [
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "competitor_id",
        type: "Path",
        schema: z.string().uuid(),
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
    path: "/api/opportunities/:opportunity_id/strategies",
    alias:
      "get_opportunity_strategies_api_opportunities__opportunity_id__strategies_get",
    requestFormat: "json",
    parameters: [
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.array(StrategyResponse),
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
    path: "/api/opportunities/:opportunity_id/strategies",
    alias:
      "create_opportunity_strategy_api_opportunities__opportunity_id__strategies_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: StrategyCreate,
      },
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: StrategyResponse,
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
    path: "/api/opportunities/:opportunity_id/strategies/:strategy_id",
    alias:
      "update_opportunity_strategy_api_opportunities__opportunity_id__strategies__strategy_id__put",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: StrategyUpdate,
      },
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "strategy_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: StrategyResponse,
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
    path: "/api/opportunities/:opportunity_id/strategies/:strategy_id",
    alias:
      "delete_opportunity_strategy_api_opportunities__opportunity_id__strategies__strategy_id__delete",
    requestFormat: "json",
    parameters: [
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "strategy_id",
        type: "Path",
        schema: z.string().uuid(),
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
    path: "/api/opportunities/:opportunity_id/delivery-model",
    alias:
      "get_opportunity_delivery_model_api_opportunities__opportunity_id__delivery_model_get",
    requestFormat: "json",
    parameters: [
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: DeliveryModelResponse,
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
    path: "/api/opportunities/:opportunity_id/delivery-model",
    alias:
      "update_opportunity_delivery_model_api_opportunities__opportunity_id__delivery_model_put",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: DeliveryModelUpdate,
      },
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: DeliveryModelResponse,
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
    path: "/api/opportunities/:opportunity_id/team",
    alias:
      "get_opportunity_team_members_api_opportunities__opportunity_id__team_get",
    requestFormat: "json",
    parameters: [
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.array(TeamMemberResponse),
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
    path: "/api/opportunities/:opportunity_id/team",
    alias:
      "create_opportunity_team_member_api_opportunities__opportunity_id__team_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: TeamMemberCreate,
      },
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: TeamMemberResponse,
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
    path: "/api/opportunities/:opportunity_id/team/:member_id",
    alias:
      "update_opportunity_team_member_api_opportunities__opportunity_id__team__member_id__put",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: TeamMemberUpdate,
      },
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "member_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: TeamMemberResponse,
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
    path: "/api/opportunities/:opportunity_id/team/:member_id",
    alias:
      "delete_opportunity_team_member_api_opportunities__opportunity_id__team__member_id__delete",
    requestFormat: "json",
    parameters: [
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "member_id",
        type: "Path",
        schema: z.string().uuid(),
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
    path: "/api/opportunities/:opportunity_id/references",
    alias:
      "get_opportunity_references_api_opportunities__opportunity_id__references_get",
    requestFormat: "json",
    parameters: [
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.array(ReferenceResponse),
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
    path: "/api/opportunities/:opportunity_id/references",
    alias:
      "create_opportunity_reference_api_opportunities__opportunity_id__references_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ReferenceCreate,
      },
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: ReferenceResponse,
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
    path: "/api/opportunities/:opportunity_id/references/:reference_id",
    alias:
      "update_opportunity_reference_api_opportunities__opportunity_id__references__reference_id__put",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ReferenceUpdate,
      },
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "reference_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: ReferenceResponse,
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
    path: "/api/opportunities/:opportunity_id/references/:reference_id",
    alias:
      "delete_opportunity_reference_api_opportunities__opportunity_id__references__reference_id__delete",
    requestFormat: "json",
    parameters: [
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "reference_id",
        type: "Path",
        schema: z.string().uuid(),
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
    path: "/api/opportunities/:opportunity_id/financial",
    alias:
      "get_opportunity_financial_summary_api_opportunities__opportunity_id__financial_get",
    requestFormat: "json",
    parameters: [
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: FinancialSummaryResponse,
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
    path: "/api/opportunities/:opportunity_id/financial",
    alias:
      "update_opportunity_financial_summary_api_opportunities__opportunity_id__financial_put",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: FinancialSummaryUpdate,
      },
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: FinancialSummaryResponse,
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
    path: "/api/opportunities/:opportunity_id/risks",
    alias: "get_opportunity_risks_api_opportunities__opportunity_id__risks_get",
    requestFormat: "json",
    parameters: [
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.array(RiskResponse),
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
    path: "/api/opportunities/:opportunity_id/risks",
    alias:
      "create_opportunity_risk_api_opportunities__opportunity_id__risks_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: RiskCreate,
      },
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: RiskResponse,
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
    path: "/api/opportunities/:opportunity_id/risks/:risk_id",
    alias:
      "update_opportunity_risk_api_opportunities__opportunity_id__risks__risk_id__put",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: RiskUpdate,
      },
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "risk_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: RiskResponse,
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
    path: "/api/opportunities/:opportunity_id/risks/:risk_id",
    alias:
      "delete_opportunity_risk_api_opportunities__opportunity_id__risks__risk_id__delete",
    requestFormat: "json",
    parameters: [
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "risk_id",
        type: "Path",
        schema: z.string().uuid(),
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
    path: "/api/opportunities/:opportunity_id/legal-checklist",
    alias:
      "get_opportunity_legal_checklist_api_opportunities__opportunity_id__legal_checklist_get",
    requestFormat: "json",
    parameters: [
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.array(LegalChecklistItemResponse),
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
    path: "/api/opportunities/:opportunity_id/legal-checklist",
    alias:
      "create_opportunity_legal_checklist_item_api_opportunities__opportunity_id__legal_checklist_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: LegalChecklistItemCreate,
      },
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: LegalChecklistItemResponse,
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
    path: "/api/opportunities/:opportunity_id/legal-checklist/:item_id",
    alias:
      "update_opportunity_legal_checklist_item_api_opportunities__opportunity_id__legal_checklist__item_id__put",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: LegalChecklistItemUpdate,
      },
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "item_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: LegalChecklistItemResponse,
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
    path: "/api/opportunities/:opportunity_id/legal-checklist/:item_id",
    alias:
      "delete_opportunity_legal_checklist_item_api_opportunities__opportunity_id__legal_checklist__item_id__delete",
    requestFormat: "json",
    parameters: [
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "item_id",
        type: "Path",
        schema: z.string().uuid(),
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
    path: "/api/opportunities/:opportunity_id/all-tabs",
    alias:
      "get_all_opportunity_tab_data_api_opportunities__opportunity_id__all_tabs_get",
    requestFormat: "json",
    parameters: [
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: OpportunityTabDataResponse,
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
