import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

import { HTTPValidationError } from "./common";
import { ValidationError } from "./common";
import { stage } from "./common";

const SkillMatrixItem = z
  .object({
    skill: z.string(),
    proficiency: z.number().int().gte(0).lte(10),
    experience_years: z.union([z.number(), z.null()]).optional(),
    confidence: z.union([z.number(), z.null()]).optional(),
  })
  .passthrough();
const ProjectExperienceItem = z
  .object({
    name: z.string(),
    duration: z.string(),
    value: z.union([z.number(), z.null()]).optional(),
    role: z.union([z.string(), z.null()]).optional(),
    technologies: z
      .union([z.array(z.string()), z.null()])
      .optional()
      .default([]),
    description: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const EducationItem = z
  .object({
    degree: z.string(),
    university: z.string(),
    graduation_year: z.union([z.string(), z.null()]).optional(),
    honors: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const DocumentChecklistItem = z
  .object({
    doc_type: z.string(),
    required: z.boolean().optional().default(true),
    uploaded: z.boolean().optional().default(false),
    url: z.union([z.string(), z.null()]).optional(),
    description: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const AIEnrichmentResponse = z
  .object({
    name: z.union([z.string(), z.null()]).optional(),
    title: z.union([z.string(), z.null()]).optional(),
    experience_summary: z.string(),
    total_experience_years: z.union([z.number(), z.null()]).optional(),
    top_skills: z.array(z.string()).optional().default([]),
    technical_skills: z.array(z.string()).optional().default([]),
    soft_skills: z.array(z.string()).optional().default([]),
    skills_matrix: z.array(SkillMatrixItem).optional().default([]),
    sectors: z.array(z.string()).optional().default([]),
    services: z.array(z.string()).optional().default([]),
    project_types: z.array(z.string()).optional().default([]),
    project_experience: z.array(ProjectExperienceItem).optional().default([]),
    education: z.array(EducationItem).optional().default([]),
    certifications: z.array(z.string()).optional().default([]),
    document_checklist: z.array(DocumentChecklistItem).optional().default([]),
    match_percentage: z.union([z.number(), z.null()]).optional(),
    match_reasons: z.array(z.string()).optional().default([]),
    confidence_score: z.union([z.number(), z.null()]).optional(),
    raw_json: z
      .union([z.object({}).partial().passthrough(), z.null()])
      .optional(),
  })
  .passthrough();
const ProfileExtractRequest = z
  .object({
    linkedin_url: z.union([z.string(), z.null()]),
    portfolio_url: z.union([z.string(), z.null()]),
    other_profile_url: z.union([z.string(), z.null()]),
    name: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const Body_upload_cv_api_onboarding_upload_cv_post = z
  .object({
    file: z.instanceof(File),
    name: z.union([z.string(), z.null()]).optional(),
    email: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const CandidateResponse = z
  .object({
    name: z.string().min(1).max(255),
    email: z.union([z.string(), z.null()]).optional(),
    phone: z.union([z.string(), z.null()]).optional(),
    linkedin_url: z.union([z.string(), z.null()]).optional(),
    portfolio_url: z.union([z.string(), z.null()]).optional(),
    other_profile_url: z.union([z.string(), z.null()]).optional(),
    id: z.string().uuid(),
    company_id: z.union([z.string(), z.null()]).optional(),
    candidate_number: z.string(),
    resume_url: z.union([z.string(), z.null()]).optional(),
    resume_filename: z.union([z.string(), z.null()]).optional(),
    ai_experience: z.union([z.string(), z.null()]).optional(),
    ai_skills: z.array(z.string()).optional().default([]),
    ai_sectors: z.array(z.string()).optional().default([]),
    ai_services: z.array(z.string()).optional().default([]),
    ai_project_types: z.array(z.string()).optional().default([]),
    ai_doc_checklist: z
      .union([z.object({}).partial().passthrough(), z.null()])
      .optional(),
    skills_matrix: z
      .union([z.object({}).partial().passthrough(), z.null()])
      .optional(),
    project_experience: z
      .union([z.object({}).partial().passthrough(), z.null()])
      .optional(),
    education: z
      .union([z.object({}).partial().passthrough(), z.null()])
      .optional(),
    certifications: z.array(z.string()).optional().default([]),
    ai_match_percentage: z.union([z.number(), z.null()]).optional(),
    ai_match_reasons: z.array(z.string()).optional().default([]),
    ai_confidence_score: z.union([z.number(), z.null()]).optional(),
    status: z.string(),
    enrichment_started_at: z.union([z.string(), z.null()]).optional(),
    enrichment_completed_at: z.union([z.string(), z.null()]).optional(),
    job_title: z.union([z.string(), z.null()]).optional(),
    department: z.union([z.string(), z.null()]).optional(),
    location: z.union([z.string(), z.null()]).optional(),
    compensation_type: z.union([z.string(), z.null()]).optional(),
    hourly_rate: z.union([z.number(), z.null()]).optional(),
    salary_min: z.union([z.number(), z.null()]).optional(),
    salary_max: z.union([z.number(), z.null()]).optional(),
    converted_to_employee_id: z.union([z.string(), z.null()]).optional(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
  })
  .passthrough();

export const schemas = {
  SkillMatrixItem,
  ProjectExperienceItem,
  EducationItem,
  DocumentChecklistItem,
  AIEnrichmentResponse,
  ProfileExtractRequest,
  Body_upload_cv_api_onboarding_upload_cv_post,
  CandidateResponse,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/api/onboarding/profile-extract",
    alias: "extract_profile_api_onboarding_profile_extract_post",
    description: `Extract candidate information from LinkedIn or portfolio URL using Gemini AI`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ProfileExtractRequest,
      },
    ],
    response: AIEnrichmentResponse,
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
    path: "/api/onboarding/upload-cv",
    alias: "upload_cv_api_onboarding_upload_cv_post",
    description: `Upload and parse CV/Resume using Gemini AI
Returns comprehensive extracted data`,
    requestFormat: "form-data",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: Body_upload_cv_api_onboarding_upload_cv_post,
      },
    ],
    response: AIEnrichmentResponse,
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
    path: "/api/onboarding/candidates",
    alias: "get_candidates_api_onboarding_candidates_get",
    description: `Get all candidates for current company`,
    requestFormat: "json",
    parameters: [
      {
        name: "status_filter",
        type: "Query",
        schema: stage,
      },
      {
        name: "skip",
        type: "Query",
        schema: z.number().int().optional().default(0),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().optional().default(100),
      },
    ],
    response: z.array(CandidateResponse),
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
    path: "/api/onboarding/candidates/:candidate_id",
    alias: "get_candidate_api_onboarding_candidates__candidate_id__get",
    description: `Get candidate details`,
    requestFormat: "json",
    parameters: [
      {
        name: "candidate_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: CandidateResponse,
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
