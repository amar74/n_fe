import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

import { HTTPValidationError } from "./common";
import { ValidationError } from "./common";

const AccountDocumentResponse = z
  .object({
    id: z.string().uuid(),
    account_id: z.string().uuid(),
    name: z.string(),
    category: z.string(),
    date: z.string().datetime({ offset: true }),
    file_name: z.string(),
    file_path: z.union([z.string(), z.null()]),
    file_size: z.union([z.number(), z.null()]),
    mime_type: z.union([z.string(), z.null()]),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.union([z.string(), z.null()]),
  })
  .passthrough();
const AccountDocumentListResponse = z
  .object({
    documents: z.array(AccountDocumentResponse),
    total: z.number().int(),
    page: z.number().int(),
    limit: z.number().int(),
  })
  .passthrough();
const AccountDocumentCreateRequest = z
  .object({
    name: z.string().min(1).max(255),
    category: z.string().min(1).max(100),
    date: z.string().datetime({ offset: true }),
    file_name: z.string().min(1).max(255),
    file_size: z.union([z.number(), z.null()]).optional(),
    mime_type: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const AccountDocumentUpdateRequest = z
  .object({
    name: z.union([z.string(), z.null()]),
    category: z.union([z.string(), z.null()]),
    date: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const AccountDocumentDeleteResponse = z
  .object({ id: z.string().uuid(), message: z.string() })
  .passthrough();

export const schemas = {
  AccountDocumentResponse,
  AccountDocumentListResponse,
  AccountDocumentCreateRequest,
  AccountDocumentUpdateRequest,
  AccountDocumentDeleteResponse,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/api/accounts/:account_id/documents/",
    alias: "createAccountDocument",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: AccountDocumentCreateRequest,
      },
      {
        name: "account_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: AccountDocumentResponse,
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
    path: "/api/accounts/:account_id/documents/",
    alias: "listAccountDocuments",
    requestFormat: "json",
    parameters: [
      {
        name: "account_id",
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
    response: AccountDocumentListResponse,
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
    path: "/api/accounts/:account_id/documents/:document_id",
    alias: "getAccountDocument",
    requestFormat: "json",
    parameters: [
      {
        name: "account_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "document_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: AccountDocumentResponse,
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
    path: "/api/accounts/:account_id/documents/:document_id",
    alias: "updateAccountDocument",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: AccountDocumentUpdateRequest,
      },
      {
        name: "account_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "document_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: AccountDocumentResponse,
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
    path: "/api/accounts/:account_id/documents/:document_id",
    alias: "deleteAccountDocument",
    requestFormat: "json",
    parameters: [
      {
        name: "account_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "document_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: AccountDocumentDeleteResponse,
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
