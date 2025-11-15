import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

import { HTTPValidationError } from "./common";
import { ValidationError } from "./common";

const EmployeeBasicInfo = z
  .object({
    id: z.string().uuid(),
    employee_number: z.string(),
    name: z.string(),
    email: z.string(),
    phone: z.union([z.string(), z.null()]).optional(),
    job_title: z.union([z.string(), z.null()]).optional(),
    role: z.union([z.string(), z.null()]).optional(),
    department: z.union([z.string(), z.null()]).optional(),
    location: z.union([z.string(), z.null()]).optional(),
    bill_rate: z.union([z.number(), z.null()]).optional(),
    status: z.string(),
    experience: z.union([z.string(), z.null()]).optional(),
    skills: z.union([z.array(z.string()), z.null()]).optional(),
  })
  .passthrough();
const AccountTeamResponse = z
  .object({
    id: z.number().int(),
    account_id: z.string().uuid(),
    employee_id: z.string().uuid(),
    role_in_account: z.union([z.string(), z.null()]).optional(),
    assigned_at: z.string().datetime({ offset: true }),
    assigned_by: z.union([z.string(), z.null()]).optional(),
    employee: z.union([EmployeeBasicInfo, z.null()]).optional(),
  })
  .passthrough();
const AccountTeamListResponse = z
  .object({
    team_members: z.array(AccountTeamResponse),
    total_count: z.number().int(),
    account_id: z.string().uuid(),
  })
  .passthrough();
const AccountTeamCreateRequest = z
  .object({
    employee_id: z.string().uuid(),
    role_in_account: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const AccountTeamUpdateRequest = z
  .object({ role_in_account: z.union([z.string(), z.null()]) })
  .partial()
  .passthrough();
const AccountTeamDeleteResponse = z
  .object({
    id: z.number().int(),
    message: z.string(),
    employee_id: z.string().uuid(),
    account_id: z.string().uuid(),
  })
  .passthrough();

export const schemas = {
  EmployeeBasicInfo,
  AccountTeamResponse,
  AccountTeamListResponse,
  AccountTeamCreateRequest,
  AccountTeamUpdateRequest,
  AccountTeamDeleteResponse,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/api/accounts/:account_id/team/",
    alias: "addAccountTeamMember",
    description: `Add an employee to an account&#x27;s team

- **account_id**: UUID of the account
- **employee_id**: UUID of the employee to add
- **role_in_account**: Optional role/designation for this account`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: AccountTeamCreateRequest,
      },
      {
        name: "account_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: AccountTeamResponse,
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
    path: "/api/accounts/:account_id/team/",
    alias: "listAccountTeamMembers",
    description: `Get all team members assigned to an account

- **account_id**: UUID of the account

Returns list of employees with their details and assignment information`,
    requestFormat: "json",
    parameters: [
      {
        name: "account_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: AccountTeamListResponse,
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
    path: "/api/accounts/:account_id/team/:team_member_id",
    alias: "getAccountTeamMember",
    description: `Get details of a specific team member assignment

- **account_id**: UUID of the account
- **team_member_id**: ID of the team member assignment`,
    requestFormat: "json",
    parameters: [
      {
        name: "account_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "team_member_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: AccountTeamResponse,
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
    path: "/api/accounts/:account_id/team/:team_member_id",
    alias: "updateAccountTeamMember",
    description: `Update a team member&#x27;s role in the account

- **account_id**: UUID of the account
- **team_member_id**: ID of the team member assignment
- **role_in_account**: Updated role/designation`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: AccountTeamUpdateRequest,
      },
      {
        name: "account_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "team_member_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: AccountTeamResponse,
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
    path: "/api/accounts/:account_id/team/:team_member_id",
    alias: "removeAccountTeamMember",
    description: `Remove an employee from an account&#x27;s team

- **account_id**: UUID of the account
- **team_member_id**: ID of the team member assignment to remove`,
    requestFormat: "json",
    parameters: [
      {
        name: "account_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "team_member_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: AccountTeamDeleteResponse,
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
