import { AxiosResponse } from 'axios';
import { apiClient } from './client';

// Base types matching backend schemas
export interface PurchaseRequisitionResponse {
  id: string;
  custom_id?: string | null;
  org_id: string;
  requested_by: string;
  requested_by_name?: string | null;
  purchase_type: 'overhead' | 'project';
  description: string;
  category?: string | null;
  estimated_cost: number;
  vendor?: string | null;
  justification: string;
  department: string;
  project_code?: string | null;
  urgency: 'low' | 'medium' | 'high';
  needed_by?: string | null;
  status: string;
  approved_by?: string | null;
  approved_at?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PurchaseRequisitionCreate {
  purchase_type: 'overhead' | 'project';
  description: string;
  category?: string;
  estimated_cost: number;
  vendor?: string;
  justification: string;
  department: string;
  project_code?: string;
  urgency?: 'low' | 'medium' | 'high';
  needed_by?: string;
}

export interface PurchaseRequisitionUpdate {
  description?: string;
  category?: string;
  estimated_cost?: number;
  vendor?: string;
  justification?: string;
  department?: string;
  project_code?: string;
  urgency?: 'low' | 'medium' | 'high';
  needed_by?: string;
  status?: string;
  rejection_reason?: string;
}

export interface PurchaseRequisitionListResponse {
  requisitions: PurchaseRequisitionResponse[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}

export interface PurchaseOrderResponse {
  id: string;
  custom_id?: string | null;
  org_id: string;
  requisition_id?: string | null;
  vendor_id?: string | null;
  created_by: string;
  created_by_name?: string | null;
  vendor_name: string;
  description: string;
  amount: number;
  project_code?: string | null;
  issue_date: string;
  due_date?: string | null;
  expected_delivery_date?: string | null;
  status: string;
  terms_and_conditions?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderCreate {
  requisition_id?: string;
  vendor_id?: string;
  vendor_name: string;
  description: string;
  amount: number;
  project_code?: string;
  issue_date: string;
  due_date?: string;
  expected_delivery_date?: string;
  terms_and_conditions?: string;
  notes?: string;
}

export interface PurchaseOrderUpdate {
  vendor_id?: string;
  vendor_name?: string;
  description?: string;
  amount?: number;
  project_code?: string;
  due_date?: string;
  expected_delivery_date?: string;
  status?: string;
  terms_and_conditions?: string;
  notes?: string;
}

export interface PurchaseOrderListResponse {
  orders: PurchaseOrderResponse[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}

export interface RFQResponse {
  id: string;
  custom_id?: string | null;
  org_id: string;
  requisition_id?: string | null;
  created_by: string;
  created_by_name?: string | null;
  title: string;
  description: string;
  category: string;
  estimated_value: number;
  due_date: string;
  status: string;
  sent_date?: string | null;
  vendors_invited: number;
  responses_received: number;
  created_at: string;
  updated_at: string;
}

export interface RFQCreate {
  requisition_id?: string;
  title: string;
  description: string;
  category: string;
  estimated_value: number;
  due_date: string;
}

export interface RFQUpdate {
  title?: string;
  description?: string;
  category?: string;
  estimated_value?: number;
  due_date?: string;
  status?: string;
}

export interface RFQListResponse {
  rfqs: RFQResponse[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}

export interface RFQResponseCreate {
  rfq_id: string;
  vendor_id: string;
  quoted_amount: number;
  delivery_time: string;
  terms?: string;
}

export interface RFQResponseResponse {
  id: string;
  rfq_id: string;
  vendor_id: string;
  quoted_amount: number;
  delivery_time: string;
  terms?: string | null;
  score?: number | null;
  status: string;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeExpenseResponse {
  id: string;
  custom_id?: string | null;
  org_id: string;
  employee_id: string;
  employee_name?: string | null;
  expense_date: string;
  amount: number;
  category: string;
  description: string;
  project_code?: string | null;
  receipt_url?: string | null;
  receipt_uploaded: boolean;
  status: string;
  approved_by?: string | null;
  approved_at?: string | null;
  rejected_reason?: string | null;
  reimbursed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeExpenseCreate {
  expense_date: string;
  amount: number;
  category: string;
  description: string;
  project_code?: string;
  receipt_url?: string;
}

export interface EmployeeExpenseUpdate {
  expense_date?: string;
  amount?: number;
  category?: string;
  description?: string;
  project_code?: string;
  receipt_url?: string;
  status?: string;
  rejection_reason?: string;
}

export interface EmployeeExpenseListResponse {
  expenses: EmployeeExpenseResponse[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}

export interface VendorInvoiceResponse {
  id: string;
  org_id: string;
  po_id?: string | null;
  vendor_id?: string | null;
  grn_id?: string | null;
  invoice_number: string;
  vendor_name: string;
  amount: number;
  invoice_date: string;
  due_date: string;
  po_amount?: number | null;
  grn_amount?: number | null;
  variance?: number | null;
  status: string;
  matching_status: string;
  invoice_file_url?: string | null;
  fraud_detected: boolean;
  fraud_reasons?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface VendorInvoiceCreate {
  po_id?: string;
  vendor_id?: string;
  invoice_number: string;
  vendor_name: string;
  amount: number;
  invoice_date: string;
  due_date: string;
  invoice_file_url?: string;
}

export interface VendorInvoiceUpdate {
  po_id?: string;
  vendor_id?: string;
  invoice_number?: string;
  vendor_name?: string;
  amount?: number;
  invoice_date?: string;
  due_date?: string;
  po_amount?: number;
  grn_amount?: number;
  variance?: number;
  status?: string;
  matching_status?: string;
  invoice_file_url?: string;
}

export interface VendorInvoiceListResponse {
  invoices: VendorInvoiceResponse[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}

export interface GRNItem {
  description: string;
  quantity: number;
  received_quantity: number;
  condition: 'good' | 'damaged' | 'partial';
}

export interface GRNCreate {
  po_id: string;
  grn_number: string;
  received_date: string;
  items: GRNItem[];
  notes?: string;
}

export interface GRNUpdate {
  grn_number?: string;
  received_date?: string;
  items?: GRNItem[];
  status?: string;
  notes?: string;
}

export interface GRNResponse {
  id: string;
  custom_id?: string | null;
  org_id: string;
  po_id: string;
  received_by: string;
  grn_number: string;
  received_date: string;
  items: Record<string, any>;
  total_amount: number;
  status: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface GRNListResponse {
  grns: GRNResponse[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}

export interface DeliveryMilestoneResponse {
  id: string;
  po_id: string;
  milestone_name: string;
  due_date: string;
  completed_date?: string | null;
  status: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeliveryMilestoneCreate {
  po_id: string;
  milestone_name: string;
  due_date: string;
  notes?: string;
}

export interface DeliveryMilestoneUpdate {
  milestone_name?: string;
  due_date?: string;
  completed_date?: string;
  status?: string;
  notes?: string;
}

export interface DeliveryMilestoneListResponse {
  milestones: DeliveryMilestoneResponse[];
  total: number;
}

export interface RequisitionApprovalRequest {
  status: 'approved' | 'rejected';
  rejection_reason?: string;
}

export interface ExpenseApprovalRequest {
  status: 'approved' | 'rejected';
  rejection_reason?: string;
}

export interface ProcurementDashboardStats {
  pending_approvals: number;
  pending_amount: number;
  active_orders: number;
  total_spend: number;
  approval_rate: number;
}

class ProcurementApiService {
  private readonly baseUrl = '/procurement';

  // Purchase Requisitions
  async createRequisition(data: PurchaseRequisitionCreate): Promise<PurchaseRequisitionResponse> {
    const response: AxiosResponse<PurchaseRequisitionResponse> = await apiClient.post(
      `${this.baseUrl}/requisitions`,
      data
    );
    return response.data;
  }

  async listRequisitions(params?: { page?: number; size?: number; status?: string; search?: string }): Promise<PurchaseRequisitionListResponse> {
    const response: AxiosResponse<PurchaseRequisitionListResponse> = await apiClient.get(
      `${this.baseUrl}/requisitions`,
      { params }
    );
    return response.data;
  }

  async getRequisition(id: string): Promise<PurchaseRequisitionResponse> {
    const response: AxiosResponse<PurchaseRequisitionResponse> = await apiClient.get(
      `${this.baseUrl}/requisitions/${id}`
    );
    return response.data;
  }

  async updateRequisition(id: string, data: PurchaseRequisitionUpdate): Promise<PurchaseRequisitionResponse> {
    const response: AxiosResponse<PurchaseRequisitionResponse> = await apiClient.put(
      `${this.baseUrl}/requisitions/${id}`,
      data
    );
    return response.data;
  }

  async approveRequisition(id: string, data: RequisitionApprovalRequest): Promise<PurchaseRequisitionResponse> {
    const response: AxiosResponse<PurchaseRequisitionResponse> = await apiClient.post(
      `${this.baseUrl}/requisitions/${id}/approve`,
      data
    );
    return response.data;
  }

  async deleteRequisition(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/requisitions/${id}`);
  }

  // Purchase Orders
  async createPurchaseOrder(data: PurchaseOrderCreate): Promise<PurchaseOrderResponse> {
    const response: AxiosResponse<PurchaseOrderResponse> = await apiClient.post(
      `${this.baseUrl}/orders`,
      data
    );
    return response.data;
  }

  async listPurchaseOrders(params?: { page?: number; size?: number; status?: string; search?: string }): Promise<PurchaseOrderListResponse> {
    const response: AxiosResponse<PurchaseOrderListResponse> = await apiClient.get(
      `${this.baseUrl}/orders`,
      { params }
    );
    return response.data;
  }

  async getPurchaseOrder(id: string): Promise<PurchaseOrderResponse> {
    const response: AxiosResponse<PurchaseOrderResponse> = await apiClient.get(
      `${this.baseUrl}/orders/${id}`
    );
    return response.data;
  }

  async updatePurchaseOrder(id: string, data: PurchaseOrderUpdate): Promise<PurchaseOrderResponse> {
    const response: AxiosResponse<PurchaseOrderResponse> = await apiClient.put(
      `${this.baseUrl}/orders/${id}`,
      data
    );
    return response.data;
  }

  async deletePurchaseOrder(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/orders/${id}`);
  }

  // RFQs
  async createRFQ(data: RFQCreate): Promise<RFQResponse> {
    const response: AxiosResponse<RFQResponse> = await apiClient.post(
      `${this.baseUrl}/rfqs`,
      data
    );
    return response.data;
  }

  async listRFQs(params?: { page?: number; size?: number; status?: string; search?: string }): Promise<RFQListResponse> {
    const response: AxiosResponse<RFQListResponse> = await apiClient.get(
      `${this.baseUrl}/rfqs`,
      { params }
    );
    return response.data;
  }

  async getRFQ(id: string): Promise<RFQResponse> {
    const response: AxiosResponse<RFQResponse> = await apiClient.get(
      `${this.baseUrl}/rfqs/${id}`
    );
    return response.data;
  }

  async updateRFQ(id: string, data: RFQUpdate): Promise<RFQResponse> {
    const response: AxiosResponse<RFQResponse> = await apiClient.put(
      `${this.baseUrl}/rfqs/${id}`,
      data
    );
    return response.data;
  }

  async deleteRFQ(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/rfqs/${id}`);
  }

  async createRFQResponse(rfqId: string, data: RFQResponseCreate): Promise<RFQResponseResponse> {
    const response: AxiosResponse<RFQResponseResponse> = await apiClient.post(
      `${this.baseUrl}/rfqs/${rfqId}/responses`,
      data
    );
    return response.data;
  }

  async listRFQResponses(rfqId: string): Promise<RFQResponseResponse[]> {
    const response: AxiosResponse<RFQResponseResponse[]> = await apiClient.get(
      `${this.baseUrl}/rfqs/${rfqId}/responses`
    );
    return response.data;
  }

  // Employee Expenses
  async uploadExpenseReceipt(file: File): Promise<{ receipt_url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<{ receipt_url: string }>(
      '/procurement/expenses/upload-receipt',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async createExpense(data: EmployeeExpenseCreate): Promise<EmployeeExpenseResponse> {
    const response: AxiosResponse<EmployeeExpenseResponse> = await apiClient.post(
      `${this.baseUrl}/expenses`,
      data
    );
    return response.data;
  }

  async listExpenses(params?: { page?: number; size?: number; status?: string; search?: string }): Promise<EmployeeExpenseListResponse> {
    const response: AxiosResponse<EmployeeExpenseListResponse> = await apiClient.get(
      `${this.baseUrl}/expenses`,
      { params }
    );
    return response.data;
  }

  async getExpense(id: string): Promise<EmployeeExpenseResponse> {
    const response: AxiosResponse<EmployeeExpenseResponse> = await apiClient.get(
      `${this.baseUrl}/expenses/${id}`
    );
    return response.data;
  }

  async updateExpense(id: string, data: EmployeeExpenseUpdate): Promise<EmployeeExpenseResponse> {
    const response: AxiosResponse<EmployeeExpenseResponse> = await apiClient.put(
      `${this.baseUrl}/expenses/${id}`,
      data
    );
    return response.data;
  }

  async approveExpense(id: string, data: ExpenseApprovalRequest): Promise<EmployeeExpenseResponse> {
    const response: AxiosResponse<EmployeeExpenseResponse> = await apiClient.post(
      `${this.baseUrl}/expenses/${id}/approve`,
      data
    );
    return response.data;
  }

  async deleteExpense(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/expenses/${id}`);
  }

  // Vendor Invoices
  async createInvoice(data: VendorInvoiceCreate): Promise<VendorInvoiceResponse> {
    const response: AxiosResponse<VendorInvoiceResponse> = await apiClient.post(
      `${this.baseUrl}/invoices`,
      data
    );
    return response.data;
  }

  async listInvoices(params?: { page?: number; size?: number; status?: string; search?: string }): Promise<VendorInvoiceListResponse> {
    const response: AxiosResponse<VendorInvoiceListResponse> = await apiClient.get(
      `${this.baseUrl}/invoices`,
      { params }
    );
    return response.data;
  }

  async getInvoice(id: string): Promise<VendorInvoiceResponse> {
    const response: AxiosResponse<VendorInvoiceResponse> = await apiClient.get(
      `${this.baseUrl}/invoices/${id}`
    );
    return response.data;
  }

  async updateInvoice(id: string, data: VendorInvoiceUpdate): Promise<VendorInvoiceResponse> {
    const response: AxiosResponse<VendorInvoiceResponse> = await apiClient.put(
      `${this.baseUrl}/invoices/${id}`,
      data
    );
    return response.data;
  }

  async deleteInvoice(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/invoices/${id}`);
  }

  async extractInvoiceData(file: File): Promise<{
    invoice_number?: string | null;
    po_number?: string | null;
    vendor_name?: string | null;
    amount?: number | null;
    invoice_date?: string | null;
    due_date?: string | null;
    confidence: number;
    extracted_fields: Record<string, any>;
    error?: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post(
      `${this.baseUrl}/invoices/extract`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async extractReceiptData(file: File): Promise<{
    amount?: number | null;
    date?: string | null;
    vendor?: string | null;
    category?: string | null;
    description?: string | null;
    confidence: number;
    extracted_fields: Record<string, any>;
    error?: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post(
      `${this.baseUrl}/expenses/extract-receipt`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  // GRNs
  async createGRN(data: GRNCreate): Promise<GRNResponse> {
    const response: AxiosResponse<GRNResponse> = await apiClient.post(
      `${this.baseUrl}/grns`,
      data
    );
    return response.data;
  }

  async listGRNs(params?: { page?: number; size?: number; po_id?: string }): Promise<GRNListResponse> {
    const response: AxiosResponse<GRNListResponse> = await apiClient.get(
      `${this.baseUrl}/grns`,
      { params }
    );
    return response.data;
  }

  async getGRN(id: string): Promise<GRNResponse> {
    const response: AxiosResponse<GRNResponse> = await apiClient.get(
      `${this.baseUrl}/grns/${id}`
    );
    return response.data;
  }

  async updateGRN(id: string, data: GRNUpdate): Promise<GRNResponse> {
    const response: AxiosResponse<GRNResponse> = await apiClient.put(
      `${this.baseUrl}/grns/${id}`,
      data
    );
    return response.data;
  }

  async deleteGRN(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/grns/${id}`);
  }

  // Delivery Milestones
  async createMilestone(orderId: string, data: DeliveryMilestoneCreate): Promise<DeliveryMilestoneResponse> {
    const response: AxiosResponse<DeliveryMilestoneResponse> = await apiClient.post(
      `${this.baseUrl}/orders/${orderId}/milestones`,
      data
    );
    return response.data;
  }

  async listMilestones(orderId: string): Promise<DeliveryMilestoneListResponse> {
    const response: AxiosResponse<DeliveryMilestoneListResponse> = await apiClient.get(
      `${this.baseUrl}/orders/${orderId}/milestones`
    );
    return response.data;
  }

  async updateMilestone(id: string, data: DeliveryMilestoneUpdate): Promise<DeliveryMilestoneResponse> {
    const response: AxiosResponse<DeliveryMilestoneResponse> = await apiClient.put(
      `${this.baseUrl}/milestones/${id}`,
      data
    );
    return response.data;
  }

  async deleteMilestone(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/milestones/${id}`);
  }

  // Dashboard
  async getDashboardStats(): Promise<ProcurementDashboardStats> {
    const response: AxiosResponse<ProcurementDashboardStats> = await apiClient.get(
      `${this.baseUrl}/dashboard/stats`
    );
    return response.data;
  }

  // Procurement Budgets
  async createBudget(data: ProcurementBudgetCreate): Promise<ProcurementBudgetResponse> {
    const response: AxiosResponse<ProcurementBudgetResponse> = await apiClient.post(
      `${this.baseUrl}/budgets`,
      data
    );
    return response.data;
  }

  async listBudgets(params?: { page?: number; size?: number; budget_year?: string; status?: string }): Promise<ProcurementBudgetListResponse> {
    const response: AxiosResponse<ProcurementBudgetListResponse> = await apiClient.get(
      `${this.baseUrl}/budgets`,
      { params }
    );
    return response.data;
  }

  async getBudget(id: string): Promise<ProcurementBudgetResponse> {
    const response: AxiosResponse<ProcurementBudgetResponse> = await apiClient.get(
      `${this.baseUrl}/budgets/${id}`
    );
    return response.data;
  }

  async getCategoryHistoricalSpending(categoryId: number, budgetYear: string): Promise<{ actual_last_year: number; actual_current_year: number }> {
    const response: AxiosResponse<{ actual_last_year: number; actual_current_year: number }> = await apiClient.get(
      `${this.baseUrl}/budgets/historical/${categoryId}`,
      { params: { budget_year: budgetYear } }
    );
    return response.data;
  }

  // Vendor Qualifications
  async createVendorQualification(data: {
    vendor_id: string;
    financial_stability?: string;
    credentials_verified: boolean;
    certifications?: string[];
    qualification_score?: number;
    risk_level?: string;
    notes?: string;
  }): Promise<VendorQualificationResponse> {
    const response: AxiosResponse<VendorQualificationResponse> = await apiClient.post(
      '/vendors/qualifications',
      data
    );
    return response.data;
  }

  async getVendorQualification(vendorId: string, active_only: boolean = true): Promise<VendorQualificationResponse | null> {
    try {
      const response: AxiosResponse<VendorQualificationResponse> = await apiClient.get(
        `/vendors/qualifications/${vendorId}`,
        { params: { active_only } }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getAllVendorQualifications(skip: number = 0, limit: number = 100, active_only: boolean = false): Promise<VendorQualificationResponse[]> {
    const response: AxiosResponse<VendorQualificationResponse[]> = await apiClient.get(
      '/vendors/qualifications',
      { params: { skip, limit, active_only } }
    );
    return response.data;
  }

  // Vendor Performance
  async getVendorPerformance(vendorId: string): Promise<VendorPerformanceResponse | null> {
    try {
      const response: AxiosResponse<VendorPerformanceResponse> = await apiClient.get(
        `/vendors/${vendorId}/performance`
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
}

export interface BudgetSubcategoryCreate {
  subcategory_id: number;
  name: string;
  actual_last_year: number;
  actual_current_year: number;
  proposed_budget: number;
  ai_suggested_budget?: number;
}

export interface BudgetCategoryCreate {
  category_id: number;
  name: string;
  description?: string;
  actual_last_year: number;
  actual_current_year: number;
  proposed_budget: number;
  ai_suggested_budget?: number;
  ai_confidence?: number;
  market_growth_rate?: number;
  subcategories: BudgetSubcategoryCreate[];
}

export interface ProcurementBudgetCreate {
  budget_year: string;
  status?: string;
  categories: BudgetCategoryCreate[];
}

export interface BudgetSubcategoryResponse {
  id: string;
  subcategory_id: number;
  name: string;
  actual_last_year: number;
  actual_current_year: number;
  proposed_budget: number;
  ai_suggested_budget?: number;
}

export interface BudgetCategoryResponse {
  id: string;
  category_id: number;
  name: string;
  description?: string;
  actual_last_year: number;
  actual_current_year: number;
  proposed_budget: number;
  ai_suggested_budget?: number;
  ai_confidence?: number;
  market_growth_rate?: number;
  subcategories: BudgetSubcategoryResponse[];
}

export interface ProcurementBudgetResponse {
  id: string;
  org_id: string;
  budget_year: string;
  status: string;
  total_budget: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  categories: BudgetCategoryResponse[];
}

export interface ProcurementBudgetListResponse {
  budgets: ProcurementBudgetResponse[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}

// Vendor Qualification Types
export interface VendorQualificationResponse {
  id: string;
  vendor_id: string;
  vendor_name: string;
  financial_stability: string | null;
  credentials_verified: boolean;
  certifications: string[];
  qualification_score: number | null;
  risk_level: string | null;
  notes: string | null;
  assessed_by: string | null;
  last_assessed: string | null;
  created_at: string;
  updated_at: string;
}

// Vendor Performance Types
export interface VendorPerformanceResponse {
  vendor_id: string;
  vendor_name: string;
  total_orders: number;
  total_spend: number;
  average_delivery_time: number;
  on_time_delivery_rate: number;
  quality_rating: number;
  communication_rating: number;
  overall_rating: number;
  performance_trend: string;
  last_order_date: string | null;
}

export const procurementApi = new ProcurementApiService();

