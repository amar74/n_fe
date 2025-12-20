import { memo, useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight, Plus, Scan, Search, ChevronDown } from 'lucide-react';
import { PipelineManagementContent } from './components/PipelineManagementContent';
import { MyOpportunityContent } from './components/MyOpportunityContent';
import { SourceOpportunitiesContent } from './components/SourceOpportunitiesContent';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import { CreateOpportunityModal } from '../../../components/CreateOpportunityModal';
import { useOpportunities, useCreateOpportunity, useOpportunityPipeline } from '@/hooks/opportunities';
import { useAccounts } from '@/hooks/accounts';
import { Opportunity, OpportunityStage, RiskLevel } from '../../../types/opportunities';
import { parseProjectValue } from '@/utils/opportunityUtils';
import { useRolePermissions } from '@/hooks/useRolePermissions';

type TabType = 'source' | 'pipeline' | 'myOpportunity';

interface OpportunityFormData {
  companyWebsite: string;
  opportunityName: string;
  selectedAccount: string;
  location: string;
  projectValue: string;
  salesStage: string;
  marketSector: string;
  date: string;
  opportunityApprover: string;
  projectDescription: string;
}

function OpportunitiesDashboardPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('source');
  const [showFilters, setShowFilters] = useState(true);
  const [searchQuery, setSearchQuery] = useState("Find infrastructure projects in California worth over $5M");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const { canCreate } = useRolePermissions();

  const { data: opportunitiesData, isLoading, error } = useOpportunities({
    page: currentPage,
    size: pageSize,
    sort_by: 'created_at',
    sort_order: 'desc'
  });

  const {
    data: pipelineData,
    isLoading: isPipelineLoading,
    error: pipelineError
  } = useOpportunityPipeline();

  const { accountsList } = useAccounts({ eager: true });
  const accounts = accountsList?.accounts || [];

  const createOpportunityMutation = useCreateOpportunity();

  useEffect(() => {
    const tab = searchParams.get('tab') as TabType;
    if (tab && ['source', 'pipeline', 'myOpportunity'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleSubmitOpportunity = async (data: OpportunityFormData) => {
    try {
      const selectedAccount = accounts.find((acc: any) => acc.account_id === data.selectedAccount);
      const clientName = selectedAccount ? selectedAccount.client_name : data.selectedAccount;

      const opportunityData = {
        project_name: data.opportunityName,
        client_name: clientName,
        description: data.projectDescription,
        stage: OpportunityStage.LEAD,
        risk_level: undefined,
        project_value: data.projectValue ? parseProjectValue(data.projectValue) : undefined,
        currency: 'USD',
        my_role: undefined,
        team_size: undefined,
        expected_rfp_date: data.date ? new Date(data.date).toISOString() : undefined,
        deadline: undefined,
        state: data.location,
        market_sector: data.marketSector,
        match_score: undefined,
        account_id: data.selectedAccount
      };

      await createOpportunityMutation.mutateAsync(opportunityData);
      setIsCreateModalOpen(false);
    } catch {}
  };

  const opportunities = opportunitiesData?.opportunities || [];

  const tabs = [
    { id: 'source' as TabType, label: 'Source Opportunities' },
    { id: 'pipeline' as TabType, label: 'Pipeline Management' },
    { id: 'myOpportunity' as TabType, label: 'My Opportunity' },
  ];

  if (isLoading || isPipelineLoading) {
    return (
      <div className="w-full h-full bg-[#F9FAFB] font-['Inter'] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading opportunities...</p>
        </div>
      </div>
    );
  }
  if (error || pipelineError) {
    return (
      <div className="w-full h-full bg-[#F9FAFB] font-['Inter'] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <p className="text-lg font-semibold">Error loading opportunities</p>
            <p className="text-sm">{error?.message || pipelineError?.message}</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F9FAFB] font-['Inter']">
      <div className="flex flex-col w-full">
        
        <div className="px-8 pt-8 pb-6 bg-white flex justify-between items-end">
          
          <div className="flex flex-col gap-4">
            
            <div className="flex items-center gap-2">
              <Link 
                to="/" 
                className="text-[#9CA3AF] text-sm font-medium font-['Inter'] hover:text-[#111827] transition-colors"
              >
                Dashboard
              </Link>
              <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
              <span className="text-[#111827] text-sm font-medium font-['Inter']">
                Opportunity
              </span>
            </div>

            <h1 className="text-[#111827] text-[28px] font-bold font-['Inter'] tracking-tight">
              Opportunity Management
            </h1>
          </div>

          <div className="flex items-center gap-3">
                {canCreate && (
                  <button 
                    onClick={handleOpenCreateModal}
                    className="h-10 px-4 py-2.5 bg-[#161950] rounded-lg flex items-center gap-2 hover:bg-[#0f1440] transition-all shadow-sm"
                  >
                    <Plus className="w-5 h-5 text-white stroke-[2]" />
                    <span className="text-white text-sm font-semibold font-['Inter']">Create Opportunity</span>
                  </button>
                )}
            
            {canCreate && (
              <button 
                className="h-10 px-4 py-2.5 bg-white rounded-lg border border-[#D1D5DB] flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm"
              >
                <Scan className="w-5 h-5 text-[#374151] stroke-[2]" />
                <span className="text-[#374151] text-sm font-semibold font-['Inter']">AI Proactive Scan</span>
              </button>
            )}
          </div>
        </div>

        <div className="mx-8 my-6 bg-white rounded-2xl border border-[#E5E7EB] shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col gap-8">
              
              <div className="flex items-center justify-between">
                
                <div className="flex items-center bg-[#F8FAFC] rounded-2xl p-2 border border-[#E5E7EB] shadow-sm">
                  {tabs.map((tab, index) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`relative px-8 py-4 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-3 mx-1 ${
                        activeTab === tab.id
                          ? 'bg-white text-[#161950] shadow-lg border border-[#E5E7EB] transform scale-[1.02]'
                          : 'text-[#6B7280] hover:text-[#374151] hover:bg-white/60 hover:transform hover:scale-[1.01]'
                      }`}
                    >
                      <span className="font-['Inter'] font-semibold tracking-wide">
                        {tab.label}
                      </span>
                      
                      {activeTab === tab.id && (
                        <>
                          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-gradient-to-r from-[#161950] to-[#0f1440] rounded-full shadow-sm" />
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#161950] rounded-full flex items-center justify-center shadow-lg">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                        </>
                      )}
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center gap-4">
                  
                  <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#F0F9FF] to-[#EFF6FF] rounded-xl border border-[#BFDBFE] shadow-sm">
                    <div className="w-3 h-3 bg-[#3B82F6] rounded-full animate-pulse shadow-sm" />
                    <span className="text-sm font-semibold text-[#1E40AF]">
                      {activeTab === 'source' && `${opportunities.length} Opportunities`}
                      {activeTab === 'pipeline' && 'Pipeline Active'}
                      {activeTab === 'myOpportunity' && 'My Tasks'}
                    </span>
                  </div>
                  
                  <button className="p-3 text-[#6B7280] hover:text-[#374151] hover:bg-[#F3F4F6] rounded-xl transition-all duration-200 border border-transparent hover:border-[#E5E7EB]">
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-4 px-6 bg-gradient-to-r from-[#F8FAFC] via-[#F1F5F9] to-[#EFF6FF] rounded-2xl border border-[#E5E7EB] shadow-sm">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gradient-to-r from-[#10B981] to-[#059669] rounded-full shadow-sm ring-2 ring-[#10B981]/20" />
                    <span className="text-base font-semibold text-[#374151]">
                      {activeTab === 'source' && 'AI-Powered Opportunity Discovery'}
                      {activeTab === 'pipeline' && 'Pipeline Management & Analytics'}
                      {activeTab === 'myOpportunity' && 'Personal Opportunity Dashboard'}
                    </span>
                  </div>
                  <div className="w-px h-6 bg-gradient-to-b from-transparent via-[#D1D5DB] to-transparent" />
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#6B7280] rounded-full" />
                    <span className="text-sm text-[#6B7280] font-medium">
                      Last updated: {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 text-sm font-semibold text-[#6B7280] hover:text-[#374151] hover:bg-white rounded-xl transition-all duration-200 border border-transparent hover:border-[#E5E7EB] shadow-sm hover:shadow-md">
                    Export
                  </button>
                  <button className="px-4 py-2 text-sm font-semibold text-[#6B7280] hover:text-[#374151] hover:bg-white rounded-xl transition-all duration-200 border border-transparent hover:border-[#E5E7EB] shadow-sm hover:shadow-md">
                    Filter
                  </button>
                  <button className="px-4 py-2 text-sm font-semibold text-[#161950] hover:text-[#0f1440] hover:bg-[#161950]/5 rounded-xl transition-all duration-200 border border-[#161950]/20 hover:border-[#161950]/40 shadow-sm hover:shadow-md">
                    Refresh
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-3 px-4 bg-[#FAFAFA] rounded-xl border border-[#F1F5F9]">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-[#374151]">System Status: Active</span>
                  </div>
                  <div className="w-px h-4 bg-[#E5E7EB]" />
                  <span className="text-sm text-[#6B7280]">
                    {activeTab === 'source' && 'Real-time opportunity scanning enabled'}
                    {activeTab === 'pipeline' && 'Pipeline analytics synchronized'}
                    {activeTab === 'myOpportunity' && 'Personal dashboard updated'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#6B7280] font-medium">Auto-refresh: 30s</span>
                  <div className="w-8 h-1 bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div className="w-full h-full bg-[#10B981] rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {activeTab === 'source' && (
            <SourceOpportunitiesContent opportunities={opportunities} isLoading={isLoading} accounts={accounts} />
        )}
        
        {false && (
          <>
            
            <div className="px-8 pb-6 pt-6">
              <div className="flex items-center gap-3">
                
                <div className="flex-1 h-14 px-4 bg-white rounded-xl border border-[#E5E7EB] flex items-center shadow-sm">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Natural language search: 'Find infrastructure projects in California worth over $5M'"
                    className="flex-1 text-[#667085] text-sm font-normal font-['Outfit'] leading-tight focus:outline-none"
                  />
                </div>

                <button className="w-32 h-14 px-4 py-2 bg-[#0F0901] rounded-xl flex items-center justify-center gap-2.5 hover:bg-black transition-all shadow-md">
                  <Search className="w-5 h-5 text-white stroke-[2]" />
                  <span className="text-white text-sm font-medium font-['Outfit'] leading-tight">Search</span>
                </button>
              </div>
            </div>

        <div className="px-8 pb-7">
          <div className="w-full p-8 bg-white rounded-2xl border border-[#E5E7EB] flex flex-col gap-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
            
            <div className="flex justify-between items-start">
              <h3 className="text-[#1A1A1A] text-xl font-semibold font-['Outfit'] leading-7 tracking-[-0.3px]">
                Smart Search Filter
              </h3>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronDown className={`w-5 h-5 text-[#667085] stroke-[2] transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {showFilters && (
              <>
                
                <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"></div>

                <div className="grid grid-cols-5 gap-6">
                  {['Sector', 'Client Type', 'Project Value', 'Service type', 'Timeline'].map((label, index) => (
                    <div key={index} className="flex flex-col gap-2">
                      <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                        {label}
                      </label>
                      <div className="h-11 px-4 py-2.5 bg-white rounded-lg border border-[#D1D5DB] flex items-center justify-between cursor-pointer hover:border-[#9CA3AF] transition-colors shadow-sm">
                        <span className="text-[#1A1A1A] text-sm font-normal font-['Outfit'] leading-tight">
                          {index === 0 && 'All Sector'}
                          {index === 1 && 'All Clients'}
                          {index === 2 && 'Any Value'}
                          {index === 3 && 'All Services'}
                          {index === 4 && 'Any Timeline'}
                        </span>
                        <ChevronDown className="w-5 h-5 text-[#667085]" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-4">
                  <button className="px-6 py-3 bg-white rounded-xl border border-[#0F0901] hover:bg-gray-50 transition-all shadow-sm">
                    <span className="text-[#0F0901] text-sm font-medium font-['Outfit'] leading-tight">Clear Filter</span>
                  </button>
                  <button className="px-6 py-3 bg-[#0F0901] rounded-xl hover:bg-black transition-all shadow-md">
                    <span className="text-white text-sm font-medium font-['Outfit'] leading-tight">Apply Filter</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="px-8 pb-8">
          <div className="w-full bg-white rounded-2xl border border-[#E5E7EB] flex flex-col overflow-hidden shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
            
            <div className="px-8 py-5 border-b border-[#E5E7EB]">
              <h3 className="text-[#1A1A1A] text-xl font-semibold font-['Outfit'] leading-7 tracking-[-0.3px]">
                AI Discovered Opportunities
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                    <th className="px-6 py-4 text-left text-[#667085] text-xs font-medium font-['Outfit'] uppercase tracking-wide">
                      Opportunity Name
                    </th>
                    <th className="px-4 py-4 text-left text-[#667085] text-xs font-medium font-['Outfit'] uppercase tracking-wide">
                      State
                    </th>
                    <th className="px-4 py-4 text-left text-[#667085] text-xs font-medium font-['Outfit'] uppercase tracking-wide">
                      Market Sector
                    </th>
                    <th className="px-4 py-4 text-left text-[#667085] text-xs font-medium font-['Outfit'] uppercase tracking-wide">
                      Match
                    </th>
                    <th className="px-4 py-4 text-left text-[#667085] text-xs font-medium font-['Outfit'] uppercase tracking-wide">
                      Project Value
                    </th>
                    <th className="px-4 py-4 text-left text-[#667085] text-xs font-medium font-['Outfit'] uppercase tracking-wide">
                      Deadline
                    </th>
                    <th className="px-4 py-4 text-left text-[#667085] text-xs font-medium font-['Outfit'] uppercase tracking-wide">
                      Description
                    </th>
                    <th className="px-4 py-4 text-right text-[#667085] text-xs font-medium font-['Outfit'] uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {opportunities.map((opp, index) => (
                    <tr 
                      key={opp.id} 
                      className={`border-b border-[#E5E7EB] last:border-b-0 hover:bg-[#F9FAFB] transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}`}
                    >
                      <td className="px-6 py-4">
                        <div className="text-[#1A1A1A] text-sm font-semibold font-['Outfit'] leading-tight">
                          {opp.project_name}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-[#0F0901] text-sm font-normal font-['Outfit'] leading-tight">
                          {opp.state || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-[#0F0901] text-sm font-normal font-['Outfit'] leading-tight">
                          {opp.market_sector || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-[#16A34A] text-sm font-semibold font-['Outfit'] leading-tight">
                          {opp.match_score ? `${opp.match_score}%` : '-'}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-[#16A34A] text-sm font-semibold font-['Outfit'] leading-tight">
                          {opp.project_value ? `$${opp.project_value.toLocaleString()}` : '-'}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-[#1A1A1A] text-sm font-normal font-['Outfit'] leading-tight">
                          {opp.deadline ? new Date(opp.deadline).toLocaleDateString() : '-'}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-[#0F0901] text-sm font-normal font-['Outfit'] leading-tight max-w-[200px] truncate">
                          {opp.description}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="px-3 py-2 bg-[#0F0901] rounded-lg hover:bg-black transition-all shadow-sm">
                            <span className="text-white text-xs font-medium font-['Outfit'] leading-tight">
                              Add to pipeline
                            </span>
                          </button>
                          <button 
                            onClick={() => navigate(`/module/opportunities/analysis?opportunityId=${opp.id}`)}
                            className="px-3 py-2 bg-white rounded-lg border border-[#0F0901] hover:bg-gray-50 transition-all shadow-sm"
                          >
                            <span className="text-[#0F0901] text-xs font-medium font-['Outfit'] leading-tight">
                              View Analysis
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
          </>
        )}

        {activeTab === 'pipeline' && (
          <PipelineManagementContent
            opportunities={opportunities}
            pipelineData={pipelineData}
            isLoading={isLoading || isPipelineLoading}
          />
        )}

        {activeTab === 'myOpportunity' && (
          <ErrorBoundary>
            <MyOpportunityContent
              opportunities={opportunities}
              pipelineData={pipelineData}
              isLoading={isLoading || isPipelineLoading}
            />
          </ErrorBoundary>
        )}
      </div>

      <CreateOpportunityModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSubmit={handleSubmitOpportunity}
      />
    </div>
  );
}

  export default memo(OpportunitiesDashboardPage);
