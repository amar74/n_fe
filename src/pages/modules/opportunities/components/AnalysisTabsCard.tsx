import { memo, useState } from 'react';
import { Star, TrendingUp, Puzzle, AlertTriangle } from 'lucide-react';
import { OpportunityAnalytics, OpportunityPipelineResponse, Opportunity } from '../../../types/opportunities';

type TabType = 'overview' | 'competition' | 'technical' | 'financial' | 'recommendation';

type AnalysisTabsCardProps = {
  analytics?: OpportunityAnalytics;
  pipeline?: OpportunityPipelineResponse;
  opportunities?: Opportunity[];
}

export const AnalysisTabsCard = memo<AnalysisTabsCardProps>(({ analytics, pipeline, opportunities = [] }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview' },
    { id: 'competition' as TabType, label: 'Competition' },
    { id: 'technical' as TabType, label: 'Technical' },
    { id: 'financial' as TabType, label: 'Financial' },
    { id: 'recommendation' as TabType, label: 'Recommendation' },
  ];

  const totalOpportunities = analytics?.total_opportunities || opportunities.length;
  const winRate = analytics?.win_rate || 0;
  const averageDealSize = analytics?.average_deal_size || 0;
  const pipelineVelocity = analytics?.pipeline_velocity || 0;
  
  const averageMatchScore = opportunities.length > 0 
    ? Math.round(opportunities.reduce((sum, opp) => sum + (opp.match_score || 0), 0) / opportunities.length)
    : 0;

  const metrics = [
    {
      icon: Star,
      label: 'Overall Score',
      value: averageMatchScore.toString(),
    },
    {
      icon: TrendingUp,
      label: 'Win Rate',
      value: `${Math.round(winRate)}%`,
    },
    {
      icon: Puzzle,
      label: 'Pipeline Velocity',
      value: `${Math.round(pipelineVelocity)} days`,
    },
    {
      icon: AlertTriangle,
      label: 'Total Opportunities',
      value: totalOpportunities.toString(),
    },
  ];

  return (
    <div className="w-full px-8 py-6 bg-white rounded-2xl border border-[#E5E7EB] flex flex-col gap-7 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
      
      <div className="h-12 p-1 bg-[#F5F9FA] rounded-xl flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 rounded-lg flex justify-center items-center transition-all ${
              activeTab === tab.id
                ? 'bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] text-[#0F0901] font-semibold'
                : 'text-[#667085] hover:text-[#0F0901] font-medium hover:bg-white/50'
            }`}
          >
            <span className="text-sm font-['Outfit'] leading-tight tracking-[-0.1px]">{tab.label}</span>
          </button>
        ))}
      </div>

      
      <div className="grid grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              className="px-5 py-5 bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6] rounded-2xl border border-[#E5E7EB] flex flex-col gap-4 hover:shadow-md transition-all hover:border-[#D1D5DB] group"
            >
              
              <div className="flex justify-between items-start">
                
                <div className="w-14 h-14 p-3 bg-white rounded-xl flex justify-center items-center shadow-sm group-hover:shadow-md transition-shadow border border-[#E5E7EB]">
                  <Icon className="w-7 h-7 text-[#0F0901] stroke-[2]" />
                </div>

                
                <div className="text-[#1A1A1A] text-2xl font-bold font-['Outfit'] leading-7 tracking-[-0.4px]">
                  {metric.value}
                </div>
              </div>

              
              <div className="text-[#667085] text-sm font-medium font-['Outfit'] leading-5">
                {metric.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

AnalysisTabsCard.displayName = 'AnalysisTabsCard';
