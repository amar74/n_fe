export interface Stakeholder {
  id: string;
  name: string;
  designation: string;
  email: string;
  contact_number: string;
  influence_level:
    | 'High'
    | 'Medium'
    | 'Low'
    | 'Executive Sponsor'
    | 'Economic Buyer'
    | 'Technical Evaluator'
    | 'Project Champion'
    | 'Finance Approver'
    | 'Operational Lead';
  created_at: string;
}

export interface Driver {
  id: string;
  category: 'Political' | 'Technical' | 'Financial';
  description: string;
  created_at: string;
}

export interface Competitor {
  id: string;
  company_name: string;
  threat_level: 'High' | 'Medium' | 'Low';
  strengths: string[];
  weaknesses: string[];
  created_at: string;
}

export interface Strategy {
  id: string;
  strategy_text: string;
  priority: number;
  created_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  designation: string;
  experience: string;
  availability: string;
  created_at: string;
}

export interface Reference {
  id: string;
  project_name: string;
  client: string;
  year: string;
  status: string;
  total_amount: string;
  created_at: string;
}

export interface Risk {
  id: string;
  category: 'Environmental' | 'Political' | 'Technical';
  risk_description: string;
  impact_level: 'High' | 'Medium' | 'Low';
  probability: 'High' | 'Medium' | 'Low';
  mitigation_strategy: string;
  created_at: string;
}

export interface LegalChecklistItem {
  id: string;
  item_name: string;
  status: 'Complete' | 'In progress' | 'Pending';
  created_at: string;
}

export interface OverviewData {
  project_description?: string;
  project_scope?: string[];
  key_metrics?: Record<string, any>;
  documents_summary?: Record<string, any>;
}

export interface DeliveryModelPhase {
  phase_id: string;
  name: string;
  status?: string;
  duration?: string;
  budget?: number | null;
  updated_by?: string | null;
  description?: string | null;
  last_updated?: string | null;
}

export interface DeliveryModelEntry {
  model_id: string;
  approach: string;
  phases: DeliveryModelPhase[];
  is_active?: boolean;
  total_budget?: number | null;
  notes?: string | null;
  updated_by?: string | null;
  last_updated?: string | null;
  templateId?: string | null;
}

export interface DeliveryModelData {
  approach?: string;
  key_phases: DeliveryModelPhase[];
  identified_gaps?: string[];
  models?: DeliveryModelEntry[];
  active_model_id?: string | null;
}

export interface FinancialSummaryData {
  total_project_value: number;
  budget_categories: Array<{
    name: string;
    amount: number;
    percentage: number;
  }>;
  contingency_percentage: number;
  profit_margin_percentage: number;
}