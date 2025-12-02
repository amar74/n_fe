import { Clock, CheckCircle, FileText, ShoppingCart, Receipt, Building2, FileSearch, PieChart, BarChart3, Target, TrendingUp, AlertTriangle, Bell, Brain, DollarSign, TrendingDown, ClipboardList } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getStatusBadge } from '../utils';
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useMemo, useState } from 'react';
import { useFinancePlanningAnnual } from '@/hooks/useFinance';
import { useExpenseCategories } from '@/hooks/useExpenseCategories';
import { useProcurement } from '@/hooks/useProcurement';

interface Activity {
  id: string;
  type: 'requisition' | 'order' | 'expense' | 'invoice' | 'rfq';
  title: string;
  description: string;
  amount?: number;
  status: string;
  date: string;
  user?: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DashboardTabProps {
  allActivities: Activity[];
  metricCards: Array<{
    label: string;
    value: string;
    subtext?: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
  budgetsData?: any;
  dashboardStats?: any;
  onTabChange: (tab: string) => void;
  isLoading?: boolean;
}

// Helper function to get category color (defined outside component to avoid hoisting issues)
const getCategoryColor = (categoryName: string): string => {
  const colors: Record<string, string> = {
    'Software & Technology': '#161950',
    'Office Operations': '#9333EA',
    'Professional Services': '#10B981',
    'Travel & Transportation': '#F59E0B',
    'Marketing': '#EF4444',
    'Other': '#6B7280',
  };
  const normalizedName = categoryName.toLowerCase();
  for (const [key, color] of Object.entries(colors)) {
    if (normalizedName.includes(key.toLowerCase().split(' ')[0])) {
      return color;
    }
  }
  return '#6B7280';
};

export function DashboardTab({ allActivities, metricCards, budgetsData, dashboardStats, onTabChange, isLoading = false }: DashboardTabProps) {
  // Use Finance Planning data (same as BudgetTab) to ensure consistency
  const [budgetYear] = useState('2025');
  const { data: annualBudgetData, isLoading: budgetLoading } = useFinancePlanningAnnual(budgetYear);
  const { data: allCategories } = useExpenseCategories({
    include_inactive: false,
    include_subcategories: true,
    category_type: 'expense',
  });
  
  // Get actual expenses for monthly spending calculation
  const { useExpenses } = useProcurement();
  const { data: expensesData } = useExpenses({ size: 1000, status: 'approved' });

  // Calculate budget data from Finance Planning (same source as BudgetTab)
  const budgetOverview = useMemo(() => {
    const totalSpent = dashboardStats?.total_spend || 0;
    
    // Use Finance Planning expense lines (same as BudgetTab)
    if (!annualBudgetData?.expense_lines || annualBudgetData.expense_lines.length === 0) {
      // Fallback to procurement budgets if Finance Planning data not available
      if (!budgetsData?.budgets || budgetsData.budgets.length === 0) {
        return {
          totalBudget: 0,
          totalSpent,
          utilizationPercent: 0,
          categoryData: [],
        };
      }

      // Fallback logic for procurement budgets
      const finalizedBudgets = budgetsData.budgets.filter((b: any) => b.status === 'finalized');
      const activeBudget = finalizedBudgets.length > 0 
        ? finalizedBudgets.sort((a: any, b: any) => new Date(b.budget_year).getTime() - new Date(a.budget_year).getTime())[0]
        : budgetsData.budgets.sort((a: any, b: any) => new Date(b.budget_year).getTime() - new Date(a.budget_year).getTime())[0];

      if (!activeBudget) {
        return {
          totalBudget: 0,
          totalSpent,
          utilizationPercent: 0,
          categoryData: [],
        };
      }

      const totalBudget = activeBudget.total_budget 
        ? Number(activeBudget.total_budget) 
        : (activeBudget.categories || []).reduce((sum: number, cat: any) => sum + Number(cat.proposed_budget || 0), 0);
      
      const utilizationPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
      const categoryData: Array<{ name: string; budgeted: number; spent: number; color: string }> = [];
      
      (activeBudget.categories || []).forEach((cat: any) => {
        const budgeted = Number(cat.proposed_budget || 0);
        if (budgeted > 0) {
          categoryData.push({
            name: cat.name || 'Other',
            budgeted,
            spent: Number(cat.actual_current_year || 0),
            color: getCategoryColor(cat.name || 'Other'),
          });
        }
      });

      return {
        totalBudget,
        totalSpent,
        utilizationPercent,
        categoryData: categoryData.sort((a, b) => b.budgeted - a.budgeted),
      };
    }

    // Primary: Use Finance Planning expense lines (same as BudgetTab)
    const expenseLines = annualBudgetData.expense_lines;
    const topLevelCategories = allCategories?.filter((cat) => cat.parent_id === null) || [];
    
    // Calculate total budget from expense lines
    const totalBudget = expenseLines.reduce((sum, line) => sum + (line.target || 0), 0);
    const utilizationPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    // Process categories from expense lines (only top-level, no subcategories for pie chart)
    const categoryData: Array<{ name: string; budgeted: number; spent: number; color: string }> = [];
    const colors = ['#161950', '#9333EA', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#84CC16', '#F97316', '#6366F1', '#14B8A6'];
    
    // Get top-level expense lines (level 0 or no level)
    const topLevelExpenses = expenseLines.filter(line => !line.level || line.level === 0);
    
    // Calculate actual spent per category from expenses
    const categorySpending: Record<string, number> = {};
    if (expensesData?.expenses) {
      const currentYear = parseInt(budgetYear);
      expensesData.expenses.forEach((exp: any) => {
        const expenseDate = new Date(exp.expense_date);
        if (expenseDate.getFullYear() === currentYear && (exp.status === 'approved' || exp.status === 'reimbursed')) {
          const categoryName = exp.category || 'Other';
          categorySpending[categoryName] = (categorySpending[categoryName] || 0) + Number(exp.amount || 0);
        }
      });
    }
    
    topLevelExpenses.forEach((line, index) => {
      const budgeted = line.target || 0;
      if (budgeted > 0) {
        // Match category spending by name (case-insensitive)
        const categoryName = line.label;
        const spent = Object.entries(categorySpending).reduce((sum, [catName, amount]) => {
          if (catName.toLowerCase().includes(categoryName.toLowerCase()) || 
              categoryName.toLowerCase().includes(catName.toLowerCase())) {
            return sum + amount;
          }
          return sum;
        }, 0);
        
        categoryData.push({
          name: categoryName,
          budgeted,
          spent,
          color: colors[index % colors.length],
        });
      }
    });

    // Debug: Log category data
    if (categoryData.length > 0) {
      console.log('[DashboardTab] Finance Planning categories found:', categoryData.map(c => ({ name: c.name, budgeted: c.budgeted })));
    }

    return {
      totalBudget,
      totalSpent,
      utilizationPercent,
      categoryData: categoryData.sort((a, b) => b.budgeted - a.budgeted),
    };
  }, [annualBudgetData, allCategories, budgetsData, dashboardStats, expensesData, budgetYear]);

  // Calculate monthly spending from actual expenses with analysis
  const monthlySpendingData = useMemo(() => {
    const currentYear = parseInt(budgetYear);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyActual: Record<number, number> = {};
    const monthlyPlanned: Record<number, number> = {};
    
    // Initialize monthly planned (budget / 12 for each month)
    const monthlyBudget = budgetOverview.totalBudget / 12;
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
    
    // Get last 6 months with variance analysis
    const currentMonth = new Date().getMonth();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const planned = monthlyPlanned[monthIndex] || 0;
      const actual = monthlyActual[monthIndex] || 0;
      const variance = actual - planned;
      const variancePercent = planned > 0 ? (variance / planned) * 100 : 0;
      
      last6Months.push({
        month: months[monthIndex],
        budget: planned,
        actual: actual,
        variance: variance,
        variancePercent: variancePercent,
      });
    }
    
    return last6Months;
  }, [expensesData, budgetOverview.totalBudget, budgetYear]);

  // Spending Analysis Logic
  const spendingAnalysis = useMemo(() => {
    if (!monthlySpendingData || monthlySpendingData.length === 0) {
      return {
        trend: 'stable',
        trendDirection: 'neutral',
        averageMonthlySpending: 0,
        spendingVelocity: 0,
        forecastRemaining: 0,
        anomalies: [],
        insights: [],
      };
    }

    // Calculate trend (increasing, decreasing, stable)
    const actualValues = monthlySpendingData.map(m => m.actual);
    const avgSpending = actualValues.reduce((sum, val) => sum + val, 0) / actualValues.length;
    
    // Calculate spending velocity (rate of change)
    const recentMonths = actualValues.slice(-3); // Last 3 months
    const earlierMonths = actualValues.slice(0, 3); // First 3 months
    const recentAvg = recentMonths.reduce((sum, val) => sum + val, 0) / recentMonths.length;
    const earlierAvg = earlierMonths.reduce((sum, val) => sum + val, 0) / earlierMonths.length;
    const velocity = earlierAvg > 0 ? ((recentAvg - earlierAvg) / earlierAvg) * 100 : 0;
    
    // Determine trend
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    let trendDirection: 'up' | 'down' | 'neutral' = 'neutral';
    if (velocity > 10) {
      trend = 'increasing';
      trendDirection = 'up';
    } else if (velocity < -10) {
      trend = 'decreasing';
      trendDirection = 'down';
    }

    // Forecast remaining budget
    const monthsElapsed = new Date().getMonth() + 1;
    const monthsRemaining = 12 - monthsElapsed;
    const forecastRemaining = monthsRemaining > 0 
      ? (avgSpending * monthsRemaining) 
      : 0;

    // Detect anomalies (months with >20% variance from average)
    const anomalies: Array<{ month: string; variance: number; type: 'high' | 'low' }> = [];
    monthlySpendingData.forEach(month => {
      if (avgSpending > 0) {
        const varianceFromAvg = ((month.actual - avgSpending) / avgSpending) * 100;
        if (Math.abs(varianceFromAvg) > 20) {
          anomalies.push({
            month: month.month,
            variance: varianceFromAvg,
            type: varianceFromAvg > 0 ? 'high' : 'low',
          });
        }
      }
    });

    // Generate insights
    const insights: string[] = [];
    
    if (trend === 'increasing' && velocity > 20) {
      insights.push(`Spending is increasing rapidly (${velocity.toFixed(1)}% growth). Review spending patterns.`);
    } else if (trend === 'decreasing' && velocity < -20) {
      insights.push(`Spending is decreasing (${velocity.toFixed(1)}% decline). Good cost control.`);
    }
    
    if (anomalies.length > 0) {
      const highAnomalies = anomalies.filter(a => a.type === 'high');
      if (highAnomalies.length > 0) {
        insights.push(`Unusual spending spikes detected in ${highAnomalies.map(a => a.month).join(', ')}.`);
      }
    }

    // Budget burn rate analysis
    const totalBudget = budgetOverview.totalBudget;
    const totalSpent = budgetOverview.totalSpent;
    const burnRate = monthsElapsed > 0 ? (totalSpent / totalBudget) / (monthsElapsed / 12) : 0;
    
    if (burnRate > 1.1) {
      insights.push(`Budget burn rate is ${(burnRate * 100).toFixed(0)}% - spending faster than planned.`);
    } else if (burnRate < 0.8) {
      insights.push(`Budget burn rate is ${(burnRate * 100).toFixed(0)}% - spending slower than planned.`);
    }

    return {
      trend,
      trendDirection,
      averageMonthlySpending: avgSpending,
      spendingVelocity: velocity,
      forecastRemaining,
      anomalies,
      insights,
      burnRate,
    };
  }, [monthlySpendingData, budgetOverview]);

  // Generate intelligent attention items from real data
  const attentionItems = useMemo(() => {
    const items: Array<{
      type: 'error' | 'warning' | 'info' | 'success';
      title: string;
      description: string;
      priority: 'High' | 'Medium' | 'Low' | 'Info';
      action?: string;
      trend?: string;
    }> = [];

    // If no budget exists but there's spending, suggest creating a budget
    if (budgetOverview.totalBudget === 0 && budgetOverview.totalSpent > 0) {
      items.push({
        type: 'warning',
        title: 'Budget Not Created',
        description: `You have spending of $${budgetOverview.totalSpent.toLocaleString()} but no budget has been created. Create a budget to track and manage your procurement spending.`,
        priority: 'High',
        action: 'Create Budget',
        trend: `Current spending: $${budgetOverview.totalSpent.toLocaleString()}`,
      });
    }

    // Budget overrun check (only if budget exists)
    if (budgetOverview.totalBudget > 0) {
      if (budgetOverview.utilizationPercent > 100) {
        const overrun = budgetOverview.totalSpent - budgetOverview.totalBudget;
        items.push({
          type: 'error',
          title: 'Budget Overrun Alert',
          description: `Total spending has exceeded budget by ${((budgetOverview.utilizationPercent - 100)).toFixed(1)}% ($${overrun.toLocaleString()} over budget). Review spending patterns immediately.`,
          priority: 'High',
          action: 'Review',
          trend: `Spending: ${budgetOverview.utilizationPercent.toFixed(1)}% of budget`,
        });
      } else if (budgetOverview.utilizationPercent > 90) {
        items.push({
          type: 'warning',
          title: 'Budget Warning',
          description: `Budget utilization is at ${budgetOverview.utilizationPercent.toFixed(1)}%. Consider reviewing spending to avoid overruns.`,
          priority: 'Medium',
          action: 'Review',
        });
      } else if (budgetOverview.utilizationPercent < 50 && budgetOverview.utilizationPercent > 0) {
        items.push({
          type: 'success',
          title: 'Budget Status',
          description: `Current spending is at ${budgetOverview.utilizationPercent.toFixed(1)}% of budget. Budget is on track.`,
          priority: 'Info',
          action: 'View',
        });
      }
    }

    // Pending approvals
    if (dashboardStats?.pending_approvals > 0) {
      items.push({
        type: 'warning',
        title: 'Approval Pending',
        description: `${dashboardStats.pending_approvals} purchase requisitions totaling $${Number(dashboardStats.pending_amount || 0).toLocaleString()} are awaiting approval.`,
        priority: 'Medium',
        action: 'Review',
        trend: `Total pending: $${Number(dashboardStats.pending_amount || 0).toLocaleString()}`,
      });
    }

    // Budget optimization opportunities
    if (budgetOverview.categoryData.length > 0) {
      const underBudgetCategories = budgetOverview.categoryData.filter(cat => cat.spent < cat.budgeted * 0.5 && cat.budgeted > 0);
      if (underBudgetCategories.length > 0) {
        const category = underBudgetCategories[0];
        const available = category.budgeted - category.spent;
        items.push({
          type: 'info',
          title: 'Cost Optimization Opportunity',
          description: `${category.name} spending is ${((1 - category.spent / category.budgeted) * 100).toFixed(0)}% below budget. Consider reallocating $${available.toLocaleString()} to high-priority categories.`,
          priority: 'Low',
          action: 'View',
          trend: `Potential savings: $${available.toLocaleString()} available`,
        });
      }

      // Check for categories over budget
      const overBudgetCategories = budgetOverview.categoryData.filter(cat => cat.spent > cat.budgeted && cat.budgeted > 0);
      if (overBudgetCategories.length > 0) {
        const category = overBudgetCategories[0];
        const overrun = category.spent - category.budgeted;
        items.push({
          type: 'warning',
          title: 'Category Over Budget',
          description: `${category.name} has exceeded its budget by $${overrun.toLocaleString()}. Review spending in this category.`,
          priority: 'Medium',
          action: 'Review',
          trend: `Overrun: $${overrun.toLocaleString()}`,
        });
      }
    }

    // Add spending trend analysis insights
    if (spendingAnalysis.trend === 'increasing' && spendingAnalysis.spendingVelocity > 15) {
      items.push({
        type: 'warning',
        title: 'Rapid Spending Increase',
        description: `Monthly spending is increasing at ${spendingAnalysis.spendingVelocity.toFixed(1)}% rate. Current average: $${spendingAnalysis.averageMonthlySpending.toLocaleString()}/month.`,
        priority: 'Medium',
        action: 'Review',
        trend: `Forecast: $${spendingAnalysis.forecastRemaining.toLocaleString()} remaining`,
      });
    }

    // Add anomaly detection
    if (spendingAnalysis.anomalies.length > 0) {
      const highAnomalies = spendingAnalysis.anomalies.filter(a => a.type === 'high');
      if (highAnomalies.length > 0) {
        items.push({
          type: 'warning',
          title: 'Spending Anomaly Detected',
          description: `Unusual spending spikes detected in ${highAnomalies.map(a => a.month).join(', ')}. Review these months for unexpected expenses.`,
          priority: 'Medium',
          action: 'Review',
          trend: `Variance: ${highAnomalies[0].variance.toFixed(1)}%`,
        });
      }
    }

    return items.slice(0, 5); // Limit to 5 items
  }, [budgetOverview, dashboardStats, spendingAnalysis]);

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((metric) => (
          <div
            key={metric.label}
            className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_18px_32px_-24px_rgba(15,23,42,0.4)] font-outfit hover:shadow-[0_24px_48px_-24px_rgba(15,23,42,0.5)] transition-shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">{metric.label}</span>
              <div className="rounded-lg bg-[#161950]/10 p-2.5">
                <metric.icon className="h-5 w-5 text-[#161950]" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-[#1A1A1A] font-outfit">{metric.value}</span>
              {metric.subtext && (
                <span className="text-sm font-medium text-gray-600 font-outfit">{metric.subtext}</span>
              )}
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)] font-outfit">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h2 className="text-xl font-semibold text-[#1A1A1A] font-outfit mb-1">Recent Activity</h2>
              <p className="text-sm text-gray-600 font-outfit">Latest procurement transactions and updates</p>
            </div>
            <Clock className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500 font-outfit">Loading activities...</div>
            ) : allActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500 font-outfit">No recent activity</div>
            ) : (
              allActivities.slice(0, 5).map((activity) => {
                const statusBadge = getStatusBadge(activity.status);
                const IconComponent = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50/70 p-5 text-sm shadow-sm transition-all hover:border-[#161950]/40 hover:shadow-md hover:bg-white font-outfit"
                  >
                    <div className={`rounded-full p-2.5 flex-shrink-0 ${
                      activity.status === 'approved' || activity.status === 'fulfilled' || activity.status === 'paid' ? 'bg-emerald-50' :
                      activity.status === 'pending' || activity.status === 'issued' ? 'bg-amber-50' : 'bg-gray-100'
                    }`}>
                      <IconComponent className={`h-4 w-4 ${
                        activity.status === 'approved' || activity.status === 'fulfilled' || activity.status === 'paid' ? 'text-emerald-600' :
                        activity.status === 'pending' || activity.status === 'issued' ? 'text-amber-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <span className="font-medium text-[#1A1A1A] font-outfit truncate">{activity.description}</span>
                        <Badge className={`${statusBadge.className} flex-shrink-0 font-outfit`}>{statusBadge.label}</Badge>
                      </div>
                      <p className="text-xs text-gray-500 font-outfit">
                        {activity.user || 'System'} • {activity.amount ? `$${activity.amount.toFixed(2)}` : 'N/A'} • {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)] font-outfit">
          <div className="flex items-start justify-between pb-2">
            <div>
              <h2 className="text-xl font-semibold text-[#1A1A1A] font-outfit mb-1">Quick Actions</h2>
              <p className="text-sm text-gray-600 font-outfit">Most common procurement tasks</p>
            </div>
            <ShoppingCart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center space-y-2.5 border-gray-200 hover:bg-gray-50 hover:border-[#161950]/30 hover:shadow-sm transition-all font-outfit"
              onClick={() => onTabChange('expenses')}
            >
              <Receipt className="h-5 w-5 text-gray-700" />
              <span className="text-xs font-medium text-gray-700 font-outfit">Submit Expense</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center space-y-2.5 border-gray-200 hover:bg-gray-50 hover:border-[#161950]/30 hover:shadow-sm transition-all font-outfit"
              onClick={() => onTabChange('requisitions')}
            >
              <FileText className="h-5 w-5 text-gray-700" />
              <span className="text-xs font-medium text-gray-700 font-outfit">Create Request</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center space-y-2.5 border-gray-200 hover:bg-gray-50 hover:border-[#161950]/30 hover:shadow-sm transition-all font-outfit"
              onClick={() => onTabChange('orders')}
            >
              <ShoppingCart className="h-5 w-5 text-gray-700" />
              <span className="text-xs font-medium text-gray-700 font-outfit">View Orders</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center space-y-2.5 border-gray-200 hover:bg-gray-50 hover:border-[#161950]/30 hover:shadow-sm transition-all font-outfit"
              onClick={() => onTabChange('invoices')}
            >
              <FileSearch className="h-5 w-5 text-gray-700" />
              <span className="text-xs font-medium text-gray-700 font-outfit">Invoices</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center space-y-2.5 border-gray-200 hover:bg-gray-50 hover:border-[#161950]/30 hover:shadow-sm transition-all font-outfit"
              onClick={() => onTabChange('vendors')}
            >
              <Building2 className="h-5 w-5 text-gray-700" />
              <span className="text-xs font-medium text-gray-700 font-outfit">Manage Vendors</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center space-y-2.5 border-gray-200 hover:bg-gray-50 hover:border-[#161950]/30 hover:shadow-sm transition-all font-outfit"
              onClick={() => onTabChange('budget')}
            >
              <PieChart className="h-5 w-5 text-gray-700" />
              <span className="text-xs font-medium text-gray-700 font-outfit">Budget Analysis</span>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="flex flex-col gap-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)] font-outfit">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h2 className="text-xl font-semibold text-[#1A1A1A] font-outfit mb-1">Budget Overview</h2>
              <p className="text-sm text-gray-600 font-outfit">Current budget allocation and spending trends</p>
            </div>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-[#161950]/5 to-white p-5 hover:shadow-md transition-shadow">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 font-outfit">Total Budget</div>
              <div className="text-2xl font-bold text-[#161950] font-outfit mb-1">
                {isLoading ? '...' : `$${budgetOverview.totalBudget.toLocaleString()}`}
              </div>
              <div className="text-xs text-gray-600 font-outfit">Annual allocation</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-emerald-50 to-white p-5 hover:shadow-md transition-shadow">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 font-outfit">Spent</div>
              <div className="text-2xl font-bold text-emerald-600 font-outfit mb-1">
                {isLoading ? '...' : `$${budgetOverview.totalSpent.toLocaleString()}`}
              </div>
              <div className="text-xs text-gray-600 font-outfit">
                {budgetOverview.utilizationPercent.toFixed(1)}% utilized
              </div>
            </div>
          </div>
          {/* Budget Distribution Section */}
          {(isLoading || budgetLoading) ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-500 font-outfit gap-3">
              <div>Loading budget data...</div>
            </div>
          ) : budgetOverview.categoryData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-500 font-outfit gap-3">
              <div>No budget data available</div>
              {budgetOverview.totalSpent > 0 && (
                <div className="text-sm text-gray-400 font-outfit">
                  You have spending of ${budgetOverview.totalSpent.toLocaleString()} but no budget created.
                </div>
              )}
              <Button
                size="sm"
                className="bg-[#161950] hover:bg-[#1E2B5B] text-white font-outfit mt-2"
                onClick={() => window.location.href = '/module/procurement/budget/create'}
              >
                Create Budget
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
              {/* Budget Distribution Pie Chart */}
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="mb-4">
                  <h4 className="text-base font-semibold text-[#1A1A1A] font-outfit mb-1">Budget Distribution</h4>
                  <p className="text-xs text-gray-600 font-outfit">Allocation by category</p>
                </div>
                <div className="h-64 min-h-[256px]">
                  <ResponsiveContainer width="100%" height="100%" minHeight={256}>
                    <RechartsPieChart>
                      <Pie
                        data={budgetOverview.categoryData.map(cat => ({ name: cat.name, value: cat.budgeted }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: any) => {
                          const percent = Number(entry.percent || 0) * 100;
                          return percent > 5 ? `${entry.name}: ${percent.toFixed(0)}%` : '';
                        }}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        stroke="#ffffff"
                        strokeWidth={2}
                      >
                        {budgetOverview.categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, name: string, props: any) => [
                          `$${value.toLocaleString()}`,
                          `${name} (${((props.payload.percent || 0) * 100).toFixed(1)}%)`
                        ]}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontFamily: 'Outfit',
                          padding: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        labelStyle={{ fontFamily: 'Outfit', fontWeight: 600, color: '#1A1A1A' }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Expense Categories List */}
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="mb-4">
                  <h4 className="text-base font-semibold text-[#1A1A1A] font-outfit mb-1">Expense Categories</h4>
                  <p className="text-xs text-gray-600 font-outfit">All category expenses list</p>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {budgetOverview.categoryData.map((cat, index) => {
                    const percent = budgetOverview.totalBudget > 0 ? (cat.budgeted / budgetOverview.totalBudget) * 100 : 0;
                    return (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-3">
                          <div 
                            className="h-3 w-3 rounded-full" 
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="text-sm font-medium text-gray-900 font-outfit">{cat.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900 font-outfit">${cat.budgeted.toLocaleString()}</div>
                          <div className="text-xs text-gray-500 font-outfit">{percent.toFixed(1)}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)] font-outfit">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h2 className="text-xl font-semibold text-[#1A1A1A] font-outfit mb-1">Spending Trends</h2>
              <p className="text-sm text-gray-600 font-outfit">Monthly spending comparison</p>
            </div>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%" minHeight={256}>
              <BarChart
                data={monthlySpendingData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontFamily: 'Outfit', fontSize: 12, fill: '#6B7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis
                  tick={{ fontFamily: 'Outfit', fontSize: 12, fill: '#6B7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name]}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontFamily: 'Outfit',
                    padding: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  labelStyle={{ fontFamily: 'Outfit', fontWeight: 600, color: '#1A1A1A' }}
                />
                <Legend
                  wrapperStyle={{ fontFamily: 'Outfit', fontSize: '12px', paddingTop: '20px' }}
                  iconType="square"
                />
                <Bar dataKey="budget" fill="#161950" name="Budget" radius={[6, 6, 0, 0]} />
                <Bar dataKey="actual" fill="#9333EA" name="Actual" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)] font-outfit">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <Brain className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#1A1A1A] font-outfit">Intelligent Attention Items</h2>
              <p className="text-xs text-gray-600 font-outfit mt-0.5">AI-powered insights and recommendations</p>
            </div>
            <Badge className="bg-purple-100 text-purple-800 font-outfit">AI-Powered</Badge>
          </div>
          <Bell className="h-5 w-5 text-gray-400" />
        </div>
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500 font-outfit">Loading attention items...</div>
          ) : attentionItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500 font-outfit">No attention items at this time</div>
          ) : (
            attentionItems.map((item, index) => {
              const colorClasses = {
                error: {
                  border: 'border-red-200',
                  bg: 'from-red-50 to-red-50/50 hover:from-red-100/80 hover:to-red-100/40',
                  iconBg: 'bg-red-100',
                  iconColor: 'text-red-600',
                  textColor: 'text-red-900',
                  textDesc: 'text-red-700',
                  textTrend: 'text-red-600',
                  badge: 'bg-red-200 text-red-800',
                  button: 'border-red-300 text-red-600 hover:bg-red-100',
                },
                warning: {
                  border: 'border-amber-200',
                  bg: 'from-amber-50 to-amber-50/50 hover:from-amber-100/80 hover:to-amber-100/40',
                  iconBg: 'bg-amber-100',
                  iconColor: 'text-amber-600',
                  textColor: 'text-amber-900',
                  textDesc: 'text-amber-700',
                  textTrend: 'text-amber-600',
                  badge: 'bg-amber-200 text-amber-800',
                  button: 'border-amber-300 text-amber-600 hover:bg-amber-100',
                },
                info: {
                  border: 'border-blue-200',
                  bg: 'from-blue-50 to-blue-50/50 hover:from-blue-100/80 hover:to-blue-100/40',
                  iconBg: 'bg-blue-100',
                  iconColor: 'text-blue-600',
                  textColor: 'text-blue-900',
                  textDesc: 'text-blue-700',
                  textTrend: 'text-blue-600',
                  badge: 'bg-blue-200 text-blue-800',
                  button: 'border-blue-300 text-blue-600 hover:bg-blue-100',
                },
                success: {
                  border: 'border-emerald-200',
                  bg: 'from-emerald-50 to-emerald-50/50 hover:from-emerald-100/80 hover:to-emerald-100/40',
                  iconBg: 'bg-emerald-100',
                  iconColor: 'text-emerald-600',
                  textColor: 'text-emerald-900',
                  textDesc: 'text-emerald-700',
                  textTrend: 'text-emerald-600',
                  badge: 'bg-emerald-200 text-emerald-800',
                  button: 'border-emerald-300 text-emerald-600 hover:bg-emerald-100',
                },
              };

              const colors = colorClasses[item.type];
              const IconComponent = item.type === 'error' ? AlertTriangle : 
                                   item.type === 'warning' ? Bell :
                                   item.type === 'info' ? Target : CheckCircle;
              const TrendIcon = item.trend?.includes('trend') || item.trend?.includes('+') || item.trend?.includes('%') ? TrendingUp :
                               item.trend?.includes('savings') || item.trend?.includes('available') ? DollarSign : Clock;

              return (
                <div key={index} className={`flex items-start gap-4 p-5 rounded-xl border-2 ${colors.border} bg-gradient-to-r ${colors.bg} transition-all shadow-sm`}>
                  <div className={`rounded-full ${colors.iconBg} p-2.5 flex-shrink-0`}>
                    <IconComponent className={`h-5 w-5 ${colors.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-semibold ${colors.textColor} text-sm font-outfit`}>{item.title}</h3>
                      <Badge className={`${colors.badge} text-xs font-outfit`}>{item.priority} Priority</Badge>
                    </div>
                    <p className={`text-sm ${colors.textDesc} mb-3 leading-relaxed font-outfit`}>
                      {item.description}
                    </p>
                    {item.trend && (
                      <div className={`flex items-center space-x-2 text-xs ${colors.textTrend} font-outfit`}>
                        <TrendIcon className="h-3.5 w-3.5" />
                        <span>{item.trend}</span>
                      </div>
                    )}
                  </div>
                  {item.action && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className={`${colors.button} font-outfit flex-shrink-0`}
                      onClick={() => {
                        if (item.action === 'Review') {
                          onTabChange('requisitions');
                        } else if (item.action === 'Create Budget') {
                          window.location.href = '/module/procurement/budget/create';
                        } else {
                          onTabChange('budget');
                        }
                      }}
                    >
                      {item.action}
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

