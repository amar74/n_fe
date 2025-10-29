import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserPlus, Shield, BarChart3, TrendingUp, Clock, CheckCircle, XCircle, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';

function ResourcesDashboardPage() {
  // Mock stats - will be replaced with API calls
  const stats = {
    totalEmployees: 42,
    activeEmployees: 39,
    onBench: 3,
    avgUtilization: 82,
    monthlyBillable: 120000,
    pendingCandidates: 8,
    inReview: 5,
    acceptedThisMonth: 6,
  };

  const modules = [
    {
      id: 'onboarding',
      title: 'Employee Onboarding',
      description: 'Manage candidate pipeline, AI resume parsing, and hiring workflow',
      icon: UserPlus,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'from-blue-50 to-indigo-50',
      iconColor: 'text-blue-600',
      stats: [
        { label: 'Pending', value: stats.pendingCandidates, icon: Clock, color: 'text-amber-600' },
        { label: 'In Review', value: stats.inReview, icon: AlertTriangle, color: 'text-blue-600' },
        { label: 'Accepted', value: stats.acceptedThisMonth, icon: CheckCircle, color: 'text-green-600' },
      ],
      path: '/module/resources/onboarding',
    },
    {
      id: 'management',
      title: 'Employee Management',
      description: 'Track active employees, utilization, skills matrix, and performance',
      icon: Users,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'from-purple-50 to-pink-50',
      iconColor: 'text-purple-600',
      stats: [
        { label: 'Active', value: stats.activeEmployees, icon: CheckCircle, color: 'text-green-600' },
        { label: 'On Bench', value: stats.onBench, icon: Clock, color: 'text-amber-600' },
        { label: 'Utilization', value: `${stats.avgUtilization}%`, icon: TrendingUp, color: 'text-indigo-600' },
      ],
      path: '/module/resources/management',
      badge: 'Coming Soon',
    },
    {
      id: 'permissions',
      title: 'Role & Permissions',
      description: 'Configure RBAC, manage access levels, and user permissions',
      icon: Shield,
      color: 'from-orange-500 to-red-600',
      bgColor: 'from-orange-50 to-red-50',
      iconColor: 'text-orange-600',
      stats: [
        { label: 'Roles', value: 12, icon: Shield, color: 'text-orange-600' },
        { label: 'Permissions', value: 24, icon: Shield, color: 'text-red-600' },
      ],
      path: '/module/resources/permissions',
      badge: 'Coming Soon',
    },
    {
      id: 'analytics',
      title: 'AI Analytics',
      description: 'Skills gap analysis, hiring trends, and AI-powered insights',
      icon: BarChart3,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-50 to-emerald-50',
      iconColor: 'text-green-600',
      stats: [
        { label: 'Skill Gaps', value: 8, icon: AlertTriangle, color: 'text-red-600' },
        { label: 'AI Insights', value: 15, icon: Sparkles, color: 'text-purple-600' },
      ],
      path: '/module/resources/analytics',
      badge: 'Coming Soon',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-[#F5F3F2] font-outfit">
      <div className="flex flex-col w-full p-6 gap-8">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-3">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
              <Link to="/" className="text-gray-500 text-sm font-normal font-outfit leading-tight hover:text-gray-900 transition-colors">
                Dashboard
              </Link>
              <span className="text-[#344054] text-sm font-normal font-outfit leading-tight">/</span>
              <span className="text-[#344054] text-sm font-semibold font-outfit leading-tight">Resources</span>
            </div>
            
            <div>
              <h1 className="text-[#1A1A1A] text-4xl font-bold font-outfit leading-loose">
                Resources Hub
              </h1>
              <p className="text-gray-600 text-base font-medium mt-2">
                Complete workforce management: from hiring to optimization
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white rounded-xl shadow-md">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">{stats.totalEmployees}</p>
                <p className="text-sm font-medium text-gray-600">Total Workforce</p>
              </div>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white rounded-xl shadow-md">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">{stats.activeEmployees}</p>
                <p className="text-sm font-medium text-gray-600">Active</p>
              </div>
            </div>
            <div className="w-full bg-green-200 rounded-full h-2">
              <div className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600" style={{ width: '93%' }}></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white rounded-xl shadow-md">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">{stats.avgUtilization}%</p>
                <p className="text-sm font-medium text-gray-600">Utilization</p>
              </div>
            </div>
            <div className="w-full bg-purple-200 rounded-full h-2">
              <div className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-600" style={{ width: '82%' }}></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white rounded-xl shadow-md">
                <UserPlus className="w-6 h-6 text-amber-600" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">{stats.pendingCandidates}</p>
                <p className="text-sm font-medium text-gray-600">Pending Hire</p>
              </div>
            </div>
            <div className="w-full bg-amber-200 rounded-full h-2">
              <div className="h-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-600" style={{ width: '65%' }}></div>
            </div>
          </div>
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((module) => {
            const IconComponent = module.icon;
            
            return (
              <Link
                key={module.id}
                to={module.path}
                className={`relative bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden group ${
                  module.badge ? 'opacity-75 hover:opacity-100' : ''
                }`}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${module.bgColor} opacity-50`}></div>
                
                {/* Content */}
                <div className="relative p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-4 bg-white rounded-2xl shadow-lg`}>
                        <IconComponent className={`w-8 h-8 ${module.iconColor}`} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{module.title}</h2>
                        <p className="text-sm text-gray-600 font-medium leading-relaxed">
                          {module.description}
                        </p>
                      </div>
                    </div>
                    
                    {module.badge && (
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                        {module.badge}
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {module.stats.map((stat, idx) => {
                      const StatIcon = stat.icon;
                      return (
                        <div key={idx} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200">
                          <StatIcon className={`w-5 h-5 ${stat.color}`} />
                          <div>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            <p className="text-xs text-gray-600 font-medium">{stat.label}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center justify-end">
                    <div className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${module.color} text-white rounded-xl font-semibold shadow-lg group-hover:shadow-xl transition-all`}>
                      <span>{module.badge ? 'View Preview' : 'Open Module'}</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Insights */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">AI-Powered Insights</h3>
              <p className="text-sm text-gray-600 mt-1">Real-time recommendations for your workforce</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-1" />
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-2">Skills Gap Detected</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Need 2 more React developers for upcoming projects
                  </p>
                  <Link to="/module/resources/analytics" className="text-sm font-semibold text-amber-700 hover:text-amber-800 mt-2 inline-block">
                    View Analysis →
                  </Link>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-2">Utilization Alert</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    3 employees on bench - suggest project allocation
                  </p>
                  <Link to="/module/resources/management" className="text-sm font-semibold text-blue-700 hover:text-blue-800 mt-2 inline-block">
                    Optimize Now →
                  </Link>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-2">Hiring Pipeline</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    8 candidates ready for review - schedule interviews
                  </p>
                  <Link to="/module/resources/onboarding" className="text-sm font-semibold text-green-700 hover:text-green-800 mt-2 inline-block">
                    Review Candidates →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Monthly Billable Value</h3>
            <div className="flex items-end gap-3 mb-6">
              <span className="text-5xl font-bold text-gray-900">
                ${(stats.monthlyBillable / 1000).toFixed(0)}K
              </span>
              <span className="text-green-600 text-sm font-bold mb-2 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +12% vs last month
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 font-medium">Active Projects</span>
                <span className="text-gray-900 font-bold">$98K</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 font-medium">Available Capacity</span>
                <span className="text-gray-900 font-bold">$22K</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Team Distribution</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-medium">Engineering</span>
                  <span className="text-gray-900 font-bold">24 (57%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" style={{ width: '57%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-medium">Design</span>
                  <span className="text-gray-900 font-bold">8 (19%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-600" style={{ width: '19%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-medium">Product & Others</span>
                  <span className="text-gray-900 font-bold">10 (24%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600" style={{ width: '24%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ResourcesDashboardPage);

