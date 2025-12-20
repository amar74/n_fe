import { useState, useRef } from 'react';
import { Plus, Upload, CheckCircle2, Eye, Download, CheckCircle, XCircle, Brain, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmployeeExpense } from '../types';
import { getStatusBadge } from '../utils';
import { SubmitExpenseModal } from '../modals';
import { useProcurement } from '@/hooks/procurement';
import { procurementApi } from '@/services/api/procurementApi';
import { useExpenseCategories } from '@/hooks/finance';
import { useToast } from '@/hooks/shared';

interface ExpensesTabProps {
  expenses: EmployeeExpense[];
  isLoading?: boolean;
}

export function ExpensesTab({ expenses, isLoading = false }: ExpensesTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { createExpense, isCreatingExpense, extractReceipt } = useProcurement();
  const { toast } = useToast();
  
  // Quick Expense Submission form state
  const [quickFormData, setQuickFormData] = useState<{
    date: string;
    amount: string;
    category: string;
    description: string;
    projectCode: string;
  }>({
    date: new Date().toISOString().split('T')[0], // Default to today
    amount: '',
    category: '',
    description: '',
    projectCode: 'none',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmittingQuick, setIsSubmittingQuick] = useState(false);
  const [quickFormErrors, setQuickFormErrors] = useState<Record<string, string>>({});
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
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a valid file (PDF, JPG, PNG)',
          variant: 'destructive',
        });
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'File size must be less than 10MB',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
      
      // Extract receipt data using AI OCR
      try {
        const extractedData = await extractReceipt(file);
        
        if (extractedData && !extractedData.error) {
          // Auto-fill form with extracted data
          if (extractedData.amount) {
            setQuickFormData(prev => ({ ...prev, amount: String(extractedData.amount) }));
          }
          if (extractedData.date) {
            setQuickFormData(prev => ({ ...prev, date: extractedData.date || prev.date }));
          }
          if (extractedData.vendor) {
            setQuickFormData(prev => ({ ...prev, description: extractedData.vendor || prev.description }));
          }
          if (extractedData.category) {
            // Try to match category with existing categories
            const matchedCategory = categories?.find(cat => 
              cat.name.toLowerCase().includes(extractedData.category?.toLowerCase() || '') ||
              extractedData.category?.toLowerCase().includes(cat.name.toLowerCase() || '')
            );
            if (matchedCategory) {
              setQuickFormData(prev => ({ ...prev, category: String(matchedCategory.id) }));
            }
          }
          
          toast({
            title: 'Receipt Data Extracted',
            description: `Extracted data with ${(extractedData.confidence * 100).toFixed(0)}% confidence. Please review and adjust as needed.`,
            variant: 'default',
          });
        } else if (extractedData?.error) {
          toast({
            title: 'Extraction Failed',
            description: extractedData.error || 'Could not extract data from receipt. Please enter manually.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error extracting receipt data:', error);
        toast({
          title: 'Extraction Error',
          description: 'Failed to extract receipt data. Please enter manually.',
          variant: 'destructive',
        });
      }
    }
  };
  
  const validateQuickForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!quickFormData.date.trim()) {
      newErrors.date = 'Expense date is required';
    }
    
    if (!quickFormData.amount.trim() || parseFloat(quickFormData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }
    
    if (!quickFormData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    if (!quickFormData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    setQuickFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateQuickForm()) {
      return;
    }
    
    setIsSubmittingQuick(true);
    try {
      // Upload receipt file if selected
      let receiptUrl: string | undefined;
      if (selectedFile) {
        try {
          const { receipt_url } = await procurementApi.uploadExpenseReceipt(selectedFile);
          receiptUrl = receipt_url;
        } catch (error: any) {
          console.error('Error uploading receipt:', error);
          toast({
            title: 'Receipt Upload Failed',
            description: error.response?.data?.detail || 'Failed to upload receipt. Expense will be created without receipt.',
            variant: 'destructive',
          });
        }
      }
      
      await createExpense({
        expense_date: quickFormData.date,
        amount: parseFloat(quickFormData.amount),
        category: quickFormData.category,
        description: quickFormData.description,
        project_code: quickFormData.projectCode === 'none' ? undefined : quickFormData.projectCode,
        receipt_url: receiptUrl,
      });
      
      toast({
        title: 'Expense Submitted',
        description: 'Your expense report has been submitted successfully',
      });
      
      // Reset form
      setQuickFormData({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        category: '',
        description: '',
        projectCode: 'none',
      });
      setSelectedFile(null);
      setQuickFormErrors({});
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error creating expense:', error);
      toast({
        title: 'Submission Failed',
        description: error.response?.data?.detail || 'Failed to submit expense. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingQuick(false);
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end pb-2">
        <div>
          <h2 className="text-2xl font-semibold text-[#1A1A1A] font-outfit mb-1">Employee Expenses</h2>
          <p className="text-sm text-gray-600 font-outfit">Track, submit, and approve employee expense reports</p>
        </div>
        <Button
          className="bg-[#161950] hover:bg-[#1E2B5B] text-white font-outfit h-11 px-6"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Submit New Expense
        </Button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)] font-outfit">
        <div className="mb-6 pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-2 mb-1">
            <CheckCircle2 className="h-5 w-5 text-[#161950]" />
            <h3 className="text-xl font-semibold text-[#1A1A1A] font-outfit">Quick Expense Submission</h3>
          </div>
          <p className="text-sm text-gray-600 font-outfit">Submit expenses quickly with AI-powered receipt scanning</p>
        </div>
        <form onSubmit={handleQuickSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 block font-outfit">
                    Expense Date *
                  </Label>
                  <div className="relative">
                    <Input 
                      type="date" 
                      value={quickFormData.date}
                      onChange={(e) => {
                        setQuickFormData({ ...quickFormData, date: e.target.value });
                        if (quickFormErrors.date) setQuickFormErrors({ ...quickFormErrors, date: '' });
                      }}
                      required
                      className={`border-gray-200 font-outfit h-12 w-full pr-10 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:top-1/2 [&::-webkit-calendar-picker-indicator]:-translate-y-1/2 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 ${quickFormErrors.date ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                    />
                  </div>
                  {quickFormErrors.date && (
                    <p className="text-xs text-rose-600 font-outfit mt-1">{quickFormErrors.date}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 block font-outfit">
                    Amount *
                  </Label>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    step="0.01"
                    value={quickFormData.amount}
                    onChange={(e) => {
                      setQuickFormData({ ...quickFormData, amount: e.target.value });
                      if (quickFormErrors.amount) setQuickFormErrors({ ...quickFormErrors, amount: '' });
                    }}
                    required
                    className={`border-gray-200 font-outfit h-12 ${quickFormErrors.amount ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                  />
                  {quickFormErrors.amount && (
                    <p className="text-xs text-rose-600 font-outfit mt-1">{quickFormErrors.amount}</p>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 block font-outfit">
                  Category *
                </Label>
                <Select
                  value={quickFormData.category}
                  onValueChange={(value) => {
                    setQuickFormData({ ...quickFormData, category: value });
                    if (quickFormErrors.category) setQuickFormErrors({ ...quickFormErrors, category: '' });
                  }}
                >
                  <SelectTrigger className={`border-gray-200 font-outfit h-12 ${quickFormErrors.category ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}>
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
                {quickFormErrors.category && (
                  <p className="text-xs text-rose-600 font-outfit mt-1">{quickFormErrors.category}</p>
                )}
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 block font-outfit">
                  Project Code (Optional)
                </Label>
                <Select
                  value={quickFormData.projectCode || 'none'}
                  onValueChange={(value) => setQuickFormData({ ...quickFormData, projectCode: value })}
                >
                  <SelectTrigger className="border-gray-200 font-outfit h-12">
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
                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 block font-outfit">
                  Description *
                </Label>
                <Textarea
                  placeholder="Brief description of the expense"
                  value={quickFormData.description}
                  onChange={(e) => {
                    setQuickFormData({ ...quickFormData, description: e.target.value });
                    if (quickFormErrors.description) setQuickFormErrors({ ...quickFormErrors, description: '' });
                  }}
                  required
                  rows={3}
                  className={`border-gray-200 font-outfit resize-none ${quickFormErrors.description ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                />
                {quickFormErrors.description && (
                  <p className="text-xs text-rose-600 font-outfit mt-1">{quickFormErrors.description}</p>
                )}
              </div>
            </div>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 block font-outfit">
                Receipt Upload (Optional)
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#161950]/50 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="quick-receipt-file-input"
                />
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Upload className="h-12 w-12 text-[#161950]" />
                  <Brain className="h-8 w-8 text-[#161950]" />
                </div>
                <p className="text-sm font-medium text-[#161950] mb-2 font-outfit">
                  AI-Powered Receipt Scanning (OCR)
                </p>
                <p className="text-xs text-[#161950]/80 mb-4 font-outfit leading-relaxed">
                  Upload receipt and AI will automatically extract vendor, date, and total amount to pre-populate the form
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
                  size="sm"
                  variant="outline"
                  className="border-[#161950]/30 hover:border-[#161950]/50 font-outfit"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {selectedFile ? 'Change File' : 'Choose File'}
                </Button>
              </div>
            </div>
            <div className="bg-[#161950]/10 p-4 rounded-lg border border-[#161950]/20">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="h-5 w-5 text-[#161950]" />
                <span className="text-sm font-medium text-[#161950] font-outfit">
                  Real-Time Policy Compliance
                </span>
              </div>
              <p className="text-xs text-gray-700 font-outfit">
                AI cross-references entries against company policy in real-time, flagging potential violations before submission (e.g., exceeding daily meal allowance).
              </p>
            </div>
            <Button 
              type="submit"
              className="w-full bg-[#161950] hover:bg-[#1E2B5B] text-white font-outfit"
              disabled={isSubmittingQuick || isCreatingExpense}
            >
              {isSubmittingQuick || isCreatingExpense ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Expense Report'
              )}
            </Button>
          </div>
        </div>
        </form>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)] font-outfit">
        <div className="mb-6 pb-4 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-[#1A1A1A] font-outfit mb-1">My Expense Reports</h3>
          <p className="text-sm text-gray-600 font-outfit">Track the status of your submitted expense reports</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-outfit">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Expense ID</th>
                <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Date</th>
                <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Amount</th>
                <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Category</th>
                <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Project</th>
                <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Status</th>
                <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => {
                const statusBadge = getStatusBadge(expense.status);
                return (
                  <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-medium text-[#1A1A1A] font-outfit mb-1">{expense.id}</div>
                      <div className="text-xs text-gray-500 font-outfit">{expense.description}</div>
                    </td>
                    <td className="py-4 px-4 text-gray-700 font-outfit">{expense.date}</td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-[#1A1A1A] font-outfit">${expense.amount.toFixed(2)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="outline" className="border-gray-200 font-outfit">{expense.category}</Badge>
                    </td>
                    <td className="py-4 px-4 text-gray-700 font-outfit">{expense.projectCode || '—'}</td>
                    <td className="py-4 px-4">
                      <Badge className={`${statusBadge.className} font-outfit`}>{statusBadge.label}</Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="border-gray-200 hover:bg-gray-50 font-outfit h-8 w-8 p-0">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {expense.receiptUrl && (
                          <Button size="sm" variant="outline" className="border-gray-200 hover:bg-gray-50 font-outfit h-8 w-8 p-0">
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)] font-outfit">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-[#1A1A1A] font-outfit">Pending Approvals (Manager View)</h3>
          <p className="text-sm text-gray-600 font-outfit">Expense reports awaiting your approval</p>
        </div>
        <div className="space-y-4">
          {expenses
            .filter((exp) => exp.status === 'pending')
            .map((expense) => (
              <div
                key={expense.id}
                className="rounded-xl border border-gray-200 bg-gray-50/70 p-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="font-medium text-[#1A1A1A] font-outfit">{expense.employeeName}</p>
                    <p className="text-sm text-gray-600 font-outfit">{expense.description}</p>
                    <p className="text-xs text-gray-500 mt-1 font-outfit">Submitted: {expense.submittedDate}</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-[#1A1A1A] font-outfit">${expense.amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-600 font-outfit">{expense.category}</p>
                    {expense.projectCode && (
                      <Badge variant="outline" className="mt-1 text-xs border-gray-200 font-outfit">
                        {expense.projectCode}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {expense.receiptUrl && (
                      <Button size="sm" variant="outline" className="flex-1 border-gray-200 font-outfit">
                        <Eye className="h-4 w-4 mr-2" />
                        View Receipt
                      </Button>
                    )}
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 flex-1 font-outfit">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="border-rose-300 text-rose-600 flex-1 font-outfit">
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
      <SubmitExpenseModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={async (data) => {
          try {
            // TODO: Upload receipt file to get URL
            // For now, if file is selected, we'll need to upload it first
            // This will be implemented when file upload endpoint is available
            let receiptUrl: string | undefined;
            if (data.receiptFile) {
              // TODO: Upload file and get URL
              // const formData = new FormData();
              // formData.append('file', data.receiptFile);
              // const uploadResponse = await uploadFile(formData);
              // receiptUrl = uploadResponse.url;
              console.log('Receipt file selected:', data.receiptFile.name);
              // For now, we'll create the expense without receipt URL
              // The backend will handle receipt upload separately
            }
            
            await createExpense({
              expense_date: data.date,
              amount: data.amount,
              category: data.category,
              description: data.description,
              project_code: data.projectCode,
              receipt_url: receiptUrl,
            });
            setIsModalOpen(false);
          } catch (error) {
            console.error('Error creating expense:', error);
          }
        }}
      />
    </div>
  );
}

