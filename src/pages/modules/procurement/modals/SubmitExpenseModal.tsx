import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useExpenseCategories } from '@/hooks/finance';

interface SubmitExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: {
    date: string;
    amount: number;
    category: string;
    description: string;
    projectCode?: string;
    receiptFile?: File;
  }) => void;
}

export function SubmitExpenseModal({
  open,
  onOpenChange,
  onSubmit,
}: SubmitExpenseModalProps) {
  const [formData, setFormData] = useState({
    date: '',
    amount: '',
    category: '',
    description: '',
    projectCode: 'none', // Use 'none' instead of empty string for Select component
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categories, isLoading: isLoadingCategories } = useExpenseCategories({
    include_inactive: false,
    include_subcategories: false,
    category_type: 'expense',
  });

  // Fake projects list (will be replaced with real projects later)
  const fakeProjects = [
    { code: 'PRJ-001', name: 'Metro Transit' },
    { code: 'PRJ-002', name: 'Highway Infrastructure' },
    { code: 'PRJ-003', name: 'Water Treatment' },
    { code: 'PRJ-004', name: 'Smart City Initiative' },
    { code: 'PRJ-005', name: 'Energy Grid Modernization' },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a valid file (PDF, JPG, PNG)');
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.date.trim()) {
      newErrors.date = 'Expense date is required';
    }
    
    if (!formData.amount.trim() || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (onSubmit) {
      setIsUploading(true);
      try {
        await onSubmit({
          date: formData.date,
          amount: parseFloat(formData.amount),
          category: formData.category,
          description: formData.description,
          projectCode: formData.projectCode === 'none' ? undefined : formData.projectCode,
          receiptFile: selectedFile || undefined,
        });
        // Reset form only on success
        setFormData({
          date: '',
          amount: '',
          category: '',
          description: '',
          projectCode: 'none',
        });
        setSelectedFile(null);
        setErrors({});
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        onOpenChange(false);
      } catch (error) {
        console.error('Error submitting expense:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleClose = () => {
    setFormData({
      date: '',
      amount: '',
      category: '',
      description: '',
      projectCode: 'none',
    });
    setSelectedFile(null);
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto font-outfit">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#1A1A1A] font-outfit">
            Submit New Expense
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 font-outfit">
            Submit an expense report with receipt upload
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date" className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
                  Expense Date *
                </Label>
                <div className="relative">
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => {
                      setFormData({ ...formData, date: e.target.value });
                      if (errors.date) setErrors({ ...errors, date: '' });
                    }}
                    required
                    className={`border-gray-200 font-outfit h-11 pr-10 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:top-1/2 [&::-webkit-calendar-picker-indicator]:-translate-y-1/2 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 ${errors.date ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                  />
                  {errors.date && (
                    <p className="text-xs text-rose-600 font-outfit mt-1">{errors.date}</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="amount" className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
                  Amount *
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => {
                    setFormData({ ...formData, amount: e.target.value });
                    if (errors.amount) setErrors({ ...errors, amount: '' });
                  }}
                  placeholder="0.00"
                  required
                  className={`border-gray-200 font-outfit h-11 ${errors.amount ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                />
                {errors.amount && (
                  <p className="text-xs text-rose-600 font-outfit mt-1">{errors.amount}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="category" className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
                Category *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => {
                  setFormData({ ...formData, category: value });
                  if (errors.category) setErrors({ ...errors, category: '' });
                }}
              >
                <SelectTrigger className={`border-gray-200 font-outfit h-11 ${errors.category ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingCategories ? (
                    <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                  ) : categories && categories.length > 0 ? (
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
                <p className="text-xs text-rose-600 font-outfit mt-1">{errors.category}</p>
              )}
            </div>

            <div>
              <Label htmlFor="projectCode" className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
                Project Code (Optional)
              </Label>
              <Select
                value={formData.projectCode || 'none'}
                onValueChange={(value) => setFormData({ ...formData, projectCode: value })}
              >
                <SelectTrigger className="border-gray-200 font-outfit h-11">
                  <SelectValue placeholder="Select project (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {fakeProjects.map((project) => (
                    <SelectItem key={project.code} value={project.code}>
                      {project.code} - {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
                Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  if (errors.description) setErrors({ ...errors, description: '' });
                }}
                placeholder="Brief description of the expense"
                required
                rows={3}
                className={`border-gray-200 font-outfit resize-none ${errors.description ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
              />
              {errors.description && (
                <p className="text-xs text-rose-600 font-outfit mt-1">{errors.description}</p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
                Receipt Upload (Optional)
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="receipt-file-input"
                />
                <div className="flex items-center justify-center mb-4">
                  {isUploading ? (
                    <Loader2 className="h-8 w-8 text-[#161950] animate-spin" />
                  ) : (
                    <Upload className="h-8 w-8 text-gray-600" />
                  )}
                </div>
                <p className="text-sm font-medium text-[#1A1A1A] mb-2 font-outfit">
                  {selectedFile ? selectedFile.name : 'Upload Receipt (OCR Supported)'}
                </p>
                <p className="text-xs text-gray-500 mb-4 font-outfit leading-relaxed">
                  Upload receipt and system will automatically extract vendor, date, and amount
                </p>
                {selectedFile && (
                  <div className="mb-4 p-3 rounded-lg bg-emerald-50 text-emerald-700 flex items-center gap-2 justify-center">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-xs font-outfit">File selected: {selectedFile.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="h-6 px-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    >
                      Remove
                    </Button>
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-gray-200 font-outfit h-10 px-5"
                  disabled={isUploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {selectedFile ? 'Change File' : 'Choose File'}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-gray-200 font-outfit"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#161950] hover:bg-[#1E2B5B] text-white font-outfit"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Expense'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

