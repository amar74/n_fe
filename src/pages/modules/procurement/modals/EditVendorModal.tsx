import React, { useState, useEffect } from 'react';
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
import { Building2, Mail, Phone, Globe, MapPin, CreditCard, FileText } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import type { ProcurementVendor } from '@/hooks/procurement';

interface EditVendorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: ProcurementVendor | null;
  onSubmit?: (data: {
    vendorName: string;
    organisation: string;
    email: string;
    contactNumber: string;
    website?: string;
    address?: string;
    paymentTerms?: string;
    taxId?: string;
    notes?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function EditVendorModal({ 
  open, 
  onOpenChange, 
  vendor, 
  onSubmit, 
  isLoading = false 
}: EditVendorModalProps) {
  const [formData, setFormData] = useState({
    vendorName: '',
    organisation: '',
    email: '',
    contactNumber: '+1 ',
    website: '',
    address: '',
    paymentTerms: '',
    taxId: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (vendor && open) {
      setFormData({
        vendorName: vendor.vendor_name || '',
        organisation: vendor.organisation || '',
        email: vendor.email || '',
        contactNumber: vendor.contact_number || '+1 ',
        website: vendor.website || '',
        address: (vendor as any).address || '',
        paymentTerms: (vendor as any).payment_terms || '',
        taxId: (vendor as any).tax_id || '',
        notes: (vendor as any).notes || '',
      });
      setErrors({});
    }
  }, [vendor, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.vendorName.trim()) {
      newErrors.vendorName = 'Vendor name is required';
    }

    if (!formData.organisation.trim()) {
      newErrors.organisation = 'Organization is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.contactNumber.trim() || formData.contactNumber.trim() === '+1') {
      newErrors.contactNumber = 'Contact number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'contactNumber') {
      // Ensure +1 prefix is always present
      if (!value.startsWith('+1')) {
        value = '+1 ' + value.replace(/^\+1\s*/, '');
      }
      // Remove any duplicate +1 prefix
      value = '+1 ' + value.replace(/^\+1\s*/g, '');
    }
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() && onSubmit && !isLoading) {
      try {
        // Format contact number
        let contactNumberValue = formData.contactNumber.trim().replace(/^\+1\s*/, '');
        const digitsOnly = contactNumberValue.replace(/\D/g, '');
        if (digitsOnly.length >= 10) {
          const areaCode = digitsOnly.slice(0, 3);
          const firstPart = digitsOnly.slice(3, 6);
          const secondPart = digitsOnly.slice(6, 10);
          contactNumberValue = `+1 (${areaCode}) ${firstPart}-${secondPart}`;
        } else {
          contactNumberValue = `+1 ${contactNumberValue}`;
        }

        await onSubmit({
          vendorName: formData.vendorName,
          organisation: formData.organisation,
          email: formData.email,
          contactNumber: contactNumberValue,
          website: formData.website || undefined,
          address: formData.address || undefined,
          paymentTerms: formData.paymentTerms || undefined,
          taxId: formData.taxId || undefined,
          notes: formData.notes || undefined,
        });
      } catch (error) {
        console.error('Error updating vendor:', error);
      }
    }
  };

  if (!vendor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto font-outfit">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#1A1A1A] font-outfit flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-[#161950]" />
            <span>Edit Vendor</span>
          </DialogTitle>
          <DialogDescription className="font-outfit">
            Update supplier information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="vendorName" className="text-sm font-medium text-gray-700 font-outfit flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                <span>Vendor Name *</span>
              </Label>
              <Input
                id="vendorName"
                value={formData.vendorName}
                onChange={(e) => handleInputChange('vendorName', e.target.value)}
                placeholder="Enter vendor name"
                className={`font-outfit ${errors.vendorName ? 'border-red-500' : ''}`}
              />
              {errors.vendorName && (
                <p className="text-xs text-red-500 font-outfit">{errors.vendorName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="organisation" className="text-sm font-medium text-gray-700 font-outfit flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                <span>Organization *</span>
              </Label>
              <Input
                id="organisation"
                value={formData.organisation}
                onChange={(e) => handleInputChange('organisation', e.target.value)}
                placeholder="Enter organization name"
                className={`font-outfit ${errors.organisation ? 'border-red-500' : ''}`}
              />
              {errors.organisation && (
                <p className="text-xs text-red-500 font-outfit">{errors.organisation}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 font-outfit flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>Email *</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="vendor@example.com"
                className={`font-outfit ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && (
                <p className="text-xs text-red-500 font-outfit">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactNumber" className="text-sm font-medium text-gray-700 font-outfit flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>Contact Number *</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-outfit">+1</span>
                <Input
                  id="contactNumber"
                  value={formData.contactNumber.replace(/^\+1\s*/, '')}
                  onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                  placeholder="(555) 000-0000"
                  className={`pl-12 font-outfit ${errors.contactNumber ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.contactNumber && (
                <p className="text-xs text-red-500 font-outfit">{errors.contactNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="text-sm font-medium text-gray-700 font-outfit flex items-center space-x-2">
                <Globe className="h-4 w-4 text-gray-500" />
                <span>Website (Optional)</span>
              </Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://www.example.com"
                className="font-outfit"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentTerms" className="text-sm font-medium text-gray-700 font-outfit flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-gray-500" />
                <span>Payment Terms (Optional)</span>
              </Label>
              <Select
                value={formData.paymentTerms}
                onValueChange={(value) => handleInputChange('paymentTerms', value)}
              >
                <SelectTrigger className="font-outfit">
                  <SelectValue placeholder="Select payment terms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Net 15">Net 15</SelectItem>
                  <SelectItem value="Net 30">Net 30</SelectItem>
                  <SelectItem value="Net 45">Net 45</SelectItem>
                  <SelectItem value="Net 60">Net 60</SelectItem>
                  <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                  <SelectItem value="Cash on Delivery">Cash on Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxId" className="text-sm font-medium text-gray-700 font-outfit flex items-center space-x-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span>Tax ID / EIN (Optional)</span>
              </Label>
              <Input
                id="taxId"
                value={formData.taxId}
                onChange={(e) => handleInputChange('taxId', e.target.value)}
                placeholder="XX-XXXXXXX"
                className="font-outfit"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address" className="text-sm font-medium text-gray-700 font-outfit flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>Address (Optional)</span>
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter vendor address"
                className="font-outfit"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700 font-outfit flex items-center space-x-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span>Notes (Optional)</span>
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes about the vendor..."
                rows={4}
                className="font-outfit"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="font-outfit"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#161950] hover:bg-[#1E2B5B] text-white font-outfit"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Vendor'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

