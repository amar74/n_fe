/**
 * Shared types for Finance Planning components
 */

export type TabKey =
  | 'annual'
  | 'revenue-expense'
  | 'bu-allocation'
  | 'variance'
  | 'forecasting'
  | 'dashboard'
  | 'scenarios'
  | 'approval';

export type ScenarioKey = 'conservative' | 'balanced' | 'high';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'requested_changes' | 'not_started';
export type ApprovalAction = 'approve' | 'reject' | 'request_changes';

export interface ApprovalStage {
  id: string;
  label: string;
  description: string;
  requiredRole: string | string[];
  sequence: number;
  status: ApprovalStatus;
  approverName?: string;
  approverEmail?: string;
  approvedAt?: string;
  comments?: string;
  canApprove: boolean;
}

export interface ScenarioConfig {
  key: ScenarioKey;
  name: string;
  description: string;
  growthRates: number[];
  investmentLevel: 'Low' | 'Medium' | 'High';
  bonusThreshold: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  risks?: string[];
  opportunities?: string[];
}

export interface AnnualMetric {
  label: string;
  tone: 'default' | 'negative' | 'positive' | 'accent';
  value?: number;
  valueLabel?: string;
}

export interface RevenueLine {
  label: string;
  target: number;
  variance: number;
  level?: number;
  parent_id?: number | null;
}

export interface ExpenseLine {
  label: string;
  target: number;
  variance: number;
  level?: number;
  parent_id?: number | null;
}

export interface VarianceThreshold {
  label: string;
  value?: string;
  valuePercent?: number;
}

