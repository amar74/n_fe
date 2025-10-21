import { HTTPValidationError } from "@/types/validationError";

// @author guddy.tech
type FormErrors = Record<string, string>;

/**
 * Parses backend validation errors for specified fields
 * @param error - Backend error response containing validation details
 * @param fields - Array of field names to extract errors for
 * @returns Object mapping field names to their error messages
 * 
 * @example
 * const error = {
 *   detail: [
 *     {
 *       type: "string_too_short",
 *       loc: ["body", "name"],
 *       msg: "String should have at least 1 character"
 *     },
 *     {
 *       type: "invalid_chars",
 *       loc: ["body", "name"],
 *       msg: "Name contains invalid characters"
 *     }
 *   ]
 * };
 * 
 * parseBackendErrors(error, ["name", "email"]);
 * // Returns: { "name": "String should have at least 1 character, Name contains invalid characters" }
 */
export function parseBackendErrors(error: HTTPValidationError, fields: string[] = []): FormErrors {
  const detail = error?.detail || [];
  
  // Ensure detail is an array
  if (!Array.isArray(detail) || !detail.length || !fields.length) {
    return {};
  }

  const formErrors: FormErrors = {};

  fields.forEach(field => {
    const fieldErrors = detail
      .filter((err) => err.loc && err.loc.includes(field))
      .map((err) => err.msg);

    if (fieldErrors.length > 0) {
      formErrors[field] = fieldErrors.join(', ');
    }
  });

  return formErrors;
}
