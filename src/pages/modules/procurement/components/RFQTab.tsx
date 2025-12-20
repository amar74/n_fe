import { useState } from 'react';
import { Plus, Search, Filter, Eye, FileText, CheckCircle, Clock, Award, XCircle, Loader2, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RFQ, PurchaseRequisition } from '../types';
import { CreateRFQModal, ViewRFQModal } from '../modals';
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

interface RFQTabProps {
  rfqs: RFQ[];
  isLoading?: boolean;
  requisitions?: PurchaseRequisition[];
}

export function RFQTab({ rfqs, isLoading = false, requisitions = [] }: RFQTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewRFQ, setViewRFQ] = useState<RFQ | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [deleteRFQId, setDeleteRFQId] = useState<string | null>(null);
  const [deleteRFQDisplayId, setDeleteRFQDisplayId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { createRFQ, deleteRFQ, updateRFQ, isCreatingRFQ, isDeletingRFQ, isUpdatingRFQ } = useProcurement();
  const { authState } = useAuth();
  const currentUserRole = authState.user?.role;
  const isOrgOwner = authState.user?.is_org_owner;
  const canApprove = currentUserRole === 'admin' || currentUserRole === 'manager' || currentUserRole === 'vendor' || isOrgOwner;

  const filteredRFQs = rfqs.filter((rfq) => {
    const matchesSearch = rfq.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfq.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || rfq.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end pb-2">
        <div>
          <h2 className="text-xl font-semibold text-[#1A1A1A] font-outfit mb-1">Request for Quotation (RFQ)</h2>
          <p className="text-xs text-gray-600 font-outfit">Manage RFQ process, invite vendors, and evaluate responses</p>
        </div>
        <Button
          className="bg-[#161950] hover:bg-[#1E2B5B] text-white font-outfit h-11 px-6"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create RFQ
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search RFQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 font-outfit"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48 font-outfit">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="responses-received">Responses Received</SelectItem>
            <SelectItem value="evaluating">Evaluating</SelectItem>
            <SelectItem value="awarded">Awarded</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)] font-outfit">
        {filteredRFQs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-outfit">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">RFQ ID</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Title</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Category</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Estimated Value</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Responses</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Due Date</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Status</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRFQs.map((rfq) => {
                  const statusBadge = getStatusBadge(rfq.status);
                  return (
                    <tr key={rfq.id} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-medium text-[#1A1A1A] text-sm font-outfit">{rfq.id}</div>
                        <div className="text-xs text-gray-500 font-outfit mt-1">Req: {rfq.requisitionId}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-[#1A1A1A] text-sm font-outfit mb-1">{rfq.title}</div>
                        <div className="text-xs text-gray-600 font-outfit line-clamp-2">{rfq.description}</div>
                      </td>
                      <td className="py-4 px-6 text-gray-700 font-outfit">{rfq.category}</td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-[#1A1A1A] font-outfit">${rfq.estimatedValue.toLocaleString()}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#1A1A1A] font-outfit">{rfq.responsesReceived}</span>
                          <span className="text-xs text-gray-500 font-outfit">/ {rfq.vendorsInvited}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-700 font-outfit">{rfq.dueDate}</td>
                      <td className="py-4 px-6">
                        <Badge className={`${statusBadge.className} font-outfit text-xs`}>{statusBadge.label}</Badge>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-gray-200 hover:bg-gray-50 hover:border-[#161950]/30 font-outfit h-8 w-8 p-0"
                            onClick={() => {
                              setViewRFQ(rfq);
                              setIsViewModalOpen(true);
                            }}
                            title="View RFQ"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          {rfq.status === 'draft' && canApprove && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 font-outfit h-8 w-8 p-0"
                              onClick={async () => {
                                try {
                                  await updateRFQ({
                                    id: rfq.uuid,
                                    data: { status: 'sent' },
                                  });
                                } catch (error) {
                                  console.error('Error approving RFQ:', error);
                                }
                              }}
                              disabled={isUpdatingRFQ}
                              title="Approve & Send RFQ"
                            >
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-rose-200 hover:bg-rose-50 hover:border-rose-300 font-outfit h-8 w-8 p-0"
                            onClick={() => {
                              setDeleteRFQId(rfq.uuid);
                              setDeleteRFQDisplayId(rfq.id);
                              setIsDeleteDialogOpen(true);
                            }}
                            disabled={isDeletingRFQ}
                            title="Delete RFQ"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 px-4 text-center text-gray-500 font-outfit">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="font-outfit">No RFQs found</p>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#161950]" />
        </div>
      )}

      <CreateRFQModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        requisitions={requisitions}
        onSubmit={async (data) => {
          try {
            await createRFQ({
              requisition_id: data.requisitionId || undefined,
              title: data.title,
              description: data.description,
              category: data.category,
              estimated_value: data.estimatedValue,
              due_date: data.dueDate,
            });
            setIsModalOpen(false);
          } catch (error) {
            console.error('Error creating RFQ:', error);
          }
        }}
      />
      <ViewRFQModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        rfq={viewRFQ}
      />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="font-outfit">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete RFQ</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete RFQ {deleteRFQDisplayId || deleteRFQId}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingRFQ}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deleteRFQId) {
                  try {
                    await deleteRFQ(deleteRFQId);
                    setIsDeleteDialogOpen(false);
                    setDeleteRFQId(null);
                    setDeleteRFQDisplayId(null);
                  } catch (error) {
                    console.error('Error deleting RFQ:', error);
                  }
                }
              }}
              disabled={isDeletingRFQ}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {isDeletingRFQ ? (
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
    </div>
  );
}

