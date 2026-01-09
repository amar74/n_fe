import { memo, useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileSignature, 
  Plus, 
  Search, 
  Filter,
  FileCheck,
  AlertTriangle,
  Clock,
  CheckCircle,
  Eye,
  Edit3,
  Brain,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useContracts } from '@/hooks/contracts';

function ContractsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const { useContractsList } = useContracts();
  
  // Fetch contracts
  const { data: contractsData, isLoading, error } = useContractsList({
    page: 1,
    size: 100,
    search: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    risk_level: riskFilter !== 'all' ? riskFilter : undefined,
  });

  // Debug log
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[ContractsPage] Mounted');
      console.log('[ContractsPage] Data:', { contractsData, isLoading, error });
    }
  }, [contractsData, isLoading, error]);

  const contracts = contractsData?.items || [];
  
  // Calculate stats from real data (matching mystic-heaven)
  const stats = useMemo(() => {
    const activeContracts = contracts.filter(
      (c: any) => c.status !== 'archived' && c.status !== 'executed'
    ).length;
    const highRiskContracts = contracts.filter(
      (c: any) => c.risk_level === 'high' && c.status !== 'archived'
    ).length;
    const pendingReviewContracts = contracts.filter(
      (c: any) => c.status === 'awaiting-review' || c.status === 'in-legal-review'
    ).length;
    const executedContracts = contracts.filter((c: any) => c.status === 'executed').length;
    
    return { activeContracts, highRiskContracts, pendingReviewContracts, executedContracts };
  }, [contracts]);

  // Filter contracts for display
  const displayContracts = useMemo(() => {
    return contracts
      .filter((c: any) => c.status !== 'archived')
      .filter((c: any) => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
          (c.client_name || '').toLowerCase().includes(search) ||
          (c.project_name || '').toLowerCase().includes(search) ||
          (c.contract_id || c.id || '').toLowerCase().includes(search)
        );
      })
      .map((c: any) => ({
        id: c.id,
        contractId: c.contract_id || c.id,
        clientName: c.client_name || c.account_name || 'Unknown Client',
        projectName: c.project_name || 'Untitled Project',
        status: c.status,
        riskLevel: c.risk_level || 'medium',
        documentType: c.document_type || 'Contract',
        contractValue: c.contract_value ? `$${(c.contract_value / 1000000).toFixed(1)}M` : 'N/A',
        startDate: c.start_date ? new Date(c.start_date).toLocaleDateString() : 'N/A',
        endDate: c.end_date ? new Date(c.end_date).toLocaleDateString() : 'N/A',
        redClauses: c.red_clauses || 0,
        amberClauses: c.amber_clauses || 0,
        greenClauses: c.green_clauses || 0,
        totalClauses: c.total_clauses || 0,
        assignedReviewer: c.assigned_reviewer,
        lastModified: c.last_modified || c.updated_at || 'N/A',
      }));
  }, [contracts, searchTerm]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'awaiting-review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in-legal-review': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'exceptions-approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'negotiating': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'executed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="w-full h-full bg-[#F5F3F2] font-outfit">
      <div className="flex flex-col w-full p-6 gap-6">
        
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Link to="/" className="text-gray-500 text-sm font-normal font-outfit leading-tight hover:text-gray-900">
                Dashboard
              </Link>
              <span className="text-[#344054] text-sm font-normal font-outfit leading-tight">/</span>
              <span className="text-[#344054] text-sm font-normal font-outfit leading-tight">Contracts</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-[#1A1A1A] text-3xl font-semibold font-outfit leading-loose">
                Contracts
              </h1>
              <Badge variant="outline" className="bg-[#F9FAFB] text-[#667085] border-[#E5E7EB] px-2.5 py-1 font-outfit">
                <Brain className="h-3 w-3 mr-1.5" />
                AI-Powered
              </Badge>
            </div>
            <p className="text-lg text-[#667085] font-outfit">
              Manage and track all contracts with intelligent risk assessment
            </p>
          </div>

          <div className="flex items-start gap-3">
            <Button
              onClick={() => navigate('/module/contracts/create')}
              className="h-11 px-5 py-2 bg-[#161950] hover:bg-[#1E2B5B] rounded-lg flex items-center gap-2.5 shadow-sm font-outfit"
            >
              <Plus className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-medium font-outfit leading-normal">Create New Contract</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="h-20 p-5 bg-white rounded-2xl border border-[#E5E7EB] flex justify-between items-center shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
            <div className="w-14 h-14 p-3 bg-[#EAECF0] rounded-xl flex justify-center items-center overflow-hidden">
              <FileCheck className="h-6 w-6 text-[#1D2939]" />
            </div>
            <div className="flex flex-col justify-between items-end">
              <div className="text-[#667085] text-sm font-normal font-outfit leading-tight">Active Contracts</div>
              <div className="text-[#1A1A1A] text-2xl font-bold font-outfit leading-loose">
                {isLoading ? '...' : stats.activeContracts}
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
                  {isLoading ? '...' : stats.highRiskContracts}
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
                {isLoading ? '...' : stats.pendingReviewContracts}
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
                {isLoading ? '...' : stats.executedContracts}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#667085]" />
              <Input
                type="text"
                placeholder="Search contracts by name, client, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-11 font-outfit border-[#E5E7EB] focus:border-[#161950] focus:ring-1 focus:ring-[#161950] bg-white text-[#1A1A1A]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-4 py-2.5 border border-[#E5E7EB] rounded-lg font-outfit bg-white text-[#667085] focus:border-[#161950] focus:ring-1 focus:ring-[#161950] h-11"
            >
              <option value="all">All Risk Levels</option>
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
            </select>
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] flex flex-col gap-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <div className="flex justify-start items-start gap-6">
            <div className="flex-1 flex flex-col gap-1">
              <h2 className="text-[#1A1A1A] text-lg font-semibold font-outfit leading-7">
                Contract Repository
              </h2>
              <p className="text-[#667085] text-sm font-normal font-outfit">
                {displayContracts.length} {displayContracts.length === 1 ? 'contract' : 'contracts'} found
              </p>
            </div>
          </div>
          <div>
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#161950] mx-auto mb-4"></div>
                  <p className="text-gray-600 font-outfit">Loading contracts...</p>
                </div>
              </div>
            ) : displayContracts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="p-4 bg-gray-100 rounded-full">
                  <FileCheck className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-[#1A1A1A] font-outfit">No contracts found</h3>
                <p className="text-gray-600 font-outfit text-center max-w-sm">Create your first contract to get started with contract management</p>
                <Button 
                  onClick={() => navigate('/module/contracts/create')} 
                  className="bg-[#161950] hover:bg-[#0f1440] text-white font-outfit mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Contract
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {displayContracts.map((contract) => (
                  <div
                    key={contract.id}
                    className="border border-[#E5E7EB] rounded-2xl p-5 hover:border-[#161950]/30 hover:bg-[#F9FAFB] cursor-pointer transition-all bg-white"
                    onClick={() => navigate(`/module/contracts/${contract.id}`)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <h4 className="text-lg font-semibold text-[#1A1A1A] font-outfit">
                            {contract.projectName}
                          </h4>
                          <Badge className={`${getStatusColor(contract.status)} text-xs font-outfit`}>
                            {contract.status.replace('-', ' ')}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`${getRiskColor(contract.riskLevel)} border-current text-xs font-outfit`}
                          >
                            {contract.riskLevel} risk
                          </Badge>
                        </div>
                        <p className="text-[#667085] mb-3 font-outfit">{contract.clientName}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-[#667085] font-outfit mb-3">
                          <span className="flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5" />
                            {contract.contractId}
                          </span>
                          <span>{contract.documentType}</span>
                          {contract.contractValue !== 'N/A' && (
                            <span className="font-medium text-[#1A1A1A]">{contract.contractValue}</span>
                          )}
                        </div>
                        {contract.totalClauses > 0 && (
                          <div className="flex items-center gap-2 text-xs font-outfit">
                            <span className="px-2.5 py-1 bg-[#FEE4E2] text-[#D92D20] rounded-md border border-[#E5E7EB]">
                              Red: {contract.redClauses}
                            </span>
                            <span className="px-2.5 py-1 bg-[#FEF0C7] text-[#DC6803] rounded-md border border-[#E5E7EB]">
                              Amber: {contract.amberClauses}
                            </span>
                            <span className="px-2.5 py-1 bg-[#D1FADF] text-[#039855] rounded-md border border-[#E5E7EB]">
                              Green: {contract.greenClauses}
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
    </div>
  );
}

export default memo(ContractsPage);
