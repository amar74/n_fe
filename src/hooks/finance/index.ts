/**
 * Finance Module Hooks
 * 
 * All hooks related to finance, expenses, and financial data.
 */

export {
  financeApiClient,
  useFinanceAIAnalysis,
  financeKeys,
  useFinanceDashboardSummary,
  useFinanceOverhead,
  useFinanceRevenue,
  useFinanceBookings,
  useFinanceTrends,
  useFinancePlanningAnnual,
  useFinancePlanningScenarios,
  useSaveAnnualBudget,
  useUpdateAnnualBudget,
  useUpdatePlanningConfig,
  useUpdateScenario,
  useGenerateForecast,
  useForecasts,
  useExportForecast,
  useBudgetApprovals,
  useSaveVarianceExplanations,
  useSubmitBudgetForApproval,
  useProcessApprovalAction
} from './useFinance';
export { 
  useExpenseCategories,
  useExpenseCategory,
  useActiveExpenseCategories,
  useCreateExpenseCategory,
  useUpdateExpenseCategory,
  useDeleteExpenseCategory,
  useInitializeDefaultCategories
} from './useExpenseCategories';
