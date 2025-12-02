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
import { useState } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface ApprovePurchaseOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (action: 'approved' | 'rejected', rejectionReason?: string) => Promise<void> | void;
  defaultAction?: 'approved' | 'rejected';
  isApproving?: boolean;
}

export function ApprovePurchaseOrderModal({
  open,
  onOpenChange,
  onApprove,
  defaultAction = 'approved',
  isApproving = false,
}: ApprovePurchaseOrderModalProps) {
  const [action, setAction] = useState<'approved' | 'rejected'>(defaultAction);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleSubmit = async () => {
    if (action === 'rejected' && !rejectionReason.trim()) {
      return; // Validation: rejection reason is required
    }
    
    await onApprove(action, action === 'rejected' ? rejectionReason : undefined);
    
    // Reset form on success
    if (!isApproving) {
      setAction('approved');
      setRejectionReason('');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isApproving) {
      // Reset form when closing
      setAction(defaultAction);
      setRejectionReason('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md font-outfit">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[#1A1A1A] font-outfit">
            {action === 'approved' ? 'Approve Purchase Order' : 'Reject Purchase Order'}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 font-outfit">
            {action === 'approved'
              ? 'Confirm approval of this purchase order.'
              : 'Please provide a reason for rejecting this purchase order.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label className="text-sm font-semibold text-[#1A1A1A] font-outfit mb-3 block">
              Action
            </Label>
            <RadioGroup value={action} onValueChange={(value) => setAction(value as 'approved' | 'rejected')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="approved" id="approve" />
                <Label htmlFor="approve" className="font-normal cursor-pointer font-outfit">
                  Approve
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rejected" id="reject" />
                <Label htmlFor="reject" className="font-normal cursor-pointer font-outfit">
                  Reject
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
        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
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
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
          >
            {isApproving ? (
              'Processing...'
            ) : action === 'approved' ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </>
            ) : (
              <>
                <X className="h-4 w-4 mr-2" />
                Reject
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

