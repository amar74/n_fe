import React, { useState, useMemo, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Clock3, 
  PiggyBank,
  ChartLine,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Brain,
  BarChart3
} from 'lucide-react';
import { useFinanceDashboardSummary, useFinanceBookings, useFinanceOverhead, useFinanceRevenue } from '@/hooks/finance';

type FinanceTabProps = {
  accountId: string;
  accountName?: string;
}

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

export function FinanceTab({ accountId, accountName }: FinanceTabProps) {
  const [isLoadingAccountData, setIsLoadingAccountData] = useState(false);
  const [accountFinancialData, setAccountFinancialData] = useState<any>(null);

  // Fetch account-specific financial data
  const { data: dashboardSummary, isLoading: isLoadingSummary } = useFinanceDashboardSummary(null);
  const { data: bookingsData, isLoading: isLoadingBookings } = useFinanceBookings(null);
  const { data: overheadData, isLoading: isLoadingOverhead } = useFinanceOverhead(null);
  const { data: revenueData, isLoading: isLoadingRevenue } = useFinanceRevenue(null);

  // Fetch account-specific financial summary
  useEffect(() => {
    const fetchAccountFinancialData = async () => {
      try {
        setIsLoadingAccountData(true);
        // Filter bookings by account
        const accountBookings = bookingsData?.records?.filter(
          (record: any) => record.account_id === accountId || record.client_name === accountName
        ) || [];

        // Calculate account-specific metrics
        const ytdActual = accountBookings.reduce((sum: number, r: any) => {
          return sum + (r.ytd_actual ?? r.ytdActual ?? 0);
        }, 0);

        const planTotal = accountBookings.reduce((sum: number, r: any) => {
          return sum + (r.plan_total ?? r.planTotal ?? 0);
        }, 0);

        const remaining = accountBookings.reduce((sum: number, r: any) => {
          return sum + (r.remaining ?? 0);
        }, 0);

        setAccountFinancialData({
          bookings: {
            ytdActual,
            planTotal,
            remaining,
            progress: planTotal > 0 ? (ytdActual / planTotal) * 100 : 0,
            records: accountBookings,
          },
        });
      } catch (error) {
        console.error('Error fetching account financial data:', error);
      } finally {
        setIsLoadingAccountData(false);
      }
    };

    if (bookingsData) {
      fetchAccountFinancialData();
    }
  }, [accountId, accountName, bookingsData]);

  const isLoading = isLoadingSummary || isLoadingBookings || isLoadingOverhead || isLoadingRevenue || isLoadingAccountData;

  // Calculate account-specific metrics
  const accountMetrics = useMemo(() => {
    if (!accountFinancialData) {
      return [
        {
          label: 'YTD Revenue',
          value: formatCurrency(0, { compact: true }),
          icon: DollarSign,
        },
        {
          label: 'Plan Progress',
          value: '0%',
          icon: TrendingUp,
        },
        {
          label: 'Remaining Budget',
          value: formatCurrency(0, { compact: true }),
          icon: PiggyBank,
        },
        {
          label: 'DRO Days',
          value: 'N/A',
          icon: Clock3,
        },
      ];
    }

    const { bookings } = accountFinancialData;
    return [
      {
        label: 'YTD Revenue',
        value: formatCurrency(bookings.ytdActual, { compact: true }),
        icon: DollarSign,
        badge: bookings.progress > 100 ? formatPercent((bookings.progress - 100) * 100, true) : undefined,
      },
      {
        label: 'Plan Progress',
        value: formatPercent(bookings.progress),
        icon: TrendingUp,
        subtext: bookings.progress >= 100 ? 'Above Plan' : 'On Track',
      },
      {
        label: 'Remaining Budget',
        value: formatCurrency(bookings.remaining, { compact: true }),
        icon: PiggyBank,
        subtext: 'To Target',
      },
      {
        label: 'DRO Days',
        value: '45', // Would need account-specific DRO endpoint
        icon: Clock3,
        subtext: 'vs Last Month',
      },
    ];
  }, [accountFinancialData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#161950]" />
        <span className="ml-3 text-base text-slate-600">Loading financial data...</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Financial Overview</h2>
          <p className="text-sm text-slate-500 mt-1">
            Financial metrics and performance for {accountName || 'this account'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {accountMetrics.map((metric) => (
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
      </div>

      {accountFinancialData?.bookings?.records && accountFinancialData.bookings.records.length > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Bookings Progress</h3>
              <p className="text-sm text-slate-500">YTD actuals vs. total plan for this account</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#161950]/10 px-3 py-1 text-xs font-semibold text-[#161950]">
              <ChartLine className="h-3.5 w-3.5" />
              Performance
            </span>
          </div>
          <div className="space-y-4">
            {accountFinancialData.bookings.records.map((record: any, index: number) => {
              const clientName = record.client_name ?? record.clientName ?? 'Unknown';
              const ytdActual = record.ytd_actual ?? record.ytdActual ?? 0;
              const planTotal = record.plan_total ?? record.planTotal ?? 0;
              const progress = planTotal > 0 ? Math.min((ytdActual / planTotal) * 100, 100) : 0;
              const remaining = Math.max(planTotal - ytdActual, 0);

              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-medium text-slate-700">
                    <span>{clientName}</span>
                    <span>
                      {formatCurrency(ytdActual, { compact: true })}{' '}
                      <span className="text-xs font-normal text-slate-500">
                        / {formatCurrency(planTotal, { compact: true })}
                      </span>
                    </span>
                  </div>
                  <div className="relative h-2 overflow-hidden rounded-full bg-[#161950]/15">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-[#161950]"
                      style={{ width: `${progress}%` }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-emerald-500"
                      style={{ width: `${Math.max(progress - 20, 0)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{formatPercent(progress)} complete</span>
                    <span>{formatCurrency(remaining, { compact: true })} remaining</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)]">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Revenue Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
              <span className="text-sm font-medium text-slate-700">YTD Actual Revenue</span>
              <span className="text-base font-semibold text-emerald-600">
                {formatCurrency(accountFinancialData?.bookings?.ytdActual || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
              <span className="text-sm font-medium text-slate-700">Total Plan</span>
              <span className="text-base font-semibold text-slate-800">
                {formatCurrency(accountFinancialData?.bookings?.planTotal || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
              <span className="text-sm font-medium text-slate-700">Variance</span>
              <span className={`text-base font-semibold ${
                (accountFinancialData?.bookings?.ytdActual || 0) >= (accountFinancialData?.bookings?.planTotal || 0)
                  ? 'text-emerald-600'
                  : 'text-rose-600'
              }`}>
                {formatCurrency(
                  (accountFinancialData?.bookings?.ytdActual || 0) - (accountFinancialData?.bookings?.planTotal || 0),
                  { withSign: true }
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)]">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Performance Indicators</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
              <span className="text-sm font-medium text-slate-700">Plan Attainment</span>
              <span className={`text-base font-semibold ${
                (accountFinancialData?.bookings?.progress || 0) >= 100
                  ? 'text-emerald-600'
                  : (accountFinancialData?.bookings?.progress || 0) >= 80
                  ? 'text-amber-600'
                  : 'text-rose-600'
              }`}>
                {formatPercent(accountFinancialData?.bookings?.progress || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
              <span className="text-sm font-medium text-slate-700">Remaining to Target</span>
              <span className="text-base font-semibold text-slate-800">
                {formatCurrency(accountFinancialData?.bookings?.remaining || 0, { compact: true })}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
              <span className="text-sm font-medium text-slate-700">Status</span>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                (accountFinancialData?.bookings?.progress || 0) >= 100
                  ? 'bg-emerald-100 text-emerald-700'
                  : (accountFinancialData?.bookings?.progress || 0) >= 80
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-rose-100 text-rose-700'
              }`}>
                {(accountFinancialData?.bookings?.progress || 0) >= 100 ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    On Track
                  </>
                ) : (accountFinancialData?.bookings?.progress || 0) >= 80 ? (
                  <>
                    <AlertTriangle className="h-3.5 w-3.5" />
                    At Risk
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Behind Plan
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {(!accountFinancialData?.bookings?.records || accountFinancialData.bookings.records.length === 0) && (
        <div className="rounded-2xl border border-slate-100 bg-white p-12 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)]">
          <div className="flex flex-col items-center justify-center text-center">
            <BarChart3 className="h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Financial Data Available</h3>
            <p className="text-sm text-slate-500 max-w-md">
              Financial data for this account will appear here once bookings and revenue data are available.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

