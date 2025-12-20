import { useState, useEffect } from 'react';
import { BarChart3, DollarSign, TrendingUp, Users, Calendar, Target, ArrowUpRight, Info, Sparkles, Brain, Lightbulb, TrendingDown } from 'lucide-react';
import { apiClient } from '@/services/api/client';

interface ProjectInfo {
  projectName: string;
  durationMonths: number;
  overheadRate: number;
  profitMargin: number;
}

interface EscalationPeriod {
  start_month: number;
  end_month: number;
  rate: number;
}

interface StaffMember {
  resourceName: string;
  role: string;
  level: string;
  totalCost: number;
  hourlyRate: number;
  hoursPerWeek: number;
  monthlyCost?: number;
  startMonth: number;
  endMonth: number;
  escalationRate?: number | null;  // Deprecated - use escalationPeriods
  escalationStartMonth?: number;  // Deprecated - use escalationPeriods
  escalationPeriods?: EscalationPeriod[];  // New format: multiple escalation periods
}

interface Props {
  projectInfo: ProjectInfo;
  staffMembers: StaffMember[];
  onNext: () => void;
  onBack: () => void;
}

interface YearlyBreakdown {
  year: number;
  laborCost: number;
  overhead: number;
  totalCost: number;
  profit: number;
  totalPrice: number;
}

export default function CostAnalysis({ projectInfo, staffMembers, onNext, onBack }: Props) {
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const calculateYearlyBreakdown = (): YearlyBreakdown[] => {
    const durationMonths = projectInfo.durationMonths;
    if (durationMonths <= 0) {
      return [];
    }

    const monthlyLabor = Array(durationMonths).fill(0);

    staffMembers.forEach((staff) => {
      const baseMonthlyCost = staff.monthlyCost ?? 0;
      if (baseMonthlyCost <= 0) return;

      const startMonth = Math.max(1, staff.startMonth);
      const endMonth = Math.min(durationMonths, staff.endMonth);
      if (endMonth < startMonth) return;

      // Handle escalation: prefer escalationPeriods (new format), fallback to single rate (backward compatibility)
      let escalationPeriods = staff.escalationPeriods || [];
      
      // Backward compatibility: convert single rate to periods format
      if (escalationPeriods.length === 0 && (staff.escalationRate !== null && staff.escalationRate !== undefined && staff.escalationRate > 0)) {
        const escalationStartMonth = staff.escalationStartMonth ?? staff.startMonth ?? startMonth;
        const effectiveEscalationStart = escalationStartMonth < startMonth ? startMonth : escalationStartMonth;
        escalationPeriods = [{
          start_month: effectiveEscalationStart,
          end_month: endMonth,
          rate: staff.escalationRate
        }];
      }

      // Calculate cost for each month with multiple escalation periods
      for (let month = startMonth; month <= endMonth; month++) {
        let multiplier = 1.0;

        if (escalationPeriods && escalationPeriods.length > 0) {
          // Multiple periods: calculate cumulative escalation sequentially
          // Process periods chronologically up to the current month
          for (const period of escalationPeriods) {
            const periodStart = period.start_month;
            const periodEnd = period.end_month;
            const periodRate = period.rate;

            // Skip periods that haven't started yet
            if (month < periodStart) {
              continue;
            }

            // Calculate months in this period
            if (periodEnd < month) {
              // This period is completely in the past, apply full period escalation
              if (periodRate > 0) {
                const periodMonths = periodEnd - periodStart + 1;
                const monthlyRate = Math.pow(1 + periodRate / 100, 1 / 12);
                // Apply compounding for all months in this period
                multiplier *= Math.pow(monthlyRate, periodMonths);
              }
            } else {
              // Current month is within this period
              if (periodRate > 0) {
                const monthsInPeriodUpToMonth = month - periodStart + 1;
                const monthlyRate = Math.pow(1 + periodRate / 100, 1 / 12);
                // Apply compounding for months in this period up to current month
                multiplier *= Math.pow(monthlyRate, monthsInPeriodUpToMonth - 1);
              }
              // We've reached the current month, no need to process further periods
              break;
            }
          }
        } else {
          // No escalation periods, multiplier stays at 1.0
          multiplier = 1.0;
        }

        monthlyLabor[month - 1] += baseMonthlyCost * multiplier;
      }
    });

    const years = Math.max(1, Math.ceil(durationMonths / 12));
    const breakdown: YearlyBreakdown[] = [];

    for (let year = 1; year <= years; year++) {
      const startIndex = (year - 1) * 12;
      const endIndex = Math.min(year * 12, durationMonths);
      if (startIndex >= endIndex) break;

      const laborCost = monthlyLabor
        .slice(startIndex, endIndex)
        .reduce((sum, value) => sum + value, 0);
      const overhead = laborCost * (projectInfo.overheadRate / 100);
      const totalCost = laborCost + overhead;
      const profit = totalCost * (projectInfo.profitMargin / 100);
      const totalPrice = totalCost + profit;

      breakdown.push({
        year,
        laborCost,
        overhead,
        totalCost,
        profit,
        totalPrice,
      });
    }

    return breakdown;
  };

  const yearlyBreakdown = calculateYearlyBreakdown();
  
  // Calculate totals and max values for chart scaling
  const totals = yearlyBreakdown.reduce(
    (acc, year) => ({
      laborCost: acc.laborCost + year.laborCost,
      overhead: acc.overhead + year.overhead,
      totalCost: acc.totalCost + year.totalCost,
      profit: acc.profit + year.profit,
      totalPrice: acc.totalPrice + year.totalPrice
    }),
    { laborCost: 0, overhead: 0, totalCost: 0, profit: 0, totalPrice: 0 }
  );

  const maxPrice = Math.max(...yearlyBreakdown.map(y => y.totalPrice));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-xl border border-gray-300">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#161950' }}>
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#1A1A1A] font-outfit">
                  Multi-Year Cost Analysis
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Comprehensive breakdown of labor costs, overhead, and profit projections with annual escalation
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-xs text-gray-500">Step 3 of 4</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-xl border border-gray-300 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200" style={{ backgroundColor: '#161950' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Multi-Year Cost Projection
                </h3>
                <p className="text-sm text-white/80">
                  {yearlyBreakdown.length} years • Employee-level escalation rates
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/70">Total Increase</p>
              <p className="text-lg font-bold text-white">
                {yearlyBreakdown.length > 1 
                  ? `+${(((yearlyBreakdown[yearlyBreakdown.length - 1].totalPrice - yearlyBreakdown[0].totalPrice) / yearlyBreakdown[0].totalPrice) * 100).toFixed(1)}%`
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-5">
            {yearlyBreakdown.map((year, index) => {
              const prevYear = index > 0 ? yearlyBreakdown[index - 1] : null;
              const increase = prevYear 
                ? ((year.totalPrice - prevYear.totalPrice) / prevYear.totalPrice * 100).toFixed(1)
                : '0';
              const isIncrease = parseFloat(increase) > 0;
              
              return (
                <div key={year.year} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-xl flex flex-col items-center justify-center" style={{ backgroundColor: '#161950' }}>
                        <span className="text-xs text-white/70 font-semibold">YEAR</span>
                        <span className="text-2xl font-bold text-white">{year.year}</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Total Project Cost</p>
                        <p className="text-2xl font-bold text-gray-900">
                          ${(year.totalPrice / 1000).toFixed(1)}K
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      {index > 0 && (
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                          isIncrease ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
                        }`}>
                          {isIncrease ? (
                            <TrendingUp className="w-4 h-4 text-red-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-green-600" />
                          )}
                          <span className={`text-sm font-bold ${isIncrease ? 'text-red-600' : 'text-green-600'}`}>
                            {isIncrease ? '+' : ''}{increase}%
                          </span>
                          <span className="text-xs text-gray-600">vs Y{index}</span>
                        </div>
                      )}
                      
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Labor Cost</p>
                        <p className="text-sm font-bold text-blue-600">
                          ${(year.laborCost / 1000).toFixed(1)}K
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-4 bg-gray-100 rounded-lg overflow-hidden relative flex group cursor-pointer">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 relative hover:opacity-90 transition-opacity"
                      style={{ width: `${(year.laborCost / year.totalPrice) * 100}%` }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-xs font-bold text-white drop-shadow-lg">
                          {((year.laborCost / year.totalPrice) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-orange-600 relative hover:opacity-90 transition-opacity"
                      style={{ width: `${(year.overhead / year.totalPrice) * 100}%` }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-xs font-bold text-white drop-shadow-lg">
                          {((year.overhead / year.totalPrice) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 relative hover:opacity-90 transition-opacity"
                      style={{ width: `${(year.profit / year.totalPrice) * 100}%` }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-xs font-bold text-white drop-shadow-lg">
                          {((year.profit / year.totalPrice) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span className="text-gray-600">Labor</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 bg-orange-500 rounded"></div>
                      <span className="text-gray-600">Overhead</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span className="text-gray-600">Profit</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-5 rounded-xl border-2" style={{ backgroundColor: '#f8f9ff', borderColor: '#e0e7ff' }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#161950' }}>
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    AI Cost Escalation Analysis
                  </h4>
                  {!aiAnalysis && !isLoadingAI && (
                    <button
                      onClick={async () => {
                        setIsLoadingAI(true);
                        try {
                          // In real scenario, this would use actual plan_id from API
                          const avgEscalation = staffMembers.length > 0
                            ? (staffMembers.reduce((sum, m) => sum + (m.escalationRate ?? 0), 0) / staffMembers.length).toFixed(1)
                            : '0';
                          const mockAnalysis = `Employee-level escalation rates (average ${avgEscalation}%) reflect standard market adjustments for construction and engineering labor costs. This accounts for inflation (typically 2-3%), salary merit increases, and competitive market pressures in the construction industry. Over ${yearlyBreakdown.length} years, this compounds to a ${(((yearlyBreakdown[yearlyBreakdown.length - 1].totalPrice - yearlyBreakdown[0].totalPrice) / yearlyBreakdown[0].totalPrice) * 100).toFixed(1)}% total increase, which is industry-standard for multi-year infrastructure projects to maintain competitive compensation and retain skilled talent.`;
                          setAiAnalysis(mockAnalysis);
                          setAiInsights({
                            cost_increase_percentage: (((yearlyBreakdown[yearlyBreakdown.length - 1].totalPrice - yearlyBreakdown[0].totalPrice) / yearlyBreakdown[0].totalPrice) * 100).toFixed(1),
                            key_factors: [
                              `Employee-level escalation rates applied (average: ${avgEscalation}%)`,
                              `Market inflation adjustment`,
                              `Total cost increase: ${(((yearlyBreakdown[yearlyBreakdown.length - 1].totalPrice - yearlyBreakdown[0].totalPrice) / yearlyBreakdown[0].totalPrice) * 100).toFixed(1)}% over ${yearlyBreakdown.length} years`
                            ]
                          });
                        } catch (error) {
                          console.error('AI analysis failed:', error);
                        } finally {
                          setIsLoadingAI(false);
                        }
                      }}
                      className="px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all hover:opacity-90 text-white"
                      style={{ backgroundColor: '#161950' }}
                    >
                      <Sparkles className="w-4 h-4" />
                      Generate AI Analysis
                    </button>
                  )}
                </div>
                
                {isLoadingAI ? (
                  <div className="flex items-center gap-3 py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-3 border-gray-300 border-t-blue-600"></div>
                    <p className="text-sm text-gray-600">Analyzing cost trends with AI...</p>
                  </div>
                ) : aiAnalysis ? (
                  <>
                    <p className="text-sm text-gray-700 leading-relaxed mb-4">
                      {aiAnalysis}
                    </p>
                    
                    {aiInsights && (
                      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-300">
                        {aiInsights.key_factors?.map((factor: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 text-amber-600 mt-0.5" />
                            <p className="text-xs text-gray-700 font-medium">{factor}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-600 italic">
                    Click "Generate AI Analysis" to get intelligent insights about cost escalation factors and market trends.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-xl border border-gray-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-white" style={{ backgroundColor: '#161950' }}>
                <th className="px-6 py-4 text-left text-sm font-bold">Year</th>
                <th className="px-6 py-4 text-right text-sm font-bold">
                  <div className="flex items-center justify-end gap-1">
                    <Users className="w-4 h-4" />
                    Labor Cost
                  </div>
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold">
                  <div className="flex items-center justify-end gap-1">
                    <Target className="w-4 h-4" />
                    Overhead ({projectInfo.overheadRate}%)
                  </div>
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold">
                  <div className="flex items-center justify-end gap-1">
                    <DollarSign className="w-4 h-4" />
                    Total Cost
                  </div>
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold">
                  <div className="flex items-center justify-end gap-1">
                    <TrendingUp className="w-4 h-4" />
                    Profit ({projectInfo.profitMargin}%)
                  </div>
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold">
                  <div className="flex items-center justify-end gap-1">
                    <BarChart3 className="w-4 h-4" />
                    Total Price
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {yearlyBreakdown.map((year, index) => (
                <tr key={year.year} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-all`}>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">{year.year}</span>
                      </div>
                      Year {year.year}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-gray-700">
                    ${year.laborCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-orange-600">
                    ${year.overhead.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                    ${year.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-bold text-green-600">
                    ${year.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-bold text-blue-600 text-base">
                    ${year.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
              
              <tr className="text-white" style={{ backgroundColor: '#161950' }}>
                <td className="px-6 py-5 text-sm font-bold">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    GRAND TOTAL
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-right font-bold">
                  ${totals.laborCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-5 text-sm text-right font-bold">
                  ${totals.overhead.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-5 text-sm text-right font-bold">
                  ${totals.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-5 text-sm text-right font-bold">
                  ${totals.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-5 text-right font-bold text-xl">
                  ${totals.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-lg shadow-xl border border-gray-300 p-5 hover:shadow-2xl transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-sm font-bold text-gray-700">Total Labor Cost</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600 mb-1">
            ${(totals.laborCost / 1000).toFixed(0)}K
          </p>
          <p className="text-xs text-gray-600">
            {staffMembers.length} team members
          </p>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              Avg. rate: ${staffMembers.length > 0 ? (staffMembers.reduce((sum, s) => sum + s.hourlyRate, 0) / staffMembers.length).toFixed(0) : 0}/hr
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl border border-gray-300 p-5 hover:shadow-2xl transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-sm font-bold text-gray-700">Total Overhead</h3>
          </div>
          <p className="text-3xl font-bold text-orange-600 mb-1">
            ${(totals.overhead / 1000).toFixed(0)}K
          </p>
          <p className="text-xs text-gray-600">
            {projectInfo.overheadRate}% of labor cost
          </p>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              Industry standard: 20-30%
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl border border-gray-300 p-5 hover:shadow-2xl transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-sm font-bold text-gray-700">Total Profit</h3>
          </div>
          <p className="text-3xl font-bold text-green-600 mb-1">
            ${(totals.profit / 1000).toFixed(0)}K
          </p>
          <p className="text-xs text-gray-600">
            {projectInfo.profitMargin}% profit margin
          </p>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              ROI: {((totals.profit / totals.totalCost) * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="rounded-lg shadow-xl border-2 p-5" style={{ backgroundColor: '#161950', borderColor: '#161950' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shadow-md backdrop-blur-sm">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-sm font-bold text-white">Total Project Value</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            ${(totals.totalPrice / 1000000).toFixed(2)}M
          </p>
          <p className="text-xs text-white/90">
            {projectInfo.durationMonths} months • {Math.ceil(projectInfo.durationMonths / 12)} year(s)
          </p>
          <div className="mt-3 pt-3 border-t border-white/20">
            <p className="text-xs text-white/80">
              Escalation: Employee-level rates applied
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-xl border border-gray-300 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          Team Composition & Cost Distribution
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staffMembers.map((staff, index) => (
            <div key={index} className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{staff.resourceName}</h4>
                  <p className="text-xs text-gray-600">{staff.role}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  staff.level === 'Senior' ? 'bg-purple-100 text-purple-700' :
                  staff.level === 'Mid' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {staff.level}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Bill Rate</span>
                  <span className="font-bold text-green-600">${staff.hourlyRate}/hr</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Hours/Week</span>
                  <span className="font-semibold text-gray-900">{staff.hoursPerWeek} hrs</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-200">
                  <span className="text-gray-600">Total Cost</span>
                  <span className="font-bold text-blue-600">${(staff.totalCost / 1000).toFixed(1)}K</span>
                </div>
              </div>
              <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                  style={{ width: `${(staff.totalCost / totals.laborCost) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">
                {((staff.totalCost / totals.laborCost) * 100).toFixed(1)}% of labor budget
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 p-5">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-indigo-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-indigo-900 mb-2">
              📊 How Costs Are Calculated
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-indigo-700">
              <div>
                <p className="font-semibold mb-1">Labor Cost (per year):</p>
                <p>Base labor × Escalation rate<sup>(year-1)</sup></p>
              </div>
              <div>
                <p className="font-semibold mb-1">Overhead:</p>
                <p>Labor Cost × {projectInfo.overheadRate}%</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Total Cost:</p>
                <p>Labor Cost + Overhead</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Profit:</p>
                <p>Total Cost × {projectInfo.profitMargin}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="h-12 px-8 bg-white rounded-lg border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-all"
        >
          ← Back to Staff Planning
        </button>
        
        <button
          onClick={onNext}
          className="h-12 px-8 rounded-lg text-white font-bold hover:opacity-90 transition-all shadow-xl flex items-center gap-2"
          style={{ backgroundColor: '#161950' }}
        >
          Continue to Summary
          <ArrowUpRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
