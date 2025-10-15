import { z } from "zod";

export const AuthUserResponse = z
  .object({
    id: z.string().uuid(),
    org_id: z.union([z.string(), z.null()]).optional(),
    role: z.union([z.string(), z.null()]),
    email: z.string(),
  })
  .passthrough();
export const ValidationError = z
  .object({
    loc: z.array(z.union([z.string(), z.number()])),
    msg: z.string(),
    type: z.string(),
  })
  .passthrough();
export const HTTPValidationError = z
  .object({ detail: z.array(ValidationError) })
  .partial()
  .passthrough();
export const search = z.union([z.string(), z.null()]).optional();
export const VendorStatsResponse = z
  .object({
    total_vendors: z.number().int(),
    total_approved: z.number().int(),
    total_pending: z.number().int(),
    total_rejected: z.number().int(),
  })
  .passthrough();
