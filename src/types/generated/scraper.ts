import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

import { HTTPValidationError } from "./common";
import { ValidationError } from "./common";

const ScrapedAddress = z
  .object({
    line1: z.union([z.string(), z.null()]),
    line2: z.union([z.string(), z.null()]),
    city: z.union([z.string(), z.null()]),
    state: z.union([z.string(), z.null()]),
    country_code: z.union([z.string(), z.null()]),
    pincode: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const ScrapedInfo = z
  .object({
    name: z.union([z.string(), z.null()]),
    email: z.array(z.string()),
    phone: z.array(z.string()),
    address: z.union([ScrapedAddress, z.null()]),
  })
  .partial()
  .passthrough();
const ScrapedDocument = z
  .object({
    title: z.union([z.string(), z.null()]),
    url: z.union([z.string(), z.null()]),
    type: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const ScrapedContact = z
  .object({
    name: z.union([z.string(), z.null()]),
    role: z.union([z.string(), z.null()]),
    organization: z.union([z.string(), z.null()]),
    email: z.array(z.string()),
    phone: z.array(z.string()),
  })
  .partial()
  .passthrough();
const ScrapedOpportunity = z
  .object({
    title: z.union([z.string(), z.null()]),
    status: z.union([z.string(), z.null()]),
    description: z.union([z.string(), z.null()]),
    client: z.union([z.string(), z.null()]),
    location: z.union([z.string(), z.null()]),
    location_details: z.union([ScrapedAddress, z.null()]),
    budget_text: z.union([z.string(), z.null()]),
    project_value_numeric: z.union([z.number(), z.null()]),
    project_value_text: z.union([z.string(), z.null()]),
    deadline: z.union([z.string(), z.null()]),
    expected_rfp_date: z.union([z.string(), z.null()]),
    start_date: z.union([z.string(), z.null()]),
    completion_date: z.union([z.string(), z.null()]),
    detail_url: z.union([z.string(), z.null()]),
    tags: z.union([z.array(z.string()), z.null()]),
    overview: z.union([z.string(), z.null()]),
    scope_summary: z.union([z.string(), z.null()]),
    scope_items: z.array(z.string()),
    documents: z.array(ScrapedDocument),
    contacts: z.array(ScrapedContact),
    metadata: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const ScrapeResult = z
  .object({
    url: z.string(),
    info: z.union([ScrapedInfo, z.null()]).optional(),
    error: z.union([z.string(), z.null()]).optional(),
    opportunities: z.array(ScrapedOpportunity).optional(),
  })
  .passthrough();
const ScrapeResponse = z
  .object({
    results: z.array(ScrapeResult),
    total_urls: z.number().int(),
    successful_scrapes: z.number().int(),
    failed_scrapes: z.number().int(),
  })
  .passthrough();
const ScrapeRequest = z
  .object({ urls: z.array(z.string().min(1).max(2083).url()) })
  .passthrough();

export const schemas = {
  ScrapedAddress,
  ScrapedInfo,
  ScrapedDocument,
  ScrapedContact,
  ScrapedOpportunity,
  ScrapeResult,
  ScrapeResponse,
  ScrapeRequest,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/api/scraper/scrape",
    alias: "scrapeUrls",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ScrapeRequest,
      },
    ],
    response: ScrapeResponse,
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
