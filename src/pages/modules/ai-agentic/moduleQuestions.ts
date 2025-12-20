/**
 * Pre-defined questions and answers organized by module
 * These can be used as quick actions or reference in the AI Agentic system
 */

export interface ModuleQuestion {
  question: string;
  answer: string;
  category?: string;
  tags?: string[];
}

export interface ModuleQuestions {
  [module: string]: ModuleQuestion[];
}

export const MODULE_QUESTIONS: ModuleQuestions = {
  opportunities: [
    {
      question: "How do I create a new opportunity?",
      answer: "To create a new opportunity, navigate to the Opportunities module and click the 'Create Opportunity' button. Fill in the required fields including opportunity name, account, project value, stage, and expected close date. You can also add additional details like description, source, and assign team members.",
      category: "Getting Started",
      tags: ["create", "new", "opportunity"]
    },
    {
      question: "What are the different opportunity stages?",
      answer: "Opportunities progress through several stages: Lead, Qualification, Proposal, Negotiation, Won, and Lost. Each stage represents a different phase in the sales process. You can move opportunities between stages as they progress through your sales pipeline.",
      category: "Pipeline Management",
      tags: ["stages", "pipeline", "sales"]
    },
    {
      question: "How do I track opportunity value?",
      answer: "Opportunity value is tracked through the project value field. You can view total pipeline value in the opportunities dashboard, filter by stage, and see value trends over time. The system also calculates weighted pipeline value based on probability of closing.",
      category: "Analytics",
      tags: ["value", "tracking", "analytics"]
    },
    {
      question: "How do I assign an opportunity to a team member?",
      answer: "When creating or editing an opportunity, you can assign it to team members using the 'Assigned To' field. You can assign multiple team members to collaborate on an opportunity. Assigned members will receive notifications about updates.",
      category: "Team Management",
      tags: ["assignment", "team", "collaboration"]
    },
    {
      question: "What is opportunity scoring?",
      answer: "Opportunity scoring helps prioritize opportunities based on factors like deal size, probability of closing, and strategic importance. The system automatically calculates scores to help you focus on the most promising opportunities first.",
      category: "Analytics",
      tags: ["scoring", "prioritization", "analytics"]
    }
  ],

  accounts: [
    {
      question: "How do I create a new account?",
      answer: "To create a new account, go to the Accounts module and click 'Create Account'. Fill in the account details including company name, industry, address, and contact information. You can also add account notes, documents, and link related opportunities.",
      category: "Getting Started",
      tags: ["create", "account", "new"]
    },
    {
      question: "What is account health score?",
      answer: "Account health score is an AI-powered metric that evaluates the overall health of your customer relationships. It considers factors like engagement level, contract status, payment history, and support interactions. Scores range from 0-100, with higher scores indicating healthier relationships.",
      category: "Analytics",
      tags: ["health", "score", "analytics", "ai"]
    },
    {
      question: "How do I add contacts to an account?",
      answer: "Navigate to the account details page and click on the 'Contacts' tab. Click 'Add Contact' and fill in the contact information including name, email, phone, and role. You can set a primary contact for each account.",
      category: "Contact Management",
      tags: ["contacts", "add", "management"]
    },
    {
      question: "How do I track account activities?",
      answer: "Account activities are automatically tracked when you create opportunities, proposals, or contracts linked to the account. You can also manually add notes, meetings, and other activities in the account timeline. View all activities in the 'Activity' tab on the account details page.",
      category: "Activity Tracking",
      tags: ["activities", "timeline", "tracking"]
    },
    {
      question: "What is account tiering?",
      answer: "Account tiering categorizes accounts based on their strategic value and revenue potential. Common tiers include Strategic, Enterprise, Mid-Market, and SMB. Tiering helps prioritize account management efforts and allocate resources effectively.",
      category: "Account Strategy",
      tags: ["tiering", "strategy", "categorization"]
    }
  ],

  proposals: [
    {
      question: "How do I create a new proposal?",
      answer: "Navigate to the Proposals module and click 'Create Proposal'. Link it to an opportunity or account, add proposal details, pricing, and terms. You can attach documents, set expiration dates, and track proposal status through the approval process.",
      category: "Getting Started",
      tags: ["create", "proposal", "new"]
    },
    {
      question: "What are the proposal statuses?",
      answer: "Proposals can have different statuses: Draft, Sent, Under Review, Approved, Rejected, or Expired. You can update the status as the proposal progresses through the approval process.",
      category: "Status Management",
      tags: ["status", "approval", "workflow"]
    },
    {
      question: "How do I attach documents to a proposal?",
      answer: "In the proposal details page, go to the 'Documents' section and click 'Upload Document'. You can attach PDFs, Word documents, spreadsheets, and other file types. Documents are stored securely and can be shared with stakeholders.",
      category: "Document Management",
      tags: ["documents", "attach", "files"]
    },
    {
      question: "How do I track proposal approval?",
      answer: "The proposal approval workflow tracks each step of the approval process. You can see who approved or rejected the proposal, when, and any comments. Set up approval chains based on proposal value or type.",
      category: "Approval Workflow",
      tags: ["approval", "workflow", "tracking"]
    },
    {
      question: "Can I use templates for proposals?",
      answer: "Yes, you can create proposal templates with standard sections, pricing tables, and terms. When creating a new proposal, select a template to quickly populate common fields. Customize the template content for each specific proposal.",
      category: "Templates",
      tags: ["templates", "standardize", "efficiency"]
    }
  ],

  resources: [
    {
      question: "How do I add a new employee?",
      answer: "Go to the Resources module, select 'Employees', and click 'Add Employee'. Fill in personal information, role, department, skills, certifications, and availability. You can also upload resumes and set up employee profiles.",
      category: "Employee Management",
      tags: ["add", "employee", "onboarding"]
    },
    {
      question: "How do I search for employees by skills?",
      answer: "Use the employee search feature and filter by skills, certifications, experience level, or availability. You can also use AI-powered semantic search to find employees using natural language queries like 'Find civil engineers with 5+ years experience'.",
      category: "Search & Discovery",
      tags: ["search", "skills", "ai", "filter"]
    },
    {
      question: "What is employee utilization?",
      answer: "Employee utilization tracks how much time employees spend on billable projects versus non-billable activities. It helps optimize resource allocation and identify capacity for new projects. View utilization reports in the Analytics section.",
      category: "Analytics",
      tags: ["utilization", "analytics", "capacity"]
    },
    {
      question: "How do I manage employee roles and permissions?",
      answer: "Navigate to 'Roles Management' in the Resources module. Create custom roles with specific permissions, assign roles to employees, and manage access levels. Roles control what features and data employees can access.",
      category: "Access Control",
      tags: ["roles", "permissions", "access"]
    },
    {
      question: "How do I track employee performance?",
      answer: "Employee performance is tracked through project assignments, task completion, client feedback, and utilization metrics. View performance analytics in the Resources Analytics section to see individual and team performance trends.",
      category: "Performance Management",
      tags: ["performance", "analytics", "tracking"]
    }
  ],

  contracts: [
    {
      question: "How do I create a new contract?",
      answer: "Navigate to the Contracts module and click 'Create Contract'. Link it to an account and opportunity, add contract details including start date, end date, value, terms, and conditions. Upload contract documents and set up renewal reminders.",
      category: "Getting Started",
      tags: ["create", "contract", "new"]
    },
    {
      question: "How do I track contract renewals?",
      answer: "The system automatically tracks contract end dates and sends renewal reminders. View upcoming renewals in the Contracts dashboard. Set up automated renewal workflows to streamline the renewal process.",
      category: "Renewal Management",
      tags: ["renewal", "tracking", "reminders"]
    },
    {
      question: "What contract statuses are available?",
      answer: "Contracts can have statuses like Draft, Active, Pending Renewal, Expired, or Terminated. Update statuses as contracts progress through their lifecycle. Active contracts are automatically tracked for renewals.",
      category: "Status Management",
      tags: ["status", "lifecycle", "tracking"]
    },
    {
      question: "How do I manage contract terms and conditions?",
      answer: "In the contract details page, you can add and edit terms and conditions. Use templates for standard terms, customize for specific contracts, and track changes through version history.",
      category: "Terms Management",
      tags: ["terms", "conditions", "templates"]
    },
    {
      question: "How do I track contract value and revenue?",
      answer: "Contract value is automatically calculated and tracked. View total contract value, recurring revenue, and contract value trends in the Contracts dashboard. Link contracts to finance planning for revenue forecasting.",
      category: "Financial Tracking",
      tags: ["value", "revenue", "tracking"]
    }
  ],

  projects: [
    {
      question: "How do I create a new project?",
      answer: "Go to the Projects module and click 'Create Project'. Link it to an account and opportunity, set project name, start date, end date, budget, and assign team members. Define project phases, milestones, and deliverables.",
      category: "Getting Started",
      tags: ["create", "project", "new"]
    },
    {
      question: "How do I track project progress?",
      answer: "Project progress is tracked through phases, milestones, and task completion. View progress in the project dashboard with visual indicators, Gantt charts, and status updates. Set up automated status reports.",
      category: "Progress Tracking",
      tags: ["progress", "tracking", "milestones"]
    },
    {
      question: "How do I assign resources to a project?",
      answer: "In the project details page, go to the 'Resources' tab and click 'Assign Resources'. Select employees, set their roles, allocation percentage, and dates. The system tracks resource availability and conflicts.",
      category: "Resource Allocation",
      tags: ["resources", "allocation", "assignment"]
    },
    {
      question: "How do I manage project budgets?",
      answer: "Set project budgets in the project creation or edit form. Track actual costs against budget, view budget variance reports, and set up alerts for budget overruns. Link to finance module for detailed cost tracking.",
      category: "Budget Management",
      tags: ["budget", "costs", "tracking"]
    },
    {
      question: "What project statuses are available?",
      answer: "Projects can have statuses like Planning, Active, On Hold, Completed, or Cancelled. Update statuses as projects progress. Completed projects are archived but remain accessible for reference.",
      category: "Status Management",
      tags: ["status", "lifecycle", "tracking"]
    }
  ],

  finance: [
    {
      question: "How do I create a budget?",
      answer: "Navigate to Finance > Budget Planning and click 'Create Budget'. Select the business unit, set budget period (annual, quarterly, monthly), and enter budget amounts by category. You can import budgets from spreadsheets or create from scratch.",
      category: "Budget Planning",
      tags: ["budget", "create", "planning"]
    },
    {
      question: "What is variance analysis?",
      answer: "Variance analysis compares actual financial performance against budgeted amounts. View variances by category, business unit, or time period. Positive variances indicate over-performance, negative variances indicate under-performance.",
      category: "Analytics",
      tags: ["variance", "analysis", "budget"]
    },
    {
      question: "How do I track expenses?",
      answer: "Expenses can be tracked through the Finance module. Categorize expenses, link to projects or accounts, and track against budgets. Upload receipts, set up approval workflows, and generate expense reports.",
      category: "Expense Management",
      tags: ["expenses", "tracking", "categorization"]
    },
    {
      question: "What financial reports are available?",
      answer: "The Finance module provides various reports including P&L statements, budget vs actual, cash flow, revenue by account, and expense analysis. Customize reports by date range, business unit, or category.",
      category: "Reporting",
      tags: ["reports", "financial", "analysis"]
    },
    {
      question: "How do I create financial forecasts?",
      answer: "Use the Forecasting feature to create financial projections based on historical data, trends, and business assumptions. Create multiple scenarios (optimistic, realistic, pessimistic) and compare outcomes.",
      category: "Forecasting",
      tags: ["forecast", "projection", "scenarios"]
    }
  ],

  procurement: [
    {
      question: "How do I create a purchase requisition?",
      answer: "Navigate to Procurement > Requisitions and click 'Create Requisition'. Add items, quantities, estimated costs, and justification. Submit for approval based on your organization's approval workflow.",
      category: "Getting Started",
      tags: ["requisition", "create", "purchase"]
    },
    {
      question: "How do I manage vendors?",
      answer: "Go to Procurement > Vendors to view and manage vendor information. Add new vendors, track vendor performance, qualifications, and certifications. Link vendors to purchase orders and contracts.",
      category: "Vendor Management",
      tags: ["vendors", "management", "suppliers"]
    },
    {
      question: "How do I create a purchase order?",
      answer: "Navigate to Procurement > Purchase Orders and click 'Create PO'. Link to an approved requisition or create directly. Add line items, set delivery dates, and send to vendors. Track PO status and receipts.",
      category: "Purchase Orders",
      tags: ["purchase order", "create", "po"]
    },
    {
      question: "What is RFQ (Request for Quotation)?",
      answer: "RFQ allows you to request quotes from multiple vendors for comparison. Create an RFQ with specifications, send to selected vendors, collect responses, and compare prices, terms, and vendor qualifications.",
      category: "RFQ Management",
      tags: ["rfq", "quotation", "vendor selection"]
    },
    {
      question: "How do I track procurement budgets?",
      answer: "Set up procurement budgets by category or department. Track spending against budgets, view budget utilization reports, and set up alerts for budget thresholds. Link to finance module for consolidated budget tracking.",
      category: "Budget Tracking",
      tags: ["budget", "tracking", "procurement"]
    }
  ],

  kpis: [
    {
      question: "What KPIs are tracked?",
      answer: "The system tracks various KPIs including revenue, pipeline value, win rate, average deal size, sales cycle length, customer acquisition cost, account health scores, and employee utilization. Customize KPIs based on your business needs.",
      category: "KPI Overview",
      tags: ["kpis", "metrics", "tracking"]
    },
    {
      question: "How do I view KPI dashboards?",
      answer: "Navigate to the KPIs module to view comprehensive KPI dashboards. Dashboards show real-time metrics, trends, and comparisons. Filter by date range, business unit, or team to analyze performance.",
      category: "Dashboard",
      tags: ["dashboard", "metrics", "view"]
    },
    {
      question: "How do I set KPI targets?",
      answer: "In the KPIs module, you can set targets for each KPI. Define target values, time periods, and track actual performance against targets. Set up alerts when KPIs fall below or exceed targets.",
      category: "Target Setting",
      tags: ["targets", "goals", "setting"]
    },
    {
      question: "Can I create custom KPIs?",
      answer: "Yes, you can create custom KPIs based on your specific business metrics. Define calculation formulas, data sources, and display formats. Custom KPIs appear alongside standard KPIs in dashboards.",
      category: "Custom KPIs",
      tags: ["custom", "kpis", "metrics"]
    },
    {
      question: "How do I export KPI reports?",
      answer: "KPI dashboards and reports can be exported to PDF, Excel, or CSV formats. Schedule automated reports to be sent via email. Customize report content and format before exporting.",
      category: "Reporting",
      tags: ["export", "reports", "kpis"]
    }
  ],

  survey: [
    {
      question: "How do I create a survey?",
      answer: "Navigate to Surveys > Create Survey. Add survey name, description, and questions. Choose question types (multiple choice, text, rating, etc.), set up logic and branching, and configure survey settings like anonymous responses and expiration dates.",
      category: "Getting Started",
      tags: ["create", "survey", "new"]
    },
    {
      question: "How do I send surveys to respondents?",
      answer: "After creating a survey, you can send it via email, generate a shareable link, or embed it in your website. Track who has responded and send reminders to non-respondents. Set up automated survey distribution.",
      category: "Distribution",
      tags: ["send", "distribute", "respondents"]
    },
    {
      question: "How do I view survey responses?",
      answer: "Navigate to Surveys > View Responses to see all responses for a survey. View individual responses, aggregate analytics, charts, and trends. Export responses to Excel or CSV for further analysis.",
      category: "Response Analysis",
      tags: ["responses", "view", "analytics"]
    },
    {
      question: "What types of questions can I add?",
      answer: "You can add various question types including multiple choice, single select, text input, rating scales, date pickers, file uploads, and matrix questions. Use conditional logic to show/hide questions based on previous answers.",
      category: "Question Types",
      tags: ["questions", "types", "survey design"]
    },
    {
      question: "Can I create survey templates?",
      answer: "Yes, you can save surveys as templates for reuse. Create templates for common surveys like customer satisfaction, employee feedback, or account surveys. Use templates to quickly create new surveys with pre-configured questions.",
      category: "Templates",
      tags: ["templates", "reuse", "efficiency"]
    }
  ],

  "delivery-models": [
    {
      question: "What are delivery models?",
      answer: "Delivery models define how projects are structured and delivered to clients. They include project phases, milestones, deliverables, timelines, and resource requirements. Use delivery models as templates for consistent project delivery.",
      category: "Overview",
      tags: ["delivery models", "templates", "project structure"]
    },
    {
      question: "How do I create a delivery model?",
      answer: "Navigate to Delivery Models and click 'Create Model'. Define model name, description, phases, milestones, and deliverables. Set timelines, resource requirements, and link to project templates.",
      category: "Getting Started",
      tags: ["create", "delivery model", "new"]
    },
    {
      question: "How do I use delivery models in projects?",
      answer: "When creating a new project, select a delivery model to automatically populate project phases, milestones, and deliverables. Customize the model structure for specific project needs while maintaining consistency.",
      category: "Usage",
      tags: ["projects", "apply", "use"]
    },
    {
      question: "Can I customize delivery models?",
      answer: "Yes, delivery models are customizable. Edit phases, add or remove milestones, modify timelines, and adjust resource requirements. Changes to models don't affect existing projects using that model.",
      category: "Customization",
      tags: ["customize", "edit", "modify"]
    },
    {
      question: "How do I track delivery model performance?",
      answer: "Track how well projects follow delivery models, measure phase completion times, milestone achievement rates, and resource utilization. Use analytics to identify areas for model improvement.",
      category: "Analytics",
      tags: ["performance", "tracking", "analytics"]
    }
  ]
};

/**
 * Get questions for a specific module
 */
export function getModuleQuestions(module: string): ModuleQuestion[] {
  return MODULE_QUESTIONS[module] || [];
}

/**
 * Get all modules with questions
 */
export function getAllModules(): string[] {
  return Object.keys(MODULE_QUESTIONS);
}

/**
 * Search questions across all modules
 */
export function searchQuestions(query: string): Array<{ module: string; question: ModuleQuestion }> {
  const results: Array<{ module: string; question: ModuleQuestion }> = [];
  const lowerQuery = query.toLowerCase();

  Object.entries(MODULE_QUESTIONS).forEach(([module, questions]) => {
    questions.forEach(question => {
      if (
        question.question.toLowerCase().includes(lowerQuery) ||
        question.answer.toLowerCase().includes(lowerQuery) ||
        question.category?.toLowerCase().includes(lowerQuery) ||
        question.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      ) {
        results.push({ module, question });
      }
    });
  });

  return results;
}

