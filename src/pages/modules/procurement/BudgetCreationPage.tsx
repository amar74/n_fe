import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Calculator,
  CheckCircle,
  DollarSign,
  Minus,
  Plus,
  Target,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Calendar,
  FileCheck,
  AlertCircle,
  Brain,
  Sparkles,
  Lightbulb,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useExpenseCategories, ExpenseCategory } from '@/hooks/useExpenseCategories';
import { useNavigate } from 'react-router-dom';
import { useFinancePlanningAnnual, useSaveAnnualBudget } from '@/hooks/useFinance';

interface BudgetCategoryData {
  id: string;
  categoryId: number;
  name: string;
  description: string;
  actualLastYear: number;
  actualCurrentYear: number;
  proposedBudget: number;
  aiSuggestedBudget?: number;
  aiConfidence?: number;
  marketGrowthRate?: number;
  subcategories: BudgetSubcategoryData[];
}

interface BudgetSubcategoryData {
  id: string;
  categoryId: number;
  name: string;
  actualLastYear: number;
  actualCurrentYear: number;
  proposedBudget: number;
  aiSuggestedBudget?: number;
}

interface NewCategoryData {
  selectedCategoryId: string;
  description: string;
  proposedBudget: string;
}

interface AISuggestion {
  suggestedBudget: number;
  confidence: number;
  marketGrowthRate: number;
  reasoning: string;
}

const MARKET_GROWTH_RATES: Record<string, number> = {
  'Software & Technology': 0.12,
  'Office Operations': 0.05,
  'Professional Services': 0.08,
  'Travel & Transportation': 0.06,
  'Marketing & Advertising': 0.10,
  'Training & Development': 0.07,
  'Legal': 0.09,
  'Hardware & Equipment': 0.08,
  'Utilities': 0.04,
  'Rent & Facilities': 0.05,
  'Insurance': 0.06,
  'Other': 0.05,
};

function calculateAISuggestion(
  categoryName: string,
  actualLastYear: number,
  actualCurrentYear: number
): AISuggestion {
  const marketGrowthRate = MARKET_GROWTH_RATES[categoryName] || 0.06;
  
  let suggestedBudget = actualCurrentYear;
  let confidence = 0.7;
  let reasoning = '';

  if (actualLastYear > 0 && actualCurrentYear > 0) {
    const historicalGrowth = (actualCurrentYear - actualLastYear) / actualLastYear;
    const avgGrowth = (historicalGrowth + marketGrowthRate) / 2;
    suggestedBudget = actualCurrentYear * (1 + avgGrowth);
    confidence = 0.85;
    reasoning = `Based on historical growth of ${(historicalGrowth * 100).toFixed(1)}% and market growth rate of ${(marketGrowthRate * 100).toFixed(1)}%`;
  } else if (actualCurrentYear > 0) {
    suggestedBudget = actualCurrentYear * (1 + marketGrowthRate);
    confidence = 0.75;
    reasoning = `Based on current year spending with market growth rate of ${(marketGrowthRate * 100).toFixed(1)}%`;
  } else if (actualLastYear > 0) {
    suggestedBudget = actualLastYear * (1 + marketGrowthRate);
    confidence = 0.65;
    reasoning = `Based on last year spending with market growth rate of ${(marketGrowthRate * 100).toFixed(1)}%`;
  } else {
    suggestedBudget = 0;
    confidence = 0.5;
    reasoning = 'No historical data available. Please enter budget manually.';
  }

  return {
    suggestedBudget: Math.round(suggestedBudget),
    confidence,
    marketGrowthRate,
    reasoning,
  };
}

export default function BudgetCreationPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [budgetYear, setBudgetYear] = useState('2025');
  
  // Load Finance budget data
  const { data: annualBudgetData, isLoading: budgetLoading } = useFinancePlanningAnnual(budgetYear);
  const saveAnnualBudgetMutation = useSaveAnnualBudget();
  
  const { data: allCategories, isLoading: categoriesLoading } = useExpenseCategories({
    include_inactive: false,
    include_subcategories: true,
    category_type: 'expense',
  });

  const [budgetCategories, setBudgetCategories] = useState<BudgetCategoryData[]>([]);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [newCategory, setNewCategory] = useState<NewCategoryData>({
    selectedCategoryId: '',
    description: '',
    proposedBudget: '',
  });
  const [selectedCategorySubcategories, setSelectedCategorySubcategories] = useState<ExpenseCategory[]>([]);

  const topLevelCategories = allCategories?.filter((cat) => cat.parent_id === null) || [];

  // Load existing expense lines from Finance module
  useEffect(() => {
    if (annualBudgetData?.expense_lines && allCategories) {
      const expenseLines = annualBudgetData.expense_lines;
      const loadedCategories: BudgetCategoryData[] = [];
      
      // Map expense lines to categories
      const topLevelCategories = allCategories.filter((cat) => cat.parent_id === null);
      
      topLevelCategories.forEach((category) => {
        // Find matching expense line by label
        const matchingLine = expenseLines.find((line) => 
          line.label.toLowerCase() === category.name.toLowerCase()
        );
        
        if (matchingLine) {
          const subcategories = allCategories.filter((cat) => cat.parent_id === category.id);
          const subcategoriesData: BudgetSubcategoryData[] = subcategories.map((sub) => {
            const subLine = expenseLines.find((line) => 
              line.label.toLowerCase() === sub.name.toLowerCase()
            );
            return {
              id: `SC-${sub.id}-${Date.now()}`,
              categoryId: sub.id,
              name: sub.name,
              actualLastYear: 0,
              actualCurrentYear: 0,
              proposedBudget: subLine?.target || 0,
            };
          });
          
          loadedCategories.push({
            id: `BC-${category.id}-${Date.now()}`,
            categoryId: category.id,
            name: category.name,
            description: category.description || '',
            actualLastYear: 0,
            actualCurrentYear: 0,
            proposedBudget: matchingLine.target || 0,
            aiSuggestedBudget: 0,
            aiConfidence: 0,
            marketGrowthRate: 0,
            subcategories: subcategoriesData,
          });
        }
      });
      
      setBudgetCategories(loadedCategories);
    }
  }, [annualBudgetData, allCategories]);

  useEffect(() => {
    if (newCategory.selectedCategoryId && allCategories) {
      const categoryId = parseInt(newCategory.selectedCategoryId);
      const subcategories = allCategories.filter((cat) => cat.parent_id === categoryId);
      setSelectedCategorySubcategories(subcategories);
    } else {
      setSelectedCategorySubcategories([]);
    }
  }, [newCategory.selectedCategoryId, allCategories]);

  const generateAISuggestions = () => {
    setIsAIGenerating(true);
    
    setTimeout(() => {
      setBudgetCategories((prev) =>
        prev.map((cat) => {
          const aiSuggestion = calculateAISuggestion(cat.name, cat.actualLastYear, cat.actualCurrentYear);
          return {
            ...cat,
            aiSuggestedBudget: aiSuggestion.suggestedBudget,
            aiConfidence: aiSuggestion.confidence,
            marketGrowthRate: aiSuggestion.marketGrowthRate,
          };
        })
      );
      
      setIsAIGenerating(false);
      toast({
        title: 'AI Suggestions Generated',
        description: 'Budget suggestions based on historical data and market growth rates have been calculated.',
      });
    }, 1500);
  };

  const applyAISuggestion = (categoryId: string) => {
    setBudgetCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId && cat.aiSuggestedBudget
          ? { ...cat, proposedBudget: cat.aiSuggestedBudget }
          : cat
      )
    );
    toast({
      title: 'AI Suggestion Applied',
      description: 'Budget has been updated with AI suggestion.',
    });
  };

  const updateCategoryBudget = (categoryId: string, newAmount: number) => {
    setBudgetCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, proposedBudget: Math.max(0, newAmount) } : cat
      )
    );
  };

  const updateSubcategoryBudget = (
    categoryId: string,
    subcategoryId: string,
    newAmount: number
  ) => {
    setBudgetCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              subcategories: cat.subcategories.map((sub) =>
                sub.id === subcategoryId ? { ...sub, proposedBudget: Math.max(0, newAmount) } : sub
              ),
            }
          : cat
      )
    );
  };

  const deleteCategory = (categoryId: string) => {
    setBudgetCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
    toast({
      title: 'Category Deleted',
      description: 'Budget category has been removed from the budget plan.',
    });
  };

  const addCategory = async () => {
    if (!newCategory.selectedCategoryId || !newCategory.proposedBudget) {
      toast({
        title: 'Validation Error',
        description: 'Please select a category and enter a budget amount.',
        variant: 'destructive',
      });
      return;
    }

    const selectedCategoryId = parseInt(newCategory.selectedCategoryId);
    const selectedCategory = allCategories?.find(
      (cat) => cat.id === selectedCategoryId
    );

    if (!selectedCategory) {
      toast({
        title: 'Error',
        description: 'Selected category not found.',
        variant: 'destructive',
      });
      return;
    }

    // Check if category is already added
    const categoryExists = budgetCategories.some(
      (cat) => cat.categoryId === selectedCategoryId
    );

    if (categoryExists) {
      toast({
        title: 'Category Already Added',
        description: `${selectedCategory.name} is already in the budget plan.`,
        variant: 'destructive',
      });
      return;
    }

    // Fetch historical spending data from backend
    try {
      // Get historical spending from FinanceExpenseLine
      const historicalData = { actual_last_year: 0, actual_current_year: 0 };
      
      // Try to get from existing expense lines
      if (annualBudgetData?.expense_lines) {
        const matchingLine = annualBudgetData.expense_lines.find(
          (line) => line.label.toLowerCase() === selectedCategory.name.toLowerCase()
        );
        if (matchingLine) {
          historicalData.actual_current_year = matchingLine.target || 0;
        }
      }

      const subcategoriesData: BudgetSubcategoryData[] = selectedCategorySubcategories.map((sub) => ({
        id: `SC-${sub.id}-${Date.now()}`,
        categoryId: sub.id,
        name: sub.name,
        actualLastYear: 0,
        actualCurrentYear: 0,
        proposedBudget: 0,
      }));

      const aiSuggestion = calculateAISuggestion(
        selectedCategory.name,
        historicalData.actual_last_year,
        historicalData.actual_current_year
      );

      const newBudgetCategory: BudgetCategoryData = {
        id: `BC-${selectedCategory.id}-${Date.now()}`,
        categoryId: selectedCategory.id,
        name: selectedCategory.name,
        description: newCategory.description || selectedCategory.description || '',
        actualLastYear: historicalData.actual_last_year,
        actualCurrentYear: historicalData.actual_current_year,
        proposedBudget: parseFloat(newCategory.proposedBudget) || 0,
        aiSuggestedBudget: aiSuggestion.suggestedBudget,
        aiConfidence: aiSuggestion.confidence,
        marketGrowthRate: aiSuggestion.marketGrowthRate,
        subcategories: subcategoriesData,
      };

      setBudgetCategories((prev) => {
        const updated = [...prev, newBudgetCategory];
        console.log('Budget categories updated:', updated);
        return updated;
      });
      
      setNewCategory({ selectedCategoryId: '', description: '', proposedBudget: '' });
      setSelectedCategorySubcategories([]);
      setIsAddCategoryModalOpen(false);

      toast({
        title: 'Category Added',
        description: `${selectedCategory.name} has been added to the budget plan.`,
      });
    } catch (error: any) {
      console.error('Error fetching historical data:', error);
      // Fallback to zero values if historical data fetch fails
      const subcategoriesData: BudgetSubcategoryData[] = selectedCategorySubcategories.map((sub) => ({
        id: `SC-${sub.id}-${Date.now()}`,
        categoryId: sub.id,
        name: sub.name,
        actualLastYear: 0,
        actualCurrentYear: 0,
        proposedBudget: 0,
      }));

      const aiSuggestion = calculateAISuggestion(selectedCategory.name, 0, 0);

      const newBudgetCategory: BudgetCategoryData = {
        id: `BC-${selectedCategory.id}-${Date.now()}`,
        categoryId: selectedCategory.id,
        name: selectedCategory.name,
        description: newCategory.description || selectedCategory.description || '',
        actualLastYear: 0,
        actualCurrentYear: 0,
        proposedBudget: parseFloat(newCategory.proposedBudget) || 0,
        aiSuggestedBudget: aiSuggestion.suggestedBudget,
        aiConfidence: aiSuggestion.confidence,
        marketGrowthRate: aiSuggestion.marketGrowthRate,
        subcategories: subcategoriesData,
      };

      setBudgetCategories((prev) => {
        const updated = [...prev, newBudgetCategory];
        return updated;
      });
      
      setNewCategory({ selectedCategoryId: '', description: '', proposedBudget: '' });
      setSelectedCategorySubcategories([]);
      setIsAddCategoryModalOpen(false);

      toast({
        title: 'Category Added',
        description: `${selectedCategory.name} has been added (historical data unavailable).`,
      });
    }


  };

  const finalizeBudget = async () => {
    if (budgetCategories.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please add at least one budget category before finalizing.',
        variant: 'destructive',
      });
      return;
    }

    const totalBudget = budgetCategories.reduce((sum, cat) => sum + cat.proposedBudget, 0);

    try {
      // Build expense lines from budget categories
      const expenseLines: Array<{ label: string; target: number; variance: number }> = [];
      
      budgetCategories.forEach((cat) => {
        // Only add main category if it has a budget > 0
        if (cat.proposedBudget > 0) {
          expenseLines.push({
            label: cat.name,
            target: cat.proposedBudget,
            variance: 0,
          });
        }
        
        // Add subcategories only if they have budget > 0
        cat.subcategories.forEach((sub) => {
          if (sub.proposedBudget > 0) {
            expenseLines.push({
              label: sub.name,
              target: sub.proposedBudget,
              variance: 0,
            });
          }
        });
      });

      // Get existing revenue lines (keep them as is)
      const revenueLines = annualBudgetData?.revenue_lines || [];

      // Calculate totals
      const totalExpenseBudget = expenseLines.reduce((sum, line) => sum + line.target, 0);
      const totalRevenueTarget = annualBudgetData?.budget_summary?.find(m => m.label.toLowerCase().includes('revenue'))?.value || 0;

      console.log('Saving budget with expense lines:', expenseLines);
      console.log('Total expense budget:', totalExpenseBudget);

      // Save to Finance module
      await saveAnnualBudgetMutation.mutateAsync({
        budget_year: budgetYear,
        target_growth_rate: 15, // Default growth rate
        total_revenue_target: totalRevenueTarget,
        total_expense_budget: totalExpenseBudget,
        revenue_lines: revenueLines,
        expense_lines: expenseLines,
      });
      
      // Force a small delay to ensure backend has committed
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: 'Budget Finalized',
        description: `Budget for ${budgetYear} has been finalized and saved with total allocation of $${totalBudget.toLocaleString()}.`,
      });

      // Navigate back to procurement page after a short delay
      setTimeout(() => {
        navigate('/module/procurement');
      }, 1500);
    } catch (error) {
      console.error('Error finalizing budget:', error);
      toast({
        title: 'Error',
        description: 'Failed to save budget. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getVarianceColor = (current: number, lastYear: number) => {
    if (lastYear === 0) return 'text-gray-600';
    const variance = ((current - lastYear) / lastYear) * 100;
    if (variance > 10) return 'text-red-600';
    if (variance < -10) return 'text-green-600';
    return 'text-gray-600';
  };

  const getVarianceIcon = (current: number, lastYear: number) => {
    const variance = current - lastYear;
    if (variance > 0) return <ArrowUpRight className="h-4 w-4" />;
    if (variance < 0) return <ArrowDownRight className="h-4 w-4" />;
    return null;
  };

  const totalLastYear = budgetCategories.reduce((sum, cat) => sum + cat.actualLastYear, 0);
  const totalCurrentYear = budgetCategories.reduce((sum, cat) => sum + cat.actualCurrentYear, 0);
  const totalProposedBudget = budgetCategories.reduce((sum, cat) => sum + cat.proposedBudget, 0);
  const totalAISuggested = budgetCategories.reduce(
    (sum, cat) => sum + (cat.aiSuggestedBudget || 0),
    0
  );
  const yearOverYearGrowth =
    totalLastYear > 0 ? ((totalCurrentYear - totalLastYear) / totalLastYear) * 100 : 0;
  const budgetVsCurrentSpend =
    totalCurrentYear > 0 ? ((totalProposedBudget - totalCurrentYear) / totalCurrentYear) * 100 : 0;

  const hasAISuggestions = budgetCategories.some((cat) => cat.aiSuggestedBudget !== undefined);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            to="/module/procurement"
            className="inline-flex items-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-outfit"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span>Back to Procurement</span>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2 font-outfit">Create Annual Budget</h1>
            <p className="text-gray-600 font-outfit">
              Plan your annual budget based on historical spending and business projections
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <Select value={budgetYear} onValueChange={setBudgetYear}>
                <SelectTrigger className="w-32 font-outfit h-11 border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2027">2027</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-gray-500 mt-1 font-outfit">Budget Year</span>
            </div>
            <Button
              className="bg-[#161950] hover:bg-[#1E2B5B] text-white font-outfit h-11 px-6"
              onClick={finalizeBudget}
              disabled={saveAnnualBudgetMutation.isPending || budgetCategories.length === 0}
            >
              {saveAnnualBudgetMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FileCheck className="h-4 w-4 mr-2" />
                  Finalize Budget
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-base font-outfit">
                <Calendar className="h-5 w-5 text-gray-600" />
                <span>Last Year Actual</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-600 mb-1 font-outfit">
                ${totalLastYear.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 font-outfit">2023 total spend</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-base font-outfit">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span>Current Year</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-1 font-outfit">
                ${totalCurrentYear.toLocaleString()}
              </div>
              <div className="flex items-center space-x-1">
                {getVarianceIcon(totalCurrentYear, totalLastYear)}
                <span
                  className={`text-sm font-medium ${getVarianceColor(totalCurrentYear, totalLastYear)} font-outfit`}
                >
                  {yearOverYearGrowth > 0 ? '+' : ''}
                  {yearOverYearGrowth.toFixed(1)}% vs last year
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-base font-outfit">
                <Target className="h-5 w-5 text-[#161950]" />
                <span>Proposed Budget</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#161950] mb-1 font-outfit">
                ${totalProposedBudget.toLocaleString()}
              </div>
              <div className="flex items-center space-x-1">
                {getVarianceIcon(totalProposedBudget, totalCurrentYear)}
                <span
                  className={`text-sm font-medium ${getVarianceColor(totalProposedBudget, totalCurrentYear)} font-outfit`}
                >
                  {budgetVsCurrentSpend > 0 ? '+' : ''}
                  {budgetVsCurrentSpend.toFixed(1)}% vs current
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-base font-outfit">
                <Calculator className="h-5 w-5 text-[#161950]" />
                <span>Categories</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#161950] mb-1 font-outfit">
                {budgetCategories.length}
              </div>
              <p className="text-sm text-gray-600 font-outfit">Budget categories</p>
            </CardContent>
          </Card>
        </div>

        {budgetCategories.length > 0 && (
          <div className="mb-6 flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => setIsAddCategoryModalOpen(true)}
              className="border-2 border-dashed border-gray-300 h-14 flex-1 hover:border-[#161950] hover:bg-[#161950]/5 font-outfit"
              disabled={categoriesLoading}
            >
              <Plus className="h-5 w-5 mr-2" />
              <span className="text-base font-outfit">Add New Budget Category</span>
            </Button>
            <Button
              onClick={generateAISuggestions}
              disabled={isAIGenerating || budgetCategories.length === 0}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-outfit h-14 px-6"
            >
              {isAIGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5 mr-2" />
                  <span>Generate AI Suggestions</span>
                </>
              )}
            </Button>
          </div>
        )}

        {budgetCategories.length === 0 && (
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setIsAddCategoryModalOpen(true)}
              className="border-2 border-dashed border-gray-300 h-14 w-full hover:border-[#161950] hover:bg-[#161950]/5 font-outfit"
              disabled={categoriesLoading}
            >
              <Plus className="h-5 w-5 mr-2" />
              <span className="text-base font-outfit">Add New Budget Category</span>
            </Button>
          </div>
        )}

        {budgetCategories.length === 0 ? (
          <Card className="border border-gray-200 bg-white p-12 text-center shadow-sm">
            <CardContent>
              <p className="text-gray-500 font-outfit">
                No budget categories added yet. Click the button above to add your first category.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {budgetCategories.map((category, index) => (
              <Card
                key={`${category.id}-${index}`}
                className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-[#1A1A1A] font-outfit">{category.name}</h3>
                      </div>
                      <p className="text-gray-600 font-outfit">{category.description || 'No description provided'}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteCategory(category.id)}
                      className="border-red-300 text-red-600 hover:bg-red-50 font-outfit"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {category.aiSuggestedBudget !== undefined && category.aiSuggestedBudget > 0 && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Brain className="h-5 w-5 text-purple-600" />
                            <h4 className="font-semibold text-purple-900 font-outfit">AI Budget Suggestion</h4>
                            <Badge className="bg-purple-100 text-purple-800 font-outfit">
                              {(category.aiConfidence || 0) * 100}% confidence
                            </Badge>
                          </div>
                          <p className="text-sm text-purple-700 mb-3 font-outfit">
                            Suggested: <span className="font-bold">${category.aiSuggestedBudget.toLocaleString()}</span>
                            {' '}(Market growth: {(category.marketGrowthRate || 0) * 100}%)
                          </p>
                          <p className="text-xs text-purple-600 font-outfit">
                            {category.actualLastYear > 0 || category.actualCurrentYear > 0
                              ? 'Based on historical spending trends and market growth rates'
                              : 'Based on market growth rates for this category'}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => applyAISuggestion(category.id)}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-outfit"
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Apply
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-700 text-sm font-outfit">Historical Spending</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center py-1">
                          <span className="text-sm text-gray-600 font-outfit">2023 Actual:</span>
                          <span className="font-medium text-sm text-[#1A1A1A] font-outfit">
                            ${category.actualLastYear.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-sm text-gray-600 font-outfit">2024 Actual:</span>
                          <span className="font-medium text-sm text-[#1A1A1A] font-outfit">
                            ${category.actualCurrentYear.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-sm text-gray-600 font-outfit">Growth:</span>
                          <div className="flex items-center space-x-1">
                            {getVarianceIcon(category.actualCurrentYear, category.actualLastYear)}
                            <span
                              className={`text-sm font-medium ${getVarianceColor(category.actualCurrentYear, category.actualLastYear)} font-outfit`}
                            >
                              {category.actualLastYear > 0
                                ? (((category.actualCurrentYear - category.actualLastYear) / category.actualLastYear) *
                                    100).toFixed(1)
                                : '0.0'}
                              %
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-700 text-sm font-outfit">Proposed Budget ({budgetYear})</h4>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateCategoryBudget(category.id, category.proposedBudget - 5000)}
                          className="px-2 py-1 h-9 font-outfit"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <div className="flex-1">
                          <Input
                            type="number"
                            value={category.proposedBudget}
                            onChange={(e) =>
                              updateCategoryBudget(category.id, parseFloat(e.target.value) || 0)
                            }
                            className="text-center font-medium h-9 font-outfit"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateCategoryBudget(category.id, category.proposedBudget + 5000)}
                          className="px-2 py-1 h-9 font-outfit"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-center pt-2">
                        <span className="text-2xl font-bold text-[#161950] font-outfit">
                          ${category.proposedBudget.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-700 text-sm font-outfit">Budget vs Current</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center py-1">
                          <span className="text-sm text-gray-600 font-outfit">Variance:</span>
                          <span
                            className={`font-medium text-sm ${getVarianceColor(category.proposedBudget, category.actualCurrentYear)} font-outfit`}
                          >
                            {category.proposedBudget > category.actualCurrentYear ? '+' : ''}
                            ${(category.proposedBudget - category.actualCurrentYear).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-sm text-gray-600 font-outfit">% Change:</span>
                          <div className="flex items-center space-x-1">
                            {getVarianceIcon(category.proposedBudget, category.actualCurrentYear)}
                            <span
                              className={`text-sm font-medium ${getVarianceColor(category.proposedBudget, category.actualCurrentYear)} font-outfit`}
                            >
                              {category.actualCurrentYear > 0
                                ? (((category.proposedBudget - category.actualCurrentYear) /
                                    category.actualCurrentYear) *
                                  100).toFixed(1)
                                : '0.0'}
                              %
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-700 text-sm font-outfit">Budget Allocation</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center py-1">
                          <span className="text-sm text-gray-600 font-outfit">% of Total:</span>
                          <span className="font-medium text-sm text-[#1A1A1A] font-outfit">
                            {totalProposedBudget > 0
                              ? ((category.proposedBudget / totalProposedBudget) * 100).toFixed(1)
                              : '0.0'}
                            %
                          </span>
                        </div>
                        <Progress
                          value={totalProposedBudget > 0 ? (category.proposedBudget / totalProposedBudget) * 100 : 0}
                          className="h-2"
                        />
                        <div className="text-xs text-gray-500 font-outfit">Share of total budget</div>
                      </div>
                    </div>
                  </div>

                  {category.subcategories.length > 0 && (
                    <div className="pt-6 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-4 text-sm font-outfit">Subcategory Breakdown</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {category.subcategories.map((sub) => (
                          <div key={sub.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="space-y-3">
                              <h5 className="font-medium text-sm text-[#1A1A1A] font-outfit">{sub.name}</h5>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-gray-600 font-outfit">2023:</span>
                                  <div className="font-medium text-[#1A1A1A] font-outfit">
                                    ${sub.actualLastYear.toLocaleString()}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-600 font-outfit">2024:</span>
                                  <div className="font-medium text-[#1A1A1A] font-outfit">
                                    ${sub.actualCurrentYear.toLocaleString()}
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <span className="text-xs text-gray-600 font-outfit">{budgetYear} Budget:</span>
                                <div className="flex items-center space-x-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      updateSubcategoryBudget(category.id, sub.id, sub.proposedBudget - 1000)
                                    }
                                    className="px-1 py-0 h-7 w-7 font-outfit"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <Input
                                    type="number"
                                    value={sub.proposedBudget}
                                    onChange={(e) =>
                                      updateSubcategoryBudget(
                                        category.id,
                                        sub.id,
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    className="h-7 text-xs text-center font-outfit"
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      updateSubcategoryBudget(category.id, sub.id, sub.proposedBudget + 1000)
                                    }
                                    className="px-1 py-0 h-7 w-7 font-outfit"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {budgetCategories.length > 0 && (
          <Card className="mt-8 border border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 font-outfit">
                <CheckCircle className="h-5 w-5 text-[#161950]" />
                <span>Budget Finalization</span>
              </CardTitle>
              <CardDescription className="font-outfit">
                Review your budget plan and finalize for {budgetYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-[#1A1A1A] font-outfit">Budget Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-600 font-outfit">Total Categories:</span>
                      <span className="font-medium text-[#1A1A1A] font-outfit">{budgetCategories.length}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-600 font-outfit">Total Budget:</span>
                      <span className="font-bold text-lg text-[#1A1A1A] font-outfit">
                        ${totalProposedBudget.toLocaleString()}
                      </span>
                    </div>
                    {hasAISuggestions && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-gray-600 font-outfit">AI Suggested Total:</span>
                        <span className="font-medium text-purple-600 font-outfit">
                          ${totalAISuggested.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-600 font-outfit">vs Current Year:</span>
                      <span
                        className={`font-medium ${getVarianceColor(totalProposedBudget, totalCurrentYear)} font-outfit`}
                      >
                        {budgetVsCurrentSpend > 0 ? '+' : ''}
                        {budgetVsCurrentSpend.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-end">
                  <Button
                    className="w-full bg-[#161950] hover:bg-[#1E2B5B] h-14 text-base font-outfit"
                    onClick={finalizeBudget}
                    disabled={saveAnnualBudgetMutation.isPending || budgetCategories.length === 0}
                  >
                    {saveAnnualBudgetMutation.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FileCheck className="h-5 w-5 mr-3" />
                        Finalize {budgetYear} Budget
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isAddCategoryModalOpen} onOpenChange={setIsAddCategoryModalOpen}>
        <DialogContent className="max-w-2xl font-outfit">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-xl font-semibold text-[#1A1A1A] font-outfit">
              <Plus className="h-6 w-6 text-[#161950]" />
              <span>Add New Budget Category</span>
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 font-outfit">
              Select a category from organization settings and add budget details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <Label htmlFor="categorySelect" className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
                Select Category *
              </Label>
              <Select
                value={newCategory.selectedCategoryId}
                onValueChange={(value) => setNewCategory((prev) => ({ ...prev, selectedCategoryId: value }))}
              >
                <SelectTrigger className="border-gray-200 font-outfit h-11">
                  <SelectValue placeholder="Select a category from organization settings" />
                </SelectTrigger>
                <SelectContent>
                  {topLevelCategories.length === 0 ? (
                    <SelectItem value="no-categories" disabled>
                      No categories available. Please create categories in Organization Settings.
                    </SelectItem>
                  ) : (
                    topLevelCategories
                      .filter((cat) => !budgetCategories.some((bc) => bc.categoryId === cat.id))
                      .map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.name}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
              {newCategory.selectedCategoryId && selectedCategorySubcategories.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2 font-outfit">
                    Subcategories will be automatically included:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategorySubcategories.map((sub) => (
                      <Badge
                        key={sub.id}
                        variant="outline"
                        className="bg-white border-blue-300 text-blue-700 font-outfit"
                      >
                        {sub.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="categoryDescription" className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
                Description
              </Label>
              <Textarea
                id="categoryDescription"
                placeholder="Add description for this budget category (optional)"
                value={newCategory.description}
                onChange={(e) => setNewCategory((prev) => ({ ...prev, description: e.target.value }))}
                className="border-gray-200 font-outfit resize-none min-h-24"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="categoryBudget" className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
                Proposed Budget Amount *
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="categoryBudget"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newCategory.proposedBudget}
                  onChange={(e) => setNewCategory((prev) => ({ ...prev, proposedBudget: e.target.value }))}
                  className="pl-10 border-gray-200 font-outfit h-11"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddCategoryModalOpen(false);
                setNewCategory({ selectedCategoryId: '', description: '', proposedBudget: '' });
                setSelectedCategorySubcategories([]);
              }}
              className="border-gray-200 font-outfit"
            >
              Cancel
            </Button>
            <Button
              onClick={addCategory}
              className="bg-[#161950] hover:bg-[#1E2B5B] text-white font-outfit"
              disabled={!newCategory.selectedCategoryId || !newCategory.proposedBudget}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
