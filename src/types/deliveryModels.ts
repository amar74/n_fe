export interface DeliveryModelTemplatePhase {
  phase_id: string;
  name: string;
  status?: string | null;
  duration?: string | null;
  budget?: number | null;
  updated_by?: string | null;
  description?: string | null;
  last_updated?: string | null;
}

export interface DeliveryModelTemplate {
  id: string;
  approach: string;
  notes?: string | null;
  phases: DeliveryModelTemplatePhase[];
  created_at: string;
  updated_at: string;
}

export interface DeliveryModelTemplatePayload {
  approach: string;
  notes?: string | null;
  phases?: DeliveryModelTemplatePhase[];
}

