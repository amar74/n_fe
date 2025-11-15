import { z } from "zod";

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
export const stage = z.union([z.string(), z.null()]).optional();
export const VendorStatsResponse = z
  .object({
    total_vendors: z.number().int(),
    total_approved: z.number().int(),
    total_pending: z.number().int(),
    total_rejected: z.number().int(),
  })
  .passthrough();
