import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/shared';
import { procurementApi } from '@/services/api/procurementApi';
import type {
  PurchaseRequisitionResponse,
  PurchaseRequisitionCreate,
  PurchaseRequisitionUpdate,
  PurchaseRequisitionListResponse,
  PurchaseOrderResponse,
  PurchaseOrderCreate,
  PurchaseOrderUpdate,
  PurchaseOrderListResponse,
  RFQResponse,
  RFQCreate,
  RFQUpdate,
  RFQListResponse,
  RFQResponseCreate,
  RFQResponseResponse,
  EmployeeExpenseResponse,
  EmployeeExpenseCreate,
  EmployeeExpenseUpdate,
  EmployeeExpenseListResponse,
  VendorInvoiceResponse,
  VendorInvoiceCreate,
  VendorInvoiceUpdate,
  VendorInvoiceListResponse,
  GRNResponse,
  GRNCreate,
  GRNUpdate,
  GRNListResponse,
  DeliveryMilestoneResponse,
  DeliveryMilestoneCreate,
  DeliveryMilestoneUpdate,
  DeliveryMilestoneListResponse,
  RequisitionApprovalRequest,
  ExpenseApprovalRequest,
    ProcurementDashboardStats,
    ProcurementBudgetCreate,
    ProcurementBudgetResponse,
    ProcurementBudgetListResponse,
} from '@/services/api/procurementApi';

const PROCUREMENT_QUERY_KEYS = {
  all: ['procurement'] as const,
  requisitions: {
    all: () => [...PROCUREMENT_QUERY_KEYS.all, 'requisitions'] as const,
    lists: () => [...PROCUREMENT_QUERY_KEYS.requisitions.all(), 'list'] as const,
    list: (params?: { page?: number; size?: number; status?: string; search?: string }) =>
      [...PROCUREMENT_QUERY_KEYS.requisitions.lists(), params] as const,
    detail: (id: string) => [...PROCUREMENT_QUERY_KEYS.requisitions.all(), 'detail', id] as const,
  },
  orders: {
    all: () => [...PROCUREMENT_QUERY_KEYS.all, 'orders'] as const,
    lists: () => [...PROCUREMENT_QUERY_KEYS.orders.all(), 'list'] as const,
    list: (params?: { page?: number; size?: number; status?: string; search?: string }) =>
      [...PROCUREMENT_QUERY_KEYS.orders.lists(), params] as const,
    detail: (id: string) => [...PROCUREMENT_QUERY_KEYS.orders.all(), 'detail', id] as const,
    milestones: (orderId: string) => [...PROCUREMENT_QUERY_KEYS.orders.detail(orderId), 'milestones'] as const,
  },
  rfqs: {
    all: () => [...PROCUREMENT_QUERY_KEYS.all, 'rfqs'] as const,
    lists: () => [...PROCUREMENT_QUERY_KEYS.rfqs.all(), 'list'] as const,
    list: (params?: { page?: number; size?: number; status?: string; search?: string }) =>
      [...PROCUREMENT_QUERY_KEYS.rfqs.lists(), params] as const,
    detail: (id: string) => [...PROCUREMENT_QUERY_KEYS.rfqs.all(), 'detail', id] as const,
    responses: (rfqId: string) => [...PROCUREMENT_QUERY_KEYS.rfqs.detail(rfqId), 'responses'] as const,
  },
  expenses: {
    all: () => [...PROCUREMENT_QUERY_KEYS.all, 'expenses'] as const,
    lists: () => [...PROCUREMENT_QUERY_KEYS.expenses.all(), 'list'] as const,
    list: (params?: { page?: number; size?: number; status?: string; search?: string }) =>
      [...PROCUREMENT_QUERY_KEYS.expenses.lists(), params] as const,
    detail: (id: string) => [...PROCUREMENT_QUERY_KEYS.expenses.all(), 'detail', id] as const,
  },
  invoices: {
    all: () => [...PROCUREMENT_QUERY_KEYS.all, 'invoices'] as const,
    lists: () => [...PROCUREMENT_QUERY_KEYS.invoices.all(), 'list'] as const,
    list: (params?: { page?: number; size?: number; status?: string; search?: string }) =>
      [...PROCUREMENT_QUERY_KEYS.invoices.lists(), params] as const,
    detail: (id: string) => [...PROCUREMENT_QUERY_KEYS.invoices.all(), 'detail', id] as const,
  },
  grns: {
    all: () => [...PROCUREMENT_QUERY_KEYS.all, 'grns'] as const,
    lists: () => [...PROCUREMENT_QUERY_KEYS.grns.all(), 'list'] as const,
    list: (params?: { page?: number; size?: number; po_id?: string }) =>
      [...PROCUREMENT_QUERY_KEYS.grns.lists(), params] as const,
    detail: (id: string) => [...PROCUREMENT_QUERY_KEYS.grns.all(), 'detail', id] as const,
  },
  dashboard: {
    stats: () => [...PROCUREMENT_QUERY_KEYS.all, 'dashboard', 'stats'] as const,
  },
};

/**
 * Unified Procurement hook following Development.md patterns
 * Encapsulates all CRUD operations and cache management for the Procurement feature
 */
export function useProcurement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // ========== Purchase Requisitions ==========
  const useRequisitions = (params?: { page?: number; size?: number; status?: string; search?: string }) => {
    return useQuery({
      queryKey: PROCUREMENT_QUERY_KEYS.requisitions.list(params),
      queryFn: () => procurementApi.listRequisitions(params),
      staleTime: 5 * 60 * 1000,
    });
  };

  const useRequisition = (id: string | undefined, enabled: boolean = true) => {
    return useQuery({
      queryKey: PROCUREMENT_QUERY_KEYS.requisitions.detail(id || ''),
      queryFn: () => procurementApi.getRequisition(id!),
      enabled: enabled && !!id,
      staleTime: 5 * 60 * 1000,
    });
  };

  const createRequisitionMutation = useMutation({
    mutationFn: (data: PurchaseRequisitionCreate) => procurementApi.createRequisition(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.requisitions.lists() });
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.dashboard.stats() });
      toast.success('Purchase requisition created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create requisition');
    },
  });

  const updateRequisitionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PurchaseRequisitionUpdate }) =>
      procurementApi.updateRequisition(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.requisitions.detail(id) });
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.requisitions.lists() });
      toast.success('Requisition updated successfully');
    },
    onError: (error: any) => {
      let errorMessage = 'Failed to update requisition';
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail
            .map((err: any) => `${err.loc?.join('.')}: ${err.msg}`)
            .join(', ');
        } else {
          errorMessage = error.response.data.detail;
        }
      }
      toast.error(errorMessage);
    },
  });

  const approveRequisitionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: RequisitionApprovalRequest }) =>
      procurementApi.approveRequisition(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.requisitions.detail(id) });
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.requisitions.lists() });
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.dashboard.stats() });
      toast.success('Requisition approval processed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to process approval');
    },
  });

  const deleteRequisitionMutation = useMutation({
    mutationFn: (id: string) => procurementApi.deleteRequisition(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.requisitions.lists() });
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.dashboard.stats() });
      toast.success('Requisition deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete requisition');
    },
  });

  // ========== Purchase Orders ==========
  const usePurchaseOrders = (params?: { page?: number; size?: number; status?: string; search?: string }) => {
    return useQuery({
      queryKey: PROCUREMENT_QUERY_KEYS.orders.list(params),
      queryFn: () => procurementApi.listPurchaseOrders(params),
      staleTime: 5 * 60 * 1000,
    });
  };

  const usePurchaseOrder = (id: string | undefined, enabled: boolean = true) => {
    return useQuery({
      queryKey: PROCUREMENT_QUERY_KEYS.orders.detail(id || ''),
      queryFn: () => procurementApi.getPurchaseOrder(id!),
      enabled: enabled && !!id,
      staleTime: 5 * 60 * 1000,
    });
  };

  const createPurchaseOrderMutation = useMutation({
    mutationFn: (data: PurchaseOrderCreate) => procurementApi.createPurchaseOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.orders.lists() });
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.dashboard.stats() });
      toast.success('Purchase order created successfully');
    },
    onError: (error: any) => {
      const errorDetail = error.response?.data?.detail;
      let errorMessage = 'Failed to create purchase order';
      
      if (Array.isArray(errorDetail)) {
        // Handle validation errors
        errorMessage = errorDetail.map((err: any) => {
          const field = err.loc?.join('.') || 'field';
          return `${field}: ${err.msg}`;
        }).join(', ');
      } else if (typeof errorDetail === 'string') {
        errorMessage = errorDetail;
      } else if (typeof errorDetail === 'object' && errorDetail !== null) {
        errorMessage = JSON.stringify(errorDetail);
      }
      
      toast.error(errorMessage);
    },
  });

  const updatePurchaseOrderMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PurchaseOrderUpdate }) =>
      procurementApi.updatePurchaseOrder(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.orders.detail(id) });
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.orders.lists() });
      toast.success('Purchase order updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update purchase order');
    },
  });

  const deletePurchaseOrderMutation = useMutation({
    mutationFn: (id: string) => procurementApi.deletePurchaseOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.orders.lists() });
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.dashboard.stats() });
      toast.success('Purchase order deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete purchase order');
    },
  });

  // ========== RFQs ==========
  const useRFQs = (params?: { page?: number; size?: number; status?: string; search?: string }) => {
    return useQuery({
      queryKey: PROCUREMENT_QUERY_KEYS.rfqs.list(params),
      queryFn: () => procurementApi.listRFQs(params),
      staleTime: 5 * 60 * 1000,
    });
  };

  const useRFQ = (id: string | undefined, enabled: boolean = true) => {
    return useQuery({
      queryKey: PROCUREMENT_QUERY_KEYS.rfqs.detail(id || ''),
      queryFn: () => procurementApi.getRFQ(id!),
      enabled: enabled && !!id,
      staleTime: 5 * 60 * 1000,
    });
  };

  const useRFQResponses = (rfqId: string | undefined, enabled: boolean = true) => {
    return useQuery({
      queryKey: PROCUREMENT_QUERY_KEYS.rfqs.responses(rfqId || ''),
      queryFn: () => procurementApi.listRFQResponses(rfqId!),
      enabled: enabled && !!rfqId,
      staleTime: 5 * 60 * 1000,
    });
  };

  const createRFQMutation = useMutation({
    mutationFn: (data: RFQCreate) => procurementApi.createRFQ(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.rfqs.lists() });
      toast.success('RFQ created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create RFQ');
    },
  });

  const updateRFQMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: RFQUpdate }) => procurementApi.updateRFQ(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.rfqs.detail(id) });
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.rfqs.lists() });
      toast.success('RFQ updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update RFQ');
    },
  });

  const deleteRFQMutation = useMutation({
    mutationFn: (id: string) => procurementApi.deleteRFQ(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.rfqs.lists() });
      toast.success('RFQ deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete RFQ');
    },
  });

  const createRFQResponseMutation = useMutation({
    mutationFn: ({ rfqId, data }: { rfqId: string; data: RFQResponseCreate }) =>
      procurementApi.createRFQResponse(rfqId, data),
    onSuccess: (_, { rfqId }) => {
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.rfqs.detail(rfqId) });
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.rfqs.responses(rfqId) });
      toast.success('RFQ response submitted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to submit RFQ response');
    },
  });

  // ========== Employee Expenses ==========
  const useExpenses = (params?: { page?: number; size?: number; status?: string; search?: string }) => {
    return useQuery({
      queryKey: PROCUREMENT_QUERY_KEYS.expenses.list(params),
      queryFn: () => procurementApi.listExpenses(params),
      staleTime: 5 * 60 * 1000,
    });
  };

  const useExpense = (id: string | undefined, enabled: boolean = true) => {
    return useQuery({
      queryKey: PROCUREMENT_QUERY_KEYS.expenses.detail(id || ''),
      queryFn: () => procurementApi.getExpense(id!),
      enabled: enabled && !!id,
      staleTime: 5 * 60 * 1000,
    });
  };

  const createExpenseMutation = useMutation({
    mutationFn: (data: EmployeeExpenseCreate) => procurementApi.createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.expenses.lists() });
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.dashboard.stats() });
      toast.success('Expense created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create expense');
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EmployeeExpenseUpdate }) =>
      procurementApi.updateExpense(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.expenses.detail(id) });
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.expenses.lists() });
      toast.success('Expense updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update expense');
    },
  });

  const approveExpenseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExpenseApprovalRequest }) =>
      procurementApi.approveExpense(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.expenses.detail(id) });
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.expenses.lists() });
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.dashboard.stats() });
      toast.success('Expense approval processed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to process approval');
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (id: string) => procurementApi.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.expenses.lists() });
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.dashboard.stats() });
      toast.success('Expense deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete expense');
    },
  });

  // ========== Vendor Invoices ==========
  const useInvoices = (params?: { page?: number; size?: number; status?: string; search?: string }) => {
    return useQuery({
      queryKey: PROCUREMENT_QUERY_KEYS.invoices.list(params),
      queryFn: () => procurementApi.listInvoices(params),
      staleTime: 5 * 60 * 1000,
    });
  };

  const useInvoice = (id: string | undefined, enabled: boolean = true) => {
    return useQuery({
      queryKey: PROCUREMENT_QUERY_KEYS.invoices.detail(id || ''),
      queryFn: () => procurementApi.getInvoice(id!),
      enabled: enabled && !!id,
      staleTime: 5 * 60 * 1000,
    });
  };

  const createInvoiceMutation = useMutation({
    mutationFn: (data: VendorInvoiceCreate) => procurementApi.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.invoices.lists() });
      toast.success('Invoice created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create invoice');
    },
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: VendorInvoiceUpdate }) =>
      procurementApi.updateInvoice(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.invoices.detail(id) });
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.invoices.lists() });
      toast.success('Invoice updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update invoice');
    },
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: (id: string) => procurementApi.deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.invoices.lists() });
      toast.success('Invoice deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete invoice');
    },
  });

  // ========== GRNs ==========
  const useGRNs = (params?: { page?: number; size?: number; po_id?: string }) => {
    return useQuery({
      queryKey: PROCUREMENT_QUERY_KEYS.grns.list(params),
      queryFn: () => procurementApi.listGRNs(params),
      staleTime: 5 * 60 * 1000,
    });
  };

  const useGRN = (id: string | undefined, enabled: boolean = true) => {
    return useQuery({
      queryKey: PROCUREMENT_QUERY_KEYS.grns.detail(id || ''),
      queryFn: () => procurementApi.getGRN(id!),
      enabled: enabled && !!id,
      staleTime: 5 * 60 * 1000,
    });
  };

  const createGRNMutation = useMutation({
    mutationFn: (data: GRNCreate) => procurementApi.createGRN(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.grns.lists() });
      toast.success('GRN created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create GRN');
    },
  });

  const updateGRNMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: GRNUpdate }) => procurementApi.updateGRN(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.grns.detail(id) });
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.grns.lists() });
      toast.success('GRN updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update GRN');
    },
  });

  const deleteGRNMutation = useMutation({
    mutationFn: (id: string) => procurementApi.deleteGRN(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.grns.lists() });
      toast.success('GRN deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete GRN');
    },
  });

  // ========== Delivery Milestones ==========
  const useMilestones = (orderId: string | undefined, enabled: boolean = true) => {
    return useQuery({
      queryKey: PROCUREMENT_QUERY_KEYS.orders.milestones(orderId || ''),
      queryFn: () => procurementApi.listMilestones(orderId!),
      enabled: enabled && !!orderId,
      staleTime: 5 * 60 * 1000,
    });
  };

  const createMilestoneMutation = useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: DeliveryMilestoneCreate }) =>
      procurementApi.createMilestone(orderId, data),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.orders.milestones(orderId) });
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.orders.detail(orderId) });
      toast.success('Milestone created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create milestone');
    },
  });

  const updateMilestoneMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DeliveryMilestoneUpdate }) =>
      procurementApi.updateMilestone(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.orders.lists() });
      toast.success('Milestone updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update milestone');
    },
  });

  const deleteMilestoneMutation = useMutation({
    mutationFn: (id: string) => procurementApi.deleteMilestone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.orders.lists() });
      toast.success('Milestone deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete milestone');
    },
  });

  // ========== Dashboard ==========
  const useDashboardStats = () => {
    return useQuery({
      queryKey: PROCUREMENT_QUERY_KEYS.dashboard.stats(),
      queryFn: () => procurementApi.getDashboardStats(),
      staleTime: 2 * 60 * 1000, // 2 minutes for dashboard stats
    });
  };

  // ========== Procurement Budgets ==========
  const useBudgets = (params?: { page?: number; size?: number; budget_year?: string; status?: string }) => {
    return useQuery({
      queryKey: [...PROCUREMENT_QUERY_KEYS.all, 'budgets', 'list', params] as const,
      queryFn: () => procurementApi.listBudgets(params),
      staleTime: 5 * 60 * 1000,
    });
  };

  const useBudget = (id: string | undefined, enabled: boolean = true) => {
    return useQuery({
      queryKey: [...PROCUREMENT_QUERY_KEYS.all, 'budgets', 'detail', id || ''] as const,
      queryFn: () => procurementApi.getBudget(id!),
      enabled: enabled && !!id,
      staleTime: 5 * 60 * 1000,
    });
  };

  const createBudgetMutation = useMutation({
    mutationFn: (data: ProcurementBudgetCreate) => procurementApi.createBudget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PROCUREMENT_QUERY_KEYS.all, 'budgets'] });
      toast.success('Budget created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create budget');
    },
  });

  const extractReceipt = useMutation({
    mutationFn: (file: File) => procurementApi.extractReceiptData(file),
  });

  return {
    // Requisitions
    useRequisitions,
    useRequisition,
    createRequisition: createRequisitionMutation.mutateAsync,
    updateRequisition: updateRequisitionMutation.mutateAsync,
    approveRequisition: approveRequisitionMutation.mutateAsync,
    deleteRequisition: deleteRequisitionMutation.mutateAsync,
    isCreatingRequisition: createRequisitionMutation.isPending,
    isUpdatingRequisition: updateRequisitionMutation.isPending,
    isApprovingRequisition: approveRequisitionMutation.isPending,
    isDeletingRequisition: deleteRequisitionMutation.isPending,

    // Purchase Orders
    usePurchaseOrders,
    usePurchaseOrder,
    createPurchaseOrder: createPurchaseOrderMutation.mutateAsync,
    updatePurchaseOrder: updatePurchaseOrderMutation.mutateAsync,
    deletePurchaseOrder: deletePurchaseOrderMutation.mutateAsync,
    isCreatingPurchaseOrder: createPurchaseOrderMutation.isPending,
    isUpdatingPurchaseOrder: updatePurchaseOrderMutation.isPending,
    isDeletingPurchaseOrder: deletePurchaseOrderMutation.isPending,

    // RFQs
    useRFQs,
    useRFQ,
    useRFQResponses,
    createRFQ: createRFQMutation.mutateAsync,
    updateRFQ: updateRFQMutation.mutateAsync,
    deleteRFQ: deleteRFQMutation.mutateAsync,
    createRFQResponse: createRFQResponseMutation.mutateAsync,
    isCreatingRFQ: createRFQMutation.isPending,
    isUpdatingRFQ: updateRFQMutation.isPending,
    isDeletingRFQ: deleteRFQMutation.isPending,
    isCreatingRFQResponse: createRFQResponseMutation.isPending,

    // Expenses
    useExpenses,
    useExpense,
    createExpense: createExpenseMutation.mutateAsync,
    updateExpense: updateExpenseMutation.mutateAsync,
    approveExpense: approveExpenseMutation.mutateAsync,
    deleteExpense: deleteExpenseMutation.mutateAsync,
    isCreatingExpense: createExpenseMutation.isPending,
    isUpdatingExpense: updateExpenseMutation.isPending,
    isApprovingExpense: approveExpenseMutation.isPending,
    isDeletingExpense: deleteExpenseMutation.isPending,

    // Receipt OCR
    extractReceipt: extractReceipt.mutateAsync,

    // Invoices
    useInvoices,
    useInvoice,
    createInvoice: createInvoiceMutation.mutateAsync,
    updateInvoice: updateInvoiceMutation.mutateAsync,
    deleteInvoice: deleteInvoiceMutation.mutateAsync,
    isCreatingInvoice: createInvoiceMutation.isPending,
    isUpdatingInvoice: updateInvoiceMutation.isPending,
    isDeletingInvoice: deleteInvoiceMutation.isPending,

    // GRNs
    useGRNs,
    useGRN,
    createGRN: createGRNMutation.mutateAsync,
    updateGRN: updateGRNMutation.mutateAsync,
    deleteGRN: deleteGRNMutation.mutateAsync,
    isCreatingGRN: createGRNMutation.isPending,
    isUpdatingGRN: updateGRNMutation.isPending,
    isDeletingGRN: deleteGRNMutation.isPending,

    // Milestones
    useMilestones,
    createMilestone: createMilestoneMutation.mutateAsync,
    updateMilestone: updateMilestoneMutation.mutateAsync,
    deleteMilestone: deleteMilestoneMutation.mutateAsync,
    isCreatingMilestone: createMilestoneMutation.isPending,
    isUpdatingMilestone: updateMilestoneMutation.isPending,
    isDeletingMilestone: deleteMilestoneMutation.isPending,

    // Dashboard
    useDashboardStats,

    // Budgets
    useBudgets,
    useBudget,
    createBudget: createBudgetMutation.mutateAsync,
    isCreatingBudget: createBudgetMutation.isPending,
  };
}

