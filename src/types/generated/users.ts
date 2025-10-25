import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

import { UserResponse } from "./common";
import { HTTPValidationError } from "./common";
import { ValidationError } from "./common";

const UserCreateRequest = z
  .object({ email: z.string(), role: z.string().optional().default("admin") })
  .passthrough();
const UserUpdateRequest = z
  .object({
    email: z.union([z.string(), z.null()]),
    role: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();

export const schemas = {
  UserCreateRequest,
  UserUpdateRequest,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/api/users/",
    alias: "createUser",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UserCreateRequest,
      },
    ],
    response: UserResponse,
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
    path: "/api/users/",
    alias: "getUsers",
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
        schema: z.number().int().gte(1).lte(1000).optional().default(100),
      },
    ],
    response: z.array(UserResponse),
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
    path: "/api/users/:user_id",
    alias: "getUserById",
    requestFormat: "json",
    parameters: [
      {
        name: "user_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: UserResponse,
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
    path: "/api/users/:user_id",
    alias: "updateUser",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UserUpdateRequest,
      },
      {
        name: "user_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: UserResponse,
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
    path: "/api/users/:user_id",
    alias: "deleteUser",
    requestFormat: "json",
    parameters: [
      {
        name: "user_id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.record(z.string()),
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
    path: "/api/users/opportunities",
    alias: "getOpportunities",
    requestFormat: "json",
    response: z.object({}).partial().passthrough(),
  },
  {
    method: "post",
    path: "/api/users/opportunities",
    alias: "createOpportunity",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({}).partial().passthrough(),
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
]);


export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
