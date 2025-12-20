import { ClientType } from '@/types/accounts';

export interface AccountStatsData {
  totalAccounts: number;
  aiHealthScore: number;
  highRiskCount: number;
  growingCount: number;
  totalValue: string;
}

export interface FilterState {
  search: string;
  tier: 'all' | ClientType;
}

export type { CreateAccountModalProps } from './components/CreateAccountModal/CreateAccountModal.types';
