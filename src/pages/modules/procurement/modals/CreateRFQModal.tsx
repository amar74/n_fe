import { useState } from 'react';
import { FileText, Calendar, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useExpenseCategories } from '@/hooks/finance';
import { PurchaseRequisition } from '../types';

interface CreateRFQModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requisitions?: PurchaseRequisition[];
  onSubmit: (data: {
    title: string;
    description: string;
    category: string;
    estimatedValue: number;
    dueDate: string;
    requisitionId?: string;
  }) => void;
}

export function CreateRFQModal({ open, onOpenChange, requisitions = [], onSubmit }: CreateRFQModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [requisitionId, setRequisitionId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: categoriesData, isLoading: isLoadingCategories } = useExpenseCategories({
    include_inactive: false,
    include_subcategories: false,
    category_type: 'expense',
  });

  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!category) newErrors.category = 'Category is required';
    if (!estimatedValue || parseFloat(estimatedValue) <= 0) {
      newErrors.estimatedValue = 'Valid estimated value is required';
    }
    if (!dueDate) newErrors.dueDate = 'Due date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
      estimatedValue: parseFloat(estimatedValue),
      dueDate,
      requisitionId: requisitionId.trim() || undefined,
    });

    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setEstimatedValue('');
    setDueDate('');
    setRequisitionId('');
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto font-outfit p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200">
          <DialogTitle className="text-2xl font-semibold text-[#1A1A1A] font-outfit">Create Request for Quotation (RFQ)</DialogTitle>
          <p className="text-sm text-gray-600 font-outfit mt-1">Fill in the details below to create a new RFQ for vendor quotations</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
                RFQ Title <span className="text-rose-600">*</span>
              </Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`pl-10 border-gray-200 font-outfit h-11 focus:border-[#161950] focus:ring-2 focus:ring-[#161950]/20 ${errors.title ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                  placeholder="Enter RFQ title"
                />
              </div>
              {errors.title && (
                <p className="text-xs text-rose-600 font-outfit mt-1 flex items-center gap-1">
                  <span>{errors.title}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
                Category <span className="text-rose-600">*</span>
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className={`border-gray-200 font-outfit h-11 focus:border-[#161950] focus:ring-2 focus:ring-[#161950]/20 ${errors.category ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingCategories ? (
                    <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                  ) : categories.length > 0 ? (
                    categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-categories" disabled>No categories available</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-xs text-rose-600 font-outfit mt-1 flex items-center gap-1">
                  <span>{errors.category}</span>
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
              Description <span className="text-rose-600">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`border-gray-200 font-outfit min-h-[120px] resize-none focus:border-[#161950] focus:ring-2 focus:ring-[#161950]/20 ${errors.description ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
              placeholder="Provide detailed description of the RFQ requirements, specifications, and any special conditions..."
            />
            {errors.description && (
              <p className="text-xs text-rose-600 font-outfit mt-1 flex items-center gap-1">
                <span>{errors.description}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="estimatedValue" className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
                Estimated Value <span className="text-rose-600">*</span>
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="estimatedValue"
                  type="number"
                  step="0.01"
                  min="0"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(e.target.value)}
                  className={`pl-10 border-gray-200 font-outfit h-11 focus:border-[#161950] focus:ring-2 focus:ring-[#161950]/20 ${errors.estimatedValue ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                  placeholder="0.00"
                />
              </div>
              {errors.estimatedValue && (
                <p className="text-xs text-rose-600 font-outfit mt-1 flex items-center gap-1">
                  <span>{errors.estimatedValue}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate" className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
                Response Due Date <span className="text-rose-600">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={`pl-10 border-gray-200 font-outfit h-11 focus:border-[#161950] focus:ring-2 focus:ring-[#161950]/20 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 ${errors.dueDate ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                />
              </div>
              {errors.dueDate && (
                <p className="text-xs text-rose-600 font-outfit mt-1 flex items-center gap-1">
                  <span>{errors.dueDate}</span>
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requisitionId" className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
              Related Requisition <span className="text-gray-400 text-xs font-normal">(Optional)</span>
            </Label>
            <Select value={requisitionId || undefined} onValueChange={(value) => setRequisitionId(value === 'none' ? '' : value)}>
              <SelectTrigger className="border-gray-200 font-outfit h-11 focus:border-[#161950] focus:ring-2 focus:ring-[#161950]/20">
                <SelectValue placeholder="Select a requisition (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {requisitions.length > 0 ? (
                  requisitions.map((req) => (
                    <SelectItem key={req.uuid} value={req.uuid}>
                      {req.id} - {req.description.substring(0, 50)}{req.description.length > 50 ? '...' : ''}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-requisitions" disabled>No requisitions available</SelectItem>
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 font-outfit mt-1">Link this RFQ to an existing purchase requisition</p>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="font-outfit h-11 px-6 border-gray-200 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#161950] hover:bg-[#1E2B5B] text-white font-outfit h-11 px-6 shadow-sm"
            >
              Create RFQ
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

