import { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Building2, Users, FileText, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { useExpenseCategories } from '@/hooks/useExpenseCategories';
import { useProcurementVendors } from '@/hooks/useProcurementVendors';
import { useAuth } from '@/hooks/useAuth';

interface CreatePurchaseRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: {
    purchaseType: 'overhead' | 'project';
    description: string;
    estimatedCost: number;
    vendor: string;
    justification: string;
    department: string;
    projectCode?: string;
    urgency: 'low' | 'medium' | 'high';
    neededBy: string;
    category: string;
  }) => void;
}

export function CreatePurchaseRequestModal({
  open,
  onOpenChange,
  onSubmit,
}: CreatePurchaseRequestModalProps) {
  const { data: categories } = useExpenseCategories({ 
    include_inactive: false, 
    include_subcategories: false,
    category_type: 'expense'
  });

  const { useVendorsList } = useProcurementVendors();
  const { data: vendorsData, isLoading: isLoadingVendors } = useVendorsList(0, 1000);
  const vendors = vendorsData?.vendors || [];
  const approvedVendors = vendors.filter(v => v.status === 'approved');
  
  const { authState } = useAuth();
  const currentUserName = authState.user?.name || authState.user?.email || 'Current User';
  
  const [formData, setFormData] = useState({
    purchaseType: '' as 'overhead' | 'project' | '',
    description: '',
    estimatedCost: '',
    vendor: '',
    justification: '',
    department: '',
    projectCode: '',
    urgency: '' as 'low' | 'medium' | 'high' | '',
    neededBy: '',
    category: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.purchaseType) {
      newErrors.purchaseType = 'Purchase type is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.estimatedCost || parseFloat(formData.estimatedCost) <= 0) {
      newErrors.estimatedCost = 'Valid estimated cost is required';
    }
    if (!formData.vendor) {
      newErrors.vendor = 'Vendor selection is required';
    }
    if (!formData.justification.trim()) {
      newErrors.justification = 'Business justification is required';
    }
    if (!formData.department) {
      newErrors.department = 'Department is required';
    }
    if (formData.purchaseType === 'project' && !formData.projectCode) {
      newErrors.projectCode = 'Project code is required for project purchases';
    }
    if (!formData.urgency) {
      newErrors.urgency = 'Urgency level is required';
    }
    if (!formData.neededBy) {
      newErrors.neededBy = 'Required date is needed';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() && onSubmit) {
      onSubmit({
        purchaseType: formData.purchaseType as 'overhead' | 'project',
        description: formData.description,
        estimatedCost: parseFloat(formData.estimatedCost),
        vendor: formData.vendor,
        justification: formData.justification,
        department: formData.department,
        projectCode: formData.projectCode || undefined,
        urgency: formData.urgency as 'low' | 'medium' | 'high',
        neededBy: formData.neededBy,
        category: formData.category,
      });
      setFormData({
        purchaseType: '',
        description: '',
        estimatedCost: '',
        vendor: '',
        justification: '',
        department: '',
        projectCode: '',
        urgency: '',
        neededBy: '',
        category: '',
      });
      setErrors({});
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setFormData({
      purchaseType: '',
      description: '',
      estimatedCost: '',
      vendor: '',
      justification: '',
      department: '',
      projectCode: '',
      urgency: '',
      neededBy: '',
      category: '',
    });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto font-outfit">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 font-outfit">
            <FileText className="h-6 w-6 text-[#161950]" />
            <span className="text-xl font-semibold text-[#1A1A1A] font-outfit">Create Purchase Request</span>
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 font-outfit">
            Submit a formal request for company purchases requiring approval
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base font-semibold text-[#1A1A1A] font-outfit">Purchase Type</Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleInputChange('purchaseType', 'overhead')}
                className={`p-4 border-2 rounded-lg text-left transition-all hover:border-[#161950]/30 font-outfit ${
                  formData.purchaseType === 'overhead'
                    ? 'border-[#161950] bg-[#161950]/5'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-[#161950]" />
                  <div>
                    <h3 className="text-sm font-medium text-[#1A1A1A] font-outfit">Overhead Purchase</h3>
                    <p className="text-xs text-gray-600 font-outfit">
                      General business expenses, office supplies, utilities
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleInputChange('purchaseType', 'project')}
                className={`p-4 border-2 rounded-lg text-left transition-all hover:border-emerald-300 font-outfit ${
                  formData.purchaseType === 'project'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-emerald-600" />
                  <div>
                    <h3 className="text-sm font-medium text-[#1A1A1A] font-outfit">Project-Specific</h3>
                    <p className="text-xs text-gray-600 font-outfit">
                      Directly related to a specific client project
                    </p>
                  </div>
                </div>
              </button>
            </div>
            {errors.purchaseType && (
              <p className="text-sm text-rose-600 flex items-center space-x-1 font-outfit">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.purchaseType}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="description" className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
                  Purchase Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Detailed description of what you need to purchase..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`border-gray-200 font-outfit resize-none ${errors.description ? 'border-rose-500' : ''}`}
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-rose-600 mt-1 font-outfit">{errors.description}</p>
                )}
              </div>

              <div>
                <Label htmlFor="vendor" className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
                  Preferred Vendor *
                </Label>
                <Select
                  value={formData.vendor}
                  onValueChange={(value) => handleInputChange('vendor', value)}
                  disabled={isLoadingVendors}
                >
                  <SelectTrigger className={`border-gray-200 font-outfit h-11 ${errors.vendor ? 'border-rose-500' : ''}`}>
                    <SelectValue placeholder={isLoadingVendors ? "Loading vendors..." : "Select vendor"} />
                  </SelectTrigger>
                  <SelectContent>
                    {approvedVendors.length > 0 ? (
                      approvedVendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.vendor_name || vendor.organisation || ''}>
                          {vendor.organisation || vendor.vendor_name || 'Unknown Vendor'}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        {isLoadingVendors ? "Loading..." : "No approved vendors available"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.vendor && (
                  <p className="text-sm text-rose-600 mt-1 font-outfit">{errors.vendor}</p>
                )}
                {!isLoadingVendors && approvedVendors.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1 font-outfit">
                    No approved vendors available. Please add vendors first.
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="estimatedCost" className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
                  Estimated Cost ($) *
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="estimatedCost"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.estimatedCost}
                    onChange={(e) => handleInputChange('estimatedCost', e.target.value)}
                    className={`pl-10 border-gray-200 font-outfit h-11 ${errors.estimatedCost ? 'border-rose-500' : ''}`}
                  />
                </div>
                {errors.estimatedCost && (
                  <p className="text-sm text-rose-600 mt-1 font-outfit">{errors.estimatedCost}</p>
                )}
              </div>

              <div>
                <Label htmlFor="category" className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
                  Category *
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger className={`border-gray-200 font-outfit h-11 ${errors.category ? 'border-rose-500' : ''}`}>
                    <SelectValue placeholder="Select purchase category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories && categories.length > 0 ? (
                      categories.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.name}
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="software">Software & Licenses</SelectItem>
                        <SelectItem value="hardware">Hardware & Equipment</SelectItem>
                        <SelectItem value="office-supplies">Office Supplies</SelectItem>
                        <SelectItem value="furniture">Furniture & Fixtures</SelectItem>
                        <SelectItem value="professional-services">Professional Services</SelectItem>
                        <SelectItem value="marketing">Marketing & Advertising</SelectItem>
                        <SelectItem value="travel">Travel & Transportation</SelectItem>
                        <SelectItem value="training">Training & Education</SelectItem>
                        <SelectItem value="maintenance">Maintenance & Repairs</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-rose-600 mt-1 font-outfit">{errors.category}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="requestedBy" className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
                  Requested By
                </Label>
                <Input
                  id="requestedBy"
                  value={currentUserName}
                  disabled
                  className="border-gray-200 bg-gray-50 font-outfit h-11 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1 font-outfit">Automatically set to current user</p>
              </div>
              <div>
                <Label htmlFor="department" className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
                  Department *
                </Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleInputChange('department', value)}
                >
                  <SelectTrigger className={`border-gray-200 font-outfit h-11 ${errors.department ? 'border-rose-500' : ''}`}>
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IT">Information Technology</SelectItem>
                    <SelectItem value="HR">Human Resources</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Legal">Legal</SelectItem>
                    <SelectItem value="Facilities">Facilities</SelectItem>
                  </SelectContent>
                </Select>
                {errors.department && (
                  <p className="text-sm text-rose-600 mt-1 font-outfit">{errors.department}</p>
                )}
              </div>

              {formData.purchaseType === 'project' && (
                <div>
                  <Label htmlFor="projectCode" className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
                    Project Code *
                  </Label>
                  <Select
                    value={formData.projectCode}
                    onValueChange={(value) => handleInputChange('projectCode', value)}
                  >
                    <SelectTrigger className={`border-gray-200 font-outfit h-11 ${errors.projectCode ? 'border-rose-500' : ''}`}>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRJ-001">PRJ-001 - Metro Transit</SelectItem>
                      <SelectItem value="PRJ-002">PRJ-002 - Highway Infrastructure</SelectItem>
                      <SelectItem value="PRJ-003">PRJ-003 - Water Treatment</SelectItem>
                      <SelectItem value="PRJ-004">PRJ-004 - Smart City Initiative</SelectItem>
                      <SelectItem value="PRJ-005">PRJ-005 - Energy Grid Modernization</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.projectCode && (
                    <p className="text-sm text-rose-600 mt-1 font-outfit">{errors.projectCode}</p>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="urgency" className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
                  Urgency Level *
                </Label>
                <Select
                  value={formData.urgency}
                  onValueChange={(value) => handleInputChange('urgency', value)}
                >
                  <SelectTrigger className={`border-gray-200 font-outfit h-11 ${errors.urgency ? 'border-rose-500' : ''}`}>
                    <SelectValue placeholder="Select urgency level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-emerald-100 text-emerald-800 font-outfit">Low</Badge>
                        <span className="font-outfit">Standard processing (10-15 days)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-amber-100 text-amber-800 font-outfit">Medium</Badge>
                        <span className="font-outfit">Expedited (5-7 days)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-rose-100 text-rose-800 font-outfit">High</Badge>
                        <span className="font-outfit">Urgent (1-3 days)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.urgency && (
                  <p className="text-sm text-rose-600 mt-1 font-outfit">{errors.urgency}</p>
                )}
              </div>

              <div>
                <Label htmlFor="neededBy" className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
                  Required By Date *
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="neededBy"
                    type="date"
                    value={formData.neededBy}
                    onChange={(e) => handleInputChange('neededBy', e.target.value)}
                    className={`pl-10 border-gray-200 font-outfit h-11 pr-10 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:top-1/2 [&::-webkit-calendar-picker-indicator]:-translate-y-1/2 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 ${errors.neededBy ? 'border-rose-500' : ''}`}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                {errors.neededBy && (
                  <p className="text-sm text-rose-600 mt-1 font-outfit">{errors.neededBy}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="justification" className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
              Business Justification *
            </Label>
            <Textarea
              id="justification"
              placeholder="Explain why this purchase is necessary for business operations..."
              value={formData.justification}
              onChange={(e) => handleInputChange('justification', e.target.value)}
              className={`min-h-24 border-gray-200 font-outfit resize-none ${errors.justification ? 'border-rose-500' : ''}`}
              rows={4}
            />
            {errors.justification && (
              <p className="text-sm text-rose-600 mt-1 font-outfit">{errors.justification}</p>
            )}
          </div>

          {formData.purchaseType && (
            <div
              className={`p-4 rounded-lg border-2 font-outfit ${
                formData.purchaseType === 'overhead'
                  ? 'border-[#161950]/20 bg-[#161950]/5'
                  : 'border-emerald-200 bg-emerald-50'
              }`}
            >
              <h4 className="font-medium mb-2 text-[#1A1A1A] font-outfit">
                {formData.purchaseType === 'overhead' ? 'Overhead Purchase' : 'Project Purchase'} Summary
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm font-outfit">
                <div>
                  <span className="text-gray-600 font-outfit">Billing:</span>
                  <span className="ml-2 font-medium text-[#1A1A1A] font-outfit">
                    {formData.purchaseType === 'overhead'
                      ? 'General company overhead'
                      : `Charged to project ${formData.projectCode || 'TBD'}`}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 font-outfit">Approval Level:</span>
                  <span className="ml-2 font-medium text-[#1A1A1A] font-outfit">
                    {formData.purchaseType === 'overhead'
                      ? 'Department manager + Finance'
                      : 'Project manager + Department head'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </form>

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
            onClick={handleSubmit}
            className="bg-[#161950] hover:bg-[#1E2B5B] text-white font-outfit"
          >
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
