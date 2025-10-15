import { memo } from 'react';

interface OpportunityData {
  projectName: string;
  projectValue: string;
  description: string;
  state: string;
  marketSector: string;
  deadline: string;
  source: string;
  matchScore: number;
}

type OpportunityOverviewCardProps = {
  data: OpportunityData;
}

export const OpportunityOverviewCard = memo(({ data }: OpportunityOverviewCardProps) => {
  // TODO: need to fix this - harsh.pawar
  const matchPercentage = (data.matchScore / 100) * 100;

  return (
    <div className="w-full bg-white rounded-2xl border border-[#E5E7EB] flex flex-col overflow-hidden shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
      
      <div className="px-8 py-5 flex justify-between items-center border-b border-[#E5E7EB]">
        <h3 className="text-[#1A1A1A] text-xl font-semibold font-['Outfit'] leading-7 tracking-[-0.3px]">
          Opportunity Overview
        </h3>
      </div>

      
      <div className="p-8 bg-[#FAFAFA] flex flex-col gap-6">
        
        <div className="flex justify-between items-start gap-6">
          
          <div className="flex-1 flex flex-col gap-3">
            <div className="text-[#9CA3AF] text-sm font-medium font-['Outfit'] uppercase tracking-wide">Project Name</div>
            <div className="text-[#0F0901] text-[28px] font-semibold font-['Outfit'] leading-[36px] tracking-[-0.4px]">
              {data.projectName}
            </div>
          </div>

          
          <div className="flex flex-col gap-3 items-end">
            <div className="text-[#0F0901] text-lg font-medium font-['Outfit'] leading-6">Project Value</div>
            <div className="text-[#475569] text-[36px] font-bold font-['Outfit'] leading-[44px] tracking-[-0.5px]">{data.projectValue}</div>
          </div>
        </div>

        
        <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"></div>

        
        <div className="flex flex-col gap-3">
          <div className="text-[#9CA3AF] text-sm font-medium font-['Outfit'] uppercase tracking-wide">Description</div>
          <div className="text-[#0F0901] text-lg font-medium font-['Outfit'] leading-7">
            {data.description}
          </div>
        </div>

        
        <div className="px-8 py-6 bg-white rounded-2xl flex justify-between items-center shadow-sm border border-[#E5E7EB]">
          
          <div className="flex flex-col gap-2.5">
            <div className="text-[#9CA3AF] text-sm font-medium font-['Outfit'] uppercase tracking-wide">State</div>
            <div className="text-[#0F0901] text-lg font-semibold font-['Outfit'] leading-6">{data.state}</div>
          </div>

          <div className="w-px h-8 bg-[#E5E7EB]"></div>

          
          <div className="flex flex-col gap-2.5">
            <div className="text-[#9CA3AF] text-sm font-medium font-['Outfit'] uppercase tracking-wide">Market Sector</div>
            <div className="text-[#0F0901] text-lg font-semibold font-['Outfit'] leading-6">{data.marketSector}</div>
          </div>

          <div className="w-px h-8 bg-[#E5E7EB]"></div>

          
          <div className="flex flex-col gap-2.5">
            <div className="text-[#9CA3AF] text-sm font-medium font-['Outfit'] uppercase tracking-wide">Deadline</div>
            <div className="text-[#0F0901] text-lg font-semibold font-['Outfit'] leading-6">{data.deadline}</div>
          </div>

          <div className="w-px h-8 bg-[#E5E7EB]"></div>

          
          <div className="flex flex-col gap-2.5 max-w-[200px]">
            <div className="text-[#9CA3AF] text-sm font-medium font-['Outfit'] uppercase tracking-wide">Source</div>
            <div className="text-[#0F0901] text-lg font-semibold font-['Outfit'] leading-6 truncate">{data.source}</div>
          </div>

          <div className="w-px h-8 bg-[#E5E7EB]"></div>

          
          <div className="w-64 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="text-[#9CA3AF] text-base font-medium font-['Outfit'] uppercase tracking-wide">Match Score</div>
              <div className="text-[#0F0901] text-lg font-bold font-['Outfit'] leading-6">{data.matchScore}%</div>
            </div>
            
            <div className="relative w-full h-5">
              
              <div className="absolute inset-0 bg-[#E5E7EB] rounded-full shadow-inner"></div>
              
              <div 
                className="absolute inset-0 bg-gradient-to-r from-[#4A50CF] to-[#5B61E5] rounded-full transition-all duration-500 shadow-md"
                style={{ width: `${matchPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

OpportunityOverviewCard.displayName = 'OpportunityOverviewCard';
