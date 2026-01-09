import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Download, FileCheck, Shield, Calendar, DollarSign, User, AlertTriangle, CheckCircle, Clock, Link as LinkIcon, FileText, Target, Building2, ExternalLink, Loader2, TrendingUp, FileBarChart, Briefcase, Hash, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useContracts } from '@/hooks/contracts';
import { useToast } from '@/hooks/shared';
import { apiClient } from '@/services/api/client';
import { useState } from 'react';
import { useAccountDetail } from '@/hooks/accounts/useAccounts';
import { useOpportunity } from '@/hooks/opportunities';
import { useProposals } from '@/hooks/proposals/useProposals';

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useContract } = useContracts();
  const { toast } = useToast();
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  
  const { data: contract, isLoading } = useContract(id, !!id);

  // Fetch related data - only fetch if IDs exist
  const { accountDetail, isAccountDetailLoading } = useAccountDetail(contract?.account_id || '');
  const { data: opportunity, isLoading: isOpportunityLoading } = useOpportunity(contract?.opportunity_id || '', !!contract?.opportunity_id);
  const { useProposal } = useProposals();
  const { data: proposal, isLoading: isProposalLoading } = useProposal(contract?.proposal_id, !!contract?.proposal_id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F3F2] flex items-center justify-center font-outfit">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#161950] mx-auto mb-4"></div>
          <p className="text-[#667085] font-outfit">Loading contract...</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-[#F5F3F2] flex items-center justify-center font-outfit">
        <div className="text-center">
          <div className="p-4 bg-[#F9FAFB] rounded-full w-fit mx-auto mb-4">
            <FileCheck className="h-12 w-12 text-[#D0D5DD]" />
          </div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4 font-outfit">Contract Not Found</h2>
          <p className="text-[#667085] mb-6 font-outfit">The contract you're looking for doesn't exist or has been removed.</p>
          <Button 
            onClick={() => navigate('/module/contracts')} 
            className="h-11 px-5 bg-[#161950] hover:bg-[#1E2B5B] text-white rounded-lg font-outfit"
          >
            Back to Contracts
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'awaiting-review': return 'bg-[#FFFAEB] text-[#DC6803] border-[#FEDF89]';
      case 'in-legal-review': return 'bg-[#EFF8FF] text-[#175CD3] border-[#B2DDFF]';
      case 'exceptions-approved': return 'bg-[#ECFDF3] text-[#039855] border-[#ABEFC6]';
      case 'negotiating': return 'bg-[#F4F3FF] text-[#6941C6] border-[#D6BBFB]';
      case 'executed': return 'bg-[#F9FAFB] text-[#344054] border-[#D0D5DD]';
      default: return 'bg-[#F9FAFB] text-[#344054] border-[#D0D5DD]';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-[#D92D20] bg-[#FEF3F2] border-[#FECDCA]';
      case 'medium': return 'text-[#DC6803] bg-[#FFFAEB] border-[#FEDF89]';
      case 'low': return 'text-[#039855] bg-[#ECFDF3] border-[#ABEFC6]';
      default: return 'text-[#667085] bg-[#F9FAFB] border-[#E5E7EB]';
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  const handleExportPDF = async () => {
    try {
      toast.info('Generating PDF... This may take a moment.');
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Please allow popups to export PDF');
        return;
      }

      // Helper functions for styling
      const getStatusBgColor = (status: string) => {
        if (status.includes('awaiting-review')) return '#FFFAEB';
        if (status.includes('exceptions-approved') || status.includes('executed')) return '#ECFDF3';
        if (status.includes('in-legal-review')) return '#EFF8FF';
        return '#F9FAFB';
      };

      const getStatusTextColor = (status: string) => {
        if (status.includes('awaiting-review')) return '#DC6803';
        if (status.includes('exceptions-approved') || status.includes('executed')) return '#039855';
        if (status.includes('in-legal-review')) return '#175CD3';
        return '#344054';
      };

      const getRiskBgColor = (risk: string) => {
        if (risk === 'high') return '#FEF3F2';
        if (risk === 'medium') return '#FFFAEB';
        return '#ECFDF3';
      };

      const getRiskTextColor = (risk: string) => {
        if (risk === 'high') return '#D92D20';
        if (risk === 'medium') return '#DC6803';
        return '#039855';
      };

      const formatStatus = (status: string) => {
        return status.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
      };

      const formatRisk = (risk: string) => {
        return (risk || 'medium').charAt(0).toUpperCase() + (risk || 'medium').slice(1);
      };

      const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        });
      };

      const formatGeneratedDate = () => {
        return new Date().toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      };

      const financialSection = contract.contract_value ? `
        <div class="section">
          <div class="section-title">Financial Information</div>
          <div class="financial">
            <div class="info-label">Contract Value</div>
            <div class="financial-value">${formatCurrency(contract.contract_value)}</div>
            ${contract.start_date ? `
              <div class="info-item">
                <div class="info-label">Start Date</div>
                <div class="info-value">${formatDate(contract.start_date)}</div>
              </div>
            ` : ''}
            ${contract.end_date ? `
              <div class="info-item">
                <div class="info-label">End Date</div>
                <div class="info-value">${formatDate(contract.end_date)}</div>
              </div>
            ` : ''}
          </div>
        </div>
      ` : '';

      const riskAnalysisSection = contract.total_clauses && contract.total_clauses > 0 ? `
        <div class="section">
          <div class="section-title">Risk Analysis</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">High Risk Clauses</div>
              <div class="info-value" style="color: #D92D20; font-size: 24px;">${contract.red_clauses || 0}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Medium Risk Clauses</div>
              <div class="info-value" style="color: #DC6803; font-size: 24px;">${contract.amber_clauses || 0}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Low Risk Clauses</div>
              <div class="info-value" style="color: #039855; font-size: 24px;">${contract.green_clauses || 0}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Total Clauses</div>
              <div class="info-value" style="font-size: 24px;">${contract.total_clauses}</div>
            </div>
          </div>
        </div>
      ` : '';

      const contractHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Contract - ${contract.project_name || 'Contract Details'}</title>
            <style>
              @media print {
                @page { margin: 20mm; }
              }
              body {
                font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                color: #1A1A1A;
                line-height: 1.6;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                border-bottom: 3px solid #161950;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              .header h1 {
                color: #161950;
                font-size: 28px;
                margin: 0 0 10px 0;
              }
              .header .contract-id {
                color: #667085;
                font-size: 14px;
              }
              .section {
                margin-bottom: 30px;
                page-break-inside: avoid;
              }
              .section-title {
                color: #161950;
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 15px;
                border-bottom: 2px solid #E5E7EB;
                padding-bottom: 10px;
              }
              .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 20px;
              }
              .info-item {
                margin-bottom: 15px;
              }
              .info-label {
                color: #667085;
                font-size: 12px;
                text-transform: uppercase;
                font-weight: 600;
                margin-bottom: 5px;
              }
              .info-value {
                color: #1A1A1A;
                font-size: 16px;
                font-weight: 600;
              }
              .badge {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
              }
              .financial {
                background: #F9FAFB;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
              }
              .financial-value {
                font-size: 32px;
                font-weight: bold;
                color: #039855;
                margin: 10px 0;
              }
              .footer {
                margin-top: 50px;
                padding-top: 20px;
                border-top: 2px solid #E5E7EB;
                color: #667085;
                font-size: 12px;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${contract.project_name || 'Contract Details'}</h1>
              <div class="contract-id">Contract ID: ${contract.contract_id || contract.id}</div>
            </div>

            <div class="section">
              <div class="section-title">Contract Overview</div>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Client Name</div>
                  <div class="info-value">${contract.client_name || contract.account_name || 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Project Name</div>
                  <div class="info-value">${contract.project_name || 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Document Type</div>
                  <div class="info-value">${contract.document_type || 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Version</div>
                  <div class="info-value">${contract.version || 'v1.0'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Status</div>
                  <div class="info-value">
                    <span class="badge" style="background: ${getStatusBgColor(contract.status)}; color: ${getStatusTextColor(contract.status)};">
                      ${formatStatus(contract.status)}
                    </span>
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-label">Risk Level</div>
                  <div class="info-value">
                    <span class="badge" style="background: ${getRiskBgColor(contract.risk_level)}; color: ${getRiskTextColor(contract.risk_level)};">
                      ${formatRisk(contract.risk_level)} Risk
                    </span>
                  </div>
                </div>
              </div>
            </div>

            ${financialSection}

            ${riskAnalysisSection}

            <div class="footer">
              <p>Generated on ${formatGeneratedDate()}</p>
              <p>Megapolis Advisory - Contract Management System</p>
            </div>
          </body>
        </html>
      `;

      printWindow.document.write(contractHtml);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
        toast.success('PDF export initiated. Use the print dialog to save as PDF.');
      }, 500);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF. Please try again.');
    }
  };

  const handleCreateProject = async () => {
    if (!contract || contract.status !== 'executed') {
      toast.error('Only executed contracts can create projects');
      return;
    }

    if (contract.project_id) {
      toast.info('Project already exists for this contract');
      navigate(`/module/projects/${contract.project_id}`);
      return;
    }

    setIsCreatingProject(true);
    try {
      const response = await apiClient.post('/projects/from-contract', {
        contract_id: contract.id,
      });
      toast.success('Project created successfully from contract');
      // Handle both response formats: response.data.id or response.data.data.id
      const projectId = response.data?.data?.id || response.data?.id;
      if (projectId) {
        navigate(`/module/projects/${projectId}`);
      } else {
        toast.error('Project created but ID not found in response');
      }
    } catch (error: any) {
      console.error('Error creating project:', error);
      const errorMessage = error?.response?.data?.detail || error?.response?.data?.message || 'Failed to create project from contract';
      toast.error(errorMessage);
    } finally {
      setIsCreatingProject(false);
    }
  };

  return (
    <div className="w-full h-full bg-[#F5F3F2] font-outfit">
      <div className="flex flex-col w-full p-6 gap-6">
        <div className="flex flex-col gap-4 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/module/contracts')}
            className="w-fit h-9 px-3 text-[#667085] hover:text-[#1A1A1A] hover:bg-[#F9FAFB] font-outfit"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Contracts
          </Button>
          
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#161950] to-[#1E2B5B] flex items-center justify-center shadow-lg">
                  <FileCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-[#1A1A1A] text-3xl font-bold font-outfit leading-tight">
                    {contract.project_name || 'Contract Details'}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Hash className="h-3 w-3 text-[#667085]" />
                    <p className="text-sm text-[#667085] font-outfit font-medium">
                      {contract.contract_id || contract.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleExportPDF}
                className="h-11 px-4 border-[#E5E7EB] text-[#667085] hover:bg-[#F9FAFB] hover:border-[#D0D5DD] rounded-lg font-outfit font-medium shadow-sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button
                onClick={() => navigate(`/module/contracts/${id}/edit`)}
                className="h-11 px-5 bg-[#161950] hover:bg-[#1E2B5B] text-white rounded-lg shadow-md font-outfit font-medium"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Contract
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-8 bg-white rounded-2xl border border-[#E5E7EB] flex flex-col gap-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.08)] transition-shadow">
              <div className="flex justify-between items-start pb-4 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#161950]/10 to-[#1E2B5B]/10 flex items-center justify-center">
                    <FileBarChart className="h-5 w-5 text-[#161950]" />
                  </div>
                  <div>
                    <h2 className="text-[#1A1A1A] text-xl font-bold font-outfit leading-7">
                      Contract Overview
                    </h2>
                    <p className="text-[#667085] text-sm font-normal font-outfit mt-0.5">
                      Basic information and status
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] hover:bg-[#F5F3F2] transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-4 w-4 text-[#667085]" />
                    <label className="text-xs font-medium text-[#667085] font-outfit uppercase tracking-wide">Client Name</label>
                  </div>
                  <p className="text-lg font-bold text-[#1A1A1A] font-outfit">
                    {contract.client_name || contract.account_name || 'N/A'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] hover:bg-[#F5F3F2] transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="h-4 w-4 text-[#667085]" />
                    <label className="text-xs font-medium text-[#667085] font-outfit uppercase tracking-wide">Project Name</label>
                  </div>
                  <p className="text-lg font-bold text-[#1A1A1A] font-outfit">
                    {contract.project_name || 'N/A'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] hover:bg-[#F5F3F2] transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-[#667085]" />
                    <label className="text-xs font-medium text-[#667085] font-outfit uppercase tracking-wide">Document Type</label>
                  </div>
                  <p className="text-lg font-bold text-[#1A1A1A] font-outfit">
                    {contract.document_type || 'N/A'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] hover:bg-[#F5F3F2] transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="h-4 w-4 text-[#667085]" />
                    <label className="text-xs font-medium text-[#667085] font-outfit uppercase tracking-wide">Version</label>
                  </div>
                  <p className="text-lg font-bold text-[#1A1A1A] font-outfit">
                    {contract.version || 'v1.0'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] hover:bg-[#F5F3F2] transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-[#667085]" />
                    <label className="text-xs font-medium text-[#667085] font-outfit uppercase tracking-wide">Status</label>
                  </div>
                  <div className="mt-1">
                    <Badge className={`${getStatusColor(contract.status)} font-outfit font-semibold px-3 py-1 border`}>
                      {contract.status.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}
                    </Badge>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] hover:bg-[#F5F3F2] transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-[#667085]" />
                    <label className="text-xs font-medium text-[#667085] font-outfit uppercase tracking-wide">Risk Level</label>
                  </div>
                  <div className="mt-1">
                    <Badge variant="outline" className={`${getRiskColor(contract.risk_level)} font-outfit font-semibold px-3 py-1 border`}>
                      {contract.risk_level || 'medium'} Risk
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {contract.contract_value && (
              <div className="p-8 bg-gradient-to-br from-white to-[#F9FAFB] rounded-2xl border border-[#E5E7EB] flex flex-col gap-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.08)] transition-shadow">
                <div className="flex justify-between items-start pb-4 border-b border-[#E5E7EB]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#039855]/10 to-[#027A48]/10 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-[#039855]" />
                    </div>
                    <div>
                      <h2 className="text-[#1A1A1A] text-xl font-bold font-outfit leading-7">
                        Financial Information
                      </h2>
                      <p className="text-[#667085] text-sm font-normal font-outfit mt-0.5">
                        Contract value and timeline
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div className="p-5 rounded-xl bg-white border-2 border-[#039855]/20 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-4 w-4 text-[#039855]" />
                      <label className="text-xs font-medium text-[#667085] font-outfit uppercase tracking-wide">Contract Value</label>
                    </div>
                    <p className="text-3xl font-bold text-[#039855] font-outfit">
                      {formatCurrency(contract.contract_value)}
                    </p>
                    <p className="text-xs text-[#667085] font-outfit mt-1">USD</p>
                  </div>
                  {contract.start_date && (
                    <div className="p-5 rounded-xl bg-white border border-[#E5E7EB] shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="h-4 w-4 text-[#667085]" />
                        <label className="text-xs font-medium text-[#667085] font-outfit uppercase tracking-wide">Start Date</label>
                      </div>
                      <p className="text-xl font-bold text-[#1A1A1A] font-outfit">
                        {new Date(contract.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  )}
                  {contract.end_date && (
                    <div className="p-5 rounded-xl bg-white border border-[#E5E7EB] shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="h-4 w-4 text-[#667085]" />
                        <label className="text-xs font-medium text-[#667085] font-outfit uppercase tracking-wide">End Date</label>
                      </div>
                      <p className="text-xl font-bold text-[#1A1A1A] font-outfit">
                        {new Date(contract.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {contract.total_clauses && contract.total_clauses > 0 && (
              <div className="p-8 bg-white rounded-2xl border border-[#E5E7EB] flex flex-col gap-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.08)] transition-shadow">
                <div className="flex justify-between items-start pb-4 border-b border-[#E5E7EB]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D92D20]/10 to-[#DC6803]/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-[#D92D20]" />
                    </div>
                    <div>
                      <h2 className="text-[#1A1A1A] text-xl font-bold font-outfit leading-7">
                        Risk Analysis
                      </h2>
                      <p className="text-[#667085] text-sm font-normal font-outfit mt-0.5">
                        Clause analysis and risk assessment
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-6 bg-gradient-to-br from-[#FEF3F2] to-[#FEE4E2] rounded-2xl border-2 border-[#D92D20]/30 shadow-sm hover:shadow-md transition-shadow">
                    <AlertTriangle className="h-8 w-8 text-[#D92D20] mx-auto mb-3" />
                    <div className="text-4xl font-bold text-[#D92D20] font-outfit">
                      {contract.red_clauses || 0}
                    </div>
                    <p className="text-sm text-[#1A1A1A] font-bold font-outfit mt-2">High Risk</p>
                    <p className="text-xs text-[#667085] font-outfit mt-1">Clauses</p>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-[#FFFAEB] to-[#FEF0C7] rounded-2xl border-2 border-[#DC6803]/30 shadow-sm hover:shadow-md transition-shadow">
                    <Clock className="h-8 w-8 text-[#DC6803] mx-auto mb-3" />
                    <div className="text-4xl font-bold text-[#DC6803] font-outfit">
                      {contract.amber_clauses || 0}
                    </div>
                    <p className="text-sm text-[#1A1A1A] font-bold font-outfit mt-2">Medium Risk</p>
                    <p className="text-xs text-[#667085] font-outfit mt-1">Clauses</p>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-[#ECFDF3] to-[#D1FADF] rounded-2xl border-2 border-[#039855]/30 shadow-sm hover:shadow-md transition-shadow">
                    <CheckCircle className="h-8 w-8 text-[#039855] mx-auto mb-3" />
                    <div className="text-4xl font-bold text-[#039855] font-outfit">
                      {contract.green_clauses || 0}
                    </div>
                    <p className="text-sm text-[#1A1A1A] font-bold font-outfit mt-2">Low Risk</p>
                    <p className="text-xs text-[#667085] font-outfit mt-1">Clauses</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-[#E5E7EB] bg-[#F9FAFB] rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-[#667085] font-outfit">Total Clauses Analyzed</label>
                      <p className="text-2xl font-bold text-[#1A1A1A] font-outfit mt-1">
                        {contract.total_clauses}
                      </p>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#161950] to-[#1E2B5B] flex items-center justify-center">
                      <FileBarChart className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] flex flex-col gap-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.08)] transition-shadow">
              <div className="flex justify-between items-start pb-4 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#161950]/10 to-[#1E2B5B]/10 flex items-center justify-center">
                    <FileCheck className="h-5 w-5 text-[#161950]" />
                  </div>
                  <h2 className="text-[#1A1A1A] text-lg font-bold font-outfit leading-7">
                    Quick Actions
                  </h2>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 border-[#E5E7EB] text-[#1A1A1A] hover:bg-[#F9FAFB] hover:border-[#161950]/30 hover:text-[#161950] rounded-xl font-outfit font-medium shadow-sm transition-all"
                  onClick={() => navigate(`/module/contracts/${id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-3" />
                  Edit Contract
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 border-[#E5E7EB] text-[#1A1A1A] hover:bg-[#F9FAFB] hover:border-[#161950]/30 hover:text-[#161950] rounded-xl font-outfit font-medium shadow-sm transition-all"
                  onClick={handleExportPDF}
                >
                  <Download className="h-4 w-4 mr-3" />
                  Download PDF
                </Button>
              </div>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] flex flex-col gap-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.08)] transition-shadow">
              <div className="flex justify-between items-start pb-4 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#161950]/10 to-[#1E2B5B]/10 flex items-center justify-center">
                    <LinkIcon className="h-5 w-5 text-[#161950]" />
                  </div>
                  <div>
                    <h2 className="text-[#1A1A1A] text-lg font-bold font-outfit leading-7">
                      Related Records
                    </h2>
                    <p className="text-[#667085] text-xs font-normal font-outfit mt-0.5">
                      Linked records from other modules
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {contract.account_id && (
                  <div className="p-4 border border-[#E5E7EB] rounded-2xl hover:border-[#161950]/30 hover:bg-[#F9FAFB] cursor-pointer transition-all bg-white"
                    onClick={() => navigate(`/module/accounts/${contract.account_id}`)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 p-2 bg-[#EAECF0] rounded-xl flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-[#161950]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1A1A1A] font-outfit">Account</p>
                          {isAccountDetailLoading ? (
                            <div className="flex items-center gap-2 mt-1">
                              <Loader2 className="h-3 w-3 animate-spin text-[#667085]" />
                              <p className="text-xs text-[#667085] font-outfit">Loading...</p>
                            </div>
                          ) : accountDetail ? (
                            <>
                              <p className="text-xs text-[#667085] font-outfit truncate">{accountDetail.client_name || accountDetail.account_name || 'N/A'}</p>
                              {accountDetail.client_address_city && accountDetail.client_address_state && (
                                <p className="text-xs text-[#667085] font-outfit">{accountDetail.client_address_city}, {accountDetail.client_address_state}</p>
                              )}
                            </>
                          ) : (
                            <p className="text-xs text-[#667085] font-outfit">{contract.account_name || contract.client_name || 'Unknown'}</p>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 px-3 text-[#667085] hover:text-[#161950] hover:bg-[#F9FAFB] font-outfit flex-shrink-0">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                )}

                {contract.opportunity_id && (
                  <div className="p-4 border border-[#E5E7EB] rounded-2xl hover:border-[#161950]/30 hover:bg-[#F9FAFB] cursor-pointer transition-all bg-white"
                    onClick={() => navigate(`/module/opportunities/${contract.opportunity_id}`)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 p-2 bg-[#EAECF0] rounded-xl flex items-center justify-center">
                          <Target className="h-5 w-5 text-[#161950]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1A1A1A] font-outfit">Opportunity</p>
                          {isOpportunityLoading ? (
                            <div className="flex items-center gap-2 mt-1">
                              <Loader2 className="h-3 w-3 animate-spin text-[#667085]" />
                              <p className="text-xs text-[#667085] font-outfit">Loading...</p>
                            </div>
                          ) : opportunity ? (
                            <>
                              <p className="text-xs text-[#667085] font-outfit truncate">{opportunity.project_name || opportunity.client_name || 'N/A'}</p>
                              {opportunity.stage && (
                                <Badge variant="outline" className="mt-1 text-xs font-outfit border-[#E5E7EB] text-[#667085]">
                                  {opportunity.stage}
                                </Badge>
                              )}
                            </>
                          ) : (
                            <p className="text-xs text-[#667085] font-outfit">Linked opportunity</p>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 px-3 text-[#667085] hover:text-[#161950] hover:bg-[#F9FAFB] font-outfit flex-shrink-0">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                )}

                {contract.proposal_id && (
                  <div className="p-4 border border-[#E5E7EB] rounded-2xl hover:border-[#161950]/30 hover:bg-[#F9FAFB] cursor-pointer transition-all bg-white"
                    onClick={() => navigate(`/proposals/${contract.proposal_id}`)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 p-2 bg-[#EAECF0] rounded-xl flex items-center justify-center">
                          <FileText className="h-5 w-5 text-[#161950]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1A1A1A] font-outfit">Proposal</p>
                          {isProposalLoading ? (
                            <div className="flex items-center gap-2 mt-1">
                              <Loader2 className="h-3 w-3 animate-spin text-[#667085]" />
                              <p className="text-xs text-[#667085] font-outfit">Loading...</p>
                            </div>
                          ) : proposal ? (
                            <>
                              <p className="text-xs text-[#667085] font-outfit truncate">{proposal.name || proposal.title || proposal.proposal_number || 'N/A'}</p>
                              {proposal.status && (
                                <Badge variant="outline" className="mt-1 text-xs font-outfit border-[#E5E7EB] text-[#667085]">
                                  {proposal.status}
                                </Badge>
                              )}
                            </>
                          ) : (
                            <p className="text-xs text-[#667085] font-outfit">Source proposal</p>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 px-3 text-[#667085] hover:text-[#161950] hover:bg-[#F9FAFB] font-outfit flex-shrink-0">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                )}

                {contract.project_id ? (
                  <div className="p-4 border border-[#039855]/20 rounded-2xl hover:border-[#039855]/40 hover:bg-[#ECFDF3] cursor-pointer transition-all bg-[#ECFDF3]/50"
                    onClick={() => navigate(`/module/projects/${contract.project_id}`)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 p-2 bg-[#D1FADF] rounded-xl flex items-center justify-center">
                          <FileCheck className="h-5 w-5 text-[#039855]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1A1A1A] font-outfit">Project</p>
                          <p className="text-xs text-[#039855] font-outfit font-medium">Project created from this contract</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 px-3 text-[#039855] hover:text-[#027A48] hover:bg-[#D1FADF] font-outfit flex-shrink-0">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ) : contract.status === 'executed' && (
                  <div className="p-4 border border-dashed border-[#E5E7EB] rounded-2xl bg-[#F9FAFB]">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 p-2 bg-[#EAECF0] rounded-xl flex items-center justify-center">
                        <FileCheck className="h-5 w-5 text-[#667085]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#1A1A1A] font-outfit">No Project Created</p>
                        <p className="text-xs text-[#667085] font-outfit">Create a project from this executed contract</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleCreateProject}
                      disabled={isCreatingProject}
                      className="w-full h-10 bg-[#161950] hover:bg-[#1E2B5B] text-white rounded-lg font-outfit"
                    >
                      {isCreatingProject ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Project from Contract'
                      )}
                    </Button>
                  </div>
                )}

                {!contract.account_id && !contract.opportunity_id && !contract.proposal_id && !contract.project_id && (
                  <div className="p-4 border border-dashed border-[#E5E7EB] rounded-2xl bg-[#F9FAFB] text-center">
                    <p className="text-sm text-[#667085] font-outfit">No related records found</p>
                    <p className="text-xs text-[#667085] font-outfit mt-1">This contract is not linked to any accounts, opportunities, proposals, or projects</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] flex flex-col gap-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
              <div className="flex justify-start items-start gap-6">
                <div className="flex-1 flex flex-col gap-1">
                  <h2 className="text-[#1A1A1A] text-lg font-semibold font-outfit leading-7">
                    Contract Details
                  </h2>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium text-[#667085] font-outfit">Contract ID</label>
                  <p className="text-sm font-semibold text-[#1A1A1A] font-outfit mt-1">
                    {contract.contract_id || contract.id}
                  </p>
                </div>
                {contract.assigned_reviewer && (
                  <div>
                    <label className="text-sm font-medium text-[#667085] font-outfit">Assigned Reviewer</label>
                    <p className="text-sm font-semibold text-[#1A1A1A] font-outfit mt-1">
                      {contract.assigned_reviewer}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-[#667085] font-outfit">Last Modified</label>
                  <p className="text-sm font-semibold text-[#1A1A1A] font-outfit mt-1">
                    {contract.last_modified || contract.updated_at 
                      ? new Date(contract.last_modified || contract.updated_at).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
                {contract.upload_date && (
                  <div>
                    <label className="text-sm font-medium text-[#667085] font-outfit">Upload Date</label>
                    <p className="text-sm font-semibold text-[#1A1A1A] font-outfit mt-1">
                      {new Date(contract.upload_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

