import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardList, ChevronRight, Edit, Check, X, FileDown, History, CheckCircle2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from './utils';
import type { AnnualMetric } from './types';

interface AnnualBudgetTabProps {
  annualMetrics: AnnualMetric[];
  aiHighlights: Array<{ title: string; detail: string; tone?: string }>;
  budgetYear: string;
  displayBudgetYear: string;
  setBudgetYear: (year: string) => void;
  targetGrowthRate: number;
  setTargetGrowthRate: (rate: number) => void;
  totalRevenueTarget: number;
  setTotalRevenueTarget: (target: number) => void;
  totalExpenseBudget: number;
  setTotalExpenseBudget: (budget: number) => void;
  copyFromYear: string;
  setCopyFromYear: (year: string) => void;
  isRevenueEditable: boolean;
  setIsRevenueEditable: (editable: boolean) => void;
  isExpenseEditable: boolean;
  setIsExpenseEditable: (editable: boolean) => void;
  revenueTotals: { totalTarget: number; totalVariance: number };
  expenseTotals: { totalTarget: number; totalVariance: number };
  handleSaveBudget: () => void;
  handleCopyFromYear: () => void;
  handleReviewPreviousYear: () => void;
  budgetStatus?: string;
  budgetId?: number;
  onSubmitForApproval?: () => Promise<void>;
  isSubmitting?: boolean;
}

export function AnnualBudgetTab({
  annualMetrics,
  aiHighlights,
  budgetYear,
  displayBudgetYear,
  setBudgetYear,
  targetGrowthRate,
  setTargetGrowthRate,
  totalRevenueTarget,
  setTotalRevenueTarget,
  totalExpenseBudget,
  setTotalExpenseBudget,
  copyFromYear,
  setCopyFromYear,
  isRevenueEditable,
  setIsRevenueEditable,
  isExpenseEditable,
  setIsExpenseEditable,
  revenueTotals,
  expenseTotals,
  handleSaveBudget,
  handleCopyFromYear,
  handleReviewPreviousYear,
  budgetStatus = 'draft',
  budgetId,
  onSubmitForApproval,
  isSubmitting = false,
}: AnnualBudgetTabProps) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-900">Budget Summary</h3>
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${
            budgetStatus === 'draft' ? 'bg-slate-100 text-slate-700' :
            budgetStatus === 'pending' || budgetStatus === 'submitted' || budgetStatus === 'in_review' ? 'bg-blue-100 text-blue-700' :
            budgetStatus === 'approved' || budgetStatus === 'active' ? 'bg-emerald-100 text-emerald-700' :
            budgetStatus === 'rejected' ? 'bg-rose-100 text-rose-700' :
            'bg-slate-100 text-slate-700'
          }`}>
            <ClipboardList className="h-3.5 w-3.5" />
            {budgetStatus === 'active' ? 'Active' : budgetStatus || 'draft'}
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Working year:&nbsp;
          <span className="font-semibold text-slate-800">{displayBudgetYear || 'Most Recent'}</span>
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {annualMetrics.map((metric) => (
            <div
              key={metric.label}
              className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-5 shadow-sm"
            >
              <span className="text-sm font-semibold uppercase tracking-wide text-slate-500">{metric.label}</span>
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
        
        {/* AI Highlights - Display in one row */}
        {aiHighlights && aiHighlights.length > 0 && (
          <div className="mt-6">
            <h4 className="mb-3 text-base font-semibold text-slate-900">AI Insights</h4>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {aiHighlights.map((highlight, idx) => (
                <div
                  key={idx}
                  className={[
                    'rounded-xl border px-4 py-3 text-sm',
                    highlight.tone === 'positive' && 'border-emerald-200 bg-emerald-50',
                    highlight.tone === 'warning' && 'border-amber-200 bg-amber-50',
                    highlight.tone === 'critical' && 'border-rose-200 bg-rose-50',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <p className="font-semibold text-slate-900">{highlight.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{highlight.detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
        <h3 className="text-xl font-semibold text-slate-900">Budget Parameters</h3>
        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold uppercase tracking-wide text-slate-500">Budget Year</label>
            <Select value={budgetYear || 'recent'} onValueChange={(value) => setBudgetYear(value === 'recent' ? '' : value)}>
              <SelectTrigger className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-700 shadow-sm transition hover:border-[#161950]/40">
                <SelectValue placeholder="Most Recent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2027">2027</SelectItem>
                <SelectItem value="2028">2028</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Quick Copy from Previous Year
            </label>
            <div className="flex gap-2">
              <Select value={copyFromYear} onValueChange={setCopyFromYear}>
                <SelectTrigger className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-base font-medium shadow-sm transition hover:border-[#161950]/40">
                  <SelectValue placeholder="Select year to copy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
              <button 
                onClick={handleCopyFromYear}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#161950]/30 bg-[#161950]/10 px-4 text-sm font-semibold uppercase tracking-wide text-[#161950] shadow-sm transition hover:border-[#161950]/50 hover:bg-[#161950]/15"
              >
                <FileDown className="h-4 w-4" />
                Copy
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Target Growth Rate (%)
              </label>
              <Input
                type="number"
                value={targetGrowthRate}
                onChange={(e) => setTargetGrowthRate(parseFloat(e.target.value) || 0)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-600 shadow-sm"
                min="0"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
              <label className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Total Revenue Target
              </label>
                {!isRevenueEditable ? (
                  <button
                    onClick={() => setIsRevenueEditable(true)}
                    className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 transition-colors"
                    type="button"
                  >
                    <Edit className="h-3.5 w-3.5 text-slate-600" />
                  </button>
                ) : (
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setIsRevenueEditable(false);
                        setTotalRevenueTarget(revenueTotals.totalTarget);
                      }}
                      className="p-1.5 rounded-lg border border-emerald-300 hover:bg-emerald-100 transition-colors"
                      type="button"
                    >
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    </button>
                    <button
                      onClick={() => {
                        setIsRevenueEditable(false);
                        setTotalRevenueTarget(revenueTotals.totalTarget);
                      }}
                      className="p-1.5 rounded-lg border border-rose-300 hover:bg-rose-100 transition-colors"
                      type="button"
                    >
                      <X className="h-3.5 w-3.5 text-rose-600" />
                    </button>
              </div>
                )}
              </div>
              {isRevenueEditable ? (
                <Input
                  type="number"
                  value={totalRevenueTarget}
                  onChange={(e) => setTotalRevenueTarget(parseFloat(e.target.value) || 0)}
                  className="h-11 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-base font-semibold text-emerald-600 shadow-sm"
                  min="0"
                  step="1000"
                />
              ) : (
                <div className="h-11 flex items-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-base font-semibold text-emerald-600 shadow-sm">
                  {formatCurrency(totalRevenueTarget)}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
              <label className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Total Expense Budget
              </label>
                {!isExpenseEditable ? (
                  <button
                    onClick={() => setIsExpenseEditable(true)}
                    className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 transition-colors"
                    type="button"
                  >
                    <Edit className="h-3.5 w-3.5 text-slate-600" />
                  </button>
                ) : (
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setIsExpenseEditable(false);
                        setTotalExpenseBudget(expenseTotals.totalTarget);
                      }}
                      className="p-1.5 rounded-lg border border-emerald-300 hover:bg-emerald-100 transition-colors"
                      type="button"
                    >
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    </button>
                    <button
                      onClick={() => {
                        setIsExpenseEditable(false);
                        setTotalExpenseBudget(expenseTotals.totalTarget);
                      }}
                      className="p-1.5 rounded-lg border border-rose-300 hover:bg-rose-100 transition-colors"
                      type="button"
                    >
                      <X className="h-3.5 w-3.5 text-rose-600" />
                    </button>
              </div>
                )}
              </div>
              {isExpenseEditable ? (
                <Input
                  type="number"
                  value={totalExpenseBudget}
                  onChange={(e) => setTotalExpenseBudget(parseFloat(e.target.value) || 0)}
                  className="h-11 rounded-xl border border-rose-200 bg-rose-50 px-4 text-base font-semibold text-rose-600 shadow-sm"
                  min="0"
                  step="1000"
                />
              ) : (
                <div className="h-11 flex items-center rounded-xl border border-rose-200 bg-rose-50 px-4 text-base font-semibold text-rose-600 shadow-sm">
                  {formatCurrency(totalExpenseBudget)}
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={handleSaveBudget}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#161950] text-sm font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#0f133f]"
          >
            <ArrowRight className="h-4 w-4" />
            Save Budget
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)] lg:col-span-2">
        <h3 className="text-xl font-semibold text-slate-900">AI Budgeting Assistant</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">AI Forecast Confidence</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">97.3%</p>
            <p className="mt-1 text-sm text-slate-500">AI variance outlook vs baseline models.</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Scenario Models</p>
              <p className="mt-2 text-3xl font-bold text-[#161950]">3 Active</p>
            <p className="mt-1 text-sm text-slate-500">Base, stretch, and contingency options ready.</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">OpEx Savings</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">$240K</p>
            <p className="mt-1 text-sm text-slate-500">AI-flagged contract renegotiations.</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button 
            onClick={handleReviewPreviousYear}
            className="group h-10 bg-white/0 outline outline-1 outline-offset-[-1px] outline-indigo-950 inline-flex items-center gap-2.5 rounded-xl border border-[#161950] bg-white px-4 py-2 text-sm font-semibold uppercase tracking-wide text-[#161950] shadow-sm transition hover:bg-[#161950] hover:text-white"
          >
            <History className="h-4 w-4 text-[#161950] transition group-hover:text-white" />
            Review Previous Year
          </button>
          {/* Submit for Approval Button - Show if budget exists and is in draft status (or status unknown) */}
          {/* Show button if: budgetId exists OR we have budget data, AND status is NOT already submitted/approved/active/rejected, AND handler exists */}
          {(() => {
            const hasBudgetData = !!(budgetId || revenueTotals.totalTarget > 0 || expenseTotals.totalTarget > 0 || totalRevenueTarget > 0 || totalExpenseBudget > 0);
            const submittedStates = ['pending', 'submitted', 'in_review', 'approved', 'active', 'rejected'];
            const isNotSubmitted = !budgetStatus || !submittedStates.includes(budgetStatus);
            const shouldShow = hasBudgetData && isNotSubmitted && !!onSubmitForApproval;
            
            // Debug logging (remove in production)
            if (process.env.NODE_ENV === 'development') {
              console.log('Submit Button Debug:', {
                hasBudgetData,
                budgetStatus,
                isNotSubmitted,
                hasHandler: !!onSubmitForApproval,
                shouldShow,
                budgetId,
                revenueTotal: revenueTotals.totalTarget,
                expenseTotal: expenseTotals.totalTarget,
                totalRevenue: totalRevenueTarget,
                totalExpense: totalExpenseBudget
              });
            }
            
            return shouldShow;
          })() && (
            <button 
              onClick={onSubmitForApproval}
              disabled={isSubmitting}
              className="group h-10 inline-flex items-center gap-2.5 rounded-xl border-2 border-emerald-500 bg-emerald-50 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-emerald-700 shadow-sm transition hover:bg-emerald-100 hover:border-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Submit for Approval
                </>
              )}
            </button>
          )}
          <Link
            to="/module/finance"
            className="group h-10 bg-[#161950] outline outline-1 outline-offset-[-1px] outline-indigo-950 inline-flex items-center gap-2.5 rounded-xl border border-[#161950] px-4 py-2 text-sm font-semibold uppercase tracking-wide shadow-sm transition text-white hover:text-white"
          >
            Launch Finance Dashboard
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

