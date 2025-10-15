import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

import { HTTPValidationError } from "./common";
import { ValidationError } from "./common";

const SuggestionValue = z
  .object({
    value: z.unknown(),
    confidence: z.number().gte(0).lte(1),
    source: z.string(),
    reasoning: z.union([z.string(), z.null()]).optional(),
    should_auto_apply: z.boolean().optional().default(false),
  })
  .passthrough();
const AccountEnhancementResponse = z
  .object({
    enhanced_data: z.record(SuggestionValue),
    processing_time_ms: z.number().int(),
    warnings: z.array(z.string()).optional(),
    suggestions_applied: z.number().int().optional().default(0),
  })
  .passthrough();
const AddressIssue = z
  .object({
    field: z.string(),
    current_value: z.union([z.string(), z.null()]),
    suggested_value: z.union([z.string(), z.null()]),
    issue_type: z.string(),
    confidence: z.number().gte(0).lte(1),
  })
  .passthrough();
const AddressValidationResponse = z
  .object({
    is_valid: z.boolean(),
    issues: z.array(AddressIssue).optional(),
    corrected_address: z.record(z.union([z.string(), z.null()])),
    confidence: z.number().gte(0).lte(1),
  })
  .passthrough();
const ContactValidationResponse = z
  .object({
    email_valid: z.boolean().default(true),
    phone_valid: z.boolean().default(true),
    name_valid: z.boolean().default(true),
    suggestions: z.record(SuggestionValue),
    warnings: z.array(z.string()),
  })
  .partial()
  .passthrough();
const OrganizationNameResponse = z
  .object({
    suggested_name: z.string(),
    confidence: z.number().gte(0).lte(1),
    alternatives: z.array(z.string()).optional(),
    source: z.string(),
    reasoning: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const OrganizationNameRequest = z
  .object({
    website_url: z.string().min(1).max(2083).url(),
    context: z.union([z.record(z.string()), z.null()]).optional(),
  })
  .passthrough();
const AccountEnhancementRequest = z
  .object({
    company_website: z.string().min(1).max(2083).url(),
    partial_data: z.object({}).partial().passthrough().optional(),
    enhancement_options: z.record(z.boolean()).optional(),
  })
  .passthrough();
const AddressValidationRequest = z
  .object({
    address: z.record(z.union([z.string(), z.null()])),
    country_code: z.string().optional().default("US"),
  })
  .passthrough();
const IndustrySuggestionResponse = z
  .object({
    suggested_industry: z.string(),
    confidence: z.number().gte(0).lte(1),
    alternatives: z.array(z.string()).optional(),
    reasoning: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const IndustrySuggestionRequest = z
  .object({
    website_url: z.union([z.string(), z.null()]),
    company_name: z.union([z.string(), z.null()]),
    description: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const ContactValidationRequest = z
  .object({
    email: z.union([z.string(), z.null()]),
    phone: z.union([z.string(), z.null()]),
    name: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();

export const schemas = {
  SuggestionValue,
  AccountEnhancementResponse,
  AddressIssue,
  AddressValidationResponse,
  ContactValidationResponse,
  OrganizationNameResponse,
  OrganizationNameRequest,
  AccountEnhancementRequest,
  AddressValidationRequest,
  IndustrySuggestionResponse,
  IndustrySuggestionRequest,
  ContactValidationRequest,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/ai/suggest-organization-name",
    alias: "suggestOrganizationName",
    description: `Suggest organization name from website URL using AI.

This endpoint:
1. Scrapes the provided website
2. Uses AI to extract the official organization name
3. Returns structured suggestion with confidence score

Args:
    request: Contains website URL and optional context
    current_user: Authenticated user
    
Returns:
    OrganizationNameResponse: Suggested name with confidence and alternatives
    
Raises:
    MegapolisHTTPException: If website scraping or AI processing fails`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: OrganizationNameRequest,
      },
    ],
    response: OrganizationNameResponse,
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
    path: "/ai/enhance-account-data",
    alias: "enhanceAccountData",
    description: `Enhance account data using AI based on company website.

This is the main enhancement endpoint that can fill multiple fields
based on website content and any data the user has already entered.

Args:
    request: Contains website URL, partial data, and enhancement options
    current_user: Authenticated user
    
Returns:
    AccountEnhancementResponse: Enhanced data with confidence scores
    
Raises:
    MegapolisHTTPException: If website scraping or AI processing fails`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: AccountEnhancementRequest,
      },
    ],
    response: AccountEnhancementResponse,
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
    path: "/ai/validate-address",
    alias: "validateAddress",
    description: `Validate address and suggest corrections using AI.

This endpoint:
1. Analyzes the provided address for errors
2. Suggests corrections for spelling, format, or missing fields
3. Returns validation results with confidence scores

Args:
    request: Contains address to validate and country code
    current_user: Authenticated user
    
Returns:
    AddressValidationResponse: Validation results with corrections
    
Raises:
    MegapolisHTTPException: If AI processing fails`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: AddressValidationRequest,
      },
    ],
    response: AddressValidationResponse,
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
    path: "/ai/suggest-industry",
    alias: "suggestIndustry",
    description: `Suggest industry/sector based on website, company name, or description.

This endpoint:
1. Analyzes available information (website, name, description)
2. Determines the primary industry sector
3. Returns suggestion with confidence and alternatives

Args:
    request: Contains website URL, company name, or description
    current_user: Authenticated user
    
Returns:
    IndustrySuggestionResponse: Industry suggestion with confidence
    
Raises:
    MegapolisHTTPException: If AI processing fails`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: IndustrySuggestionRequest,
      },
    ],
    response: IndustrySuggestionResponse,
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
    path: "/ai/validate-contact",
    alias: "validateContact",
    description: `Validate contact information (email, phone, name) using AI.

This endpoint:
1. Validates email format and domain
2. Validates phone number format
3. Suggests corrections for common issues

Args:
    request: Contains email, phone, and/or name to validate
    current_user: Authenticated user
    
Returns:
    ContactValidationResponse: Validation results with suggestions
    
Raises:
    MegapolisHTTPException: If AI processing fails`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ContactValidationRequest,
      },
    ],
    response: ContactValidationResponse,
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
    path: "/ai/enhance-opportunity-data",
    alias: "enhanceOpportunityData",
    description: `Enhance opportunity data using AI based on company website.

This endpoint focuses on opportunity-specific fields like:
- Project values and budgets
- Project descriptions
- Sales stages
- Market sectors
- Locations

Args:
    request: Contains website URL and partial opportunity data
    current_user: Authenticated user
    
Returns:
    dict: Enhanced opportunity data with confidence scores
    
Raises:
    MegapolisHTTPException: If AI processing fails`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: AccountEnhancementRequest,
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
    path: "/ai/health",
    alias: "aiHealthCheck",
    description: `Health check endpoint for AI services.

Returns:
    dict: Status of AI services and dependencies`,
    requestFormat: "json",
    response: z.unknown(),
  },
  {
    method: "get",
    path: "/ai/examples/organization-name",
    alias: "getOrganizationNameExamples",
    description: `Get example requests for organization name suggestion.

Returns:
    dict: Example requests and responses`,
    requestFormat: "json",
    response: z.unknown(),
  },
  {
    method: "get",
    path: "/ai/examples/account-enhancement",
    alias: "getAccountEnhancementExamples",
    description: `Get example requests for account enhancement.

Returns:
    dict: Example requests and responses`,
    requestFormat: "json",
    response: z.unknown(),
  },
]);

export const Ai_suggestionsApi = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
