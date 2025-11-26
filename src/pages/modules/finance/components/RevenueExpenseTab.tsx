import React from 'react';
import { Edit, Check, Minus, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatCurrency } from './utils';
import type { RevenueLine, ExpenseLine } from './types';

interface RevenueExpenseTabProps {
  revenueLines: RevenueLine[];
  expenseLines: ExpenseLine[];
  isRevenueExpenseEditMode: boolean;
  setIsRevenueExpenseEditMode: (mode: boolean) => void;
  isExpenseBudgetEditMode: boolean;
  setIsExpenseBudgetEditMode: (mode: boolean) => void;
  revenueTotals: { totalTarget: number; totalVariance: number };
  expenseTotals: { totalTarget: number; totalVariance: number };
  updateRevenueTarget: (index: number, target: number) => void;
  updateExpenseTarget: (index: number, target: number) => void;
  onSave: () => void;
}

export function RevenueExpenseTab({
  revenueLines,
  expenseLines,
  isRevenueExpenseEditMode,
  setIsRevenueExpenseEditMode,
  isExpenseBudgetEditMode,
  setIsExpenseBudgetEditMode,
  revenueTotals,
  expenseTotals,
  updateRevenueTarget,
  updateExpenseTarget,
  onSave,
}: RevenueExpenseTabProps) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-900">Revenue Targets</h3>
          <div className="flex items-center gap-3">
          <span className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Total {formatCurrency(revenueTotals.totalTarget)}
          </span>
            {!isRevenueExpenseEditMode ? (
              <button
                onClick={() => setIsRevenueExpenseEditMode(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#161950]/30 bg-[#161950]/10 px-3 py-1.5 text-sm font-semibold uppercase tracking-wide text-[#161950] shadow-sm transition hover:border-[#161950]/50 hover:bg-[#161950]/15"
                type="button"
              >
                <Edit className="h-3.5 w-3.5" />
                Edit
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsRevenueExpenseEditMode(false);
                  onSave();
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-sm font-semibold uppercase tracking-wide text-emerald-700 shadow-sm transition hover:border-emerald-400 hover:bg-emerald-100"
                type="button"
              >
                <Check className="h-3.5 w-3.5" />
                Save
              </button>
            )}
          </div>
        </div>
        <div className="mt-4 h-px bg-slate-100" />
        <div className="mt-4 space-y-4">
          {revenueLines.map((line, index) => (
            <div key={line.label} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex-1" style={{ paddingLeft: `${(line.level || 0) * 24}px` }}>
                <p className={`text-base ${(line.level || 0) > 0 ? 'text-slate-600' : 'font-medium text-slate-700'}`}>
                  {(line.level || 0) > 0 && <span className="mr-2 text-slate-400">└─</span>}
                  {line.label}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {isRevenueExpenseEditMode ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateRevenueTarget(index, line.target - 10000)}
                      className="p-1 rounded border border-slate-300 hover:bg-slate-100 transition-colors"
                      type="button"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <Input
                      type="number"
                      value={line.target || 0}
                      onChange={(e) => {
                        const newValue = parseFloat(e.target.value) || 0;
                        updateRevenueTarget(index, newValue);
                      }}
                      className="w-32 text-center text-base font-semibold"
                      min="0"
                      step="1000"
                    />
                    <button
                      onClick={() => updateRevenueTarget(index, line.target + 10000)}
                      className="p-1 rounded border border-slate-300 hover:bg-slate-100 transition-colors"
                      type="button"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <span className="text-base font-semibold text-emerald-600 w-32 text-right">
                    {formatCurrency(line.target || 0)}
                </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 h-px bg-slate-100" />
        <div className="mt-4 flex items-center justify-between text-base font-semibold text-slate-700">
          <span>Total Revenue Target</span>
          <span className="text-emerald-600">{formatCurrency(revenueTotals.totalTarget)}</span>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-900">Expense Budgets</h3>
          <div className="flex items-center gap-3">
          <span className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Total {formatCurrency(expenseTotals.totalTarget)}
          </span>
            {!isExpenseBudgetEditMode ? (
              <button
                onClick={() => setIsExpenseBudgetEditMode(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#161950]/30 bg-[#161950]/10 px-3 py-1.5 text-sm font-semibold uppercase tracking-wide text-[#161950] shadow-sm transition hover:border-[#161950]/50 hover:bg-[#161950]/15"
                type="button"
              >
                <Edit className="h-3.5 w-3.5" />
                Edit
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsExpenseBudgetEditMode(false);
                  onSave();
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-sm font-semibold uppercase tracking-wide text-emerald-700 shadow-sm transition hover:border-emerald-400 hover:bg-emerald-100"
                type="button"
              >
                <Check className="h-3.5 w-3.5" />
                Save
              </button>
            )}
          </div>
        </div>
        <div className="mt-4 h-px bg-slate-100" />
        <div className="mt-4 space-y-4">
          {expenseLines.map((line, index) => (
            <div key={line.label} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
              <p className={`text-base flex-1 ${(line.level || 0) > 0 ? 'text-slate-600' : 'font-medium text-slate-700'}`} style={{ paddingLeft: `${(line.level || 0) * 24}px` }}>
                {(line.level || 0) > 0 && <span className="mr-2 text-slate-400">└─</span>}
                {line.label}
              </p>
              <div className="flex items-center gap-4">
                {isExpenseBudgetEditMode ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateExpenseTarget(index, line.target - 10000)}
                      className="p-1 rounded border border-slate-300 hover:bg-slate-100 transition-colors"
                      type="button"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <Input
                      type="number"
                      value={line.target || 0}
                      onChange={(e) => {
                        const newValue = parseFloat(e.target.value) || 0;
                        updateExpenseTarget(index, newValue);
                      }}
                      className="w-32 text-center text-base font-semibold"
                      min="0"
                      step="1000"
                    />
                    <button
                      onClick={() => updateExpenseTarget(index, line.target + 10000)}
                      className="p-1 rounded border border-slate-300 hover:bg-slate-100 transition-colors"
                      type="button"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <span className="text-base font-semibold text-rose-600 w-32 text-right">
                    {formatCurrency(line.target || 0)}
                </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 h-px bg-slate-100" />
        <div className="mt-4 flex items-center justify-between text-base font-semibold text-slate-700">
          <span>Total Expense Budget</span>
          <span className="text-rose-600">{formatCurrency(expenseTotals.totalTarget)}</span>
        </div>
      </div>
    </div>
  );
}