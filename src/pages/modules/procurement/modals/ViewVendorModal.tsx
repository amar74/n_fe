import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Building2, Mail, Phone, Globe, MapPin, Calendar, CheckCircle, Clock, XCircle, CreditCard, FileText } from 'lucide-react';
import type { ProcurementVendor } from '@/hooks/procurement';
import { getStatusBadge } from '../utils';

interface ViewVendorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: ProcurementVendor | null;
}

export function ViewVendorModal({ open, onOpenChange, vendor }: ViewVendorModalProps) {
  if (!vendor) return null;

  const statusBadge = getStatusBadge(vendor.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto font-outfit">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-[#1A1A1A] font-outfit">
            Vendor Details
          </DialogTitle>
          <DialogDescription className="font-outfit">
            View complete information about this supplier
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-600 font-outfit">Status</span>
            <Badge className={`${statusBadge.className} font-outfit`}>
              {statusBadge.label}
            </Badge>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600 font-outfit">Vendor Name</span>
              </div>
              <p className="text-base text-[#1A1A1A] font-outfit">{vendor.vendor_name}</p>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600 font-outfit">Organization</span>
              </div>
              <p className="text-base text-[#1A1A1A] font-outfit">{vendor.organisation}</p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-[#1A1A1A] font-outfit mb-3">Contact Information</h3>
            
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600 font-outfit">Email</span>
              </div>
              <p className="text-base text-[#1A1A1A] font-outfit">{vendor.email}</p>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600 font-outfit">Contact Number</span>
              </div>
              <p className="text-base text-[#1A1A1A] font-outfit">{vendor.contact_number}</p>
            </div>

            {vendor.website && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600 font-outfit">Website</span>
                </div>
                <a 
                  href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-[#161950] hover:underline font-outfit"
                >
                  {vendor.website}
                </a>
              </div>
            )}

            {(vendor as any).address && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600 font-outfit">Address</span>
                </div>
                <p className="text-base text-[#1A1A1A] font-outfit">{(vendor as any).address}</p>
              </div>
            )}

            {(vendor as any).payment_terms && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600 font-outfit">Payment Terms</span>
                </div>
                <p className="text-base text-[#1A1A1A] font-outfit">{(vendor as any).payment_terms}</p>
              </div>
            )}

            {(vendor as any).tax_id && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600 font-outfit">Tax ID / EIN</span>
                </div>
                <p className="text-base text-[#1A1A1A] font-outfit">{(vendor as any).tax_id}</p>
              </div>
            )}

            {(vendor as any).notes && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600 font-outfit">Notes</span>
                </div>
                <p className="text-base text-[#1A1A1A] font-outfit whitespace-pre-wrap">{(vendor as any).notes}</p>
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-[#1A1A1A] font-outfit mb-3">Timeline</h3>
            
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600 font-outfit">Created At</span>
              </div>
              <p className="text-base text-[#1A1A1A] font-outfit">
                {new Date(vendor.created_at).toLocaleString()}
              </p>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600 font-outfit">Last Updated</span>
              </div>
              <p className="text-base text-[#1A1A1A] font-outfit">
                {new Date(vendor.updated_at).toLocaleString()}
              </p>
            </div>

            {vendor.approved_at && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-600 font-outfit">Approved At</span>
                </div>
                <p className="text-base text-[#1A1A1A] font-outfit">
                  {new Date(vendor.approved_at).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm font-medium text-gray-600 font-outfit">Vendor ID</span>
            </div>
            <p className="text-xs text-gray-500 font-outfit font-mono break-all">{vendor.id}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

