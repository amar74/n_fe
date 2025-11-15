import { memo, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileDown,
  History,
  Settings2,
  Sparkles,
  Target,
  Upload,
  Users,
} from 'lucide-react';

type TabKey =
  | 'annual'
  | 'revenue-expense'
  | 'bu-allocation'
  | 'variance'
  | 'forecasting'
  | 'dashboard'
  | 'scenarios'
  | 'approval';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'annual', label: 'Annual Budget' },
  { key: 'revenue-expense', label: 'Revenue / Expense' },
  { key: 'bu-allocation', label: 'BU Allocation' },
  { key: 'variance', label: 'Variance' },
  { key: 'forecasting', label: 'Forecasting' },
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'scenarios', label: 'Scenarios' },
  { key: 'approval', label: 'Approval' },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

const formatPercent = (value: number, options?: { fractionDigits?: number }) =>
  new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: options?.fractionDigits ?? 1,
    maximumFractionDigits: options?.fractionDigits ?? 1,
  }).format(value / 100);

const formatPercentSigned = (value: number, fractionDigits = 1) => {
  const formatted = Math.abs(value).toFixed(fractionDigits);
  return `${value >= 0 ? '+' : '-'}${formatted}%`;
};

type AnnualMetric = {
  label: string;
  tone: 'default' | 'negative' | 'positive' | 'accent';
  value?: number;
  valueLabel?: string;
};

const ANNUAL_METRICS: AnnualMetric[] = [
  { label: 'Revenue Target', value: 5_000_000, tone: 'default' },
  { label: 'Expense Budget', value: 4_000_000, tone: 'negative' },
  { label: 'Target Profit', value: 1_000_000, tone: 'positive' },
  { label: 'Profit Margin', valueLabel: '20.0%', tone: 'accent' },
];

const REVENUE_LINES = [
  { label: 'Professional Service', target: 3_000_000, variance: 600_000 },
  { label: 'Consulting', target: 3_000_000, variance: 600_000 },
  { label: 'Retainer Agreements', target: 3_000_000, variance: 600_000 },
  { label: 'Managed Services', target: 3_000_000, variance: 600_000 },
] as const;

const EXPENSE_LINES = [
  { label: 'Direct Labor', target: 3_000_000, variance: -600_000 },
  { label: 'Overhead', target: 3_000_000, variance: -600_000 },
  { label: 'Marketing', target: 3_000_000, variance: -600_000 },
  { label: 'Operations', target: 3_000_000, variance: -600_000 },
  { label: 'Technology', target: 3_000_000, variance: -600_000 },
  { label: 'Legal & Professional', target: 3_000_000, variance: -600_000 },
] as const;

const BUSINESS_UNITS = [
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

const VARIANCE_THRESHOLDS = [
  { label: 'Revenue Variance Alert (%)', value: '5' },
  { label: 'Expense Variance Alert (%)', value: '10' },
  { label: 'Profit Variance Alert (%)', value: '15' },
] as const;

const REPORTING_SCHEDULE = [
  { label: 'Variance Report Frequency', value: 'Monthly' },
  { label: 'Auto-generated Reports', value: 'Yes' },
] as const;

const APPROVAL_STEPS = [
  {
    label: 'Drafted Budget',
    status: 'Completed',
    tone: 'positive' as const,
    description: 'Initial budget proposal created',
  },
  {
    label: 'Department Review',
    status: 'Pending',
    tone: 'negative' as const,
    description: 'Business unit managers review',
  },
  {
    label: 'Executive Approval',
    status: 'Waiting',
    tone: 'warning' as const,
    description: 'C-level executive sign-off',
  },
] as const;

const FORECASTING_HISTORY = [
  { period: 'Jan 2025', revenue: 399_364, expenses: 319_669 },
  { period: 'Feb 2025', revenue: 439_056, expenses: 338_110 },
  { period: 'Mar 2025', revenue: 434_473, expenses: 356_910 },
  { period: 'Apr 2025', revenue: 463_042, expenses: 354_759 },
  { period: 'May 2025', revenue: 447_221, expenses: 341_332 },
  { period: 'Jun 2025', revenue: 445_461, expenses: 330_447 },
] as const;

const FORECASTING_PARAMETERS = [
  { label: 'Forecasting Model', value: 'Linear Regression' },
  { label: 'Forecast Period (Months)', value: '12' },
  { label: 'Market Growth Rate (%)', value: '8' },
  { label: 'Inflation Rate (%)', value: '3.5' },
] as const;

const FORECASTING_ACTIONS = [
  { label: 'Export Forecast', tone: 'secondary' as const },
  { label: 'Generate Forecast', tone: 'primary' as const },
] as const;

type ScenarioKey = 'conservative' | 'balanced' | 'high';

type ScenarioConfig = {
  key: ScenarioKey;
  name: string;
  description: string;
  growthRates: number[];
  investmentLevel: 'Low' | 'Medium' | 'High';
  bonusThreshold: number;
  riskLevel: 'Low' | 'Medium' | 'High';
};

const SCENARIOS: ScenarioConfig[] = [
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

const SCENARIO_PROJECTIONS = [
  { year: 2026, revenue: 5_400_000, expenses: 4_240_000, profit: 1_160_000, margin: 21.5 },
  { year: 2027, revenue: 5_940_000, expenses: 4_579_200, profit: 1_360_800, margin: 22.9 },
  { year: 2028, revenue: 6_534_000, expenses: 4_966_000, profit: 1_568_000, margin: 24.0 },
] as const;

const SCENARIO_KPIS = [
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

const SCENARIO_CALLOUTS = {
  risks: ['Investment ROI uncertainty', 'Growth execution challenges', 'Resource constraints'],
  opportunities: ['Market expansion', 'Service diversification', 'Technology investment'],
};

const SCENARIO_CONFIGURATION = {
  planningPeriod: '3 Years',
  baseRevenue: 5_000_000,
  baseExpense: 4_000_000,
};

const DASHBOARD_TIMELINE = [
  { title: 'Refresh Q2 Forecast', date: 'Apr 05, 2025', status: 'On Track' },
  { title: 'Executive Budget Sign-off', date: 'Apr 12, 2025', status: 'Awaiting Review' },
  { title: 'Scenario Alignment Workshop', date: 'Apr 18, 2025', status: 'Scheduled' },
] as const;

const DASHBOARD_TASKS = [
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

const DASHBOARD_AI_PLAYBOOK = [
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

const IN_PROGRESS_TABS: TabKey[] = [];

function FinancePlanningPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('annual');
  const [activeScenario, setActiveScenario] = useState<ScenarioKey>('balanced');

  const activeIsComingSoon = IN_PROGRESS_TABS.includes(activeTab);

  const revenueTotals = useMemo(() => {
    const totalTarget = REVENUE_LINES.reduce((sum, line) => sum + line.target, 0);
    const totalVariance = REVENUE_LINES.reduce((sum, line) => sum + line.variance, 0);
    return { totalTarget, totalVariance };
  }, []);

  const expenseTotals = useMemo(() => {
    const totalTarget = EXPENSE_LINES.reduce((sum, line) => sum + line.target, 0);
    const totalVariance = EXPENSE_LINES.reduce((sum, line) => sum + line.variance, 0);
    return { totalTarget, totalVariance };
  }, []);

  const forecastingStats = useMemo(() => {
    const count = FORECASTING_HISTORY.length || 1;
    const totalRevenue = FORECASTING_HISTORY.reduce((sum, item) => sum + item.revenue, 0);
    const totalExpenses = FORECASTING_HISTORY.reduce((sum, item) => sum + item.expenses, 0);
    const avgRevenue = totalRevenue / count;
    const avgExpenses = totalExpenses / count;
    const avgProfit = avgRevenue - avgExpenses;

    return {
      avgRevenue,
      avgExpenses,
      avgProfit,
    };
  }, []);

  const selectedScenario = useMemo(
    () => SCENARIOS.find((scenario) => scenario.key === activeScenario) ?? SCENARIOS[1],
    [activeScenario],
  );

  const dashboardOverview = useMemo(() => {
    const revenueTarget = ANNUAL_METRICS.find((metric) => metric.label === 'Revenue Target')?.value ?? 0;
    const expenseBudget = ANNUAL_METRICS.find((metric) => metric.label === 'Expense Budget')?.value ?? 0;
    const profitTarget = ANNUAL_METRICS.find((metric) => metric.label === 'Target Profit')?.value ?? 0;

    const revenueForecastAnnual = forecastingStats.avgRevenue * 12;
    const expenseForecastAnnual = forecastingStats.avgExpenses * 12;
    const profitForecastAnnual = forecastingStats.avgProfit * 12;

    const budgetUtilizationPct = expenseBudget
      ? Math.min((expenseForecastAnnual / expenseBudget) * 100, 160)
      : 0;
    const revenueAchievement = revenueTarget ? (revenueForecastAnnual / revenueTarget) * 100 : 0;
    const expenseVariancePct = expenseBudget
      ? ((expenseForecastAnnual - expenseBudget) / expenseBudget) * 100
      : 0;
    const revenueVariancePct = revenueTarget
      ? ((revenueForecastAnnual - revenueTarget) / revenueTarget) * 100
      : 0;
    const profitAchievement = profitTarget ? (profitForecastAnnual / profitTarget) * 100 : 0;
    const profitVariancePct = profitTarget
      ? ((profitForecastAnnual - profitTarget) / Math.max(profitTarget, 1)) * 100
      : 0;

    const pendingApprovals = APPROVAL_STEPS.filter((step) => step.status !== 'Completed').length;
    const attentionApprovals = APPROVAL_STEPS.filter((step) => step.tone !== 'positive').length;

    const planRows = [
      {
        label: 'Revenue',
        plan: revenueTarget,
        forecast: revenueForecastAnnual,
      },
      {
        label: 'Expenses',
        plan: expenseBudget,
        forecast: expenseForecastAnnual,
      },
      {
        label: 'Profit',
        plan: profitTarget,
        forecast: profitForecastAnnual,
      },
    ].map((row) => {
      const variance = row.forecast - row.plan;
      const variancePct = row.plan ? (variance / row.plan) * 100 : 0;
      return { ...row, variance, variancePct };
    });

    const aiHighlights = [
      {
        title: 'Revenue Momentum',
        tone: revenueVariancePct >= 0 ? 'positive' as const : 'warning' as const,
        detail: `Run rate is ${formatPercent(revenueAchievement)} of plan (${formatPercentSigned(
          revenueVariancePct,
        )}).`,
      },
      {
        title: 'Expense Envelope',
        tone: expenseVariancePct <= 5 ? 'positive' as const : 'warning' as const,
        detail: `Operating envelope is ${formatPercentSigned(expenseVariancePct)} vs. budget.`,
      },
      {
        title: 'Profit Outlook',
        tone: profitVariancePct >= 0 ? 'positive' as const : 'warning' as const,
        detail: `Projected EBIT margin tracking ${formatPercentSigned(profitVariancePct)} relative to target.`,
      },
    ];

    return {
      revenueTarget,
      expenseBudget,
      profitTarget,
      revenueForecastAnnual,
      expenseForecastAnnual,
      profitForecastAnnual,
      budgetUtilizationPct,
      revenueAchievement,
      profitAchievement,
      revenueVariancePct,
      expenseVariancePct,
      profitVariancePct,
      pendingApprovals,
      attentionApprovals,
      planRows,
      aiHighlights,
    };
  }, [forecastingStats, activeScenario]);

  const renderAnnualBudget = () => (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Budget Summary</h3>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#161950]/10 px-3 py-1 text-xs font-semibold text-[#161950]">
            <ClipboardList className="h-3.5 w-3.5" />
            Draft
          </span>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {ANNUAL_METRICS.map((metric) => (
            <div
              key={metric.label}
              className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-5 shadow-sm"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{metric.label}</span>
              <span
                className={[
                  'text-2xl font-semibold text-slate-900',
                  metric.tone === 'positive' && 'text-emerald-600',
                  metric.tone === 'negative' && 'text-rose-600',
                  metric.tone === 'accent' && 'text-[#161950]',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {metric.valueLabel ?? formatCurrency(metric.value ?? 0)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
        <h3 className="text-lg font-semibold text-slate-900">Budget Parameters</h3>
        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Budget Year</label>
            <div className="flex h-11 items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:border-[#161950]/40">
              <span>2026</span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Quick Copy from Previous Year
            </label>
            <div className="flex gap-2">
              <div className="flex h-11 flex-1 items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-400 shadow-sm transition hover:border-[#161950]/40 hover:text-slate-600">
                <span>Select year to copy</span>
                <ChevronDown className="h-4 w-4 text-slate-300" />
              </div>
              <button className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#161950]/30 bg-[#161950]/10 px-4 text-xs font-semibold uppercase tracking-wide text-[#161950] shadow-sm transition hover:border-[#161950]/50 hover:bg-[#161950]/15">
                <FileDown className="h-4 w-4" />
                Copy
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Target Growth Rate (%)
              </label>
              <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 shadow-sm">
                15
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total Revenue Target
              </label>
              <div className="flex h-11 items-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-600 shadow-sm">
                5,000,000
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total Expense Budget
              </label>
              <div className="flex h-11 items-center rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-600 shadow-sm">
                4,000,000
              </div>
            </div>
          </div>

          <button className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#161950] text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#0f133f]">
            <ArrowRight className="h-4 w-4" />
            Save Budget
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)] lg:col-span-2">
        <h3 className="text-lg font-semibold text-slate-900">AI Budgeting Assistant</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">AI Forecast Confidence</p>
            <p className="mt-2 text-2xl font-bold text-emerald-600">97.3%</p>
            <p className="mt-1 text-xs text-slate-500">AI variance outlook vs baseline models.</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Scenario Models</p>
              <p className="mt-2 text-2xl font-bold text-[#161950]">3 Active</p>
            <p className="mt-1 text-xs text-slate-500">Base, stretch, and contingency options ready.</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">OpEx Savings</p>
            <p className="mt-2 text-2xl font-bold text-emerald-600">$240K</p>
            <p className="mt-1 text-xs text-slate-500">AI-flagged contract renegotiations.</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button className="group h-10 bg-white/0 outline outline-1 outline-offset-[-1px] outline-indigo-950 inline-flex items-center gap-2.5 rounded-xl border border-[#161950] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#161950] shadow-sm transition hover:bg-[#161950] hover:text-white">
            <History className="h-4 w-4 text-[#161950] transition group-hover:text-white" />
            Review Previous Year
          </button>
          <button className="group h-10 bg-white/0 outline outline-1 outline-offset-[-1px] outline-indigo-950 inline-flex items-center gap-2.5 rounded-xl border border-[#161950] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#161950] shadow-sm transition hover:bg-[#161950] hover:text-white">
            <Upload className="h-4 w-4 text-[#161950] transition group-hover:text-white" />
            Import Data
          </button>
          <Link
            to="/module/finance"
            className="group h-10 bg-[#161950] outline outline-1 outline-offset-[-1px] outline-indigo-950 inline-flex items-center gap-2.5 rounded-xl border border-[#161950] px-4 py-2 text-xs font-semibold uppercase tracking-wide shadow-sm transition text-white hover:text-white"
          >
            Launch Finance Dashboard
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );

  const renderRevenueExpense = () => (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Revenue Targets</h3>
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Total {formatCurrency(revenueTotals.totalTarget)}
          </span>
        </div>
        <div className="mt-4 h-px bg-slate-100" />
        <div className="mt-4 space-y-4">
          {REVENUE_LINES.map((line) => (
            <div key={line.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">{line.label}</p>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-sm font-semibold text-slate-700">{formatCurrency(line.target)}</span>
                <span className="text-sm font-semibold text-emerald-600">
                  {formatCurrency(line.variance)}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 h-px bg-slate-100" />
        <div className="mt-4 flex items-center justify-between text-sm font-semibold text-slate-700">
          <span>Total Revenue Target</span>
          <span className="text-emerald-600">{formatCurrency(revenueTotals.totalTarget)}</span>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Expense Budgets</h3>
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Total {formatCurrency(expenseTotals.totalTarget)}
          </span>
        </div>
        <div className="mt-4 h-px bg-slate-100" />
        <div className="mt-4 space-y-4">
          {EXPENSE_LINES.map((line) => (
            <div key={line.label} className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">{line.label}</p>
              <div className="flex items-center gap-6">
                <span className="text-sm font-semibold text-slate-700">{formatCurrency(line.target)}</span>
                <span className="text-sm font-semibold text-rose-600">
                  {formatCurrency(line.variance)}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 h-px bg-slate-100" />
        <div className="mt-4 flex items-center justify-between text-sm font-semibold text-slate-700">
          <span>Total Expense Budget</span>
          <span className="text-rose-600">{formatCurrency(expenseTotals.totalTarget)}</span>
        </div>
      </div>
    </div>
  );

  const renderBuAllocation = () => (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Budget Allocation by Business Unit</h3>
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">2026 Draft</span>
      </div>
      <div className="mt-4 h-px bg-slate-100" />
      <div className="mt-4 grid gap-4 text-sm text-slate-600">
        <div className="grid grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))] gap-4 rounded-lg bg-[#161950]/10 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#161950]">
          <span>Business Unit</span>
          <span className="text-right">Revenue Target</span>
          <span className="text-right">Expense Allocation</span>
          <span className="text-right">Target Profit</span>
          <span className="text-right">Headcount</span>
        </div>
        {BUSINESS_UNITS.map((unit) => (
          <div
            key={unit.name}
            className="grid grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))] items-center gap-4 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm transition hover:border-[#161950]/40 hover:shadow-[0_18px_32px_-24px_rgba(22,25,80,0.35)]"
          >
            <div>
              <p className="font-semibold text-slate-800">{unit.name}</p>
              <p className="text-xs text-slate-500">Profit Margin {unit.margin}</p>
            </div>
            <span className="text-right font-semibold text-slate-700">{formatCurrency(unit.revenue)}</span>
            <span className="text-right font-semibold text-rose-600">{formatCurrency(unit.expense)}</span>
            <span className="text-right font-semibold text-emerald-600">{formatCurrency(unit.profit)}</span>
            <span className="text-right font-semibold text-slate-700">{unit.headcount}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderVariance = () => (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Variance Thresholds</h3>
          <Settings2 className="h-4 w-4 text-[#161950]" />
        </div>
        <div className="mt-4 space-y-4">
          {VARIANCE_THRESHOLDS.map((threshold) => (
            <div key={threshold.label}>
              <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {threshold.label}
              </label>
              <div className="mt-2 flex h-11 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm">
                {threshold.value}
              </div>
            </div>
          ))}
        </div>
        <button className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#161950] text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#0f133f]">
          Save Thresholds
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Reporting Schedule</h3>
          <Sparkles className="h-4 w-4 text-[#161950]" />
        </div>
        <div className="mt-4 space-y-4">
          {REPORTING_SCHEDULE.map((item) => (
            <div key={item.label}>
              <label className="text-xs font-medium uppercase tracking-wide text-slate-500">{item.label}</label>
              <div className="mt-2 flex h-11 items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm">
                <span>{item.value}</span>
                <ChevronDown className="h-4 w-4 text-slate-300" />
              </div>
            </div>
          ))}
        </div>
        <button className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#161950] text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#0f133f]">
          Configure Reporting
        </button>
      </div>
    </div>
  );

  const renderDashboard = () => {
    const scenarioKpiPreview = SCENARIO_KPIS[0];

    const summaryCards = [
      {
        label: 'Budget Utilization',
        value: formatPercent(dashboardOverview.budgetUtilizationPct),
        detail: `${formatCurrency(Math.round(dashboardOverview.expenseForecastAnnual))} of ${formatCurrency(
          dashboardOverview.expenseBudget,
        )}`,
        icon: Target,
      },
      {
        label: 'Revenue Run Rate',
        value: formatCurrency(Math.round(dashboardOverview.revenueForecastAnnual)),
        detail: `${formatPercentSigned(dashboardOverview.revenueVariancePct)} vs plan`,
        icon: BarChart3,
      },
      {
        label: 'Profit Outlook',
        value: formatCurrency(Math.round(dashboardOverview.profitForecastAnnual)),
        detail: `${formatPercent(dashboardOverview.profitAchievement)} of target`,
        icon: Sparkles,
      },
      {
        label: 'Approvals Pending',
        value: dashboardOverview.pendingApprovals.toString(),
        detail: `${dashboardOverview.attentionApprovals} awaiting action`,
        icon: History,
      },
    ];

    return (
      <div className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <div
                key={card.label}
                className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-5 shadow-sm transition hover:border-[#161950]/40 hover:shadow-[0_18px_32px_-24px_rgba(22,25,80,0.35)]"
              >
                <div className="flex items-center gap-2">
                  <card.icon className="h-4 w-4 text-[#161950]" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {card.label}
                  </span>
                </div>
                <span className="text-2xl font-semibold text-slate-900">{card.value}</span>
                <span className="text-xs text-slate-500">{card.detail}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <section className="flex h-full flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Plan vs. Forecast Snapshot</h3>
                <p className="text-sm text-slate-500">Keep the annual plan in view as AI forecasting updates.</p>
              </div>
              <Sparkles className="h-5 w-5 text-[#161950]" />
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <table className="min-w-full text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-3 pl-4 text-left">Metric</th>
                    <th className="py-3 text-right">Plan</th>
                    <th className="py-3 text-right">Forecast</th>
                    <th className="py-3 pr-4 text-right">Variance</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardOverview.planRows.map((row) => (
                    <tr key={row.label} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 pl-4 font-medium text-slate-700">{row.label}</td>
                      <td className="py-3 text-right text-slate-500">{formatCurrency(Math.round(row.plan))}</td>
                      <td className="py-3 text-right font-semibold text-slate-800">
                        {formatCurrency(Math.round(row.forecast))}
                      </td>
                      <td
                        className={`py-3 pr-4 text-right font-semibold ${
                          row.variance >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {formatCurrency(Math.round(row.variance))} ({formatPercentSigned(row.variancePct)})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="flex h-full flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">AI Highlights & Workflow</h3>
              <Sparkles className="h-5 w-5 text-[#161950]" />
            </div>
            <div className="space-y-3">
              {dashboardOverview.aiHighlights.map((highlight) => (
                <div
                  key={highlight.title}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 shadow-sm"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    {highlight.tone === 'positive' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    )}
                    {highlight.title}
                  </div>
                  <p className="mt-2 text-xs text-slate-600">{highlight.detail}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
                <span>Approval Workflow</span>
                <span className="text-xs font-medium text-[#161950]">
                  {dashboardOverview.pendingApprovals} open · {dashboardOverview.attentionApprovals} flagged
                </span>
              </div>
              <div className="mt-3 space-y-3">
                {APPROVAL_STEPS.map((step) => (
                  <div key={step.label} className="flex items-center justify-between text-sm text-slate-600">
                    <span>{step.label}</span>
                    <span
                      className={[
                        'rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide',
                        step.tone === 'positive' && 'bg-emerald-50 text-emerald-600',
                        step.tone === 'negative' && 'bg-rose-50 text-rose-600',
                        step.tone === 'warning' && 'bg-amber-50 text-amber-600',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {step.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Scenario Pulse</h3>
                <span className="rounded-full bg-[#161950]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#161950]">
                  {selectedScenario.name}
                </span>
              </div>
              <p className="text-sm text-slate-500">
                Monitor the active plan assumptions, risk posture, and KPI swim lanes.
              </p>
            </div>
            <div className="mt-5 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-4 shadow-sm">
                <p className="text-xs uppercase text-slate-500">Growth Range</p>
                <p className="mt-1 text-lg font-semibold text-[#161950]">
                  {selectedScenario.growthRates.map((rate) => `${rate}%`).join(' · ')}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Investment Level:{' '}
                  <span className="font-semibold text-slate-700">{selectedScenario.investmentLevel}</span>
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-4 shadow-sm">
                <p className="text-xs uppercase text-slate-500">Bonus Threshold</p>
                <p className="mt-1 text-lg font-semibold text-[#161950]">{selectedScenario.bonusThreshold}%</p>
                <p className="mt-2 text-xs text-slate-500">Risk Level: {selectedScenario.riskLevel}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-4 shadow-sm">
                <p className="text-xs uppercase text-slate-500">Year {scenarioKpiPreview.year} KPI Targets</p>
                <div className="mt-2 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Profit Margin</span>
                    <span className="font-semibold text-[#161950]">{scenarioKpiPreview.profitMargin}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Employee Utilization</span>
                    <span>{scenarioKpiPreview.utilization}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Client Retention</span>
                    <span>{scenarioKpiPreview.retention}%</span>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-4 shadow-sm">
                <p className="text-xs uppercase text-slate-500">Cash & Incentives</p>
                <div className="mt-2 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Cash Flow Target</span>
                    <span className="font-semibold text-emerald-600">
                      {formatCurrency(scenarioKpiPreview.cashFlowTarget)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bonus Pool</span>
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(scenarioKpiPreview.bonusPool)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="flex h-full flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Timeline & Reporting Cadence</h3>
              <CalendarDays className="h-5 w-5 text-[#161950]" />
            </div>
            <div className="space-y-3">
              {DASHBOARD_TIMELINE.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm shadow-sm"
                >
                  <div>
                    <p className="font-semibold text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.date}</p>
                  </div>
                  <span className="rounded-full bg-[#161950]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#161950]">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
            <div className="space-y-2 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reporting Schedule</p>
              {REPORTING_SCHEDULE.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs text-slate-600">
                  <span>{item.label}</span>
                  <span className="font-semibold text-slate-800">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Variance Alerts</p>
              {VARIANCE_THRESHOLDS.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs text-slate-600">
                  <span>{item.label}</span>
                  <span className="font-semibold text-[#161950]">{item.value}%</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Operational Checklist</h3>
              <History className="h-5 w-5 text-[#161950]" />
            </div>
            <div className="mt-4 space-y-3">
              {DASHBOARD_TASKS.map((task) => (
                <div
                  key={task.title}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm shadow-sm"
                >
                  <div>
                    <p className="font-semibold text-slate-800">{task.title}</p>
                    <p className="text-xs text-slate-500">
                      Owner: {task.owner} · Due {task.due}
                    </p>
                  </div>
                  <span
                    className={[
                      'rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide',
                      task.status === 'In Progress' && 'bg-[#161950]/10 text-[#161950]',
                      task.status === 'Behind' && 'bg-rose-50 text-rose-600',
                      task.status === 'Planned' && 'bg-slate-200 text-slate-700',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">AI Playbook</h3>
              <Sparkles className="h-5 w-5 text-[#161950]" />
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Guided actions surfaced by the budgeting assistant to keep the annual plan on track.
            </p>
            <div className="mt-4 space-y-4">
              {DASHBOARD_AI_PLAYBOOK.map((item) => (
                <div key={item.title} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-4 shadow-sm">
                  <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                  <p className="mt-2 text-xs text-slate-600">{item.insight}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  };

  const renderForecasting = () => (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Financial Forecasting Models</h2>
            <p className="text-sm text-slate-500">
              Advanced predictive analytics for revenue and expense projections with AI-tuned parameters.
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            {FORECASTING_ACTIONS.map((action) => (
              <button
                key={action.label}
                className={[
                  'inline-flex h-10 items-center gap-2.5 rounded-xl px-4 text-xs font-semibold uppercase tracking-wide transition',
                  action.tone === 'secondary'
                    ? 'border border-[#161950]/25 bg-white text-[#161950] shadow-sm hover:border-[#161950]/60 hover:bg-[#161950]/10'
                    : 'bg-[#161950] text-white shadow-sm hover:bg-[#0f133f]',
                ].join(' ')}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6 grid gap-4 text-center sm:grid-cols-3">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">Avg Monthly Revenue</p>
            <p className="mt-2 text-2xl font-semibold text-[#161950]">
              {formatCurrency(Math.round(forecastingStats.avgRevenue))}
            </p>
          </div>
          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">Avg Monthly Expenses</p>
            <p className="mt-2 text-2xl font-semibold text-rose-600">
              {formatCurrency(Math.round(forecastingStats.avgExpenses))}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500">Avg Monthly Profit</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-600">
              {formatCurrency(Math.round(forecastingStats.avgProfit))}
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
          <h3 className="text-lg font-semibold text-slate-900">Forecasting Parameters</h3>
          <p className="text-sm text-slate-500">Simple trend-based forecasting with optional seasonal adjustments.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {FORECASTING_PARAMETERS.map((param, index) => (
              <div key={param.label} className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">{param.label}</label>
                <div
                  className={[
                    'flex h-11 items-center justify-between rounded-xl border bg-white px-4 text-sm font-medium shadow-sm transition',
                    index === 0 ? 'border-[#161950]/40 text-[#161950]' : 'border-slate-200 text-slate-700',
                  ].join(' ')}
                >
                  <span>{param.value}</span>
                  {index === 0 && <ChevronDown className="h-4 w-4 text-[#161950]" />}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 shadow-sm">
            <input type="checkbox" checked readOnly className="h-4 w-4 rounded border-slate-300 text-[#161950]" />
            <span>Apply Seasonal Adjustment</span>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
          <h3 className="text-lg font-semibold text-slate-900">Historical Performance Analysis</h3>
          <p className="text-sm text-slate-500">
            Evaluate trailing twelve-month performance to calibrate forecasting confidence.
          </p>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-3 text-left">Period</th>
                  <th className="py-3 text-right">Revenue</th>
                  <th className="py-3 text-right">Expenses</th>
                  <th className="py-3 text-right">Profit</th>
                  <th className="py-3 text-right">Margin</th>
                </tr>
              </thead>
              <tbody>
                {FORECASTING_HISTORY.map((row) => {
                  const profit = row.revenue - row.expenses;
                  const margin = profit / Math.max(row.revenue, 1);
                  return (
                    <tr key={row.period} className="border-b border-slate-100 last:border-0">
                      <td className="py-2">{row.period}</td>
                      <td className="py-2 text-right font-semibold text-[#161950]">{formatCurrency(row.revenue)}</td>
                      <td className="py-2 text-right text-rose-600">{formatCurrency(row.expenses)}</td>
                      <td className="py-2 text-right text-emerald-600">{formatCurrency(profit)}</td>
                      <td className="py-2 text-right">{formatPercent(margin * 100)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );

  const renderScenarios = () => (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Multi-year Planning Scenarios</h2>
            <p className="text-sm text-slate-500">
              Compare strategic growth paths with integrated KPI targets and bonus structures.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="inline-flex h-10 items-center gap-2.5 rounded-xl border border-[#161950]/30 bg-white px-4 text-xs font-semibold uppercase tracking-wide text-[#161950] shadow-sm transition hover:border-[#161950]/60 hover:bg-[#161950]/10">
              Compare All
            </button>
            <button className="inline-flex h-10 items-center gap-2.5 rounded-xl border border-[#161950]/30 bg-white px-4 text-xs font-semibold uppercase tracking-wide text-[#161950] shadow-sm transition hover:border-[#161950]/60 hover:bg-[#161950]/10">
              Export Comparison
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {SCENARIOS.map((scenario) => {
            const isActive = scenario.key === activeScenario;
            return (
              <button
                key={scenario.key}
                onClick={() => setActiveScenario(scenario.key)}
                className={[
                  'flex h-full flex-col gap-3 rounded-2xl border px-5 py-4 text-left shadow-sm transition hover:border-[#161950]/50 hover:shadow-[0_18px_32px_-24px_rgba(22,25,80,0.35)]',
                  isActive
                    ? 'border-[#161950] bg-[#161950]/5 ring-2 ring-[#161950]/30'
                    : 'border-slate-200 bg-white',
                ].join(' ')}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">{scenario.name}</p>
                  {isActive && (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-600">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500">{scenario.description}</p>
                <div className="mt-2 grid gap-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Revenue Growth</span>
                    <span>{scenario.growthRates.map((rate) => `${rate}%`).join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Investment Level</span>
                    <span className="font-semibold text-[#161950]">{scenario.investmentLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bonus Threshold</span>
                    <span>{scenario.bonusThreshold}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Risk Level</span>
                    <span>{scenario.riskLevel}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Planning Period</label>
            <div className="flex h-11 items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm">
              <span>{SCENARIO_CONFIGURATION.planningPeriod}</span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Base Year Revenue</label>
            <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-[#161950] shadow-sm">
              {formatCurrency(SCENARIO_CONFIGURATION.baseRevenue)}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Base Year Expenses</label>
            <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-rose-600 shadow-sm">
              {formatCurrency(SCENARIO_CONFIGURATION.baseExpense)}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
          <h3 className="text-lg font-semibold text-slate-900">
            {selectedScenario.name} &ndash; Financial Projections
          </h3>
          <p className="text-sm text-slate-500">
            Modeled revenue, expense, and profit trajectory aligned to the active scenario assumptions.
          </p>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-3 text-left">Year</th>
                  <th className="py-3 text-right">Revenue</th>
                  <th className="py-3 text-right">Expenses</th>
                  <th className="py-3 text-right">Profit</th>
                  <th className="py-3 text-right">Margin</th>
                </tr>
              </thead>
              <tbody>
                {SCENARIO_PROJECTIONS.map((projection) => (
                  <tr key={projection.year} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 font-semibold text-slate-800">{projection.year}</td>
                    <td className="py-2 text-right text-[#161950]">{formatCurrency(projection.revenue)}</td>
                    <td className="py-2 text-right text-rose-600">{formatCurrency(projection.expenses)}</td>
                    <td className="py-2 text-right text-emerald-600">{formatCurrency(projection.profit)}</td>
                    <td className="py-2 text-right">{formatPercent(projection.margin)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
          <h3 className="text-lg font-semibold text-slate-900">KPI Targets &amp; Bonus Structure</h3>
          <p className="text-sm text-slate-500">
            Multi-year KPI commitments for margin, retention, utilization, and growth incentives.
          </p>
          <div className="mt-5 space-y-4">
            {SCENARIO_KPIS.map((kpi) => (
              <div key={kpi.year} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800">Year {kpi.year} KPI Targets</p>
                  <span className="text-xs font-semibold uppercase tracking-wide text-[#161950]">
                    Bonus Threshold {selectedScenario.bonusThreshold}%
                  </span>
                </div>
                <div className="mt-3 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                  <div className="flex justify-between">
                    <span>Target Profit Margin</span>
                    <span className="font-semibold text-[#161950]">{kpi.profitMargin}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Employee Utilization</span>
                    <span>{kpi.utilization}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Client Retention</span>
                    <span>{kpi.retention}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>New Clients</span>
                    <span>{kpi.newClients}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cash Flow Target</span>
                    <span className="font-semibold text-emerald-600">{formatCurrency(kpi.cashFlowTarget)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bonus Pool</span>
                    <span className="font-semibold text-slate-800">{formatCurrency(kpi.bonusPool)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="rounded-3xl border border-rose-100 bg-rose-50 p-6 shadow-[0_24px_48px_-24px_rgba(244,63,94,0.25)]">
          <h3 className="text-lg font-semibold text-rose-600">Risk Assessment</h3>
          <ul className="mt-4 space-y-3 text-sm text-rose-700">
            {SCENARIO_CALLOUTS.risks.map((risk) => (
              <li key={risk} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-rose-500" />
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 shadow-[0_24px_48px_-24px_rgba(16,185,129,0.25)]">
          <h3 className="text-lg font-semibold text-emerald-600">Strategic Opportunities</h3>
          <ul className="mt-4 space-y-3 text-sm text-emerald-700">
            {SCENARIO_CALLOUTS.opportunities.map((opportunity) => (
              <li key={opportunity} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                <span>{opportunity}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );

  const renderApproval = () => (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Executive Budget Approval Workflow</h3>
        <Users className="h-5 w-5 text-[#161950]" />
      </div>
      <div className="mt-4 h-px bg-slate-100" />
      <div className="mt-4 space-y-4">
        {APPROVAL_STEPS.map((step) => (
          <div
            key={step.label}
            className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50 p-4 shadow-sm transition hover:border-[#161950]/40 hover:shadow-[0_18px_32px_-24px_rgba(22,25,80,0.35)]"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">{step.label}</p>
              <span
                className={[
                  'inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                  step.tone === 'positive' && 'bg-emerald-50 text-emerald-600',
                  step.tone === 'negative' && 'bg-rose-50 text-rose-600',
                  step.tone === 'warning' && 'bg-amber-50 text-amber-600',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {step.status}
              </span>
            </div>
            <p className="text-sm text-slate-600">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderComingSoon = () => (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-[#161950]/30 bg-white text-center text-sm text-[#161950] shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
      <Sparkles className="mb-3 h-8 w-8 text-[#161950]/70" />
      <p className="max-w-sm text-balance">
        We’re crafting an AI-first experience for this section. Forecasting, Scenario Planning, and the Budget Dashboard
        will land in an upcoming release.
      </p>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'annual':
        return renderAnnualBudget();
      case 'revenue-expense':
        return renderRevenueExpense();
      case 'bu-allocation':
        return renderBuAllocation();
      case 'variance':
        return renderVariance();
      case 'dashboard':
        return renderDashboard();
      case 'forecasting':
        return renderForecasting();
      case 'scenarios':
        return renderScenarios();
      case 'approval':
        return renderApproval();
      default:
        return renderComingSoon();
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 font-[Outfit] text-[#101828]">
      <div className="flex w-full flex-col gap-8 px-6 py-8">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-3">
            <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <Link to="/module/finance" className="flex items-center gap-1 text-slate-500 transition hover:text-[#161950]">
                <span>Dashboard</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
              <span className="text-slate-700">Finance</span>
            </nav>
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">Annual Budget Creation</h1>
              <p className="text-sm text-slate-500">
                AI-guided workflow to set revenue targets, expense envelopes, and approval checkpoints for the upcoming
                fiscal year.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="group h-10 bg-white/0 outline outline-1 outline-offset-[-1px] outline-indigo-950 inline-flex items-center gap-2.5 rounded-xl border border-[#161950] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#161950] shadow-sm transition hover:bg-[#161950] hover:text-white">
              <History className="h-4 w-4 text-[#161950] transition group-hover:text-white" />
              Review Previous Year
            </button>
            <button className="group h-10 bg-white/0 outline outline-1 outline-offset-[-1px] outline-indigo-950 inline-flex items-center gap-2.5 rounded-xl border border-[#161950] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#161950] shadow-sm transition hover:bg-[#161950] hover:text-white">
              <Upload className="h-4 w-4 text-[#161950] transition group-hover:text-white" />
              Import Data
            </button>
            <Link
              to="/module/finance"
              className="group h-10 bg-[#161950] outline outline-1 outline-offset-[-1px] outline-indigo-950 inline-flex items-center gap-2.5 rounded-xl border border-[#161950] px-4 py-2 text-xs font-semibold uppercase tracking-wide shadow-sm transition text-white hover:text-white"
            >
              AI Budget Planning
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {TABS.map((tab) => {
            const isActive = tab.key === activeTab;
            const isSoon = IN_PROGRESS_TABS.includes(tab.key);
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={[
                  'flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition',
                  isActive
                    ? 'bg-[#161950] text-white shadow-[0_12px_24px_-12px_rgba(22,25,80,0.45)]'
                    : 'text-slate-500 hover:bg-[#161950]/10 hover:text-[#161950]',
                ].join(' ')}
              >
                {tab.label}
                {isSoon && (
                  <span className="ml-1 text-[10px] uppercase tracking-wide text-[#161950]/60">(soon)</span>
                )}
              </button>
            );
          })}
        </div>

        {activeIsComingSoon ? renderComingSoon() : renderTabContent()}
      </div>
    </div>
  );
}

export default memo(FinancePlanningPage);

