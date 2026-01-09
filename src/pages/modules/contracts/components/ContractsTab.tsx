import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, FileCheck, Eye, Edit3, FileText } from 'lucide-react';
import type { Contract } from '@/services/api/contractsApi';
import { getStatusColor, getRiskColor } from './utils';

interface ContractsTabProps {
  contracts: Contract[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterStatus: string;
  onFilterStatusChange: (status: string) => void;
  filterRisk: string;
  onFilterRiskChange: (risk: string) => void;
  onContractSelect?: (contract: Contract) => void;
}

export function ContractsTab({
  contracts,
  isLoading,
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  filterRisk,
  onFilterRiskChange,
  onContractSelect,
}: ContractsTabProps) {
  const navigate = useNavigate();

  const filteredContracts = contracts.filter((contract: any) => {
    const matchesSearch =
      (contract.client_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contract.project_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contract.contract_id || contract.id || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || contract.status === filterStatus;
    const matchesRisk =
      filterRisk === 'all' || contract.risk_level === filterRisk;
    return matchesSearch && matchesStatus && matchesRisk;
  });

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#667085]" />
            <Input
              type="text"
              placeholder="Search contracts by name, client, or ID..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 h-11 font-outfit border-[#E5E7EB] focus:border-[#161950] focus:ring-1 focus:ring-[#161950] bg-white text-[#1A1A1A]"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => onFilterStatusChange(e.target.value)}
            className="px-4 py-2.5 border border-[#E5E7EB] rounded-lg font-outfit bg-white text-[#667085] focus:border-[#161950] focus:ring-1 focus:ring-[#161950] h-11"
          >
            <option value="all">All Status</option>
            <option value="awaiting-review">Awaiting Review</option>
            <option value="in-legal-review">In Legal Review</option>
            <option value="exceptions-approved">Exceptions Approved</option>
            <option value="negotiating">Negotiating</option>
            <option value="executed">Executed</option>
          </select>
          <select
            value={filterRisk}
            onChange={(e) => onFilterRiskChange(e.target.value)}
            className="px-4 py-2.5 border border-[#E5E7EB] rounded-lg font-outfit bg-white text-[#667085] focus:border-[#161950] focus:ring-1 focus:ring-[#161950] h-11"
          >
            <option value="all">All Risk Levels</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
          </select>
          <Button
            onClick={() => navigate('/module/contracts/create')}
            className="h-11 px-5 bg-[#161950] hover:bg-[#1E2B5B] text-white rounded-lg flex items-center gap-2.5 shadow-sm font-outfit whitespace-nowrap"
          >
            <Plus className="w-5 h-5 text-white" />
            <span className="text-white text-sm font-medium font-outfit leading-normal">New Contract</span>
          </Button>
        </div>
      </div>

      <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] flex flex-col gap-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <div className="flex justify-start items-start gap-6">
          <div className="flex-1 flex flex-col gap-1">
            <h2 className="text-[#1A1A1A] text-lg font-semibold font-outfit leading-7">
              Contract Repository
            </h2>
            <p className="text-[#667085] text-sm font-normal font-outfit">
              Centralized repository with version control and AI-powered risk analysis
            </p>
          </div>
        </div>
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#161950] mx-auto mb-4"></div>
                <p className="text-[#667085] font-outfit">Loading contracts...</p>
              </div>
            </div>
          ) : filteredContracts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="p-4 bg-[#F9FAFB] rounded-full">
                <FileCheck className="w-8 h-8 text-[#D0D5DD]" />
              </div>
              <h3 className="text-xl font-semibold text-[#1A1A1A] font-outfit">No contracts found</h3>
              <p className="text-[#667085] font-outfit text-center max-w-sm">Create your first contract to get started with contract management</p>
              <Button
                onClick={() => navigate('/module/contracts/create')}
                className="bg-[#161950] hover:bg-[#1E2B5B] text-white font-outfit mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Contract
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredContracts.map((contract: any) => (
                <div
                  key={contract.id}
                  className="border border-[#E5E7EB] rounded-2xl p-5 hover:border-[#161950]/30 hover:bg-[#F9FAFB] cursor-pointer transition-all bg-white"
                  onClick={() => {
                    if (onContractSelect) {
                      onContractSelect(contract);
                    } else {
                      navigate(`/module/contracts/${contract.id}`);
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <h4 className="text-lg font-semibold text-[#1A1A1A] font-outfit">
                          {contract.project_name || 'Untitled Project'}
                        </h4>
                        <Badge className={`${getStatusColor(contract.status)} text-xs font-outfit`}>
                          {contract.status?.replace('-', ' ') || 'Unknown'}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`${getRiskColor(contract.risk_level || 'medium')} border-current text-xs font-outfit`}
                        >
                          {contract.risk_level || 'medium'} risk
                        </Badge>
                      </div>
                      <p className="text-[#667085] mb-3 font-outfit">{contract.client_name || contract.account_name || 'Unknown Client'}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-[#667085] font-outfit mb-3">
                        <span className="flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5" />
                          {contract.contract_id || contract.id}
                        </span>
                        <span>{contract.document_type || 'Contract'}</span>
                        {contract.contract_value && (
                          <span className="font-medium text-[#1A1A1A]">
                            ${(contract.contract_value / 1000000).toFixed(1)}M
                          </span>
                        )}
                      </div>
                      {(contract.total_clauses && contract.total_clauses > 0) && (
                        <div className="flex items-center gap-2 text-xs font-outfit">
                          <span className="px-2.5 py-1 bg-[#FEE4E2] text-[#D92D20] rounded-md border border-[#E5E7EB]">
                            Red: {contract.red_clauses || 0}
                          </span>
                          <span className="px-2.5 py-1 bg-[#FEF0C7] text-[#DC6803] rounded-md border border-[#E5E7EB]">
                            Amber: {contract.amber_clauses || 0}
                          </span>
                          <span className="px-2.5 py-1 bg-[#D1FADF] text-[#039855] rounded-md border border-[#E5E7EB]">
                            Green: {contract.green_clauses || 0}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/module/contracts/${contract.id}`);
                        }}
                        className="h-9 w-9 p-0 font-outfit text-[#667085] hover:text-[#161950] hover:bg-[#F9FAFB]"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/module/contracts/${contract.id}/edit`);
                        }}
                        className="h-9 w-9 p-0 font-outfit text-[#667085] hover:text-[#161950] hover:bg-[#F9FAFB]"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

