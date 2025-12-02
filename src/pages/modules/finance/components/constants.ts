import type { AnnualMetric, ScenarioConfig } from './types';

export const ANNUAL_METRICS: AnnualMetric[] = [
  { label: 'Revenue Target', value: 5_000_000, tone: 'default' },
  { label: 'Expense Budget', value: 4_000_000, tone: 'negative' },
  { label: 'Target Profit', value: 1_000_000, tone: 'positive' },
  { label: 'Profit Margin', valueLabel: '20.0%', tone: 'accent' },
];

export const REVENUE_LINES = [
  { label: 'Professional Services', target: 3_100_000, variance: 620_000 },
  { label: 'Consulting Services', target: 2_400_000, variance: 510_000 },
  { label: 'Retainer Agreements', target: 1_700_000, variance: 180_000 },
  { label: 'Managed Services', target: 1_200_000, variance: 160_000 },
  { label: 'Project-Based Revenue', target: 800_000, variance: 120_000 },
  { label: 'Training & Workshops', target: 350_000, variance: 50_000 },
  { label: 'Software Licensing', target: 200_000, variance: 30_000 },
] as const;

export const EXPENSE_LINES = [
  { label: 'Salaries & Wages', target: 2_000_000, variance: -150_000 },
  { label: 'Direct Labor', target: 1_400_000, variance: -120_000 },
  { label: 'Employee Benefits', target: 500_000, variance: -40_000 },
  { label: 'Vehicles & Transportation', target: 180_000, variance: -15_000 },
  { label: 'Office Rent & Facilities', target: 420_000, variance: -30_000 },
  { label: 'Technology & Software', target: 280_000, variance: -40_000 },
  { label: 'Marketing & Advertising', target: 360_000, variance: -25_000 },
  { label: 'Professional Services', target: 220_000, variance: -20_000 },
  { label: 'Utilities & Communications', target: 120_000, variance: -10_000 },
  { label: 'Travel & Entertainment', target: 150_000, variance: -12_000 },
  { label: 'Insurance', target: 80_000, variance: -8_000 },
  { label: 'Office Supplies & Equipment', target: 90_000, variance: -7_000 },
] as const;

export const BUSINESS_UNITS = [
  {
    name: 'Business Unit A',
    revenue: 3_000_000,
    expense: 2_400_000,
    profit: 600_000,
    headcount: 25,
    margin: '20.0%',
  },
  {
    name: 'Business Unit B',
    revenue: 3_000_000,
    expense: 2_400_000,
    profit: 600_000,
    headcount: 25,
    margin: '20.0%',
  },
  {
    name: 'Corporate',
    revenue: 0,
    expense: 0,
    profit: 600_000,
    headcount: 25,
    margin: '20.0%',
  },
] as const;

export const VARIANCE_THRESHOLDS = [
  { label: 'Revenue Variance Alert (%)', value: '5' },
  { label: 'Expense Variance Alert (%)', value: '10' },
  { label: 'Profit Variance Alert (%)', value: '15' },
] as const;

export const REPORTING_SCHEDULE = [
  { label: 'Variance Report Frequency', value: 'Monthly' },
  { label: 'Auto-generated Reports', value: 'Yes' },
] as const;

export const FORECASTING_HISTORY = [
  { period: 'Jan 2025', revenue: 399_364, expenses: 319_669 },
  { period: 'Feb 2025', revenue: 439_056, expenses: 338_110 },
  { period: 'Mar 2025', revenue: 434_473, expenses: 356_910 },
  { period: 'Apr 2025', revenue: 463_042, expenses: 354_759 },
  { period: 'May 2025', revenue: 447_221, expenses: 341_332 },
  { period: 'Jun 2025', revenue: 445_461, expenses: 330_447 },
] as const;

export const SCENARIOS: ScenarioConfig[] = [
  {
    key: 'conservative',
    name: 'Conservative Growth',
    description: 'Low risk, steady growth with minimal investment',
    growthRates: [3, 4, 5],
    investmentLevel: 'Low',
    bonusThreshold: 85,
    riskLevel: 'Low',
  },
  {
    key: 'balanced',
    name: 'Balanced Growth',
    description: 'Moderate growth with balanced risk and investment',
    growthRates: [8, 10, 12],
    investmentLevel: 'Medium',
    bonusThreshold: 90,
    riskLevel: 'Medium',
  },
  {
    key: 'high',
    name: 'High Growth',
    description: 'Aggressive expansion with high risk and reward',
    growthRates: [15, 20, 25],
    investmentLevel: 'High',
    bonusThreshold: 95,
    riskLevel: 'High',
  },
];

export const SCENARIO_PROJECTIONS = [
  { year: 2026, revenue: 5_400_000, expenses: 4_240_000, profit: 1_160_000, margin: 21.5 },
  { year: 2027, revenue: 5_940_000, expenses: 4_579_200, profit: 1_360_800, margin: 22.9 },
  { year: 2028, revenue: 6_534_000, expenses: 4_966_000, profit: 1_568_000, margin: 24.0 },
] as const;

export const SCENARIO_KPIS = [
  {
    year: 2026,
    profitMargin: 18,
    utilization: 85,
    retention: 88,
    newClients: 6,
    cashFlowTarget: 580_000,
    bonusPool: 210_000,
  },
  {
    year: 2027,
    profitMargin: 20,
    utilization: 87,
    retention: 90,
    newClients: 7,
    cashFlowTarget: 650_000,
    bonusPool: 240_000,
  },
  {
    year: 2028,
    profitMargin: 22,
    utilization: 89,
    retention: 92,
    newClients: 9,
    cashFlowTarget: 850_000,
    bonusPool: 320_000,
  },
] as const;

export const SCENARIO_CALLOUTS = {
  risks: ['Investment ROI uncertainty', 'Growth execution challenges', 'Resource constraints'],
  opportunities: ['Market expansion', 'Service diversification', 'Technology investment'],
};

export const SCENARIO_CONFIGURATION = {
  planningPeriod: '3 Years',
  baseRevenue: 5_000_000,
  baseExpense: 4_000_000,
};

export const DASHBOARD_TIMELINE = [
  { title: 'Refresh Q2 Forecast', date: 'Apr 05, 2025', status: 'On Track' },
  { title: 'Executive Budget Sign-off', date: 'Apr 12, 2025', status: 'Awaiting Review' },
  { title: 'Scenario Alignment Workshop', date: 'Apr 18, 2025', status: 'Scheduled' },
] as const;

export const DASHBOARD_TASKS = [
  {
    title: 'Run AI Forecast Recalibration',
    owner: 'Finance Ops',
    due: 'Apr 06',
    status: 'In Progress',
  },
  {
    title: 'Finalize Scenario KPIs',
    owner: 'Strategy Team',
    due: 'Apr 10',
    status: 'Behind',
  },
  {
    title: 'Publish Budget Dashboard',
    owner: 'Analytics',
    due: 'Apr 14',
    status: 'Planned',
  },
] as const;

export const DASHBOARD_AI_PLAYBOOK = [
  {
    title: 'Revenue Momentum',
    insight: 'Run rate is pacing ahead of target with healthy margin expansion.',
  },
  {
    title: 'Expense Envelope',
    insight: 'Operating expenses are within plan but marketing is trending +6% over.',
  },
  {
    title: 'Approval Velocity',
    insight: 'Department review slows the workflow; escalate to keep April timeline.',
  },
] as const;

export const DEFAULT_APPROVAL_STAGES = [
  {
    id: 'draft',
    label: 'Budget Draft',
    description: 'Initial budget proposal created and ready for review',
    requiredRole: ['admin', 'manager', 'finance_manager', 'vendor', 'owner'],
    sequence: 0,
  },
  {
    id: 'department',
    label: 'Department Review',
    description: 'Business unit managers review budget allocations and targets',
    requiredRole: ['manager', 'department_head', 'admin', 'vendor', 'owner'],
    sequence: 1,
  },
  {
    id: 'finance',
    label: 'Finance Review',
    description: 'Finance team validates numbers, assumptions, and compliance',
    requiredRole: ['finance_manager', 'finance_analyst', 'admin', 'manager', 'vendor', 'owner'],
    sequence: 2,
  },
  {
    id: 'executive',
    label: 'Executive Approval',
    description: 'C-level executive final sign-off on budget strategy',
    requiredRole: ['director', 'ceo', 'cfo', 'admin', 'vendor', 'owner'],
    sequence: 3,
  },
];

export const APPROVAL_CONDITIONS = {
  department: [
    'All department budgets are within allocated limits',
    'Revenue targets are realistic and achievable',
    'Expense allocations align with department goals',
  ],
  finance: [
    'Financial calculations are accurate',
    'Budget assumptions are documented',
    'Compliance requirements are met',
    'Variance thresholds are acceptable',
  ],
  executive: [
    'Overall budget aligns with company strategy',
    'Risk assessment is complete',
    'All previous approvals are obtained',
    'Budget is ready for implementation',
  ],
};