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
import { PurchaseOrder } from '../types';
import { getStatusBadge } from '../utils';
import { CheckCircle, X } from 'lucide-react';

interface ViewPurchaseOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: PurchaseOrder | null;
  onApprove?: () => void;
  onReject?: () => void;
  canApprove?: boolean;
  isApproving?: boolean;
}

export function ViewPurchaseOrderModal({
  open,
  onOpenChange,
  order,
  onApprove,
  onReject,
  canApprove = false,
  isApproving = false,
}: ViewPurchaseOrderModalProps) {
  if (!order) return null;

  const statusBadge = getStatusBadge(order.status);
  const isPending = order.status === 'issued' || order.status === 'pending';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto font-outfit">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[#1A1A1A] font-outfit">
            Purchase Order Details
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 font-outfit">
            View complete details of the purchase order
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit mb-1 block">
                PO Number
              </label>
              <p className="text-sm text-[#1A1A1A] font-outfit">{order.id}</p>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit mb-1 block">
                Status
              </label>
              <Badge className={`${statusBadge.className} font-outfit`}>{statusBadge.label}</Badge>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit mb-1 block">
                Vendor
              </label>
              <p className="text-sm text-[#1A1A1A] font-outfit">{order.vendor}</p>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit mb-1 block">
                Amount
              </label>
              <p className="text-sm font-semibold text-[#1A1A1A] font-outfit">${typeof order.amount === 'number' ? order.amount.toFixed(2) : Number(order.amount || 0).toFixed(2)}</p>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit mb-1 block">
                Issue Date
              </label>
              <p className="text-sm text-[#1A1A1A] font-outfit">{order.issueDate}</p>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit mb-1 block">
                Due Date
              </label>
              <p className="text-sm text-[#1A1A1A] font-outfit">{order.dueDate}</p>
            </div>
            {order.projectCode && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit mb-1 block">
                  Project Code
                </label>
                <p className="text-sm text-[#1A1A1A] font-outfit">{order.projectCode}</p>
              </div>
            )}
            {order.requisitionId && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit mb-1 block">
                  Requisition ID
                </label>
                <p className="text-sm text-[#1A1A1A] font-outfit">{order.requisitionId}</p>
              </div>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit mb-1 block">
              Description
            </label>
            <p className="text-sm text-[#1A1A1A] font-outfit">{order.description}</p>
          </div>
        </div>
        {isPending && canApprove && (onApprove || onReject) && (
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
            {onApprove && (
              <Button
                onClick={onApprove}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-outfit"
                disabled={isApproving}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {isApproving ? 'Approving...' : 'Approve'}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

