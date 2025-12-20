import { useState, useMemo } from 'react';
import { Search, Filter, Eye, CheckCircle, X, ShoppingCart, FileText, Building2, Calendar, DollarSign, Package, User, Loader2, Receipt, ClipboardList } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProcurement } from '@/hooks/procurement';
import { useAuth } from '@/hooks/auth';
import { ApproveRequisitionModal, ViewRequisitionModal, ViewPurchaseOrderModal, ViewRFQModal, ViewExpenseModal } from './modals';
import { getStatusBadge } from './utils';
import { PurchaseRequisition, PurchaseOrder, RFQ, EmployeeExpense } from './types';

type SubmissionType = 'requisition' | 'order' | 'rfq' | 'expense';
type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'all';

interface UnifiedSubmission {
  id: string;
  uuid: string; // For API calls
  type: SubmissionType;
  requester: string;
  department: string;
  priority: 'low' | 'medium' | 'high';
  submissionId: string;
  description: string;
  submittedDate: string;
  neededBy?: string;
  projectCode?: string;
  amount: number;
  vendor?: string;
  category: string;
  status: string;
  purchaseType?: 'overhead' | 'project';
  data: PurchaseRequisition | PurchaseOrder | RFQ | EmployeeExpense;
}

export function SubmissionsApprovalPage() {
  const [activeTab, setActiveTab] = useState<SubmissionStatus>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState<UnifiedSubmission | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [approveRequisitionId, setApproveRequisitionId] = useState<string | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [rejectRequisitionId, setRejectRequisitionId] = useState<string | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectPurchaseOrderId, setRejectPurchaseOrderId] = useState<string | null>(null);
  const [isRejectPOModalOpen, setIsRejectPOModalOpen] = useState(false);

  const { 
    useRequisitions, 
    usePurchaseOrders, 
    useRFQs,
    useExpenses,
    approveRequisition,
    approveExpense,
    updateRFQ,
    updatePurchaseOrder,
    isApprovingRequisition,
    isApprovingExpense,
    isUpdatingRFQ,
    isUpdatingPurchaseOrder,
  } = useProcurement();
  const { authState } = useAuth();
  const currentUserRole = authState.user?.role;
  const isOrgOwner = authState.user?.is_org_owner;
  const canApprove: boolean = currentUserRole === 'admin' || currentUserRole === 'manager' || currentUserRole === 'vendor' || isOrgOwner === true;
  const currentUserId = authState.user?.id;
  
  // Helper function to extract name from email (e.g., "amar12@softication.com" -> "amar 12")
  const extractNameFromEmail = (email: string): string => {
    if (!email) return 'Unknown User';
    const username = email.split('@')[0];
    return username
      .replace(/([a-z])([A-Z0-9])/g, '$1 $2')
      .replace(/([0-9]+)/g, ' $1 ')
      .trim()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
  
  const currentUserName = authState.user?.name || 
    (authState.user?.email ? extractNameFromEmail(authState.user.email) : 'Unknown User');

  // Fetch requisitions - fetch all, then filter in frontend
  const { data: requisitionsData, isLoading: isLoadingRequisitions } = useRequisitions({
    page: 1,
    size: 100, // Backend max is 100
    status: undefined, // Fetch all statuses
  });

  // Fetch purchase orders - fetch all, then filter in frontend
  const { data: ordersData, isLoading: isLoadingOrders } = usePurchaseOrders({
    page: 1,
    size: 100, // Backend max is 100
    status: undefined, // Fetch all statuses
  });

  // Fetch RFQs - fetch all, then filter in frontend
  const { data: rfqsData, isLoading: isLoadingRFQs } = useRFQs({
    page: 1,
    size: 100, // Backend max is 100
    status: undefined, // Fetch all statuses
  });

  // Fetch expenses - fetch all, then filter in frontend
  const { data: expensesData, isLoading: isLoadingExpenses } = useExpenses({
    page: 1,
    size: 100, // Backend max is 100
    status: undefined, // Fetch all statuses
  });

  // Transform data into unified submissions
  const unifiedSubmissions = useMemo(() => {
    const submissions: UnifiedSubmission[] = [];

    // Add requisitions
    if (requisitionsData?.requisitions) {
      requisitionsData.requisitions.forEach((req: any) => {
        // Use backend-provided name if available, otherwise fallback to current user name or 'User'
        const requestedByName = (req as any).requested_by_name || 
          (req.requested_by === currentUserId ? currentUserName : 'User');
        
        submissions.push({
          id: req.custom_id || req.id,
          uuid: req.id,
          type: 'requisition',
          requester: requestedByName,
          department: req.department || 'N/A',
          priority: req.urgency || 'medium',
          submissionId: req.custom_id || req.id,
          description: req.description,
          submittedDate: req.created_at,
          neededBy: req.needed_by,
          projectCode: req.project_code,
          amount: Number(req.estimated_cost),
          vendor: req.vendor,
          category: req.category || 'N/A',
          status: req.status,
          purchaseType: req.purchase_type,
          data: {
            id: req.custom_id || req.id,
            uuid: req.id,
            requestedBy: requestedByName,
            description: req.description,
            estimatedCost: Number(req.estimated_cost),
            vendor: req.vendor || '',
            justification: req.justification,
            status: req.status as 'draft' | 'pending' | 'approved' | 'po-created' | 'rejected',
            requestDate: new Date(req.created_at).toISOString().split('T')[0],
            department: req.department,
            projectCode: req.project_code || undefined,
          } as PurchaseRequisition,
        });
      });
    }

    // Add purchase orders
    if (ordersData?.orders) {
      ordersData.orders.forEach((order: any) => {
        // Use backend-provided name if available, otherwise fallback to current user name or 'User'
        const createdByName = (order as any).created_by_name || 
          (order.created_by === currentUserId ? currentUserName : 'User');
        
        submissions.push({
          id: order.custom_id || order.id,
          uuid: order.id,
          type: 'order',
          requester: createdByName,
          department: order.department || 'N/A',
          priority: 'medium',
          submissionId: order.custom_id || order.id,
          description: order.description,
          submittedDate: order.created_at,
          neededBy: order.due_date,
          projectCode: order.project_code,
          amount: Number(order.amount),
          vendor: order.vendor_name || order.vendor || '',
          category: order.category || 'N/A',
          status: order.status,
          data: {
            id: order.custom_id || order.id,
            vendor: order.vendor_name || order.vendor || '',
            amount: Number(order.amount),
            description: order.description,
            status: order.status as 'issued' | 'partially-fulfilled' | 'fulfilled' | 'invoiced' | 'paid',
            issueDate: new Date(order.issue_date).toISOString().split('T')[0],
            dueDate: order.due_date ? new Date(order.due_date).toISOString().split('T')[0] : '',
            projectCode: order.project_code || undefined,
            requisitionId: order.requisition_id || '',
          } as PurchaseOrder,
        });
      });
    }

    // Add RFQs
    if (rfqsData?.rfqs) {
      rfqsData.rfqs.forEach((rfq: any) => {
        // Use backend-provided name if available, otherwise fallback to current user name or 'User'
        const createdByName = (rfq as any).created_by_name || 
          (rfq.created_by === currentUserId ? currentUserName : 'User');
        
        submissions.push({
          id: rfq.custom_id || rfq.id,
          uuid: rfq.id,
          type: 'rfq',
          requester: createdByName,
          department: 'N/A', // RFQs don't have department
          priority: 'medium',
          submissionId: rfq.custom_id || rfq.id,
          description: rfq.title || rfq.description, // Use title as description for RFQ
          submittedDate: rfq.created_at,
          neededBy: rfq.due_date,
          projectCode: undefined,
          amount: Number(rfq.estimated_value),
          vendor: undefined,
          category: rfq.category || 'N/A',
          status: rfq.status,
          data: {
            id: rfq.custom_id || rfq.id,
            uuid: rfq.id,
            requisitionId: rfq.requisition_id || '',
            title: rfq.title,
            description: rfq.description,
            category: rfq.category,
            estimatedValue: Number(rfq.estimated_value),
            dueDate: new Date(rfq.due_date).toISOString().split('T')[0],
            status: rfq.status as 'draft' | 'sent' | 'responses-received' | 'evaluating' | 'awarded' | 'closed',
            sentDate: rfq.sent_date ? new Date(rfq.sent_date).toISOString().split('T')[0] : undefined,
            vendorsInvited: rfq.vendors_invited,
            responsesReceived: rfq.responses_received,
            createdBy: rfq.created_by,
            createdByName,
            createdDate: new Date(rfq.created_at).toISOString().split('T')[0],
          } as RFQ,
        });
      });
    }

    // Add expenses
    if (expensesData?.expenses) {
      expensesData.expenses.forEach((expense: any) => {
        // Use backend-provided name if available, otherwise fallback to current user name or 'User'
        const employeeName = (expense as any).employee_name || 
          (expense.employee_id === currentUserId ? currentUserName : 'User');
        
        submissions.push({
          id: expense.custom_id || expense.id,
          uuid: expense.id,
          type: 'expense',
          requester: employeeName,
          department: 'N/A', // Expenses don't have department
          priority: 'medium',
          submissionId: expense.custom_id || expense.id,
          description: expense.description,
          submittedDate: expense.created_at,
          neededBy: expense.expense_date,
          projectCode: expense.project_code,
          amount: Number(expense.amount),
          vendor: undefined,
          category: expense.category || 'N/A',
          status: expense.status,
          data: {
            id: expense.custom_id || expense.id,
            employeeName,
            date: new Date(expense.expense_date).toISOString().split('T')[0],
            amount: Number(expense.amount),
            category: expense.category,
            description: expense.description,
            projectCode: expense.project_code || undefined,
            status: expense.status as 'draft' | 'pending' | 'approved' | 'rejected' | 'reimbursed',
            receiptUrl: expense.receipt_url || undefined,
            submittedDate: new Date(expense.created_at).toISOString().split('T')[0],
            approvedBy: expense.approved_by || undefined,
            rejectReason: expense.rejected_reason || undefined,
          } as EmployeeExpense,
        });
      });
    }

    return submissions.sort((a, b) => {
      const dateA = new Date(a.submittedDate).getTime();
      const dateB = new Date(b.submittedDate).getTime();
      return dateB - dateA;
    });
  }, [requisitionsData, ordersData, rfqsData, expensesData, currentUserId, currentUserName]);

  // Filter submissions by status and other filters
  const filteredSubmissions = useMemo(() => {
    return unifiedSubmissions.filter((submission) => {
      // Status filter
      let matchesStatus = true;
      if (activeTab !== 'all') {
        if (activeTab === 'pending') {
          // Pending: draft, pending, issued (for POs), DRAFT, PENDING
          // Note: 'sent' RFQs are approved and should not be in pending
          matchesStatus = submission.status === 'pending' || 
                         submission.status === 'draft' || 
                         submission.status === 'issued' ||
                         submission.status === 'DRAFT' ||
                         submission.status === 'PENDING' ||
                         submission.status === 'ISSUED' ||
                         submission.status === 'EVALUATING' ||
                         submission.status === 'evaluating' ||
                         submission.status === 'UNDER_REVIEW' ||
                         submission.status === 'under-review';
        } else if (activeTab === 'approved') {
          // Approved: approved, fulfilled, po-created, reimbursed, awarded, sent (for RFQs)
          matchesStatus = submission.status === 'approved' || 
                         submission.status === 'fulfilled' || 
                         submission.status === 'po-created' ||
                         submission.status === 'reimbursed' ||
                         submission.status === 'awarded' ||
                         submission.status === 'sent' ||
                         submission.status === 'APPROVED' ||
                         submission.status === 'REIMBURSED' ||
                         submission.status === 'AWARDED' ||
                         submission.status === 'SENT' ||
                         submission.status === 'FULFILLED' ||
                         submission.status === 'INVOICED' ||
                         submission.status === 'invoiced' ||
                         submission.status === 'PAID' ||
                         submission.status === 'paid' ||
                         submission.status === 'responses-received' ||
                         submission.status === 'RESPONSES_RECEIVED';
        } else if (activeTab === 'rejected') {
          matchesStatus = submission.status === 'rejected' || 
                         submission.status === 'cancelled' ||
                         submission.status === 'closed' ||
                         submission.status === 'CLOSED' ||
                         submission.status === 'CANCELLED' ||
                         submission.status === 'closed' ||
                         submission.status === 'REJECTED' ||
                         submission.status === 'CANCELLED' ||
                         submission.status === 'CLOSED';
        }
      }

      const matchesSearch = 
        submission.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        submission.submissionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        submission.requester.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDepartment = departmentFilter === 'all' || submission.department === departmentFilter;
      const matchesUrgency = urgencyFilter === 'all' || submission.priority === urgencyFilter;

      return matchesStatus && matchesSearch && matchesDepartment && matchesUrgency;
    });
  }, [unifiedSubmissions, activeTab, searchQuery, departmentFilter, urgencyFilter]);

  // Get unique departments and priorities
  const departments = useMemo(() => {
    const depts = new Set(unifiedSubmissions.map(s => s.department));
    return Array.from(depts).filter(Boolean).sort();
  }, [unifiedSubmissions]);

  const handleView = (submission: UnifiedSubmission) => {
    setSelectedSubmission(submission);
    setIsViewModalOpen(true);
  };

  const handleApprove = async (submission: UnifiedSubmission) => {
    if (!canApprove) return;

    try {
      if (submission.type === 'requisition') {
        setApproveRequisitionId(submission.uuid);
        setIsApproveModalOpen(true);
      } else if (submission.type === 'expense') {
        await approveExpense({
          id: submission.uuid,
          data: { status: 'approved' },
        });
      } else if (submission.type === 'rfq') {
        await updateRFQ({
          id: submission.uuid,
          data: { status: 'sent' },
        });
      } else if (submission.type === 'order') {
        await updatePurchaseOrder({
          id: submission.uuid,
          data: { status: 'fulfilled' },
        });
      }
      setIsViewModalOpen(false); // Close modal after approval
    } catch (error) {
      console.error(`Error approving ${submission.type}:`, error);
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      high: { label: 'High Priority', className: 'bg-rose-100 text-rose-700' },
      medium: { label: 'Medium Priority', className: 'bg-amber-100 text-amber-700' },
      low: { label: 'Low Priority', className: 'bg-emerald-100 text-emerald-700' },
    };
    return variants[priority] || variants.medium;
  };

  const getTypeBadge = (type: SubmissionType, purchaseType?: string) => {
    const typeMap: Record<SubmissionType, { label: string; className: string }> = {
      order: { label: 'Purchase Order', className: 'bg-blue-100 text-blue-700' },
      rfq: { label: 'RFQ', className: 'bg-purple-100 text-purple-700' },
      expense: { label: 'Expense', className: 'bg-amber-100 text-amber-700' },
      requisition: purchaseType === 'project'
        ? { label: 'Project Requisition', className: 'bg-emerald-100 text-emerald-700' }
        : { label: 'Overhead Requisition', className: 'bg-gray-100 text-gray-700' },
    };
    return typeMap[type] || typeMap.requisition;
  };

  const getTypeIcon = (type: SubmissionType) => {
    switch (type) {
      case 'requisition':
        return FileText;
      case 'order':
        return ShoppingCart;
      case 'rfq':
        return ClipboardList;
      case 'expense':
        return Receipt;
      default:
        return FileText;
    }
  };

  const isLoading = isLoadingRequisitions || isLoadingOrders || isLoadingRFQs || isLoadingExpenses;

  return (
    <div className="min-h-screen bg-gray-50 font-outfit">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A1A] font-outfit mb-2">Submissions Approval</h1>
          <p className="text-gray-600 font-outfit">Manage and approve Purchase Requisitions, Purchase Orders, RFQs, and Expenses</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#1A1A1A] font-outfit mb-4">Filter Submissions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name, ID, or description"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-200 font-outfit h-11"
                />
              </div>
            </div>
            <div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="border-gray-200 font-outfit h-11">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger className="border-gray-200 font-outfit h-11">
                  <SelectValue placeholder="All Urgency Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgency Levels</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {(searchQuery || departmentFilter !== 'all' || urgencyFilter !== 'all') && (
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setDepartmentFilter('all');
                  setUrgencyFilter('all');
                }}
                className="border-gray-200 font-outfit"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SubmissionStatus)} className="mb-6">
          <TabsList className="bg-white border border-gray-200 font-outfit">
            <TabsTrigger value="pending" className="font-outfit">
              Pending ({unifiedSubmissions.filter(s => {
                const status = s.status?.toLowerCase() || '';
                return status === 'pending' || status === 'draft' || status === 'issued' || 
                       status === 'evaluating' || status === 'under-review' || status === 'under_review';
              }).length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="font-outfit">
              Approved ({unifiedSubmissions.filter(s => {
                const status = s.status?.toLowerCase() || '';
                return ['approved', 'fulfilled', 'po-created', 'reimbursed', 'awarded', 'sent', 
                        'invoiced', 'paid', 'responses-received'].includes(status);
              }).length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="font-outfit">
              Rejected ({unifiedSubmissions.filter(s => ['rejected', 'cancelled', 'closed', 'REJECTED'].includes(s.status)).length})
            </TabsTrigger>
            <TabsTrigger value="all" className="font-outfit">
              All Submissions ({unifiedSubmissions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#161950]" />
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-outfit">No submissions found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSubmissions.map((submission) => {
                  const statusBadge = getStatusBadge(submission.status);
                  const priorityBadge = getPriorityBadge(submission.priority);
                  const typeBadge = getTypeBadge(submission.type, submission.purchaseType);
                         const status = submission.status?.toLowerCase() || '';
                         const isPending = status === 'pending' || 
                                   status === 'draft' || 
                                   status === 'issued' ||
                                   status === 'evaluating' ||
                                   status === 'under-review' ||
                                   status === 'under_review';

                  return (
                    <div
                      key={`${submission.type}-${submission.id}`}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center gap-2">
                              {(() => {
                                const Icon = getTypeIcon(submission.type);
                                return <Icon className="h-5 w-5 text-[#161950]" />;
                              })()}
                              <span className="font-semibold text-[#1A1A1A] font-outfit">{submission.requester}</span>
                            </div>
                            <Badge className={`${priorityBadge.className} text-xs font-outfit`}>
                              {priorityBadge.label}
                            </Badge>
                            <Badge className={`${typeBadge.className} text-xs font-outfit`}>
                              {typeBadge.label}
                            </Badge>
                            <Badge className={`${statusBadge.className} text-xs font-outfit`}>
                              {statusBadge.label}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600 font-outfit">
                              <Building2 className="h-4 w-4" />
                              <span>{submission.department}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 font-outfit">
                              <FileText className="h-4 w-4" />
                              <span className="font-medium text-[#1A1A1A]">{submission.submissionId}</span>
                            </div>
                            {submission.projectCode && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 font-outfit">
                                <Package className="h-4 w-4" />
                                <Badge variant="outline" className="text-xs font-outfit">{submission.projectCode}</Badge>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-gray-600 font-outfit">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {submission.type === 'requisition' ? 'Requested' : 'Created'}: {new Date(submission.submittedDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <p className="text-sm text-[#1A1A1A] font-outfit mb-4">{submission.description}</p>

                          <div className="flex items-center gap-6 text-sm font-outfit">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-emerald-600" />
                              <span className="font-semibold text-emerald-600">${submission.amount.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Package className="h-4 w-4" />
                              <span>{submission.category}</span>
                            </div>
                            {submission.vendor && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <User className="h-4 w-4" />
                                <span>{submission.vendor}</span>
                              </div>
                            )}
                            {submission.neededBy && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>Needed by: {new Date(submission.neededBy).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(submission)}
                            className="border-gray-200 hover:bg-gray-50 font-outfit"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          {isPending && canApprove && (
                            <>
                              {(submission.type === 'requisition' || submission.type === 'expense' || submission.type === 'rfq' || submission.type === 'order') && (
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(submission)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-outfit"
                                  disabled={
                                    (submission.type === 'requisition' && isApprovingRequisition) ||
                                    (submission.type === 'expense' && isApprovingExpense) ||
                                    (submission.type === 'rfq' && isUpdatingRFQ) ||
                                    (submission.type === 'order' && isUpdatingPurchaseOrder)
                                  }
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-rose-200 hover:bg-rose-50 hover:border-rose-300 text-rose-600 font-outfit"
                                onClick={async () => {
                                  if (!canApprove) return;
                                  try {
                                    if (submission.type === 'requisition') {
                                      await approveRequisition({
                                        id: submission.uuid,
                                        data: { status: 'rejected', rejection_reason: 'Rejected by approver' },
                                      });
                                    } else if (submission.type === 'expense') {
                                      await approveExpense({
                                        id: submission.uuid,
                                        data: { status: 'rejected', rejection_reason: 'Rejected by approver' },
                                      });
                                    } else if (submission.type === 'rfq') {
                                      await updateRFQ({
                                        id: submission.uuid,
                                        data: { status: 'closed' },
                                      });
                                    } else if (submission.type === 'order') {
                                      await updatePurchaseOrder({
                                        id: submission.uuid,
                                        data: { status: 'cancelled' },
                                      });
                                    }
                                  } catch (error) {
                                    console.error(`Error rejecting ${submission.type}:`, error);
                                  }
                                }}
                                disabled={
                                  (submission.type === 'order' && isUpdatingPurchaseOrder) ||
                                  (submission.type === 'rfq' && isUpdatingRFQ)
                                }
                              >
                                <X className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {selectedSubmission && selectedSubmission.type === 'requisition' && (
        <ViewRequisitionModal
          open={isViewModalOpen}
          onOpenChange={setIsViewModalOpen}
          requisition={selectedSubmission.data as PurchaseRequisition}
          onApprove={() => {
            if (selectedSubmission.type === 'requisition') {
              setApproveRequisitionId(selectedSubmission.uuid);
              setIsApproveModalOpen(true);
            }
          }}
          onReject={() => {
            if (selectedSubmission.type === 'requisition') {
              setRejectRequisitionId(selectedSubmission.uuid);
              setIsRejectModalOpen(true);
            }
          }}
          canApprove={!!canApprove}
          isApproving={!!isApprovingRequisition}
        />
      )}

      {approveRequisitionId && (
        <ApproveRequisitionModal
          open={isApproveModalOpen}
          onOpenChange={(open) => {
            setIsApproveModalOpen(open);
            if (!open) setApproveRequisitionId(null);
          }}
          requisitionId={approveRequisitionId}
          onApprove={async (status, rejectionReason) => {
            try {
              await approveRequisition({
                id: approveRequisitionId,
                data: {
                  status: status === 'approved' ? 'approved' : 'rejected',
                  rejection_reason: rejectionReason,
                },
              });
              setIsApproveModalOpen(false);
              setApproveRequisitionId(null);
              setIsViewModalOpen(false);
            } catch (error) {
              console.error('Error processing requisition:', error);
            }
          }}
          isApproving={isApprovingRequisition}
        />
      )}

      {rejectRequisitionId && (
        <ApproveRequisitionModal
          open={isRejectModalOpen}
          onOpenChange={(open) => {
            setIsRejectModalOpen(open);
            if (!open) setRejectRequisitionId(null);
          }}
          requisitionId={rejectRequisitionId}
          onApprove={async (status, rejectionReason) => {
            try {
              await approveRequisition({
                id: rejectRequisitionId,
                data: {
                  status: 'rejected',
                  rejection_reason: rejectionReason || 'Rejected by approver',
                },
              });
              setIsRejectModalOpen(false);
              setRejectRequisitionId(null);
              setIsViewModalOpen(false);
            } catch (error) {
              console.error('Error rejecting requisition:', error);
            }
          }}
          isApproving={isApprovingRequisition}
          defaultAction="rejected"
        />
      )}

      {selectedSubmission && selectedSubmission.type === 'order' && (
        <ViewPurchaseOrderModal
          open={isViewModalOpen}
          onOpenChange={setIsViewModalOpen}
          order={selectedSubmission.data as PurchaseOrder}
          onApprove={async () => {
            if (selectedSubmission.type === 'order' && selectedSubmission.uuid) {
              try {
                await updatePurchaseOrder({
                  id: selectedSubmission.uuid,
                  data: { status: 'fulfilled' },
                });
                setIsViewModalOpen(false);
              } catch (error) {
                console.error('Error approving PO:', error);
              }
            }
          }}
          onReject={async () => {
            if (selectedSubmission.type === 'order' && selectedSubmission.uuid) {
              try {
                await updatePurchaseOrder({
                  id: selectedSubmission.uuid,
                  data: { status: 'cancelled' },
                });
                setIsViewModalOpen(false);
              } catch (error) {
                console.error('Error rejecting PO:', error);
              }
            }
          }}
          canApprove={!!canApprove}
          isApproving={isUpdatingPurchaseOrder}
        />
      )}

      {selectedSubmission && selectedSubmission.type === 'rfq' && (
        <ViewRFQModal
          open={isViewModalOpen}
          onOpenChange={setIsViewModalOpen}
          rfq={selectedSubmission.data as RFQ}
          onApprove={async () => {
            if (selectedSubmission.type === 'rfq' && selectedSubmission.uuid) {
              try {
                await updateRFQ({
                  id: selectedSubmission.uuid,
                  data: { status: 'sent' },
                });
                setIsViewModalOpen(false);
              } catch (error) {
                console.error('Error approving RFQ:', error);
              }
            }
          }}
          onReject={async () => {
            if (selectedSubmission.type === 'rfq' && selectedSubmission.uuid) {
              try {
                await updateRFQ({
                  id: selectedSubmission.uuid,
                  data: { status: 'closed' },
                });
                setIsViewModalOpen(false);
              } catch (error) {
                console.error('Error rejecting RFQ:', error);
              }
            }
          }}
          canApprove={canApprove === true}
          isApproving={isUpdatingRFQ === true}
        />
      )}

      {selectedSubmission && selectedSubmission.type === 'expense' && (
        <ViewExpenseModal
          open={isViewModalOpen}
          onOpenChange={setIsViewModalOpen}
          expense={selectedSubmission.data as EmployeeExpense}
          onApprove={async () => {
            if (selectedSubmission.type === 'expense' && selectedSubmission.uuid) {
              try {
                await approveExpense({
                  id: selectedSubmission.uuid,
                  data: { status: 'approved' },
                });
                setIsViewModalOpen(false);
              } catch (error) {
                console.error('Error approving expense:', error);
              }
            }
          }}
          onReject={async () => {
            if (selectedSubmission.type === 'expense' && selectedSubmission.uuid) {
              try {
                await approveExpense({
                  id: selectedSubmission.uuid,
                  data: { status: 'rejected', rejection_reason: 'Rejected by admin' },
                });
                setIsViewModalOpen(false);
              } catch (error) {
                console.error('Error rejecting expense:', error);
              }
            }
          }}
          canApprove={canApprove === true}
          isApproving={isApprovingExpense === true}
        />
      )}

      <ApproveRequisitionModal
        open={isApproveModalOpen}
        onOpenChange={setIsApproveModalOpen}
        requisitionId={approveRequisitionId || ''}
        onApprove={async (status, rejectionReason) => {
          if (approveRequisitionId) {
            try {
              await approveRequisition({
                id: approveRequisitionId,
                data: {
                  status: status === 'approved' ? 'approved' : 'rejected',
                  rejection_reason: rejectionReason,
                },
              });
              setIsApproveModalOpen(false);
              setApproveRequisitionId(null);
            } catch (error) {
              console.error('Error approving requisition:', error);
            }
          }
        }}
      />
    </div>
  );
}

