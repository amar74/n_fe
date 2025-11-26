import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useExpenseCategories,
  useCreateExpenseCategory,
  useUpdateExpenseCategory,
  useDeleteExpenseCategory,
  useInitializeDefaultCategories,
  type ExpenseCategory,
  type ExpenseCategoryCreate,
} from '@/hooks/useExpenseCategories';
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronRight,
  Save,
  X,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function ExpenseCategoryManagement() {
  const [categoryTypeFilter, setCategoryTypeFilter] = useState<'all' | 'revenue' | 'expense'>('all');
  
  const { data: allCategories, isLoading, error } = useExpenseCategories({
    include_inactive: true,
    include_subcategories: true,
  });
  
  const categories = categoryTypeFilter === 'all' 
    ? allCategories 
    : allCategories?.filter(cat => cat.category_type === categoryTypeFilter);
  const createMutation = useCreateExpenseCategory();
  const updateMutation = useUpdateExpenseCategory();
  const deleteMutation = useDeleteExpenseCategory();
  const initializeMutation = useInitializeDefaultCategories();
  const { toast } = useToast();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  // Auto-expand all categories with subcategories by default
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(() => {
    const expanded = new Set<number>();
    // This will be populated after categories are loaded
    return expanded;
  });

  // Auto-expand categories with subcategories when data loads
  useEffect(() => {
    if (categories && categories.length > 0) {
      const categoriesWithSubs = new Set<number>();
      categories.forEach(cat => {
        const subcats = categories.filter(c => c.parent_id === cat.id);
        if (subcats.length > 0) {
          categoriesWithSubs.add(cat.id);
        }
      });
      setExpandedCategories(categoriesWithSubs);
    }
  }, [categories]);

  const [formData, setFormData] = useState<ExpenseCategoryCreate>({
    name: '',
    description: '',
    parent_id: null,
    is_active: true,
    display_order: 0,
    category_type: 'expense',
  });

  const topLevelCategories = categories?.filter(cat => cat.parent_id === null) || [];

  const toggleExpanded = (categoryId: number) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const getSubcategories = (parentId: number) => {
    return categories?.filter(cat => cat.parent_id === parentId) || [];
  };

  const handleCreate = () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Category name is required',
        variant: 'destructive',
      });
      return;
    }

    createMutation.mutate(formData, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        setFormData({
          name: '',
          description: '',
          parent_id: null,
          is_active: true,
          display_order: 0,
          category_type: 'expense',
        });
      },
    });
  };

  const handleUpdate = (category: ExpenseCategory) => {
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Category name is required',
        variant: 'destructive',
      });
      return;
    }

    updateMutation.mutate(
      {
        id: category.id,
        data: formData,
      },
      {
        onSuccess: () => {
          setEditingCategory(null);
          setFormData({
            name: '',
            description: '',
            parent_id: null,
            is_active: true,
            display_order: 0,
          });
        },
      }
    );
  };

  const handleDelete = (category: ExpenseCategory) => {
    if (category.is_default) {
      toast({
        title: 'Error',
        description: 'Cannot delete default categories',
        variant: 'destructive',
      });
      return;
    }

    const message = `Are you sure you want to delete "${category.name}"?\n\n` +
      `If this category has budget values, they will be transferred to "${category.category_type === 'revenue' ? 'Other Revenue' : 'Other Expense'}".\n\n` +
      `This action cannot be undone.`;
    
    if (window.confirm(message)) {
      deleteMutation.mutate(category.id, {
        onSuccess: () => {
          toast({
            title: 'Success',
            description: `Category "${category.name}" deleted successfully. Budget values have been transferred to ${category.category_type === 'revenue' ? 'Other Revenue' : 'Other Expense'}.`,
          });
        },
        onError: (error: any) => {
          toast({
            title: 'Error',
            description: error?.response?.data?.detail || `Failed to delete category: ${error.message}`,
            variant: 'destructive',
          });
        },
      });
    }
  };

  const handleEdit = (category: ExpenseCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      parent_id: category.parent_id,
      is_active: category.is_active,
      display_order: category.display_order,
      category_type: category.category_type,
    });
  };

  const handleInitializeDefaults = (type?: 'revenue' | 'expense') => {
    const message = type 
      ? `This will create default ${type} categories if they do not exist. Continue?`
      : 'This will create default categories (both revenue and expense) if they do not exist. Continue?';
    if (window.confirm(message)) {
      initializeMutation.mutate(type as any);
    }
  };
  
  const handleInitializeRevenue = () => handleInitializeDefaults('revenue');
  const handleInitializeExpense = () => handleInitializeDefaults('expense');
  const handleInitializeAll = () => handleInitializeDefaults();

  const renderCategory = (category: ExpenseCategory, level: number = 0) => {
    const subcategories = getSubcategories(category.id);
    const hasSubcategories = subcategories.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <div key={category.id} className="border border-gray-200 rounded-lg mb-2">
        <div
          className={`flex items-center gap-3 p-4 ${level > 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 transition-colors`}
          style={{ paddingLeft: `${16 + level * 24}px` }}
        >
          {hasSubcategories ? (
            <button
              onClick={() => toggleExpanded(category.id)}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-600" />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}
          <FolderTree className="h-5 w-5 text-[#161950]" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{category.name}</span>
              {category.category_type === 'revenue' ? (
                <Badge className="text-xs bg-green-100 text-green-700">Revenue</Badge>
              ) : (
                <Badge className="text-xs bg-red-100 text-red-700">Expense</Badge>
              )}
              {category.is_default && (
                <Badge variant="outline" className="text-xs">Default</Badge>
              )}
              {!category.is_active && (
                <Badge variant="secondary" className="text-xs">Inactive</Badge>
              )}
            </div>
            {category.description && (
              <p className="text-sm text-gray-600 mt-1">{category.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={category.is_active}
              onCheckedChange={(checked) => {
                updateMutation.mutate({
                  id: category.id,
                  data: { is_active: checked },
                });
              }}
              className="mr-2"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(category)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            {!category.is_default && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(category)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Delete category (values will be transferred to Other Revenue/Expense)"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        {hasSubcategories && isExpanded && (
          <div className="ml-8 border-l-2 border-gray-200 pl-2">
            {subcategories.map(sub => renderCategory(sub, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="border border-gray-100 shadow-md">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl font-bold tracking-tight leading-tight flex items-center gap-2 mb-3">
              <FolderTree className="h-6 w-6 text-[#161950]" />
              Budget Categories
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={categoryTypeFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryTypeFilter('all')}
                className={categoryTypeFilter === 'all' ? 'bg-[#161950] text-white' : ''}
              >
                All
              </Button>
              <Button
                variant={categoryTypeFilter === 'revenue' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryTypeFilter('revenue')}
                className={categoryTypeFilter === 'revenue' ? 'bg-green-600 text-white' : ''}
              >
                Revenue
              </Button>
              <Button
                variant={categoryTypeFilter === 'expense' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryTypeFilter('expense')}
                className={categoryTypeFilter === 'expense' ? 'bg-red-600 text-white' : ''}
              >
                Expense
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(!categories || categories.length === 0) && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleInitializeRevenue}
                  disabled={initializeMutation.isPending}
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  {initializeMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Initialize Revenue
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleInitializeExpense}
                  disabled={initializeMutation.isPending}
                  className="border-red-600 text-red-600 hover:bg-red-50"
                >
                  {initializeMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Initialize Expense
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleInitializeAll}
                  disabled={initializeMutation.isPending}
                >
                  {initializeMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Initialize All
                </Button>
              </>
            )}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#161950] hover:bg-[#161950]/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Category</DialogTitle>
                  <DialogDescription>
                    Create a new expense category for budget planning and procurement.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Category Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Travel, Office Supplies"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Optional description"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category_type">Category Type *</Label>
                    <Select
                      value={formData.category_type || 'expense'}
                      onValueChange={(value: 'revenue' | 'expense') =>
                        setFormData({ ...formData, category_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="revenue">Revenue / Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="parent">Parent Category</Label>
                    <Select
                      value={formData.parent_id?.toString() || 'none'}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          parent_id: value === 'none' ? null : parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent category (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None (Top Level)</SelectItem>
                        {topLevelCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="display_order">Display Order</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) =>
                        setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_active: checked })
                      }
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    disabled={createMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={createMutation.isPending}
                    className="bg-[#161950] hover:bg-[#161950]/90"
                  >
                    {createMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#161950]" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <FolderTree className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 mb-4">Error loading categories. Please try again.</p>
            <p className="text-sm text-gray-500 mb-4">{error instanceof Error ? error.message : 'Unknown error'}</p>
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={handleInitializeRevenue}
                disabled={initializeMutation.isPending}
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                {initializeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Initialize Revenue
              </Button>
              <Button
                variant="outline"
                onClick={handleInitializeExpense}
                disabled={initializeMutation.isPending}
                className="border-red-600 text-red-600 hover:bg-red-50"
              >
                {initializeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Initialize Expense
              </Button>
              <Button
                variant="outline"
                onClick={handleInitializeAll}
                disabled={initializeMutation.isPending}
              >
                {initializeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Initialize All
              </Button>
            </div>
          </div>
        ) : !categories || topLevelCategories.length === 0 ? (
          <div className="text-center py-12">
            <FolderTree className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No categories found. Create your first category or initialize defaults.</p>
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={handleInitializeRevenue}
                disabled={initializeMutation.isPending}
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                {initializeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Initialize Revenue
              </Button>
              <Button
                variant="outline"
                onClick={handleInitializeExpense}
                disabled={initializeMutation.isPending}
                className="border-red-600 text-red-600 hover:bg-red-50"
              >
                {initializeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Initialize Expense
              </Button>
              <Button
                variant="outline"
                onClick={handleInitializeAll}
                disabled={initializeMutation.isPending}
              >
                {initializeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Initialize All
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {topLevelCategories.map(category => renderCategory(category))}
          </div>
        )}

        {editingCategory && (
          <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
                <DialogDescription>
                  Update category details. Default categories cannot be deleted.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Category Name *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Travel, Office Supplies"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category_type">Category Type *</Label>
                  <Select
                    value={formData.category_type || 'expense'}
                    onValueChange={(value: 'revenue' | 'expense') =>
                      setFormData({ ...formData, category_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue">Revenue / Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-parent">Parent Category</Label>
                  <Select
                    value={formData.parent_id?.toString() || 'none'}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        parent_id: value === 'none' ? null : parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent category (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Top Level)</SelectItem>
                      {topLevelCategories
                        .filter((cat) => cat.id !== editingCategory.id)
                        .map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-display_order">Display Order</Label>
                  <Input
                    id="edit-display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) =>
                      setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="edit-is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                  <Label htmlFor="edit-is_active">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setEditingCategory(null)}
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleUpdate(editingCategory)}
                  disabled={updateMutation.isPending}
                  className="bg-[#161950] hover:bg-[#161950]/90"
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}

