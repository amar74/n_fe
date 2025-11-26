import React from 'react';
import { formatCurrency, formatPercent } from './utils';

interface BusinessUnit {
  name: string;
  revenue: number;
  expense: number;
  profit: number;
  headcount: number;
  margin: string | number;
}

interface BuAllocationTabProps {
  businessUnits: BusinessUnit[];
}

export function BuAllocationTab({ businessUnits }: BuAllocationTabProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-900">Budget Allocation by Business Unit</h3>
        <span className="text-sm font-semibold uppercase tracking-wide text-slate-400">2026 Draft</span>
      </div>
      <div className="mt-4 h-px bg-slate-100" />
      <div className="mt-4 grid gap-4 text-base text-slate-600">
        <div className="grid grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))] gap-4 rounded-lg bg-[#161950]/10 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-[#161950]">
          <span>Business Unit</span>
          <span className="text-right">Revenue Target</span>
          <span className="text-right">Expense Allocation</span>
          <span className="text-right">Target Profit</span>
          <span className="text-right">Headcount</span>
        </div>
        {businessUnits.map((unit) => (
          <div
            key={unit.name}
            className="grid grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))] items-center gap-4 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm transition hover:border-[#161950]/40 hover:shadow-[0_18px_32px_-24px_rgba(22,25,80,0.35)]"
          >
            <div>
              <p className="font-semibold text-slate-800">{unit.name}</p>
              <p className="text-sm text-slate-500">Profit Margin {typeof unit.margin === 'string' ? unit.margin : formatPercent(unit.margin)}</p>
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
}

