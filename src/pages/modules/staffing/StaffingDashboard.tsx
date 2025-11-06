import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStaffPlanning } from '@/hooks/useStaffPlanning';
import { 
  Plus, 
  Users, 
  DollarSign, 
  TrendingUp,
  Calendar,
  FileText,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
  Target,
  AlertCircle,
  Filter,
  Search,
  Grid as GridIcon,
  List as ListIcon,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Activity,
  Briefcase,
  RefreshCw
} from 'lucide-react';

interface StaffPlan {
  id: number;
  projectName: string;
  teamSize: number;
  duration: number;
  totalCost: number;
  status: 'draft' | 'active' | 'completed' | 'archived';
  createdAt: string;
  startDate: string;
  utilizationRate?: number;
  departments?: string[];
}

export default function StaffingDashboard() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // API Integration
  const { useStaffPlansList, deleteStaffPlan } = useStaffPlanning();
  const { data: apiPlans, isLoading, error: apiError, refetch } = useStaffPlansList(filterStatus === 'all' ? undefined : filterStatus);

  // Log any API errors
  if (apiError) {
    console.error('API Error fetching staff plans:', apiError);
  }

  // Calculate stats from real data
  const totalPlans = apiPlans?.length || 0;
  const activePlans = apiPlans?.filter(p => p.status === 'active').length || 0;
  const draftPlans = apiPlans?.filter(p => p.status === 'draft').length || 0;
  const totalBudget = apiPlans?.reduce((sum, p) => sum + (p.total_price || 0), 0) || 0;

  // Dynamic stats based on actual data
  const stats = [
    {
      label: 'Total Staff Plans',
      value: String(totalPlans),
      icon: FileText,
      bgColor: 'bg-gray-50',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600',
      change: totalPlans > 0 ? `+${totalPlans}` : '0',
      changePercent: totalPlans > 0 ? 'New' : '0%',
      changeType: 'positive' as const,
      subtitle: 'Across all projects'
    },
    {
      label: 'Active Projects',
      value: String(activePlans),
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      change: activePlans > 0 ? `+${activePlans}` : '0',
      changePercent: activePlans > 0 ? 'Active' : '0%',
      changeType: 'positive' as const,
      subtitle: 'Currently running'
    },
    {
      label: 'Draft Plans',
      value: String(draftPlans),
      icon: Clock,
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      change: draftPlans > 0 ? `+${draftPlans}` : '0',
      changePercent: draftPlans > 0 ? 'Draft' : '0%',
      changeType: 'positive' as const,
      subtitle: 'Pending finalization'
    },
    {
      label: 'Total Budget',
      value: totalBudget > 0 ? `$${(totalBudget / 1000000).toFixed(1)}M` : '$0',
      icon: DollarSign,
      bgColor: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      change: totalBudget > 0 ? `$${(totalBudget / 1000).toFixed(0)}K` : '$0',
      changePercent: totalBudget > 0 ? 'Total' : '0%',
      changeType: 'positive' as const,
      subtitle: 'All active plans'
    }
  ];

  // Real insights based on actual data - no mock data
  const quickInsights = [];

  // Transform API data to match UI format (with validation)
  const staffPlans: StaffPlan[] = (apiPlans || [])
    .filter(plan => {
      // Filter out invalid objects (like error responses)
      if (!plan || typeof plan !== 'object') return false;
      if (!('id' in plan) || !('project_name' in plan)) return false;
      if ('type' in plan || 'loc' in plan || 'msg' in plan) return false; // Skip validation errors
      return true;
    })
    .map(plan => ({
      id: plan.id,
      projectName: plan.project_name,
      teamSize: plan.team_size || 0, // From API (allocation count)
      duration: plan.duration_months,
      totalCost: plan.total_price,
      status: plan.status as 'draft' | 'active' | 'completed' | 'archived',
      createdAt: plan.created_at,
      startDate: plan.project_start_date,
      utilizationRate: 0, // Can be calculated if needed
      departments: []
    }));

  // Debug logging
  console.log('Staff Plans Data:', { 
    apiPlans, 
    staffPlans, 
    totalPlans,
    filterStatus,
    isLoading,
    apiError
  });

  // Also log when data changes
  useEffect(() => {
    if (apiPlans) {
      console.log(`Fetched ${apiPlans.length} staff plans from API`);
      console.log('Plans:', apiPlans);
    }
  }, [apiPlans]);

  // Refetch data when component mounts or filter changes
  useEffect(() => {
    refetch();
  }, [filterStatus]);

  const filteredPlans = staffPlans.filter(plan => {
    const matchesSearch = plan.projectName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleDeletePlan = async (planId: number) => {
    if (confirm('Are you sure you want to delete this staff plan?')) {
      try {
        await deleteStaffPlan.mutateAsync(planId);
        refetch();
      } catch (error) {
        console.error('Failed to delete plan:', error);
      }
    }
  };

  const handleExportReport = () => {
    if (staffPlans.length === 0) {
      alert('No plans to export');
      return;
    }

    try {
      // Create comprehensive export data
      const exportData = {
        exportDate: new Date().toISOString(),
        summary: {
          totalPlans: totalPlans,
          activePlans: activePlans,
          draftPlans: draftPlans,
          totalBudget: totalBudget,
        },
        plans: staffPlans.map(plan => ({
          id: plan.id,
          projectName: plan.projectName,
          status: plan.status,
          duration: `${plan.duration} months`,
          teamSize: plan.teamSize,
          totalCost: `$${plan.totalCost.toLocaleString()}`,
          startDate: plan.startDate,
          createdAt: plan.createdAt,
          utilizationRate: plan.utilizationRate ? `${plan.utilizationRate}%` : 'N/A',
        })),
      };

      // Export as JSON
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `staff_planning_report_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert('Report exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export report');
    }
  };

  const handleGenerateInsights = () => {
    if (staffPlans.length === 0) {
      alert('No data available for insights. Create some staff plans first!');
      return;
    }

    // Calculate insights
    const avgDuration = staffPlans.reduce((sum, p) => sum + p.duration, 0) / staffPlans.length;
    const avgCost = staffPlans.reduce((sum, p) => sum + p.totalCost, 0) / staffPlans.length;
    const mostCommonStatus = staffPlans.reduce((acc: Record<string, number>, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});
    const topStatus = Object.entries(mostCommonStatus).sort((a, b) => b[1] - a[1])[0];

    const insights = `
📊 Staff Planning Insights

📈 Key Metrics:
• Total Plans: ${totalPlans}
• Active Plans: ${activePlans} (${((activePlans/totalPlans)*100).toFixed(0)}%)
• Draft Plans: ${draftPlans}
• Total Budget: $${(totalBudget/1000000).toFixed(2)}M

📉 Averages:
• Average Duration: ${avgDuration.toFixed(1)} months
• Average Cost: $${(avgCost/1000).toLocaleString()}

🎯 Status Distribution:
• Most Common: ${topStatus[0].toUpperCase()} (${topStatus[1]} plans)

💡 Recommendations:
${activePlans === 0 ? '• Consider activating draft plans to start resource allocation' : ''}
${draftPlans > activePlans ? '• High number of drafts - review and finalize pending plans' : ''}
${avgDuration > 24 ? '• Long project durations detected - consider breaking into phases' : ''}
${staffPlans.length < 5 ? '• Create more plans to better track resource utilization' : '• Good planning coverage across projects'}
    `.trim();

    alert(insights);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: 'bg-green-100', text: 'text-green-700', label: 'Active', icon: CheckCircle, border: 'border-green-300' };
      case 'draft':
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft', icon: Clock, border: 'border-gray-300' };
      case 'completed':
        return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Completed', icon: CheckCircle, border: 'border-blue-300' };
      case 'archived':
        return { bg: 'bg-red-100', text: 'text-red-700', label: 'Archived', icon: XCircle, border: 'border-red-300' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Unknown', icon: Clock, border: 'border-gray-300' };
    }
  };

  const getUtilizationColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600 bg-green-50';
    if (rate >= 70) return 'text-blue-600 bg-blue-50';
    if (rate >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F3F2] font-inter">
      <div className="flex flex-col w-full p-6 gap-6">
        {/* Enhanced Header */}
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-3">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
              <Link to="/" className="text-gray-500 text-sm font-normal font-inter leading-tight hover:text-gray-900">
                Dashboard
              </Link>
              <span className="text-[#344054] text-sm font-normal font-inter leading-tight">/</span>
              <span className="text-[#344054] text-sm font-normal font-inter leading-tight">Staffing Plan</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-[#1A1A1A] text-3xl font-bold font-inter leading-loose">
                  Staff Planning Dashboard
                </h1>
                <p className="text-gray-600 text-sm font-medium mt-1">
                  Allocate resources, forecast labor costs, and optimize team utilization
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExportReport}
              disabled={staffPlans.length === 0}
              className="h-11 px-5 py-2 bg-white rounded-lg border border-gray-300 flex items-center gap-2.5 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5 text-gray-700" />
              <span className="text-gray-700 text-sm font-semibold font-inter">
                Export Report
              </span>
            </button>
            <Link
              to="/staffing-plan/create"
              className="h-11 px-5 py-2 rounded-lg flex items-center gap-2.5 hover:opacity-90 transition-all shadow-lg"
              style={{ backgroundColor: '#161950' }}
            >
              <Plus className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-semibold font-inter leading-normal">
                Create Staff Plan
              </span>
            </Link>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`${stat.bgColor} rounded-lg border border-gray-300 p-6 hover:shadow-lg transition-all group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 ${stat.iconBg} rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform`}>
                  <stat.icon className={`w-7 h-7 ${stat.iconColor}`} />
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    {stat.changeType === 'positive' ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`text-xs font-bold ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.changePercent}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium mt-0.5 block">
                    {stat.change}
                  </span>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-[#1A1A1A] mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600 font-semibold mb-1">{stat.label}</p>
              <p className="text-xs text-gray-500">{stat.subtitle}</p>
            </div>
          ))}
        </div>

        {/* Quick Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickInsights.map((insight, index) => (
            <div
              key={index}
              className={`${insight.bgColor} rounded-lg border ${insight.borderColor} p-4 hover:shadow-md transition-all`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 ${insight.bgColor} rounded-lg flex items-center justify-center border ${insight.borderColor}`}>
                  <insight.icon className={`w-5 h-5 ${insight.color}`} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-900 mb-1">{insight.title}</h4>
                  <p className="text-xs text-gray-600">{insight.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Plans Section */}
        <div className="bg-white rounded-lg border border-gray-300 shadow-lg">
          {/* Enhanced Header */}
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#161950' }}>
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-[#1A1A1A] text-xl font-bold font-inter">Staffing Plans</h2>
                  <p className="text-gray-600 text-sm font-medium mt-0.5">
                    {filteredPlans.length} plans • {filteredPlans.filter(p => p.status === 'active').length} active • {' '}
                    {filteredPlans.filter(p => p.status === 'draft').length} draft
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search plans..."
                    className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm w-64"
                  />
                </div>

                {/* Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
                
                {/* Refresh Button */}
                <button
                  onClick={() => refetch()}
                  disabled={isLoading}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50"
                  title="Refresh plans"
                >
                  <RefreshCw className={`w-4 h-4 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
                </button>

                {/* View Toggle */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'grid' 
                        ? 'bg-white shadow-md text-purple-600' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <GridIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'list' 
                        ? 'bg-white shadow-md text-purple-600' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <ListIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Plans Content */}
          <div className="p-6">
            {apiError ? (
              <div className="text-center py-16">
                <div className="text-red-600 mb-4">
                  <p className="text-lg font-bold">Error Loading Plans</p>
                  <p className="text-sm mt-2">
                    {typeof apiError === 'object' && apiError !== null 
                      ? (apiError.message || JSON.stringify(apiError))
                      : String(apiError) || 'Failed to fetch staff plans'}
                  </p>
                </div>
                <button 
                  onClick={() => refetch()}
                  className="px-6 py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-all"
                  style={{ backgroundColor: '#161950' }}
                >
                  Retry
                </button>
              </div>
            ) : isLoading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
                <p className="text-gray-600 mt-4">Loading staff plans...</p>
              </div>
            ) : filteredPlans.length === 0 ? (
              <div className="text-center py-16">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No Plans Found</h3>
                <p className="text-sm text-gray-600 mb-6">
                  {searchQuery ? 'Try adjusting your search criteria' : 'Get started by creating your first staff plan'}
                </p>
                <Link
                  to="/staffing-plan/create"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-all shadow-lg"
                  style={{ backgroundColor: '#161950' }}
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Plan
                </Link>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredPlans.map((plan) => {
                  const statusConfig = getStatusConfig(plan.status);
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <div
                      key={plan.id}
                      className="bg-white rounded-lg border border-gray-300 hover:shadow-xl hover:scale-[1.02] transition-all group"
                    >
                      {/* Card Header */}
                      <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-base font-bold text-[#1A1A1A] mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                              {plan.projectName}
                            </h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </span>
                          {plan.utilizationRate !== undefined && plan.utilizationRate > 0 && (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${getUtilizationColor(plan.utilizationRate)}`}>
                              <Activity className="w-3 h-3" />
                              {plan.utilizationRate}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Users className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Team Size</p>
                              <p className="text-sm font-bold text-gray-900">{plan.teamSize}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Calendar className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Duration</p>
                              <p className="text-sm font-bold text-gray-900">{plan.duration}mo</p>
                            </div>
                          </div>
                        </div>

                        {/* Total Cost */}
                        <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600 font-semibold">Total Budget</span>
                            <span className="text-lg font-bold text-green-600">
                              ${(plan.totalCost / 1000).toFixed(0)}K
                            </span>
                          </div>
                        </div>

                        {/* Departments */}
                        {plan.departments && (
                          <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-2">Departments</p>
                            <div className="flex flex-wrap gap-1">
                              {plan.departments.slice(0, 2).map((dept, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded border border-gray-200">
                                  {dept}
                                </span>
                              ))}
                              {plan.departments.length > 2 && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                                  +{plan.departments.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Meta Info */}
                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                          <span>Start: {new Date(plan.startDate).toLocaleDateString()}</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <Link 
                            to={`/staffing-plan/${plan.id}`}
                            className="flex-1 px-3 py-2 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md hover:opacity-90" 
                            style={{ backgroundColor: '#161950' }}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Details
                          </Link>
                          <Link 
                            to={`/staffing-plan/edit/${plan.id}`}
                            className="px-3 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-lg text-xs font-bold transition-all flex items-center justify-center"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <button 
                            onClick={() => handleDeletePlan(plan.id)}
                            className="px-3 py-2 bg-white hover:bg-red-50 border border-red-300 text-red-600 rounded-lg transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPlans.map((plan) => {
                  const statusConfig = getStatusConfig(plan.status);
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <div
                      key={plan.id}
                      className="bg-white rounded-lg border border-gray-300 hover:shadow-lg transition-all p-5"
                    >
                      <div className="flex items-center gap-6">
                        {/* Project Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-base font-bold text-[#1A1A1A]">
                              {plan.projectName}
                            </h3>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusConfig.label}
                            </span>
                            {plan.utilizationRate !== undefined && plan.utilizationRate > 0 && (
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${getUtilizationColor(plan.utilizationRate)}`}>
                                <Activity className="w-3 h-3" />
                                {plan.utilizationRate}% utilized
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-6 text-sm text-gray-600">
                            <span className="flex items-center gap-1.5">
                              <Users className="w-4 h-4" />
                              <span className="font-semibold text-gray-900">{plan.teamSize}</span> members
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4" />
                              <span className="font-semibold text-gray-900">{plan.duration}</span> months
                            </span>
                            <span className="flex items-center gap-1.5">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              <span className="font-bold text-green-600">${(plan.totalCost / 1000).toFixed(0)}K</span>
                            </span>
                            <span className="text-xs text-gray-500">
                              Start: {new Date(plan.startDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Link 
                            to={`/staffing-plan/${plan.id}`}
                            className="px-5 py-2 text-white rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-md hover:opacity-90" 
                            style={{ backgroundColor: '#161950' }}
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </Link>
                          <Link 
                            to={`/staffing-plan/edit/${plan.id}`}
                            className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </Link>
                          <button 
                            onClick={() => handleDeletePlan(plan.id)}
                            className="px-3 py-2 bg-white hover:bg-red-50 border border-red-300 text-red-600 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* AI Recommendations Section */}
        <div className="rounded-lg shadow-xl border p-6" style={{ backgroundColor: '#161950', borderColor: '#161950' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#0f1440' }}>
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">AI-Powered Optimization</h3>
                <p className="text-sm text-gray-300">
                  Get intelligent recommendations for staff allocation and cost optimization
                </p>
              </div>
            </div>
            <button 
              onClick={handleGenerateInsights}
              disabled={staffPlans.length === 0}
              className="px-6 py-3 bg-white rounded-lg font-bold text-sm hover:bg-gray-100 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" 
              style={{ color: '#161950' }}
            >
              Generate Insights
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
