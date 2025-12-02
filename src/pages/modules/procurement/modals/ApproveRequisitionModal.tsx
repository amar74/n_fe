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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ApproveRequisitionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requisitionId: string;
  onApprove: (status: 'approved' | 'rejected', rejectionReason?: string) => Promise<void>;
  isApproving?: boolean;
  defaultAction?: 'approved' | 'rejected';
}

export function ApproveRequisitionModal({
  open,
  onOpenChange,
  requisitionId,
  onApprove,
  isApproving = false,
  defaultAction = 'approved',
}: ApproveRequisitionModalProps) {
  const [action, setAction] = useState<'approved' | 'rejected'>(defaultAction);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleSubmit = async () => {
    if (action === 'rejected' && !rejectionReason.trim()) {
      return;
    }
    await onApprove(action, action === 'rejected' ? rejectionReason : undefined);
    if (!isApproving) {
      setAction('approved');
      setRejectionReason('');
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setAction(defaultAction);
    setRejectionReason('');
    onOpenChange(false);
  };

  // Reset to default action when modal opens
  useEffect(() => {
    if (open) {
      setAction(defaultAction);
      setRejectionReason('');
    }
  }, [open, defaultAction]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md font-outfit">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[#1A1A1A] font-outfit">
            Approve Requisition
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 font-outfit">
            Review and approve or reject purchase requisition {requisitionId}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-semibold text-[#1A1A1A] font-outfit mb-3 block">
              Decision
            </Label>
            <RadioGroup value={action} onValueChange={(value) => setAction(value as 'approved' | 'rejected')}>
              <div className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value="approved" id="approved" />
                <Label htmlFor="approved" className="flex items-center gap-2 cursor-pointer font-outfit">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm">Approve</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rejected" id="rejected" />
                <Label htmlFor="rejected" className="flex items-center gap-2 cursor-pointer font-outfit">
                  <XCircle className="h-4 w-4 text-rose-600" />
                  <span className="text-sm">Reject</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
          {action === 'rejected' && (
            <div>
              <Label htmlFor="rejectionReason" className="text-sm font-semibold text-[#1A1A1A] font-outfit mb-2 block">
                Rejection Reason <span className="text-rose-600">*</span>
              </Label>
              <Textarea
                id="rejectionReason"
                placeholder="Please provide a reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px] font-outfit"
                required
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isApproving}
            className="font-outfit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isApproving || (action === 'rejected' && !rejectionReason.trim())}
            className={`font-outfit ${
              action === 'approved'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            {isApproving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              action === 'approved' ? 'Approve' : 'Reject'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

