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
import { EmployeeExpense } from '../types';
import { getStatusBadge } from '../utils';
import { CheckCircle, X, Calendar, DollarSign, FileText, Package, User, Download, Eye } from 'lucide-react';

interface ViewExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: EmployeeExpense | null;
  onApprove?: () => void;
  onReject?: () => void;
  canApprove?: boolean;
  isApproving?: boolean;
}

export function ViewExpenseModal({
  open,
  onOpenChange,
  expense,
  onApprove,
  onReject,
  canApprove = false,
  isApproving = false,
}: ViewExpenseModalProps) {
  if (!expense) return null;

  const statusBadge = getStatusBadge(expense.status);
  const isPending = expense.status === 'pending' || expense.status === 'draft';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto font-outfit">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[#1A1A1A] font-outfit">
            Employee Expense Details
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 font-outfit">
            View complete details of the expense
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit mb-1 block">
                Expense ID
              </label>
              <p className="text-sm text-[#1A1A1A] font-outfit">{expense.id}</p>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit mb-1 block">
                Status
              </label>
              <Badge className={`${statusBadge.className} font-outfit`}>{statusBadge.label}</Badge>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit mb-1 block flex items-center gap-1">
                <User className="h-3 w-3" />
                Employee
              </label>
              <p className="text-sm text-[#1A1A1A] font-outfit">{expense.employeeName}</p>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit mb-1 block flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Expense Date
              </label>
              <p className="text-sm text-[#1A1A1A] font-outfit">{expense.date}</p>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit mb-1 block flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                Amount
              </label>
              <p className="text-sm font-semibold text-[#1A1A1A] font-outfit">
                ${typeof expense.amount === 'number' ? expense.amount.toFixed(2) : Number(expense.amount || 0).toFixed(2)}
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit mb-1 block">
                Category
              </label>
              <p className="text-sm text-[#1A1A1A] font-outfit">{expense.category}</p>
            </div>
            {expense.projectCode && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit mb-1 block flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  Project Code
                </label>
                <p className="text-sm text-[#1A1A1A] font-outfit">{expense.projectCode}</p>
              </div>
            )}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit mb-1 block flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Submitted Date
              </label>
              <p className="text-sm text-[#1A1A1A] font-outfit">{expense.submittedDate}</p>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit mb-1 block flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Description
            </label>
            <p className="text-sm text-[#1A1A1A] font-outfit">{expense.description}</p>
          </div>
          {expense.receiptUrl && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit mb-1 block flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Receipt
              </label>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(expense.receiptUrl, '_blank')}
                  className="border-gray-200 hover:bg-gray-50 font-outfit"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Receipt
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = expense.receiptUrl!;
                    link.download = `receipt-${expense.id}.pdf`;
                    link.click();
                  }}
                  className="border-gray-200 hover:bg-gray-50 font-outfit"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}
          {expense.approvedBy && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit mb-1 block">
                Approved By
              </label>
              <p className="text-sm text-[#1A1A1A] font-outfit">{expense.approvedBy}</p>
            </div>
          )}
          {expense.rejectReason && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit mb-1 block">
                Rejection Reason
              </label>
              <p className="text-sm text-rose-600 font-outfit">{expense.rejectReason}</p>
            </div>
          )}
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

