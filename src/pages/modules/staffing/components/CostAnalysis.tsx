import { BarChart3, DollarSign, TrendingUp, Users, Calendar, Target, ArrowUpRight, Info, Sparkles } from 'lucide-react';

interface ProjectInfo {
  projectName: string;
  durationMonths: number;
  overheadRate: number;
  profitMargin: number;
  annualEscalationRate: number;
}

interface StaffMember {
  resourceName: string;
  role: string;
  level: string;
  totalCost: number;
  hourlyRate: number;
  hoursPerWeek: number;
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
  // Calculate yearly breakdown with escalation
  const calculateYearlyBreakdown = (): YearlyBreakdown[] => {
    const years = Math.ceil(projectInfo.durationMonths / 12);
    const breakdown: YearlyBreakdown[] = [];
    const baseLaborCost = staffMembers.reduce((sum, staff) => sum + staff.totalCost, 0);
    const monthlyLaborCost = baseLaborCost / projectInfo.durationMonths;

    for (let year = 1; year <= years; year++) {
      const monthsInYear = Math.min(12, projectInfo.durationMonths - ((year - 1) * 12));
      const escalationMultiplier = Math.pow(1 + (projectInfo.annualEscalationRate / 100), year - 1);
      
      const laborCost = monthlyLaborCost * monthsInYear * escalationMultiplier;
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
        totalPrice
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
      {/* Enhanced Header */}
      <div className="bg-white rounded-lg shadow-xl border border-gray-300">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#151950' }}>
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

      {/* Visual Cost Chart */}
      <div className="bg-white rounded-lg shadow-xl border border-gray-300 p-6">
        <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Yearly Cost Visualization
        </h3>
        <div className="space-y-4">
          {yearlyBreakdown.map((year) => (
            <div key={year.year}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-gray-900">Year {year.year}</span>
                <span className="text-sm font-bold text-blue-600">
                  ${(year.totalPrice / 1000).toFixed(1)}K
                </span>
              </div>
              <div className="h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                <div
                  className="h-full bg-blue-500 rounded-lg transition-all"
                  style={{ width: `${(year.totalPrice / maxPrice) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="bg-white rounded-lg shadow-xl border border-gray-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-white" style={{ backgroundColor: '#151950' }}>
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
              
              {/* Enhanced Total Row */}
              <tr className="text-white" style={{ backgroundColor: '#151950' }}>
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

      {/* Enhanced Summary Cards */}
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

        <div className="rounded-lg shadow-xl border-2 p-5" style={{ backgroundColor: '#151950', borderColor: '#151950' }}>
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
              Escalation: {projectInfo.annualEscalationRate}% annually
            </p>
          </div>
        </div>
      </div>

      {/* Team Composition */}
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

      {/* Info Box */}
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

      {/* Navigation Buttons */}
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
          style={{ backgroundColor: '#151950' }}
        >
          Continue to Summary
          <ArrowUpRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
