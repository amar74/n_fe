import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

import { HTTPValidationError } from "./common";
import { ValidationError } from "./common";
import { stage } from "./common";

const ProposalApprovalStatus = z.enum([
  "pending",
  "approved",
  "rejected",
  "skipped",
]);
const ProposalApprovalCreate = z
  .object({
    stage_name: z.string(),
    required_role: z.union([z.string(), z.null()]).optional(),
    sequence: z.number().int().gte(0).optional().default(0),
    status: ProposalApprovalStatus.optional(),
    approver_id: z.union([z.string(), z.null()]).optional(),
    comments: z.union([z.string(), z.null()]).optional(),
    extra_metadata: z
      .union([z.object({}).partial().passthrough(), z.null()])
      .optional(),
  })
  .passthrough();
const ProposalApprovalDecision = z
  .object({
    approval_id: z.string().uuid(),
    decision: ProposalApprovalStatus,
    comments: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const ProposalApprovalResponse = z
  .object({
    stage_name: z.string(),
    required_role: z.union([z.string(), z.null()]).optional(),
    sequence: z.number().int().gte(0).optional().default(0),
    status: ProposalApprovalStatus.optional(),
    approver_id: z.union([z.string(), z.null()]).optional(),
    comments: z.union([z.string(), z.null()]).optional(),
    extra_metadata: z
      .union([z.object({}).partial().passthrough(), z.null()])
      .optional(),
    id: z.string().uuid(),
    decision_at: z.union([z.string(), z.null()]).optional(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const ProposalStatus = z.enum([
  "draft",
  "in_review",
  "approved",
  "submitted",
  "won",
  "lost",
  "archived",
]);
const ProposalSectionStatus = z.enum(["draft", "in_review", "approved"]);
const ProposalSectionCreate = z
  .object({
    section_type: z.string(),
    title: z.string(),
    content: z.union([z.string(), z.null()]).optional(),
    status: ProposalSectionStatus.optional(),
    page_count: z.union([z.number(), z.null()]).optional(),
    ai_generated_percentage: z.union([z.number(), z.null()]).optional(),
    extra_metadata: z
      .union([z.object({}).partial().passthrough(), z.null()])
      .optional(),
    display_order: z.union([z.number(), z.null()]).optional().default(0),
  })
  .passthrough();
const ProposalDocumentCategory = z.enum([
  "rfp",
  "boq",
  "schedule",
  "technical",
  "commercial",
  "attachment",
  "generated",
]);
const ProposalDocumentCreate = z
  .object({
    name: z.string(),
    category: ProposalDocumentCategory.optional(),
    file_path: z.union([z.string(), z.null()]).optional(),
    external_url: z.union([z.string(), z.null()]).optional(),
    extra_metadata: z
      .union([z.object({}).partial().passthrough(), z.null()])
      .optional(),
  })
  .passthrough();
const ProposalCreate = z
  .object({
    opportunity_id: z.union([z.string(), z.null()]).optional(),
    account_id: z.union([z.string(), z.null()]).optional(),
    owner_id: z.union([z.string(), z.null()]).optional(),
    title: z.string(),
    summary: z.union([z.string(), z.null()]).optional(),
    status: ProposalStatus.optional(),
    total_value: z.union([z.number(), z.null()]).optional(),
    currency: z.string().min(3).max(3).optional().default("USD"),
    estimated_cost: z.union([z.number(), z.null()]).optional(),
    expected_margin: z.union([z.number(), z.null()]).optional(),
    fee_structure: z
      .union([z.object({}).partial().passthrough(), z.null()])
      .optional(),
    due_date: z.union([z.string(), z.null()]).optional(),
    submission_date: z.union([z.string(), z.null()]).optional(),
    client_response_date: z.union([z.string(), z.null()]).optional(),
    ai_assistance_summary: z.union([z.string(), z.null()]).optional(),
    ai_content_percentage: z.union([z.number(), z.null()]).optional(),
    finance_snapshot: z
      .union([z.object({}).partial().passthrough(), z.null()])
      .optional(),
    resource_snapshot: z
      .union([z.object({}).partial().passthrough(), z.null()])
      .optional(),
    client_snapshot: z
      .union([z.object({}).partial().passthrough(), z.null()])
      .optional(),
    requires_approval: z.boolean().optional().default(true),
    notes: z.union([z.string(), z.null()]).optional(),
    tags: z.union([z.array(z.string()), z.null()]).optional(),
    sections: z.union([z.array(ProposalSectionCreate), z.null()]).optional(),
    documents: z.union([z.array(ProposalDocumentCreate), z.null()]).optional(),
  })
  .passthrough();
const ProposalDocumentResponse = z
  .object({
    name: z.string(),
    category: ProposalDocumentCategory.optional(),
    file_path: z.union([z.string(), z.null()]).optional(),
    external_url: z.union([z.string(), z.null()]).optional(),
    extra_metadata: z
      .union([z.object({}).partial().passthrough(), z.null()])
      .optional(),
    id: z.string().uuid(),
    uploaded_by: z.union([z.string(), z.null()]),
    uploaded_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const ProposalListItem = z
  .object({
    id: z.string().uuid(),
    proposal_number: z.string(),
    title: z.string(),
    status: ProposalStatus,
    opportunity_id: z.union([z.string(), z.null()]),
    account_id: z.union([z.string(), z.null()]),
    total_value: z.union([z.number(), z.null()]),
    currency: z.string(),
    submission_date: z.union([z.string(), z.null()]),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const ProposalListResponse = z
  .object({
    items: z.array(ProposalListItem),
    total: z.number().int(),
    page: z.number().int(),
    size: z.number().int(),
  })
  .passthrough();
const ProposalSource = z.enum(["opportunity", "manual"]);
const ProposalSectionResponse = z
  .object({
    section_type: z.string(),
    title: z.string(),
    content: z.union([z.string(), z.null()]).optional(),
    status: ProposalSectionStatus.optional(),
    page_count: z.union([z.number(), z.null()]).optional(),
    ai_generated_percentage: z.union([z.number(), z.null()]).optional(),
    extra_metadata: z
      .union([z.object({}).partial().passthrough(), z.null()])
      .optional(),
    display_order: z.union([z.number(), z.null()]).optional().default(0),
    id: z.string().uuid(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const ProposalResponse = z
  .object({
    id: z.string().uuid(),
    org_id: z.string().uuid(),
    proposal_number: z.string(),
    title: z.string(),
    summary: z.union([z.string(), z.null()]),
    status: ProposalStatus,
    source: ProposalSource,
    version: z.number().int(),
    opportunity_id: z.union([z.string(), z.null()]),
    account_id: z.union([z.string(), z.null()]),
    owner_id: z.union([z.string(), z.null()]),
    created_by: z.union([z.string(), z.null()]),
    total_value: z.union([z.number(), z.null()]),
    currency: z.string(),
    estimated_cost: z.union([z.number(), z.null()]),
    expected_margin: z.union([z.number(), z.null()]),
    fee_structure: z.union([z.object({}).partial().passthrough(), z.null()]),
    due_date: z.union([z.string(), z.null()]),
    submission_date: z.union([z.string(), z.null()]),
    client_response_date: z.union([z.string(), z.null()]),
    won_at: z.union([z.string(), z.null()]),
    lost_at: z.union([z.string(), z.null()]),
    ai_assistance_summary: z.union([z.string(), z.null()]),
    ai_content_percentage: z.union([z.number(), z.null()]),
    ai_last_run_at: z.union([z.string(), z.null()]),
    ai_metadata: z.union([z.object({}).partial().passthrough(), z.null()]),
    finance_snapshot: z.union([z.object({}).partial().passthrough(), z.null()]),
    resource_snapshot: z.union([
      z.object({}).partial().passthrough(),
      z.null(),
    ]),
    client_snapshot: z.union([z.object({}).partial().passthrough(), z.null()]),
    requires_approval: z.boolean(),
    approval_completed: z.boolean(),
    converted_to_project: z.boolean(),
    conversion_metadata: z.union([
      z.object({}).partial().passthrough(),
      z.null(),
    ]),
    notes: z.union([z.string(), z.null()]),
    tags: z.union([z.array(z.string()), z.null()]),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    sections: z.array(ProposalSectionResponse).optional().default([]),
    documents: z.array(ProposalDocumentResponse).optional().default([]),
    approvals: z.array(ProposalApprovalResponse).optional().default([]),
  })
  .passthrough();
const ProposalSectionUpdate = z
  .object({
    title: z.union([z.string(), z.null()]),
    content: z.union([z.string(), z.null()]),
    status: z.union([ProposalSectionStatus, z.null()]),
    page_count: z.union([z.number(), z.null()]),
    ai_generated_percentage: z.union([z.number(), z.null()]),
    extra_metadata: z.union([z.object({}).partial().passthrough(), z.null()]),
    display_order: z.union([z.number(), z.null()]),
  })
  .partial()
  .passthrough();
const ProposalStatusUpdateRequest = z
  .object({
    status: ProposalStatus,
    notes: z.union([z.string(), z.null()]).optional(),
    conversion_metadata: z
      .union([z.object({}).partial().passthrough(), z.null()])
      .optional(),
  })
  .passthrough();
const ProposalSubmitRequest = z
  .object({
    approval_flow: z.union([z.array(ProposalApprovalCreate), z.null()]),
  })
  .partial()
  .passthrough();
const status_filter = z.union([ProposalStatus, z.null()]).optional();
const ProposalUpdate = z
  .object({
    title: z.union([z.string(), z.null()]),
    summary: z.union([z.string(), z.null()]),
    owner_id: z.union([z.string(), z.null()]),
    total_value: z.union([z.number(), z.null()]),
    currency: z.union([z.string(), z.null()]),
    estimated_cost: z.union([z.number(), z.null()]),
    expected_margin: z.union([z.number(), z.null()]),
    fee_structure: z.union([z.object({}).partial().passthrough(), z.null()]),
    due_date: z.union([z.string(), z.null()]),
    submission_date: z.union([z.string(), z.null()]),
    client_response_date: z.union([z.string(), z.null()]),
    ai_assistance_summary: z.union([z.string(), z.null()]),
    ai_content_percentage: z.union([z.number(), z.null()]),
    finance_snapshot: z.union([z.object({}).partial().passthrough(), z.null()]),
    resource_snapshot: z.union([
      z.object({}).partial().passthrough(),
      z.null(),
    ]),
    client_snapshot: z.union([z.object({}).partial().passthrough(), z.null()]),
    requires_approval: z.union([z.boolean(), z.null()]),
    notes: z.union([z.string(), z.null()]),
    tags: z.union([z.array(z.string()), z.null()]),
  })
  .partial()
  .passthrough();
const ProposalConversionResponse = z
  .object({
    proposal_id: z.string().uuid(),
    converted_to_project: z.boolean(),
    project_reference: z
      .union([z.object({}).partial().passthrough(), z.null()])
      .optional(),
    message: z.string(),
  })
  .passthrough();
const ProposalConvertRequest = z
  .object({
    conversion_metadata: z.union([
      z.object({}).partial().passthrough(),
      z.null(),
    ]),
  })
  .partial()
  .passthrough();

export const schemas = {
  ProposalApprovalStatus,
  ProposalApprovalCreate,
  ProposalApprovalDecision,
  ProposalApprovalResponse,
  ProposalStatus,
  ProposalSectionStatus,
  ProposalSectionCreate,
  ProposalDocumentCategory,
  ProposalDocumentCreate,
  ProposalCreate,
  ProposalDocumentResponse,
  ProposalListItem,
  ProposalListResponse,
  ProposalSource,
  ProposalSectionResponse,
  ProposalResponse,
  ProposalSectionUpdate,
  ProposalStatusUpdateRequest,
  ProposalSubmitRequest,
  status_filter,
  ProposalUpdate,
  ProposalConversionResponse,
  ProposalConvertRequest,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/api/proposals/create",
    alias: "create_proposal_api_proposals_create_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ProposalCreate,
      },
    ],
    response: ProposalResponse,
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
    path: "/api/proposals/",
    alias: "list_proposals_api_proposals__get",
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "size",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(10),
      },
      {
        name: "status_filter",
        type: "Query",
        schema: status_filter,
      },
      {
        name: "search",
        type: "Query",
        schema: stage,
      },
    ],
    response: ProposalListResponse,
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
    path: "/api/proposals/:proposal_id",
    alias: "get_proposal_api_proposals__proposal_id__get",
    requestFormat: "json",
    parameters: [
      {
        name: "proposal_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: ProposalResponse,
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
    path: "/api/proposals/:proposal_id",
    alias: "update_proposal_api_proposals__proposal_id__put",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ProposalUpdate,
      },
      {
        name: "proposal_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: ProposalResponse,
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
    path: "/api/proposals/by-opportunity/:opportunity_id",
    alias:
      "get_proposals_by_opportunity_api_proposals_by_opportunity__opportunity_id__get",
    requestFormat: "json",
    parameters: [
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.array(ProposalResponse),
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
    path: "/api/proposals/submit/:proposal_id",
    alias: "submit_proposal_api_proposals_submit__proposal_id__post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ProposalSubmitRequest,
      },
      {
        name: "proposal_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: ProposalResponse,
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
    path: "/api/proposals/approve/:proposal_id",
    alias: "decide_proposal_approval_api_proposals_approve__proposal_id__post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ProposalApprovalDecision,
      },
      {
        name: "proposal_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: ProposalResponse,
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
    path: "/api/proposals/status/:proposal_id",
    alias: "update_proposal_status_api_proposals_status__proposal_id__post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ProposalStatusUpdateRequest,
      },
      {
        name: "proposal_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: ProposalResponse,
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
    path: "/api/proposals/convert/:proposal_id",
    alias: "convert_proposal_api_proposals_convert__proposal_id__post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ProposalConvertRequest,
      },
      {
        name: "proposal_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: ProposalConversionResponse,
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
    path: "/api/proposals/:proposal_id/sections",
    alias: "add_proposal_section_api_proposals__proposal_id__sections_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ProposalSectionCreate,
      },
      {
        name: "proposal_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: ProposalResponse,
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
    path: "/api/proposals/:proposal_id/sections/:section_id",
    alias:
      "update_proposal_section_api_proposals__proposal_id__sections__section_id__put",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ProposalSectionUpdate,
      },
      {
        name: "proposal_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "section_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: ProposalResponse,
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
    path: "/api/proposals/:proposal_id/documents",
    alias: "add_proposal_document_api_proposals__proposal_id__documents_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ProposalDocumentCreate,
      },
      {
        name: "proposal_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: ProposalResponse,
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
