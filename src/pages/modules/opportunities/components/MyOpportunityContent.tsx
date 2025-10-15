import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Calendar, Users, DollarSign, AlertTriangle, TrendingUp, ChevronLeft, ChevronRight, ChevronDown, Loader2 } from 'lucide-react';
import { Opportunity } from '../../../types/opportunities';

type MyOpportunityContentProps = {
  opportunities: Opportunity[];
  isLoading: boolean;
}

interface MyOpportunity {
  id: string;
  custom_id?: string;
  projectName: string;
  clientName: string;
  myRole: string;
  teamSize: number;
  stage: string;
  projectValue: string;
  expectedRFPDate: string;
  deadline: string;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export const MyOpportunityContent = memo(({ opportunities, isLoading }: MyOpportunityContentProps) => {
  const navigate = useNavigate();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const totalOpportunities = opportunities.length;
  const totalPipelineValue = opportunities.reduce((sum, opp) => sum + (opp.project_value || 0), 0);
  const activeProjects = opportunities.filter(opp => opp.stage !== 'won' && opp.stage !== 'lost').length;
  const highRiskAlerts = opportunities.filter(opp => opp.risk_level === 'high_risk').length;

  // Stats cards data
  const statsCards = [
    {
      id: 'total',
      title: 'Total Opportunities',
      value: totalOpportunities.toString(),
      trend: '+3 this week',
      trendColor: 'bg-[#DEF7EC] text-[#03543F]',
      icon: TrendingUp,
      iconBg: 'bg-[#EFF6FF]',
      iconColor: 'text-[#2563EB]'
    },
    {
      id: 'pipeline',
      title: 'Gross Pipeline Value',
      value: `$${(totalPipelineValue / 1000000).toFixed(1)}M`,
      trend: null,
      icon: DollarSign,
      iconBg: 'bg-[#F0FDF4]',
      iconColor: 'text-[#16A34A]'
    },
    {
      id: 'active',
      title: 'Active Projects',
      value: activeProjects.toString(),
      trend: '6 due soon',
      trendColor: 'bg-[#FEF3C7] text-[#92400E]',
      icon: Users,
      iconBg: 'bg-[#FEF3C7]',
      iconColor: 'text-[#92400E]'
    },
    {
      id: 'risk',
      title: 'High Risk Alerts',
      value: highRiskAlerts.toString(),
      trend: 'Require action',
      trendColor: 'bg-[#FEE2E2] text-[#991B1B]',
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

  const myOpportunities: MyOpportunity[] = opportunities.map((opp) => ({
    id: opp.id,
    custom_id: opp.custom_id,
    projectName: opp.project_name,
    clientName: opp.client_name,
    myRole: opp.my_role || 'Project Lead',
    teamSize: opp.team_size || 1,
    stage: opp.stage || 'Lead',
    projectValue: opp.project_value ? `$${(opp.project_value / 1000000).toFixed(1)}M` : 'TBD',
    expectedRFPDate: opp.expected_rfp_date || 'TBD',
    deadline: opp.deadline || 'TBD',
    riskLevel: opp.risk_level === 'high_risk' ? 'High' : opp.risk_level === 'medium_risk' ? 'Medium' : 'Low',
  }));

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
    const stages: Record<string, string> = {
      'Proposal Development': 'bg-[#EDE9FE] text-[#5B21B6]',
      'Qualification': 'bg-[#DBEAFE] text-[#1E40AF]',
      'RFP Response': 'bg-[#FEF3C7] text-[#92400E]',
      'Negotiation': 'bg-[#FCE7F3] text-[#9F1239]',
    };
    return stages[stage] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="mx-8 my-6">
      
      <div className="relative mb-12">
        
        <button 
          onClick={prevCard}
          className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full border border-[#E5E7EB] shadow-lg hover:shadow-xl hover:border-[#4338CA] hover:scale-105 transition-all duration-200 group"
        >
          <ChevronLeft className="w-5 h-5 text-[#6B7280] group-hover:text-[#4338CA] transition-colors mx-auto" />
        </button>

        
        <button 
          onClick={nextCard}
          className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full border border-[#E5E7EB] shadow-lg hover:shadow-xl hover:border-[#4338CA] hover:scale-105 transition-all duration-200 group"
        >
          <ChevronRight className="w-5 h-5 text-[#6B7280] group-hover:text-[#4338CA] transition-colors mx-auto" />
        </button>

        
        <div className="mx-14 overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentCardIndex * 25}%)` }}
          >
            {statsCards.map((card, index) => (
              <div key={card.id} className="w-1/4 flex-shrink-0 px-3">
                <div className="group p-6 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-lg hover:border-[#4338CA]/20 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center justify-between mb-5">
                    <div className="text-[#6B7280] text-sm font-medium font-['Inter'] leading-5">{card.title}</div>
                    <div className={`p-2.5 ${card.iconBg} rounded-xl group-hover:scale-110 transition-transform duration-200`}>
                      <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                    </div>
                  </div>
                  <div className="flex items-end gap-3">
                    <div className="text-[#111827] text-4xl font-bold font-['Inter'] leading-none">{card.value}</div>
                    {card.trend && (
                      <div className={`px-2.5 py-1 ${card.trendColor} rounded-md text-xs font-semibold mb-1`}>
                        {card.trend}
                      </div>
                    )}
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
                  ? 'bg-[#4338CA] w-6' 
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
                <select className="appearance-none px-5 py-3 pr-10 bg-white rounded-xl border border-[#D1D5DB] text-[#374151] text-sm font-medium hover:border-[#9CA3AF] focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/20 transition-all cursor-pointer shadow-sm">
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
              <div className="flex items-center">
                <Loader2 className="animate-spin h-6 w-6 text-[#4338CA] mr-2" />
                <span className="text-[#6B7280]">Loading opportunities...</span>
              </div>
            </div>
          ) : myOpportunities.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-[#6B7280]">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-[#D1D5DB]" />
                <p className="text-lg font-medium mb-2">No opportunities found</p>
                <p className="text-sm">Create your first opportunity to get started.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {myOpportunities.map((opp) => (
              <div
                key={opp.id}
                className="group p-8 bg-gradient-to-r from-[#FAFAFA] to-[#F9FAFB] rounded-2xl border border-[#E5E7EB] hover:border-[#4338CA]/30 hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="text-[#111827] text-xl font-bold font-['Inter'] leading-7 group-hover:text-[#4338CA] transition-colors">
                        {opp.projectName}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getRiskBadge(opp.riskLevel)} shadow-sm`}>
                          {opp.riskLevel} Risk
                        </span>
                        <span className="px-3 py-1.5 bg-[#FEF3C7] text-[#92400E] rounded-full text-xs font-bold shadow-sm">
                          12 Days left
                        </span>
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
                      className="px-4 py-3 bg-[#4338CA] rounded-xl flex items-center gap-2 hover:bg-[#3730A3] hover:scale-105 transition-all duration-200 shadow-lg"
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
                      <Users className="w-4 h-4 text-[#4338CA]" />
                      <span className="text-[#111827] text-sm font-bold font-['Inter']">{opp.teamSize} Members</span>
                    </div>
                  </div>

                  
                  <div className="flex flex-col gap-2">
                    <div className="text-[#6B7280] text-xs font-bold font-['Inter'] uppercase tracking-wide">Stage</div>
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-block ${getStageBadge(opp.stage)} shadow-sm`}>
                      {opp.stage}
                    </span>
                  </div>

                  
                  <div className="flex flex-col gap-2">
                    <div className="text-[#6B7280] text-xs font-bold font-['Inter'] uppercase tracking-wide">Project Value</div>
                    <div className="text-[#16A34A] text-lg font-bold font-['Inter']">{opp.projectValue}</div>
                  </div>

                  
                  <div className="flex flex-col gap-2">
                    <div className="text-[#6B7280] text-xs font-bold font-['Inter'] uppercase tracking-wide">Expected RFP Date</div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#4338CA]" />
                      <span className="text-[#111827] text-sm font-bold font-['Inter']">{opp.expectedRFPDate}</span>
                    </div>
                  </div>

                  
                  <div className="flex flex-col gap-2">
                    <div className="text-[#6B7280] text-xs font-bold font-['Inter'] uppercase tracking-wide">Deadline</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse"></div>
                      <span className="text-[#DC2626] text-sm font-bold font-['Inter']">12 Days left</span>
                    </div>
                  </div>
                </div>

                
                <div className="flex items-center justify-between pt-6 border-t border-[#E5E7EB]">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((_, i) => (
                        <div
                          key={i}
                          className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-3 border-white flex items-center justify-center text-white text-sm font-bold shadow-lg hover:scale-110 transition-transform duration-200"
                        >
                          {String.fromCharCode(65 + i)}
                        </div>
                      ))}
                    </div>
                    <span className="text-[#6B7280] text-sm font-medium font-['Inter']">+3 more team members</span>
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

MyOpportunityContent.displayName = 'MyOpportunityContent';
