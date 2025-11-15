import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

import { HTTPValidationError } from "./common";
import { ValidationError } from "./common";

const app__routes__auth__UserResponse = z
  .object({
    id: z.string(),
    email: z.string(),
    name: z.union([z.string(), z.null()]).optional(),
    phone: z.union([z.string(), z.null()]).optional(),
    bio: z.union([z.string(), z.null()]).optional(),
    address: z.union([z.string(), z.null()]).optional(),
    city: z.union([z.string(), z.null()]).optional(),
    state: z.union([z.string(), z.null()]).optional(),
    zip_code: z.union([z.string(), z.null()]).optional(),
    country: z.union([z.string(), z.null()]).optional(),
    timezone: z.union([z.string(), z.null()]).optional(),
    language: z.union([z.string(), z.null()]).optional(),
    role: z.string(),
    org_id: z.union([z.string(), z.null()]).optional(),
    created_at: z.union([z.string(), z.null()]).optional(),
    updated_at: z.union([z.string(), z.null()]).optional(),
    last_login: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const CurrentUserResponse = z
  .object({ user: app__routes__auth__UserResponse })
  .passthrough();
const LoginResponse = z
  .object({
    token: z.string(),
    user: z.object({}).partial().passthrough(),
    expire_at: z.string(),
  })
  .passthrough();
const LoginRequest = z
  .object({ email: z.string().email(), password: z.string() })
  .passthrough();
const SignupResponse = z
  .object({ message: z.string(), user: z.object({}).partial().passthrough() })
  .passthrough();
const SignupRequest = z
  .object({
    email: z.string().email(),
    password: z.string(),
    role: z.string().optional().default("admin"),
  })
  .passthrough();
const ProfileUpdateRequest = z
  .object({
    name: z.union([z.string(), z.null()]),
    phone: z.union([z.string(), z.null()]),
    bio: z.union([z.string(), z.null()]),
    address: z.union([z.string(), z.null()]),
    city: z.union([z.string(), z.null()]),
    state: z.union([z.string(), z.null()]),
    zip_code: z.union([z.string(), z.null()]),
    country: z.union([z.string(), z.null()]),
    timezone: z.union([z.string(), z.null()]),
    language: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const ResetPasswordRequest = z
  .object({
    email: z.string().email(),
    otp: z.string(),
    new_password: z.string(),
  })
  .passthrough();

export const schemas = {
  app__routes__auth__UserResponse,
  CurrentUserResponse,
  LoginResponse,
  LoginRequest,
  SignupResponse,
  SignupRequest,
  ProfileUpdateRequest,
  ResetPasswordRequest,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/api/auth/login",
    alias: "login_api_auth_login_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: LoginRequest,
      },
    ],
    response: LoginResponse,
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
    path: "/api/auth/signup",
    alias: "signup_api_auth_signup_post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SignupRequest,
      },
    ],
    response: SignupResponse,
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
    path: "/api/auth/me",
    alias: "get_current_user_info_api_auth_me_get",
    requestFormat: "json",
    response: CurrentUserResponse,
  },
  {
    method: "put",
    path: "/api/auth/profile",
    alias: "update_profile_api_auth_profile_put",
    description: `Update the current user&#x27;s profile information`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ProfileUpdateRequest,
      },
    ],
    response: app__routes__auth__UserResponse,
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
    path: "/api/auth/change-password",
    alias: "change_password_api_auth_change_password_post",
    requestFormat: "json",
    parameters: [
      {
        name: "current_password",
        type: "Query",
        schema: z.string(),
      },
      {
        name: "new_password",
        type: "Query",
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
    method: "post",
    path: "/api/auth/forgot-password",
    alias: "forgot_password_api_auth_forgot_password_post",
    description: `Request a password reset link
Sends an email with a one-time use token valid for 24 hours`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ email: z.string().email() }).passthrough(),
      },
    ],
    response: z.object({ message: z.string() }).passthrough(),
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
    path: "/api/auth/reset-password",
    alias: "reset_password_api_auth_reset_password_post",
    description: `Reset password using OTP (One-Time Password)
OTP is marked as used immediately when verified, preventing reuse`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ResetPasswordRequest,
      },
    ],
    response: z.object({ message: z.string() }).passthrough(),
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
    path: "/api/auth/verify-reset-otp",
    alias: "verify_reset_otp_api_auth_verify_reset_otp_post",
    requestFormat: "json",
    parameters: [
      {
        name: "email",
        type: "Query",
        schema: z.string().email(),
      },
      {
        name: "otp",
        type: "Query",
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
]);



export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
