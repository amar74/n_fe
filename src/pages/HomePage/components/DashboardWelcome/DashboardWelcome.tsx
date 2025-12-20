import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Package, 
  FileSignature, 
  FolderKanban, 
  DollarSign, 
  ShoppingCart, 
  BarChart3, 
  ArrowRight,
  Building2,
  Calendar,
  Target,
  Activity,
  Clock,
  Plus,
  FileCheck,
  Sparkles,
  Layers,
  MessageSquare,
  ClipboardList,
  TrendingDown,
  Wallet,
  Receipt,
  PieChart as PieChartIcon,
  Briefcase,
  UserPlus,
  Settings,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Enhanced module cards data with gradients
const modules = [
  {
    name: 'Opportunities',
    description: 'Track and manage sales opportunities',
    icon: TrendingUp,
    path: '/module/opportunities',
    gradient: 'from-blue-500 to-blue-600',
    lightGradient: 'from-blue-50 to-blue-100',
    iconColor: 'text-blue-600',
    hoverColor: 'hover:from-blue-600 hover:to-blue-700',
  },
  {
    name: 'Accounts',
    description: 'Manage client accounts and relationships',
    icon: Users,
    path: '/module/accounts',
    gradient: 'from-purple-500 to-purple-600',
    lightGradient: 'from-purple-50 to-purple-100',
    iconColor: 'text-purple-600',
    hoverColor: 'hover:from-purple-600 hover:to-purple-700',
  },
  {
    name: 'Proposals',
    description: 'Create and track proposals',
    icon: FileText,
    path: '/module/proposals',
    gradient: 'from-green-500 to-green-600',
    lightGradient: 'from-green-50 to-green-100',
    iconColor: 'text-green-600',
    hoverColor: 'hover:from-green-600 hover:to-green-700',
  },
  {
    name: 'Resources',
    description: 'Manage team and resources',
    icon: Package,
    path: '/module/resources',
    gradient: 'from-orange-500 to-orange-600',
    lightGradient: 'from-orange-50 to-orange-100',
    iconColor: 'text-orange-600',
    hoverColor: 'hover:from-orange-600 hover:to-orange-700',
  },
  {
    name: 'Contracts',
    description: 'Contract management and tracking',
    icon: FileSignature,
    path: '/module/contracts',
    gradient: 'from-indigo-500 to-indigo-600',
    lightGradient: 'from-indigo-50 to-indigo-100',
    iconColor: 'text-indigo-600',
    hoverColor: 'hover:from-indigo-600 hover:to-indigo-700',
  },
  {
    name: 'Projects',
    description: 'Project planning and execution',
    icon: FolderKanban,
    path: '/module/projects',
    gradient: 'from-pink-500 to-pink-600',
    lightGradient: 'from-pink-50 to-pink-100',
    iconColor: 'text-pink-600',
    hoverColor: 'hover:from-pink-600 hover:to-pink-700',
  },
  {
    name: 'Finance',
    description: 'Financial tracking and reporting',
    icon: DollarSign,
    path: '/module/finance',
    gradient: 'from-emerald-500 to-emerald-600',
    lightGradient: 'from-emerald-50 to-emerald-100',
    iconColor: 'text-emerald-600',
    hoverColor: 'hover:from-emerald-600 hover:to-emerald-700',
  },
  {
    name: 'Procurement',
    description: 'Procurement and purchasing',
    icon: ShoppingCart,
    path: '/module/procurement',
    gradient: 'from-cyan-500 to-cyan-600',
    lightGradient: 'from-cyan-50 to-cyan-100',
    iconColor: 'text-cyan-600',
    hoverColor: 'hover:from-cyan-600 hover:to-cyan-700',
  },
  {
    name: 'KPIs',
    description: 'Key performance indicators',
    icon: BarChart3,
    path: '/module/kpis',
    gradient: 'from-red-500 to-red-600',
    lightGradient: 'from-red-50 to-red-100',
    iconColor: 'text-red-600',
    hoverColor: 'hover:from-red-600 hover:to-red-700',
  },
  {
    name: 'Surveys',
    description: 'Client and employee surveys',
    icon: MessageSquare,
    path: '/module/surveys',
    gradient: 'from-violet-500 to-violet-600',
    lightGradient: 'from-violet-50 to-violet-100',
    iconColor: 'text-violet-600',
    hoverColor: 'hover:from-violet-600 hover:to-violet-700',
  },
  {
    name: 'Delivery Models',
    description: 'Delivery approach templates',
    icon: Layers,
    path: '/module/delivery-models',
    gradient: 'from-teal-500 to-teal-600',
    lightGradient: 'from-teal-50 to-teal-100',
    iconColor: 'text-teal-600',
    hoverColor: 'hover:from-teal-600 hover:to-teal-700',
  },
  {
    name: 'AI Agentic',
    description: 'AI-powered assistant and automation',
    icon: Sparkles,
    path: '/module/ai-agentic',
    gradient: 'from-[#161950] to-[#1E2B5B]',
    lightGradient: 'from-[#161950]/10 to-[#1E2B5B]/10',
    iconColor: 'text-[#161950]',
    hoverColor: 'hover:from-[#1E2B5B] hover:to-[#161950]',
  },
];

// Chart colors
const CHART_COLORS = {
  primary: '#161950',
  secondary: '#6366F1',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
};

function DashboardWelcome() {
  const { user, backendUser } = useAuth();

  // Fetch dashboard statistics from backend
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await apiClient.get('/dashboard/stats');
      return response.data;
    },
    enabled: !!backendUser,
  });

  // Fetch opportunity analytics for charts
  const { data: opportunityAnalytics } = useQuery({
    queryKey: ['opportunityAnalytics'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/opportunities/analytics/dashboard?days=30');
        return response.data;
      } catch (error) {
        return null;
      }
    },
    enabled: !!backendUser,
  });

  // Fetch opportunity pipeline
  const { data: opportunityPipeline } = useQuery({
    queryKey: ['opportunityPipeline'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/opportunities/pipeline/view');
        return response.data;
      } catch (error) {
        return null;
      }
    },
    enabled: !!backendUser,
  });

  // Fetch finance dashboard summary (revenue, expenses, net profit)
  const { data: financeSummary } = useQuery({
    queryKey: ['financeSummary'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/v1/finance/dashboard/summary');
        return response.data;
      } catch (error) {
        return null;
      }
    },
    enabled: !!backendUser,
  });

  // Fetch finance trends
  const { data: financeTrends } = useQuery({
    queryKey: ['financeTrends'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/v1/finance/dashboard/trends');
        return response.data;
      } catch (error) {
        return null;
      }
    },
    enabled: !!backendUser,
  });

  // Fetch account health analytics
  const { data: accountHealth } = useQuery({
    queryKey: ['accountHealth'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/ai/health-scoring/analytics/dashboard?time_period=30d');
        return response.data;
      } catch (error) {
        return null;
      }
    },
    enabled: !!backendUser,
  });

  // Fetch recent activity
  const { data: recentActivity } = useQuery({
    queryKey: ['recentActivity'],
    queryFn: async () => {
      const [accountsRes, opportunitiesRes] = await Promise.all([
        apiClient.get('/accounts?page=1&size=3').catch(() => ({ data: { accounts: [] } })),
        apiClient.get('/opportunities?page=1&size=3').catch(() => ({ data: { opportunities: [] } })),
      ]);
      
      const activities = [];
      
      // Add recent accounts
      if (accountsRes.data?.accounts) {
        accountsRes.data.accounts.forEach((account: any) => {
          activities.push({
            id: account.account_id,
            type: 'account',
            title: `New account created: ${account.client_name}`,
            time: new Date(account.created_at),
            icon: Building2,
            color: 'bg-blue-500',
          });
        });
      }
      
      // Add recent opportunities
      if (opportunitiesRes.data?.opportunities) {
        opportunitiesRes.data.opportunities.forEach((opp: any) => {
          activities.push({
            id: opp.id,
            type: 'opportunity',
            title: `New opportunity: ${opp.project_name}`,
            time: new Date(opp.created_at),
            icon: Target,
            color: 'bg-green-500',
          });
        });
      }
      
      // Sort by time (most recent first) and take top 5
      return activities.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5);
    },
    enabled: !!backendUser,
  });

  // Format currency values to millions (M)
  const formatToMillions = (value: string | number): string => {
    if (!value) return '$0M';
    
    const numericValue = typeof value === 'string' 
      ? parseFloat(value.replace(/[$,]/g, '')) 
      : value;
    
    if (isNaN(numericValue) || numericValue === 0) return '$0M';
    
    const millions = numericValue / 1000000;
    
    if (millions >= 100) {
      return `$${millions.toFixed(0)}M`;
    } else if (millions >= 10) {
      return `$${millions.toFixed(1)}M`;
    } else {
      return `$${millions.toFixed(2)}M`;
    }
  };

  // Prepare chart data
  const revenueChartData = opportunityAnalytics?.revenue_trend?.map((item: any) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: item.revenue || 0,
  })) || [];

  const pipelineChartData = opportunityPipeline?.stages?.map((stage: any) => ({
    name: stage.stage_name || 'Unknown',
    value: stage.total_value || 0,
    count: stage.opportunity_count || 0,
  })) || [];

  const stageDistributionData = opportunityAnalytics?.stage_distribution?.map((item: any) => ({
    name: item.stage || 'Unknown',
    value: item.count || 0,
  })) || [];

  // Finance trend chart data
  const financeTrendData = financeTrends?.monthly_data?.map((item: any) => ({
    month: item.month || 'Unknown',
    revenue: item.revenue || 0,
    expenses: item.expenses || 0,
    profit: (item.revenue || 0) - (item.expenses || 0),
  })) || [];

  // Revenue vs Expenses comparison data
  const revenueExpenseData = financeTrends?.monthly_data?.slice(-6).map((item: any) => ({
    month: item.month || 'Unknown',
    revenue: item.revenue || 0,
    expenses: item.expenses || 0,
  })) || [];

  // Analytics/Stats data - Enhanced with finance metrics
  const stats = [
    {
      title: 'Active Accounts',
      value: statsLoading ? '...' : String(dashboardStats?.active_accounts || 0),
      change: statsLoading ? '...' : (dashboardStats?.accounts_change || '0%'),
      trend: 'up',
      icon: Building2,
      gradient: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Open Opportunities',
      value: statsLoading ? '...' : String(dashboardStats?.open_opportunities || 0),
      change: statsLoading ? '...' : (dashboardStats?.opportunities_change || '0%'),
      trend: 'up',
      icon: Target,
      gradient: 'from-green-500 to-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'Active Projects',
      value: statsLoading ? '...' : String(dashboardStats?.active_projects || 0),
      change: statsLoading ? '...' : (dashboardStats?.projects_change || '0%'),
      trend: 'up',
      icon: Activity,
      gradient: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Total Revenue',
      value: financeSummary ? formatToMillions(financeSummary.total_revenue || 0) : (statsLoading ? '...' : formatToMillions(dashboardStats?.monthly_revenue || '0')),
      change: financeSummary?.revenue_change || (statsLoading ? '...' : (dashboardStats?.revenue_change || '0%')),
      trend: 'up',
      icon: DollarSign,
      gradient: 'from-emerald-500 to-emerald-600',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
  ];

  // Financial metrics cards
  const financeStats = [
    {
      title: 'Net Profit',
      value: financeSummary ? formatToMillions((financeSummary.total_revenue || 0) - (financeSummary.total_expenses || 0)) : '$0M',
      change: financeSummary?.profit_margin ? `${financeSummary.profit_margin.toFixed(1)}%` : '0%',
      trend: (financeSummary?.total_revenue || 0) > (financeSummary?.total_expenses || 0) ? 'up' : 'down',
      icon: TrendingUp,
      gradient: 'from-green-500 to-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'Total Revenue',
      value: financeSummary ? formatToMillions(financeSummary.total_revenue || 0) : '$0M',
      change: financeSummary?.revenue_change || '0%',
      trend: 'up',
      icon: Wallet,
      gradient: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Total Expenses',
      value: financeSummary ? formatToMillions(financeSummary.total_expenses || 0) : '$0M',
      change: financeSummary?.expense_change || '0%',
      trend: 'down',
      icon: Receipt,
      gradient: 'from-red-500 to-red-600',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
    },
    {
      title: 'Profit Margin',
      value: financeSummary?.profit_margin ? `${financeSummary.profit_margin.toFixed(1)}%` : '0%',
      change: financeSummary?.margin_change || '0%',
      trend: (financeSummary?.profit_margin || 0) > 0 ? 'up' : 'down',
      icon: PieChartIcon,
      gradient: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
  ];
  
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  
  const userName = backendUser?.email?.split('@')[0] || 'User';
  const displayName = userName.charAt(0).toUpperCase() + userName.slice(1);

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const PIE_COLORS = ['#161950', '#6366F1', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899'];

  // Calculate win rate and conversion metrics
  const winRate = opportunityAnalytics?.win_rate ? `${(opportunityAnalytics.win_rate * 100).toFixed(1)}%` : '0%';
  const avgDealSize = opportunityAnalytics?.average_deal_size ? formatToMillions(opportunityAnalytics.average_deal_size) : '$0M';
  const totalPipelineValue = opportunityPipeline?.total_pipeline_value ? formatToMillions(opportunityPipeline.total_pipeline_value) : '$0M';

  // Performance insights cards
  const performanceInsights = [
    {
      title: 'Win Rate',
      value: winRate,
      subtitle: 'Opportunity conversion',
      icon: Target,
      gradient: 'from-green-500 to-emerald-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'Avg Deal Size',
      value: avgDealSize,
      subtitle: 'Per opportunity',
      icon: Briefcase,
      gradient: 'from-blue-500 to-indigo-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Total Pipeline',
      value: totalPipelineValue,
      subtitle: 'All opportunities',
      icon: TrendingUp,
      gradient: 'from-purple-500 to-violet-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Account Health',
      value: accountHealth?.average_health_score ? `${Math.round(accountHealth.average_health_score)}%` : 'N/A',
      subtitle: 'Average score',
      icon: Activity,
      gradient: 'from-orange-500 to-amber-600',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
  ];

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 via-white to-gray-50" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {greeting}, {displayName}! 👋
              </h1>
              <p className="text-gray-600 text-lg" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Welcome back to your dashboard. Here's what's happening today.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
              <Calendar className="h-4 w-4" />
              <span style={{ fontFamily: "'Outfit', sans-serif" }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <div className={`h-1 bg-gradient-to-r ${stat.gradient}`}></div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                          {stat.title}
                        </p>
                        <h3 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                          {stat.value}
                        </h3>
                        <div className="flex items-center gap-1">
                          <TrendingUp className={`h-4 w-4 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                          <span className={`text-sm font-semibold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} style={{ fontFamily: "'Outfit', sans-serif" }}>
                            {stat.change}
                          </span>
                          <span className="text-xs text-gray-500" style={{ fontFamily: "'Outfit', sans-serif" }}>from last month</span>
                        </div>
                      </div>
                      <div className={`p-4 rounded-xl ${stat.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`h-7 w-7 ${stat.iconColor}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {financeSummary && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>Financial Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {financeStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.title} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                    <div className={`h-1 bg-gradient-to-r ${stat.gradient}`}></div>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-600 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            {stat.title}
                          </p>
                          <h3 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            {stat.value}
                          </h3>
                          <div className="flex items-center gap-1">
                            {stat.trend === 'up' ? (
                              <TrendingUp className={`h-4 w-4 text-green-600`} />
                            ) : (
                              <TrendingDown className={`h-4 w-4 text-red-600`} />
                            )}
                            <span className={`text-sm font-semibold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} style={{ fontFamily: "'Outfit', sans-serif" }}>
                              {stat.change}
                            </span>
                          </div>
                        </div>
                        <div className={`p-4 rounded-xl ${stat.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className={`h-7 w-7 ${stat.iconColor}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>Performance Insights</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {performanceInsights.map((insight) => {
              const Icon = insight.icon;
              return (
                <Card key={insight.title} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group bg-gradient-to-br from-white to-gray-50">
                  <div className={`h-1 bg-gradient-to-r ${insight.gradient}`}></div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                          {insight.title}
                        </p>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                          {insight.value}
                        </h3>
                        <p className="text-xs text-gray-500" style={{ fontFamily: "'Outfit', sans-serif" }}>
                          {insight.subtitle}
                        </p>
                      </div>
                      <div className={`p-3 rounded-xl ${insight.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`h-6 w-6 ${insight.iconColor}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {(revenueChartData.length > 0 || pipelineChartData.length > 0 || stageDistributionData.length > 0 || financeTrendData.length > 0) && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {revenueChartData.length > 0 && (
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      Revenue Trend (Last 30 Days)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={revenueChartData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="date" stroke="#6B7280" style={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px' }} />
                        <YAxis stroke="#6B7280" style={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #E5E7EB', 
                            borderRadius: '8px',
                            fontFamily: "'Outfit', sans-serif"
                          }} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke={CHART_COLORS.primary} 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorRevenue)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {financeTrendData.length > 0 && (
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      Revenue vs Expenses Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={financeTrendData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={CHART_COLORS.danger} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={CHART_COLORS.danger} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="month" stroke="#6B7280" style={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px' }} />
                        <YAxis stroke="#6B7280" style={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #E5E7EB', 
                            borderRadius: '8px',
                            fontFamily: "'Outfit', sans-serif"
                          }} 
                        />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke={CHART_COLORS.success} 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorRevenue)"
                          name="Revenue"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="expenses" 
                          stroke={CHART_COLORS.danger} 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorExpenses)"
                          name="Expenses"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {revenueExpenseData.length > 0 && (
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      Revenue vs Expenses (Last 6 Months)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={revenueExpenseData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="month" stroke="#6B7280" style={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px' }} />
                        <YAxis stroke="#6B7280" style={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #E5E7EB', 
                            borderRadius: '8px',
                            fontFamily: "'Outfit', sans-serif"
                          }} 
                        />
                        <Legend />
                        <Bar dataKey="revenue" fill={CHART_COLORS.success} radius={[8, 8, 0, 0]} name="Revenue" />
                        <Bar dataKey="expenses" fill={CHART_COLORS.danger} radius={[8, 8, 0, 0]} name="Expenses" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {stageDistributionData.length > 0 && (
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      Opportunity Stage Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={stageDistributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry: any) => `${entry.name}: ${((entry.percent || 0) * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {stageDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #E5E7EB', 
                            borderRadius: '8px',
                            fontFamily: "'Outfit', sans-serif"
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {accountHealth && accountHealth.health_score_distribution && (
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      Account Health Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(accountHealth.health_score_distribution).map(([range, count]: [string, any]) => {
                        const countNum = typeof count === 'number' ? count : 0;
                        const distribution = accountHealth.health_score_distribution as Record<string, number>;
                        const total = Object.values(distribution).reduce((sum: number, val: any) => {
                          const valNum = typeof val === 'number' ? val : 0;
                          return sum + valNum;
                        }, 0);
                        const totalNum = typeof total === 'number' ? total : 0;
                        const percentage = totalNum > 0 ? ((countNum / totalNum) * 100).toFixed(0) : '0';
                        const colorClass = range.includes('excellent') ? 'bg-green-500' : 
                                          range.includes('good') ? 'bg-blue-500' : 
                                          range.includes('fair') ? 'bg-yellow-500' : 'bg-red-500';
                        return (
                          <div key={range} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-700 font-medium" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                {range.split('(')[0].trim()}
                              </span>
                              <span className="text-gray-600" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                {countNum} ({percentage}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className={`h-2.5 rounded-full ${colorClass} transition-all duration-500`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>Modules</h2>
            <p className="text-sm text-gray-500" style={{ fontFamily: "'Outfit', sans-serif" }}>Click on any module to get started</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <Link
                  key={module.name}
                  to={module.path}
                  className="group"
                >
                  <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full overflow-hidden">
                    <div className={`h-1 bg-gradient-to-r ${module.gradient} ${module.hoverColor} transition-all duration-300`}></div>
                    <CardContent className="p-6">
                      <div className={`w-14 h-14 bg-gradient-to-br ${module.lightGradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                        <Icon className={`h-7 w-7 ${module.iconColor}`} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#161950] transition-colors" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        {module.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        {module.description}
                      </p>
                      <div className="flex items-center text-sm font-semibold text-[#161950] opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Open <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>Quick Actions</h2>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Link to="/module/accounts">
                    <Button variant="outline" className="w-full justify-start gap-3 h-auto py-5 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-all shadow-sm hover:shadow-md" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      <Users className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-semibold">New Account</div>
                        <div className="text-xs text-gray-500">Create account</div>
                      </div>
                    </Button>
                  </Link>
                  <Link to="/module/opportunities">
                    <Button variant="outline" className="w-full justify-start gap-3 h-auto py-5 hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-all shadow-sm hover:shadow-md" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      <TrendingUp className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-semibold">New Opportunity</div>
                        <div className="text-xs text-gray-500">Track new lead</div>
                      </div>
                    </Button>
                  </Link>
                  <Link to="/module/proposals">
                    <Button variant="outline" className="w-full justify-start gap-3 h-auto py-5 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 transition-all shadow-sm hover:shadow-md" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      <FileText className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-semibold">New Proposal</div>
                        <div className="text-xs text-gray-500">Create proposal</div>
                      </div>
                    </Button>
                  </Link>
                  <Link to="/module/projects">
                    <Button variant="outline" className="w-full justify-start gap-3 h-auto py-5 hover:bg-pink-50 hover:text-pink-700 hover:border-pink-300 transition-all shadow-sm hover:shadow-md" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      <FolderKanban className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-semibold">New Project</div>
                        <div className="text-xs text-gray-500">Start project</div>
                      </div>
                    </Button>
                  </Link>
                  <Link to="/module/resources">
                    <Button variant="outline" className="w-full justify-start gap-3 h-auto py-5 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 transition-all shadow-sm hover:shadow-md" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      <Package className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-semibold">Add Resource</div>
                        <div className="text-xs text-gray-500">Manage team</div>
                      </div>
                    </Button>
                  </Link>
                  <Link to="/module/finance">
                    <Button variant="outline" className="w-full justify-start gap-3 h-auto py-5 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-all shadow-sm hover:shadow-md" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      <DollarSign className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-semibold">Finance Report</div>
                        <div className="text-xs text-gray-500">View analytics</div>
                      </div>
                    </Button>
                  </Link>
                  <Link to="/module/procurement">
                    <Button variant="outline" className="w-full justify-start gap-3 h-auto py-5 hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-300 transition-all shadow-sm hover:shadow-md" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      <ShoppingCart className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-semibold">New Purchase</div>
                        <div className="text-xs text-gray-500">Procurement</div>
                      </div>
                    </Button>
                  </Link>
                  <Link to="/module/ai-agentic">
                    <Button variant="outline" className="w-full justify-start gap-3 h-auto py-5 hover:bg-[#161950]/10 hover:text-[#161950] hover:border-[#161950] transition-all shadow-sm hover:shadow-md" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      <Sparkles className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-semibold">AI Assistant</div>
                        <div className="text-xs text-gray-500">Get help</div>
                      </div>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>Recent Activity</h2>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                {!recentActivity || recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500" style={{ fontFamily: "'Outfit', sans-serif" }}>No recent activity</p>
                    <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>Start by creating accounts or opportunities</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity: any) => {
                      const ActivityIcon = activity.icon;
                      return (
                        <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className={`w-10 h-10 ${activity.color} rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm`}>
                            <ActivityIcon className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate" style={{ fontFamily: "'Outfit', sans-serif" }}>
                              {activity.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>{formatTimeAgo(activity.time)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(DashboardWelcome);
