import { memo } from 'react';
import { AddButton } from './shared';
import { TabProps } from './types';
import { 
  useOpportunityCompetitors, 
  useCreateOpportunityCompetitor,
  useOpportunityStrategies,
  useCreateOpportunityStrategy 
} from '@/hooks/useOpportunityTabs';
import { Competitor, Strategy } from '@/types/opportunityTabs';

const CompetitionStrategyTab = memo(({ opportunity }: TabProps) => {
  const { data: competitors = [], isLoading: competitorsLoading } = useOpportunityCompetitors(opportunity?.id || '');
  const { data: strategies = [], isLoading: strategiesLoading } = useOpportunityStrategies(opportunity?.id || '');
  const createCompetitorMutation = useCreateOpportunityCompetitor(opportunity?.id || '');
  const createStrategyMutation = useCreateOpportunityStrategy(opportunity?.id || '');

  const handleAddCompetitor = () => {
    console.log('Add competitor clicked');
  };

  if (competitorsLoading || strategiesLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
  
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 pt-6 pb-4 bg-white rounded-tl-2xl rounded-tr-2xl flex flex-col justify-start items-start gap-5 overflow-hidden">
          <div className="w-full flex flex-col justify-start items-start gap-3">
            <div className="w-full flex justify-between items-center">
              <div className="inline-flex flex-col justify-start items-start gap-1">
                <div className="text-lg font-semibold text-gray-900">Competitive Analysis</div>
              </div>
              <AddButton onClick={handleAddCompetitor} />
            </div>
          </div>
          <div className="h-px bg-black/10"></div>
        </div>
        
        <div className="px-6 pb-3 flex flex-col justify-start items-start">
          {competitors.map((competitor: Competitor, index: number) => (
            <div key={competitor.id || index} className="w-full p-6 bg-stone-50 rounded-[20px] flex flex-col justify-start items-start gap-5">
              <div className="w-full flex flex-col justify-start items-start gap-6">
                <div className="w-full flex flex-col sm:flex-row sm:justify-start sm:items-center gap-4 sm:gap-8">
                  <div className="text-2xl font-medium text-gray-900">{competitor.company_name}</div>
                  <div className={`w-24 h-7 px-2 py-0.5 rounded-full flex justify-center items-center ${
                    competitor.threat_level === 'High' ? 'bg-red-50 text-red-600' :
                    competitor.threat_level === 'Medium' ? 'bg-amber-50 text-amber-600' :
                    'bg-green-50 text-green-600'
                  }`}>
                    <div className="text-xs font-medium">{competitor.threat_level} Threat</div>
                  </div>
                </div>
                
                <div className="w-full flex flex-col lg:flex-row justify-start items-start gap-6">
               
                  <div className="w-full lg:flex-1 p-7 bg-white rounded-[20px] flex flex-col justify-start items-start gap-3">
                    <div className="text-lg font-medium text-gray-900">Strengths</div>
                    <div className="w-full flex flex-col justify-start items-start gap-4">
                      {competitor.strengths?.map((strength: string, strengthIndex: number) => (
                        <div key={strengthIndex} className="w-full flex flex-col justify-start items-start gap-1.5">
                          <div className="w-full flex flex-col justify-start items-start gap-1.5">
                            <div className="w-full h-11 px-4 py-2.5 bg-white rounded-lg shadow-sm border border-gray-200 flex justify-start items-center gap-2 overflow-hidden">
                              <div className="flex-1 flex justify-start items-center gap-2">
                                <div className="flex-1 text-emerald-600 text-sm font-normal leading-tight">{strength}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="w-full lg:flex-1 p-7 bg-white rounded-[20px] flex flex-col justify-start items-start gap-3">
                    <div className="text-lg font-medium text-gray-900">Weakness</div>
                    <div className="w-full flex flex-col justify-start items-start gap-4">
                      {competitor.weaknesses?.map((weakness: string, weaknessIndex: number) => (
                        <div key={weaknessIndex} className="w-full flex flex-col justify-start items-start gap-1.5">
                          <div className="w-full flex flex-col justify-start items-start gap-1.5">
                            <div className="w-full h-11 px-4 py-2.5 bg-white rounded-lg shadow-sm border border-gray-200 flex justify-start items-center gap-2 overflow-hidden">
                              <div className="flex-1 flex justify-start items-center gap-2">
                                <div className="flex-1 text-red-600 text-sm font-normal leading-tight">{weakness}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 mb-6 p-6 bg-white rounded-2xl border border-indigo-600 flex flex-col justify-center items-start gap-5">
        <div className="text-lg font-semibold text-gray-900">Win Strategy</div>
        <div className="h-px bg-black/10"></div>
        
        {strategies.map((strategy: Strategy, index: number) => (
          <div key={strategy.id || index} className="inline-flex justify-start items-center gap-3.5">
            <div className="relative">
              <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.5 2.53125C11.3306 2.53125 9.2099 3.17456 7.40609 4.37982C5.60229 5.58508 4.1964 7.29816 3.3662 9.30244C2.536 11.3067 2.31878 13.5122 2.74202 15.6399C3.16525 17.7676 4.20992 19.7221 5.74393 21.2561C7.27794 22.7901 9.23238 23.8348 11.3601 24.258C13.4878 24.6812 15.6933 24.464 17.6976 23.6338C19.7018 22.8036 21.4149 21.3977 22.6202 19.5939C23.8255 17.7901 24.4688 15.6694 24.4688 13.5C24.4657 10.5918 23.3091 7.80369 21.2527 5.74731C19.1963 3.69094 16.4082 2.53432 13.5 2.53125ZM22.7422 12.6563H20.1952C20.0058 11.1705 19.3284 9.78976 18.2693 8.7307C17.2102 7.67163 15.8295 6.99423 14.3438 6.80484V4.25777C16.5036 4.45774 18.5256 5.40682 20.0594 6.94062C21.5932 8.47443 22.5423 10.4964 22.7422 12.6563ZM12.6563 12.6563H8.50922C8.68586 11.6206 9.17971 10.6654 9.92257 9.92257C10.6654 9.17971 11.6206 8.68585 12.6563 8.50922V12.6563ZM12.6563 14.3438V18.4908C11.6206 18.3142 10.6654 17.8203 9.92257 17.0774C9.17971 16.3346 8.68586 15.3794 8.50922 14.3438H12.6563ZM14.3438 14.3438H18.4908C18.3142 15.3794 17.8203 16.3346 17.0774 17.0774C16.3346 17.8203 15.3794 18.3142 14.3438 18.4908V14.3438ZM14.3438 12.6563V8.50922C15.3794 8.68585 16.3346 9.17971 17.0774 9.92257C17.8203 10.6654 18.3142 11.6206 18.4908 12.6563H14.3438ZM12.6563 4.25777V6.80484C11.1705 6.99423 9.78976 7.67163 8.7307 8.7307C7.67164 9.78976 6.99424 11.1705 6.80485 12.6563H4.25778C4.45775 10.4964 5.40682 8.47443 6.94063 6.94062C8.47443 5.40682 10.4964 4.45774 12.6563 4.25777ZM4.25778 14.3438H6.80485C6.99424 15.8295 7.67164 17.2102 8.7307 18.2693C9.78976 19.3284 11.1705 20.0058 12.6563 20.1952V22.7422C10.4964 22.5423 8.47443 21.5932 6.94063 20.0594C5.40682 18.5256 4.45775 16.5036 4.25778 14.3438ZM14.3438 22.7422V20.1952C15.8295 20.0058 17.2102 19.3284 18.2693 18.2693C19.3284 17.2102 20.0058 15.8295 20.1952 14.3438H22.7422C22.5423 16.5036 21.5932 18.5256 20.0594 20.0594C18.5256 21.5932 16.5036 22.5423 14.3438 22.7422Z" fill="#4A50CF"/>
              </svg>
            </div>
            <div className="text-black text-lg font-semibold leading-relaxed">{strategy.strategy_text}</div>
          </div>
        ))}
      </div>
    </div>
  );
});

CompetitionStrategyTab.displayName = 'CompetitionStrategyTab';

export default CompetitionStrategyTab;