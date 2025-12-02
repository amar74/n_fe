export interface PurchaseRequisition {
  id: string; // Display ID (custom_id or UUID)
  uuid: string; // Actual UUID for API calls
  requestedBy: string;
  description: string;
  estimatedCost: number;
  vendor: string;
  justification: string;
  status: 'draft' | 'pending' | 'approved' | 'po-created' | 'rejected';
  requestDate: string;
  department: string;
  projectCode?: string;
}

export interface PurchaseOrder {
  id: string;
  vendor: string;
  amount: number;
  description: string;
  status: 'issued' | 'partially-fulfilled' | 'fulfilled' | 'invoiced' | 'paid';
  issueDate: string;
  dueDate: string;
  projectCode?: string;
  requisitionId: string;
}

export interface EmployeeExpense {
  id: string;
  employeeName: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  projectCode?: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'reimbursed';
  receiptUrl?: string;
  submittedDate: string;
  approvedBy?: string;
  rejectReason?: string;
}

export interface VendorInvoice {
  id: string;
  invoiceNumber: string;
  vendor: string;
  poNumber: string;
  amount: number;
  invoiceDate: string;
  dueDate: string;
  status: 'pending' | 'matched' | 'approved' | 'paid' | 'exception';
  matchingStatus: 'perfect_match' | 'partial_match' | 'no_match' | 'exception';
  poAmount: number;
  grnAmount?: number;
  variance?: number;
}

export interface RFQ {
  id: string; // Display ID (custom_id or UUID)
  uuid: string; // Actual UUID for API calls
  requisitionId: string; // UUID
  requisitionDisplayId?: string; // Display ID (custom_id) or description
  title: string;
  description: string;
  category: string;
  estimatedValue: number;
  dueDate: string;
  status: 'draft' | 'sent' | 'responses-received' | 'evaluating' | 'awarded' | 'closed';
  sentDate?: string;
  vendorsInvited: number;
  vendorsInvitedList?: string[]; // List of vendor names
  responsesReceived: number;
  responsesList?: Array<{
    vendorName: string;
    quotedAmount: number;
    status: string;
  }>;
  createdBy: string; // UUID
  createdByName?: string; // User name
  createdDate: string;
}

export interface RFQResponse {
  id: string;
  rfqId: string;
  vendorId: string;
  vendorName: string;
  quotedAmount: number;
  deliveryTime: string;
  terms: string;
  submittedDate: string;
  status: 'submitted' | 'under-review' | 'shortlisted' | 'rejected' | 'awarded';
  score?: number;
}

export interface VendorQualification {
  vendorId: string;
  vendorName: string;
  qualificationScore: number;
  financialStability: 'excellent' | 'good' | 'fair' | 'poor';
  credentialsVerified: boolean;
  certifications: string[];
  riskLevel: 'low' | 'medium' | 'high';
  lastAssessed: string;
  assessedBy: string;
}

export interface VendorPerformance {
  vendorId: string;
  vendorName: string;
  totalOrders: number;
  totalSpend: number;
  averageDeliveryTime: number;
  onTimeDeliveryRate: number;
  qualityRating: number;
  communicationRating: number;
  overallRating: number;
  performanceTrend: 'improving' | 'stable' | 'declining';
  lastOrderDate: string;
}

export interface DeliveryMilestone {
  id: string;
  poId: string;
  milestone: string;
  dueDate: string;
  completedDate?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed';
  notes?: string;
}

export interface GRN {
  id: string;
  grnNumber: string;
  poId: string;
  poNumber: string;
  vendor: string;
  receivedDate: string;
  receivedBy: string;
  items: Array<{
    description: string;
    quantity: number;
    receivedQuantity: number;
    condition: 'good' | 'damaged' | 'partial';
  }>;
  status: 'draft' | 'submitted' | 'verified' | 'approved';
  invoiceId?: string;
}

