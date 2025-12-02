export const getStatusBadge = (status: string) => {
  const statusMap: Record<string, { label: string; className: string }> = {
    draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700' },
    pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700' },
    approved: { label: 'Approved', className: 'bg-emerald-50 text-emerald-700' },
    rejected: { label: 'Rejected', className: 'bg-rose-50 text-rose-700' },
    'po-created': { label: 'PO Created', className: 'bg-blue-50 text-blue-700' },
    issued: { label: 'Issued', className: 'bg-gray-100 text-gray-700' },
    'partially-fulfilled': { label: 'Partially Fulfilled', className: 'bg-amber-50 text-amber-700' },
    fulfilled: { label: 'Fulfilled', className: 'bg-emerald-50 text-emerald-700' },
    invoiced: { label: 'Invoiced', className: 'bg-blue-50 text-blue-700' },
    paid: { label: 'Paid', className: 'bg-emerald-50 text-emerald-700' },
    matched: { label: 'Matched', className: 'bg-emerald-50 text-emerald-700' },
    exception: { label: 'Exception', className: 'bg-rose-50 text-rose-700' },
    reimbursed: { label: 'Reimbursed', className: 'bg-emerald-50 text-emerald-700' },
    // RFQ statuses
    sent: { label: 'Sent', className: 'bg-blue-100 text-blue-700' },
    'responses-received': { label: 'Responses Received', className: 'bg-amber-100 text-amber-700' },
    evaluating: { label: 'Evaluating', className: 'bg-purple-100 text-purple-700' },
    awarded: { label: 'Awarded', className: 'bg-emerald-100 text-emerald-700' },
    closed: { label: 'Closed', className: 'bg-gray-100 text-gray-600' },
    cancelled: { label: 'Cancelled', className: 'bg-rose-50 text-rose-700' },
  };
  return statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
};

