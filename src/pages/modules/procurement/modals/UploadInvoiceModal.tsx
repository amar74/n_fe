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
import { Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { procurementApi } from '@/services/api/procurementApi';
import { useProcurementVendors } from '@/hooks/procurement';
import { useToast } from '@/hooks/shared';

interface UploadInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: {
    invoiceNumber?: string;
    vendorId?: string;
    vendorName?: string;
    poNumber?: string;
    amount?: number;
    invoiceDate?: string;
    dueDate?: string;
    file?: File;
  }) => void;
}

export function UploadInvoiceModal({
  open,
  onOpenChange,
  onSubmit,
}: UploadInvoiceModalProps) {
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    vendorId: '',
    vendorName: '',
    poNumber: '',
    amount: '',
    invoiceDate: '',
    dueDate: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState<{
    success: boolean;
    message: string;
    confidence?: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { useVendorsList } = useProcurementVendors();
  const { data: vendorsData, isLoading: isLoadingVendors } = useVendorsList(0, 1000);
  const vendors = vendorsData?.vendors || [];
  const approvedVendors = vendors.filter(v => v.status === 'approved');
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const fileExtension = file.name.toLowerCase().split('.').pop();
    if (!['pdf', 'doc', 'docx'].includes(fileExtension || '')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a PDF or DOCX file',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
    setExtractionStatus(null);

    // Auto-extract invoice data
    setIsExtracting(true);
    try {
      const extracted = await procurementApi.extractInvoiceData(file);
      
      setFormData(prev => ({
        ...prev,
        invoiceNumber: extracted.invoice_number || prev.invoiceNumber,
        poNumber: extracted.po_number || prev.poNumber,
        vendorName: extracted.vendor_name || prev.vendorName,
        amount: extracted.amount ? extracted.amount.toString() : prev.amount,
        invoiceDate: extracted.invoice_date || prev.invoiceDate,
        dueDate: extracted.due_date || prev.dueDate,
      }));

      // Try to match vendor name with existing vendors
      if (extracted.vendor_name) {
        const matchedVendor = approvedVendors.find(
          v => v.organisation.toLowerCase().includes(extracted.vendor_name!.toLowerCase()) ||
               v.vendor_name.toLowerCase().includes(extracted.vendor_name!.toLowerCase())
        );
        if (matchedVendor) {
          setFormData(prev => ({
            ...prev,
            vendorId: matchedVendor.id,
            vendorName: matchedVendor.organisation,
          }));
        }
      }

      // Auto-match PO by PO number if extracted
      if (extracted.po_number) {
        // Note: PO matching would require fetching POs and matching by custom_id
        // For now, we set the PO number in the form
        setFormData(prev => ({
          ...prev,
          poNumber: extracted.po_number || prev.poNumber,
        }));
      }

      // Check if extraction was successful (even with low confidence)
      const extractedCount = [
        extracted.invoice_number,
        extracted.po_number,
        extracted.vendor_name,
        extracted.amount,
        extracted.invoice_date,
        extracted.due_date,
      ].filter(v => v !== null && v !== undefined).length;

      const errorMessage = (extracted as any).error;
      const confidence = extracted.confidence || 0;

      if (extractedCount > 0 || confidence > 0) {
        setExtractionStatus({
          success: true,
          message: errorMessage 
            ? `${errorMessage}. Extracted ${extractedCount} fields with ${(confidence * 100).toFixed(0)}% confidence.`
            : `Extracted ${extractedCount} fields with ${(confidence * 100).toFixed(0)}% confidence.`,
          confidence: confidence,
        });

        if (extracted.confidence > 0.5) {
          toast({
            title: 'Extraction Successful',
            description: `Confidence: ${(extracted.confidence * 100).toFixed(0)}%`,
          });
        } else if (extractedCount > 0) {
          toast({
            title: 'Partial Extraction',
            description: `Low confidence (${(extracted.confidence * 100).toFixed(0)}%). Please review extracted fields.`,
            variant: 'default',
          });
        }
      } else {
        setExtractionStatus({
          success: false,
          message: errorMessage || 'Could not extract invoice data. Please fill manually.',
        });
        toast({
          title: 'Extraction Failed',
          description: errorMessage || 'Could not extract invoice data. Please fill fields manually.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error extracting invoice:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Unknown error occurred';
      setExtractionStatus({
        success: false,
        message: `Failed to extract invoice data: ${errorMessage}. Please fill manually.`,
      });
      toast({
        title: 'Extraction Failed',
        description: errorMessage || 'Could not extract invoice data. Please fill fields manually.',
        variant: 'destructive',
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleVendorChange = (vendorId: string) => {
    const vendor = approvedVendors.find(v => v.id === vendorId);
    if (vendor) {
      setFormData(prev => ({
        ...prev,
        vendorId: vendor.id,
        vendorName: vendor.organisation,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({
        invoiceNumber: formData.invoiceNumber || undefined,
        vendorId: formData.vendorId || undefined,
        vendorName: formData.vendorName || undefined,
        poNumber: formData.poNumber || undefined,
        amount: formData.amount ? parseFloat(formData.amount) : undefined,
        invoiceDate: formData.invoiceDate || undefined,
        dueDate: formData.dueDate || undefined,
        file: selectedFile || undefined,
      });
    }
    // Reset form
    setFormData({
      invoiceNumber: '',
      vendorId: '',
      vendorName: '',
      poNumber: '',
      amount: '',
      invoiceDate: '',
      dueDate: '',
    });
    setSelectedFile(null);
    setExtractionStatus(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onOpenChange(false);
  };

  const handleClose = () => {
    setFormData({
      invoiceNumber: '',
      vendorId: '',
      vendorName: '',
      poNumber: '',
      amount: '',
      invoiceDate: '',
      dueDate: '',
    });
    setSelectedFile(null);
    setExtractionStatus(null);
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
            Upload Vendor Invoice
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 font-outfit">
            Upload invoice for automatic matching and fraud detection
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
                Invoice File *
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center hover:border-gray-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="invoice-file-input"
                />
                <div className="flex items-center justify-center mb-6">
                  {isExtracting ? (
                    <Loader2 className="h-10 w-10 text-[#161950] animate-spin" />
                  ) : (
                    <Upload className="h-10 w-10 text-gray-600" />
                  )}
                </div>
                <p className="text-sm font-medium text-[#1A1A1A] mb-6 font-outfit">
                  {selectedFile ? selectedFile.name : 'Upload vendor invoice'}
                </p>
                <p className="text-xs text-gray-500 mb-8 font-outfit leading-relaxed max-w-md mx-auto">
                  System will match against PO, extract key data, and detect fraud patterns
                </p>
                {extractionStatus && (
                  <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                    extractionStatus.success 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {extractionStatus.success ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <span className="text-xs font-outfit">{extractionStatus.message}</span>
                    {extractionStatus.confidence && (
                      <span className="text-xs font-outfit ml-auto">
                        {(extractionStatus.confidence * 100).toFixed(0)}% confidence
                      </span>
                    )}
                  </div>
                )}
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#161950] hover:bg-[#1E2B5B] text-white font-outfit h-11 px-6"
                  disabled={isExtracting}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {selectedFile ? 'Change File' : 'Choose File'}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoiceNumber" className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
                  Invoice Number {formData.invoiceNumber ? '' : '(Optional)'}
                </Label>
                <Input
                  id="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  placeholder="INV-2024-001"
                  className="border-gray-200 font-outfit h-11"
                />
              </div>
              <div>
                <Label htmlFor="poNumber" className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
                  PO Number {formData.poNumber ? '' : '(Optional)'}
                </Label>
                <Input
                  id="poNumber"
                  value={formData.poNumber}
                  onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })}
                  placeholder="PO-2024-001"
                  className="border-gray-200 font-outfit h-11"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="vendor" className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
                Vendor {formData.vendorId ? '' : '(Optional)'}
              </Label>
              <Select
                value={formData.vendorId}
                onValueChange={handleVendorChange}
                disabled={isLoadingVendors}
              >
                <SelectTrigger className="border-gray-200 font-outfit h-11">
                  <SelectValue placeholder={isLoadingVendors ? "Loading vendors..." : "Select vendor or enter manually"} />
                </SelectTrigger>
                <SelectContent>
                  {approvedVendors.length > 0 ? (
                    approvedVendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.organisation}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-vendors" disabled>
                      No approved vendors available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {!formData.vendorId && (
                <Input
                  id="vendorName"
                  value={formData.vendorName}
                  onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                  placeholder="Or enter vendor name manually"
                  className="border-gray-200 font-outfit h-11 mt-2"
                />
              )}
            </div>

            {(formData.amount || formData.invoiceDate || formData.dueDate) && (
              <div className="grid grid-cols-3 gap-4">
                {formData.amount && (
                  <div>
                    <Label htmlFor="amount" className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
                      Amount (Optional)
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                      className="border-gray-200 font-outfit h-11"
                    />
                  </div>
                )}
                {formData.invoiceDate && (
                  <div>
                    <Label htmlFor="invoiceDate" className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
                      Invoice Date (Optional)
                    </Label>
                    <Input
                      id="invoiceDate"
                      type="date"
                      value={formData.invoiceDate}
                      onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                      className="border-gray-200 font-outfit h-11"
                    />
                  </div>
                )}
                {formData.dueDate && (
                  <div>
                    <Label htmlFor="dueDate" className="text-sm font-medium text-gray-700 font-outfit mb-2 block">
                      Due Date (Optional)
                    </Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="border-gray-200 font-outfit h-11"
                    />
                  </div>
                )}
              </div>
            )}
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
              disabled={!selectedFile}
            >
              Upload Invoice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
