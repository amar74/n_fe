import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

import { HTTPValidationError } from "./common";
import { ValidationError } from "./common";

const OpportunityDocumentResponse = z
  .object({
    file_name: z.string().min(1).max(255),
    original_name: z.string().min(1).max(255),
    file_type: z.string().min(1).max(100),
    file_size: z.number().int().gt(0),
    category: z.string().min(1).max(100),
    purpose: z.string().min(1).max(100),
    description: z.union([z.string(), z.null()]).optional(),
    tags: z.union([z.string(), z.null()]).optional(),
    status: z.union([z.string(), z.null()]).optional().default("uploaded"),
    is_available_for_proposal: z
      .union([z.boolean(), z.null()])
      .optional()
      .default(true),
    file_path: z.union([z.string(), z.null()]).optional(),
    file_url: z.union([z.string(), z.null()]).optional(),
    id: z.string().uuid(),
    opportunity_id: z.string().uuid(),
    upload_date: z.union([z.string(), z.null()]).optional(),
    uploaded_at: z.union([z.string(), z.null()]).optional(),
    updated_at: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const OpportunityDocumentListResponse = z
  .object({
    documents: z.array(OpportunityDocumentResponse),
    total: z.number().int(),
    page: z.number().int(),
    limit: z.number().int(),
    total_pages: z.number().int(),
  })
  .passthrough();
const Body_upload_opportunity_document_api_opportunities__opportunity_id__documents_upload_post =
  z
    .object({
      file: z.instanceof(File),
      category: z.string(),
      purpose: z.string(),
    })
    .passthrough();
const OpportunityDocumentCreate = z
  .object({
    file_name: z.string().min(1).max(255),
    original_name: z.string().min(1).max(255),
    file_type: z.string().min(1).max(100),
    file_size: z.number().int().gt(0),
    category: z.string().min(1).max(100),
    purpose: z.string().min(1).max(100),
    description: z.union([z.string(), z.null()]).optional(),
    tags: z.union([z.string(), z.null()]).optional(),
    status: z.union([z.string(), z.null()]).optional().default("uploaded"),
    is_available_for_proposal: z
      .union([z.boolean(), z.null()])
      .optional()
      .default(true),
    file_path: z.union([z.string(), z.null()]).optional(),
    file_url: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const OpportunityDocumentUpdate = z
  .object({
    file_name: z.union([z.string(), z.null()]),
    original_name: z.union([z.string(), z.null()]),
    file_type: z.union([z.string(), z.null()]),
    file_size: z.union([z.number(), z.null()]),
    category: z.union([z.string(), z.null()]),
    purpose: z.union([z.string(), z.null()]),
    description: z.union([z.string(), z.null()]),
    tags: z.union([z.string(), z.null()]),
    status: z.union([z.string(), z.null()]),
    is_available_for_proposal: z.union([z.boolean(), z.null()]),
    file_url: z.union([z.string(), z.null()]),
    file_path: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const OpportunityDocumentDeleteResponse = z
  .object({ message: z.string(), document_id: z.string().uuid() })
  .passthrough();

export const schemas = {
  OpportunityDocumentResponse,
  OpportunityDocumentListResponse,
  Body_upload_opportunity_document_api_opportunities__opportunity_id__documents_upload_post,
  OpportunityDocumentCreate,
  OpportunityDocumentUpdate,
  OpportunityDocumentDeleteResponse,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/api/opportunities/:opportunity_id/documents/upload",
    alias:
      "upload_opportunity_document_api_opportunities__opportunity_id__documents_upload_post",
    requestFormat: "form-data",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema:
          Body_upload_opportunity_document_api_opportunities__opportunity_id__documents_upload_post,
      },
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: OpportunityDocumentResponse,
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
    path: "/api/opportunities/:opportunity_id/documents",
    alias:
      "create_opportunity_document_api_opportunities__opportunity_id__documents_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: OpportunityDocumentCreate,
      },
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: OpportunityDocumentResponse,
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
    path: "/api/opportunities/:opportunity_id/documents",
    alias:
      "get_opportunity_documents_api_opportunities__opportunity_id__documents_get",
    requestFormat: "json",
    parameters: [
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(10),
      },
    ],
    response: OpportunityDocumentListResponse,
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
    path: "/api/opportunities/:opportunity_id/documents/:document_id",
    alias:
      "get_opportunity_document_api_opportunities__opportunity_id__documents__document_id__get",
    requestFormat: "json",
    parameters: [
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "document_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: OpportunityDocumentResponse,
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
    path: "/api/opportunities/:opportunity_id/documents/:document_id",
    alias:
      "update_opportunity_document_api_opportunities__opportunity_id__documents__document_id__put",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: OpportunityDocumentUpdate,
      },
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "document_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: OpportunityDocumentResponse,
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
    path: "/api/opportunities/:opportunity_id/documents/:document_id",
    alias:
      "delete_opportunity_document_api_opportunities__opportunity_id__documents__document_id__delete",
    requestFormat: "json",
    parameters: [
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "document_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: OpportunityDocumentDeleteResponse,
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
    path: "/api/opportunities/:opportunity_id/documents/:document_id/download",
    alias:
      "download_opportunity_document_api_opportunities__opportunity_id__documents__document_id__download_get",
    requestFormat: "json",
    parameters: [
      {
        name: "opportunity_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "document_id",
        type: "Path",
        schema: z.string().uuid(),
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
