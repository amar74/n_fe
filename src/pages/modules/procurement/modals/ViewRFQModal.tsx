import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RFQ } from '../types';
import { FileText, Calendar, DollarSign, Building2, User, CheckCircle, Clock, Loader2, X } from 'lucide-react';
import { useProcurement } from '@/hooks/useProcurement';
import { useProcurementVendors } from '@/hooks/useProcurementVendors';

interface ViewRFQModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rfq: RFQ | null;
  onApprove?: () => Promise<void> | void;
  onReject?: () => void;
  canApprove?: boolean;
  isApproving?: boolean;
}

export function ViewRFQModal({
  open,
  onOpenChange,
  rfq,
  onApprove,
  onReject,
  canApprove = false,
  isApproving = false,
}: ViewRFQModalProps) {
  const { useRFQResponses, updateRFQ } = useProcurement();
  const { useVendorsList } = useProcurementVendors();
  const { data: responsesData, isLoading: isLoadingResponses } = useRFQResponses(
    rfq?.uuid,
    open && !!rfq
  );
  const { data: vendorsData } = useVendorsList(0, 1000);

  if (!rfq) return null;

  const getStatusBadge = (status: RFQ['status']) => {
    const statusMap = {
      draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700' },
      sent: { label: 'Sent', className: 'bg-blue-100 text-blue-700' },
      'responses-received': { label: 'Responses Received', className: 'bg-amber-100 text-amber-700' },
      evaluating: { label: 'Evaluating', className: 'bg-purple-100 text-purple-700' },
      awarded: { label: 'Awarded', className: 'bg-emerald-100 text-emerald-700' },
      closed: { label: 'Closed', className: 'bg-gray-100 text-gray-600' },
    };
    return statusMap[status] || statusMap.draft;
  };

  const statusBadge = getStatusBadge(rfq.status);
  const isPending = rfq.status === 'draft';
  
  const handleApprove = async () => {
    if (onApprove) {
      await onApprove();
    } else if (rfq.uuid) {
      // Default approve action - update RFQ status to 'sent'
      await updateRFQ({
        id: rfq.uuid,
        data: { status: 'sent' },
      });
    }
  };
  
  // Map responses to display format with vendor names
  const responsesList = responsesData?.map((resp: any) => {
    const vendor = vendorsData?.vendors?.find((v: any) => v.id === resp.vendor_id);
    return {
      vendorName: vendor?.organisation || vendor?.vendor_name || 'Unknown Vendor',
      quotedAmount: Number(resp.quoted_amount || 0),
      status: resp.status || 'submitted',
    };
  }) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto font-outfit">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#1A1A1A] font-outfit">
            Request for Quotation (RFQ) Details
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 font-outfit">
            View complete details of the RFQ
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit mb-1 block flex items-center gap-1">
                <FileText className="h-3 w-3" />
                RFQ ID
              </label>
              <p className="text-sm text-[#1A1A1A] font-outfit font-medium">{rfq.id}</p>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit mb-1 block">
                Status
              </label>
              <Badge className={`${statusBadge.className} font-outfit`}>{statusBadge.label}</Badge>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit mb-1 block flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Title
            </label>
            <p className="text-sm text-[#1A1A1A] font-outfit font-medium">{rfq.title}</p>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit mb-1 block">
              Description
            </label>
            <p className="text-sm text-gray-700 font-outfit leading-relaxed whitespace-pre-wrap">{rfq.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit mb-1 block">
                Category
              </label>
              <p className="text-sm text-[#1A1A1A] font-outfit">{rfq.category}</p>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit mb-1 block flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                Estimated Value
              </label>
              <p className="text-sm text-[#1A1A1A] font-outfit font-semibold">${rfq.estimatedValue.toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit mb-1 block flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Response Due Date
              </label>
              <p className="text-sm text-[#1A1A1A] font-outfit">{rfq.dueDate}</p>
            </div>
            {rfq.sentDate && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit mb-1 block flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Sent Date
                </label>
                <p className="text-sm text-[#1A1A1A] font-outfit">{rfq.sentDate}</p>
              </div>
            )}
          </div>

          {rfq.requisitionId && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit mb-1 block flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                Related Requisition
              </label>
              <p className="text-sm text-[#1A1A1A] font-outfit">
                {rfq.requisitionDisplayId || rfq.requisitionId}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit mb-1 block flex items-center gap-1">
                <User className="h-3 w-3" />
                Vendors Invited
              </label>
              {rfq.vendorsInvited > 0 ? (
                <div className="space-y-1">
                  <p className="text-sm text-[#1A1A1A] font-outfit font-medium">{rfq.vendorsInvited} vendor{rfq.vendorsInvited !== 1 ? 's' : ''}</p>
                  {rfq.vendorsInvitedList && rfq.vendorsInvitedList.length > 0 && (
                    <div className="text-xs text-gray-600 font-outfit">
                      {rfq.vendorsInvitedList.map((vendor, idx) => (
                        <span key={idx}>
                          {vendor}
                          {idx < rfq.vendorsInvitedList!.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 font-outfit">No vendors invited yet</p>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit mb-1 block flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Responses Received
              </label>
              {isLoadingResponses ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
                  <p className="text-xs text-gray-500 font-outfit">Loading...</p>
                </div>
              ) : rfq.responsesReceived > 0 || responsesList.length > 0 ? (
                <div className="space-y-1">
                  <p className="text-sm text-[#1A1A1A] font-outfit font-medium">
                    {responsesList.length || rfq.responsesReceived} response{(responsesList.length || rfq.responsesReceived) !== 1 ? 's' : ''}
                  </p>
                  {responsesList.length > 0 && (
                    <div className="text-xs text-gray-600 font-outfit space-y-1 mt-2">
                      {responsesList.map((response, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                          <div className="flex-1">
                            <span className="font-medium text-[#1A1A1A]">{response.vendorName}</span>
                            <Badge className="ml-2 text-xs bg-blue-100 text-blue-700">{response.status}</Badge>
                          </div>
                          <span className="font-semibold text-emerald-600">${response.quotedAmount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 font-outfit">No responses yet</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit mb-1 block flex items-center gap-1">
                <User className="h-3 w-3" />
                Created By
              </label>
              <p className="text-sm text-[#1A1A1A] font-outfit">{rfq.createdByName || rfq.createdBy}</p>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit mb-1 block flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Created Date
              </label>
              <p className="text-sm text-[#1A1A1A] font-outfit">{rfq.createdDate}</p>
            </div>
          </div>
        </div>
        {isPending && canApprove && (
          <DialogFooter className="flex gap-2 pt-4 border-t border-gray-200">
            {onReject && (
              <Button
                variant="outline"
                onClick={onReject}
                className="border-rose-200 hover:bg-rose-50 hover:border-rose-300 text-rose-600 font-outfit"
                disabled={isApproving}
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
            )}
            <Button
              onClick={handleApprove}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-outfit"
              disabled={isApproving}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {isApproving ? 'Approving...' : 'Approve & Send'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

