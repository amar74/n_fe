import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileCheck,
  AlertTriangle,
  Clock,
  CheckCircle,
  Brain,
  Calendar,
  FileText,
  TrendingUp,
} from 'lucide-react';
import type { Contract } from '@/services/api/contractsApi';
import { getStatusColor } from './utils';

interface DashboardTabProps {
  contracts: Contract[];
  isLoading: boolean;
  activeContracts: number;
  highRiskContracts: number;
  pendingReviewContracts: number;
  executedContracts: number;
  onContractSelect: (contract: Contract) => void;
  onTabChange: (tab: string) => void;
}

export function DashboardTab({
  contracts,
  isLoading,
  activeContracts,
  highRiskContracts,
  pendingReviewContracts,
  executedContracts,
  onContractSelect,
  onTabChange,
}: DashboardTabProps) {
  const filteredContracts = contracts.filter(
    (c: any) => c.status !== 'archived'
  );

  // Calculate AI-Powered Alerts
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

  // Contracts expiring within 7 days
  const expiringContracts = filteredContracts.filter((contract: any) => {
    if (!contract.end_date) return false;
    const endDate = new Date(contract.end_date);
    return endDate <= sevenDaysFromNow && endDate >= now;
  });

  // Contracts pending review for more than 5 days
  const overdueReviewContracts = filteredContracts.filter((contract: any) => {
    if (contract.status !== 'awaiting-review' && contract.status !== 'awaiting_review') return false;
    if (!contract.upload_date && !contract.created_at) return false;
    const reviewDate = contract.upload_date ? new Date(contract.upload_date) : new Date(contract.created_at);
    return reviewDate <= fiveDaysAgo;
  });

  // Contracts with renewal opportunities (expiring within 30 days)
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const renewalOpportunities = filteredContracts.filter((contract: any) => {
    if (!contract.end_date) return false;
    const endDate = new Date(contract.end_date);
    return endDate <= thirtyDaysFromNow && endDate > sevenDaysFromNow;
  });

  const handleReviewExpiring = () => {
    if (expiringContracts.length > 0) {
      onContractSelect(expiringContracts[0]);
      onTabChange('contracts');
    }
  };

  const handleEscalateOverdue = () => {
    if (overdueReviewContracts.length > 0) {
      onContractSelect(overdueReviewContracts[0]);
      onTabChange('contracts');
    }
  };

  const handleScheduleRenewal = () => {
    if (renewalOpportunities.length > 0) {
      onContractSelect(renewalOpportunities[0]);
      onTabChange('contracts');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="h-20 p-5 bg-white rounded-2xl border border-[#E5E7EB] flex justify-between items-center shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <div className="w-14 h-14 p-3 bg-[#EAECF0] rounded-xl flex justify-center items-center overflow-hidden">
            <FileCheck className="h-6 w-6 text-[#1D2939]" />
          </div>
          <div className="flex flex-col justify-between items-end">
            <div className="text-[#667085] text-sm font-normal font-outfit leading-tight">Active Contracts</div>
            <div className="text-[#1A1A1A] text-2xl font-bold font-outfit leading-loose">
              {isLoading ? '...' : activeContracts}
            </div>
          </div>
        </div>

        <div className="h-20 p-5 bg-white rounded-2xl border border-[#E5E7EB] flex justify-between items-center shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <div className="w-14 h-14 p-3 bg-[#EAECF0] rounded-xl flex justify-center items-center overflow-hidden">
            <AlertTriangle className="h-6 w-6 text-[#1D2939]" />
          </div>
          <div className="flex flex-col justify-start items-end gap-3">
            <div className="text-[#667085] text-sm font-normal font-outfit leading-tight">High Risk</div>
            <div className="px-2.5 py-0.5 bg-[#FEE4E2] rounded-full flex justify-center items-center">
              <span className="text-[#D92D20] text-base font-medium font-outfit leading-tight">
                {isLoading ? '...' : highRiskContracts}
              </span>
            </div>
          </div>
        </div>

        <div className="h-20 p-5 bg-white rounded-2xl border border-[#E5E7EB] flex justify-between items-center shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <div className="w-14 h-14 p-3 bg-[#EAECF0] rounded-xl flex justify-center items-center overflow-hidden">
            <Clock className="h-6 w-6 text-[#1D2939]" />
          </div>
          <div className="flex flex-col justify-between items-end">
            <div className="text-[#667085] text-sm font-normal font-outfit leading-tight">Pending Review</div>
            <div className="text-[#1A1A1A] text-2xl font-bold font-outfit leading-loose">
              {isLoading ? '...' : pendingReviewContracts}
            </div>
          </div>
        </div>

        <div className="h-20 p-5 bg-white rounded-2xl border border-[#E5E7EB] flex justify-between items-center shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <div className="w-14 h-14 p-3 bg-[#EAECF0] rounded-xl flex justify-center items-center overflow-hidden">
            <CheckCircle className="h-6 w-6 text-[#1D2939]" />
          </div>
          <div className="flex flex-col justify-between items-end">
            <div className="text-[#667085] text-sm font-normal font-outfit leading-tight">Executed</div>
            <div className="text-[#1A1A1A] text-2xl font-bold font-outfit leading-loose">
              {isLoading ? '...' : executedContracts}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] flex flex-col gap-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <div className="flex justify-start items-start gap-6">
          <div className="flex-1 flex flex-col gap-1">
            <h2 className="text-[#1A1A1A] text-lg font-semibold font-outfit leading-7">
              AI-Powered Contract Alerts
            </h2>
            <p className="text-[#667085] text-sm font-normal font-outfit">
              Intelligent insights and proactive notifications
            </p>
          </div>
          <Badge variant="outline" className="bg-[#F9FAFB] text-[#667085] border-[#E5E7EB] px-2.5 py-1 font-outfit">
            <Brain className="h-3 w-3 mr-1.5" />
            AI Enhanced
          </Badge>
        </div>
        <div className="flex flex-col gap-4">
          {expiringContracts.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-[#FEF3F2] rounded-2xl border border-[#D92D20]/20">
              <div className="flex items-center gap-4">
                <AlertTriangle className="h-5 w-5 text-[#D92D20]" />
                <div>
                  <p className="text-[#1A1A1A] text-sm font-semibold font-outfit">
                    Contract Expiration Alert
                  </p>
                  <p className="text-[#667085] text-xs font-normal font-outfit">
                    {expiringContracts.length} {expiringContracts.length === 1 ? 'contract' : 'contracts'} expiring within 7 days
                  </p>
                </div>
              </div>
              <Button 
                size="sm" 
                onClick={handleReviewExpiring}
                className="h-9 px-4 bg-[#161950] hover:bg-[#1E2B5B] text-white rounded-lg font-outfit"
              >
                Review ({expiringContracts.length})
              </Button>
            </div>
          )}
          
          {overdueReviewContracts.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-[#FFFAEB] rounded-2xl border border-[#DC6803]/20">
              <div className="flex items-center gap-4">
                <Clock className="h-5 w-5 text-[#DC6803]" />
                <div>
                  <p className="text-[#1A1A1A] text-sm font-semibold font-outfit">Review Overdue</p>
                  <p className="text-[#667085] text-xs font-normal font-outfit">
                    {overdueReviewContracts.length} {overdueReviewContracts.length === 1 ? 'contract' : 'contracts'} pending review for more than 5 days
                  </p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleEscalateOverdue}
                className="h-9 px-4 border-[#DC6803] text-[#DC6803] hover:bg-[#FFFAEB] rounded-lg font-outfit"
              >
                Escalate ({overdueReviewContracts.length})
              </Button>
            </div>
          )}

          {renewalOpportunities.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-[#F0FDF4] rounded-2xl border border-[#039855]/20">
              <div className="flex items-center gap-4">
                <Calendar className="h-5 w-5 text-[#039855]" />
                <div>
                  <p className="text-[#1A1A1A] text-sm font-semibold font-outfit">Renewal Opportunity</p>
                  <p className="text-[#667085] text-xs font-normal font-outfit">
                    {renewalOpportunities.length} {renewalOpportunities.length === 1 ? 'contract' : 'contracts'} expiring soon may have renewal opportunities
                  </p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleScheduleRenewal}
                className="h-9 px-4 border-[#039855] text-[#039855] hover:bg-[#F0FDF4] rounded-lg font-outfit"
              >
                Schedule ({renewalOpportunities.length})
              </Button>
            </div>
          )}

          {expiringContracts.length === 0 && overdueReviewContracts.length === 0 && renewalOpportunities.length === 0 && (
            <div className="flex items-center justify-center p-8 bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB]">
              <div className="text-center">
                <CheckCircle className="h-8 w-8 text-[#039855] mx-auto mb-2" />
                <p className="text-[#1A1A1A] text-sm font-semibold font-outfit">All Clear</p>
                <p className="text-[#667085] text-xs font-normal font-outfit mt-1">
                  No urgent contract alerts at this time
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] flex flex-col gap-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <div className="flex justify-start items-start gap-6">
            <div className="flex-1 flex flex-col gap-1">
              <h2 className="text-[#1A1A1A] text-lg font-semibold font-outfit leading-7">
                Recent Activity
              </h2>
              <p className="text-[#667085] text-sm font-normal font-outfit">
                Latest contract updates
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {filteredContracts.slice(0, 5).map((contract: any) => (
              <div
                key={contract.id}
                className="flex items-center justify-between p-4 border border-[#E5E7EB] rounded-2xl hover:border-[#161950]/30 hover:bg-[#F9FAFB] cursor-pointer transition-all bg-white"
                onClick={() => {
                  onContractSelect(contract);
                  onTabChange('analysis');
                }}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <FileText className="h-5 w-5 text-[#667085] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1A1A1A] font-outfit truncate">{contract.project_name || 'Untitled Project'}</p>
                    <p className="text-sm text-[#667085] font-outfit truncate">
                      {contract.client_name || contract.account_name || 'Unknown Client'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge className={`${getStatusColor(contract.status)} text-xs font-outfit`}>
                    {contract.status?.replace('-', ' ') || 'Unknown'}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onContractSelect(contract);
                      onTabChange('analysis');
                    }}
                    className="h-8 px-3 font-outfit text-[#667085] hover:text-[#161950] hover:bg-[#F9FAFB]"
                  >
                    View
                  </Button>
                </div>
              </div>
            ))}
            {filteredContracts.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-[#D0D5DD] mx-auto mb-3" />
                <p className="text-sm text-[#667085] font-outfit">No recent contracts</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] flex flex-col gap-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <div className="flex justify-start items-start gap-6">
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <h2 className="text-[#1A1A1A] text-lg font-semibold font-outfit leading-7">
                  Risk Distribution
                </h2>
                <Badge variant="outline" className="bg-[#F9FAFB] text-[#667085] border-[#E5E7EB] px-2.5 py-1 font-outfit">
                  <TrendingUp className="h-3 w-3 mr-1.5" />
                  AI Analysis
                </Badge>
              </div>
              <p className="text-[#667085] text-sm font-normal font-outfit">
                Across active contracts
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#1A1A1A] font-outfit">High Risk</span>
                <span className="text-sm font-bold text-[#D92D20] font-outfit">
                  {contracts.length > 0
                    ? Math.round((highRiskContracts / Math.max(activeContracts, 1)) * 100)
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-[#EAECF0] rounded-full h-2.5">
                <div
                  className="bg-[#D92D20] h-2.5 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      contracts.length > 0
                        ? (highRiskContracts / Math.max(activeContracts, 1)) * 100
                        : 0,
                      100
                    )}%`,
                  }}
                />
              </div>
              <p className="text-xs text-[#667085] font-outfit mt-1">{highRiskContracts} contracts</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#1A1A1A] font-outfit">Medium Risk</span>
                <span className="text-sm font-bold text-[#DC6803] font-outfit">
                  {contracts.length > 0
                    ? Math.round(
                        (contracts.filter((c: any) => c.risk_level === 'medium').length /
                          Math.max(activeContracts, 1)) *
                          100
                      )
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-[#EAECF0] rounded-full h-2.5">
                <div
                  className="bg-[#DC6803] h-2.5 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      contracts.length > 0
                        ? (contracts.filter((c: any) => c.risk_level === 'medium').length /
                            Math.max(activeContracts, 1)) *
                            100
                        : 0,
                      100
                    )}%`,
                  }}
                />
              </div>
              <p className="text-xs text-[#667085] font-outfit mt-1">
                {contracts.filter((c: any) => c.risk_level === 'medium').length} contracts
              </p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#1A1A1A] font-outfit">Low Risk</span>
                <span className="text-sm font-bold text-[#039855] font-outfit">
                  {contracts.length > 0
                    ? Math.round(
                        (contracts.filter((c: any) => c.risk_level === 'low').length /
                          Math.max(activeContracts, 1)) *
                          100
                      )
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-[#EAECF0] rounded-full h-2.5">
                <div
                  className="bg-[#039855] h-2.5 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      contracts.length > 0
                        ? (contracts.filter((c: any) => c.risk_level === 'low').length /
                            Math.max(activeContracts, 1)) *
                            100
                        : 0,
                      100
                    )}%`,
                  }}
                />
              </div>
              <p className="text-xs text-[#667085] font-outfit mt-1">
                {contracts.filter((c: any) => c.risk_level === 'low').length} contracts
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

