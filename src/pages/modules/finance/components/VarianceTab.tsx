import React, { useState, useEffect } from 'react';
import { Settings2, Sparkles, ChevronDown, Edit, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VARIANCE_THRESHOLDS, REPORTING_SCHEDULE } from './constants';
import type { VarianceThreshold } from './types';

interface VarianceTabProps {
  varianceThresholds: VarianceThreshold[];
  reportingSchedule: Array<{ label: string; value: string }>;
  onSaveThresholds: (thresholds: VarianceThreshold[]) => void;
  onSaveReporting: (schedule: Array<{ label: string; value: string }>) => void;
  // Data for variance calculation
  revenueTarget: number;
  expenseBudget: number;
  targetProfit: number;
  revenueVariance: number;
  expenseVariance: number;
  profitVariance: number;
}

export function VarianceTab({
  varianceThresholds,
  reportingSchedule,
  onSaveThresholds,
  onSaveReporting,
  revenueTarget,
  expenseBudget,
  targetProfit,
  revenueVariance,
  expenseVariance,
  profitVariance,
}: VarianceTabProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isReportingEditMode, setIsReportingEditMode] = useState(false);
  const [editableThresholds, setEditableThresholds] = useState<VarianceThreshold[]>(varianceThresholds);
  const [editableSchedule, setEditableSchedule] = useState(reportingSchedule);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditableThresholds(varianceThresholds);
  }, [varianceThresholds]);

  useEffect(() => {
    setEditableSchedule(reportingSchedule);
  }, [reportingSchedule]);

  // Calculate variance percentages
  const revenueVariancePercent = revenueTarget > 0 ? (revenueVariance / revenueTarget) * 100 : 0;
  const expenseVariancePercent = expenseBudget > 0 ? (expenseVariance / expenseBudget) * 100 : 0;
  const profitVariancePercent = targetProfit > 0 ? (profitVariance / targetProfit) * 100 : 0;

  // Check if variances exceed thresholds
  const getRevenueThreshold = () => parseFloat(editableThresholds.find(t => t.label.includes('Revenue'))?.valuePercent?.toString() || '5');
  const getExpenseThreshold = () => parseFloat(editableThresholds.find(t => t.label.includes('Expense'))?.valuePercent?.toString() || '10');
  const getProfitThreshold = () => parseFloat(editableThresholds.find(t => t.label.includes('Profit'))?.valuePercent?.toString() || '15');

  const revenueExceedsThreshold = Math.abs(revenueVariancePercent) > getRevenueThreshold();
  const expenseExceedsThreshold = Math.abs(expenseVariancePercent) > getExpenseThreshold();
  const profitExceedsThreshold = Math.abs(profitVariancePercent) > getProfitThreshold();

  const handleSaveThresholds = async () => {
    setIsSaving(true);
    try {
      await onSaveThresholds(editableThresholds);
      setIsEditMode(false);
    } catch (error) {
      console.error('Error saving thresholds:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveReporting = async () => {
    setIsSaving(true);
    try {
      await onSaveReporting(editableSchedule);
      setIsReportingEditMode(false);
    } catch (error) {
      console.error('Error saving reporting schedule:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateThreshold = (index: number, value: string) => {
    const updated = [...editableThresholds];
    updated[index] = {
      ...updated[index],
      valuePercent: parseFloat(value) || 0,
    };
    setEditableThresholds(updated);
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-900">Variance Thresholds</h3>
          <div className="flex items-center gap-2">
            {!isEditMode ? (
              <button
                onClick={() => setIsEditMode(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#161950]/30 bg-[#161950]/10 px-3 py-1.5 text-sm font-semibold uppercase tracking-wide text-[#161950] shadow-sm transition hover:border-[#161950]/50 hover:bg-[#161950]/15"
              >
                <Edit className="h-3.5 w-3.5" />
                Edit
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setEditableThresholds(varianceThresholds);
                    setIsEditMode(false);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold uppercase tracking-wide text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </button>
                <button
                  onClick={handleSaveThresholds}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-sm font-semibold uppercase tracking-wide text-emerald-700 shadow-sm transition hover:border-emerald-400 hover:bg-emerald-100 disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" />
                  Save
                </button>
              </>
            )}
            <Settings2 className="h-4 w-4 text-[#161950]" />
          </div>
        </div>
        <div className="mt-4 space-y-4">
          {editableThresholds.map((threshold, index) => {
            const currentValue = threshold.valuePercent || parseFloat(threshold.value?.replace('%', '') || '0');
            let variancePercent = 0;
            let exceedsThreshold = false;
            
            if (threshold.label.includes('Revenue')) {
              variancePercent = revenueVariancePercent;
              exceedsThreshold = revenueExceedsThreshold;
            } else if (threshold.label.includes('Expense')) {
              variancePercent = expenseVariancePercent;
              exceedsThreshold = expenseExceedsThreshold;
            } else if (threshold.label.includes('Profit')) {
              variancePercent = profitVariancePercent;
              exceedsThreshold = profitExceedsThreshold;
            }

            return (
              <div key={threshold.label}>
                <label className="text-sm font-medium uppercase tracking-wide text-slate-500">
                  {threshold.label}
                </label>
                {isEditMode ? (
                  <div className="mt-2 flex items-center gap-2">
                    <Input
                      type="number"
                      value={currentValue}
                      onChange={(e) => updateThreshold(index, e.target.value)}
                      className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-700 shadow-sm"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <span className="text-base font-medium text-slate-500">%</span>
                  </div>
                ) : (
                  <div className="mt-2 flex h-11 items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-700 shadow-sm">
                    <span>{currentValue}%</span>
                    {exceedsThreshold && (
                      <span className="text-xs font-semibold text-rose-600">
                        Alert: {variancePercent.toFixed(1)}% variance
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Variance Status Display */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700">Current Variance Status</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Revenue Variance:</span>
              <span className={revenueExceedsThreshold ? 'font-semibold text-rose-600' : 'font-medium text-slate-700'}>
                {revenueVariancePercent >= 0 ? '+' : ''}{revenueVariancePercent.toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Expense Variance:</span>
              <span className={expenseExceedsThreshold ? 'font-semibold text-rose-600' : 'font-medium text-slate-700'}>
                {expenseVariancePercent >= 0 ? '+' : ''}{expenseVariancePercent.toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Profit Variance:</span>
              <span className={profitExceedsThreshold ? 'font-semibold text-rose-600' : 'font-medium text-slate-700'}>
                {profitVariancePercent >= 0 ? '+' : ''}{profitVariancePercent.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-900">Reporting Schedule</h3>
          <div className="flex items-center gap-2">
            {!isReportingEditMode ? (
              <button
                onClick={() => setIsReportingEditMode(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#161950]/30 bg-[#161950]/10 px-3 py-1.5 text-sm font-semibold uppercase tracking-wide text-[#161950] shadow-sm transition hover:border-[#161950]/50 hover:bg-[#161950]/15"
              >
                <Edit className="h-3.5 w-3.5" />
                Edit
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setEditableSchedule(reportingSchedule);
                    setIsReportingEditMode(false);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold uppercase tracking-wide text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </button>
                <button
                  onClick={handleSaveReporting}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-sm font-semibold uppercase tracking-wide text-emerald-700 shadow-sm transition hover:border-emerald-400 hover:bg-emerald-100 disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" />
                  Save
                </button>
              </>
            )}
            <Sparkles className="h-4 w-4 text-[#161950]" />
          </div>
        </div>
        <div className="mt-4 space-y-4">
          {editableSchedule.map((item, index) => (
            <div key={item.label}>
              <label className="text-sm font-medium uppercase tracking-wide text-slate-500">{item.label}</label>
              {isReportingEditMode ? (
                <Select
                  value={item.value}
                  onValueChange={(value) => {
                    const updated = [...editableSchedule];
                    updated[index] = { ...updated[index], value };
                    setEditableSchedule(updated);
                  }}
                >
                  <SelectTrigger className="mt-2 h-11 rounded-xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-700 shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {item.label.includes('Frequency') ? (
                      <>
                        <SelectItem value="Daily">Daily</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Quarterly">Quarterly</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                        <SelectItem value="Enabled">Enabled</SelectItem>
                        <SelectItem value="Disabled">Disabled</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              ) : (
                <div className="mt-2 flex h-11 items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-700 shadow-sm">
                  <span>{item.value}</span>
                  <ChevronDown className="h-4 w-4 text-slate-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

