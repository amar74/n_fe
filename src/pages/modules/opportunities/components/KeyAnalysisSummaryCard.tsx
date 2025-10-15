import { memo } from 'react';
import { OpportunityAnalytics, OpportunityPipelineResponse } from '../../../types/opportunities';

type KeyAnalysisSummaryCardProps = {
  analytics?: OpportunityAnalytics;
  pipeline?: OpportunityPipelineResponse;
}

export const KeyAnalysisSummaryCard = memo<KeyAnalysisSummaryCardProps>(({ analytics, pipeline }) => {
  const competitiveAdvantages = [
    analytics?.total_opportunities && analytics.total_opportunities > 0 
      ? `${analytics.total_opportunities} active opportunities in pipeline`
      : 'Strong opportunity pipeline',
    analytics?.average_deal_size && analytics.average_deal_size > 0
      ? `Average deal size: $${Math.round(analytics.average_deal_size / 1000)}K`
      : 'Competitive deal sizes',
    analytics?.win_rate && analytics.win_rate > 50
      ? `${Math.round(analytics.win_rate)}% win rate`
      : 'Improving win rates',
    analytics?.pipeline_velocity && analytics.pipeline_velocity < 90
      ? `Fast pipeline: ${Math.round(analytics.pipeline_velocity)} days`
      : 'Efficient sales process',
  ].filter(Boolean);

  const keyRiskFactors = [
    analytics?.win_rate && analytics.win_rate < 30
      ? 'Low win rate indicates competitive challenges'
      : 'Market competition analysis needed',
    analytics?.pipeline_velocity && analytics.pipeline_velocity > 120
      ? 'Long sales cycles may impact revenue'
      : 'Pipeline velocity optimization required',
    analytics?.total_value && analytics.total_value < 1000000
      ? 'Pipeline value below target threshold'
      : 'Revenue target achievement risk',
    'Stakeholder coordination and project management',
  ].filter(Boolean);

  return (
    <div className="w-full bg-white rounded-2xl border border-[#E5E7EB] flex flex-col overflow-hidden shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
      
      <div className="px-8 py-5 flex justify-between items-center border-b border-[#E5E7EB]">
        <h3 className="text-[#1A1A1A] text-xl font-semibold font-['Outfit'] leading-7 tracking-[-0.3px]">
          Key Analysis Summary
        </h3>
      </div>

      
      <div className="p-8 flex gap-7">
        
        <div className="flex-1 p-7 bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6] rounded-2xl border border-[#E5E7EB] flex flex-col gap-5">
          
          <div className="flex items-start gap-5">
            <h4 className="text-[#1A1A1A] text-lg font-semibold font-['Outfit'] leading-7 tracking-[-0.2px]">
              Competitive Advantages
            </h4>
          </div>

          
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"></div>

          
          <div className="flex flex-col">
            {competitiveAdvantages.map((advantage, index) => (
              <div
                key={index}
                className="px-5 py-5 border-b border-[#E5E7EB] last:border-b-0 flex items-start gap-3 hover:bg-white/60 transition-colors rounded-lg group"
              >
                
                <div className="w-3 h-3 mt-1.5 bg-gradient-to-br from-[#16A34A] to-[#15803D] rounded-full flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow"></div>
                <div className="text-[#0F0901] text-base font-medium font-['Outfit'] leading-6 flex-1">
                  {advantage}
                </div>
              </div>
            ))}
          </div>
        </div>

        
        <div className="flex-1 p-7 bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6] rounded-2xl border border-[#E5E7EB] flex flex-col gap-5">
          
          <div className="flex items-start gap-5">
            <h4 className="text-[#1A1A1A] text-lg font-semibold font-['Outfit'] leading-7 tracking-[-0.2px]">
              Key Risk Factors
            </h4>
          </div>

          
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"></div>

          
          <div className="flex flex-col">
            {keyRiskFactors.map((risk, index) => (
              <div
                key={index}
                className="px-5 py-5 border-b border-[#E5E7EB] last:border-b-0 flex items-start gap-3 hover:bg-white/60 transition-colors rounded-lg group"
              >
                
                <div className="w-3 h-3 mt-1.5 bg-gradient-to-br from-[#EF4444] to-[#DC2626] rounded-full flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow"></div>
                <div className="text-[#0F0901] text-base font-medium font-['Outfit'] leading-6 flex-1">
                  {risk}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

KeyAnalysisSummaryCard.displayName = 'KeyAnalysisSummaryCard';
