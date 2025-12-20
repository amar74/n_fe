import React, { useState, useEffect } from 'react';
import { Settings2, Sparkles, ChevronDown, Edit, Check, X, FileText, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { VARIANCE_THRESHOLDS, REPORTING_SCHEDULE } from './constants';
import { formatCurrency } from './utils';
import type { VarianceThreshold } from './types';

interface VarianceExplanation {
  category: 'revenue' | 'expense' | 'profit';
  explanation: string;
  rootCause: string;
  actionPlan: string;
}

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
  // Optional: actual amounts (if available from backend)
  revenueActual?: number;
  expenseActual?: number;
  profitActual?: number;
  // Optional: explanations (if stored in backend)
  explanations?: VarianceExplanation[];
  onSaveExplanations?: (explanations: VarianceExplanation[]) => void;
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
  revenueActual,
  expenseActual,
  profitActual,
  explanations = [],
  onSaveExplanations,
}: VarianceTabProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isReportingEditMode, setIsReportingEditMode] = useState(false);
  const [isExplanationEditMode, setIsExplanationEditMode] = useState(false);
  const [editableThresholds, setEditableThresholds] = useState<VarianceThreshold[]>(varianceThresholds);
  const [editableSchedule, setEditableSchedule] = useState(reportingSchedule);
  const [isSaving, setIsSaving] = useState(false);
  
  // Calculate actual amounts (use provided or calculate from variance)
  const calculatedRevenueActual = revenueActual ?? (revenueTarget + revenueVariance);
  const calculatedExpenseActual = expenseActual ?? (expenseBudget + expenseVariance);
  const calculatedProfitActual = profitActual ?? (targetProfit + profitVariance);
  
  // Initialize explanations state
  const [editableExplanations, setEditableExplanations] = useState<VarianceExplanation[]>(() => {
    if (explanations.length > 0) {
      return explanations;
    }
    // Initialize with empty explanations
    return [
      { category: 'revenue', explanation: '', rootCause: '', actionPlan: '' },
      { category: 'expense', explanation: '', rootCause: '', actionPlan: '' },
      { category: 'profit', explanation: '', rootCause: '', actionPlan: '' },
    ];
  });

  useEffect(() => {
    setEditableThresholds(varianceThresholds);
  }, [varianceThresholds]);

  useEffect(() => {
    setEditableSchedule(reportingSchedule);
  }, [reportingSchedule]);

  useEffect(() => {
    if (explanations.length > 0) {
      setEditableExplanations(explanations);
    }
  }, [explanations]);

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

  const handleSaveExplanations = async () => {
    setIsSaving(true);
    try {
      if (onSaveExplanations) {
        await onSaveExplanations(editableExplanations);
      }
      setIsExplanationEditMode(false);
    } catch (error) {
      console.error('Error saving explanations:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateExplanation = (category: 'revenue' | 'expense' | 'profit', field: 'explanation' | 'rootCause' | 'actionPlan', value: string) => {
    const updated = editableExplanations.map(exp => 
      exp.category === category ? { ...exp, [field]: value } : exp
    );
    setEditableExplanations(updated);
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
        
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-700">Budget vs Actual Comparison</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-3 font-semibold text-slate-700">Category</th>
                  <th className="text-right py-2 px-3 font-semibold text-slate-700">Budget</th>
                  <th className="text-right py-2 px-3 font-semibold text-slate-700">Actual</th>
                  <th className="text-right py-2 px-3 font-semibold text-slate-700">Variance</th>
                  <th className="text-right py-2 px-3 font-semibold text-slate-700">Variance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className={revenueExceedsThreshold ? 'bg-rose-50' : ''}>
                  <td className="py-2 px-3 font-medium text-slate-700">Revenue</td>
                  <td className="py-2 px-3 text-right text-slate-600">{formatCurrency(revenueTarget)}</td>
                  <td className="py-2 px-3 text-right text-slate-700 font-medium">{formatCurrency(calculatedRevenueActual)}</td>
                  <td className={`py-2 px-3 text-right font-semibold ${revenueVariance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {revenueVariance >= 0 ? '+' : ''}{formatCurrency(revenueVariance)}
                  </td>
                  <td className={`py-2 px-3 text-right font-semibold ${revenueExceedsThreshold ? 'text-rose-600' : revenueVariancePercent >= 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {revenueVariancePercent >= 0 ? '+' : ''}{revenueVariancePercent.toFixed(2)}%
                  </td>
                </tr>
                <tr className={expenseExceedsThreshold ? 'bg-rose-50' : ''}>
                  <td className="py-2 px-3 font-medium text-slate-700">Expense</td>
                  <td className="py-2 px-3 text-right text-slate-600">{formatCurrency(expenseBudget)}</td>
                  <td className="py-2 px-3 text-right text-slate-700 font-medium">{formatCurrency(calculatedExpenseActual)}</td>
                  <td className={`py-2 px-3 text-right font-semibold ${expenseVariance <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {expenseVariance >= 0 ? '+' : ''}{formatCurrency(expenseVariance)}
                  </td>
                  <td className={`py-2 px-3 text-right font-semibold ${expenseExceedsThreshold ? 'text-rose-600' : expenseVariancePercent <= 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {expenseVariancePercent >= 0 ? '+' : ''}{expenseVariancePercent.toFixed(2)}%
                  </td>
                </tr>
                <tr className={profitExceedsThreshold ? 'bg-rose-50' : ''}>
                  <td className="py-2 px-3 font-medium text-slate-700">Profit</td>
                  <td className="py-2 px-3 text-right text-slate-600">{formatCurrency(targetProfit)}</td>
                  <td className="py-2 px-3 text-right text-slate-700 font-medium">{formatCurrency(calculatedProfitActual)}</td>
                  <td className={`py-2 px-3 text-right font-semibold ${profitVariance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {profitVariance >= 0 ? '+' : ''}{formatCurrency(profitVariance)}
                  </td>
                  <td className={`py-2 px-3 text-right font-semibold ${profitExceedsThreshold ? 'text-rose-600' : profitVariancePercent >= 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {profitVariancePercent >= 0 ? '+' : ''}{profitVariancePercent.toFixed(2)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
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

      <div className="col-span-full rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#161950]" />
            <h3 className="text-xl font-semibold text-slate-900">Variance Explanations</h3>
          </div>
          <div className="flex items-center gap-2">
            {!isExplanationEditMode ? (
              <button
                onClick={() => setIsExplanationEditMode(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#161950]/30 bg-[#161950]/10 px-3 py-1.5 text-sm font-semibold uppercase tracking-wide text-[#161950] shadow-sm transition hover:border-[#161950]/50 hover:bg-[#161950]/15"
              >
                <Edit className="h-3.5 w-3.5" />
                Edit
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setEditableExplanations(explanations.length > 0 ? explanations : editableExplanations);
                    setIsExplanationEditMode(false);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold uppercase tracking-wide text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </button>
                <button
                  onClick={handleSaveExplanations}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-sm font-semibold uppercase tracking-wide text-emerald-700 shadow-sm transition hover:border-emerald-400 hover:bg-emerald-100 disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" />
                  Save
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="mt-6 space-y-6">
          {editableExplanations.map((explanation, index) => {
            const variancePercent = 
              explanation.category === 'revenue' ? revenueVariancePercent :
              explanation.category === 'expense' ? expenseVariancePercent :
              profitVariancePercent;
            
            const exceedsThreshold = 
              explanation.category === 'revenue' ? revenueExceedsThreshold :
              explanation.category === 'expense' ? expenseExceedsThreshold :
              profitExceedsThreshold;

            return (
              <div key={explanation.category} className={`rounded-xl border p-4 ${exceedsThreshold ? 'border-rose-200 bg-rose-50/50' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-base font-semibold text-slate-900 capitalize">
                    {explanation.category} Variance
                    {exceedsThreshold && (
                      <span className="ml-2 inline-flex items-center gap-1 text-xs font-semibold text-rose-600">
                        <AlertCircle className="h-3 w-3" />
                        Exceeds Threshold
                      </span>
                    )}
                  </h4>
                  <span className={`text-sm font-semibold ${exceedsThreshold ? 'text-rose-600' : 'text-slate-600'}`}>
                    {variancePercent >= 0 ? '+' : ''}{variancePercent.toFixed(2)}%
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">
                      Explanation
                    </label>
                    {isExplanationEditMode ? (
                      <Textarea
                        value={explanation.explanation}
                        onChange={(e) => updateExplanation(explanation.category, 'explanation', e.target.value)}
                        placeholder="Explain the variance (e.g., 'Revenue exceeded target due to new client acquisition')"
                        className="min-h-[80px] rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
                      />
                    ) : (
                      <div className="min-h-[60px] rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">
                        {explanation.explanation || <span className="text-slate-400 italic">No explanation provided</span>}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">
                      Root Cause
                    </label>
                    {isExplanationEditMode ? (
                      <Textarea
                        value={explanation.rootCause}
                        onChange={(e) => updateExplanation(explanation.category, 'rootCause', e.target.value)}
                        placeholder="Identify the root cause (e.g., 'Market demand increased', 'Cost overruns in specific category')"
                        className="min-h-[80px] rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
                      />
                    ) : (
                      <div className="min-h-[60px] rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">
                        {explanation.rootCause || <span className="text-slate-400 italic">No root cause identified</span>}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">
                      Action Plan
                    </label>
                    {isExplanationEditMode ? (
                      <Textarea
                        value={explanation.actionPlan}
                        onChange={(e) => updateExplanation(explanation.category, 'actionPlan', e.target.value)}
                        placeholder="Describe the action plan to address the variance (e.g., 'Review spending patterns', 'Adjust budget allocation')"
                        className="min-h-[80px] rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
                      />
                    ) : (
                      <div className="min-h-[60px] rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">
                        {explanation.actionPlan || <span className="text-slate-400 italic">No action plan defined</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

