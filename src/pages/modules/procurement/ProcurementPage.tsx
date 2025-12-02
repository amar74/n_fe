import { memo, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  BarChart3,
  Receipt,
  Building2,
  PieChart,
  Clock,
  FileText,
  FileCheck,
  FileSearch,
  TrendingUp,
  Target,
  ClipboardList,
  Eye,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useProcurementVendors } from '@/hooks/useProcurementVendors';
import { useProcurement } from '@/hooks/useProcurement';
import { useAuth } from '@/hooks/useAuth';
import type { ProcurementVendorListResponse } from '@/hooks/useProcurementVendors';
import {
  DashboardTab,
  RequisitionsTab,
  PurchaseOrdersTab,
  VendorsTab,
  ExpensesTab,
  InvoicesTab,
  BudgetTab,
  RFQTab,
} from './components';
import type {
  PurchaseRequisitionResponse,
  PurchaseOrderResponse,
  EmployeeExpenseResponse,
  VendorInvoiceResponse,
  RFQResponse,
} from '@/services/api/procurementApi';

function ProcurementPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const { stats, isStatsLoading, useVendorsList } = useProcurementVendors();
  const { data: vendorsData, isLoading: isLoadingVendors } = useVendorsList(0, 100) as { data: ProcurementVendorListResponse | undefined; isLoading: boolean };

  const {
    useRequisitions,
    usePurchaseOrders,
    useExpenses,
    useInvoices,
    useRFQs,
    useDashboardStats,
    useBudgets,
    createRequisition,
  } = useProcurement();

  const { data: requisitionsData, isLoading: isLoadingRequisitions } = useRequisitions({ page: 1, size: 100 });
  const { data: ordersData, isLoading: isLoadingOrders } = usePurchaseOrders({ page: 1, size: 100 });
  const { data: expensesData, isLoading: isLoadingExpenses } = useExpenses({ page: 1, size: 100 });
  const { data: invoicesData, isLoading: isLoadingInvoices } = useInvoices({ page: 1, size: 100 });
  const { data: rfqsData, isLoading: isLoadingRFQs } = useRFQs({ page: 1, size: 100 });
  const { data: dashboardStats, isLoading: isLoadingStats } = useDashboardStats();
  const { data: budgetsData, isLoading: isLoadingBudgets } = useBudgets({ page: 1, size: 100 });

  const { authState } = useAuth();
  const currentUserId = authState.user?.id;
  
  // Helper function to extract name from email (e.g., "amar12@softication.com" -> "amar 12")
  const extractNameFromEmail = (email: string): string => {
    if (!email) return 'Unknown User';
    const username = email.split('@')[0];
    // Convert camelCase or numbers to readable format (e.g., "amar12" -> "amar 12")
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

  const purchaseRequisitions = useMemo(() => {
    if (!requisitionsData?.requisitions) return [];
    return requisitionsData.requisitions.map((req: PurchaseRequisitionResponse) => {
      // Use backend-provided name if available, otherwise fallback to current user name or 'User'
      const requestedByName = (req as any).requested_by_name || 
        (req.requested_by === currentUserId ? currentUserName : 'User');
      
      return {
        id: req.custom_id || req.id, // Display ID
        uuid: req.id, // Actual UUID for API calls
        requestedBy: requestedByName,
        description: req.description,
        estimatedCost: Number(req.estimated_cost),
        vendor: req.vendor || '',
        justification: req.justification,
        status: req.status as 'draft' | 'pending' | 'approved' | 'po-created' | 'rejected',
        requestDate: new Date(req.created_at).toISOString().split('T')[0],
        department: req.department,
        projectCode: req.project_code || undefined,
      };
    });
  }, [requisitionsData, currentUserId, currentUserName]);

  const purchaseOrders = useMemo(() => {
    if (!ordersData?.orders) return [];
    return ordersData.orders.map((order: PurchaseOrderResponse) => ({
      id: order.custom_id || order.id,
      vendor: order.vendor_name,
      amount: Number(order.amount),
      description: order.description,
      status: order.status as 'issued' | 'partially-fulfilled' | 'fulfilled' | 'invoiced' | 'paid',
      issueDate: new Date(order.issue_date).toISOString().split('T')[0],
      dueDate: order.due_date ? new Date(order.due_date).toISOString().split('T')[0] : '',
      projectCode: order.project_code || undefined,
      requisitionId: order.requisition_id || '',
    }));
  }, [ordersData]);

  const employeeExpenses = useMemo(() => {
    if (!expensesData?.expenses) return [];
    return expensesData.expenses.map((exp: EmployeeExpenseResponse) => ({
      id: exp.custom_id || exp.id,
      employeeName: (exp as any).employee_name || exp.employee_id,
      date: new Date(exp.expense_date).toISOString().split('T')[0],
      amount: Number(exp.amount),
      category: exp.category,
      description: exp.description,
      projectCode: exp.project_code || undefined,
      status: exp.status as 'draft' | 'pending' | 'approved' | 'rejected' | 'reimbursed',
      receiptUrl: exp.receipt_url || undefined,
      submittedDate: new Date(exp.created_at).toISOString().split('T')[0],
      approvedBy: exp.approved_by || undefined,
      rejectReason: exp.rejected_reason || undefined,
    }));
  }, [expensesData]);

  const vendorInvoices = useMemo(() => {
    if (!invoicesData?.invoices) return [];
    return invoicesData.invoices.map((inv: VendorInvoiceResponse) => ({
      id: inv.id,
      invoiceNumber: inv.invoice_number,
      vendor: inv.vendor_name,
      poNumber: inv.po_id || '',
      amount: Number(inv.amount),
      invoiceDate: new Date(inv.invoice_date).toISOString().split('T')[0],
      dueDate: new Date(inv.due_date).toISOString().split('T')[0],
      status: inv.status as 'pending' | 'matched' | 'approved' | 'paid' | 'exception',
      matchingStatus: inv.matching_status as 'perfect_match' | 'partial_match' | 'no_match' | 'exception',
      poAmount: Number(inv.po_amount || 0),
      grnAmount: inv.grn_amount ? Number(inv.grn_amount) : undefined,
      variance: inv.variance ? Number(inv.variance) : undefined,
    }));
  }, [invoicesData]);

  const rfqs = useMemo(() => {
    if (!rfqsData?.rfqs) return [];
    return rfqsData.rfqs.map((rfq: RFQResponse) => {
      // Find related requisition for display ID
      let requisitionDisplayId: string | undefined;
      if (rfq.requisition_id) {
        const relatedReq = purchaseRequisitions.find(req => req.uuid === rfq.requisition_id);
        if (relatedReq) {
          requisitionDisplayId = `${relatedReq.id} - ${relatedReq.description.substring(0, 30)}${relatedReq.description.length > 30 ? '...' : ''}`;
        }
      }

      // Get created by name
      // Use backend-provided name if available, otherwise fallback to current user name or 'User'
      const createdByName = (rfq as any).created_by_name || 
        (rfq.created_by === currentUserId ? currentUserName : 'User');

      return {
        id: rfq.custom_id || rfq.id, // Display ID
        uuid: rfq.id, // Actual UUID for API calls
        requisitionId: rfq.requisition_id || '',
        requisitionDisplayId,
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
      };
    });
  }, [rfqsData, purchaseRequisitions, currentUserId, currentUserName]);

  const metricCards = useMemo(() => {
    if (!dashboardStats) {
      return [
        { label: 'Pending Approvals', value: '$0', subtext: '0 requisitions', icon: Clock },
        { label: 'Active Orders', value: '0', subtext: 'Purchase orders', icon: ShoppingCart },
        { label: 'Total Spend', value: '$0', subtext: 'This period', icon: TrendingUp },
        { label: 'Approval Rate', value: '0%', subtext: 'Approved requisitions', icon: Target },
      ];
    }
    return [
      {
        label: 'Pending Approvals',
        value: `$${Number(dashboardStats.pending_amount).toLocaleString()}`,
        subtext: `${dashboardStats.pending_approvals} requisitions`,
        icon: Clock,
      },
      {
        label: 'Active Orders',
        value: dashboardStats.active_orders.toString(),
        subtext: 'Purchase orders',
        icon: ShoppingCart,
      },
      {
        label: 'Total Spend',
        value: `$${Number(dashboardStats.total_spend).toLocaleString()}`,
        subtext: 'This period',
        icon: TrendingUp,
      },
      {
        label: 'Approval Rate',
        value: `${Math.round(dashboardStats.approval_rate)}%`,
        subtext: 'Approved requisitions',
        icon: Target,
      },
    ];
  }, [dashboardStats]);

  const totalSpend = dashboardStats ? Number(dashboardStats.total_spend) : 0;

  // Combine all activities from all tabs for Recent Activity
  const allActivities = useMemo(() => {
    const activities: Array<{
      id: string;
      type: 'requisition' | 'order' | 'expense' | 'invoice' | 'rfq';
      title: string;
      description: string;
      amount?: number;
      status: string;
      date: string;
      user?: string;
      icon: React.ComponentType<{ className?: string }>;
    }> = [];

    // Add requisitions
    purchaseRequisitions.forEach(req => {
      activities.push({
        id: req.id,
        type: 'requisition',
        title: `Purchase Requisition ${req.id}`,
        description: req.description,
        amount: req.estimatedCost,
        status: req.status,
        date: req.requestDate,
        user: req.requestedBy,
        icon: FileText,
      });
    });

    // Add purchase orders
    purchaseOrders.forEach(order => {
      activities.push({
        id: order.id,
        type: 'order',
        title: `Purchase Order ${order.id}`,
        description: order.description,
        amount: order.amount,
        status: order.status,
        date: order.issueDate,
        user: order.vendor,
        icon: ShoppingCart,
      });
    });

    // Add expenses
    employeeExpenses.forEach(exp => {
      activities.push({
        id: exp.id,
        type: 'expense',
        title: `Expense ${exp.id}`,
        description: exp.description,
        amount: exp.amount,
        status: exp.status,
        date: exp.submittedDate,
        user: exp.employeeName,
        icon: Receipt,
      });
    });

    // Add invoices
    vendorInvoices.forEach(inv => {
      activities.push({
        id: inv.id,
        type: 'invoice',
        title: `Invoice ${inv.invoiceNumber || inv.id}`,
        description: `Invoice from ${inv.vendor}`,
        amount: inv.amount,
        status: inv.status,
        date: inv.invoiceDate,
        user: inv.vendor,
        icon: FileSearch,
      });
    });

    // Add RFQs
    rfqs.forEach(rfq => {
      activities.push({
        id: rfq.id,
        type: 'rfq',
        title: `RFQ ${rfq.id}`,
        description: rfq.title,
        amount: rfq.estimatedValue,
        status: rfq.status,
        date: rfq.createdDate,
        user: rfq.createdByName,
        icon: ClipboardList,
      });
    });

    // Sort by date (newest first)
    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [purchaseRequisitions, purchaseOrders, employeeExpenses, vendorInvoices, rfqs]);

  return (
    <div className="w-full min-h-screen bg-[#F5F3F2] font-outfit">
      <div className="flex flex-col w-full p-8 gap-8">
        <div className="flex justify-between items-end pb-2">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <Link to="/" className="text-sm font-normal font-outfit text-gray-500 hover:text-gray-900 transition-colors">
                Dashboard
              </Link>
              <span className="text-[#344054] text-sm font-normal font-outfit">/</span>
              <span className="text-[#344054] text-sm font-normal font-outfit">Procurement</span>
            </div>
            <h1 className="text-[#1A1A1A] text-3xl font-semibold font-outfit leading-tight">Procurement</h1>
          </div>
          <Button
            className="h-11 px-6 bg-[#161950] hover:bg-[#1E2B5B] text-white rounded-lg flex items-center gap-2.5 shadow-sm font-outfit"
            onClick={() => navigate('/submissions-approval')}
          >
            <Eye className="w-5 h-5" />
            <span className="text-sm font-semibold font-outfit">View Submission Request</span>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8 mb-8 bg-white border border-gray-200 rounded-lg p-1.5 h-auto font-outfit shadow-sm">
            <TabsTrigger
              value="dashboard"
              className="flex items-center space-x-2 data-[state=active]:bg-[#161950] data-[state=active]:text-white py-2.5 font-outfit"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="text-sm font-medium font-outfit">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger
              value="requisitions"
              className="flex items-center space-x-2 data-[state=active]:bg-[#161950] data-[state=active]:text-white py-2.5 font-outfit"
            >
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium font-outfit">Requisitions</span>
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="flex items-center space-x-2 data-[state=active]:bg-[#161950] data-[state=active]:text-white py-2.5 font-outfit"
            >
              <FileCheck className="h-4 w-4" />
              <span className="text-sm font-medium font-outfit">Purchase Orders</span>
            </TabsTrigger>
            <TabsTrigger
              value="vendors"
              className="flex items-center space-x-2 data-[state=active]:bg-[#161950] data-[state=active]:text-white py-2.5 font-outfit"
            >
              <Building2 className="h-4 w-4" />
              <span className="text-sm font-medium font-outfit">Vendors</span>
            </TabsTrigger>
            <TabsTrigger
              value="expenses"
              className="flex items-center space-x-2 data-[state=active]:bg-[#161950] data-[state=active]:text-white py-2.5 font-outfit"
            >
              <Receipt className="h-4 w-4" />
              <span className="text-sm font-medium font-outfit">Expenses</span>
            </TabsTrigger>
            <TabsTrigger
              value="invoices"
              className="flex items-center space-x-2 data-[state=active]:bg-[#161950] data-[state=active]:text-white py-2.5 font-outfit"
            >
              <FileSearch className="h-4 w-4" />
              <span className="text-sm font-medium font-outfit">Invoices</span>
            </TabsTrigger>
            <TabsTrigger
              value="budget"
              className="flex items-center space-x-2 data-[state=active]:bg-[#161950] data-[state=active]:text-white py-2.5 font-outfit"
            >
              <PieChart className="h-4 w-4" />
              <span className="text-sm font-medium font-outfit">Budget</span>
            </TabsTrigger>
            <TabsTrigger
              value="rfq"
              className="flex items-center space-x-2 data-[state=active]:bg-[#161950] data-[state=active]:text-white py-2.5 font-outfit"
            >
              <ClipboardList className="h-4 w-4" />
              <span className="text-sm font-medium font-outfit">RFQ</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            <DashboardTab
              allActivities={allActivities}
              metricCards={metricCards}
              budgetsData={budgetsData}
              dashboardStats={dashboardStats}
              onTabChange={setActiveTab}
              isLoading={isLoadingStats || isLoadingRequisitions || isLoadingOrders || isLoadingExpenses || isLoadingInvoices || isLoadingRFQs || isLoadingBudgets}
            />
          </TabsContent>

          <TabsContent value="requisitions" className="space-y-6">
            <RequisitionsTab
              requisitions={purchaseRequisitions}
              isLoading={isLoadingRequisitions}
            />
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <PurchaseOrdersTab
              orders={purchaseOrders}
              isLoading={isLoadingOrders}
            />
          </TabsContent>

          <TabsContent value="vendors" className="space-y-6">
            <VendorsTab
              stats={stats}
              isStatsLoading={isStatsLoading}
              vendorsData={vendorsData}
              isLoadingVendors={isLoadingVendors}
            />
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            <ExpensesTab
              expenses={employeeExpenses}
              isLoading={isLoadingExpenses}
            />
          </TabsContent>

          <TabsContent value="invoices" className="space-y-6">
            <InvoicesTab
              invoices={vendorInvoices}
              isLoading={isLoadingInvoices}
            />
          </TabsContent>

          <TabsContent value="budget" className="space-y-8">
            <BudgetTab totalSpend={totalSpend} />
          </TabsContent>

          <TabsContent value="rfq" className="space-y-6">
            <RFQTab
              rfqs={rfqs}
              isLoading={isLoadingRFQs}
              requisitions={purchaseRequisitions}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default memo(ProcurementPage);
