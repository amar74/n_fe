import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

import { HTTPValidationError } from "./common";
import { ValidationError } from "./common";
import { stage } from "./common";

const EmployeeStatus = z.enum([
  "pending",
  "review",
  "accepted",
  "rejected",
  "active",
  "deactivated",
]);
const EmployeeUpdate = z
  .object({
    name: z.union([z.string(), z.null()]),
    email: z.union([z.string(), z.null()]),
    phone: z.union([z.string(), z.null()]),
    job_title: z.union([z.string(), z.null()]),
    role: z.union([z.string(), z.null()]),
    department: z.union([z.string(), z.null()]),
    location: z.union([z.string(), z.null()]),
    bill_rate: z.union([z.number(), z.null()]),
    status: z.union([EmployeeStatus, z.null()]),
    user_id: z.union([z.string(), z.null()]),
    experience: z.union([z.string(), z.null()]),
    skills: z.union([z.array(z.string()), z.null()]),
    review_notes: z.union([z.string(), z.null()]),
    onboarding_complete: z.union([z.boolean(), z.null()]),
  })
  .partial()
  .passthrough();
const EmployeeResponse = z
  .object({
    name: z.string().min(1).max(255),
    email: z.string().email(),
    phone: z.union([z.string(), z.null()]).optional(),
    job_title: z.union([z.string(), z.null()]).optional(),
    role: z.union([z.string(), z.null()]).optional(),
    department: z.union([z.string(), z.null()]).optional(),
    location: z.union([z.string(), z.null()]).optional(),
    bill_rate: z.union([z.number(), z.null()]).optional(),
    experience: z.union([z.string(), z.null()]).optional(),
    skills: z.union([z.array(z.string()), z.null()]).optional(),
    id: z.string().uuid(),
    company_id: z.union([z.string(), z.null()]).optional(),
    user_id: z.union([z.string(), z.null()]).optional(),
    employee_number: z.string(),
    status: z.string(),
    ai_match_percentage: z.union([z.number(), z.null()]).optional(),
    ai_match_reasons: z.union([z.array(z.string()), z.null()]).optional(),
    invite_sent_at: z.union([z.string(), z.null()]).optional(),
    onboarding_complete: z.boolean(),
    ai_suggested_role: z.union([z.string(), z.null()]).optional(),
    ai_suggested_skills: z.union([z.array(z.string()), z.null()]).optional(),
    review_notes: z.union([z.string(), z.null()]).optional(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    projects_count: z.union([z.number(), z.null()]).optional().default(0),
    accounts_count: z.union([z.number(), z.null()]).optional().default(0),
  })
  .passthrough();
const OnboardingDashboard = z
  .object({
    total_employees: z.number().int(),
    pending_count: z.number().int(),
    review_count: z.number().int(),
    accepted_count: z.number().int(),
    rejected_count: z.number().int(),
    active_count: z.number().int(),
    pending_invites: z.number().int(),
    onboarding_complete: z.number().int(),
    recent_hires: z.array(EmployeeResponse),
  })
  .passthrough();
const SkillGapAnalysis = z
  .object({
    skill: z.string(),
    required: z.number().int(),
    available: z.number().int(),
    gap: z.number().int(),
    priority: z.string(),
  })
  .passthrough();
const SkillsGapResponse = z
  .object({
    total_employees: z.number().int(),
    accepted_employees: z.number().int(),
    total_gap: z.number().int(),
    critical_gaps: z.number().int(),
    skill_gaps: z.array(SkillGapAnalysis),
  })
  .passthrough();
const EmployeeCreate = z
  .object({
    name: z.string().min(1).max(255),
    email: z.string().email(),
    phone: z.union([z.string(), z.null()]).optional(),
    job_title: z.union([z.string(), z.null()]).optional(),
    role: z.union([z.string(), z.null()]).optional(),
    department: z.union([z.string(), z.null()]).optional(),
    location: z.union([z.string(), z.null()]).optional(),
    bill_rate: z.union([z.number(), z.null()]).optional(),
    experience: z.union([z.string(), z.null()]).optional(),
    skills: z.union([z.array(z.string()), z.null()]).optional(),
    use_ai_suggestion: z.boolean().optional().default(false),
  })
  .passthrough();
const EmployeeStageUpdate = z
  .object({
    new_stage: z.string(),
    notes: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const Body_bulk_import_employees_api_resources_employees_import_post = z
  .object({
    file: z.instanceof(File),
    ai_enrich: z.boolean().optional().default(false),
  })
  .passthrough();
const EmployeeActivationResponse = z
  .object({
    user_id: z.string().uuid(),
    employee_id: z.string().uuid(),
    username: z.string(),
    email: z.string().email(),
    role: z.string(),
    message: z.string(),
    email_sent: z.boolean(),
  })
  .passthrough();
const EmployeeActivationRequest = z
  .object({
    temporary_password: z.string(),
    user_role: z.string().optional().default("employee"),
    permissions: z.array(z.string()).optional().default([]),
    send_welcome_email: z.boolean().optional().default(true),
  })
  .passthrough();
const AIRoleSuggestionResponse = z
  .object({
    suggested_role: z.string(),
    suggested_department: z.union([z.string(), z.null()]).optional(),
    suggested_skills: z.array(z.string()),
    confidence: z.number().gte(0).lte(1),
    bill_rate_suggestion: z.union([z.number(), z.null()]).optional(),
  })
  .passthrough();
const AIRoleSuggestionRequest = z
  .object({
    name: z.string(),
    job_title: z.union([z.string(), z.null()]).optional(),
    department: z.union([z.string(), z.null()]).optional(),
    company_industry: z
      .union([z.string(), z.null()])
      .optional()
      .default("Technology Consulting"),
  })
  .passthrough();
const ResumeResponse = z
  .object({
    id: z.string().uuid(),
    employee_id: z.string().uuid(),
    file_url: z.string(),
    file_name: z.union([z.string(), z.null()]).optional(),
    file_type: z.union([z.string(), z.null()]).optional(),
    file_size: z.union([z.number(), z.null()]).optional(),
    ai_parsed_json: z
      .union([z.object({}).partial().passthrough(), z.null()])
      .optional(),
    skills: z.array(z.string()).optional(),
    experience_summary: z.union([z.string(), z.null()]).optional(),
    certifications: z.array(z.string()).optional(),
    status: z.string(),
    parse_error: z.union([z.string(), z.null()]).optional(),
    created_at: z.string().datetime({ offset: true }),
    parsed_at: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const Body_upload_resume_api_resources_resumes_import_post = z
  .object({ employee_id: z.string().uuid(), file: z.instanceof(File) })
  .passthrough();
const ResumeAnalysisResponse = z
  .object({
    full_name: z.union([z.string(), z.null()]).optional(),
    email: z.union([z.string(), z.null()]).optional(),
    phone: z.union([z.string(), z.null()]).optional(),
    skills: z.array(z.string()),
    experience_summary: z.string(),
    certifications: z.array(z.string()),
    job_titles: z.array(z.string()),
    education: z.array(z.string()),
    years_of_experience: z.union([z.number(), z.null()]).optional(),
  })
  .passthrough();
const PermissionUpdate = z
  .object({ permissions: z.array(z.string()) })
  .passthrough();
const InterviewSchedule = z
  .object({
    interview_date: z.string(),
    interview_time: z.string(),
    interview_link: z.string(),
    platform: z.string(),
    interviewer_name: z.string(),
    interviewer_email: z.union([z.string(), z.null()]).optional(),
    notes: z.union([z.string(), z.null()]).optional(),
    send_email: z.boolean().optional().default(false),
  })
  .passthrough();
const InterviewFeedback = z
  .object({
    interview_date: z.string(),
    interviewer_name: z.string(),
    technical_skills: z.number().int().gte(1).lte(5),
    communication_skills: z.number().int().gte(1).lte(5),
    cultural_fit: z.number().int().gte(1).lte(5),
    overall_rating: z.number().int().gte(1).lte(5),
    strengths: z.union([z.string(), z.null()]).optional(),
    weaknesses: z.union([z.string(), z.null()]).optional(),
    recommendation: z.string(),
    notes: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();

export const schemas = {
  EmployeeStatus,
  EmployeeUpdate,
  EmployeeResponse,
  OnboardingDashboard,
  SkillGapAnalysis,
  SkillsGapResponse,
  EmployeeCreate,
  EmployeeStageUpdate,
  Body_bulk_import_employees_api_resources_employees_import_post,
  EmployeeActivationResponse,
  EmployeeActivationRequest,
  AIRoleSuggestionResponse,
  AIRoleSuggestionRequest,
  ResumeResponse,
  Body_upload_resume_api_resources_resumes_import_post,
  ResumeAnalysisResponse,
  PermissionUpdate,
  InterviewSchedule,
  InterviewFeedback,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/api/resources/employees",
    alias: "create_employee_api_resources_employees_post",
    description: `Create a new employee with optional AI role suggestion

- **use_ai_suggestion**: If true, AI will suggest role, skills, and bill rate`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: EmployeeCreate,
      },
    ],
    response: EmployeeResponse,
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
    path: "/api/resources/employees",
    alias: "get_employees_api_resources_employees_get",
    description: `Get list of employees with optional status filter

- **status**: Filter by status (pending, review, accepted, rejected, active, deactivated)
- **skip**: Number of records to skip
- **limit**: Maximum number of records to return`,
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
    response: z.array(EmployeeResponse),
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
    path: "/api/resources/employees/:employee_id",
    alias: "get_employee_api_resources_employees__employee_id__get",
    description: `Get employee by ID`,
    requestFormat: "json",
    parameters: [
      {
        name: "employee_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: EmployeeResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "patch",
    path: "/api/resources/employees/:employee_id",
    alias: "update_employee_api_resources_employees__employee_id__patch",
    description: `Update employee information`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: EmployeeUpdate,
      },
      {
        name: "employee_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: EmployeeResponse,
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
    path: "/api/resources/employees/:employee_id",
    alias: "delete_employee_api_resources_employees__employee_id__delete",
    description: `Delete employee`,
    requestFormat: "json",
    parameters: [
      {
        name: "employee_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "patch",
    path: "/api/resources/employees/:employee_id/stage",
    alias:
      "change_employee_stage_api_resources_employees__employee_id__stage_patch",
    description: `Change employee onboarding stage

- **new_stage**: One of: pending, review, accepted, rejected, active, deactivated
- **notes**: Optional notes about the stage change (required for reverse moves)`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: EmployeeStageUpdate,
      },
      {
        name: "employee_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: EmployeeResponse,
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
    path: "/api/resources/employees/import",
    alias: "bulk_import_employees_api_resources_employees_import_post",
    description: `Bulk import employees from CSV file

**CSV Format:**
name, email, phone, job_title, role, department, location, bill_rate

- **ai_enrich**: If true, AI will suggest roles and skills for all employees`,
    requestFormat: "form-data",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: Body_bulk_import_employees_api_resources_employees_import_post,
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
    path: "/api/resources/employees/:employee_id/activate",
    alias:
      "activate_employee_api_resources_employees__employee_id__activate_post",
    description: `Activate an employee by creating a user account with login credentials

This endpoint:
1. Creates a user account linked to the employee
2. Sets temporary password (requires change on first login)
3. Assigns role and permissions
4. Sends welcome email with credentials
5. Updates employee status to &#x27;active&#x27;`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: EmployeeActivationRequest,
      },
      {
        name: "employee_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: EmployeeActivationResponse,
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
    path: "/api/resources/ai/role-suggest",
    alias: "ai_role_suggestion_api_resources_ai_role_suggest_post",
    description: `Get AI-powered role and skills suggestion

Analyzes job title and department to suggest:
- Appropriate role
- Suggested skills
- Bill rate estimate`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: AIRoleSuggestionRequest,
      },
    ],
    response: AIRoleSuggestionResponse,
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
    path: "/api/resources/ai/skills-gap",
    alias: "get_skills_gap_analysis_api_resources_ai_skills_gap_get",
    description: `Analyze skills gap between current team and project demands

Returns detailed breakdown of:
- Skills needed vs available
- Critical gaps
- Priority recommendations`,
    requestFormat: "json",
    response: SkillsGapResponse,
  },
  {
    method: "post",
    path: "/api/resources/resumes-import",
    alias: "upload_resume_api_resources_resumes_import_post",
    description: `Upload and parse employee resume with AI

- Uploads file to S3
- Automatically extracts skills, experience, certifications
- Updates employee profile with parsed data`,
    requestFormat: "form-data",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: Body_upload_resume_api_resources_resumes_import_post,
      },
    ],
    response: ResumeResponse,
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
    path: "/api/resources/employees/:employee_id/resume",
    alias:
      "get_employee_resume_api_resources_employees__employee_id__resume_get",
    description: `Get resume for an employee`,
    requestFormat: "json",
    parameters: [
      {
        name: "employee_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: ResumeResponse,
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
    path: "/api/resources/ai/resume-analysis/:employee_id",
    alias:
      "get_resume_analysis_api_resources_ai_resume_analysis__employee_id__get",
    description: `Get AI-parsed resume analysis`,
    requestFormat: "json",
    parameters: [
      {
        name: "employee_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: ResumeAnalysisResponse,
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
    path: "/api/resources/dashboard/onboarding",
    alias: "get_onboarding_dashboard_api_resources_dashboard_onboarding_get",
    description: `Get onboarding dashboard with statistics

Returns:
- Total employees count
- Counts by status (pending, review, accepted, rejected)
- Pending invites
- Recent hires`,
    requestFormat: "json",
    response: OnboardingDashboard,
  },
  {
    method: "get",
    path: "/api/resources/roles",
    alias: "get_available_roles_api_resources_roles_get",
    description: `Get list of available roles
Returns system roles + any custom roles created by admins`,
    requestFormat: "json",
    response: z.unknown(),
  },
  {
    method: "patch",
    path: "/api/resources/users/:user_id/permissions",
    alias:
      "update_user_permissions_api_resources_users__user_id__permissions_patch",
    description: `Update user permissions (RBAC)

- **permissions**: List of permission IDs to assign`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PermissionUpdate,
      },
      {
        name: "user_id",
        type: "Path",
        schema: z.string().uuid(),
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
    path: "/api/resources/users/:user_id/permissions",
    alias: "get_user_permissions_api_resources_users__user_id__permissions_get",
    description: `Get current user permissions`,
    requestFormat: "json",
    parameters: [
      {
        name: "user_id",
        type: "Path",
        schema: z.string().uuid(),
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
    path: "/api/resources/notifications/welcome/:employee_id",
    alias:
      "send_welcome_email_api_resources_notifications_welcome__employee_id__post",
    description: `Send AI-generated welcome email to employee`,
    requestFormat: "json",
    parameters: [
      {
        name: "employee_id",
        type: "Path",
        schema: z.string().uuid(),
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
    path: "/api/resources/employees/search",
    alias: "search_employees_api_resources_employees_search_post",
    description: `AI-powered employee search with smart matching

Search by: position, skills, sectors, services, project_types
Returns: Candidates with match percentage (sorted)`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({}).partial().passthrough(),
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
    path: "/api/resources/employees/ai-search",
    alias: "ai_semantic_search_api_resources_employees_ai_search_post",
    description: `AI-powered semantic employee search using Gemini

Converts natural language queries into structured search filters
Example: &quot;Find civil engineers with 5+ years experience in high-rise construction&quot;`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({}).partial().passthrough(),
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
    path: "/api/resources/employees/:employee_id/interview/schedule",
    alias:
      "schedule_interview_api_resources_employees__employee_id__interview_schedule_post",
    description: `Schedule interview for employee
Saves interview date, time, link, platform, and interviewer details`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: InterviewSchedule,
      },
      {
        name: "employee_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: EmployeeResponse,
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
    path: "/api/resources/employees/:employee_id/interview/feedback",
    alias:
      "submit_interview_feedback_api_resources_employees__employee_id__interview_feedback_post",
    description: `Submit interview feedback for employee
Saves ratings, strengths, weaknesses, recommendation, and notes
Automatically moves to next stage based on recommendation`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: InterviewFeedback,
      },
      {
        name: "employee_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: EmployeeResponse,
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
