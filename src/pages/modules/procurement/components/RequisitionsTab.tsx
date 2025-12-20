import { useState, useMemo } from 'react';
import { Plus, Search, Filter, Eye, CheckCircle, Trash2, Loader2, Edit, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { PurchaseRequisition } from '../types';
import { getStatusBadge } from '../utils';
import { CreatePurchaseRequestModal, ViewRequisitionModal, ApproveRequisitionModal } from '../modals';
import { useProcurement } from '@/hooks/procurement';
import { useAuth } from '@/hooks/auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface RequisitionsTabProps {
  requisitions: PurchaseRequisition[];
  isLoading?: boolean;
}

export function RequisitionsTab({ requisitions, isLoading = false }: RequisitionsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewRequisition, setViewRequisition] = useState<PurchaseRequisition | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [deleteRequisitionId, setDeleteRequisitionId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [approveRequisitionId, setApproveRequisitionId] = useState<string | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [editRequisition, setEditRequisition] = useState<PurchaseRequisition | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { authState } = useAuth();
  const { 
    createRequisition, 
    deleteRequisition, 
    isCreatingRequisition, 
    isDeletingRequisition,
    approveRequisition,
    isApprovingRequisition,
    updateRequisition,
    isUpdatingRequisition,
  } = useProcurement();

  const canApprove = useMemo(() => {
    const role = authState.user?.role?.toLowerCase();
    return role === 'admin' || role === 'manager' || role === 'vendor';
  }, [authState.user?.role]);

  const filteredRequisitions = requisitions.filter((req) => {
    const matchesSearch = req.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end pb-2">
        <div>
          <h2 className="text-xl font-semibold text-[#1A1A1A] font-outfit mb-1">Purchase Requisitions</h2>
          <p className="text-xs text-gray-600 font-outfit">Internal purchase requests requiring approval before creating purchase orders</p>
        </div>
        <Button
          className="bg-[#161950] hover:bg-[#1E2B5B] text-white font-outfit h-11 px-6"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Purchase Request
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search requisitions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white rounded-lg border border-gray-200 focus:border-[#161950] focus:ring-2 focus:ring-[#161950]/20 font-outfit"
          />
        </div>
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-12 px-5 border border-gray-200 font-outfit">
              <Filter className="w-5 h-5 text-gray-600 mr-2" />
              <span className="font-outfit">Filter</span>
              {filterStatus !== 'all' && (
                <Badge className="ml-2 bg-[#161950] text-white font-outfit">{filterStatus}</Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 font-outfit" align="end">
            <div className="space-y-2">
              <div className="text-sm font-semibold text-[#1A1A1A] font-outfit mb-2">Filter by Status</div>
              <Select value={filterStatus} onValueChange={(value) => {
                setFilterStatus(value);
                setIsFilterOpen(false);
              }}>
                <SelectTrigger className="font-outfit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="po-created">PO Created</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#161950]" />
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)] font-outfit">
          <div className="mb-4 pb-3 border-b border-gray-100">
            <h3 className="text-base font-semibold text-[#1A1A1A] font-outfit mb-1">Purchase Requisitions</h3>
            <p className="text-xs text-gray-600 font-outfit">Formal requests for company purchases requiring approval</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-outfit">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Request ID</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Requested By</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Description</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Est. Cost</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Vendor</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Status</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequisitions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 px-4 text-center text-gray-500 font-outfit">
                      No requisitions found
                    </td>
                  </tr>
                ) : (
                  filteredRequisitions.map((req, index) => {
                    const statusBadge = getStatusBadge(req.status);
                    // Debug: Log first requisition to check uuid
                    if (index === 0) {
                      console.log('First requisition data:', { id: req.id, uuid: req.uuid, status: req.status });
                    }
                    return (
                      <tr key={req.id} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="text-sm font-medium text-[#1A1A1A] font-outfit mb-0.5">{req.id}</div>
                          <div className="text-xs text-gray-500 font-outfit">{req.requestDate}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm font-medium text-[#1A1A1A] font-outfit mb-0.5">{req.requestedBy}</div>
                          <div className="text-xs text-gray-500 font-outfit">{req.department}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="max-w-xs text-sm font-medium text-[#1A1A1A] font-outfit mb-0.5">{req.description}</div>
                          {req.projectCode && (
                            <Badge variant="outline" className="mt-1 text-xs border-gray-200 font-outfit">
                              {req.projectCode}
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-semibold text-[#1A1A1A] font-outfit">${req.estimatedCost.toFixed(2)}</span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700 font-outfit">{req.vendor}</td>
                        <td className="py-3 px-4">
                          <Badge className={`${statusBadge.className} font-outfit text-xs`}>{statusBadge.label}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-gray-200 hover:bg-gray-50 font-outfit h-8 w-8 p-0"
                              onClick={() => {
                                setViewRequisition(req);
                                setIsViewModalOpen(true);
                              }}
                              title="View"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            {req.status === 'draft' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-blue-200 hover:bg-blue-50 hover:border-blue-300 font-outfit h-8 w-8 p-0"
                                  onClick={() => {
                                    setEditRequisition(req);
                                    setIsEditModalOpen(true);
                                  }}
                                  disabled={isUpdatingRequisition}
                                  title="Edit"
                                >
                                  <Edit className="h-3.5 w-3.5 text-blue-600" />
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-[#161950] hover:bg-[#1E2B5B] font-outfit h-8 px-3"
                                  onClick={async () => {
                                    try {
                                      // req.uuid should always be set from ProcurementPage.tsx
                                      // If it's not, fallback to checking if id is a UUID
                                      let requisitionUuid = req.uuid;
                                      if (!requisitionUuid) {
                                        // Check if id is already a UUID (fallback for old data)
                                        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                                        if (req.id && uuidRegex.test(req.id)) {
                                          requisitionUuid = req.id;
                                        } else {
                                          console.error('Requisition UUID is missing. req:', req);
                                          alert('Error: Cannot find requisition UUID. Please refresh the page.');
                                          return;
                                        }
                                      }
                                      await updateRequisition({ id: requisitionUuid, data: { status: 'pending' } });
                                    } catch (error) {
                                      console.error('Error submitting requisition:', error);
                                    }
                                  }}
                                  disabled={isUpdatingRequisition}
                                  title="Submit for Approval"
                                >
                                  <span className="text-xs font-outfit">Submit</span>
                                </Button>
                              </>
                            )}
                            {req.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-blue-200 hover:bg-blue-50 hover:border-blue-300 font-outfit h-8 w-8 p-0"
                                onClick={() => {
                                  setEditRequisition(req);
                                  setIsEditModalOpen(true);
                                }}
                                disabled={isUpdatingRequisition}
                                title="Edit"
                              >
                                <Edit className="h-3.5 w-3.5 text-blue-600" />
                              </Button>
                            )}
                            {req.status === 'pending' && canApprove && (
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 font-outfit h-8 w-8 p-0"
                                onClick={() => {
                                  const requisitionUuid = req.uuid || req.id;
                                  setApproveRequisitionId(requisitionUuid);
                                  setIsApproveModalOpen(true);
                                }}
                                disabled={isApprovingRequisition}
                                title="Approve/Reject"
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-rose-200 hover:bg-rose-50 hover:border-rose-300 font-outfit h-8 w-8 p-0"
                              onClick={() => {
                                const requisitionUuid = req.uuid || req.id;
                                setDeleteRequisitionId(requisitionUuid);
                                setIsDeleteDialogOpen(true);
                              }}
                              disabled={isDeletingRequisition}
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <CreatePurchaseRequestModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={async (data) => {
          try {
            await createRequisition({
              purchase_type: data.purchaseType === 'project' ? 'project' : 'overhead',
              description: data.description,
              category: data.category,
              estimated_cost: data.estimatedCost,
              vendor: data.vendor,
              justification: data.justification,
              department: data.department,
              project_code: data.projectCode,
              urgency: data.urgency || 'medium',
              needed_by: data.neededBy,
            });
            setIsModalOpen(false);
          } catch (error) {
            console.error('Error creating requisition:', error);
          }
        }}
      />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="font-outfit">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Requisition</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete requisition {deleteRequisitionId}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingRequisition}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deleteRequisitionId) {
                  try {
                    await deleteRequisition(deleteRequisitionId);
                    setIsDeleteDialogOpen(false);
                    setDeleteRequisitionId(null);
                  } catch (error) {
                    console.error('Error deleting requisition:', error);
                  }
                }
              }}
              disabled={isDeletingRequisition}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {isDeletingRequisition ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <ViewRequisitionModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        requisition={viewRequisition}
      />
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
        isApproving={isApprovingRequisition}
      />
    </div>
  );
}

