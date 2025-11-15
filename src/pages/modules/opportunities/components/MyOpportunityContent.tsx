import { memo, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Calendar, Users, DollarSign, AlertTriangle, TrendingUp, ChevronLeft, ChevronRight, ChevronDown, Loader2 } from 'lucide-react';
import { Opportunity, OpportunityPipelineResponse, OpportunityStage, OpportunityStageType } from '@/types/opportunities';
import { formatProjectValue } from '@/utils/opportunityUtils';

type MyOpportunityContentProps = {
  opportunities: Opportunity[];
  isLoading: boolean;
  pipelineData?: OpportunityPipelineResponse;
}

interface MyOpportunity {
  id: string;
  custom_id?: string;
  projectName: string;
  clientName: string;
  myRole: string;
  teamSize: number;
  stageLabel: string;
  stageSlug: string;
  projectValue: string;
  expectedRFPDate: string;
  deadline: string;
  deadlineDaysRemaining: number | null;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export const MyOpportunityContent = memo(({ opportunities, pipelineData, isLoading }: MyOpportunityContentProps) => {
  const navigate = useNavigate();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const pipelineOpportunities = useMemo(
    () => opportunities.filter(opp => {
      if (!opp.stage) return false;
      const stage = opp.stage as OpportunityStageType;
      return stage !== OpportunityStage.LEAD && stage !== OpportunityStage.WON && stage !== OpportunityStage.LOST;
    }),
    [opportunities]
  );

  const totalOpportunities = pipelineData?.total_opportunities ?? pipelineOpportunities.length;
  const totalPipelineValue = pipelineData?.total_value ?? pipelineOpportunities.reduce((sum, opp) => sum + (opp.project_value || 0), 0);
  const activeProjects = pipelineOpportunities.length;
  const highRiskAlerts = pipelineOpportunities.filter(opp => opp.risk_level === 'high_risk').length;
  const valuedOpportunities = pipelineOpportunities.filter((opp) => opp.project_value);
  const averageDealSize = valuedOpportunities.length
    ? valuedOpportunities.reduce((sum, opp) => sum + (opp.project_value || 0), 0) / valuedOpportunities.length
    : 0;
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  const createdThisWeek = pipelineOpportunities.filter((opp) => new Date(opp.created_at) >= weekAgo).length;
  const dueSoonCount = pipelineOpportunities.filter((opp) => {
    if (!opp.deadline) return false;
    const deadlineDate = new Date(opp.deadline);
    return deadlineDate >= now && deadlineDate <= new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  }).length;

  // Stats cards data
  const statsCards = [
    {
      id: 'total',
      title: 'Total Opportunities',
      value: totalOpportunities.toString(),
      helper: createdThisWeek > 0 ? `${createdThisWeek} new this week` : 'No new additions',
      icon: TrendingUp,
      iconBg: 'bg-[#EFF6FF]',
      iconColor: 'text-[#2563EB]'
    },
    {
      id: 'pipeline',
      title: 'Gross Pipeline Value',
      value: formatProjectValue(totalPipelineValue),
      helper: averageDealSize > 0 ? `Avg deal ${formatProjectValue(averageDealSize)}` : 'No valued deals yet',
      icon: DollarSign,
      iconBg: 'bg-[#F0FDF4]',
      iconColor: 'text-[#16A34A]'
    },
    {
      id: 'active',
      title: 'Active Projects',
      value: activeProjects.toString(),
      helper: dueSoonCount > 0 ? `${dueSoonCount} deadlines in 14 days` : 'No upcoming deadlines',
      icon: Users,
      iconBg: 'bg-[#FEF3C7]',
      iconColor: 'text-[#92400E]'
    },
    {
      id: 'risk',
      title: 'High Risk Alerts',
      value: highRiskAlerts.toString(),
      helper: highRiskAlerts > 0 ? 'Requires attention' : 'Healthy pipeline',
      icon: AlertTriangle,
      iconBg: 'bg-[#FEE2E2]',
      iconColor: 'text-[#DC2626]'
    }
  ];

  const nextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % statsCards.length);
  };

  const prevCard = () => {
    setCurrentCardIndex((prev) => (prev - 1 + statsCards.length) % statsCards.length);
  };

  const myOpportunities: MyOpportunity[] = pipelineOpportunities.map((opp) => {
    const stageSlug = opp.stage || 'lead';
    const stageLabel = stageSlug.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
    const projectValueDisplay = opp.project_value ? formatProjectValue(opp.project_value) : 'TBD';
    const expectedRFPDate = opp.expected_rfp_date ? new Date(opp.expected_rfp_date) : null;
    const expectedRFPDisplay = expectedRFPDate && !Number.isNaN(expectedRFPDate.getTime())
      ? expectedRFPDate.toLocaleDateString()
      : '—';
    const deadlineDate = opp.deadline ? new Date(opp.deadline) : null;
    const hasValidDeadline = deadlineDate && !Number.isNaN(deadlineDate.getTime());
    const deadlineDisplay = hasValidDeadline ? deadlineDate!.toLocaleDateString() : '—';
    const deadlineDaysRemaining = hasValidDeadline
      ? Math.ceil((deadlineDate!.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      id: opp.id,
      custom_id: opp.custom_id,
      projectName: opp.project_name,
      clientName: opp.client_name,
      myRole: opp.my_role || 'Not specified',
      teamSize: opp.team_size || 0,
      stageLabel,
      stageSlug,
      projectValue: projectValueDisplay,
      expectedRFPDate: expectedRFPDisplay,
      deadline: deadlineDisplay,
      deadlineDaysRemaining,
      riskLevel: opp.risk_level === 'high_risk' ? 'High' : opp.risk_level === 'medium_risk' ? 'Medium' : 'Low',
    };
  });

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'High':
        return 'bg-[#FEE2E2] text-[#991B1B]';
      case 'Medium':
        return 'bg-[#FEF3C7] text-[#92400E]';
      case 'Low':
        return 'bg-[#DEF7EC] text-[#03543F]';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageBadge = (stage: string) => {
    const stageColors: Record<string, string> = {
      lead: 'bg-[#E0E7FF] text-[#312E81]',
      qualification: 'bg-[#DBEAFE] text-[#1E40AF]',
      proposal_development: 'bg-[#EDE9FE] text-[#5B21B6]',
      rfp_response: 'bg-[#FEF3C7] text-[#92400E]',
      shortlisted: 'bg-[#FCE7F3] text-[#9F1239]',
      presentation: 'bg-[#D1FAE5] text-[#047857]',
      negotiation: 'bg-[#FDE68A] text-[#92400E]',
      won: 'bg-[#DCFCE7] text-[#166534]',
      lost: 'bg-[#FEE2E2] text-[#991B1B]',
      on_hold: 'bg-[#E5E7EB] text-[#374151]',
    };
    return stageColors[stage] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="mx-8 my-6">
      
      <div className="relative mb-12">
        
        <button 
          onClick={prevCard}
          className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full border border-[#E5E7EB] shadow-lg hover:shadow-xl hover:border-[#161950] hover:scale-105 transition-all duration-200 group"
        >
          <ChevronLeft className="w-5 h-5 text-[#6B7280] group-hover:text-[#161950] transition-colors mx-auto" />
        </button>

        
        <button 
          onClick={nextCard}
          className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full border border-[#E5E7EB] shadow-lg hover:shadow-xl hover:border-[#161950] hover:scale-105 transition-all duration-200 group"
        >
          <ChevronRight className="w-5 h-5 text-[#6B7280] group-hover:text-[#161950] transition-colors mx-auto" />
        </button>

        
        <div className="mx-14 overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentCardIndex * 25}%)` }}
          >
            {statsCards.map((card, index) => (
              <div key={card.id} className="w-1/4 flex-shrink-0 px-3">
                <div className="group p-6 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-lg hover:border-[#161950]/20 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center justify-between mb-5">
                    <div className="text-[#6B7280] text-sm font-medium font-['Inter'] leading-5">{card.title}</div>
                    <div className={`p-2.5 ${card.iconBg} rounded-xl group-hover:scale-110 transition-transform duration-200`}>
                      <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="text-[#111827] text-4xl font-bold font-['Inter'] leading-none">{card.value}</div>
                    <div className="text-xs font-medium text-[#6B7280]">{card.helper}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        
        <div className="flex justify-center mt-6 gap-2">
          {statsCards.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentCardIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 hover:scale-125 ${
                index === currentCardIndex 
                  ? 'bg-[#161950] w-6' 
                  : 'bg-[#D1D5DB] hover:bg-[#9CA3AF]'
              }`}
            />
          ))}
        </div>
      </div>

      
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        
        <div className="px-8 py-8 border-b border-[#F3F4F6] bg-gradient-to-r from-[#FAFAFA] to-[#F9FAFB]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[#111827] text-2xl font-bold font-['Inter'] mb-2 tracking-tight">My Active Opportunities</h2>
              <p className="text-[#6B7280] text-base font-['Inter'] leading-6">
                Track and manage opportunities you're currently working on
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <select className="appearance-none px-5 py-3 pr-10 bg-white rounded-xl border border-[#D1D5DB] text-[#374151] text-sm font-medium hover:border-[#9CA3AF] focus:border-[#161950] focus:ring-2 focus:ring-[#161950]/20 transition-all cursor-pointer shadow-sm">
                  <option>All Roles</option>
                  <option>Project Lead</option>
                  <option>Team Member</option>
                  <option>Technical Lead</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        
        <div className="p-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin h-6 w-6 text-[#161950] mr-2" />
              <span className="text-[#6B7280]">Loading opportunities...</span>
            </div>
          ) : myOpportunities.length === 0 ? (
            <div className="text-center py-12 text-[#6B7280]">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-[#D1D5DB]" />
              <p className="text-lg font-medium mb-2">No active pipeline opportunities</p>
              <p className="text-sm">Move a lead into the pipeline to see it here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {myOpportunities.map((opp) => {
                const isOverdue = opp.deadlineDaysRemaining !== null && opp.deadlineDaysRemaining < 0;
                const isDueSoon = opp.deadlineDaysRemaining !== null && opp.deadlineDaysRemaining >= 0 && opp.deadlineDaysRemaining <= 7;
                const deadlineIndicatorColor = isOverdue
                  ? 'bg-[#DC2626]'
                  : isDueSoon
                    ? 'bg-[#F59E0B]'
                    : 'bg-[#10B981]';
                const deadlineChipBackground = opp.deadlineDaysRemaining === null
                  ? 'bg-[#E5E7EB]'
                  : isOverdue
                    ? 'bg-[#FEE2E2]'
                    : isDueSoon
                      ? 'bg-[#FEF3C7]'
                      : 'bg-[#DCFCE7]';
                const deadlineChipText = opp.deadlineDaysRemaining === null
                  ? 'text-[#6B7280]'
                  : isOverdue
                    ? 'text-[#991B1B]'
                    : isDueSoon
                      ? 'text-[#92400E]'
                      : 'text-[#166534]';
                const deadlineMessage = opp.deadlineDaysRemaining === null
                  ? 'No deadline provided'
                  : opp.deadlineDaysRemaining < 0
                    ? `Overdue by ${Math.abs(opp.deadlineDaysRemaining)} day${Math.abs(opp.deadlineDaysRemaining) === 1 ? '' : 's'}`
                    : `${opp.deadlineDaysRemaining} day${opp.deadlineDaysRemaining === 1 ? '' : 's'} remaining`;
                const teamSizeLabel = opp.teamSize > 0
                  ? `${opp.teamSize} member${opp.teamSize === 1 ? '' : 's'}`
                  : 'Not provided';

                return (
                  <div
                    key={opp.id}
                    className="group p-8 bg-gradient-to-r from-[#FAFAFA] to-[#F9FAFB] rounded-2xl border border-[#E5E7EB] hover:border-[#161950]/30 hover:shadow-xl transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <h3 className="text-[#111827] text-xl font-bold font-['Inter'] leading-7 group-hover:text-[#161950] transition-colors">
                            {opp.projectName}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getRiskBadge(opp.riskLevel)} shadow-sm`}>
                              {opp.riskLevel} Risk
                            </span>
                            {opp.deadlineDaysRemaining !== null && (
                              <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${deadlineChipBackground} ${deadlineChipText}`}>
                                {deadlineMessage}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[#6B7280] text-sm font-['Inter']">
                          <span className="font-semibold">Client:</span>
                          <span className="font-medium">{opp.clientName}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => {
                            const opportunityId = opp.custom_id || opp.id;
                            navigate(`/module/opportunities/pipeline/${opportunityId}`);
                          }}
                          className="px-4 py-3 bg-[#161950] rounded-xl flex items-center gap-2 hover:bg-[#0f1440] hover:scale-105 transition-all duration-200 shadow-lg"
                        >
                          <Eye className="w-4 h-4 text-white" />
                          <span className="text-white text-sm font-semibold font-['Inter']">Pipeline</span>
                        </button>
                        <button 
                          onClick={() => {
                            const opportunityId = opp.custom_id || opp.id;
                            navigate(`/module/opportunities/analysis?opportunityId=${opportunityId}`);
                          }}
                          className="px-4 py-3 bg-[#10B981] rounded-xl flex items-center gap-2 hover:bg-[#059669] hover:scale-105 transition-all duration-200 shadow-lg"
                        >
                          <TrendingUp className="w-4 h-4 text-white" />
                          <span className="text-white text-sm font-semibold font-['Inter']">AI Insights</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-6 gap-8 mb-6">
                      <div className="flex flex-col gap-2">
                        <div className="text-[#6B7280] text-xs font-bold font-['Inter'] uppercase tracking-wide">My Role</div>
                        <div className="text-[#111827] text-sm font-bold font-['Inter']">{opp.myRole}</div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="text-[#6B7280] text-xs font-bold font-['Inter'] uppercase tracking-wide">Team Size</div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#161950]" />
                          <span className="text-[#111827] text-sm font-bold font-['Inter']">{teamSizeLabel}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="text-[#6B7280] text-xs font-bold font-['Inter'] uppercase tracking-wide">Stage</div>
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-block ${getStageBadge(opp.stageSlug)} shadow-sm`}>
                          {opp.stageLabel}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="text-[#6B7280] text-xs font-bold font-['Inter'] uppercase tracking-wide">Project Value</div>
                        <div className="text-[#16A34A] text-lg font-bold font-['Inter']">{opp.projectValue}</div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="text-[#6B7280] text-xs font-bold font-['Inter'] uppercase tracking-wide">Expected RFP Date</div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#161950]" />
                          <span className="text-[#111827] text-sm font-bold font-['Inter']">{opp.expectedRFPDate}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="text-[#6B7280] text-xs font-bold font-['Inter'] uppercase tracking-wide">Deadline</div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[#111827] text-sm font-bold font-['Inter']">{opp.deadline}</span>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${opp.deadlineDaysRemaining === null ? 'bg-[#D1D5DB]' : deadlineIndicatorColor} ${opp.deadlineDaysRemaining === null ? '' : 'animate-pulse'}`}></div>
                            <span className={`text-sm font-semibold ${deadlineChipText}`}>
                              {deadlineMessage}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-[#E5E7EB]">
                      <div className="flex items-center gap-3 text-[#6B7280] text-sm font-medium font-['Inter']">
                        <Users className="w-4 h-4 text-[#161950]" />
                        <span>Team size recorded: {teamSizeLabel}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button className="px-4 py-2.5 bg-white rounded-xl border border-[#D1D5DB] text-[#374151] text-sm font-semibold hover:bg-[#F9FAFB] hover:border-[#9CA3AF] transition-all duration-200 shadow-sm">
                          Update Status
                        </button>
                        <button className="px-4 py-2.5 bg-white rounded-xl border border-[#D1D5DB] text-[#374151] text-sm font-semibold hover:bg-[#F9FAFB] hover:border-[#9CA3AF] transition-all duration-200 shadow-sm">
                          AI Insights
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

MyOpportunityContent.displayName = 'MyOpportunityContent';
