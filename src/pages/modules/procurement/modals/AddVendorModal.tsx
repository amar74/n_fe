/**
 * AddVendorModal Component
 * 
 * IMPORTANT: This component is for Procurement vendors (suppliers), NOT Super Admin vendor users.
 * 
 * - Super Admin Vendors: Users who log into the application (created in Super Admin pages)
 * - Procurement Vendors: Supplier records for procurement management (this component)
 * 
 * These are TWO COMPLETELY SEPARATE systems. Do NOT mix them.
 * 
 * See: megapolis-api/docs/VENDOR_SYSTEMS_DOCUMENTATION.md for full details.
 */

import { useState, useEffect, useRef } from 'react';
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
import { PlacesAutocomplete } from '@/components/ui/places-autocomplete';
import { Building2, Mail, Phone, MapPin, CreditCard, Globe, FileText, AlertCircle } from 'lucide-react';

interface AddVendorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: {
    vendorName: string;
    organisation: string;
    email: string;
    contactNumber: string;
    address?: string;
    paymentTerms?: string;
    taxId?: string;
    website?: string;
    notes?: string;
  }) => Promise<void> | void;
  isLoading?: boolean;
  existingEmails?: string[]; // For email uniqueness validation
}

export function AddVendorModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  existingEmails = [],
}: AddVendorModalProps) {
  const [formData, setFormData] = useState({
    vendorName: '',
    organisation: '',
    email: '',
    contactNumber: '', // Store only the number part (without +1)
    address: '',
    paymentTerms: '',
    taxId: '',
    website: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [emailChecking, setEmailChecking] = useState(false);
  const emailCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    // For contact number, remove +1 prefix if user tries to add it (we handle it visually)
    if (field === 'contactNumber') {
      // Remove any +1 prefix that user might type
      value = value.replace(/^\+1\s*/, '');
    }
    
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Check email uniqueness
  const checkEmailUniqueness = async (email: string) => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return;
    }

    setEmailChecking(true);
    const emailLower = email.toLowerCase().trim();
    
    // Check against existing emails
    if (existingEmails.some(existing => existing.toLowerCase() === emailLower)) {
      setErrors((prev) => ({ ...prev, email: 'This email is already registered to another vendor' }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        if (newErrors.email === 'This email is already registered to another vendor') {
          delete newErrors.email;
        }
        return newErrors;
      });
    }
    setEmailChecking(false);
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      setFormData({
        vendorName: '',
        organisation: '',
        email: '',
        contactNumber: '',
        address: '',
        paymentTerms: '',
        taxId: '',
        website: '',
        notes: '',
      });
      setErrors({});
      setEmailChecking(false);
      // Clear email check timeout
      if (emailCheckTimeoutRef.current) {
        clearTimeout(emailCheckTimeoutRef.current);
        emailCheckTimeoutRef.current = null;
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (emailCheckTimeoutRef.current) {
        clearTimeout(emailCheckTimeoutRef.current);
      }
    };
  }, [open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.vendorName.trim()) {
      newErrors.vendorName = 'Vendor name is required';
    }
    if (!formData.organisation.trim()) {
      newErrors.organisation = 'Organization name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    } else {
      // Validate phone number format (should be at least 10 digits)
      const digitsOnly = formData.contactNumber.replace(/\D/g, '');
      if (digitsOnly.length < 10) {
        newErrors.contactNumber = 'Contact number must have at least 10 digits';
      }
    }
    
    // Check email uniqueness
    if (formData.email.trim()) {
      const emailLower = formData.email.toLowerCase().trim();
      if (existingEmails.some(existing => existing.toLowerCase() === emailLower)) {
        newErrors.email = 'This email is already registered to another vendor';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() && onSubmit && !isLoading) {
      try {
        // Format contact number with +1 prefix for backend
        // Remove any existing +1 prefix and format properly
        let contactNumberValue = formData.contactNumber.trim().replace(/^\+1\s*/, '');
        // Format as +1 (XXX) XXX-XXXX or +1XXXXXXXXXX
        const digitsOnly = contactNumberValue.replace(/\D/g, '');
        if (digitsOnly.length >= 10) {
          // Format: +1 (XXX) XXX-XXXX
          const areaCode = digitsOnly.slice(0, 3);
          const firstPart = digitsOnly.slice(3, 6);
          const secondPart = digitsOnly.slice(6, 10);
          contactNumberValue = `+1 (${areaCode}) ${firstPart}-${secondPart}`;
        } else {
          // If less than 10 digits, just add +1 prefix
          contactNumberValue = `+1 ${contactNumberValue}`;
        }
        
        await onSubmit({
          vendorName: formData.vendorName,
          organisation: formData.organisation,
          email: formData.email,
          contactNumber: contactNumberValue,
          address: formData.address || undefined,
          paymentTerms: formData.paymentTerms || undefined,
          taxId: formData.taxId || undefined,
          website: formData.website || undefined,
          notes: formData.notes || undefined,
        });
        setFormData({
          vendorName: '',
          organisation: '',
          email: '',
          contactNumber: '',
          address: '',
          paymentTerms: '',
          taxId: '',
          website: '',
          notes: '',
        });
        setErrors({});
        onOpenChange(false);
      } catch (error) {
        // Error is handled by the hook's toast notification
        console.error('Error submitting vendor:', error);
      }
    }
  };

  const handleClose = () => {
      setFormData({
        vendorName: '',
        organisation: '',
        email: '',
        contactNumber: '',
        address: '',
        paymentTerms: '',
        taxId: '',
        website: '',
        notes: '',
      });
    setErrors({});
    setEmailChecking(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto font-outfit">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl font-semibold text-[#1A1A1A] font-outfit">
            <Building2 className="h-6 w-6 text-[#161950]" />
            <span>Add New Vendor</span>
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 font-outfit">
            Register a new vendor in the system with complete information
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="vendorName" className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
                  Vendor Name *
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="vendorName"
                    value={formData.vendorName}
                    onChange={(e) => handleInputChange('vendorName', e.target.value)}
                    placeholder="Enter vendor name"
                    className={`pl-10 border-gray-200 font-outfit h-11 ${errors.vendorName ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.vendorName && (
                  <p className="text-xs text-red-600 mt-1 flex items-center space-x-1 font-outfit">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.vendorName}</span>
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="organisation" className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
                  Organization *
                </Label>
                <Input
                  id="organisation"
                  value={formData.organisation}
                  onChange={(e) => handleInputChange('organisation', e.target.value)}
                  placeholder="Enter organization name"
                  className={`border-gray-200 font-outfit h-11 ${errors.organisation ? 'border-red-500' : ''}`}
                />
                {errors.organisation && (
                  <p className="text-xs text-red-600 mt-1 flex items-center space-x-1 font-outfit">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.organisation}</span>
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
                  Email *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      handleInputChange('email', e.target.value);
                      // Clear previous timeout
                      if (emailCheckTimeoutRef.current) {
                        clearTimeout(emailCheckTimeoutRef.current);
                      }
                      // Check uniqueness after a short delay
                      emailCheckTimeoutRef.current = setTimeout(() => {
                        checkEmailUniqueness(e.target.value);
                      }, 500);
                    }}
                    onBlur={() => {
                      if (emailCheckTimeoutRef.current) {
                        clearTimeout(emailCheckTimeoutRef.current);
                      }
                      checkEmailUniqueness(formData.email);
                    }}
                    placeholder="vendor@example.com"
                    className={`pl-10 border-gray-200 font-outfit h-11 ${errors.email ? 'border-red-500' : ''}`}
                  />
                  {emailChecking && (
                    <p className="text-xs text-gray-500 mt-1 font-outfit">Checking email availability...</p>
                  )}
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1 flex items-center space-x-1 font-outfit">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="contactNumber" className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
                  Contact Number *
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-3 flex items-center pointer-events-none z-10">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500 font-outfit font-medium">+1</span>
                  </div>
                  <Input
                    id="contactNumber"
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                    placeholder="(555) 000-0000"
                    className={`pl-16 border-gray-200 font-outfit h-11 ${errors.contactNumber ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.contactNumber && (
                  <p className="text-xs text-red-600 mt-1 flex items-center space-x-1 font-outfit">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.contactNumber}</span>
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="address" className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
                  Address (Optional)
                </Label>
                <PlacesAutocomplete
                  value={formData.address}
                  onChange={(value, placeDetails) => {
                    // When a place is selected from autocomplete, use formatted_address
                    // When user types manually, use the typed value
                    if (placeDetails?.formatted_address) {
                      // Place was selected from autocomplete
                      setFormData((prev) => ({ ...prev, address: placeDetails.formatted_address }));
                    } else {
                      // User is typing manually
                      handleInputChange('address', value);
                    }
                  }}
                  placeholder="Enter USA address (Google Maps)"
                  className="border-gray-200 font-outfit h-11"
                />
                <p className="text-xs text-gray-500 mt-1 font-outfit">Start typing to see USA address suggestions</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="paymentTerms" className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
                  Payment Terms (Optional)
                </Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Select
                    value={formData.paymentTerms}
                    onValueChange={(value) => handleInputChange('paymentTerms', value)}
                  >
                    <SelectTrigger className="pl-10 border-gray-200 font-outfit h-11">
                      <SelectValue placeholder="Select payment terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="net-15">Net 15</SelectItem>
                      <SelectItem value="net-30">Net 30</SelectItem>
                      <SelectItem value="net-45">Net 45</SelectItem>
                      <SelectItem value="net-60">Net 60</SelectItem>
                      <SelectItem value="due-on-receipt">Due on Receipt</SelectItem>
                      <SelectItem value="custom">Custom Terms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="taxId" className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
                  Tax ID / EIN (Optional)
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="taxId"
                    value={formData.taxId}
                    onChange={(e) => handleInputChange('taxId', e.target.value)}
                    placeholder="XX-XXXXXXX"
                    className="pl-10 border-gray-200 font-outfit h-11"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="website" className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
                  Website (Optional)
                </Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://www.example.com"
                    className="pl-10 border-gray-200 font-outfit h-11"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes" className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
                  Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes about the vendor..."
                  className="border-gray-200 font-outfit resize-none min-h-24"
                  rows={4}
                />
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
              disabled={!onSubmit || isLoading}
            >
              {isLoading ? 'Creating...' : 'Add Vendor'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

