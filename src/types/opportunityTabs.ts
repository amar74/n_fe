export interface Stakeholder {
  id: string;
  name: string;
  designation: string;
  email: string;
  contact_number: string;
  influence_level: 'High' | 'Medium' | 'Low';
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
  value: string;
  outcome: string;
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
  status: 'Completed' | 'Pending' | 'Not Applicable';
  created_at: string;
}

export interface OverviewData {
  project_description?: string;
  project_scope?: string[];
  key_metrics?: Record<string, any>;
  documents_summary?: Record<string, any>;
}

export interface DeliveryModelData {
  approach: string;
  key_phases: Array<{
    phase: string;
    duration: string;
    resources: string;
    status?: string;
    completed_by?: string;
  }>;
  identified_gaps?: string[];
}

export interface FinancialSummaryData {
  total_project_value: number;
  phases: Array<{
    name: string;
    budget: number;
    percentage: number;
  }>;
  contingency: number;
  profit_margin_percentage?: number;
}