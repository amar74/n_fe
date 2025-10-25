import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

import { HTTPValidationError } from "./common";
import { ValidationError } from "./common";
import { AuthUserResponse } from "./common";

const AdminCreateUserResponse = z
  .object({ message: z.string(), user: AuthUserResponse })
  .passthrough();
const AdminUser = z
  .object({
    id: z.string().uuid(),
    email: z.string(),
    org_id: z.union([z.string(), z.null()]),
    role: z.string(),
    formbricks_user_id: z.union([z.string(), z.null()]),
  })
  .passthrough();
const AdminUserListResponse = z
  .object({ total_users: z.number().int(), users: z.array(AdminUser) })
  .passthrough();
// temp solution by jhalak32
const AdminCreateUserRequest = z
  .object({
    email: z.string(),
    password: z.string(),
    role: z.union([z.string(), z.null()]).optional().default("vendor"),
  })
  .passthrough();

export const schemas = {
  AdminCreateUserResponse,
  AdminUser,
  AdminUserListResponse,
  AdminCreateUserRequest,
};

const endpoints = makeApi([
  {
    method: "get",
    path: "/admin/user_list",
    alias: "userList",
    description: `Return total number of users and a paginated list of users.`,
    requestFormat: "json",
    parameters: [
      {
        name: "skip",
        type: "Query",
        schema: z.number().int().gte(0).optional().default(0),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(500).optional().default(100),
      },
    ],
    response: AdminUserListResponse,
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
    path: "/admin/create_new_user",
    alias: "createNewUser",
    description: `Create a new user (vendor) using Supabase SDK and mirror in local DB.

- Creates user in Supabase Auth
- Creates user in local database with specified role
- Vendor will create organization themselves on first login`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: AdminCreateUserRequest,
      },
    ],
    response: AdminCreateUserResponse,
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
