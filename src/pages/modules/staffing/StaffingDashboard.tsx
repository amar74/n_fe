import { useState } from 'react';
import { Link } from 'react-router-dom';
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
  Briefcase
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

  // Enhanced mock data
  const stats = [
    {
      label: 'Total Staff Plans',
      value: '24',
      icon: FileText,
      bgColor: 'bg-gray-50',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600',
      change: '+3',
      changePercent: '+14%',
      changeType: 'positive' as const,
      subtitle: 'Across all projects'
    },
    {
      label: 'Active Projects',
      value: '8',
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      change: '+2',
      changePercent: '+25%',
      changeType: 'positive' as const,
      subtitle: 'Currently running'
    },
    {
      label: 'Total Workforce',
      value: '156',
      icon: Users,
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      change: '+28',
      changePercent: '+18%',
      changeType: 'positive' as const,
      subtitle: 'Staff allocated'
    },
    {
      label: 'Total Budget',
      value: '$8.4M',
      icon: DollarSign,
      bgColor: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      change: '+$1.2M',
      changePercent: '+16%',
      changeType: 'positive' as const,
      subtitle: 'All active plans'
    }
  ];

  const quickInsights = [
    {
      title: 'High Utilization',
      description: '12 employees are over 90% utilized',
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      title: 'Budget Variance',
      description: '3 plans are under budget by 15%',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Upcoming Reviews',
      description: '5 plans need review this month',
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    }
  ];

  const staffPlans: StaffPlan[] = [
    {
      id: 1,
      projectName: 'High-Rise Construction - Downtown Plaza',
      teamSize: 18,
      duration: 24,
      totalCost: 850000,
      status: 'active',
      createdAt: '2025-01-15',
      startDate: '2025-02-01',
      utilizationRate: 92,
      departments: ['Engineering', 'Management', 'Quality']
    },
    {
      id: 2,
      projectName: 'Bridge Infrastructure Development',
      teamSize: 24,
      duration: 36,
      totalCost: 1250000,
      status: 'active',
      createdAt: '2025-01-10',
      startDate: '2025-03-01',
      utilizationRate: 88,
      departments: ['Civil', 'Structural', 'Environmental']
    },
    {
      id: 3,
      projectName: 'Urban Planning - Smart City Initiative',
      teamSize: 12,
      duration: 18,
      totalCost: 620000,
      status: 'active',
      createdAt: '2025-01-20',
      startDate: '2025-04-01',
      utilizationRate: 75,
      departments: ['Planning', 'Design', 'IT']
    },
    {
      id: 4,
      projectName: 'Airport Terminal Expansion',
      teamSize: 32,
      duration: 42,
      totalCost: 1850000,
      status: 'active',
      createdAt: '2025-01-05',
      startDate: '2025-05-01',
      utilizationRate: 95,
      departments: ['Aviation', 'Structural', 'Mechanical']
    },
    {
      id: 5,
      projectName: 'Residential Complex - Phase 2',
      teamSize: 14,
      duration: 20,
      totalCost: 480000,
      status: 'draft',
      createdAt: '2025-01-25',
      startDate: '2025-06-01',
      utilizationRate: 0,
      departments: ['Residential', 'Architecture']
    },
    {
      id: 6,
      projectName: 'Water Treatment Facility Upgrade',
      teamSize: 10,
      duration: 15,
      totalCost: 380000,
      status: 'completed',
      createdAt: '2024-11-10',
      startDate: '2024-12-01',
      utilizationRate: 100,
      departments: ['Environmental', 'Mechanical']
    }
  ];

  const filteredPlans = staffPlans.filter(plan => {
    const matchesStatus = filterStatus === 'all' || plan.status === filterStatus;
    const matchesSearch = plan.projectName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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
    <div className="w-full min-h-screen bg-[#F5F3F2] font-outfit">
      <div className="flex flex-col w-full p-6 gap-6">
        {/* Enhanced Header */}
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-3">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
              <Link to="/" className="text-gray-500 text-sm font-normal font-outfit leading-tight hover:text-gray-900">
                Dashboard
              </Link>
              <span className="text-[#344054] text-sm font-normal font-outfit leading-tight">/</span>
              <span className="text-[#344054] text-sm font-normal font-outfit leading-tight">Staffing Plan</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-[#1A1A1A] text-3xl font-bold font-outfit leading-loose">
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
            <button className="h-11 px-5 py-2 bg-white rounded-lg border border-gray-300 flex items-center gap-2.5 hover:bg-gray-50 transition-all">
              <Download className="w-5 h-5 text-gray-700" />
              <span className="text-gray-700 text-sm font-semibold font-outfit">
                Export Report
              </span>
            </button>
            <Link
              to="/staffing-plan/create"
              className="h-11 px-5 py-2 rounded-lg flex items-center gap-2.5 hover:opacity-90 transition-all shadow-lg"
              style={{ backgroundColor: '#151950' }}
            >
              <Plus className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-semibold font-outfit leading-normal">
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
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#151950' }}>
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-[#1A1A1A] text-xl font-bold font-outfit">Staffing Plans</h2>
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
            {filteredPlans.length === 0 ? (
              <div className="text-center py-16">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No Plans Found</h3>
                <p className="text-sm text-gray-600 mb-6">
                  {searchQuery ? 'Try adjusting your search criteria' : 'Get started by creating your first staff plan'}
                </p>
                <Link
                  to="/staffing-plan/create"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-all shadow-lg"
                  style={{ backgroundColor: '#151950' }}
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
                          <button className="flex-1 px-3 py-2 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md hover:opacity-90" style={{ backgroundColor: '#151950' }}>
                            <Eye className="w-3.5 h-3.5" />
                            View Details
                          </button>
                          <button className="px-3 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-lg text-xs font-bold transition-all">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button className="px-3 py-2 bg-white hover:bg-red-50 border border-red-300 text-red-600 rounded-lg transition-all">
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
                          <button className="px-5 py-2 text-white rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-md hover:opacity-90" style={{ backgroundColor: '#151950' }}>
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                          <button className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-lg text-sm font-bold transition-all flex items-center gap-2">
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button className="px-3 py-2 bg-white hover:bg-red-50 border border-red-300 text-red-600 rounded-lg transition-all">
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
        <div className="rounded-lg shadow-xl border p-6" style={{ backgroundColor: '#151950', borderColor: '#151950' }}>
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
            <button className="px-6 py-3 bg-white rounded-lg font-bold text-sm hover:bg-gray-100 transition-all shadow-lg" style={{ color: '#151950' }}>
              Generate Insights
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
