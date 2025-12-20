import { useState, useEffect } from 'react';
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
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface VendorQualificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorId: string;
  vendorName: string;
  existingQualification?: {
    financial_stability?: string | null;
    credentials_verified: boolean;
    certifications: string[];
    qualification_score?: number | null;
    risk_level?: string | null;
    notes?: string | null;
  } | null;
  onSubmit?: (data: {
    vendor_id: string;
    financial_stability?: string;
    credentials_verified: boolean;
    certifications: string[];
    qualification_score?: number;
    risk_level?: string;
    notes?: string;
  }) => Promise<void> | void;
  isLoading?: boolean;
}

export function VendorQualificationModal({
  open,
  onOpenChange,
  vendorId,
  vendorName,
  existingQualification,
  onSubmit,
  isLoading = false,
}: VendorQualificationModalProps) {
  const [formData, setFormData] = useState({
    financial_stability: '',
    credentials_verified: false,
    certifications: [] as string[],
    qualification_score: '',
    risk_level: '',
    notes: '',
  });
  const [certificationInput, setCertificationInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (existingQualification) {
        setFormData({
          financial_stability: existingQualification.financial_stability || '',
          credentials_verified: existingQualification.credentials_verified || false,
          certifications: existingQualification.certifications || [],
          qualification_score: existingQualification.qualification_score?.toString() || '',
          risk_level: existingQualification.risk_level || '',
          notes: existingQualification.notes || '',
        });
      } else {
        setFormData({
          financial_stability: '',
          credentials_verified: false,
          certifications: [],
          qualification_score: '',
          risk_level: '',
          notes: '',
        });
      }
      setCertificationInput('');
      setErrors({});
    }
  }, [open, existingQualification]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const addCertification = () => {
    if (certificationInput.trim() && !formData.certifications.includes(certificationInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        certifications: [...prev.certifications, certificationInput.trim()],
      }));
      setCertificationInput('');
    }
  };

  const removeCertification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.qualification_score) {
      const score = parseFloat(formData.qualification_score);
      if (isNaN(score) || score < 0 || score > 100) {
        newErrors.qualification_score = 'Score must be between 0 and 100';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (onSubmit) {
      await onSubmit({
        vendor_id: vendorId,
        financial_stability: formData.financial_stability || undefined,
        credentials_verified: formData.credentials_verified,
        certifications: formData.certifications,
        qualification_score: formData.qualification_score
          ? parseFloat(formData.qualification_score)
          : undefined,
        risk_level: formData.risk_level || undefined,
        notes: formData.notes || undefined,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto font-outfit">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#1A1A1A] font-outfit flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-[#161950]" />
            <span>Vendor Qualification - {vendorName}</span>
          </DialogTitle>
          <DialogDescription className="font-outfit">
            Define qualification criteria for this vendor
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="financial_stability" className="text-sm font-medium text-gray-700 font-outfit">
                Financial Stability
              </Label>
              <Select
                value={formData.financial_stability}
                onValueChange={(value) => handleInputChange('financial_stability', value)}
              >
                <SelectTrigger className="font-outfit">
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="risk_level" className="text-sm font-medium text-gray-700 font-outfit">
                Risk Level
              </Label>
              <Select
                value={formData.risk_level}
                onValueChange={(value) => handleInputChange('risk_level', value)}
              >
                <SelectTrigger className="font-outfit">
                  <SelectValue placeholder="Select risk level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualification_score" className="text-sm font-medium text-gray-700 font-outfit">
                Qualification Score (0-100)
              </Label>
              <Input
                id="qualification_score"
                type="number"
                min="0"
                max="100"
                value={formData.qualification_score}
                onChange={(e) => handleInputChange('qualification_score', e.target.value)}
                placeholder="Enter score (0-100)"
                className={`font-outfit ${errors.qualification_score ? 'border-red-500' : ''}`}
              />
              {errors.qualification_score && (
                <p className="text-xs text-red-500 font-outfit">{errors.qualification_score}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 font-outfit flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.credentials_verified}
                  onChange={(e) => handleInputChange('credentials_verified', e.target.checked)}
                  className="rounded border-gray-300 text-[#161950] focus:ring-[#161950]"
                />
                <span>Credentials Verified</span>
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 font-outfit">Certifications</Label>
            <div className="flex gap-2">
              <Input
                value={certificationInput}
                onChange={(e) => setCertificationInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCertification();
                  }
                }}
                placeholder="Enter certification (e.g., ISO 9001)"
                className="font-outfit"
              />
              <Button
                type="button"
                onClick={addCertification}
                variant="outline"
                className="font-outfit"
              >
                Add
              </Button>
            </div>
            {formData.certifications.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.certifications.map((cert, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="font-outfit flex items-center gap-1"
                  >
                    {cert}
                    <button
                      type="button"
                      onClick={() => removeCertification(index)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700 font-outfit">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional qualification notes..."
              rows={4}
              className="font-outfit"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="font-outfit"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#161950] hover:bg-[#161950]/90 text-white font-outfit"
            >
              {isLoading ? 'Saving...' : 'Save Qualification'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

