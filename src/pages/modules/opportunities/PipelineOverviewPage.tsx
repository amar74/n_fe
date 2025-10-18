import { memo, useState, Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOpportunity } from '@/hooks/useOpportunity';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bot } from 'lucide-react';

const OverviewTab = lazy(() => import('./components/tabs/OverviewTab'));
const ClientStakeholderTab = lazy(() => import('./components/tabs/ClientStakeholderTab'));
const CompetitionStrategyTab = lazy(() => import('./components/tabs/CompetitionStrategyTab'));
const DeliveryModelTab = lazy(() => import('./components/tabs/DeliveryModelTab'));
const TeamReferencesTab = lazy(() => import('./components/tabs/TeamReferencesTab'));
const FinancialSummaryTab = lazy(() => import('./components/tabs/FinancialSummaryTab'));
const LegalRisksTab = lazy(() => import('./components/tabs/LegalRisksTab'));

type TabType = 'overview' | 'client' | 'competition' | 'delivery' | 'team' | 'financial' | 'legal';

const TabLoadingSkeleton = () => (
  <div className="mx-auto max-w-7xl">
    <div className="bg-white rounded-xl border border-gray-200 p-8">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  </div>
);

function PipelineOverviewPage() {
  const { opportunityId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  const { data: opportunity, isLoading, error } = useOpportunity(opportunityId);

  const renderTabContent = () => {
    const tabProps = { opportunity };
    
    switch (activeTab) {
      case 'overview':
        return <OverviewTab {...tabProps} />;
      case 'client':
        return <ClientStakeholderTab {...tabProps} />;
      case 'competition':
        return <CompetitionStrategyTab {...tabProps} />;
      case 'delivery':
        return <DeliveryModelTab {...tabProps} />;
      case 'team':
        return <TeamReferencesTab {...tabProps} />;
      case 'financial':
        return <FinancialSummaryTab {...tabProps} />;
      case 'legal':
        return <LegalRisksTab {...tabProps} />;
      default:
        return <OverviewTab {...tabProps} />;
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-950"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Opportunity</h2>
          <p className="text-gray-600 mb-6">{error.message}</p>
          <Button onClick={() => navigate('/opportunities')}>
            Back to Opportunities
          </Button>
        </div>
      </div>
    );
  }

  const formattedOpportunity = {
    projectName: opportunity?.project_name,
    custom_id: opportunity?.custom_id,
    category: opportunity?.market_sector,
    projectValue: opportunity?.project_value,
    winProbability: 75, // This will need to be added to the backend API
    aiMatch: opportunity?.match_score,
    expectedRfp: opportunity?.expected_rfp_date,
    currentStage: opportunity?.stage
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview & Scope' },
    { id: 'client' as TabType, label: 'Client & Stakeholder' },
    { id: 'competition' as TabType, label: 'Competition & Strategy' },
    { id: 'delivery' as TabType, label: 'Delivery Model' },
    { id: 'team' as TabType, label: 'Team & References' },
    { id: 'financial' as TabType, label: 'Financial Summary' },
    { id: 'legal' as TabType, label: 'Legal & Risks' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#161950]">
        <div className="px-8 py-5">
          <div className="mx-auto max-w-[1392px]">
            <nav className="flex items-center space-x-3 text-sm">
              <button 
                onClick={() => navigate('/opportunities')}
                className="hover:text-white transition-colors flex items-center gap-3 px-2 py-1 rounded-md hover:bg-white/10"
                style={{ color: 'white' }}
              >
                <ArrowLeft className="w-4 h-4" />
                Pipeline management (Overview & Scope)
              </button>
            </nav>
          </div>
        </div>
      </div>

      <div className="bg-[#161950] text-white">
        <div className="px-8 py-10">
          <div className="mx-auto max-w-[1392px]">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-8">
                <h1 className="text-4xl font-bold leading-tight mb-6" style={{ color: 'white' }}>
                  {formattedOpportunity.projectName}
                </h1>
                <div className="flex items-center gap-4 mb-6 mt-3">
                  <span className="text-white/80 text-lg font-medium">
                    {formattedOpportunity.custom_id} | {formattedOpportunity.category}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-5 py-3 bg-[#212140] border border-white/20 text-white text-sm font-medium rounded-lg">
                    {formattedOpportunity.currentStage}
                  </span>
                  <span className="px-5 py-3 bg-[#212140] border border-white/20 text-white text-sm font-medium rounded-lg flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    AI Match: {formattedOpportunity.aiMatch}%
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-4xl font-bold text-[#66BB6A] leading-tight mb-2">
                  {formattedOpportunity.projectValue ? formatCurrency(formattedOpportunity.projectValue) : 'N/A'}
                </div>
                <div className="text-white/80 text-lg font-medium mb-3">Project Value</div>
                <div className="text-white text-xl font-medium">
                  {formattedOpportunity.winProbability}% Win Probability
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-8">
          <div className="mx-auto max-w-[1392px]">
            <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded-xl">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-8 py-4 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white text-[#161950] shadow-sm border border-gray-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen">
        <div className="px-8 py-10">
          <Suspense fallback={<TabLoadingSkeleton />}>
            {renderTabContent()}
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default memo(PipelineOverviewPage);