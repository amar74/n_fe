import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

import { HTTPValidationError } from "./common";
import { ValidationError } from "./common";

const AddressCreateResquest = z
  .object({
    line1: z.string(),
    line2: z.union([z.string(), z.null()]).optional(),
    city: z.union([z.string(), z.null()]).optional(),
    state: z.union([z.string(), z.null()]).optional(),
    pincode: z.union([z.number(), z.null()]).optional(),
  })
  .passthrough();
const ContactCreateRequest = z
  .object({
    name: z.union([z.string(), z.null()]),
    title: z.union([z.string(), z.null()]),
    email: z.union([z.string(), z.null()]),
    phone: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const OrgCreateRequest = z
  .object({
    name: z.string(),
    address: z.union([AddressCreateResquest, z.null()]).optional(),
    website: z.union([z.string(), z.null()]).optional(),
    contact: z.union([ContactCreateRequest, z.null()]).optional(),
  })
  .passthrough();
const OrgCreateResponse = z
  .object({ name: z.string(), id: z.string().uuid() })
  .passthrough();
const OrgCreatedResponse = z
  .object({ message: z.string(), org: OrgCreateResponse })
  .passthrough();
const OrgMemberResponse = z
  .object({ email: z.string(), role: z.string(), status: z.string() })
  .passthrough();
const OrgMembersListResponse = z
  .object({
    members: z.array(OrgMemberResponse),
    total_count: z.number().int(),
  })
  .passthrough();
const AddressCreateResponse = z
  .object({
    id: z.string().uuid(),
    line1: z.string(),
    line2: z.union([z.string(), z.null()]).optional(),
    city: z.union([z.string(), z.null()]).optional(),
    state: z.union([z.string(), z.null()]).optional(),
    pincode: z.union([z.number(), z.null()]).optional(),
  })
  .passthrough();
const CreateContactResponse = z
  .object({
    id: z.string().uuid(),
    name: z.union([z.string(), z.null()]).optional(),
    title: z.union([z.string(), z.null()]).optional(),
    email: z.union([z.string(), z.null()]).optional(),
    phone: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const OrgResponse = z
  .object({
    id: z.string().uuid(),
    owner_id: z.string().uuid(),
    name: z.string(),
    address: z.union([AddressCreateResponse, z.null()]).optional(),
    website: z.union([z.string(), z.null()]).optional(),
    contact: z.union([CreateContactResponse, z.null()]).optional(),
    created_at: z.string().datetime({ offset: true }),
    profile_completion: z.number().int().optional().default(0),
  })
  .passthrough();
const InviteResponse = z
  .object({
    id: z.string().uuid(),
    email: z.string(),
    role: z.string(),
    org_id: z.string().uuid(),
    invited_by: z.string().uuid(),
    token: z.union([z.string(), z.null()]).optional(),
    status: z.union([z.string(), z.null()]).optional(),
    expires_at: z.string().datetime({ offset: true }),
    created_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const InviteCreateRequest = z
  .object({ email: z.string(), role: z.string() })
  .passthrough();
const AcceptInviteResponse = z
  .object({
    message: z.string(),
    email: z.string(),
    role: z.string(),
    org_id: z.string().uuid(),
  })
  .passthrough();

export const schemas = {
  AddressCreateResquest,
  ContactCreateRequest,
  OrgCreateRequest,
  OrgCreateResponse,
  OrgCreatedResponse,
  OrgMemberResponse,
  OrgMembersListResponse,
  AddressCreateResponse,
  CreateContactResponse,
  OrgResponse,
  InviteResponse,
  InviteCreateRequest,
  AcceptInviteResponse,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/api/orgs/create",
    alias: "createOrg",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: OrgCreateRequest,
      },
    ],
    response: OrgCreatedResponse,
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
    path: "/api/orgs/me",
    alias: "me",
    requestFormat: "json",
    response: OrgResponse,
  },
  {
    method: "get",
    path: "/api/orgs/:org_id",
    alias: "getOrgById",
    requestFormat: "json",
    parameters: [
      {
        name: "org_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: OrgResponse,
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
    path: "/api/orgs/:org_id",
    alias: "patchOrganization",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({}).partial().passthrough(),
      },
      {
        name: "org_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.object({}).partial().passthrough(),
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
    path: "/api/orgs/members",
    alias: "getOrgMembers",
    requestFormat: "json",
    response: OrgMembersListResponse,
  },
  {
    method: "post",
    path: "/api/orgs/invite",
    alias: "createInvite",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: InviteCreateRequest,
      },
    ],
    response: InviteResponse,
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
    path: "/api/orgs/invite/accept",
    alias: "acceptInvite",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ token: z.string() }).passthrough(),
      },
    ],
    response: AcceptInviteResponse,
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
