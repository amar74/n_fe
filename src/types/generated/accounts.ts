import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

import { HTTPValidationError } from "./common";
import { ValidationError } from "./common";

const AddressCreate = z
  .object({
    line1: z.union([z.string(), z.null()]),
    line2: z.union([z.string(), z.null()]),
    city: z.union([z.string(), z.null()]),
    state: z.union([z.string(), z.null()]),
    pincode: z.union([z.number(), z.null()]),
  })
  .partial()
  .passthrough();
const ContactCreate = z
  .object({
    name: z.union([z.string(), z.null()]),
    email: z.union([z.string(), z.null()]),
    phone: z.union([z.string(), z.null()]),
    title: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const ClientType = z.enum(["tier_1", "tier_2", "tier_3"]);
const AccountCreate = z
  .object({
    company_website: z.union([z.string(), z.null()]),
    client_name: z.union([z.string(), z.null()]),
    client_address: z.union([AddressCreate, z.null()]),
    primary_contact: z.union([ContactCreate, z.null()]),
    secondary_contacts: z.array(ContactCreate),
    client_type: z.union([ClientType, z.null()]),
    market_sector: z.union([z.string(), z.null()]),
    total_value: z.union([z.number(), z.null()]),
    hosting_area: z.union([z.string(), z.null()]),
    notes: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const AddressResponse = z
  .object({
    line1: z.union([z.string(), z.null()]).optional(),
    line2: z.union([z.string(), z.null()]).optional(),
    city: z.union([z.string(), z.null()]).optional(),
    state: z.union([z.string(), z.null()]).optional(),
    pincode: z.union([z.number(), z.null()]).optional(),
    address_id: z.string().uuid(),
  })
  .passthrough();
const ContactResponse = z
  .object({
    name: z.union([z.string(), z.null()]).optional(),
    email: z.union([z.string(), z.null()]).optional(),
    phone: z.union([z.string(), z.null()]).optional(),
    title: z.union([z.string(), z.null()]).optional(),
    contact_id: z.string().uuid(),
  })
  .passthrough();
const AccountDetailResponse = z
  .object({
    account_id: z.string().uuid(),
    custom_id: z.union([z.string(), z.null()]).optional(),
    company_website: z.union([z.string(), z.null()]).optional(),
    client_name: z.string(),
    client_address: z.union([AddressResponse, z.null()]).optional(),
    primary_contact: z.union([ContactResponse, z.null()]).optional(),
    secondary_contacts: z.array(ContactResponse).optional(),
    client_type: ClientType,
    market_sector: z.union([z.string(), z.null()]).optional(),
    notes: z.union([z.string(), z.null()]).optional(),
    total_value: z.union([z.number(), z.null()]).optional(),
    ai_health_score: z.union([z.number(), z.null()]).optional(),
    health_trend: z.union([z.string(), z.null()]).optional(),
    risk_level: z.union([z.string(), z.null()]).optional(),
    last_ai_analysis: z.union([z.string(), z.null()]).optional(),
    data_quality_score: z.union([z.number(), z.null()]).optional(),
    revenue_growth: z.union([z.number(), z.null()]).optional(),
    communication_frequency: z.union([z.number(), z.null()]).optional(),
    win_rate: z.union([z.number(), z.null()]).optional(),
    opportunities: z.union([z.number(), z.null()]).optional(),
    last_contact: z.union([z.string(), z.null()]).optional(),
    hosting_area: z.union([z.string(), z.null()]).optional(),
    account_approver: z.union([z.string(), z.null()]).optional(),
    approval_date: z.union([z.string(), z.null()]).optional(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.union([z.string(), z.null()]).optional(),
    created_by_name: z.union([z.string(), z.null()]).optional(),
    updated_by_name: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const AccountListItem = z
  .object({
    account_id: z.string().uuid(),
    custom_id: z.union([z.string(), z.null()]).optional(),
    client_name: z.string(),
    client_address: z.union([AddressResponse, z.null()]).optional(),
    primary_contact_name: z.union([z.string(), z.null()]).optional(),
    primary_contact_email: z.union([z.string(), z.null()]).optional(),
    client_type: ClientType,
    market_sector: z.union([z.string(), z.null()]).optional(),
    total_value: z.union([z.number(), z.null()]).optional(),
    ai_health_score: z.union([z.number(), z.null()]).optional(),
    health_trend: z.union([z.string(), z.null()]).optional(),
    risk_level: z.union([z.string(), z.null()]).optional(),
    last_contact: z.union([z.string(), z.null()]).optional(),
    approval_status: z.union([z.string(), z.null()]).optional(),
    account_approver: z.union([z.string(), z.null()]).optional(),
    approval_date: z.union([z.string(), z.null()]).optional(),
    created_by_name: z.union([z.string(), z.null()]).optional(),
    created_at: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const AccountListResponse = z
  .object({
    accounts: z.array(AccountListItem),
    pagination: z.object({}).partial().passthrough(),
  })
  .passthrough();
const AccountUpdate = z
  .object({
    company_website: z.union([z.string(), z.null()]),
    client_name: z.union([z.string(), z.null()]),
    client_address: z.union([AddressCreate, z.null()]),
    primary_contact: z.union([ContactCreate, z.null()]),
    client_type: z.union([ClientType, z.null()]),
    market_sector: z.union([z.string(), z.null()]),
    notes: z.union([z.string(), z.null()]),
    hosting_area: z.union([z.string(), z.null()]),
    account_approver: z.union([z.string(), z.null()]),
    approval_date: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const AccountCreateResponse = z
  .object({
    status_code: z.number().int().optional().default(201),
    account_id: z.string(),
    message: z.string(),
  })
  .passthrough();
const ContactUpdateRequest = z
  .object({
    name: z.union([z.string(), z.null()]),
    email: z.union([z.string(), z.null()]),
    phone: z.union([z.string(), z.null()]),
    title: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const AccountUpdateResponse = z
  .object({
    status_code: z.number().int().optional().default(200),
    account_id: z.string(),
    message: z.string(),
  })
  .passthrough();
const AccountApprovalRequest = z
  .object({ notes: z.union([z.string(), z.null()]) })
  .partial()
  .passthrough();

export const schemas = {
  AddressCreate,
  ContactCreate,
  ClientType,
  AccountCreate,
  AddressResponse,
  ContactResponse,
  AccountDetailResponse,
  AccountListItem,
  AccountListResponse,
  AccountUpdate,
  AccountCreateResponse,
  ContactUpdateRequest,
  AccountUpdateResponse,
  AccountApprovalRequest,
};

const endpoints = makeApi([
  {
    method: "get",
    path: "/api/accounts/:account_id/activities",
    alias: "get_account_activities_api_accounts__account_id__activities_get",
    description: `Get recent activities for a specific account
Returns: notes, documents, opportunities, team changes, contact changes`,
    requestFormat: "json",
    parameters: [
      {
        name: "account_id",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(50).optional().default(10),
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
    method: "get",
    path: "/api/accounts/",
    alias: "list_accounts_api_accounts__get",
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
    ],
    response: AccountListResponse,
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
    path: "/api/accounts/",
    alias: "create_account_api_accounts__post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: AccountCreate,
      },
    ],
    response: AccountCreateResponse,
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
    path: "/api/accounts/export",
    alias: "export_accounts_api_accounts_export_get",
    description: `Export all accounts for the current user&#x27;s organization to CSV format`,
    requestFormat: "json",
    response: z.unknown(),
  },
  {
    method: "delete",
    path: "/api/accounts/:account_id/contacts/:contact_id",
    alias:
      "delete_account_contact_api_accounts__account_id__contacts__contact_id__delete",
    description: `Delete a contact from an account`,
    requestFormat: "json",
    parameters: [
      {
        name: "account_id",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "contact_id",
        type: "Path",
        schema: z.string(),
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
    method: "put",
    path: "/api/accounts/:account_id/contacts/:contact_id",
    alias:
      "update_account_contact_api_accounts__account_id__contacts__contact_id__put",
    description: `Update a contact for an account`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ContactUpdateRequest,
      },
      {
        name: "account_id",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "contact_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: ContactResponse,
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
    path: "/api/accounts/:account_id",
    alias: "get_account_api_accounts__account_id__get",
    requestFormat: "json",
    parameters: [
      {
        name: "account_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: AccountDetailResponse,
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
    path: "/api/accounts/:account_id",
    alias: "update_account_api_accounts__account_id__put",
    description: `Update account details including address and primary contact`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: AccountUpdate,
      },
      {
        name: "account_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: AccountUpdateResponse,
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
    path: "/api/accounts/test",
    alias: "test_accounts_api_accounts_test_get",
    requestFormat: "json",
    response: AccountListResponse,
  },
  {
    method: "post",
    path: "/api/accounts/:account_id/approve",
    alias: "approve_account_api_accounts__account_id__approve_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: AccountApprovalRequest,
      },
      {
        name: "account_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: AccountUpdateResponse,
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
    path: "/api/accounts/:account_id/decline",
    alias: "decline_account_api_accounts__account_id__decline_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: AccountApprovalRequest,
      },
      {
        name: "account_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: AccountUpdateResponse,
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
    path: "/api/accounts/:account_id/contacts",
    alias: "get_account_contacts_api_accounts__account_id__contacts_get",
    requestFormat: "json",
    parameters: [
      {
        name: "account_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.array(ContactResponse),
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
    path: "/api/accounts/:account_id/contacts",
    alias: "add_account_contact_api_accounts__account_id__contacts_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ContactCreate,
      },
      {
        name: "account_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: ContactResponse,
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
    path: "/api/accounts/health",
    alias: "health_check_api_accounts_health_get",
    requestFormat: "json",
    response: z.unknown(),
  },
]);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
