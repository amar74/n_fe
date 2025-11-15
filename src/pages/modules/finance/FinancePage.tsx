import { memo, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Brain,
  ChartLine,
  Clock3,
  DollarSign,
  Loader2,
  PiggyBank,
  TrendingUp,
} from 'lucide-react';

type IncomeStatementMonth = {
  month: string;
  plan: Record<string, number>;
  actual: Record<string, number>;
};

type FinanceSnapshot = {
  incomeStatement: IncomeStatementMonth[];
  overhead: Record<string, number[]>;
  bookings: { clientName: string; monthlyActuals: number[]; totalPlan: number }[];
  dro: { clientName: string; dro: number }[];
  keyStats: { bookings: number; backlog: number };
  receivables: {
    currentMonth: { dro: number; dbo: number; duo: number };
    lastMonth: { dro: number; dbo: number; duo: number };
  };
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CURRENT_MONTH_INDEX = new Date().getMonth();

const formatCurrency = (value: number, options?: { compact?: boolean; withSign?: boolean }) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: options?.compact ? 'compact' : 'standard',
    minimumFractionDigits: options?.compact ? 1 : 0,
    maximumFractionDigits: options?.compact ? 1 : 0,
    signDisplay: options?.withSign ? 'always' : 'auto',
  }).format(value);

const formatPercent = (value: number, withSign = false) =>
  new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    signDisplay: withSign ? 'always' : 'auto',
  }).format(value / 100);

const generateMonthlyData = (): IncomeStatementMonth[] =>
  MONTHS.map((month, index) => {
    const planFactor = 1.04 + index * 0.012;
    const actualFactor = planFactor - 0.04 + Math.random() * 0.08;

    const grossRevenuePlan = 480000 * planFactor;
    const grossRevenueActual = 470000 * actualFactor;
    const reimbursablePlan = grossRevenuePlan * 0.2;
    const reimbursableActual = grossRevenueActual * 0.18;

    const netRevenuePlan = grossRevenuePlan - reimbursablePlan;
    const netRevenueActual = grossRevenueActual - reimbursableActual;

    const directLaborPlan = netRevenuePlan * 0.4;
    const directLaborActual = netRevenueActual * 0.41;

    const grossProfitPlan = netRevenuePlan - directLaborPlan;
    const grossProfitActual = netRevenueActual - directLaborActual;

    const overheadPlan = grossProfitPlan * 0.5;
    const overheadActual = grossProfitActual * 0.52;

    const operatingIncomePlan = grossProfitPlan - overheadPlan;
    const operatingIncomeActual = grossProfitActual - overheadActual;

    const bonusPlan = operatingIncomePlan * 0.1;
    const bonusActual = operatingIncomeActual * 0.1;

    const netContributionPlan = operatingIncomePlan - bonusPlan;
    const netContributionActual = operatingIncomeActual - bonusActual;

    const ebitaPlan = netContributionPlan - 35000;
    const ebitaActual = netContributionActual - 33000;

    return {
      month,
      plan: {
        grossRevenue: grossRevenuePlan,
        reimbursableCosts: reimbursablePlan,
        netRevenue: netRevenuePlan,
        directLaborTotal: directLaborPlan,
        grossProfit: grossProfitPlan,
        overheadCosts: overheadPlan,
        operatingIncomeBeforeAllocation: operatingIncomePlan,
        bonusAllocation: bonusPlan,
        netContribution: netContributionPlan,
        ebita: ebitaPlan,
      },
      actual: {
        grossRevenue: grossRevenueActual,
        reimbursableCosts: reimbursableActual,
        netRevenue: netRevenueActual,
        directLaborTotal: directLaborActual,
        grossProfit: grossProfitActual,
        overheadCosts: overheadActual,
        operatingIncomeBeforeAllocation: operatingIncomeActual,
        bonusAllocation: bonusActual,
        netContribution: netContributionActual,
        ebita: ebitaActual,
        effectiveMultiplier: netRevenueActual / Math.max(directLaborActual, 1),
        financialBillability: 85 + Math.random() * 5,
      },
    };
  });

const generateOverheadData = () => {
  const categories = [
    'Computer',
    'Travel',
    'Legal',
    'Entertainment',
    'Recruiting',
    'Phone',
    'Consultants',
    'Office Expenses',
    'Insurance',
    'Rent',
    'Training',
    'Utilities',
  ];

  return categories.reduce<Record<string, number[]>>((acc, category) => {
    acc[category] = Array.from({ length: 12 }, () => 8000 + Math.random() * 10000);
    return acc;
  }, {});
};

const generateBookingsData = () => {
  const clients = ['Innovate Corp', 'Quantum Solutions', 'Apex Industries', 'Synergy Group', 'Starlight Ventures'];
  return clients.map((client) => ({
    clientName: client,
    monthlyActuals: Array.from({ length: 12 }, () => 55000 + Math.random() * 90000),
    totalPlan: 900000 + Math.random() * 400000,
  }));
};

const generateDroData = () => {
  const clients = ['Innovate Corp', 'Quantum Solutions', 'Apex Industries', 'Synergy Group', 'Starlight Ventures'];
  return clients
    .map((client) => ({
      clientName: client,
      dro: 30 + Math.random() * 40,
    }))
    .sort((a, b) => b.dro - a.dro);
};

const generateHistoricalData = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, idx) => {
    const year = currentYear - (4 - idx);
    const growth = 0.85 + idx * 0.05;
    const variance = 0.9 + Math.random() * 0.2;
    return {
      year,
      netRevenue: 3900000 * growth * variance,
      grossProfit: 2300000 * growth * variance,
      operatingIncome: 1150000 * growth * variance,
      bookings: 4400000 * growth * variance,
      backlog: 11800000 * growth * variance,
      effectiveMultiplier: 2.1 + idx * 0.07 + Math.random() * 0.1,
      billability: 74 + idx * 2 + Math.random() * 4,
    };
  });
};

const splitIncomeStatement = (data: IncomeStatementMonth[], factor: number) =>
  data.map((month) => ({
    month: month.month,
    plan: Object.fromEntries(
      Object.entries(month.plan).map(([key, value]) => [key, typeof value === 'number' ? value * factor : value]),
    ),
    actual: Object.fromEntries(
      Object.entries(month.actual).map(([key, value]) => [key, typeof value === 'number' ? value * factor : value]),
    ),
  }));

const splitOverhead = (data: Record<string, number[]>, factor: number) =>
  Object.fromEntries(Object.entries(data).map(([category, values]) => [category, values.map((value) => value * factor)]));

const firmwideIncome = generateMonthlyData();
const firmwideOverhead = generateOverheadData();
const firmwideBookings = generateBookingsData();
const firmwideDro = generateDroData();

const FINANCE_DATA: Record<'Firmwide' | 'Business Unit A' | 'Business Unit B', FinanceSnapshot> = {
  Firmwide: {
    incomeStatement: firmwideIncome,
    overhead: firmwideOverhead,
    bookings: firmwideBookings,
    dro: firmwideDro,
    keyStats: { bookings: 4500000, backlog: 12000000 },
    receivables: { currentMonth: { dro: 45, dbo: 25, duo: 20 }, lastMonth: { dro: 42, dbo: 23, duo: 19 } },
  },
  'Business Unit A': {
    incomeStatement: splitIncomeStatement(firmwideIncome, 0.6),
    overhead: splitOverhead(firmwideOverhead, 0.6),
    bookings: firmwideBookings.slice(0, 3).map((b) => ({
      ...b,
      monthlyActuals: b.monthlyActuals.map((value) => value * 0.6),
      totalPlan: b.totalPlan * 0.6,
    })),
    dro: firmwideDro.slice(0, 3),
    keyStats: { bookings: 2700000, backlog: 7200000 },
    receivables: { currentMonth: { dro: 48, dbo: 28, duo: 20 }, lastMonth: { dro: 46, dbo: 26, duo: 20 } },
  },
  'Business Unit B': {
    incomeStatement: splitIncomeStatement(firmwideIncome, 0.4),
    overhead: splitOverhead(firmwideOverhead, 0.4),
    bookings: firmwideBookings.slice(2).map((b) => ({
      ...b,
      monthlyActuals: b.monthlyActuals.map((value) => value * 0.4),
      totalPlan: b.totalPlan * 0.4,
    })),
    dro: firmwideDro.slice(2),
    keyStats: { bookings: 1800000, backlog: 4800000 },
    receivables: { currentMonth: { dro: 41, dbo: 21, duo: 19 }, lastMonth: { dro: 39, dbo: 20, duo: 18 } },
  },
};

const HISTORICAL_DATA = generateHistoricalData();

type IncomeMetric = {
  key: keyof IncomeStatementMonth['plan'];
  label: string;
  indent?: boolean;
  highlight?: boolean;
};

const incomeMetrics: IncomeMetric[] = [
  { key: 'grossRevenue', label: 'Gross Revenue' },
  { key: 'reimbursableCosts', label: 'Reimbursable Costs', indent: true },
  { key: 'netRevenue', label: 'Net Revenue', highlight: true },
  { key: 'directLaborTotal', label: 'Direct Labor (Total)' },
  { key: 'grossProfit', label: 'Gross Profit', highlight: true },
  { key: 'overheadCosts', label: 'Overhead Costs' },
  { key: 'operatingIncomeBeforeAllocation', label: 'Operating Income', highlight: true },
  { key: 'bonusAllocation', label: 'Bonus Allocation' },
  { key: 'netContribution', label: 'Net Contribution', highlight: true },
  { key: 'ebita', label: 'EBITA', highlight: true },
];

function FinancePage() {
  const [selectedUnit, setSelectedUnit] = useState<'Firmwide' | 'Business Unit A' | 'Business Unit B'>('Firmwide');
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  const selectedData = FINANCE_DATA[selectedUnit];

  const metricCards = useMemo(() => {
    const months = selectedData.incomeStatement.slice(0, CURRENT_MONTH_INDEX + 1);
    const ytdActualNet = months.reduce((sum, month) => sum + month.actual.netRevenue, 0);
    const ytdPlanNet = months.reduce((sum, month) => sum + month.plan.netRevenue, 0);
    const currentMonth =
      selectedData.incomeStatement[CURRENT_MONTH_INDEX] ??
      selectedData.incomeStatement[selectedData.incomeStatement.length - 1] ??
      selectedData.incomeStatement[0];

    return [
      {
        label: 'Net Revenue YTD',
        value: formatCurrency(ytdActualNet, { compact: true }),
        badge: formatPercent(((ytdActualNet - ytdPlanNet) / Math.max(ytdPlanNet, 1)) * 100, true),
        icon: DollarSign,
      },
      {
        label: 'Operating Income',
        value: formatCurrency(currentMonth.actual.operatingIncomeBeforeAllocation, { compact: true }),
        subtext:
          currentMonth.actual.operatingIncomeBeforeAllocation >= currentMonth.plan.operatingIncomeBeforeAllocation
            ? 'Above Plan'
            : 'Below Plan',
        icon: TrendingUp,
      },
      {
        label: 'Cash Position',
        value: formatCurrency(selectedData.keyStats.backlog / 6, { compact: true }),
        subtext: '13 Week Forecast',
        icon: PiggyBank,
      },
      {
        label: 'DRO Days',
        value: Math.round(selectedData.receivables.currentMonth.dro).toString(),
        subtext: `${Math.round(
          selectedData.receivables.currentMonth.dro - selectedData.receivables.lastMonth.dro,
        )} vs Last`,
        icon: Clock3,
      },
    ];
  }, [selectedData]);

  const kpiProgress = useMemo(() => {
    const months = selectedData.incomeStatement.slice(0, CURRENT_MONTH_INDEX + 1);
    const totals = months.reduce(
      (acc, month) => {
        acc.netRevenue += month.actual.netRevenue;
        acc.directLabor += month.actual.directLaborTotal;
        acc.operatingIncome += month.actual.operatingIncomeBeforeAllocation;
        acc.billability += month.actual.financialBillability ?? 0;
        acc.count += 1;
        return acc;
      },
      { netRevenue: 0, directLabor: 0, operatingIncome: 0, billability: 0, count: 0 },
    );

    const effectiveMultiplier = totals.netRevenue / Math.max(totals.directLabor, 1);
    const billability = totals.count ? totals.billability / totals.count : 0;
    const ebitaMargin = (totals.operatingIncome / Math.max(totals.netRevenue, 1)) * 100;

    return [
      {
        label: 'Effective Multiplier',
        value: `${effectiveMultiplier.toFixed(1)}x`,
        percent: Math.min(effectiveMultiplier * 30, 100),
      },
      {
        label: 'Billability',
        value: `${billability.toFixed(0)}%`,
        percent: Math.min(billability, 100),
      },
      {
        label: 'EBITA Margin',
        value: `${ebitaMargin.toFixed(1)}%`,
        percent: Math.min(ebitaMargin, 100),
      },
    ];
  }, [selectedData]);

  const aiNarrative = useMemo(() => {
    const months = selectedData.incomeStatement.slice(0, CURRENT_MONTH_INDEX + 1);
    const actualNet = months.reduce((sum, month) => sum + month.actual.netRevenue, 0);
    const planNet = months.reduce((sum, month) => sum + month.plan.netRevenue, 0);
    const actualOperating = months.reduce((sum, month) => sum + month.actual.operatingIncomeBeforeAllocation, 0);
    const planOperating = months.reduce((sum, month) => sum + month.plan.operatingIncomeBeforeAllocation, 0);
    const revenueVariance = ((actualNet - planNet) / Math.max(planNet, 1)) * 100;
    const operatingVariance = ((actualOperating - planOperating) / Math.max(planOperating, 1)) * 100;
    const droChange =
      selectedData.receivables.currentMonth.dro - selectedData.receivables.lastMonth.dro;

    return {
      revenueVariance,
      operatingVariance,
      droChange,
      summary:
        revenueVariance >= 0
          ? `Revenue tracking ${revenueVariance.toFixed(
              1,
            )}% above plan with strength led by ${selectedData.bookings[0]?.clientName ?? 'priority clients'}.`
          : `Revenue is ${Math.abs(revenueVariance).toFixed(
              1,
            )}% below plan; accelerate backlog conversion and protect margins.`,
      actions: [
        'Re-align overhead allocations to keep operating margin targets on track.',
        'Trigger collections sprint for accounts above the 45 day DRO threshold.',
        `Reforecast ${selectedUnit} pipeline to understand Q4 exposure.`,
      ],
    };
  }, [selectedData, selectedUnit]);

  const ytdSummary = useMemo(() => {
    const months = selectedData.incomeStatement.slice(0, CURRENT_MONTH_INDEX + 1);
    const sumPlan = (key: keyof IncomeStatementMonth['plan']) =>
      months.reduce((sum, month) => sum + (month.plan[key] ?? 0), 0);
    const sumActual = (key: keyof IncomeStatementMonth['plan']) =>
      months.reduce((sum, month) => sum + (month.actual[key] ?? 0), 0);

    return {
      netRevenue: {
        actual: sumActual('netRevenue'),
        plan: sumPlan('netRevenue'),
      },
      operatingIncome: {
        actual: sumActual('operatingIncomeBeforeAllocation'),
        plan: sumPlan('operatingIncomeBeforeAllocation'),
      },
      ebita: {
        actual: sumActual('ebita'),
        plan: sumPlan('ebita'),
      },
    };
  }, [selectedData]);

  const overheadTableData = useMemo(() => {
    const monthsConsidered = Math.max(CURRENT_MONTH_INDEX + 1, 1);
    const entries = Object.entries(selectedData.overhead).map(([category, values]) => {
      const ytd = values.slice(0, monthsConsidered).reduce((sum, value) => sum + value, 0);
      const avg = ytd / monthsConsidered;
      return { category, ytd, avg };
    });

    entries.sort((a, b) => b.ytd - a.ytd);

    const total = entries.reduce((sum, item) => sum + item.ytd, 0);
    const topCategory = entries.length ? entries[0] : null;
    const trailingCategory = entries.length ? entries[entries.length - 1] : null;

    return { entries, total, topCategory, trailingCategory };
  }, [selectedData.overhead]);

  const bookingsProgress = useMemo(() => {
    const monthsConsidered = Math.max(CURRENT_MONTH_INDEX + 1, 1);
    const items = selectedData.bookings.map((booking) => {
      const ytdActual = booking.monthlyActuals.slice(0, monthsConsidered).reduce((sum, value) => sum + value, 0);
      const progress = Math.min((ytdActual / Math.max(booking.totalPlan, 1)) * 100, 100);
      const remaining = Math.max(booking.totalPlan - ytdActual, 0);
      return { booking, ytdActual, progress, remaining };
    });

    const sorted = [...items].sort((a, b) => b.progress - a.progress);
    const averageProgress = items.length ? items.reduce((sum, item) => sum + item.progress, 0) / items.length : 0;
    const leader = sorted.length ? sorted[0] : null;
    const trailing = sorted.length ? sorted[sorted.length - 1] : null;

    return { items, averageProgress, leader, trailing };
  }, [selectedData.bookings]);

  const handleAiQuery = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!aiQuery.trim()) return;
    setIsThinking(true);
    setTimeout(() => {
      const response = `Quick insight: Revenue variance is ${aiNarrative.revenueVariance.toFixed(
        1,
      )}%, operating variance is ${aiNarrative.operatingVariance.toFixed(1)}%, and current DRO is ${selectedData.receivables.currentMonth.dro.toFixed(
        0,
      )} days. Focus on ${selectedData.bookings[0]?.clientName ?? 'top accounts'} for immediate impact.`;
      setAiResponse(response);
      setIsThinking(false);
      setAiQuery('');
    }, 600);
  };

  const topClients = useMemo(() => selectedData.dro.slice(0, 5), [selectedData.dro]);

  return (
    <div className="min-h-screen w-full bg-[#F5F7FB] font-[Outfit] text-[#101828]">
      <div className="flex w-full flex-col gap-8 px-6 py-8">
        <header className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex flex-col gap-3">
            <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <Link to="/" className="flex items-center gap-1 text-slate-500 transition hover:text-[#161950]">
                Dashboard
              </Link>
              <span className="text-slate-400">/</span>
              <span className="text-slate-700">Finance</span>
            </nav>
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">Finance Dashboard</h1>
              <p className="text-sm text-slate-500">
                AI-assisted insight into budgets, profitability, cash flow, and forecasting.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/module/finance/planning"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#161950] px-6 text-xs font-semibold uppercase tracking-wide text-white shadow transition hover:shadow-lg hover:shadow-slate-900/25"
            >
              AI Budget Planning
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#161950] bg-white px-6 text-xs font-semibold uppercase tracking-wide text-[#161950] shadow transition hover:bg-[#161950] hover:text-white hover:shadow-lg hover:shadow-slate-900/25">
              Run AI Analysis
              <Brain className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="flex flex-wrap items-center gap-3">
          {(['Firmwide', 'Business Unit A', 'Business Unit B'] as const).map((unit) => (
            <button
              key={unit}
              onClick={() => setSelectedUnit(unit)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                selectedUnit === unit
                  ? 'border-[#161950] bg-[#161950]/10 text-[#161950]'
                  : 'border-slate-100 bg-white text-slate-600 hover:border-[#161950]/40 hover:text-[#161950]'
              }`}
            >
              {unit}
            </button>
          ))}
        </div>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((metric) => (
            <div
              key={metric.label}
              className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_18px_32px_-24px_rgba(15,23,42,0.4)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{metric.label}</span>
                <div className="rounded-lg bg-[#161950]/10 p-2">
                  <metric.icon className="h-5 w-5 text-[#161950]" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-slate-900">{metric.value}</span>
                {metric.badge ? (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                    {metric.badge}
                  </span>
                ) : metric.subtext ? (
                  <span className="text-sm font-medium text-slate-600">{metric.subtext}</span>
                ) : null}
              </div>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Top Clients by DRO</h2>
                <p className="text-sm text-slate-500">Prioritise collection focus on the slowest-paying accounts.</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#161950]/10 px-3 py-1 text-xs font-semibold text-[#161950]">
                <ChartLine className="h-3.5 w-3.5" />
                Collection Focus
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {topClients.map((client) => (
                <div
                  key={client.clientName}
                  className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-4 text-sm shadow-sm transition hover:border-[#161950]/40 hover:shadow-[0_18px_32px_-24px_rgba(22,25,80,0.35)]"
                >
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-medium">{client.clientName}</span>
                    <span
                      className={`text-sm font-semibold ${
                        client.dro > 55 ? 'text-rose-600' : client.dro > 45 ? 'text-amber-500' : 'text-emerald-600'
                      }`}
                    >
                      {client.dro.toFixed(0)} days
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    Recommendation: schedule an executive touchpoint and automate reminders to pull DR down below 40.
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6 overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)]">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Financial KPIs</h2>
                <p className="text-sm text-slate-500">Smart tracking of utilization and profitability targets.</p>
              </div>
              <Brain className="h-5 w-5 text-[#161950]" />
            </div>
            <div className="flex flex-col gap-6">
              {kpiProgress.map((kpi) => (
                <div key={kpi.label} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-medium text-slate-700">{kpi.label}</span>
                    <span className="text-base font-medium text-slate-700">{kpi.value}</span>
                  </div>
                  <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[#161950]/15">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-[#161950]"
                      style={{ width: `${kpi.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-[#161950]/10 p-2">
                  <Brain className="h-4 w-4 text-[#161950]" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-800">AI Budget Planning</p>
                  <p className="text-sm text-slate-500">
                    Forecast cash requirements and variance risks 13 weeks ahead with scenario analysis.
                  </p>
                  <Link
                    to="/module/finance/planning"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#161950] transition hover:text-[#0f133f]"
                  >
                    Open AI Budget Planner
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">AI-Powered Budgeting Suite</h2>
              <p className="text-sm text-slate-500">
                AI-driven forecasts, scenario modelling, and proactive budgeting alerts across spend categories.
              </p>
            </div>
            <Link
              to="/module/finance/planning"
              className="inline-flex items-center gap-2 rounded-xl border border-[#161950]/30 bg-[#161950]/10 px-4 py-2 text-sm font-semibold text-[#161950] transition hover:border-[#161950]/50 hover:bg-[#161950]/15"
            >
              Explore Budget Workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {[
              {
                label: 'Forecast Accuracy',
                value: '97.3%',
                description: 'AI variance outlook vs historical regression (78%).',
              },
              {
                label: 'Scenario Models',
                value: '3',
                description: 'Conservative, base, and stretch scenarios auto-generated.',
              },
              {
                label: 'Variance Alerts',
                value: 'Early',
                description: 'Predictive signals issued 4 weeks ahead of overruns.',
              },
              {
                label: 'Savings Identified',
                value: '$240K',
                description: 'Annualised savings from procurement renegotiations.',
              },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</div>
                <div className="mt-2 text-2xl font-bold text-slate-900">{item.value}</div>
                <p className="mt-2 text-xs text-slate-500">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">AI-Enhanced Income Statement</h2>
              <span className="rounded-full bg-[#161950]/10 px-3 py-1 text-xs font-semibold text-[#161950]">Narrative</span>
            </div>
            <div className="grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Revenue Variance</p>
                <p className={`text-lg font-semibold ${aiNarrative.revenueVariance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {aiNarrative.revenueVariance.toFixed(1)}%
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Operating Variance</p>
                <p className={`text-lg font-semibold ${aiNarrative.operatingVariance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {aiNarrative.operatingVariance.toFixed(1)}%
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">DRO Movement</p>
                <p className={`text-lg font-semibold ${aiNarrative.droChange <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {aiNarrative.droChange.toFixed(1)} days
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600">{aiNarrative.summary}</p>
            <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-3">
              {aiNarrative.actions.map((action) => (
                <div
                  key={action}
                  className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 shadow-sm"
                >
                  <span className="mt-1 inline-flex size-2 rounded-full bg-[#161950]" />
                  <p>{action}</p>
                </div>
              ))}
            </div>
        </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)]">
            <h2 className="text-lg font-semibold text-slate-900">AI Variance Analysis</h2>
            <p className="text-sm text-slate-500">
              Automated variance breakdown and recommended playbook for {selectedUnit}.
            </p>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 shadow-sm">
                <span>Revenue vs Plan</span>
                <span className={aiNarrative.revenueVariance >= 0 ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
                  {aiNarrative.revenueVariance.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 shadow-sm">
                <span>Operating vs Plan</span>
                <span className={aiNarrative.operatingVariance >= 0 ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
                  {aiNarrative.operatingVariance.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 shadow-sm">
                <span>DRO Change</span>
                <span className={aiNarrative.droChange <= 0 ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
                  {aiNarrative.droChange.toFixed(1)} days
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              Einstein tip: pairing pricing discipline with accelerated invoicing yields fastest impact to margin recovery.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)]">
            <h2 className="text-lg font-semibold text-slate-900">Business Unit Performance</h2>
            <p className="text-sm text-slate-500">Contribution to revenue and operating income across the portfolio.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {(['Firmwide', 'Business Unit A', 'Business Unit B'] as const).map((unit) => {
                const data = FINANCE_DATA[unit];
                const ytdNet = data.incomeStatement
                  .slice(0, CURRENT_MONTH_INDEX + 1)
                  .reduce((sum, month) => sum + month.actual.netRevenue, 0);
                const ytdOperating = data.incomeStatement
                  .slice(0, CURRENT_MONTH_INDEX + 1)
                  .reduce((sum, month) => sum + month.actual.operatingIncomeBeforeAllocation, 0);
                const firmwideNet = FINANCE_DATA.Firmwide.incomeStatement
                  .slice(0, CURRENT_MONTH_INDEX + 1)
                  .reduce((sum, month) => sum + month.actual.netRevenue, 0);

                return (
                  <div
                    key={unit}
                    className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm shadow-sm transition hover:border-[#161950]/40 hover:shadow-[0_18px_32px_-24px_rgba(22,25,80,0.35)]"
                  >
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-semibold">{unit}</span>
                      <span>{formatCurrency(ytdNet, { compact: true })}</span>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Net Revenue Share</span>
                        <span>{((ytdNet / Math.max(firmwideNet, 1)) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="relative mt-1 h-2 rounded-full bg-slate-200">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full bg-[#161950]"
                          style={{ width: `${(ytdNet / Math.max(firmwideNet, 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Operating Income</span>
                        <span>{formatCurrency(ytdOperating, { compact: true })}</span>
                      </div>
                      <div className="relative mt-1 h-2 rounded-full bg-slate-200">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full bg-emerald-500"
                          style={{ width: `${Math.min((ytdOperating / Math.max(ytdNet, 1)) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)]">
            <h2 className="text-lg font-semibold text-slate-900">Receivables Snapshot</h2>
            <p className="text-sm text-slate-500">Monitor cash conversion across billing stages.</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                {
                  label: 'DRO',
                  current: selectedData.receivables.currentMonth.dro,
                  previous: selectedData.receivables.lastMonth.dro,
                },
                {
                  label: 'DBO',
                  current: selectedData.receivables.currentMonth.dbo,
                  previous: selectedData.receivables.lastMonth.dbo,
                },
                {
                  label: 'DUO',
                  current: selectedData.receivables.currentMonth.duo,
                  previous: selectedData.receivables.lastMonth.duo,
                },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="flex flex-col gap-1 rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm shadow-sm"
                >
                  <span className="text-xs uppercase text-slate-500">{metric.label}</span>
                  <span className="text-2xl font-semibold text-slate-900">{metric.current.toFixed(0)}</span>
                  <span
                    className={`text-xs ${
                      metric.current - metric.previous <= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {metric.current - metric.previous >= 0 ? '+' : ''}
                    {(metric.current - metric.previous).toFixed(1)} vs last
                  </span>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600 shadow-sm">
              Cash acceleration opportunity: automate reminder cadence for accounts above 45 days and schedule exec
              outreach this week.
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Detailed Income Statement (Monthly)</h2>
              <p className="text-sm text-slate-500">
                Month-by-month performance with YTD targets for {selectedUnit}.
              </p>
            </div>
            <div className="grid gap-3 text-right text-sm text-slate-600 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-2 shadow-sm">
                <p className="text-xs uppercase text-slate-500">Net Revenue</p>
                <p className="font-semibold text-slate-900">{formatCurrency(ytdSummary.netRevenue.actual)}</p>
                <p className="text-xs">
                  Plan {formatCurrency(ytdSummary.netRevenue.plan)} (
                  {formatPercent(
                    ((ytdSummary.netRevenue.actual - ytdSummary.netRevenue.plan) /
                      Math.max(ytdSummary.netRevenue.plan, 1)) *
                      100,
                    true,
                  )}
                  )
                </p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-2 shadow-sm">
                <p className="text-xs uppercase text-slate-500">Operating Income</p>
                <p className="font-semibold text-slate-900">{formatCurrency(ytdSummary.operatingIncome.actual)}</p>
                <p className="text-xs">
                  Plan {formatCurrency(ytdSummary.operatingIncome.plan)} (
                  {formatPercent(
                    ((ytdSummary.operatingIncome.actual - ytdSummary.operatingIncome.plan) /
                      Math.max(ytdSummary.operatingIncome.plan, 1)) *
                      100,
                    true,
                  )}
                  )
                </p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-2 shadow-sm">
                <p className="text-xs uppercase text-slate-500">EBITA</p>
                <p className="font-semibold text-slate-900">{formatCurrency(ytdSummary.ebita.actual)}</p>
                <p className="text-xs">
                  Plan {formatCurrency(ytdSummary.ebita.plan)} (
                  {formatPercent(
                    ((ytdSummary.ebita.actual - ytdSummary.ebita.plan) / Math.max(ytdSummary.ebita.plan, 1)) * 100,
                    true,
                  )}
                  )
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm text-slate-600">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase text-slate-500">
                  <th className="sticky left-0 z-10 w-48 bg-slate-50 py-3 pl-4 text-left">Metric</th>
                  {selectedData.incomeStatement.map((month) => (
                    <th key={month.month} className="py-3 text-right">
                      {month.month}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {incomeMetrics.map((metric) => (
                  <tr key={metric.key} className={metric.highlight ? 'bg-slate-50/60 font-semibold text-slate-800' : ''}>
                    <td
                      className={`sticky left-0 z-10 bg-white py-2 pl-4 ${
                        metric.highlight ? 'bg-slate-50/60' : ''
                      } ${metric.indent ? 'pl-8 text-slate-500' : ''}`}
                    >
                      {metric.label}
                    </td>
                    {selectedData.incomeStatement.map((month) => (
                      <td key={`${metric.key}-${month.month}`} className="py-2 text-right">
                        {formatCurrency((month.actual[metric.key] ?? 0) as number)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <section className="flex h-full flex-col gap-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)]">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Overhead Spend by Account Group</h2>
              <p className="text-sm text-slate-500">
                Track indirect cost centres and highlight categories trending above plan.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[#161950]/15 bg-[#161950]/5 px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#161950]">Total Overhead YTD</p>
                <p className="mt-1 text-lg font-semibold text-[#161950]">
                  {formatCurrency(overheadTableData.total)}
                </p>
              </div>
              {overheadTableData.topCategory ? (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Top Category</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{overheadTableData.topCategory.category}</p>
                  <p className="text-xs text-slate-500">
                    {formatCurrency(overheadTableData.topCategory.ytd)} ·{' '}
                    {formatPercent(
                      overheadTableData.total
                        ? (overheadTableData.topCategory.ytd / overheadTableData.total) * 100
                        : 0,
                    )}
                  </p>
                </div>
              ) : null}
              {overheadTableData.trailingCategory ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Least Spend</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {overheadTableData.trailingCategory.category}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatCurrency(overheadTableData.trailingCategory.ytd)} ·{' '}
                    {formatPercent(
                      overheadTableData.total
                        ? (overheadTableData.trailingCategory.ytd / overheadTableData.total) * 100
                        : 0,
                    )}
                  </p>
                </div>
              ) : null}
            </div>
            <div className="flex-1 overflow-hidden rounded-xl border border-slate-100">
              <div className="max-h-[312px] overflow-auto">
                <table className="min-w-full text-sm text-slate-600">
                  <thead className="sticky top-0 bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="py-3 pl-4 text-left">Category</th>
                      <th className="py-3 text-right">YTD Spend</th>
                      <th className="py-3 pr-4 text-right">Monthly Avg</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overheadTableData.entries.map((item) => (
                      <tr key={item.category} className="border-b border-slate-100 last:border-0">
                        <td className="py-2 pl-4">{item.category}</td>
                        <td className="py-2 text-right font-semibold text-slate-800">
                          {formatCurrency(item.ytd)}
                        </td>
                        <td className="py-2 pr-4 text-right text-slate-500">{formatCurrency(item.avg)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="flex h-full flex-col gap-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)]">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">YTD Bookings vs. Total Plan by Client</h2>
              <p className="text-sm text-slate-500">Track bookings attainment across priority clients.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[#161950]/15 bg-[#161950]/5 px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#161950]">Average Attainment</p>
                <p className="mt-1 text-lg font-semibold text-[#161950]">
                  {formatPercent(bookingsProgress.averageProgress)}
                </p>
              </div>
              {bookingsProgress.leader ? (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Leader</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {bookingsProgress.leader.booking.clientName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatPercent(bookingsProgress.leader.progress)} ·{' '}
                    {formatCurrency(bookingsProgress.leader.remaining, { compact: true })} remaining
                  </p>
                </div>
              ) : null}
              {bookingsProgress.trailing ? (
                <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">Needs Attention</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {bookingsProgress.trailing.booking.clientName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatPercent(bookingsProgress.trailing.progress)} ·{' '}
                    {formatCurrency(bookingsProgress.trailing.remaining, { compact: true })} remaining
                  </p>
                </div>
              ) : null}
            </div>
            <div className="flex-1 space-y-4">
              {bookingsProgress.items.map((item) => (
                <div key={item.booking.clientName} className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-medium text-slate-700">
                    <span>{item.booking.clientName}</span>
                    <span>
                      {formatCurrency(item.ytdActual, { compact: true })}{' '}
                      <span className="text-xs font-normal text-slate-500">
                        / {formatCurrency(item.booking.totalPlan, { compact: true })}
                      </span>
                    </span>
                  </div>
                  <div className="relative h-2 overflow-hidden rounded-full bg-[#161950]/15">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-[#161950]"
                      style={{ width: `${item.progress}%` }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-emerald-500"
                      style={{ width: `${Math.max(item.progress - 20, 0)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)]">
          <h2 className="text-lg font-semibold text-slate-900">Year-over-Year Financial Growth</h2>
          <p className="text-sm text-slate-500">Multi-year performance trends and rolling compound growth.</p>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-3 text-left">Metric</th>
                  {HISTORICAL_DATA.map((year) => (
                    <th key={year.year} className="py-3 text-right">
                      {year.year}
                    </th>
                  ))}
                  <th className="py-3 text-right">CAGR</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { key: 'netRevenue', label: 'Net Revenue', formatter: formatCurrency },
                  { key: 'grossProfit', label: 'Gross Profit', formatter: formatCurrency },
                  { key: 'operatingIncome', label: 'Operating Income', formatter: formatCurrency },
                  { key: 'bookings', label: 'Bookings', formatter: formatCurrency },
                  { key: 'billability', label: 'Billability %', formatter: (value: number) => `${value.toFixed(1)}%` },
                  {
                    key: 'effectiveMultiplier',
                    label: 'Effective Multiplier',
                    formatter: (value: number) => `${value.toFixed(2)}x`,
                  },
                ].map((metric) => {
                  const values = HISTORICAL_DATA.map(
                    (year) => year[metric.key as keyof (typeof HISTORICAL_DATA)[number]] as number,
                  );
                  const cagr =
                    values.length > 1
                      ? (Math.pow(values[values.length - 1] / values[0], 1 / (values.length - 1)) - 1) * 100
                      : 0;
                  return (
                    <tr key={metric.key}>
                      <td className="py-2 pr-6">{metric.label}</td>
                      {values.map((value, idx) => (
                        <td key={`${metric.key}-${idx}`} className="py-2 text-right text-slate-500">
                          {metric.formatter(value)}
                        </td>
                      ))}
                      <td className="py-2 text-right font-semibold text-slate-800">
                        {cagr >= 0 ? '+' : ''}
                        {cagr.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)]">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Ask Finance AI</h2>
            <p className="text-sm text-slate-500">
              Quick Q&A trained on this dashboard snapshot. Perfect for what-if checks.
            </p>
          </div>
          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
            <form onSubmit={handleAiQuery} className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  value={aiQuery}
                  onChange={(event) => setAiQuery(event.target.value)}
                  placeholder={`Ask about ${selectedUnit} finances...`}
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-[#161950] focus:outline-none focus:ring-2 focus:ring-[#161950]/20"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#161950] px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#0f133f] disabled:bg-slate-300"
                  disabled={!aiQuery.trim() || isThinking}
                >
                  {isThinking ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Ask
            </button>
              </div>
            </form>
            <div className="mt-4 rounded-lg border border-slate-100 bg-white p-4 text-sm text-slate-700 shadow-sm">
              {aiResponse ? (
                <p>{aiResponse}</p>
              ) : (
                <p className="text-slate-500">Ask a question to get an instant AI-generated insight.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default memo(FinancePage);

