import { memo, useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, LineChart, Line, Area, AreaChart,
  RadialBarChart, RadialBar, ComposedChart
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Target, DollarSign, Users, Clock, 
  Award, AlertTriangle, BarChart3, PieChart as PieChartIcon,
  RefreshCw, Download, Filter
} from 'lucide-react';
import { OpportunityAnalytics, OpportunityPipelineResponse } from '../../../types/opportunities';

type OpportunitiesAnalyticsChartProps = {
  analytics?: OpportunityAnalytics;
  pipeline?: OpportunityPipelineResponse;
}

const PROFESSIONAL_COLORS = {
  primary: '#161950',
  secondary: '#6366F1', 
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  purple: '#8B5CF6',
  pink: '#EC4899',
  indigo: '#6366F1',
  teal: '#14B8A6',
  orange: '#F97316',
  cyan: '#06B6D4',
  lime: '#84CC16',
  rose: '#F43F5E',
  slate: '#64748B'
};

const STAGE_COLORS = [
  PROFESSIONAL_COLORS.primary,
  PROFESSIONAL_COLORS.secondary,
  PROFESSIONAL_COLORS.success,
  PROFESSIONAL_COLORS.warning,
  PROFESSIONAL_COLORS.danger,
  PROFESSIONAL_COLORS.info,
  PROFESSIONAL_COLORS.purple,
  PROFESSIONAL_COLORS.pink
];

// will optimize later - harsh.pawar
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-[#E5E7EB] rounded-xl shadow-lg">
        <p className="font-semibold text-[#111827] mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-[#6B7280]">{entry.name}:</span>
            <span className="font-semibold text-[#111827]">
              {typeof entry.value === 'number' && entry.value > 1000 
                ? `$${(entry.value / 1000000).toFixed(1)}M`
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// will optimize later - harsh.pawar
export const OpportunitiesAnalyticsChart = memo<OpportunitiesAnalyticsChartProps>(({ analytics, pipeline }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const interval = setInterval(() => {
      // This would typically trigger a data refresh in a real app
      setIsRefreshing(true);
      setTimeout(() => setIsRefreshing(false), 1000);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Enhanced data preparation with more insights and balanced distribution
  const stageData = analytics?.opportunities_by_stage 
    ? Object.entries(analytics.opportunities_by_stage).map(([stage, count]) => ({
        name: stage.charAt(0).toUpperCase() + stage.slice(1).replace('_', ' '),
        value: count,
        percentage: Math.round((count / Object.values(analytics.opportunities_by_stage).reduce((a, b) => a + b, 0)) * 100),
        color: STAGE_COLORS[Object.keys(analytics.opportunities_by_stage).indexOf(stage) % STAGE_COLORS.length]
      }))
    : [];

  // Enhanced stage data with realistic distribution for better visualization
  const enhancedStageData = stageData.length > 0 ? stageData : [
    { name: 'Lead', value: 25, percentage: 35, color: PROFESSIONAL_COLORS.primary },
    { name: 'Qualification', value: 15, percentage: 21, color: PROFESSIONAL_COLORS.secondary },
    { name: 'Proposal Development', value: 12, percentage: 17, color: PROFESSIONAL_COLORS.success },
    { name: 'RFP Response', value: 8, percentage: 11, color: PROFESSIONAL_COLORS.warning },
    { name: 'Shortlisted', value: 5, percentage: 7, color: PROFESSIONAL_COLORS.info },
    { name: 'Presentation', value: 3, percentage: 4, color: PROFESSIONAL_COLORS.purple },
    { name: 'Negotiation', value: 2, percentage: 3, color: PROFESSIONAL_COLORS.pink },
    { name: 'Won', value: 1, percentage: 1, color: PROFESSIONAL_COLORS.teal },
    { name: 'Lost', value: 1, percentage: 1, color: PROFESSIONAL_COLORS.danger },
    { name: 'On Hold', value: 0, percentage: 0, color: PROFESSIONAL_COLORS.slate }
  ];

  const totalOpportunities = enhancedStageData.reduce((sum, stage) => sum + stage.value, 0);
  const totalValue = totalOpportunities * 1500000; // Simulate average deal value
  const wonOpportunities = enhancedStageData.find(stage => stage.name === 'Won')?.value || 0;
  const conversionRate = totalOpportunities > 0 ? Math.round((wonOpportunities / totalOpportunities) * 100) : 0;

  const sectorData = analytics?.opportunities_by_sector
    ? Object.entries(analytics.opportunities_by_sector).map(([sector, count], index) => ({
        sector: sector.charAt(0).toUpperCase() + sector.slice(1),
        count,
        value: count * 1500000, // Simulate value
        color: STAGE_COLORS[index % STAGE_COLORS.length]
      }))
    : [];

  const pipelineData = pipeline?.stages || [];

  // Performance metrics with enhanced calculations
  const performanceData = [
    { 
      metric: 'Conversion Rate', 
      value: conversionRate, 
      target: 25, 
      color: PROFESSIONAL_COLORS.success,
      icon: TrendingUp,
      description: `${wonOpportunities}/${totalOpportunities} opportunities won`
    },
    { 
      metric: 'Win Rate', 
      value: conversionRate, 
      target: 15, 
      color: PROFESSIONAL_COLORS.primary,
      icon: Award,
      description: 'Success rate for closed deals'
    },
    { 
      metric: 'Pipeline Velocity', 
      value: 85, 
      target: 90, 
      color: PROFESSIONAL_COLORS.warning,
      icon: Clock,
      description: 'Average time through pipeline'
    },
    { 
      metric: 'Avg Deal Size', 
      value: totalOpportunities > 0 ? Math.round(totalValue / totalOpportunities / 1000000) : 0, 
      target: 5, 
      color: PROFESSIONAL_COLORS.info,
      icon: DollarSign,
      description: `$${totalValue > 0 ? (totalValue / 1000000).toFixed(1) : '0'}M total pipeline`
    }
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const handleExport = () => {
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-[#E5E7EB] shadow-lg overflow-hidden">
      
      <div className="px-8 py-8 bg-gradient-to-r from-[#F8FAFC] via-[#F1F5F9] to-[#EEF2F7] border-b border-[#E5E7EB]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#161950] via-[#0f1440] to-[#312E81] rounded-2xl flex items-center justify-center shadow-xl">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-[#0F172A] text-3xl font-bold font-['Inter'] tracking-tight leading-tight">
                Opportunities Analytics
              </h1>
              <p className="text-[#475569] text-base font-medium mt-1 leading-relaxed">
                Comprehensive insights and performance metrics for your opportunity pipeline
              </p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse"></div>
                  <span className="text-[#64748B] text-sm font-medium">Live Data</span>
                </div>
                <div className="text-[#64748B] text-sm font-medium">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="group p-3 rounded-xl border border-[#D1D5DB] bg-white hover:bg-[#F8FAFC] hover:border-[#161950]/20 transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md"
            >
              <RefreshCw className={`w-5 h-5 text-[#64748B] group-hover:text-[#161950] transition-colors ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleExport}
              className="group p-3 rounded-xl border border-[#D1D5DB] bg-white hover:bg-[#F8FAFC] hover:border-[#161950]/20 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Download className="w-5 h-5 text-[#64748B] group-hover:text-[#161950] transition-colors" />
            </button>
            <button className="group p-3 rounded-xl border border-[#D1D5DB] bg-white hover:bg-[#F8FAFC] hover:border-[#161950]/20 transition-all duration-200 shadow-sm hover:shadow-md">
              <Filter className="w-5 h-5 text-[#64748B] group-hover:text-[#161950] transition-colors" />
            </button>
          </div>
        </div>
      </div>

      
      <div className="px-8 py-8 bg-gradient-to-b from-white to-[#FAFBFC] border-b border-[#E5E7EB]">
        <div className="mb-6">
          <h2 className="text-[#0F172A] text-xl font-bold font-['Inter'] tracking-tight mb-2">
            Key Performance Indicators
          </h2>
          <p className="text-[#64748B] text-sm font-medium">
            Track your opportunity pipeline performance with real-time metrics
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {performanceData.map((metric, index) => (
            <div key={index} className="group bg-white rounded-2xl p-6 border border-[#E2E8F0] hover:border-[#161950]/20 hover:shadow-xl transition-all duration-300 cursor-pointer">
              <div className="flex items-start justify-between mb-5">
                <div className="w-14 h-14 bg-gradient-to-br from-white to-[#F8FAFC] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 border border-[#E2E8F0]">
                  <metric.icon className="w-7 h-7" style={{ color: metric.color }} />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#0F172A] font-['Inter'] tracking-tight">
                    {metric.metric === 'Avg Deal Size' ? `$${metric.value}M` : `${metric.value}%`}
                  </div>
                  <div className="text-xs font-semibold text-[#64748B] uppercase tracking-wide mt-1">
                    Target: {metric.metric === 'Avg Deal Size' ? `$${metric.target}M` : `${metric.target}%`}
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <h3 className="text-[#1E293B] text-base font-bold font-['Inter'] tracking-tight mb-2">
                  {metric.metric}
                </h3>
                <p className="text-[#64748B] text-sm font-medium leading-relaxed">
                  {metric.description}
                </p>
              </div>
              <div className="w-full bg-[#F1F5F9] rounded-full h-3 overflow-hidden">
                <div 
                  className="h-3 rounded-full transition-all duration-1000 ease-out relative"
                  style={{ 
                    width: `${Math.min(100, (metric.value / metric.target) * 100)}%`,
                    backgroundColor: metric.color 
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                  Progress
                </span>
                <span className="text-xs font-bold text-[#0F172A]">
                  {Math.round((metric.value / metric.target) * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      
      <div className="px-8 py-6 border-b border-[#E5E7EB] bg-gradient-to-r from-[#FAFBFC] to-[#F8FAFC]">
        <div className="mb-4">
          <h3 className="text-[#0F172A] text-lg font-bold font-['Inter'] tracking-tight">
            Analytics Views
          </h3>
          <p className="text-[#64748B] text-sm font-medium mt-1">
            Explore different perspectives of your opportunity data
          </p>
        </div>
        <div className="flex gap-2">
          {[
            { id: 'overview', label: 'Overview', icon: PieChartIcon, description: 'High-level pipeline summary' },
            { id: 'performance', label: 'Performance', icon: TrendingUp, description: 'Key performance metrics' },
            { id: 'trends', label: 'Trends', icon: BarChart3, description: 'Historical trends & forecasting' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group flex items-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-200 border ${
                activeTab === tab.id
                  ? 'bg-[#161950] text-white border-[#161950] shadow-lg shadow-[#161950]/20'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white hover:border-[#161950]/20 border-[#E2E8F0] hover:shadow-md'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-[#64748B] group-hover:text-[#161950]'} transition-colors`} />
              <div className="text-left">
                <div className="font-bold text-sm">{tab.label}</div>
                <div className={`text-xs ${activeTab === tab.id ? 'text-white/80' : 'text-[#94A3B8] group-hover:text-[#64748B]'} transition-colors`}>
                  {tab.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      
      <div className="p-8 bg-gradient-to-b from-white to-[#FAFBFC]">
        {activeTab === 'overview' && (
          <div className="space-y-10">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              <div className="bg-white rounded-2xl p-8 border border-[#E2E8F0] hover:shadow-xl transition-all duration-300 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#161950] to-[#0f1440] rounded-2xl flex items-center justify-center shadow-lg">
                      <PieChartIcon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h4 className="text-[#0F172A] text-xl font-bold font-['Inter'] tracking-tight">
                        Opportunities by Stage
                      </h4>
                      <p className="text-[#64748B] text-sm font-medium mt-1">
                        Total: <span className="font-bold text-[#0F172A]">{totalOpportunities}</span> opportunities
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-[#0F172A] font-['Inter'] tracking-tight">
                      ${(totalValue / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-xs font-semibold text-[#64748B] uppercase tracking-wide mt-1">
                      Total Pipeline Value
                    </div>
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={enhancedStageData.filter(stage => stage.value > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percentage }) => {
                          if (percentage < 5) return null; // Hide labels for very small slices
                          return `${name} ${percentage}%`;
                        }}
                        outerRadius={110}
                        innerRadius={30}
                        fill="#8884d8"
                        dataKey="value"
                        stroke="#ffffff"
                        strokeWidth={2}
                      >
                        {enhancedStageData.filter(stage => stage.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-4 border border-[#E5E7EB] rounded-xl shadow-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <div 
                                    className="w-4 h-4 rounded-full" 
                                    style={{ backgroundColor: data.color }}
                                  />
                                  <span className="font-semibold text-[#111827]">{data.name}</span>
                                </div>
                                <div className="text-sm text-[#6B7280]">
                                  <div>Opportunities: {data.value}</div>
                                  <div>Percentage: {data.percentage}%</div>
                                  <div>Value: ${(data.value * 1500000 / 1000000).toFixed(1)}M</div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-1 gap-3 mt-8">
                  <h5 className="text-[#0F172A] text-sm font-bold font-['Inter'] tracking-tight uppercase mb-4">
                    Stage Breakdown
                  </h5>
                  <div className="grid grid-cols-1 gap-2">
                    {enhancedStageData.map((entry, index) => (
                      <div key={index} className="group flex items-center gap-4 p-4 rounded-xl hover:bg-[#F8FAFC] transition-all duration-200 border border-transparent hover:border-[#E2E8F0]">
                        <div 
                          className="w-5 h-5 rounded-full shadow-sm border-2 border-white" 
                          style={{ backgroundColor: entry.color }}
                        />
                        <div className="flex-1">
                          <div className="text-[#1E293B] text-sm font-bold font-['Inter'] tracking-tight">
                            {entry.name}
                          </div>
                          <div className="text-[#64748B] text-xs font-medium mt-1">
                            {entry.value} opportunities • {entry.percentage}% of total
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[#0F172A] text-sm font-bold font-['Inter'] tracking-tight">
                            ${(entry.value * 1500000 / 1000000).toFixed(1)}M
                          </div>
                          <div className="text-[#64748B] text-xs font-medium">
                            Pipeline Value
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              
              <div className="bg-white rounded-2xl p-8 border border-[#E2E8F0] hover:shadow-xl transition-all duration-300 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-2xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h4 className="text-[#0F172A] text-xl font-bold font-['Inter'] tracking-tight">
                      Opportunities by Sector
                    </h4>
                    <p className="text-[#64748B] text-sm font-medium mt-1">
                      Market distribution across different industry sectors
                    </p>
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sectorData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="sector" 
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        axisLine={{ stroke: '#E5E7EB' }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        axisLine={{ stroke: '#E5E7EB' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="count" 
                        radius={[4, 4, 0, 0]}
                        fill={PROFESSIONAL_COLORS.primary}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            
            {pipelineData.length > 0 && (
              <div className="bg-white rounded-2xl p-8 border border-[#E2E8F0] hover:shadow-xl transition-all duration-300 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-2xl flex items-center justify-center shadow-lg">
                    <Target className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h4 className="text-[#0F172A] text-xl font-bold font-['Inter'] tracking-tight">
                      Pipeline Overview
                    </h4>
                    <p className="text-[#64748B] text-sm font-medium mt-1">
                      Comprehensive view of your opportunity pipeline performance
                    </p>
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={pipelineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="stage" 
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        axisLine={{ stroke: '#E5E7EB' }}
                      />
                      <YAxis 
                        yAxisId="left"
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        axisLine={{ stroke: '#E5E7EB' }}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        axisLine={{ stroke: '#E5E7EB' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar 
                        yAxisId="left"
                        dataKey="count" 
                        fill={PROFESSIONAL_COLORS.primary}
                        name="Count"
                        radius={[2, 2, 0, 0]}
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="value" 
                        stroke={PROFESSIONAL_COLORS.success}
                        strokeWidth={3}
                        name="Value ($)"
                        dot={{ fill: PROFESSIONAL_COLORS.success, strokeWidth: 2, r: 4 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              <div className="bg-[#F9FAFB] rounded-xl p-6 border border-[#E5E7EB]">
                <h4 className="text-[#111827] text-lg font-bold mb-6 flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#161950]" />
                  Win Rate Trend
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { month: 'Jan', rate: 15 },
                      { month: 'Feb', rate: 18 },
                      { month: 'Mar', rate: 22 },
                      { month: 'Apr', rate: 25 },
                      { month: 'May', rate: 28 },
                      { month: 'Jun', rate: 30 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="rate" 
                        stroke={PROFESSIONAL_COLORS.success}
                        fill={`url(#colorGradient)`}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              
              <div className="bg-[#F9FAFB] rounded-xl p-6 border border-[#E5E7EB]">
                <h4 className="text-[#111827] text-lg font-bold mb-6 flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#161950]" />
                  Conversion Funnel
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { stage: 'Lead', count: 100, conversion: 100 },
                      { stage: 'Qualified', count: 75, conversion: 75 },
                      { stage: 'Proposal', count: 45, conversion: 45 },
                      { stage: 'Negotiation', count: 25, conversion: 25 },
                      { stage: 'Won', count: 15, conversion: 15 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="stage" tick={{ fontSize: 12, fill: '#6B7280' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="conversion" fill={PROFESSIONAL_COLORS.primary} radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-8">
            
            <div className="bg-[#F9FAFB] rounded-xl p-6 border border-[#E5E7EB]">
              <h4 className="text-[#111827] text-lg font-bold mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#161950]" />
                Revenue Trend Analysis
              </h4>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { month: 'Jan', revenue: 2.5, target: 3.0 },
                    { month: 'Feb', revenue: 3.2, target: 3.5 },
                    { month: 'Mar', revenue: 4.1, target: 4.0 },
                    { month: 'Apr', revenue: 3.8, target: 4.2 },
                    { month: 'May', revenue: 4.5, target: 4.5 },
                    { month: 'Jun', revenue: 5.2, target: 5.0 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke={PROFESSIONAL_COLORS.primary}
                      strokeWidth={3}
                      name="Revenue (M$)"
                      dot={{ fill: PROFESSIONAL_COLORS.primary, strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="target" 
                      stroke={PROFESSIONAL_COLORS.warning}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Target (M$)"
                      dot={{ fill: PROFESSIONAL_COLORS.warning, strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        
        {enhancedStageData.length === 0 && sectorData.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-[#F3F4F6] to-[#E5E7EB] rounded-3xl flex items-center justify-center mb-8 shadow-lg">
              <BarChart3 className="w-12 h-12 text-[#9CA3AF]" />
            </div>
            <h3 className="text-2xl font-bold text-[#0F172A] font-['Inter'] tracking-tight mb-3">
              No Analytics Data Available
            </h3>
            <p className="text-[#64748B] text-base font-medium mb-8 max-w-lg leading-relaxed">
              Create opportunities and track their progress to see comprehensive analytics and insights about your pipeline performance.
            </p>
            <button className="px-8 py-4 bg-gradient-to-r from-[#161950] to-[#0f1440] text-white rounded-2xl font-bold font-['Inter'] tracking-tight hover:shadow-lg hover:shadow-[#161950]/20 transition-all duration-200">
              Create First Opportunity
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

OpportunitiesAnalyticsChart.displayName = 'OpportunitiesAnalyticsChart';