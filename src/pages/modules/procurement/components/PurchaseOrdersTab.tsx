import { useState } from 'react';
import { Plus, Search, Filter, Eye, Download, Trash2, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PurchaseOrder } from '../types';
import { getStatusBadge } from '../utils';
import { CreatePurchaseOrderModal, ViewPurchaseOrderModal } from '../modals';
import { useProcurement } from '@/hooks/procurement';
import { useProcurementVendors } from '@/hooks/procurement';
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

interface PurchaseOrdersTabProps {
  orders: PurchaseOrder[];
  isLoading?: boolean;
}

export function PurchaseOrdersTab({ orders, isLoading = false }: PurchaseOrdersTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState<PurchaseOrder | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { createPurchaseOrder, deletePurchaseOrder, isCreatingPurchaseOrder, isDeletingPurchaseOrder } = useProcurement();
  const { useVendorsList } = useProcurementVendors();
  const { data: vendorsData } = useVendorsList(0, 1000);

  const filteredOrders = orders.filter((po) => {
    const matchesSearch = po.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || po.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end pb-2">
        <div>
          <h2 className="text-xl font-semibold text-[#1A1A1A] font-outfit mb-1">Purchase Orders</h2>
          <p className="text-xs text-gray-600 font-outfit">Formal orders issued to vendors after requisition approval</p>
        </div>
        <Button
          className="bg-[#161950] hover:bg-[#1E2B5B] text-white font-outfit h-11 px-6"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Purchase Order
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search purchase orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white rounded-lg border border-gray-200 focus:border-[#161950] focus:ring-2 focus:ring-[#161950]/20 font-outfit"
          />
        </div>
        <Button variant="outline" className="h-12 px-5 border border-gray-200 font-outfit">
          <Filter className="w-5 h-5 text-gray-600 mr-2" />
          <span className="font-outfit">Filter</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#161950]" />
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)] font-outfit">
          <div className="mb-4 pb-3 border-b border-gray-100">
            <h3 className="text-base font-semibold text-[#1A1A1A] font-outfit mb-1">Purchase Orders</h3>
            <p className="text-xs text-gray-600 font-outfit">Formal purchase orders issued to vendors</p>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full text-sm font-outfit">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">PO Number</th>
                <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Vendor</th>
                <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Description</th>
                <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Amount</th>
                <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Issue Date</th>
                <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Due Date</th>
                <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Status</th>
                <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 px-4 text-center text-gray-500 font-outfit">
                    No purchase orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((po) => {
                  const statusBadge = getStatusBadge(po.status);
                  return (
                    <tr key={po.id} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium text-[#1A1A1A] font-outfit mb-0.5">{po.id}</div>
                        {po.projectCode && (
                          <div className="text-xs text-gray-500 font-outfit">{po.projectCode}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-[#1A1A1A] font-outfit">{po.vendor}</td>
                      <td className="py-3 px-4 text-sm text-gray-700 font-outfit">{po.description}</td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-semibold text-[#1A1A1A] font-outfit">${po.amount.toFixed(2)}</span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700 font-outfit">{po.issueDate}</td>
                      <td className="py-3 px-4 text-sm text-gray-700 font-outfit">{po.dueDate}</td>
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
                              setViewOrder(po);
                              setIsViewModalOpen(true);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="outline" className="border-gray-200 hover:bg-gray-50 font-outfit h-8 w-8 p-0">
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-rose-200 hover:bg-rose-50 hover:border-rose-300 font-outfit h-8 w-8 p-0"
                            onClick={() => {
                              setDeleteOrderId(po.id);
                              setIsDeleteDialogOpen(true);
                            }}
                            disabled={isDeletingPurchaseOrder}
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
      <CreatePurchaseOrderModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={async (data) => {
          try {
            // Find vendor name from vendor ID
            const selectedVendor = vendorsData?.vendors?.find(v => v.id === data.vendor);
            
            // Validate UUID format for requisition_id
            const isValidUUID = (str: string | undefined): boolean => {
              if (!str) return false;
              const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
              return uuidRegex.test(str);
            };
            
            // Only include requisition_id if it's a valid UUID
            const requisitionId = data.requisitionId && isValidUUID(data.requisitionId) 
              ? data.requisitionId 
              : undefined;
            
            await createPurchaseOrder({
              requisition_id: requisitionId,
              vendor_id: data.vendor || undefined,
              vendor_name: selectedVendor?.vendor_name || 'Unknown Vendor',
              description: data.description,
              amount: data.amount,
              project_code: data.projectCode || undefined,
              issue_date: new Date().toISOString(),
              due_date: data.dueDate || undefined,
              expected_delivery_date: data.neededBy || undefined,
              terms_and_conditions: undefined,
              notes: data.justification || undefined,
            });
            setIsModalOpen(false);
          } catch (error: any) {
            console.error('Error creating purchase order:', error);
            const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to create purchase order';
            if (Array.isArray(errorMessage)) {
              // Handle validation errors
              const validationErrors = errorMessage.map((err: any) => `${err.loc?.join('.')}: ${err.msg}`).join(', ');
              alert(`Validation errors: ${validationErrors}`);
            } else if (typeof errorMessage === 'object') {
              // Handle object error
              alert(`Error: ${JSON.stringify(errorMessage)}`);
            } else {
              alert(`Error: ${errorMessage}`);
            }
          }
        }}
      />
      <ViewPurchaseOrderModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        order={viewOrder}
      />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="font-outfit">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Purchase Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete purchase order {deleteOrderId}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingPurchaseOrder}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deleteOrderId) {
                  try {
                    await deletePurchaseOrder(deleteOrderId);
                    setIsDeleteDialogOpen(false);
                    setDeleteOrderId(null);
                  } catch (error) {
                    console.error('Error deleting purchase order:', error);
                  }
                }
              }}
              disabled={isDeletingPurchaseOrder}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {isDeletingPurchaseOrder ? (
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

