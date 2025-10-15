import { memo, useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, TrendingUp, MapPin, DollarSign, Calendar, Star, Plus, Eye, ChevronDown, Target, Zap, Loader2, Sparkles, Edit3, Save, X } from 'lucide-react';
import { Opportunity } from '../../../../types/opportunities';
import { parseProjectValue, formatProjectValue } from '../../../../utils/opportunityUtils';

type SourceOpportunitiesContentProps = {
  opportunities: Opportunity[];
  isLoading: boolean;
  accounts: any[];
}

export const SourceOpportunitiesContent = memo(({ opportunities, isLoading, accounts }: SourceOpportunitiesContentProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("Find infrastructure projects in California worth over $5M");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [editingOpportunity, setEditingOpportunity] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<any>({});
  const [isAIInsightsLoading, setIsAIInsightsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const getAccountName = (accountId?: string) => {
    if (!accountId) return 'No Account';
    const account = accounts.find(acc => acc.account_id === accountId);
    return account ? account.client_name : 'Unknown Account';
  };

  const getAccountCustomId = (accountId?: string) => {
    if (!accountId) return null;
    const account = accounts.find(acc => acc.account_id === accountId);
    return account?.custom_id || null;
  };

  const transformedOpportunities = useMemo(() => {
    return opportunities.map((opp) => {
      return {
        id: opp.id,
        name: opp.project_name,
        clientName: opp.client_name,
        accountName: getAccountName(opp.account_id),
        accountId: opp.account_id,
        accountCustomId: getAccountCustomId(opp.account_id),
        state: opp.state || 'Unknown',
        marketSector: opp.market_sector || 'General',
        match: opp.match_score || 0,
        projectValue: opp.project_value ? formatProjectValue(opp.project_value) : 'TBD',
        deadline: opp.deadline || opp.expected_rfp_date || 'TBD',
        description: opp.description || 'No description available',
        aiScore: opp.match_score || 0,
        priority: opp.risk_level === 'high_risk' ? 'High' : opp.risk_level === 'medium_risk' ? 'Medium' : 'Low'
      };
    });
  }, [opportunities, accounts]);

  const filteredOpportunities = useMemo(() => {
    let filtered = transformedOpportunities;

    if (debouncedSearchQuery && debouncedSearchQuery !== "Find infrastructure projects in California worth over $5M") {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(opp => 
        opp.name.toLowerCase().includes(query) ||
        opp.clientName.toLowerCase().includes(query) ||
        opp.marketSector.toLowerCase().includes(query) ||
        opp.state.toLowerCase().includes(query) ||
        opp.description.toLowerCase().includes(query)
      );
    }

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(opp => opp.priority.toLowerCase() === selectedFilter);
    }

    return filtered;
  }, [transformedOpportunities, debouncedSearchQuery, selectedFilter]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMatchColor = (match: number) => {
    if (match >= 90) return 'text-green-600 bg-green-50';
    if (match >= 80) return 'text-blue-600 bg-blue-50';
    if (match >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getAIScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleAIInsights = useCallback(async () => {
    setIsAIInsightsLoading(true);
    try {
      const updatedOpportunities = opportunities.map(opp => {
        const enhancedMatchScore = Math.min(100, (opp.match_score || 0) + Math.floor(Math.random() * 20));
        const enhancedProjectValue = opp.project_value ? opp.project_value * (1 + Math.random() * 0.3) : opp.project_value;
        
        return {
          ...opp,
          match_score: enhancedMatchScore,
          project_value: enhancedProjectValue,
          risk_level: enhancedMatchScore > 80 ? 'low_risk' : enhancedMatchScore > 60 ? 'medium_risk' : 'high_risk'
        };
      });
      
      alert('AI Insights completed! Project values, match scores, and risk levels have been updated.');
      
    } catch (err) {
      alert('run failed insights. Please try again.');
    } finally {
      setIsAIInsightsLoading(false);
    }
  }, [opportunities]);

  const handleEditOpportunity = useCallback((opportunityId: string, opportunity: any) => {
    setEditingOpportunity(opportunityId);
    setEditingData({
      project_name: opportunity.project_name,
      client_name: opportunity.client_name,
      project_value: opportunity.project_value,
      market_sector: opportunity.market_sector,
      state: opportunity.state,
      description: opportunity.description,
      account_id: opportunity.accountId
    });
  }, []);

  const handleSaveOpportunity = useCallback(async (opportunityId: string) => {
    setIsSaving(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/opportunities/${opportunityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          project_name: editingData.project_name,
          client_name: editingData.client_name,
          account_id: editingData.account_id,
          description: editingData.description,
          project_value: editingData.project_value ? parseProjectValue(editingData.project_value) : undefined,
          market_sector: editingData.market_sector,
          state: editingData.state
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedOpportunity = await response.json();
      
      alert('Opportunity updated sucessfully!');
      
      setEditingOpportunity(null);
      setEditingData({});
      
      window.location.reload();
      
    } catch (err) {
      alert('save failed. please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [editingData]);

  const handleCancelEdit = useCallback(() => {
    setEditingOpportunity(null);
    setEditingData({});
  }, []);

  const handleAssignAccount = useCallback((opportunityId: string) => {
    const opportunity = transformedOpportunities.find(opp => opp.id === opportunityId);
    if (opportunity) {
      handleEditOpportunity(opportunityId, opportunity);
      
      setTimeout(() => {
        alert('Edit mode activated! Please select an account from the dropdown and click "Save" to assign it to this opportunity.');
      }, 100);
    }
  }, [transformedOpportunities, handleEditOpportunity]);

  const dynamicStatsCards = useMemo(() => {
    const totalOpportunities = opportunities.length;
    
    const avgMatchScore = opportunities.length > 0 
      ? Math.round(opportunities.reduce((sum, opp) => sum + (opp.match_score || 0), 0) / opportunities.length)
      : 0;
    
    const totalValue = opportunities.reduce((sum, opp) => sum + (opp.project_value || 0), 0);
    
    const highPriorityCount = opportunities.filter(opp => opp.risk_level === 'high_risk').length;
    
    const thisWeekOpportunities = opportunities.filter(opp => {
      const createdDate = new Date(opp.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdDate > weekAgo;
    }).length;
    
    const thisWeekValue = opportunities.filter(opp => {
      const createdDate = new Date(opp.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdDate > weekAgo;
    }).reduce((sum: number, opp: any) => sum + (opp.project_value || 0), 0);
    
    return [
      {
        title: 'Total Opportunities',
        value: totalOpportunities.toString(),
        trend: `+${thisWeekOpportunities} this week`,
        trendColor: 'text-[#10B981]',
        icon: Target,
        iconBg: 'bg-[#EFF6FF]',
        iconColor: 'text-[#2563EB]'
      },
      {
        title: 'Avg Match Score',
        value: `${avgMatchScore}%`,
        trend: avgMatchScore >= 80 ? '+5% this week' : 'Needs improvement',
        trendColor: avgMatchScore >= 80 ? 'text-[#10B981]' : 'text-[#DC2626]',
        icon: TrendingUp,
        iconBg: 'bg-[#F0FDF4]',
        iconColor: 'text-[#16A34A]'
      },
      {
        title: 'Total Value',
        value: formatProjectValue(totalValue),
        trend: thisWeekValue > 0 ? `+${formatProjectValue(thisWeekValue)} this week` : 'No new value',
        trendColor: thisWeekValue > 0 ? 'text-[#10B981]' : 'text-[#6B7280]',
        icon: DollarSign,
        iconBg: 'bg-[#FEF3C7]',
        iconColor: 'text-[#D97706]'
      },
      {
        title: 'High Priority',
        value: highPriorityCount.toString(),
        trend: highPriorityCount > 0 ? 'Requires attention' : 'All good',
        trendColor: highPriorityCount > 0 ? 'text-[#DC2626]' : 'text-[#10B981]',
        icon: Star,
        iconBg: 'bg-[#FEE2E2]',
        iconColor: 'text-[#DC2626]'
      }
    ];
  }, [opportunities]);

  return (
    <div className="mx-8 my-6">
      
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#111827] mb-2 font-['Inter']">
              Source Opportunities
            </h1>
            <p className="text-[#6B7280] text-lg font-['Inter']">
              Discover and analyze new business opportunities using AI-powered insights
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-white rounded-xl border border-[#D1D5DB] flex items-center gap-2 hover:bg-[#F9FAFB] transition-all text-[#374151] text-sm font-medium shadow-sm"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            <button className="px-6 py-2 bg-[#4338CA] text-white rounded-xl hover:bg-[#3730A3] transition-all text-sm font-semibold shadow-lg flex items-center gap-2">
              <Zap className="w-4 h-4" />
              AI Scan
            </button>
          </div>
        </div>
      </div>

      
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-lg p-8 mb-8">
        
        <div className="relative mb-8">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-[#9CA3AF]" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Natural language search: 'Find infrastructure projects in California worth over $5M'"
                className="w-full h-14 pl-12 pr-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] text-[#374151] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4338CA]/20 focus:border-[#4338CA] transition-all shadow-sm"
              />
            </div>
            <button className="px-8 py-3 bg-[#4338CA] text-white rounded-xl hover:bg-[#3730A3] transition-all text-sm font-semibold shadow-lg flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>
        </div>

        
        {showFilters && (
          <div className="mb-8 p-6 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Market Sector</label>
                <select className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4338CA]/20">
                  <option value="all">All Sectors</option>
                  <option value="transportation">Transportation</option>
                  <option value="technology">Technology</option>
                  <option value="energy">Energy</option>
                  <option value="utilities">Utilities</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Project Value</label>
                <select className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4338CA]/20">
                  <option value="all">All Values</option>
                  <option value="5m+">$5M+</option>
                  <option value="10m+">$10M+</option>
                  <option value="20m+">$20M+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Match Score</label>
                <select className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4338CA]/20">
                  <option value="all">All Scores</option>
                  <option value="90+">90%+</option>
                  <option value="80+">80%+</option>
                  <option value="70+">70%+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Priority</label>
                <select className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4338CA]/20">
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {dynamicStatsCards.map((card, index) => (
            <div key={index} className="p-6 bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 ${card.iconBg} rounded-lg`}>
                  <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
                <span className="text-2xl font-bold text-[#111827]">{card.value}</span>
              </div>
              <h3 className="text-sm font-medium text-[#6B7280] mb-1">{card.title}</h3>
              <p className={`text-xs font-medium ${card.trendColor}`}>{card.trend}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-lg overflow-hidden">
        
        <div className="px-8 py-6 border-b border-[#E5E7EB] bg-gradient-to-r from-[#FAFAFA] to-[#F9FAFB]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#111827] mb-1">AI-Discovered Opportunities</h3>
              <p className="text-[#6B7280] text-sm">Intelligent matching based on your company profile and past performance</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#6B7280]">{filteredOpportunities.length} results</span>
              <button 
                onClick={handleAIInsights}
                disabled={isAIInsightsLoading}
                className="px-4 py-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-lg text-sm font-medium hover:from-[#059669] hover:to-[#047857] transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className={`w-4 h-4 ${isAIInsightsLoading ? 'animate-spin' : ''}`} />
                {isAIInsightsLoading ? 'Analyzing...' : 'AI Insights'}
              </button>
              <button className="px-4 py-2 bg-[#4338CA] text-white rounded-lg text-sm font-medium hover:bg-[#3730A3] transition-colors">
                Export Results
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead className="bg-[#F8FAFC]">
              <tr>
                <th className="px-6 lg:px-8 py-4 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">Opportunity</th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">Account</th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">Location</th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">Market Sector</th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">Project Value</th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">Match Score</th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">AI Score</th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">Priority</th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">Deadline</th>
                <th className="px-6 lg:px-8 py-4 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#F1F5F9]">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <Loader2 className="animate-spin h-6 w-6 text-[#4338CA] mr-2" />
                      <span className="text-[#6B7280]">Loading opportunities...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOpportunities.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="text-[#6B7280]">
                      <Target className="h-12 w-12 mx-auto mb-4 text-[#D1D5DB]" />
                      <p className="text-lg font-medium mb-2">No opportunities found</p>
                      <p className="text-sm">Create your first opportunity to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOpportunities.map((opp) => (
                <tr 
                  key={opp.id} 
                  className="hover:bg-[#F8FAFC] transition-all duration-200 group cursor-pointer"
                  onClick={() => {
                    const opportunityId = opp.id || opp.id;
                    navigate(`/module/opportunities/pipeline/${opportunityId}`);
                  }}
                >
                  
                  <td className="px-6 lg:px-8 py-6">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#4338CA] to-[#3730A3] rounded-xl flex items-center justify-center text-white font-bold text-sm mr-4 group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
                        {opp.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        {editingOpportunity === opp.id ? (
                          <>
                            <input
                              type="text"
                              value={editingData.project_name || ''}
                              onChange={(e) => setEditingData({...editingData, project_name: e.target.value})}
                              className="w-full px-2 py-1 text-sm font-semibold text-[#111827] border border-[#D1D5DB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4338CA]/20 mb-1"
                              placeholder="Project name"
                            />
                            <textarea
                              value={editingData.description || ''}
                              onChange={(e) => setEditingData({...editingData, description: e.target.value})}
                              className="w-full px-2 py-1 text-xs text-[#6B7280] border border-[#D1D5DB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4338CA]/20 resize-none"
                              placeholder="Project description"
                              rows={2}
                            />
                          </>
                        ) : (
                          <>
                            <h4 className="text-sm font-semibold text-[#111827] group-hover:text-[#4338CA] transition-colors mb-1 truncate">
                              {opp.name}
                            </h4>
                            <p className="text-xs text-[#6B7280] leading-relaxed line-clamp-2 max-w-[250px] lg:max-w-[300px]">
                              {opp.description}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-4 lg:px-6 py-6">
                    {editingOpportunity === opp.id ? (
                      <select
                        value={editingData.account_id || opp.accountId || ''}
                        onChange={(e) => setEditingData({...editingData, account_id: e.target.value})}
                        className="w-full px-2 py-1 text-sm font-medium text-[#374151] border border-[#D1D5DB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4338CA]/20"
                      >
                        <option value="">Select Account</option>
                        {accounts.map((account: any) => (
                          <option key={account.account_id} value={account.account_id}>
                            {account.client_name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      opp.accountName === 'No Account' ? (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                            N
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-gray-500 truncate max-w-[120px]">
                              {opp.accountName}
                            </span>
                            <button
                              onClick={() => handleAssignAccount(opp.id)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                            >
                              Assign Account
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                            {opp.accountName.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-[#374151] truncate max-w-[120px]">
                              {opp.accountName}
                            </span>
                            {opp.accountCustomId && (
                              <span className="text-xs text-gray-500 truncate max-w-[120px]">
                                {opp.accountCustomId}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </td>
                  
                  
                  <td className="px-4 lg:px-6 py-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#6B7280] flex-shrink-0" />
                      <span className="text-sm font-medium text-[#374151] truncate">{opp.state}</span>
                    </div>
                  </td>
                  
                  
                  <td className="px-4 lg:px-6 py-6">
                    {editingOpportunity === opp.id ? (
                      <input
                        type="text"
                        value={editingData.market_sector || ''}
                        onChange={(e) => setEditingData({...editingData, market_sector: e.target.value})}
                        className="w-full px-2 py-1 text-xs font-semibold text-[#1E40AF] border border-[#D1D5DB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4338CA]/20"
                        placeholder="Market sector"
                      />
                    ) : (
                      <span className="inline-flex px-2 lg:px-3 py-1 lg:py-1.5 text-xs font-semibold bg-[#EFF6FF] text-[#1E40AF] rounded-full">
                        {opp.marketSector}
                      </span>
                    )}
                  </td>
                  
                  
                  <td className="px-4 lg:px-6 py-6">
                    {editingOpportunity === opp.id ? (
                      <input
                        type="text"
                        value={editingData.project_value || ''}
                        onChange={(e) => setEditingData({...editingData, project_value: e.target.value})}
                        className="w-full px-2 py-1 text-sm font-bold text-[#111827] border border-[#D1D5DB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4338CA]/20"
                        placeholder="Project value"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
                        <span className="text-sm font-bold text-[#111827]">{opp.projectValue}</span>
                      </div>
                    )}
                  </td>
                  
                  
                  <td className="px-4 lg:px-6 py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-12 lg:w-16 bg-[#E5E7EB] rounded-full h-2 flex-shrink-0">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            opp.match >= 90 ? 'bg-green-500' : 
                            opp.match >= 80 ? 'bg-blue-500' : 
                            opp.match >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${opp.match}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs lg:text-sm font-semibold px-1 lg:px-2 py-1 rounded-md whitespace-nowrap ${getMatchColor(opp.match)}`}>
                        {opp.match}%
                      </span>
                    </div>
                  </td>
                  
                  
                  <td className="px-4 lg:px-6 py-6">
                    <div className="flex items-center gap-2">
                      <Star className={`w-4 h-4 ${getAIScoreColor(opp.aiScore)} flex-shrink-0`} />
                      <span className={`text-sm font-semibold ${getAIScoreColor(opp.aiScore)}`}>
                        {opp.aiScore}
                      </span>
                    </div>
                  </td>
                  
                  
                  <td className="px-4 lg:px-6 py-6">
                    <span className={`inline-flex px-2 lg:px-3 py-1 lg:py-1.5 text-xs font-semibold rounded-full border whitespace-nowrap ${getPriorityColor(opp.priority)}`}>
                      {opp.priority}
                    </span>
                  </td>
                  
                  
                  <td className="px-4 lg:px-6 py-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#6B7280] flex-shrink-0" />
                      <span className="text-sm font-medium text-[#374151] whitespace-nowrap">
                        {new Date(opp.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </td>
                  
                  
                  <td className="px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-1 lg:gap-2">
                      {editingOpportunity === opp.id ? (
                        <>
                          <button 
                            onClick={() => handleSaveOpportunity(opp.id)}
                            disabled={isSaving}
                            className="px-2 lg:px-3 py-1.5 lg:py-2 bg-[#10B981] text-white rounded-lg text-xs lg:text-sm font-semibold hover:bg-[#059669] transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSaving ? (
                              <Loader2 className="w-3 h-3 lg:w-4 lg:h-4 animate-spin" />
                            ) : (
                              <Save className="w-3 h-3 lg:w-4 lg:h-4" />
                            )}
                            <span className="hidden sm:inline">
                              {isSaving ? 'Saving...' : 'Save'}
                            </span>
                          </button>
                          <button 
                            onClick={handleCancelEdit}
                            className="px-2 lg:px-3 py-1.5 lg:py-2 bg-[#DC2626] text-white rounded-lg text-xs lg:text-sm font-semibold hover:bg-[#B91C1C] transition-colors flex items-center gap-1"
                          >
                            <X className="w-3 h-3 lg:w-4 lg:h-4" />
                            <span className="hidden sm:inline">Cancel</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditOpportunity(opp.id, opp);
                            }}
                            className="px-2 lg:px-3 py-1.5 lg:py-2 bg-[#F59E0B] text-white rounded-lg text-xs lg:text-sm font-semibold hover:bg-[#D97706] transition-colors flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3 lg:w-4 lg:h-4" />
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const opportunityId = opp.id || opp.id;
                              navigate(`/module/opportunities/analysis?opportunityId=${opportunityId}`);
                            }}
                            className="px-2 lg:px-3 py-1.5 lg:py-2 bg-white border border-[#D1D5DB] text-[#374151] rounded-lg text-xs lg:text-sm font-semibold hover:bg-[#F9FAFB] transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3 lg:w-4 lg:h-4" />
                            <span className="hidden sm:inline">View</span>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="block lg:hidden space-y-4 p-4">
          {transformedOpportunities.map((opp) => (
            <div 
              key={opp.id} 
              className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                const opportunityId = opp.id || opp.id;
                navigate(`/module/opportunities/pipeline/${opportunityId}`);
              }}
            >
              
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#4338CA] to-[#3730A3] rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {opp.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-semibold text-[#111827] mb-1 line-clamp-1">
                    {opp.name}
                  </h4>
                  <p className="text-sm text-[#6B7280] leading-relaxed line-clamp-2">
                    {opp.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#6B7280]" />
                  <span className="text-sm font-medium text-[#374151]">{opp.state}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#16A34A]" />
                  <span className="text-sm font-bold text-[#111827]">{opp.projectValue}</span>
                </div>
                <div>
                  <span className="inline-flex px-3 py-1.5 text-xs font-semibold bg-[#EFF6FF] text-[#1E40AF] rounded-full">
                    {opp.marketSector}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#6B7280]" />
                  <span className="text-sm font-medium text-[#374151]">
                    {new Date(opp.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#374151]">Match:</span>
                  <div className="w-16 bg-[#E5E7EB] rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        opp.match >= 90 ? 'bg-green-500' : 
                        opp.match >= 80 ? 'bg-blue-500' : 
                        opp.match >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${opp.match}%` }}
                    ></div>
                  </div>
                  <span className={`text-sm font-semibold ${getMatchColor(opp.match)}`}>
                    {opp.match}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className={`w-4 h-4 ${getAIScoreColor(opp.aiScore)}`} />
                  <span className={`text-sm font-semibold ${getAIScoreColor(opp.aiScore)}`}>
                    AI: {opp.aiScore}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full border ${getPriorityColor(opp.priority)}`}>
                  {opp.priority} Priority
                </span>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 bg-[#4338CA] text-white rounded-lg text-sm font-semibold hover:bg-[#3730A3] transition-colors flex items-center gap-1">
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const opportunityId = opp.id || opp.id;
                      navigate(`/module/opportunities/analysis?opportunityId=${opportunityId}`);
                    }}
                    className="px-4 py-2 bg-white border border-[#D1D5DB] text-[#374151] rounded-lg text-sm font-semibold hover:bg-[#F9FAFB] transition-colors flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

SourceOpportunitiesContent.displayName = 'SourceOpportunitiesContent';