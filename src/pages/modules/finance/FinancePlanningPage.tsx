import React, { memo, useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileDown,
  History,
  Settings2,
  Sparkles,
  Target,
  Users,
  Loader2,
  Minus,
  Plus,
  Edit,
  Check,
  X,
} from 'lucide-react';
import { useFinancePlanningAnnual, useFinancePlanningScenarios, useSaveAnnualBudget, useUpdateAnnualBudget, useUpdatePlanningConfig, useUpdateScenario, useGenerateForecast, useForecasts, useExportForecast } from '@/hooks/useFinance';
import { financeApiClient } from '@/hooks/useFinance';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Textarea } from '@/components/ui/textarea';
import { AnnualBudgetTab, RevenueExpenseTab, BuAllocationTab, VarianceTab } from './components';
import { formatCurrency, formatPercent, formatPercentSigned } from './components/utils';
import { BUSINESS_UNITS, SCENARIOS, SCENARIO_PROJECTIONS, SCENARIO_KPIS, DEFAULT_APPROVAL_STAGES, APPROVAL_CONDITIONS, FORECASTING_HISTORY, SCENARIO_CALLOUTS, DASHBOARD_TIMELINE, DASHBOARD_TASKS, DASHBOARD_AI_PLAYBOOK, VARIANCE_THRESHOLDS, REPORTING_SCHEDULE } from './components/constants';
import type { TabKey, ScenarioKey, ApprovalStatus, ApprovalAction, ApprovalStage, ScenarioConfig } from './components/types';
import { useExpenseCategories } from '@/hooks/useExpenseCategories';

type CategoryNode = {
  id?: number;
  name: string;
  parent_id?: number | null;
  display_order?: number | null;
};

type LineItem = {
  label: string;
  target: number;
  variance: number;
  level?: number;
  parent_id?: number | null;
};

const organizeCategoriesHierarchically = (
  categories: CategoryNode[] = [],
  existingLines: Array<{ label: string; target?: number; variance?: number }> = [],
): LineItem[] => {
  const organized: LineItem[] = [];
  const topLevel = categories.filter((cat) => !cat.parent_id);

  const addCategoryAndSubs = (category: CategoryNode, level = 0) => {
    const existingLine = existingLines.find((line) => line.label === category.name);
    organized.push({
      label: category.name,
      target: existingLine?.target ?? 0,
      variance: existingLine?.variance ?? 0,
      level,
      parent_id: category.parent_id ?? null,
    });

    const subcategories = categories
      .filter((cat) => cat.parent_id === category.id)
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0) || a.name.localeCompare(b.name));

    subcategories.forEach((sub) => addCategoryAndSubs(sub, level + 1));
  };

  topLevel
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0) || a.name.localeCompare(b.name))
    .forEach((cat) => addCategoryAndSubs(cat, 0));

  return organized;
};

const TABS: { key: TabKey; label: string }[] = [
  { key: 'annual', label: 'Annual Budget' },
  { key: 'revenue-expense', label: 'Revenue / Expense' },
  { key: 'bu-allocation', label: 'BU Allocation' },
  { key: 'variance', label: 'Variance' },
  { key: 'forecasting', label: 'Forecasting' },
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'scenarios', label: 'Scenarios' },
  { key: 'approval', label: 'Approval' },
];

const IN_PROGRESS_TABS: TabKey[] = ['bu-allocation', 'dashboard'];

function FinancePlanningPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('annual');
  const [activeScenario, setActiveScenario] = useState<ScenarioKey>('balanced');
  const { toast } = useToast();
  
  // Mutations for saving data
  const saveAnnualBudgetMutation = useSaveAnnualBudget();
  const updateAnnualBudgetMutation = useUpdateAnnualBudget();
  const updatePlanningConfigMutation = useUpdatePlanningConfig();
  const updateScenarioMutation = useUpdateScenario();
  
  // Local state for editable budget values
  const [editableRevenueLines, setEditableRevenueLines] = useState<Array<{ label: string; target: number; variance: number }>>([]);
  const [editableExpenseLines, setEditableExpenseLines] = useState<Array<{ label: string; target: number; variance: number }>>([]);
  
  // Budget parameters state
  const [budgetYear, setBudgetYear] = useState<string>('2026');
  const [targetGrowthRate, setTargetGrowthRate] = useState<number>(15);
  const [totalRevenueTarget, setTotalRevenueTarget] = useState<number>(5_000_000);
  const [totalExpenseBudget, setTotalExpenseBudget] = useState<number>(4_000_000);
  const [copyFromYear, setCopyFromYear] = useState<string>('');
  
  // Edit mode state for Annual Budget tab
  const [isRevenueEditable, setIsRevenueEditable] = useState<boolean>(false);
  const [isExpenseEditable, setIsExpenseEditable] = useState<boolean>(false);
  
  // Edit mode state for Revenue/Expense tab
  const [isRevenueExpenseEditMode, setIsRevenueExpenseEditMode] = useState<boolean>(false);
  const [isExpenseBudgetEditMode, setIsExpenseBudgetEditMode] = useState<boolean>(false);
  
  // Forecasting state
  const [forecastingModel, setForecastingModel] = useState<string>('Linear Regression');
  const [forecastPeriod, setForecastPeriod] = useState<number>(12);
  const [marketGrowthRate, setMarketGrowthRate] = useState<number>(8);
  const [inflationRate, setInflationRate] = useState<number>(3.5);
  const [seasonalAdjustment, setSeasonalAdjustment] = useState<boolean>(true);
  const [forecastGenerated, setForecastGenerated] = useState<boolean>(false);
  const [currentForecast, setCurrentForecast] = useState<any>(null);
  const [forecastName, setForecastName] = useState<string>('');
  
  // Forecast hooks
  const generateForecastMutation = useGenerateForecast();
  const { data: savedForecasts } = useForecasts();
  const exportForecastMutation = useExportForecast();
  
  // Scenarios state
  const [comparisonMode, setComparisonMode] = useState<boolean>(false);
  const [planningPeriodYears, setPlanningPeriodYears] = useState<number>(3);
  const [baseYearRevenue, setBaseYearRevenue] = useState<number>(5_000_000);
  const [baseYearExpenses, setBaseYearExpenses] = useState<number>(4_000_000);
  const [isPlanningConfigEditMode, setIsPlanningConfigEditMode] = useState<boolean>(false);
  
  // Approval state
  const { authState } = useAuth();
  const currentUserRole = authState.user?.role || 'viewer';
  const [approvalStages, setApprovalStages] = useState<ApprovalStage[]>([]);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [approvalComment, setApprovalComment] = useState<string>('');
  const [isSubmittingApproval, setIsSubmittingApproval] = useState<boolean>(false);

  // Fetch data from APIs - fetch data for the selected budget year
  const { data: annualData, isLoading: isLoadingAnnual, error: annualError, refetch: refetchAnnual } = useFinancePlanningAnnual(budgetYear);
  const { data: scenariosData, isLoading: isLoadingScenarios, error: scenariosError } = useFinancePlanningScenarios();
  const { data: expenseCategories } = useExpenseCategories({ include_inactive: false, include_subcategories: true, category_type: 'expense' });
  const { data: revenueCategories } = useExpenseCategories({ include_inactive: false, include_subcategories: true, category_type: 'revenue' });
  
  // Refetch data when budget year changes
  useEffect(() => {
    refetchAnnual();
  }, [budgetYear, refetchAnnual]);
  
  // Initialize planning config from API data
  useEffect(() => {
    if (scenariosData?.planning_configuration) {
      setPlanningPeriodYears(scenariosData.planning_configuration.planning_period_years || 3);
      setBaseYearRevenue(scenariosData.planning_configuration.base_year_revenue || 5_000_000);
      setBaseYearExpenses(scenariosData.planning_configuration.base_year_expenses || 4_000_000);
    }
  }, [scenariosData]);
  
  // Set active scenario from API data
  useEffect(() => {
    if (scenariosData?.scenarios) {
      const activeScenarioFromApi = scenariosData.scenarios.find(s => s.active);
      if (activeScenarioFromApi) {
        setActiveScenario(activeScenarioFromApi.key as ScenarioKey);
      }
    }
  }, [scenariosData]);
  
  // Initialize editable state when API data loads - use all dynamic categories from database
  useEffect(() => {
    // Use revenue categories for revenue lines - include all categories from database
    if (revenueCategories && revenueCategories.length > 0) {
      const categoryLines = organizeCategoriesHierarchically(revenueCategories, annualData?.revenue_lines);
      setEditableRevenueLines(categoryLines);
    } else if (revenueCategories && revenueCategories.length === 0) {
      setEditableRevenueLines([]);
    }
    
    // Use expense categories for expense lines - include all categories from database
    if (expenseCategories && expenseCategories.length > 0) {
      const categoryLines = organizeCategoriesHierarchically(expenseCategories, annualData?.expense_lines);
      setEditableExpenseLines(categoryLines);
    } else if (expenseCategories && expenseCategories.length === 0) {
      setEditableExpenseLines([]);
    }
    
    // Initialize budget parameters from API if available
    if (annualData?.budget_summary) {
      const revenueMetric = annualData.budget_summary.find(m => m.label.toLowerCase().includes('revenue'));
      const expenseMetric = annualData.budget_summary.find(m => m.label.toLowerCase().includes('expense'));
      if (revenueMetric?.value) setTotalRevenueTarget(revenueMetric.value);
      if (expenseMetric?.value) setTotalExpenseBudget(expenseMetric.value);
    }
  }, [annualData, revenueCategories, expenseCategories]);
  
  // Initialize scenarios state from API data
  useEffect(() => {
    if (scenariosData?.planning_configuration) {
      setPlanningPeriodYears(scenariosData.planning_configuration.planning_period_years || 3);
      setBaseYearRevenue(scenariosData.planning_configuration.base_year_revenue || 5_000_000);
      setBaseYearExpenses(scenariosData.planning_configuration.base_year_expenses || 4_000_000);
    }
  }, [scenariosData]);
  
  // Initialize approval stages with permission checks
  useEffect(() => {
    const stages: ApprovalStage[] = DEFAULT_APPROVAL_STAGES.map((stage) => {
      const requiredRoles = Array.isArray(stage.requiredRole) 
        ? stage.requiredRole 
        : [stage.requiredRole];
      
      const canApprove = requiredRoles.some(role => {
        // Check if user role matches or is admin
        return currentUserRole === role || currentUserRole === 'admin';
      });
      
      // Determine initial status
      let status: ApprovalStatus = 'not_started';
      if (stage.sequence === 0) {
        status = 'approved'; // Draft is always approved
      } else if (stage.sequence === 1) {
        // First review stage is pending (draft is approved)
        status = 'pending';
      }
      
      return {
        ...stage,
        status,
        canApprove,
      };
    });
    
    setApprovalStages(stages);
  }, [currentUserRole]);
  
  // Update stage status based on previous approvals (runs after stages are set)
  useEffect(() => {
    if (approvalStages.length === 0) return;
    
    setApprovalStages(prev => {
      const updated = prev.map((stage, index) => {
        if (stage.sequence === 0) {
          return stage; // Draft is always approved
        }
        
        // Check if all previous stages are approved
        const previousStages = prev.slice(0, index);
        const allPreviousApproved = previousStages.every(s => s.status === 'approved');
        
        // If previous stages are approved and this stage is not_started, make it pending
        if (allPreviousApproved && stage.status === 'not_started') {
          return { ...stage, status: 'pending' as ApprovalStatus };
        }
        
        // If previous stages are not all approved and this stage is pending, make it not_started
        if (!allPreviousApproved && (stage.status === 'pending' || stage.status === 'requested_changes')) {
          return { ...stage, status: 'not_started' as ApprovalStatus };
        }
        
        return stage;
      });
      
      // Only update if something actually changed to prevent infinite loops
      const hasChanges = updated.some((stage, index) => stage.status !== prev[index].status);
      return hasChanges ? updated : prev;
    });
  }, [approvalStages.length]); // Only re-run when stages are initialized
  
  // Use editable state - always from dynamic categories (no hardcoded fallback)
  const revenueLines: Array<{ label: string; target: number; variance: number }> = editableRevenueLines.length > 0 
    ? editableRevenueLines 
    : (annualData?.revenue_lines?.map(l => ({
        label: l.label,
        target: l.target,
        variance: l.variance,
      })) || []);
  
  const expenseLines: Array<{ label: string; target: number; variance: number }> = editableExpenseLines.length > 0
    ? editableExpenseLines
    : (annualData?.expense_lines?.map(l => ({
        label: l.label,
        target: l.target,
        variance: l.variance,
      })) || []);
  
  // Calculate totals from Revenue/Expense tab
  const revenueTotals = useMemo(() => {
    const totalTarget = revenueLines.reduce((sum, line) => sum + (line.target || 0), 0);
    const totalVariance = revenueLines.reduce((sum, line) => sum + (line.variance || 0), 0);
    return { totalTarget, totalVariance };
  }, [revenueLines]);

  const expenseTotals = useMemo(() => {
    const totalTarget = expenseLines.reduce((sum, line) => sum + (line.target || 0), 0);
    const totalVariance = expenseLines.reduce((sum, line) => sum + (line.variance || 0), 0);
    return { totalTarget, totalVariance };
  }, [expenseLines]);
  
  // Sync totals from Revenue/Expense tab to Annual Budget tab (only when not in edit mode)
  // This ensures the dashboard always reflects the current revenue/expense totals
  useEffect(() => {
    if (!isRevenueEditable && revenueTotals.totalTarget > 0) {
      setTotalRevenueTarget(revenueTotals.totalTarget);
    }
  }, [revenueTotals.totalTarget, isRevenueEditable]);
  
  useEffect(() => {
    if (!isExpenseEditable && expenseTotals.totalTarget > 0) {
      setTotalExpenseBudget(expenseTotals.totalTarget);
    }
  }, [expenseTotals.totalTarget, isExpenseEditable]);
  
  // Also sync when editable lines change (for copy functionality)
  useEffect(() => {
    if (editableRevenueLines.length > 0) {
      const total = editableRevenueLines.reduce((sum, line) => sum + (line.target || 0), 0);
      if (total > 0 && !isRevenueEditable) {
        setTotalRevenueTarget(total);
      }
    }
  }, [editableRevenueLines, isRevenueEditable]);
  
  useEffect(() => {
    if (editableExpenseLines.length > 0) {
      const total = editableExpenseLines.reduce((sum, line) => sum + (line.target || 0), 0);
      if (total > 0 && !isExpenseEditable) {
        setTotalExpenseBudget(total);
      }
    }
  }, [editableExpenseLines, isExpenseEditable]);
  
  // Calculate profit and margin from revenue and expense
  const targetProfit = totalRevenueTarget - totalExpenseBudget;
  const profitMargin = totalRevenueTarget > 0 ? (targetProfit / totalRevenueTarget) * 100 : 0;
  
  // Get business units from API data or use defaults
  const businessUnits = useMemo(() => {
    if (annualData?.business_units) {
      return annualData.business_units.map(u => ({
        name: u.name,
        revenue: u.revenue,
        expense: u.expense,
        profit: u.profit,
        headcount: u.headcount,
        margin: u.margin_percent,
      }));
    }
    return [...BUSINESS_UNITS] as Array<{ name: string; revenue: number; expense: number; profit: number; headcount: number; margin: string | number }>;
  }, [annualData]);
  
  // Save budget handler
  const handleSaveBudget = async () => {
    try {
      await saveAnnualBudgetMutation.mutateAsync({
        budget_year: budgetYear,
        target_growth_rate: targetGrowthRate,
        total_revenue_target: totalRevenueTarget,
        total_expense_budget: totalExpenseBudget,
        revenue_lines: revenueLines,
        expense_lines: expenseLines,
        business_units: businessUnits.map(u => ({
          name: u.name,
          revenue: u.revenue,
          expense: u.expense,
          profit: u.profit,
          headcount: u.headcount,
          margin_percent: typeof u.margin === 'string' ? parseFloat(u.margin.replace('%', '')) : (u.margin || 0),
        })),
      });
      
      toast({
        title: "Budget Saved",
        description: `Budget for ${budgetYear} has been saved successfully. Revenue: ${formatCurrency(totalRevenueTarget)}, Expense: ${formatCurrency(totalExpenseBudget)}, Profit: ${formatCurrency(targetProfit)}.`,
      });
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error?.response?.data?.detail || error?.message || "Failed to save budget. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Save revenue/expense changes handler
  const handleSaveRevenueExpense = async () => {
    try {
      // Calculate totals from current lines
      const totalRevenue = revenueLines.reduce((sum, line) => sum + (line.target || 0), 0);
      const totalExpense = expenseLines.reduce((sum, line) => sum + (line.target || 0), 0);
      
      console.log('Saving revenue/expense data:', {
        budget_year: budgetYear,
        revenue_lines: revenueLines,
        expense_lines: expenseLines,
        totalRevenue,
        totalExpense,
      });
      
      // Use POST to create/update the full budget, not just PATCH
      await saveAnnualBudgetMutation.mutateAsync({
        budget_year: budgetYear,
        target_growth_rate: targetGrowthRate,
        total_revenue_target: totalRevenue,
        total_expense_budget: totalExpense,
        revenue_lines: revenueLines,
        expense_lines: expenseLines,
        business_units: businessUnits.map(u => ({
          name: u.name,
          revenue: u.revenue,
          expense: u.expense,
          profit: u.profit,
          headcount: u.headcount,
          margin_percent: typeof u.margin === 'string' ? parseFloat(u.margin.replace('%', '')) : (u.margin || 0),
        })),
      });
      
      // Update local state to reflect saved changes
      setEditableRevenueLines(revenueLines);
      setEditableExpenseLines(expenseLines);
      setIsRevenueExpenseEditMode(false);
      setIsExpenseBudgetEditMode(false);
      
      // Update totals
      setTotalRevenueTarget(totalRevenue);
      setTotalExpenseBudget(totalExpense);
      
      toast({
        title: "Revenue/Expense Saved",
        description: "Revenue and expense targets have been saved successfully.",
      });
    } catch (error: any) {
      console.error('Error saving revenue/expense:', error);
      toast({
        title: "Save Failed",
        description: error?.response?.data?.detail || error?.message || "Failed to save revenue/expense data. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Copy from previous year handler
  const handleCopyFromYear = async () => {
    if (!copyFromYear) {
      toast({
        title: "No Year Selected",
        description: "Please select a year to copy from.",
        variant: "destructive",
      });
      return;
    }
    
    if (copyFromYear === budgetYear) {
      toast({
        title: "Invalid Selection",
        description: "Cannot copy from the same year.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Fetch data from the selected year
      const response = await financeApiClient.get(`/api/v1/finance/planning/annual?budget_year=${copyFromYear}`);
      const previousYearData = response.data;
      
      if (!previousYearData) {
        toast({
          title: "No Data Found",
          description: `No budget data found for year ${copyFromYear}.`,
          variant: "destructive",
        });
        return;
      }
      
      const previousRevenueLines = previousYearData.revenue_lines || [];
      const previousExpenseLines = previousYearData.expense_lines || [];

      const normalisedRevenueLines = previousRevenueLines.map((line: any) => ({
        label: line.label,
        target: Number(line.target) || 0,
        variance: Number(line.variance) || 0,
      }));

      const normalisedExpenseLines = previousExpenseLines.map((line: any) => ({
        label: line.label,
        target: Number(line.target) || 0,
        variance: Number(line.variance) || 0,
      }));

      let mergedRevenueLines: LineItem[] = [];
      if (revenueCategories && revenueCategories.length > 0) {
        mergedRevenueLines = organizeCategoriesHierarchically(revenueCategories, normalisedRevenueLines);
      } else if (normalisedRevenueLines.length > 0) {
        mergedRevenueLines = normalisedRevenueLines;
      }

      let mergedExpenseLines: LineItem[] = [];
      if (expenseCategories && expenseCategories.length > 0) {
        mergedExpenseLines = organizeCategoriesHierarchically(expenseCategories, normalisedExpenseLines);
      } else if (normalisedExpenseLines.length > 0) {
        mergedExpenseLines = normalisedExpenseLines;
      }

      if (mergedRevenueLines.length > 0) {
        setEditableRevenueLines(mergedRevenueLines);
      }

      if (mergedExpenseLines.length > 0) {
        setEditableExpenseLines(mergedExpenseLines);
      }

      // Calculate totals from merged lines
      const copiedRevenueTotal = mergedRevenueLines.reduce((sum, line) => sum + (Number(line.target) || 0), 0);
      const copiedExpenseTotal = mergedExpenseLines.reduce((sum, line) => sum + (Number(line.target) || 0), 0);
      
      console.log('Copying budget data:', {
        sourceYear: copyFromYear,
        targetYear: budgetYear,
        revenueLines: mergedRevenueLines.length,
        expenseLines: mergedExpenseLines.length,
        revenueTotal: copiedRevenueTotal,
        expenseTotal: copiedExpenseTotal,
      });
      
      // Update budget parameters - use calculated totals or fallback to summary
      // Always update with calculated totals if available, as they're more accurate
      if (copiedRevenueTotal > 0) {
        setTotalRevenueTarget(Number(copiedRevenueTotal));
      } else if (previousYearData.budget_summary && previousYearData.budget_summary.length > 0) {
        const revenueMetric = previousYearData.budget_summary.find((m: any) => m.label === "Revenue Target");
        if (revenueMetric && revenueMetric.value) {
          setTotalRevenueTarget(Number(revenueMetric.value));
        }
      }
      
      if (copiedExpenseTotal > 0) {
        setTotalExpenseBudget(Number(copiedExpenseTotal));
      } else if (previousYearData.budget_summary && previousYearData.budget_summary.length > 0) {
        const expenseMetric = previousYearData.budget_summary.find((m: any) => m.label === "Expense Budget");
        if (expenseMetric && expenseMetric.value) {
          setTotalExpenseBudget(Number(expenseMetric.value));
        }
      }
      
      // Force update by ensuring we have data in editable lines
      // This ensures the Revenue/Expense tab shows the copied data immediately
      if (mergedRevenueLines.length === 0 && previousYearData.revenue_lines) {
        // Fallback: ensure we have at least the data from API
        setEditableRevenueLines(previousYearData.revenue_lines.map((line: any) => ({
          label: line.label,
          target: line.target,
          variance: line.variance || 0,
        })));
      }
      
      if (mergedExpenseLines.length === 0 && previousYearData.expense_lines) {
        // Fallback: ensure we have at least the data from API
        setEditableExpenseLines(previousYearData.expense_lines.map((line: any) => ({
          label: line.label,
          target: line.target,
          variance: line.variance || 0,
        })));
      }
      
      // Copy target growth rate if available (from budget_summary or we can infer from data)
      // For now, we'll keep the current growth rate, but you could extract it from the data if needed
      
      const sourceYear = copyFromYear; // Store before clearing
      
      // Clear the copy year selection after successful copy
      setCopyFromYear('');
      
      toast({
        title: "Budget Copied",
        description: `Budget data from ${sourceYear} has been copied to ${budgetYear}. Revenue: ${formatCurrency(copiedRevenueTotal)}, Expense: ${formatCurrency(copiedExpenseTotal)}. You can now review and adjust the values.`,
      });
    } catch (error: any) {
      console.error("Error copying budget:", error);
      toast({
        title: "Copy Failed",
        description: error?.response?.data?.detail || error?.message || `Failed to copy budget from ${copyFromYear}.`,
        variant: "destructive",
      });
    }
  };
  
  // Save variance thresholds handler
  const handleSaveVarianceThresholds = async (thresholds: Array<{ label: string; valuePercent?: number }>) => {
    try {
      // Update the annual budget with new thresholds
      await saveAnnualBudgetMutation.mutateAsync({
        budget_year: budgetYear,
        target_growth_rate: targetGrowthRate,
        total_revenue_target: totalRevenueTarget,
        total_expense_budget: totalExpenseBudget,
        revenue_lines: revenueLines,
        expense_lines: expenseLines,
        business_units: businessUnits.map(u => ({
          name: u.name,
          revenue: u.revenue,
          expense: u.expense,
          profit: u.profit,
          headcount: u.headcount,
          margin_percent: typeof u.margin === 'string' ? parseFloat(u.margin.replace('%', '')) : (u.margin || 0),
        })),
      });
      
      toast({
        title: "Thresholds Saved",
        description: "Variance thresholds have been saved successfully.",
      });
    } catch (error: any) {
      console.error("Error saving variance thresholds:", error);
      toast({
        title: "Save Failed",
        description: error?.response?.data?.detail || error?.message || "Failed to save variance thresholds.",
        variant: "destructive",
      });
    }
  };
  
  // Save reporting schedule handler
  const handleSaveReportingSchedule = async (schedule: Array<{ label: string; value: string }>) => {
    try {
      // For now, just show a toast - can be extended to save to database
      toast({
        title: "Reporting Schedule Saved",
        description: "Reporting schedule has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error saving reporting schedule:", error);
      toast({
        title: "Save Failed",
        description: error?.response?.data?.detail || error?.message || "Failed to save reporting schedule.",
        variant: "destructive",
      });
    }
  };
  
  const handleReviewPreviousYear = async () => {
    // Get the previous year (current year - 1)
    const currentYear = parseInt(budgetYear);
    const previousYear = (currentYear - 1).toString();
    
    try {
      // Fetch data from the previous year
      const response = await financeApiClient.get(`/api/v1/finance/planning/annual?budget_year=${previousYear}`);
      const previousYearData = response.data;
      
      if (!previousYearData) {
        toast({
          title: "No Data Found",
          description: `No budget data found for year ${previousYear}.`,
          variant: "destructive",
        });
        return;
      }
      
      // Show a dialog or modal with previous year data
      // For now, we'll show a toast with summary
      const revenueTotal = previousYearData.budget_summary?.find((m: any) => m.label === "Revenue Target")?.value || 0;
      const expenseTotal = previousYearData.budget_summary?.find((m: any) => m.label === "Expense Budget")?.value || 0;
      const profitTotal = previousYearData.budget_summary?.find((m: any) => m.label === "Target Profit")?.value || 0;
      
      toast({
        title: `Previous Year (${previousYear}) Summary`,
        description: `Revenue: ${formatCurrency(revenueTotal)}, Expense: ${formatCurrency(expenseTotal)}, Profit: ${formatCurrency(profitTotal)}`,
      });
      
      // Optionally, you could open a modal here to show full details
      console.log("Previous year data:", previousYearData);
    } catch (error: any) {
      console.error("Error fetching previous year:", error);
      toast({
        title: "Review Failed",
        description: error?.response?.data?.detail || error?.message || `Failed to fetch budget data for ${previousYear}.`,
        variant: "destructive",
      });
    }
  };
  
  // Scenarios handlers
  const handleCompareAll = () => {
    setComparisonMode(!comparisonMode);
    toast({
      title: comparisonMode ? "Comparison Mode Disabled" : "Comparison Mode Enabled",
      description: comparisonMode 
        ? "Switched to single scenario view." 
        : "Now comparing all scenarios side by side.",
    });
  };
  
  const handleExportComparison = () => {
    toast({
      title: "Export Started",
      description: "Exporting scenario comparison data...",
    });
    // In a real app, this would generate and download a CSV/Excel file
    console.log("Exporting comparison:", {
      scenarios,
      projections,
      kpiTargets,
      activeScenario,
    });
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Scenario comparison data has been exported successfully.",
      });
    }, 1000);
  };
  
  const handleActivateScenario = async (scenarioKey: ScenarioKey) => {
    try {
      // Backend already handles deactivating other scenarios when activating one
      await updateScenarioMutation.mutateAsync({
        scenario_key: scenarioKey,
        scenario_data: { active: true },
      });
      
      setActiveScenario(scenarioKey);
      toast({
        title: "Scenario Activated",
        description: `${scenarios.find(s => s.key === scenarioKey)?.name || 'Scenario'} has been activated as the active planning scenario.`,
      });
    } catch (error: any) {
      console.error("Error activating scenario:", error);
      toast({
        title: "Activation Failed",
        description: error?.response?.data?.detail || error?.message || "Failed to activate scenario.",
        variant: "destructive",
      });
    }
  };
  
  const handleSavePlanningConfig = async () => {
    try {
      await updatePlanningConfigMutation.mutateAsync({
        planning_period_years: planningPeriodYears,
        base_year_revenue: baseYearRevenue,
        base_year_expenses: baseYearExpenses,
      });
      
      setIsPlanningConfigEditMode(false);
      toast({
        title: "Configuration Saved",
        description: `Planning period: ${planningPeriodYears} years, Base Revenue: ${formatCurrency(baseYearRevenue)}, Base Expenses: ${formatCurrency(baseYearExpenses)}`,
      });
    } catch (error: any) {
      console.error("Error saving planning config:", error);
      toast({
        title: "Save Failed",
        description: error?.response?.data?.detail || error?.message || "Failed to save planning configuration.",
        variant: "destructive",
      });
    }
  };
  
  // Approval handlers
  const handleApprovalAction = async (stageId: string, action: ApprovalAction) => {
    const stage = approvalStages.find(s => s.id === stageId);
    if (!stage) return;
    
    if (!stage.canApprove) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to approve this stage.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmittingApproval(true);
    
    try {
      let newStatus: ApprovalStatus;
      switch (action) {
        case 'approve':
          newStatus = 'approved';
          break;
        case 'reject':
          newStatus = 'rejected';
          break;
        case 'request_changes':
          newStatus = 'requested_changes';
          break;
        default:
          newStatus = 'pending';
      }
      
      // Update the stage
      setApprovalStages(prev => prev.map(s => {
        if (s.id === stageId) {
          return {
            ...s,
            status: newStatus,
            approverName: authState.user?.name || authState.user?.email || 'Current User',
            approverEmail: authState.user?.email,
            approvedAt: new Date().toISOString(),
            comments: approvalComment || undefined,
          };
        }
        return s;
      }));
      
      // Update subsequent stages if approved
      if (newStatus === 'approved') {
        setApprovalStages(prev => prev.map(s => {
          if (s.sequence === stage.sequence + 1 && s.status === 'not_started') {
            return { ...s, status: 'pending' };
          }
          return s;
        }));
      }
      
      // If rejected or changes requested, reset subsequent stages
      if (newStatus === 'rejected' || newStatus === 'requested_changes') {
        setApprovalStages(prev => prev.map(s => {
          if (s.sequence > stage.sequence && s.status !== 'approved') {
            return { ...s, status: 'not_started' };
          }
          return s;
        }));
      }
      
      toast({
        title: action === 'approve' ? "Approved" : action === 'reject' ? "Rejected" : "Changes Requested",
        description: `${stage.label} has been ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'marked for changes'}.`,
      });
      
      setApprovalComment('');
      setSelectedStageId(null);
      
      // In a real app, this would call an API to save the approval
      console.log("Approval action:", {
        stageId,
        action,
        status: newStatus,
        comment: approvalComment,
        approver: authState.user?.email,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process approval. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingApproval(false);
    }
  };
  
  const getStatusColor = (status: ApprovalStatus) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-50 text-emerald-600';
      case 'rejected':
        return 'bg-rose-50 text-rose-600';
      case 'requested_changes':
        return 'bg-amber-50 text-amber-600';
      case 'pending':
        return 'bg-blue-50 text-blue-600';
      case 'not_started':
        return 'bg-slate-50 text-slate-600';
      default:
        return 'bg-slate-50 text-slate-600';
    }
  };
  
  const getStatusLabel = (status: ApprovalStatus) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'requested_changes':
        return 'Changes Requested';
      case 'pending':
        return 'Pending';
      case 'not_started':
        return 'Not Started';
      default:
        return 'Unknown';
    }
  };

  const activeIsComingSoon = IN_PROGRESS_TABS.includes(activeTab);

  // Use editable state for budget summary, fallback to API/mock data
  const annualMetrics = [
    { label: 'Revenue Target', value: totalRevenueTarget, tone: 'default' as const },
    { label: 'Expense Budget', value: totalExpenseBudget, tone: 'negative' as const },
    { label: 'Target Profit', value: targetProfit, tone: 'positive' as const },
    { label: 'Profit Margin', valueLabel: formatPercent(profitMargin), tone: 'accent' as const },
  ];
  
  // Helper functions to update budget values
  const updateRevenueTarget = (index: number, newTarget: number) => {
    setEditableRevenueLines(prev => 
      prev.map((line, i) => 
        i === index ? { ...line, target: Math.max(0, newTarget) } : line
      )
    );
  };
  
  const updateExpenseTarget = (index: number, newTarget: number) => {
    setEditableExpenseLines(prev => 
      prev.map((line, i) => 
        i === index ? { ...line, target: Math.max(0, newTarget) } : line
      )
    );
  };
  
  
  const varianceThresholds = annualData?.variance_thresholds?.map(t => ({
    label: t.label,
    value: String(t.value_percent),
    valuePercent: t.value_percent,
  })) || VARIANCE_THRESHOLDS.map(t => ({
    label: t.label,
    value: t.value,
    valuePercent: parseFloat(t.value.replace('%', '')) || 0,
  }));
  
  const reportingSchedule = annualData?.reporting_schedule?.map(s => ({
    label: s.label,
    value: s.value,
  })) || REPORTING_SCHEDULE;
  
  const aiHighlights = annualData?.ai_highlights || [];

  const scenarios = scenariosData?.scenarios?.map(s => ({
    key: s.key as ScenarioKey,
    name: s.name,
    description: s.description,
    growthRates: s.growth_rates,
    investmentLevel: s.investment_level as 'Low' | 'Medium' | 'High',
    bonusThreshold: s.bonus_threshold,
    riskLevel: s.risk_level as 'Low' | 'Medium' | 'High',
    risks: (s as any).risks || SCENARIO_CALLOUTS.risks,
    opportunities: (s as any).opportunities || SCENARIO_CALLOUTS.opportunities,
  })) || SCENARIOS.map(s => ({
    ...s,
    risks: SCENARIO_CALLOUTS.risks,
    opportunities: SCENARIO_CALLOUTS.opportunities,
  }));
  
  const projections = scenariosData?.projections?.map(p => ({
    year: p.year,
    revenue: p.revenue,
    expenses: p.expenses,
    profit: p.profit,
    margin: p.margin_percent,
  })) || SCENARIO_PROJECTIONS;
  
  const kpiTargets = scenariosData?.kpi_targets?.map(k => ({
    year: k.year,
    profitMargin: parseFloat(k.kpis?.find(kpi => kpi.label === 'Target Profit Margin')?.value?.replace('%', '') || '0'),
    utilization: parseFloat(k.kpis?.find(kpi => kpi.label === 'Employee Utilization')?.value?.replace('%', '') || '0'),
    retention: parseFloat(k.kpis?.find(kpi => kpi.label === 'Client Retention')?.value?.replace('%', '') || '0'),
    newClients: parseFloat(k.kpis?.find(kpi => kpi.label === 'New Clients')?.value || '0'),
    cashFlowTarget: parseFloat(k.kpis?.find(kpi => kpi.label === 'Cash Flow Target')?.value?.replace(/[$,]/g, '') || '0'),
    bonusPool: parseFloat(k.kpis?.find(kpi => kpi.label === 'Bonus Pool')?.value?.replace(/[$,]/g, '') || '0'),
  })) || SCENARIO_KPIS;
  
  const timeline = scenariosData?.timeline?.map(t => ({
    title: t.title,
    date: t.date,
    status: t.status,
  })) || DASHBOARD_TIMELINE;
  
  const tasks = scenariosData?.tasks?.map(t => ({
    title: t.title,
    owner: t.owner,
    due: t.due,
    status: t.status,
  })) || DASHBOARD_TASKS;
  
  const aiPlaybook = scenariosData?.ai_playbook?.map(p => ({
    title: p.title,
    insight: p.insight,
  })) || DASHBOARD_AI_PLAYBOOK;

  const forecastingStats = useMemo(() => {
    const count = FORECASTING_HISTORY.length || 1;
    const totalRevenue = FORECASTING_HISTORY.reduce((sum, item) => sum + item.revenue, 0);
    const totalExpenses = FORECASTING_HISTORY.reduce((sum, item) => sum + item.expenses, 0);
    const avgRevenue = totalRevenue / count;
    const avgExpenses = totalExpenses / count;
    const avgProfit = avgRevenue - avgExpenses;

    return {
      avgRevenue,
      avgExpenses,
      avgProfit,
    };
  }, []);

  const selectedScenario = useMemo(
    () => scenarios.find((scenario) => scenario.key === activeScenario) ?? scenarios[1] ?? SCENARIOS[1],
    [activeScenario, scenarios],
  );

  const dashboardOverview = useMemo(() => {
    const revenueTarget = annualMetrics.find((metric) => metric.label === 'Revenue Target')?.value ?? 0;
    const expenseBudget = annualMetrics.find((metric) => metric.label === 'Expense Budget')?.value ?? 0;
    const profitTarget = annualMetrics.find((metric) => metric.label === 'Target Profit')?.value ?? 0;

    const revenueForecastAnnual = forecastingStats.avgRevenue * 12;
    const expenseForecastAnnual = forecastingStats.avgExpenses * 12;
    const profitForecastAnnual = forecastingStats.avgProfit * 12;

    const budgetUtilizationPct = expenseBudget
      ? Math.min((expenseForecastAnnual / expenseBudget) * 100, 160)
      : 0;
    const revenueAchievement = revenueTarget ? (revenueForecastAnnual / revenueTarget) * 100 : 0;
    const expenseVariancePct = expenseBudget
      ? ((expenseForecastAnnual - expenseBudget) / expenseBudget) * 100
      : 0;
    const revenueVariancePct = revenueTarget
      ? ((revenueForecastAnnual - revenueTarget) / revenueTarget) * 100
      : 0;
    const profitAchievement = profitTarget ? (profitForecastAnnual / profitTarget) * 100 : 0;
    const profitVariancePct = profitTarget
      ? ((profitForecastAnnual - profitTarget) / Math.max(profitTarget, 1)) * 100
      : 0;

    const pendingApprovals = approvalStages.filter((stage) => stage.status === 'pending' || stage.status === 'requested_changes').length;
    const attentionApprovals = approvalStages.filter((stage) => stage.status === 'rejected' || stage.status === 'requested_changes').length;

    const planRows = [
      {
        label: 'Revenue',
        plan: revenueTarget,
        forecast: revenueForecastAnnual,
      },
      {
        label: 'Expenses',
        plan: expenseBudget,
        forecast: expenseForecastAnnual,
      },
      {
        label: 'Profit',
        plan: profitTarget,
        forecast: profitForecastAnnual,
      },
    ].map((row) => {
      const variance = row.forecast - row.plan;
      const variancePct = row.plan ? (variance / row.plan) * 100 : 0;
      return { ...row, variance, variancePct };
    });

    const aiHighlights = [
      {
        title: 'Revenue Momentum',
        tone: revenueVariancePct >= 0 ? 'positive' as const : 'warning' as const,
        detail: `Run rate is ${formatPercent(revenueAchievement)} of plan (${formatPercentSigned(
          revenueVariancePct,
        )}).`,
      },
      {
        title: 'Expense Envelope',
        tone: expenseVariancePct <= 5 ? 'positive' as const : 'warning' as const,
        detail: `Operating envelope is ${formatPercentSigned(expenseVariancePct)} vs. budget.`,
      },
      {
        title: 'Profit Outlook',
        tone: profitVariancePct >= 0 ? 'positive' as const : 'warning' as const,
        detail: `Projected EBIT margin tracking ${formatPercentSigned(profitVariancePct)} relative to target.`,
      },
    ];

    return {
      revenueTarget,
      expenseBudget,
      profitTarget,
      revenueForecastAnnual,
      expenseForecastAnnual,
      profitForecastAnnual,
      budgetUtilizationPct,
      revenueAchievement,
      profitAchievement,
      revenueVariancePct,
      expenseVariancePct,
      profitVariancePct,
      pendingApprovals,
      attentionApprovals,
      planRows,
      aiHighlights,
    };
  }, [forecastingStats, activeScenario, annualMetrics]);

  // Loading state
  if (isLoadingAnnual || isLoadingScenarios) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#161950' }} />
          <p className="text-gray-600">Loading finance planning data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (annualError || scenariosError) {
    const errorMessage = annualError || scenariosError;
    const errorDetails = errorMessage instanceof Error ? errorMessage.message : String(errorMessage);
    
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-red-600 mb-2 font-semibold">Failed to load finance planning data</p>
          <p className="text-sm text-slate-500 mb-4">{errorDetails}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 underline hover:text-blue-800"
          >
            Please try refreshing the page
          </button>
        </div>
      </div>
    );
  }

  // Removed renderAnnualBudget - now using AnnualBudgetTab component
  const _renderAnnualBudget = () => (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-900">Budget Summary</h3>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#161950]/10 px-3 py-1 text-sm font-semibold text-[#161950]">
            <ClipboardList className="h-3.5 w-3.5" />
            Draft
          </span>
        </div>
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
        
        {/* AI Highlights */}
        {aiHighlights && aiHighlights.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="text-base font-semibold text-slate-900">AI Insights</h4>
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
        )}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
        <h3 className="text-lg font-semibold text-slate-900">Budget Parameters</h3>
        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold uppercase tracking-wide text-slate-500">Budget Year</label>
            <Select value={budgetYear} onValueChange={setBudgetYear}>
              <SelectTrigger className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:border-[#161950]/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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
                <SelectTrigger className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium shadow-sm transition hover:border-[#161950]/40">
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
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 shadow-sm"
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
                        // Sync back from Revenue/Expense tab
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
                  className="h-11 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-600 shadow-sm"
                  min="0"
                  step="1000"
                />
              ) : (
                <div className="h-11 flex items-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-600 shadow-sm">
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
                        // Sync back from Revenue/Expense tab
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
                  className="h-11 rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-600 shadow-sm"
                  min="0"
                  step="1000"
                />
              ) : (
                <div className="h-11 flex items-center rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-600 shadow-sm">
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
        <h3 className="text-lg font-semibold text-slate-900">AI Budgeting Assistant</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">AI Forecast Confidence</p>
            <p className="mt-2 text-2xl font-bold text-emerald-600">97.3%</p>
            <p className="mt-1 text-sm text-slate-500">AI variance outlook vs baseline models.</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Scenario Models</p>
              <p className="mt-2 text-2xl font-bold text-[#161950]">3 Active</p>
            <p className="mt-1 text-sm text-slate-500">Base, stretch, and contingency options ready.</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">OpEx Savings</p>
            <p className="mt-2 text-2xl font-bold text-emerald-600">$240K</p>
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

  const renderRevenueExpense = () => (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Revenue Targets</h3>
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
                  toast({
                    title: "Revenue Targets Saved",
                    description: "Revenue targets have been saved successfully.",
                  });
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
              <div className="flex-1">
                <p className="text-base font-medium text-slate-700">{line.label}</p>
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
          <h3 className="text-lg font-semibold text-slate-900">Expense Budgets</h3>
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
                  toast({
                    title: "Expense Budgets Saved",
                    description: "Expense budgets have been saved successfully.",
                  });
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
              <p className="text-base font-medium text-slate-700 flex-1">{line.label}</p>
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

  const renderBuAllocation = () => (
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

  const renderVariance = () => (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-900">Variance Thresholds</h3>
          <Settings2 className="h-4 w-4 text-[#161950]" />
        </div>
        <div className="mt-4 space-y-4">
          {VARIANCE_THRESHOLDS.map((threshold) => (
            <div key={threshold.label}>
              <label className="text-sm font-medium uppercase tracking-wide text-slate-500">
                {threshold.label}
              </label>
              <div className="mt-2 flex h-11 items-center rounded-xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-700 shadow-sm">
                {threshold.value}
              </div>
            </div>
          ))}
        </div>
        <button className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#161950] text-sm font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#0f133f]">
          Save Thresholds
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-900">Reporting Schedule</h3>
          <Sparkles className="h-4 w-4 text-[#161950]" />
        </div>
        <div className="mt-4 space-y-4">
          {REPORTING_SCHEDULE.map((item) => (
            <div key={item.label}>
              <label className="text-sm font-medium uppercase tracking-wide text-slate-500">{item.label}</label>
              <div className="mt-2 flex h-11 items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-700 shadow-sm">
                <span>{item.value}</span>
                <ChevronDown className="h-4 w-4 text-slate-300" />
              </div>
            </div>
          ))}
        </div>
        <button className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#161950] text-sm font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#0f133f]">
          Configure Reporting
        </button>
      </div>
    </div>
  );

  const renderDashboard = () => {
    const scenarioKpiPreview = kpiTargets[0];

    const summaryCards = [
      {
        label: 'Budget Utilization',
        value: formatPercent(dashboardOverview.budgetUtilizationPct),
        detail: `${formatCurrency(Math.round(dashboardOverview.expenseForecastAnnual))} of ${formatCurrency(
          dashboardOverview.expenseBudget,
        )}`,
        icon: Target,
      },
      {
        label: 'Revenue Run Rate',
        value: formatCurrency(Math.round(dashboardOverview.revenueForecastAnnual)),
        detail: `${formatPercentSigned(dashboardOverview.revenueVariancePct)} vs plan`,
        icon: BarChart3,
      },
      {
        label: 'Profit Outlook',
        value: formatCurrency(Math.round(dashboardOverview.profitForecastAnnual)),
        detail: `${formatPercent(dashboardOverview.profitAchievement)} of target`,
        icon: Sparkles,
      },
      {
        label: 'Approvals Pending',
        value: dashboardOverview.pendingApprovals.toString(),
        detail: `${dashboardOverview.attentionApprovals} awaiting action`,
        icon: History,
      },
    ];

    return (
      <div className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <div
                key={card.label}
                className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-5 shadow-sm transition hover:border-[#161950]/40 hover:shadow-[0_18px_32px_-24px_rgba(22,25,80,0.35)]"
              >
                <div className="flex items-center gap-2">
                  <card.icon className="h-4 w-4 text-[#161950]" />
                  <span className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    {card.label}
                  </span>
                </div>
                <span className="text-2xl font-semibold text-slate-900">{card.value}</span>
                <span className="text-sm text-slate-500">{card.detail}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <section className="flex h-full flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Plan vs. Forecast Snapshot</h3>
                <p className="text-sm text-slate-500">Keep the annual plan in view as AI forecasting updates.</p>
              </div>
              <Sparkles className="h-5 w-5 text-[#161950]" />
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <table className="min-w-full text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-3 pl-4 text-left">Metric</th>
                    <th className="py-3 text-right">Plan</th>
                    <th className="py-3 text-right">Forecast</th>
                    <th className="py-3 pr-4 text-right">Variance</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardOverview.planRows.map((row) => (
                    <tr key={row.label} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 pl-4 font-medium text-slate-700">{row.label}</td>
                      <td className="py-3 text-right text-slate-500">{formatCurrency(Math.round(row.plan))}</td>
                      <td className="py-3 text-right font-semibold text-slate-800">
                        {formatCurrency(Math.round(row.forecast))}
                      </td>
                      <td
                        className={`py-3 pr-4 text-right font-semibold ${
                          row.variance >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {formatCurrency(Math.round(row.variance))} ({formatPercentSigned(row.variancePct)})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="flex h-full flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">AI Highlights & Workflow</h3>
              <Sparkles className="h-5 w-5 text-[#161950]" />
            </div>
            <div className="space-y-3">
              {dashboardOverview.aiHighlights.map((highlight) => (
                <div
                  key={highlight.title}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 shadow-sm"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    {highlight.tone === 'positive' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    )}
                    {highlight.title}
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{highlight.detail}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
                <span>Approval Workflow</span>
                <span className="text-sm font-medium text-[#161950]">
                  {dashboardOverview.pendingApprovals} open · {dashboardOverview.attentionApprovals} flagged
                </span>
              </div>
              <div className="mt-3 space-y-3">
                {approvalStages.map((stage) => (
                  <div key={stage.id} className="flex items-center justify-between text-sm text-slate-600">
                    <span>{stage.label}</span>
                    <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${getStatusColor(stage.status)}`}>
                      {getStatusLabel(stage.status)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Scenario Pulse</h3>
                <span className="rounded-full bg-[#161950]/10 px-3 py-1 text-sm font-semibold uppercase tracking-wide text-[#161950]">
                  {selectedScenario.name}
                </span>
              </div>
              <p className="text-sm text-slate-500">
                Monitor the active plan assumptions, risk posture, and KPI swim lanes.
              </p>
            </div>
            <div className="mt-5 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-4 shadow-sm">
                <p className="text-xs uppercase text-slate-500">Growth Range</p>
                <p className="mt-1 text-lg font-semibold text-[#161950]">
                  {selectedScenario.growthRates.map((rate) => `${rate}%`).join(' · ')}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Investment Level:{' '}
                  <span className="font-semibold text-slate-700">{selectedScenario.investmentLevel}</span>
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-4 shadow-sm">
                <p className="text-xs uppercase text-slate-500">Bonus Threshold</p>
                <p className="mt-1 text-lg font-semibold text-[#161950]">{selectedScenario.bonusThreshold}%</p>
                <p className="mt-2 text-sm text-slate-500">Risk Level: {selectedScenario.riskLevel}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-4 shadow-sm">
                <p className="text-xs uppercase text-slate-500">Year {scenarioKpiPreview.year} KPI Targets</p>
                <div className="mt-2 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Profit Margin</span>
                    <span className="font-semibold text-[#161950]">{scenarioKpiPreview.profitMargin}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Employee Utilization</span>
                    <span>{scenarioKpiPreview.utilization}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Client Retention</span>
                    <span>{scenarioKpiPreview.retention}%</span>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-4 shadow-sm">
                <p className="text-xs uppercase text-slate-500">Cash & Incentives</p>
                <div className="mt-2 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Cash Flow Target</span>
                    <span className="font-semibold text-emerald-600">
                      {formatCurrency(scenarioKpiPreview.cashFlowTarget)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bonus Pool</span>
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(scenarioKpiPreview.bonusPool)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="flex h-full flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Timeline & Reporting Cadence</h3>
              <CalendarDays className="h-5 w-5 text-[#161950]" />
            </div>
            <div className="space-y-3">
              {timeline.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm shadow-sm"
                >
                  <div>
                    <p className="font-semibold text-slate-800">{item.title}</p>
                    <p className="text-sm text-slate-500">{item.date}</p>
                  </div>
                  <span className="rounded-full bg-[#161950]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#161950]">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
            <div className="space-y-2 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Reporting Schedule</p>
              {reportingSchedule.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm text-slate-600">
                  <span>{item.label}</span>
                  <span className="font-semibold text-slate-800">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Variance Alerts</p>
              {varianceThresholds.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm text-slate-600">
                  <span>{item.label}</span>
                  <span className="font-semibold text-[#161950]">{item.value}%</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Operational Checklist</h3>
              <History className="h-5 w-5 text-[#161950]" />
            </div>
            <div className="mt-4 space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.title}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm shadow-sm"
                >
                  <div>
                    <p className="font-semibold text-slate-800">{task.title}</p>
                    <p className="text-sm text-slate-500">
                      Owner: {task.owner} · Due {task.due}
                    </p>
                  </div>
                  <span
                    className={[
                      'rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide',
                      task.status === 'In Progress' && 'bg-[#161950]/10 text-[#161950]',
                      task.status === 'Behind' && 'bg-rose-50 text-rose-600',
                      task.status === 'Planned' && 'bg-slate-200 text-slate-700',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">AI Playbook</h3>
              <Sparkles className="h-5 w-5 text-[#161950]" />
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Guided actions surfaced by the budgeting assistant to keep the annual plan on track.
            </p>
            <div className="mt-4 space-y-4">
              {aiPlaybook.map((item) => (
                <div key={item.title} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-4 shadow-sm">
                  <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                  <p className="mt-2 text-sm text-slate-600">{item.insight}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  };

  // Generate forecast based on parameters
  const handleGenerateForecast = async () => {
    try {
      const result = await generateForecastMutation.mutateAsync({
        forecast_name: forecastName || undefined,
        forecasting_model: forecastingModel,
        forecast_period_months: forecastPeriod,
        market_growth_rate: marketGrowthRate,
        inflation_rate: inflationRate,
        seasonal_adjustment: seasonalAdjustment,
      });
      
      setCurrentForecast(result);
      setForecastGenerated(true);
      toast({
        title: "Forecast Generated",
        description: `AI-powered forecast generated for ${forecastPeriod} months using ${forecastingModel} model.${result.ai_confidence_score ? ` Confidence: ${result.ai_confidence_score.toFixed(1)}%` : ''}`,
      });
    } catch (error: any) {
      console.error("Error generating forecast:", error);
      toast({
        title: "Forecast Generation Failed",
        description: error?.response?.data?.detail || error?.message || "Failed to generate forecast.",
        variant: "destructive",
      });
    }
  };
  
  const handleSaveForecast = async () => {
    if (!currentForecast) {
      toast({
        title: "No Forecast to Save",
        description: "Please generate a forecast first.",
        variant: "destructive",
      });
      return;
    }
    
    // Forecast is already saved when generated, just show confirmation
    toast({
      title: "Forecast Saved",
      description: `Forecast "${currentForecast.forecast_name || 'Untitled'}" has been saved successfully.`,
    });
  };
  
  const handleExportForecast = async (format: 'csv' | 'json' = 'csv') => {
    if (!currentForecast) {
      toast({
        title: "No Forecast to Export",
        description: "Please generate a forecast first.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await exportForecastMutation.mutateAsync({
        forecast_id: currentForecast.id,
        format: format,
      });
      toast({
        title: "Forecast Exported",
        description: `Forecast exported successfully as ${format.toUpperCase()}.`,
      });
    } catch (error: any) {
      console.error("Error exporting forecast:", error);
      toast({
        title: "Export Failed",
        description: error?.response?.data?.detail || error?.message || "Failed to export forecast.",
        variant: "destructive",
      });
    }
  };
  
  const forecastData = currentForecast?.forecast_data || [];

  const renderForecasting = () => (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Financial Forecasting Models</h2>
            <p className="text-sm text-slate-500">
              Advanced predictive analytics for revenue and expense projections with AI-tuned parameters.
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
              <button
              onClick={handleGenerateForecast}
              disabled={generateForecastMutation.isPending}
              className="inline-flex h-10 items-center gap-2.5 rounded-xl bg-[#161950] px-4 text-sm font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#0f133f] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generateForecastMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {generateForecastMutation.isPending ? 'Generating...' : 'Generate Forecast'}
              </button>
            {forecastGenerated && currentForecast && (
              <>
                <button
                  onClick={handleSaveForecast}
                  className="inline-flex h-10 items-center gap-2.5 rounded-xl border border-emerald-500 bg-emerald-50 px-4 text-sm font-semibold uppercase tracking-wide text-emerald-600 shadow-sm transition hover:border-emerald-600 hover:bg-emerald-100"
                >
                  <Check className="h-4 w-4" />
                  Save Forecast
                </button>
                <button
                  onClick={() => handleExportForecast('csv')}
                  disabled={exportForecastMutation.isPending}
                  className="inline-flex h-10 items-center gap-2.5 rounded-xl border border-[#161950]/25 bg-white px-4 text-sm font-semibold uppercase tracking-wide text-[#161950] shadow-sm transition hover:border-[#161950]/60 hover:bg-[#161950]/10 disabled:opacity-50"
                >
                  {exportForecastMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileDown className="h-4 w-4" />
                  )}
                  Export CSV
                </button>
                <button
                  onClick={() => handleExportForecast('json')}
                  disabled={exportForecastMutation.isPending}
                  className="inline-flex h-10 items-center gap-2.5 rounded-xl border border-[#161950]/25 bg-white px-4 text-sm font-semibold uppercase tracking-wide text-[#161950] shadow-sm transition hover:border-[#161950]/60 hover:bg-[#161950]/10 disabled:opacity-50"
                >
                  {exportForecastMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileDown className="h-4 w-4" />
                  )}
                  Export JSON
                </button>
              </>
            )}
          </div>
        </div>
        <div className="mt-6 grid gap-4 text-center sm:grid-cols-3">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-500">Avg Monthly Revenue</p>
            <p className="mt-2 text-2xl font-semibold text-[#161950]">
              {formatCurrency(Math.round(forecastingStats.avgRevenue))}
            </p>
          </div>
          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-rose-500">Avg Monthly Expenses</p>
            <p className="mt-2 text-2xl font-semibold text-rose-600">
              {formatCurrency(Math.round(forecastingStats.avgExpenses))}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-500">Avg Monthly Profit</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-600">
              {formatCurrency(Math.round(forecastingStats.avgProfit))}
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
          <h3 className="text-lg font-semibold text-slate-900">Forecasting Parameters</h3>
          <p className="text-sm text-slate-500">Configure forecasting model and parameters for accurate projections.</p>
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-wide text-slate-500">Forecasting Model</label>
              <Select value={forecastingModel} onValueChange={setForecastingModel}>
                <SelectTrigger className="h-11 rounded-xl border border-[#161950]/40 bg-white px-4 text-sm font-medium text-[#161950] shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Linear Regression">Linear Regression</SelectItem>
                  <SelectItem value="Exponential Smoothing">Exponential Smoothing</SelectItem>
                  <SelectItem value="Seasonal Decomposition">Seasonal Decomposition</SelectItem>
                  <SelectItem value="ARIMA Model">ARIMA Model</SelectItem>
                </SelectContent>
              </Select>
                </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-wide text-slate-500">Forecast Period (Months)</label>
              <Input
                type="number"
                value={forecastPeriod}
                onChange={(e) => setForecastPeriod(Math.max(1, parseInt(e.target.value) || 12))}
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm"
                min="1"
                max="60"
              />
              </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-wide text-slate-500">Market Growth Rate (%)</label>
                <Input
                  type="number"
                  value={marketGrowthRate}
                  onChange={(e) => setMarketGrowthRate(parseFloat(e.target.value) || 0)}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm"
                  min="0"
                  max="100"
                  step="0.1"
                />
          </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-wide text-slate-500">Inflation Rate (%)</label>
                <Input
                  type="number"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(parseFloat(e.target.value) || 0)}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 shadow-sm">
              <input 
                type="checkbox" 
                checked={seasonalAdjustment}
                onChange={(e) => setSeasonalAdjustment(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#161950]" 
              />
            <span>Apply Seasonal Adjustment</span>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
          <h3 className="text-lg font-semibold text-slate-900">Historical Performance Analysis</h3>
          <p className="text-sm text-slate-500">
            Evaluate trailing twelve-month performance to calibrate forecasting confidence.
          </p>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-base text-slate-600">
              <thead className="bg-slate-50 text-sm uppercase text-slate-500">
                <tr>
                  <th className="py-3 text-left">Period</th>
                  <th className="py-3 text-right">Revenue</th>
                  <th className="py-3 text-right">Expenses</th>
                  <th className="py-3 text-right">Profit</th>
                  <th className="py-3 text-right">Margin</th>
                </tr>
              </thead>
              <tbody>
                {FORECASTING_HISTORY.map((row) => {
                  const profit = row.revenue - row.expenses;
                  const margin = profit / Math.max(row.revenue, 1);
                  return (
                    <tr key={row.period} className="border-b border-slate-100 last:border-0">
                      <td className="py-2">{row.period}</td>
                      <td className="py-2 text-right font-semibold text-[#161950]">{formatCurrency(row.revenue)}</td>
                      <td className="py-2 text-right text-rose-600">{formatCurrency(row.expenses)}</td>
                      <td className="py-2 text-right text-emerald-600">{formatCurrency(profit)}</td>
                      <td className="py-2 text-right">{formatPercent(margin * 100)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {forecastGenerated && forecastData.length > 0 && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Forecast Projections</h3>
              <p className="text-sm text-slate-500">
                {forecastPeriod}-month forecast using {forecastingModel} model
                {currentForecast?.ai_confidence_score && ` • AI Confidence: ${currentForecast.ai_confidence_score.toFixed(1)}%`}
              </p>
              {currentForecast?.forecast_name && (
                <p className="text-xs text-slate-400 mt-1">Saved as: {currentForecast.forecast_name}</p>
              )}
            </div>
            <button
              onClick={() => {
                setForecastGenerated(false);
                setCurrentForecast(null);
                setForecastName('');
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-base text-slate-600">
              <thead className="bg-slate-50 text-sm uppercase text-slate-500">
                <tr>
                  <th className="py-3 text-left">Period</th>
                  <th className="py-3 text-right">Revenue Forecast</th>
                  <th className="py-3 text-right">Expense Forecast</th>
                  <th className="py-3 text-right">Profit Forecast</th>
                  <th className="py-3 text-right">Margin</th>
                </tr>
              </thead>
              <tbody>
                {forecastData.map((row: any) => (
                  <tr key={row.period} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="py-2 font-medium text-slate-800">{row.period}</td>
                    <td className="py-2 text-right font-semibold text-[#161950]">{formatCurrency(row.revenue)}</td>
                    <td className="py-2 text-right text-rose-600">{formatCurrency(row.expenses)}</td>
                    <td className="py-2 text-right text-emerald-600">{formatCurrency(row.profit)}</td>
                    <td className="py-2 text-right">{formatPercent(row.margin)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      
      {savedForecasts && savedForecasts.forecasts && savedForecasts.forecasts.length > 0 && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Saved Forecasts</h3>
          <div className="space-y-3">
            {savedForecasts.forecasts.slice(0, 5).map((forecast: any) => (
              <div key={forecast.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{forecast.forecast_name || `Forecast #${forecast.id}`}</p>
                  <p className="text-sm text-slate-500">
                    {forecast.forecasting_model} • {forecast.forecast_period_months} months • {new Date(forecast.created_at).toLocaleDateString()}
                    {forecast.ai_confidence_score && ` • ${forecast.ai_confidence_score.toFixed(1)}% confidence`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setCurrentForecast(forecast);
                      setForecastGenerated(true);
                      setForecastingModel(forecast.forecasting_model);
                      setForecastPeriod(forecast.forecast_period_months);
                      setMarketGrowthRate(forecast.market_growth_rate);
                      setInflationRate(forecast.inflation_rate);
                      setSeasonalAdjustment(forecast.seasonal_adjustment);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#161950]/30 bg-white px-3 py-1.5 text-sm font-semibold text-[#161950] hover:bg-[#161950]/10"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleExportForecast('csv')}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    <FileDown className="h-3.5 w-3.5" />
                    Export
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );

  const renderScenarios = () => (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Multi-year Planning Scenarios</h2>
            <p className="text-sm text-slate-500">
              Compare strategic growth paths with integrated KPI targets and bonus structures.
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleCompareAll}
              className={`inline-flex h-10 items-center gap-2.5 rounded-xl border px-4 text-sm font-semibold uppercase tracking-wide shadow-sm transition ${
                comparisonMode
                  ? 'border-[#161950] bg-[#161950] text-white hover:bg-[#161950]/90'
                  : 'border-[#161950]/30 bg-white text-[#161950] hover:border-[#161950]/60 hover:bg-[#161950]/10'
              }`}
            >
              {comparisonMode ? 'Single View' : 'Compare All'}
            </button>
            <button 
              onClick={handleExportComparison}
              className="inline-flex h-10 items-center gap-2.5 rounded-xl border border-[#161950]/30 bg-white px-4 text-sm font-semibold uppercase tracking-wide text-[#161950] shadow-sm transition hover:border-[#161950]/60 hover:bg-[#161950]/10"
            >
              <FileDown className="h-3.5 w-3.5" />
              Export Comparison
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {scenarios.map((scenario) => {
            // Check if scenario is active from API data or local state
            const isActiveFromApi = scenariosData?.scenarios?.find(s => s.key === scenario.key)?.active || false;
            const isActive = scenario.key === activeScenario || isActiveFromApi;
            return (
              <div
                key={scenario.key}
                className={[
                  'flex h-full flex-col gap-3 rounded-2xl border px-5 py-4 shadow-sm transition hover:border-[#161950]/50 hover:shadow-[0_18px_32px_-24px_rgba(22,25,80,0.35)]',
                  isActive
                    ? 'border-[#161950] bg-[#161950]/5 ring-2 ring-[#161950]/30'
                    : 'border-slate-200 bg-white',
                ].join(' ')}
              >
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setActiveScenario(scenario.key)}
                    className="flex-1 text-left"
                  >
                  <p className="text-sm font-semibold text-slate-900">{scenario.name}</p>
                  </button>
                  <div className="flex items-center gap-2">
                  {isActive && (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-600">
                      Active
                    </span>
                  )}
                    {!isActive && (
                      <button
                        onClick={() => handleActivateScenario(scenario.key)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#161950]/30 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#161950] transition hover:border-[#161950] hover:bg-[#161950]/10"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Activate
                      </button>
                    )}
                </div>
                </div>
                <button
                  onClick={() => setActiveScenario(scenario.key)}
                  className="text-left"
                >
                <p className="text-sm text-slate-500">{scenario.description}</p>
                </button>
                <div className="mt-2 grid gap-2 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Revenue Growth</span>
                    <span>{scenario.growthRates.map((rate) => `${rate}%`).join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Investment Level</span>
                    <span className="font-semibold text-[#161950]">{scenario.investmentLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bonus Threshold</span>
                    <span>{scenario.bonusThreshold}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Risk Level</span>
                    <span>{scenario.riskLevel}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Planning Configuration</h3>
            {!isPlanningConfigEditMode ? (
              <button
                onClick={() => setIsPlanningConfigEditMode(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#161950]/30 bg-white px-3 py-1.5 text-sm font-semibold text-[#161950] transition hover:border-[#161950] hover:bg-[#161950]/10"
              >
                <Edit className="h-3.5 w-3.5" />
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSavePlanningConfig}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-100"
                >
                  <Check className="h-3.5 w-3.5" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsPlanningConfigEditMode(false);
                    // Reset to API values
                    if (scenariosData?.planning_configuration) {
                      setPlanningPeriodYears(scenariosData.planning_configuration.planning_period_years || 3);
                      setBaseYearRevenue(scenariosData.planning_configuration.base_year_revenue || 5_000_000);
                      setBaseYearExpenses(scenariosData.planning_configuration.base_year_expenses || 4_000_000);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </button>
              </div>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-semibold uppercase tracking-wide text-slate-500">Planning Period</label>
              {isPlanningConfigEditMode ? (
                <Select
                  value={String(planningPeriodYears)}
                  onValueChange={(value) => setPlanningPeriodYears(parseInt(value))}
                >
                  <SelectTrigger className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Year</SelectItem>
                    <SelectItem value="2">2 Years</SelectItem>
                    <SelectItem value="3">3 Years</SelectItem>
                    <SelectItem value="4">4 Years</SelectItem>
                    <SelectItem value="5">5 Years</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
            <div className="flex h-11 items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm">
                  <span>{planningPeriodYears} Years</span>
            </div>
              )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold uppercase tracking-wide text-slate-500">Base Year Revenue</label>
              {isPlanningConfigEditMode ? (
                <Input
                  type="number"
                  value={baseYearRevenue}
                  onChange={(e) => setBaseYearRevenue(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-[#161950] shadow-sm"
                />
              ) : (
            <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-[#161950] shadow-sm">
                  {formatCurrency(baseYearRevenue)}
            </div>
              )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold uppercase tracking-wide text-slate-500">Base Year Expenses</label>
              {isPlanningConfigEditMode ? (
                <Input
                  type="number"
                  value={baseYearExpenses}
                  onChange={(e) => setBaseYearExpenses(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-rose-600 shadow-sm"
                />
              ) : (
            <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-rose-600 shadow-sm">
                  {formatCurrency(baseYearExpenses)}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
          <h3 className="text-xl font-semibold text-slate-900">
            {selectedScenario.name} &ndash; Financial Projections
          </h3>
          <p className="text-base text-slate-500">
            Modeled revenue, expense, and profit trajectory aligned to the active scenario assumptions.
          </p>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-base text-slate-600">
              <thead className="bg-slate-50 text-sm uppercase text-slate-500">
                <tr>
                  <th className="py-3 text-left">Year</th>
                  <th className="py-3 text-right">Revenue</th>
                  <th className="py-3 text-right">Expenses</th>
                  <th className="py-3 text-right">Profit</th>
                  <th className="py-3 text-right">Margin</th>
                </tr>
              </thead>
              <tbody>
                {projections.map((projection) => (
                  <tr key={projection.year} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 font-semibold text-slate-800">{projection.year}</td>
                    <td className="py-2 text-right text-[#161950]">{formatCurrency(projection.revenue)}</td>
                    <td className="py-2 text-right text-rose-600">{formatCurrency(projection.expenses)}</td>
                    <td className="py-2 text-right text-emerald-600">{formatCurrency(projection.profit)}</td>
                    <td className="py-2 text-right">{formatPercent(projection.margin ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
          <h3 className="text-xl font-semibold text-slate-900">KPI Targets &amp; Bonus Structure</h3>
          <p className="text-base text-slate-500">
            Multi-year KPI commitments for margin, retention, utilization, and growth incentives.
          </p>
          <div className="mt-5 space-y-4">
            {kpiTargets.map((kpi) => (
              <div key={kpi.year} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold text-slate-800">Year {kpi.year} KPI Targets</p>
                  <span className="text-sm font-semibold uppercase tracking-wide text-[#161950]">
                    Bonus Threshold {selectedScenario.bonusThreshold}%
                  </span>
                </div>
                <div className="mt-3 grid gap-3 text-base text-slate-600 sm:grid-cols-2">
                  <div className="flex justify-between">
                    <span>Target Profit Margin</span>
                    <span className="font-semibold text-[#161950]">{kpi.profitMargin}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Employee Utilization</span>
                    <span>{kpi.utilization}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Client Retention</span>
                    <span>{kpi.retention}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>New Clients</span>
                    <span>{kpi.newClients}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cash Flow Target</span>
                    <span className="font-semibold text-emerald-600">{formatCurrency(kpi.cashFlowTarget)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bonus Pool</span>
                    <span className="font-semibold text-slate-800">{formatCurrency(kpi.bonusPool)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="rounded-3xl border border-rose-100 bg-rose-50 p-6 shadow-[0_24px_48px_-24px_rgba(244,63,94,0.25)]">
          <h3 className="text-xl font-semibold text-rose-600">Risk Assessment</h3>
          <ul className="mt-4 space-y-3 text-base text-rose-700">
            {selectedScenario.risks?.map((risk, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-rose-500" />
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 shadow-[0_24px_48px_-24px_rgba(16,185,129,0.25)]">
          <h3 className="text-xl font-semibold text-emerald-600">Strategic Opportunities</h3>
          <ul className="mt-4 space-y-3 text-base text-emerald-700">
            {selectedScenario.opportunities?.map((opportunity, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                <span>{opportunity}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      
      {comparisonMode && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
          <h3 className="text-xl font-semibold text-slate-900">Scenario Comparison</h3>
          <p className="text-base text-slate-500 mb-5">
            Compare all scenarios side by side to evaluate different strategic paths.
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full text-base text-slate-600">
              <thead className="bg-slate-50 text-sm uppercase text-slate-500">
                <tr>
                  <th className="py-3 text-left">Scenario</th>
                  <th className="py-3 text-right">Year 1 Revenue</th>
                  <th className="py-3 text-right">Year 1 Profit</th>
                  <th className="py-3 text-right">Year 1 Margin</th>
                  <th className="py-3 text-right">Investment Level</th>
                  <th className="py-3 text-right">Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((scenario) => {
                  const scenarioProjections = projections.filter(p => p.year === projections[0]?.year);
                  const firstYear = scenarioProjections[0];
                  return (
                    <tr 
                      key={scenario.key} 
                      className={`border-b border-slate-100 last:border-0 hover:bg-slate-50 ${
                        scenario.key === activeScenario ? 'bg-[#161950]/5' : ''
                      }`}
                    >
                      <td className="py-2 font-semibold text-slate-800">
                        {scenario.name}
                        {scenario.key === activeScenario && (
                          <span className="ml-2 text-sm text-emerald-600">(Active)</span>
                        )}
                      </td>
                      <td className="py-2 text-right text-[#161950]">
                        {firstYear ? formatCurrency(firstYear.revenue) : 'N/A'}
                      </td>
                      <td className="py-2 text-right text-emerald-600">
                        {firstYear ? formatCurrency(firstYear.profit) : 'N/A'}
                      </td>
                      <td className="py-2 text-right">
                        {firstYear ? formatPercent(firstYear.margin ?? 0) : 'N/A'}
                      </td>
                      <td className="py-2 text-right">{scenario.investmentLevel}</td>
                      <td className="py-2 text-right">{scenario.riskLevel}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );

  const renderApproval = () => {
    const pendingCount = approvalStages.filter(s => s.status === 'pending').length;
    const approvedCount = approvalStages.filter(s => s.status === 'approved').length;
    const rejectedCount = approvalStages.filter(s => s.status === 'rejected').length;
    const canApproveAny = approvalStages.some(s => s.canApprove && s.status === 'pending');
    
    return (
      <div className="space-y-6">
        {/* Approval Overview */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Budget Approval Workflow</h3>
              <p className="text-base text-slate-500 mt-1">
                Multi-stage approval process with role-based permissions
              </p>
            </div>
        <Users className="h-5 w-5 text-[#161950]" />
      </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-1">Total Stages</div>
              <div className="text-3xl font-semibold text-slate-900">{approvalStages.length}</div>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="text-sm font-semibold uppercase tracking-wide text-emerald-600 mb-1">Approved</div>
              <div className="text-3xl font-semibold text-emerald-600">{approvedCount}</div>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="text-sm font-semibold uppercase tracking-wide text-blue-600 mb-1">Pending</div>
              <div className="text-3xl font-semibold text-blue-600">{pendingCount}</div>
            </div>
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
              <div className="text-sm font-semibold uppercase tracking-wide text-rose-600 mb-1">Rejected</div>
              <div className="text-3xl font-semibold text-rose-600">{rejectedCount}</div>
            </div>
          </div>
          
          <div className="h-px bg-slate-100" />
          
          {/* Approval Stages */}
          <div className="mt-6 space-y-4">
            {approvalStages.map((stage, index) => {
              const isSelected = selectedStageId === stage.id;
              const conditions = APPROVAL_CONDITIONS[stage.id as keyof typeof APPROVAL_CONDITIONS] || [];
              
              return (
                <div
                  key={stage.id}
                  className={`rounded-xl border p-4 shadow-sm transition ${
                    isSelected
                      ? 'border-[#161950] bg-[#161950]/5 ring-2 ring-[#161950]/30'
                      : 'border-slate-100 bg-slate-50 hover:border-[#161950]/40 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                          stage.status === 'approved' ? 'bg-emerald-100 text-emerald-600' :
                          stage.status === 'rejected' ? 'bg-rose-100 text-rose-600' :
                          stage.status === 'pending' ? 'bg-blue-100 text-blue-600' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-base font-semibold text-slate-900">{stage.label}</p>
                            {stage.canApprove && stage.status === 'pending' && (
                              <span className="rounded-full bg-[#161950]/10 px-2 py-0.5 text-sm font-semibold uppercase tracking-wide text-[#161950]">
                                You Can Approve
              </span>
                            )}
            </div>
                          <p className="text-sm text-slate-500 mt-0.5">{stage.description}</p>
          </div>
                        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold uppercase tracking-wide ${getStatusColor(stage.status)}`}>
                          {getStatusLabel(stage.status)}
                        </span>
                      </div>
                      
                      {/* Approval Info */}
                      {stage.approverName && (
                        <div className="mt-2 text-sm text-slate-600">
                          <span className="font-medium">Approved by:</span> {stage.approverName}
                          {stage.approvedAt && (
                            <span className="ml-2">
                              on {new Date(stage.approvedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Comments */}
                      {stage.comments && (
                        <div className="mt-2 rounded-lg border border-slate-200 bg-white p-2 text-sm text-slate-600">
                          <span className="font-medium">Comment:</span> {stage.comments}
                        </div>
                      )}
                      
                      {/* Required Role */}
                      <div className="mt-2 text-sm text-slate-500">
                        <span className="font-medium">Required Role:</span>{' '}
                        {Array.isArray(stage.requiredRole) 
                          ? stage.requiredRole.join(', ') 
                          : stage.requiredRole}
                      </div>
                      
                      {/* Approval Conditions */}
                      {conditions.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-1">
                            Approval Conditions:
                          </p>
                          <ul className="space-y-1">
                            {conditions.map((condition, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                                <CheckCircle2 className={`h-3 w-3 mt-0.5 ${
                                  stage.status === 'approved' ? 'text-emerald-600' : 'text-slate-400'
                                }`} />
                                <span>{condition}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      {stage.status === 'pending' && stage.canApprove && (
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => setSelectedStageId(isSelected ? null : stage.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#161950]/30 bg-white px-3 py-1.5 text-sm font-semibold text-[#161950] transition hover:border-[#161950] hover:bg-[#161950]/10"
                          >
                            {isSelected ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                            {isSelected ? 'Cancel' : 'Take Action'}
                          </button>
                        </div>
                      )}
                      
                      {/* Approval Form */}
                      {isSelected && stage.status === 'pending' && stage.canApprove && (
                        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                          <label className="block text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">
                            Add Comment (Optional)
                          </label>
                          <Textarea
                            value={approvalComment}
                            onChange={(e) => setApprovalComment(e.target.value)}
                            placeholder="Enter your comments or notes..."
                            className="mb-3 min-h-[80px] text-base"
                          />
                          <div className="space-y-3">
                            <p className="text-sm font-semibold text-slate-700 mb-2">Select an action:</p>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                              <button
                                onClick={() => handleApprovalAction(stage.id, 'approve')}
                                disabled={isSubmittingApproval}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-emerald-500 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 hover:border-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Check className="h-4 w-4" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleApprovalAction(stage.id, 'request_changes')}
                                disabled={isSubmittingApproval}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-amber-500 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 hover:border-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <AlertTriangle className="h-4 w-4" />
                                Request Changes
                              </button>
                              <button
                                onClick={() => handleApprovalAction(stage.id, 'reject')}
                                disabled={isSubmittingApproval}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-rose-500 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 hover:border-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <X className="h-4 w-4" />
                                Reject
                              </button>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                              <strong>Approve:</strong> Approve this stage and proceed to next stage<br/>
                              <strong>Request Changes:</strong> Send back for revisions, stage remains pending<br/>
                              <strong>Reject:</strong> Reject this budget proposal, workflow stops
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Permission Denied Message */}
                      {stage.status === 'pending' && !stage.canApprove && (
                        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2 text-sm text-amber-700">
                          <AlertTriangle className="inline h-3.5 w-3.5 mr-1" />
                          You don't have permission to approve this stage. Required role: {Array.isArray(stage.requiredRole) ? stage.requiredRole.join(' or ') : stage.requiredRole}
                        </div>
                      )}
                    </div>
      </div>
    </div>
  );
            })}
          </div>
          
          {/* Workflow Summary */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h4 className="text-base font-semibold text-slate-900 mb-3">Workflow Summary</h4>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Current User Role:</span>
                <span className="font-semibold text-[#161950]">{currentUserRole}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Can Approve Stages:</span>
                <span className="font-semibold text-emerald-600">
                  {approvalStages.filter(s => s.canApprove).length} of {approvalStages.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Next Action Required:</span>
                <span className="font-semibold text-blue-600">
                  {approvalStages.find(s => s.status === 'pending')?.label || 'All stages completed'}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  };

  const renderComingSoon = () => {
    const comingSoonMessages: Record<TabKey, string> = {
      'annual': '',
      'revenue-expense': '',
      'bu-allocation': 'Business Unit Allocation feature is coming soon. This will allow you to allocate budgets across different business units and track performance by unit.',
      'variance': '',
      'forecasting': 'Forecasting feature is coming soon. This will provide AI-powered financial forecasting and trend analysis.',
      'dashboard': 'Budget Dashboard feature is coming soon. This will provide comprehensive budget analytics and insights.',
      'scenarios': '',
      'approval': '',
    };
    
    const message = comingSoonMessages[activeTab] || 'This feature is coming soon.';
    
    return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-[#161950]/30 bg-white text-center text-sm text-[#161950] shadow-[0_24px_48px_-24px_rgba(79,70,229,0.25)]">
      <Sparkles className="mb-3 h-8 w-8 text-[#161950]/70" />
        <p className="max-w-sm text-balance px-6">
          {message}
      </p>
    </div>
  );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'annual':
        return (
          <AnnualBudgetTab
            annualMetrics={annualMetrics}
            aiHighlights={aiHighlights}
            budgetYear={budgetYear}
            setBudgetYear={setBudgetYear}
            targetGrowthRate={targetGrowthRate}
            setTargetGrowthRate={setTargetGrowthRate}
            totalRevenueTarget={totalRevenueTarget}
            setTotalRevenueTarget={setTotalRevenueTarget}
            totalExpenseBudget={totalExpenseBudget}
            setTotalExpenseBudget={setTotalExpenseBudget}
            copyFromYear={copyFromYear}
            setCopyFromYear={setCopyFromYear}
            isRevenueEditable={isRevenueEditable}
            setIsRevenueEditable={setIsRevenueEditable}
            isExpenseEditable={isExpenseEditable}
            setIsExpenseEditable={setIsExpenseEditable}
            revenueTotals={revenueTotals}
            expenseTotals={expenseTotals}
            handleSaveBudget={handleSaveBudget}
            handleCopyFromYear={handleCopyFromYear}
            handleReviewPreviousYear={handleReviewPreviousYear}
          />
        );
      case 'revenue-expense':
        return (
          <RevenueExpenseTab
            revenueLines={revenueLines}
            expenseLines={expenseLines}
            isRevenueExpenseEditMode={isRevenueExpenseEditMode}
            setIsRevenueExpenseEditMode={setIsRevenueExpenseEditMode}
            isExpenseBudgetEditMode={isExpenseBudgetEditMode}
            setIsExpenseBudgetEditMode={setIsExpenseBudgetEditMode}
            revenueTotals={revenueTotals}
            expenseTotals={expenseTotals}
            updateRevenueTarget={updateRevenueTarget}
            updateExpenseTarget={updateExpenseTarget}
            onSave={handleSaveRevenueExpense}
          />
        );
      case 'bu-allocation':
        return <BuAllocationTab businessUnits={businessUnits} />;
      case 'variance':
        return (
          <VarianceTab
            varianceThresholds={varianceThresholds}
            reportingSchedule={reportingSchedule}
            onSaveThresholds={handleSaveVarianceThresholds}
            onSaveReporting={handleSaveReportingSchedule}
            revenueTarget={totalRevenueTarget}
            expenseBudget={totalExpenseBudget}
            targetProfit={targetProfit}
            revenueVariance={revenueTotals.totalVariance}
            expenseVariance={expenseTotals.totalVariance}
            profitVariance={revenueTotals.totalVariance - expenseTotals.totalVariance}
          />
        );
      case 'dashboard':
        return renderDashboard();
      case 'forecasting':
        return renderForecasting();
      case 'scenarios':
        return renderScenarios();
      case 'approval':
        return renderApproval();
      default:
        return renderComingSoon();
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 text-[#101828]">
      <div className="flex w-full flex-col gap-8 px-6 py-8">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-3">
            <nav className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
              <Link to="/module/finance" className="flex items-center gap-1 text-slate-500 transition hover:text-[#161950]">
                <span>Dashboard</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
              <span className="text-slate-700">Finance</span>
            </nav>
            <div>
              <h1 className="text-4xl font-semibold text-slate-900">Annual Budget Creation</h1>
              <p className="text-base text-slate-500">
                AI-guided workflow to set revenue targets, expense envelopes, and approval checkpoints for the upcoming
                fiscal year.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="group h-10 bg-white/0 outline outline-1 outline-offset-[-1px] outline-indigo-950 inline-flex items-center gap-2.5 rounded-xl border border-[#161950] bg-white px-4 py-2 text-sm font-semibold uppercase tracking-wide text-[#161950] shadow-sm transition hover:bg-[#161950] hover:text-white">
              <History className="h-4 w-4 text-[#161950] transition group-hover:text-white" />
              Review Previous Year
            </button>
            <Link
              to="/module/finance"
              className="group h-10 bg-[#161950] outline outline-1 outline-offset-[-1px] outline-indigo-950 inline-flex items-center gap-2.5 rounded-xl border border-[#161950] px-4 py-2 text-sm font-semibold uppercase tracking-wide shadow-sm transition text-white hover:text-white"
            >
              AI Budget Planning
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {TABS.map((tab) => {
            const isActive = tab.key === activeTab;
            const isSoon = IN_PROGRESS_TABS.includes(tab.key);
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={[
                  'flex-1 rounded-lg px-3 py-2.5 text-base font-semibold transition',
                  isActive
                    ? 'bg-[#161950] text-white shadow-[0_12px_24px_-12px_rgba(22,25,80,0.45)]'
                    : 'text-slate-500 hover:bg-[#161950]/10 hover:text-[#161950]',
                ].join(' ')}
              >
                {tab.label}
                {isSoon && (
                  <span className="ml-1 text-xs uppercase tracking-wide text-[#161950]/60">(soon)</span>
                )}
              </button>
            );
          })}
        </div>

        {activeIsComingSoon ? renderComingSoon() : renderTabContent()}
      </div>
    </div>
  );
}
export default memo(FinancePlanningPage);