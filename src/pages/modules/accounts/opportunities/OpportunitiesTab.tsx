import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { opportunitiesApi } from '@/services/api/opportunitiesApi';
import { OpportunityListResponse } from '@/types/opportunities';
import { 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  ChevronRight, 
  Plus, 
  Filter, 
  Search, 
  ArrowUpDown,
  Eye,
  Edit,
  Trash2,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Brain,
  BarChart3
} from 'lucide-react';

type OpportunitiesTabProps = {
  accountId: string;
}

export function OpportunitiesTab({ accountId }: OpportunitiesTabProps) {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState<OpportunityListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'project_value' | 'deadline'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  // harsh.pawar - quick fix, need proper solution
  const [showFilters, setShowFilters] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    fetchOpportunities();
  }, [accountId, currentPage]);

  const fetchOpportunities = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await opportunitiesApi.listOpportunitiesByAccount(accountId, {
        page: currentPage,
        size: pageSize
      });
      setOpportunities(data);
    } catch (err: any) {
      setError(err.message || "Load failed");
    } finally {
      setIsLoading(false);
    }
  };

  const getStageColor = (stage: string): { bg: string; text: string; icon: React.ReactNode } => {
    const stageConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      'lead': { 
        bg: 'bg-gradient-to-r from-slate-100 to-slate-200', 
        text: 'text-slate-700', 
        icon: <Target className="w-3 h-3" />
      },
      'qualification': { 
        bg: 'bg-gradient-to-r from-blue-100 to-blue-200', 
        text: 'text-blue-700', 
        icon: <Search className="w-3 h-3" />
      },
      'proposal_development': { 
        bg: 'bg-gradient-to-r from-purple-100 to-purple-200', 
        text: 'text-purple-700', 
        icon: <Edit className="w-3 h-3" />
      },
      'rfp_response': { 
        bg: 'bg-gradient-to-r from-indigo-100 to-indigo-200', 
        text: 'text-indigo-700', 
        icon: <Briefcase className="w-3 h-3" />
      },
      'shortlisted': { 
        bg: 'bg-gradient-to-r from-yellow-100 to-yellow-200', 
        text: 'text-yellow-700', 
        icon: <CheckCircle className="w-3 h-3" />
      },
      'presentation': { 
        bg: 'bg-gradient-to-r from-orange-100 to-orange-200', 
        text: 'text-orange-700', 
        icon: <Eye className="w-3 h-3" />
      },
      'negotiation': { 
        bg: 'bg-gradient-to-r from-cyan-100 to-cyan-200', 
        text: 'text-cyan-700', 
        icon: <ArrowUpDown className="w-3 h-3" />
      },
      'won': { 
        bg: 'bg-gradient-to-r from-green-100 to-green-200', 
        text: 'text-green-700', 
        icon: <CheckCircle className="w-3 h-3" />
      },
      'lost': { 
        bg: 'bg-gradient-to-r from-red-100 to-red-200', 
        text: 'text-red-700', 
        icon: <XCircle className="w-3 h-3" />
      },
      'on_hold': { 
        bg: 'bg-gradient-to-r from-gray-100 to-gray-200', 
        text: 'text-gray-500', 
        icon: <Clock className="w-3 h-3" />
      }
    };
    return stageConfig[stage] || stageConfig['lead'];
  };

  const getRiskColor = (risk: string): { color: string; icon: React.ReactNode; label: string } => {
    const riskConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      'low_risk': { 
        color: 'text-green-600', 
        icon: <TrendingUp className="w-3 h-3" />, 
        label: 'Low Risk' 
      },
      'medium_risk': { 
        color: 'text-yellow-600', 
        icon: <AlertTriangle className="w-3 h-3" />, 
        label: 'Medium Risk' 
      },
      'high_risk': { 
        color: 'text-red-600', 
        icon: <AlertTriangle className="w-3 h-3" />, 
        label: 'High Risk' 
      }
    };
    return riskConfig[risk] || { color: 'text-gray-600', icon: <TrendingUp className="w-3 h-3" />, label: 'Unknown Risk' };
  };

  // working but need cleanup - rose11
  const getDaysUntilDeadline = (deadline: string | null | undefined): number | null => {
    if (!deadline) return null;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDeadlineStatus = (days: number | null): { color: string; label: string } => {
    if (days === null) return { color: 'text-gray-500', label: 'No deadline' };
    if (days < 0) return { color: 'text-red-600', label: 'Overdue' };
    if (days <= 7) return { color: 'text-red-500', label: 'Due soon' };
    if (days <= 30) return { color: 'text-yellow-600', label: 'Due this month' };
    return { color: 'text-green-600', label: 'On track' };
  };

  const formatValue = (value: number | null | undefined): string => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (date: string | null | undefined): string => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleOpportunityClick = (opportunityId: string) => {
    navigate(`/module/opportunities/pipeline/${opportunityId}`);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-950"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Opportunities</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchOpportunities}
            className="px-4 py-2 bg-indigo-950 text-white rounded-lg hover:bg-indigo-900 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!opportunities || opportunities.opportunities.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Briefcase className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Opportunities Yet</h3>
          <p className="text-gray-600 mb-4">
            There are no opportunities linked to this account.
          </p>
          <button
            onClick={() => navigate('/module/opportunities?tab=source')}
            className="px-4 py-2 bg-indigo-950 text-white rounded-lg hover:bg-indigo-900 transition-colors"
          >
            Create Opportunity
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 font-outfit">
              Opportunities
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {opportunities.total} opportunities • Total value: {formatValue(
                opportunities.opportunities.reduce((sum, opp) => sum + (opp.project_value || 0), 0)
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button
              onClick={() => navigate('/module/opportunities?tab=source')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-950 to-indigo-900 text-white text-sm font-medium rounded-lg hover:from-indigo-900 hover:to-indigo-800 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Opportunity
            </button>
          </div>
        </div>

        
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search opportunities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="created_at">Sort by Date</option>
              <option value="project_value">Sort by Value</option>
              <option value="deadline">Sort by Deadline</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      
      <div className="p-6">
        <div className="grid gap-4">
          {opportunities.opportunities.map((opportunity) => {
            // temp solution by guddy.tech
            const stageConfig = getStageColor(opportunity.stage);
            const riskConfig = getRiskColor(opportunity.risk_level || 'low_risk');
            const daysUntilDeadline = getDaysUntilDeadline(opportunity.deadline);
            const deadlineStatus = getDeadlineStatus(daysUntilDeadline);

            return (
              <div
                key={opportunity.id}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-indigo-200 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between">
                  
                  <div className="flex-1 min-w-0">
                    
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 font-outfit group-hover:text-indigo-950 transition-colors">
                          {opportunity.project_name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {opportunity.description || 'No description available'}
                        </p>
                      </div>
                      
                      
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ml-4 ${stageConfig.bg} ${stageConfig.text}`}>
                        {stageConfig.icon}
                        <span className="capitalize">{opportunity.stage.replace(/_/g, ' ')}</span>
                      </div>
                    </div>

                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      
                      {opportunity.project_value && (
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="text-xs font-medium text-green-700 uppercase tracking-wide">Project Value</span>
                          </div>
                          <p className="text-lg font-bold text-green-800">{formatValue(opportunity.project_value)}</p>
                        </div>
                      )}

                      
                      {opportunity.market_sector && (
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Briefcase className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">Sector</span>
                          </div>
                          <p className="text-sm font-semibold text-blue-800 capitalize">{opportunity.market_sector}</p>
                        </div>
                      )}

                      
                      {opportunity.deadline && (
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-orange-600" />
                            <span className="text-xs font-medium text-orange-700 uppercase tracking-wide">Deadline</span>
                          </div>
                          <p className="text-sm font-semibold text-orange-800">{formatDate(opportunity.deadline)}</p>
                          {daysUntilDeadline !== null && (
                            <p className={`text-xs font-medium ${deadlineStatus.color}`}>
                              {daysUntilDeadline < 0 ? `${Math.abs(daysUntilDeadline)} days overdue` : 
                               daysUntilDeadline === 0 ? 'Due today' : 
                               `${daysUntilDeadline} days left`}
                            </p>
                          )}
                        </div>
                      )}

                      
                      {opportunity.risk_level && (
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            {riskConfig.icon}
                            <span className="text-xs font-medium text-purple-700 uppercase tracking-wide">Risk Level</span>
                          </div>
                          <p className={`text-sm font-semibold ${riskConfig.color}`}>{riskConfig.label}</p>
                        </div>
                      )}
                    </div>

                    
                    <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-4">
                        {opportunity.match_score && (
                          <span>Match Score: <span className="font-semibold text-gray-700">{opportunity.match_score}%</span></span>
                        )}
                        {opportunity.team_size && (
                          <span>Team Size: <span className="font-semibold text-gray-700">{opportunity.team_size}</span></span>
                        )}
                      </div>
                      <span className="text-gray-400">
                        Created {formatDate(opportunity.created_at)}
                      </span>
                    </div>
                  </div>

                  
                  <div className="ml-4 flex flex-col gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/module/opportunities/analysis?opportunityId=${opportunity.id}`);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#4338CA] to-[#3730A3] text-white rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-[#4338CA]/20 transition-all duration-200 hover:scale-105"
                    >
                      <Brain className="w-4 h-4" />
                      AI Insights
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/module/opportunities?tab=pipeline`);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-[#D1D5DB] text-[#374151] rounded-lg text-sm font-semibold hover:bg-[#F9FAFB] hover:border-[#4338CA]/20 transition-all duration-200"
                    >
                      <BarChart3 className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      
      {opportunities.total_pages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{((opportunities.page - 1) * opportunities.size) + 1}</span> to{' '}
              <span className="font-semibold text-gray-900">{Math.min(opportunities.page * opportunities.size, opportunities.total)}</span> of{' '}
              <span className="font-semibold text-gray-900">{opportunities.total}</span> opportunities
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentPage(prev => Math.max(1, prev - 1));
                }}
                disabled={opportunities.page === 1}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Previous
              </button>
              
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, opportunities.total_pages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(opportunities.total_pages - 4, opportunities.page - 2)) + i;
                  if (pageNum > opportunities.total_pages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentPage(pageNum);
                      }}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        pageNum === opportunities.page
                          ? 'bg-indigo-950 text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentPage(prev => Math.min(opportunities.total_pages, prev + 1));
                }}
                disabled={opportunities.page >= opportunities.total_pages}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
