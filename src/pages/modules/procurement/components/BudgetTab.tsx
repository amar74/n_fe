import { Link } from 'react-router-dom';
import {
  PieChart,
  Download,
  Calendar,
  Target,
  DollarSign,
  PiggyBank,
  AlertTriangle,
  CheckCircle2,
  Brain,
  Lightbulb,
  TrendingUp,
  BarChart3,
  TrendingDown,
  Bell,
  ArrowRight,
  FileText,
  Plus,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { useFinancePlanningAnnual } from '@/hooks/useFinance';
import { useExpenseCategories } from '@/hooks/useExpenseCategories';
import { useProcurement } from '@/hooks/useProcurement';
import { useMemo, useState } from 'react';

interface BudgetTabProps {
  totalSpend: number;
}

export function BudgetTab({ totalSpend }: BudgetTabProps) {
  const [budgetYear] = useState('2025');
  const { data: annualBudgetData, isLoading: budgetLoading } = useFinancePlanningAnnual(budgetYear);
  const { data: allCategories } = useExpenseCategories({
    include_inactive: false,
    include_subcategories: true,
    category_type: 'expense',
  });
  const { useExpenses } = useProcurement();
  const { data: expensesData } = useExpenses({ size: 1000, status: 'approved' });

  // Process expense lines to group by category
  const budgetCategories = useMemo(() => {
    if (!annualBudgetData?.expense_lines || !allCategories) return [];

    const expenseLines = annualBudgetData.expense_lines;
    const topLevelCategories = allCategories.filter((cat) => cat.parent_id === null);
    const categories: Array<{
      category: string;
      description: string;
      budget: number;
      actual: number;
      lastUpdated: string;
      subcategories: Array<{ name: string; budget: number; actual: number }>;
    }> = [];

    topLevelCategories.forEach((category) => {
      // Find main category line
      const mainLine = expenseLines.find((line) => 
        line.label.toLowerCase() === category.name.toLowerCase()
      );

      if (mainLine) {
        // Find subcategory lines
        const subcategories = allCategories.filter((cat) => cat.parent_id === category.id);
        const subcategoryData = subcategories.map((sub) => {
          const subLine = expenseLines.find((line) => 
            line.label.toLowerCase() === sub.name.toLowerCase()
          );
          return {
            name: sub.name,
            budget: subLine?.target || 0,
            actual: subLine?.target || 0, // Using target as actual for now
          };
        });

        categories.push({
          category: category.name,
          description: category.description || '',
          budget: mainLine.target || 0,
          actual: mainLine.target || 0, // Using target as actual for now
          lastUpdated: new Date().toISOString().split('T')[0],
          subcategories: subcategoryData,
        });
      }
    });

    return categories;
  }, [annualBudgetData, allCategories]);

  const totalBudget = useMemo(() => {
    return annualBudgetData?.expense_lines?.reduce((sum, line) => sum + (line.target || 0), 0) || 0;
  }, [annualBudgetData]);

  const remainingBudget = totalBudget - totalSpend;
  const budgetUtilization = totalBudget > 0 ? (totalSpend / totalBudget) * 100 : 0;

  // Prepare chart data
  const pieChartData = useMemo(() => {
    return budgetCategories.map((cat, index) => {
      const colors = ['#161950', '#9333EA', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
      return {
        name: cat.category,
        value: cat.budget,
        color: colors[index % colors.length],
      };
    });
  }, [budgetCategories]);

  // Calculate monthly spending from actual expenses
  const monthlySpendingData = useMemo(() => {
    const currentYear = parseInt(budgetYear);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyActual: Record<number, number> = {};
    const monthlyPlanned: Record<number, number> = {};
    
    // Initialize monthly planned (budget / 12 for each month)
    const monthlyBudget = totalBudget / 12;
    for (let i = 0; i < 12; i++) {
      monthlyPlanned[i] = monthlyBudget;
      monthlyActual[i] = 0;
    }
    
    // Calculate actual spending from expenses
    if (expensesData?.expenses) {
      expensesData.expenses.forEach((exp: any) => {
        const expenseDate = new Date(exp.expense_date);
        if (expenseDate.getFullYear() === currentYear && (exp.status === 'approved' || exp.status === 'reimbursed')) {
          const monthIndex = expenseDate.getMonth();
          monthlyActual[monthIndex] = (monthlyActual[monthIndex] || 0) + Number(exp.amount || 0);
        }
      });
    }
    
    // Get last 6 months
    const currentMonth = new Date().getMonth();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      last6Months.push({
        month: months[monthIndex],
        planned: monthlyPlanned[monthIndex] || 0,
        actual: monthlyActual[monthIndex] || 0,
      });
    }
    
    return last6Months;
  }, [expensesData, totalBudget, budgetYear]);

  const barChartData = useMemo(() => {
    return budgetCategories.map((cat) => ({
      category: cat.category.length > 15 ? cat.category.substring(0, 15) + '...' : cat.category,
      planned: cat.budget,
      actual: cat.actual,
    }));
  }, [budgetCategories]);

  if (budgetLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#161950]" />
      </div>
    );
  }

  if (!annualBudgetData || budgetCategories.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-end pb-2">
          <div>
            <h2 className="text-3xl font-semibold text-[#1A1A1A] font-outfit mb-2">Budget Categories Analysis</h2>
            <p className="text-sm text-gray-600 font-outfit">Detailed breakdown of planned vs actual spending by category</p>
          </div>
          <Link to="/module/procurement/budget/create">
            <Button className="bg-[#161950] hover:bg-[#1E2B5B] text-white font-outfit h-11 px-6">
              <Plus className="h-4 w-4 mr-2" />
              Create Budget
            </Button>
          </Link>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-600 font-outfit">No budget data available. Create a budget to get started.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end pb-2">
        <div>
          <h2 className="text-3xl font-semibold text-[#1A1A1A] font-outfit mb-2">Budget Categories Analysis</h2>
          <p className="text-sm text-gray-600 font-outfit">Detailed breakdown of planned vs actual spending by category</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/module/procurement/budget/create">
            <Button className="bg-[#161950] hover:bg-[#1E2B5B] text-white font-outfit h-11 px-6">
              <Plus className="h-4 w-4 mr-2" />
              Create Budget
            </Button>
          </Link>
          <Link to="/module/finance">
            <Button variant="outline" className="border border-gray-200 font-outfit h-11 px-5">
              <PieChart className="h-4 w-4 mr-2" />
              View Full Budget
            </Button>
          </Link>
          <Button variant="outline" className="border border-gray-200 font-outfit h-11 px-5">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)] font-outfit">
        <div className="mb-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-[#1A1A1A] font-outfit mb-1">Budget Analysis</h3>
              <p className="text-sm text-gray-600 font-outfit">Procurement budget tracking and analysis</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="border-gray-200 font-outfit">
                <Calendar className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="border-gray-200 font-outfit">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Total Budget</div>
                <div className="rounded-lg bg-[#161950]/10 p-2">
                  <Target className="h-4 w-4 text-[#161950]" />
                </div>
              </div>
              <div className="text-3xl font-bold text-[#161950] font-outfit mb-1">${totalBudget.toLocaleString()}</div>
              <div className="text-xs text-gray-500 font-outfit">Annual allocation</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-purple-50 to-white p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Actual Spend</div>
                <div className="rounded-lg bg-[#9333EA]/10 p-2">
                  <DollarSign className="h-4 w-4 text-[#9333EA]" />
                </div>
              </div>
              <div className="text-3xl font-bold text-[#9333EA] font-outfit mb-1">${totalSpend.toLocaleString()}</div>
              <div className="text-xs text-gray-500 font-outfit">
                {totalBudget > 0 ? ((totalSpend / totalBudget) * 100).toFixed(1) : '0'}% of budget
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-emerald-50 to-white p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Remaining</div>
                <div className="rounded-lg bg-emerald-100 p-2">
                  <PiggyBank className="h-4 w-4 text-emerald-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-[#1A1A1A] font-outfit mb-1">
                ${remainingBudget.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 font-outfit">Available balance</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 font-outfit">Budget Utilization</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 font-outfit">
                  {budgetUtilization.toFixed(1)}%
                </span>
                {budgetUtilization > 80 ? (
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                )}
              </div>
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-[#161950]/15">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all ${
                  budgetUtilization > 80 ? 'bg-amber-500' : 
                  budgetUtilization > 100 ? 'bg-rose-500' : 'bg-[#161950]'
                }`}
                style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 font-outfit">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-4">
              <h4 className="text-base font-semibold text-[#1A1A1A] font-outfit mb-1">Monthly Spending Trends</h4>
              <p className="text-xs text-gray-600 font-outfit">Track spending patterns over the last 6 months</p>
            </div>
            <div className="h-64 min-h-[256px]">
              <ResponsiveContainer width="100%" height="100%" minHeight={256}>
                <AreaChart
                  data={monthlySpendingData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#161950" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#161950" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9333EA" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#9333EA" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontFamily: 'Outfit, sans-serif',
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                  />
                  <Legend 
                    wrapperStyle={{ fontFamily: 'Outfit, sans-serif', fontSize: '12px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="planned"
                    stroke="#161950"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPlanned)"
                    name="Planned"
                  />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="#9333EA"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorActual)"
                    name="Actual"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-4">
                <h4 className="text-base font-semibold text-[#1A1A1A] font-outfit mb-1">Budget Distribution</h4>
                <p className="text-xs text-gray-600 font-outfit">Allocation by category</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%" minHeight={256}>
                  <RechartsPieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(props: any) => {
                        const { name, percent } = props;
                        return `${name}: ${((percent || 0) * 100).toFixed(0)}%`;
                      }}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontFamily: 'Outfit, sans-serif',
                      }}
                      formatter={(value: number) => `$${value.toLocaleString()}`}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-4">
                <h4 className="text-base font-semibold text-[#1A1A1A] font-outfit mb-1">Spending by Category</h4>
                <p className="text-xs text-gray-600 font-outfit">Actual vs planned comparison</p>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%" minHeight={256}>
                  <BarChart
                    data={barChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="category" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 11, fill: '#6B7280' }}
                      axisLine={{ stroke: '#E5E7EB' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                      axisLine={{ stroke: '#E5E7EB' }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontFamily: 'Outfit, sans-serif',
                      }}
                      formatter={(value: number) => `$${value.toLocaleString()}`}
                    />
                    <Legend 
                      wrapperStyle={{ fontFamily: 'Outfit, sans-serif', fontSize: '12px' }}
                    />
                    <Bar dataKey="planned" fill="#161950" name="Planned" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="actual" fill="#9333EA" name="Actual" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border-2 border-[#9333EA]/20 bg-[#9333EA]/5 p-8 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)] font-outfit">
        <div className="mb-6 pb-4 border-b border-[#9333EA]/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-gradient-to-br from-[#161950] to-[#1E2B5B] p-2.5">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#1A1A1A] font-outfit">AI Budget Intelligence</h3>
                <p className="text-xs text-gray-500 font-outfit mt-0.5">AI-powered budget analysis and intelligent recommendations</p>
              </div>
            </div>
            <Link to="/module/procurement/budget/create">
              <Button size="sm" className="bg-[#9333EA] hover:bg-[#7E22CE] text-white font-outfit">
                <Brain className="h-4 w-4 mr-2" />
                Generate AI Suggestions
              </Button>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-[#9333EA] font-outfit">AI Budget Analysis</h4>
            <div className="bg-white p-4 rounded-lg border border-[#9333EA]/20">
              <div className="flex items-center space-x-2 mb-3">
                <Brain className="h-5 w-5 text-[#9333EA]" />
                <span className="text-sm font-medium text-[#9333EA] font-outfit">Intelligent Insights</span>
              </div>
              <div className="space-y-3 text-xs text-gray-700 font-outfit">
                {budgetCategories.length > 0 ? (
                  <>
                    <div className="p-2 bg-blue-50 rounded border border-blue-100">
                      <p className="font-semibold text-blue-900 mb-1">Budget Health</p>
                      <p className="text-blue-700">
                        {budgetUtilization > 100 
                          ? `Budget exceeded by ${(budgetUtilization - 100).toFixed(1)}%. Review spending patterns.`
                          : budgetUtilization > 80
                          ? `Budget utilization at ${budgetUtilization.toFixed(1)}%. Monitor closely.`
                          : `Budget utilization at ${budgetUtilization.toFixed(1)}%. Healthy spending.`}
                      </p>
                    </div>
                    <div className="p-2 bg-purple-50 rounded border border-purple-100">
                      <p className="font-semibold text-purple-900 mb-1">Top Spending Category</p>
                      <p className="text-purple-700">
                        {budgetCategories[0]?.category || 'N/A'}: ${(budgetCategories[0]?.budget || 0).toLocaleString()} 
                        ({totalBudget > 0 ? ((budgetCategories[0]?.budget || 0) / totalBudget * 100).toFixed(1) : '0'}% of total)
                      </p>
                    </div>
                    <div className="p-2 bg-emerald-50 rounded border border-emerald-100">
                      <p className="font-semibold text-emerald-900 mb-1">Recommendations</p>
                      <p className="text-emerald-700">
                        {budgetCategories.filter(cat => cat.budget > 0 && (cat.actual / cat.budget) > 0.9).length > 0
                          ? `${budgetCategories.filter(cat => cat.budget > 0 && (cat.actual / cat.budget) > 0.9).length} categories approaching budget limit.`
                          : 'All categories within budget limits.'}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500">No budget data available for analysis.</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-[#9333EA] font-outfit">Scenario Modeling</h4>
            <div className="bg-white p-4 rounded-lg border border-[#9333EA]/20">
              <div className="flex items-center space-x-2 mb-3">
                <BarChart3 className="h-5 w-5 text-[#161950]" />
                <span className="text-sm font-medium text-[#161950] font-outfit">Impact Analysis</span>
              </div>
              <div className="space-y-3 font-outfit">
                {budgetCategories.length > 0 && totalBudget > 0 && (
                  <>
                    <div className="text-xs p-2 bg-amber-50 rounded border border-amber-100">
                      <span className="font-medium text-amber-900">Scenario:</span>
                      <span className="text-amber-700"> 10% increase in {budgetCategories[0]?.category || 'top category'} spend</span>
                    </div>
                    <div className="text-xs p-2 bg-rose-50 rounded border border-rose-100">
                      <span className="font-medium text-rose-900">Impact:</span>
                      <span className="text-rose-700"> 
                        {' '}${((budgetCategories[0]?.budget || 0) * 0.1).toLocaleString()} additional spend
                        ({((budgetCategories[0]?.budget || 0) * 0.1 / totalBudget * 100).toFixed(1)}% of total budget)
                      </span>
                    </div>
                    <div className="text-xs p-2 bg-blue-50 rounded border border-blue-100">
                      <span className="font-medium text-blue-900">Risk Level:</span>
                      <span className="text-blue-700">
                        {' '}
                        {((budgetCategories[0]?.budget || 0) * 0.1 / totalBudget * 100) > 5 
                          ? <span className="text-rose-600 font-semibold">High</span>
                          : ((budgetCategories[0]?.budget || 0) * 0.1 / totalBudget * 100) > 2
                          ? <span className="text-amber-600 font-semibold">Medium</span>
                          : <span className="text-emerald-600 font-semibold">Low</span>}
                      </span>
                    </div>
                  </>
                )}
              </div>
              <Button 
                size="sm" 
                className="mt-3 bg-[#161950] hover:bg-[#1E2B5B] text-white font-outfit"
                onClick={() => {
                  window.location.href = '/module/procurement/budget/create';
                }}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Run Scenarios
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {budgetCategories.map((item) => {
          const utilization = (item.actual / item.budget) * 100;
          const variance = item.actual - item.budget;
          const variancePercent = (variance / item.budget) * 100;
          const isOverBudget = variance > 0;
          const statusBadge = isOverBudget
            ? { label: 'Over Budget', className: 'bg-amber-100 text-amber-800 border-amber-200' }
            : { label: 'Under Budget', className: 'bg-blue-100 text-blue-800 border-blue-200' };

          return (
            <div
              key={item.category}
              className="rounded-2xl border border-gray-200 bg-white p-8 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)] font-outfit hover:shadow-[0_32px_64px_-24px_rgba(15,23,42,0.4)] transition-shadow"
            >
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-100">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-[#1A1A1A] font-outfit">{item.category}</h3>
                    <Badge className={`${statusBadge.className} border font-outfit text-xs px-3 py-1`}>
                      {statusBadge.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 font-outfit mb-1">{item.description}</p>
                  <p className="text-xs text-gray-500 font-outfit">Last Updated: {item.lastUpdated}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit mb-1">
                    Planned
                  </div>
                  <div className="text-xl font-bold text-[#161950] font-outfit">
                    ${item.budget.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit mb-1">
                    Actual
                  </div>
                  <div className="text-xl font-bold text-[#9333EA] font-outfit">
                    ${item.actual.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit mb-1">
                    Variance
                  </div>
                  <div className="text-xl font-bold text-[#1A1A1A] font-outfit">
                    {variance > 0 ? '+' : ''}${variance.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit mb-1">
                    % Variance
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={`text-xl font-bold font-outfit ${isOverBudget ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {variancePercent > 0 ? '+' : ''}{variancePercent.toFixed(1)}%
                    </div>
                    {isOverBudget ? (
                      <TrendingUp className="h-5 w-5 text-rose-600" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-emerald-600" />
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 font-outfit">Budget Utilization</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 font-outfit">
                      {utilization.toFixed(1)}%
                    </span>
                    <span className="text-xs text-gray-500 font-outfit">
                      Remaining: {variance < 0 ? '$' : '-$'}
                      {Math.abs(variance).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-[#161950]/15">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full ${isOverBudget ? 'bg-rose-500' : 'bg-[#161950]'}`}
                    style={{ width: `${Math.min(utilization, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-[#1A1A1A] font-outfit mb-3">Subcategory Breakdown</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {item.subcategories.map((sub) => {
                    const subVariance = sub.actual - sub.budget;
                    const subVariancePercent = (subVariance / sub.budget) * 100;
                    const subIsOver = subVariance > 0;
                    return (
                      <div
                        key={sub.name}
                        className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm font-outfit"
                      >
                        <div className="text-sm font-semibold text-[#1A1A1A] font-outfit mb-3">{sub.name}</div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500 font-outfit">Planned</span>
                            <span className="text-sm font-semibold text-[#161950] font-outfit">
                              ${sub.budget.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500 font-outfit">Actual</span>
                            <span className="text-sm font-semibold text-[#9333EA] font-outfit">
                              ${sub.actual.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500 font-outfit">Variance</span>
                            <span
                              className={`text-sm font-semibold font-outfit ${subIsOver ? 'text-rose-600' : 'text-emerald-600'}`}
                            >
                              {subVariance > 0 ? '+' : ''}${subVariance.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                            <span className="text-xs text-gray-500 font-outfit">% Variance</span>
                            <div className="flex items-center gap-1">
                              <span
                                className={`text-xs font-semibold font-outfit ${subIsOver ? 'text-rose-600' : 'text-emerald-600'}`}
                              >
                                {subVariancePercent > 0 ? '+' : ''}
                                {subVariancePercent.toFixed(1)}%
                              </span>
                              {subIsOver ? (
                                <TrendingUp className="h-3 w-3 text-rose-600" />
                              ) : (
                                <TrendingDown className="h-3 w-3 text-emerald-600" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)] font-outfit">
        <div className="mb-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-[#161950]/10 p-2">
              <Bell className="h-5 w-5 text-[#161950]" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-[#1A1A1A] font-outfit">Budget Alerts & Recommendations</h3>
              <p className="text-sm text-gray-600 font-outfit mt-0.5">Actionable alerts and recommendations for budget management</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {budgetCategories
            .filter((cat) => {
              const utilization = (cat.actual / cat.budget) * 100;
              return utilization > 100 || utilization < 50;
            })
            .map((cat) => {
              const utilization = (cat.actual / cat.budget) * 100;
              const variance = cat.actual - cat.budget;
              const variancePercent = ((variance / cat.budget) * 100);
              
              if (utilization > 100) {
                return {
                  type: 'warning' as const,
                  title: `${cat.category} Over Budget`,
                  message: `${cat.category} has exceeded budget by ${Math.abs(variancePercent).toFixed(1)}%. Review spending and consider cost-cutting measures.`,
                  action: 'Review Spending',
                  icon: AlertTriangle,
                };
              } else {
                return {
                  type: 'success' as const,
                  title: `${cat.category} Under Budget`,
                  message: `${cat.category} is ${Math.abs(variancePercent).toFixed(1)}% under budget. Consider reallocating funds or accelerating planned purchases.`,
                  action: 'View Opportunities',
                  icon: CheckCircle2,
                };
              }
            })
            .slice(0, 4)
            .map((alert, index) => {
            const colorMap = {
              warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', icon: 'text-amber-600' },
              info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: 'text-blue-600' },
              success: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', icon: 'text-emerald-600' },
            };
            const colors = colorMap[alert.type as keyof typeof colorMap];
            const Icon = alert.icon;

            return (
              <div
                key={index}
                className={`rounded-xl border ${colors.border} ${colors.bg} p-4 flex items-start gap-4`}
              >
                <div className={`${colors.icon} flex-shrink-0 mt-0.5`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className={`text-sm font-semibold ${colors.text} font-outfit mb-1`}>{alert.title}</h4>
                  <p className="text-sm text-gray-700 font-outfit mb-3">{alert.message}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`${colors.border} ${colors.text} hover:${colors.bg} font-outfit`}
                  >
                    {alert.action}
                    <ArrowRight className="h-3 w-3 ml-2" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

