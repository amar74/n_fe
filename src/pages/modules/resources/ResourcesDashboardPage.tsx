import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Shield,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useEmployees, useEmployeeAnalytics } from '@/hooks/useEmployees';

function ResourcesDashboardPage() {
  // Fetch real stats from API
  const { dashboard, skillsGap, isLoadingDashboard, isLoadingSkillsGap } = useEmployeeAnalytics();
  const { employees, isLoading: isLoadingEmployees } = useEmployees();

  const activeEmployees = useMemo(
    () =>
      (employees || []).filter((emp: any) =>
        ['active', 'accepted', 'assigned'].includes((emp.status || '').toLowerCase())
      ),
    [employees]
  );

  const benchEmployees = useMemo(
    () =>
      (employees || []).filter((emp: any) =>
        ['bench', 'on bench', 'available'].includes((emp.status || '').toLowerCase())
      ),
    [employees]
  );

  const statusCounts = useMemo(() => {
    return (employees || []).reduce((acc: Record<string, number>, emp: any) => {
      const key = (emp.status || '').toLowerCase().trim();
      if (key) acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [employees]);

  const avgUtilization = useMemo(() => {
    const total = employees?.length || 0;
    if (!total) return 0;
    return Math.round((activeEmployees.length / total) * 100);
  }, [employees, activeEmployees.length]);

  const billableSummary = useMemo(() => {
    if (!activeEmployees.length) {
      return {
        monthlyBillable: 0,
        avgBillRate: 0,
        totalBillRate: 0,
        totalMonthlyHours: 0,
        contributors: 0,
      };
    }

    const totalBillRate = activeEmployees.reduce(
      (sum: number, emp: any) => sum + (Number(emp.bill_rate) || 0),
      0
    );
    const avgBillRate = totalBillRate / activeEmployees.length;
    const totalMonthlyHours = activeEmployees.length * 160; // Approximate monthly hours
    const monthlyBillable = avgBillRate * totalMonthlyHours;

    return {
      monthlyBillable,
      avgBillRate,
      totalBillRate,
      totalMonthlyHours,
      contributors: activeEmployees.length,
    };
  }, [activeEmployees]);

  const pendingCandidatesFallback =
    (statusCounts['pending'] || 0) +
    (statusCounts['pending hire'] || 0) +
    (statusCounts['pending onboarding'] || 0);

  const inReviewFallback =
    (statusCounts['review'] || 0) + (statusCounts['in review'] || 0) + (statusCounts['screening'] || 0);

  const acceptedFallback = statusCounts['accepted'] || 0;

  const onboardingCompleteFallback = statusCounts['onboarding complete'] || statusCounts['active'] || 0;

  const stats = useMemo(
    () => ({
      totalEmployees: dashboard?.total_employees ?? employees?.length ?? 0,
      activeEmployees: dashboard?.active_count ?? activeEmployees.length,
      onBench: benchEmployees.length,
      avgUtilization,
      monthlyBillable: billableSummary.monthlyBillable,
      pendingCandidates: dashboard?.pending_count ?? pendingCandidatesFallback,
      inReview: dashboard?.review_count ?? inReviewFallback,
      acceptedThisMonth: dashboard?.accepted_count ?? acceptedFallback,
      onboardingComplete: dashboard?.onboarding_complete ?? onboardingCompleteFallback,
    }),
    [
      dashboard,
      employees?.length,
      activeEmployees.length,
      benchEmployees.length,
      avgUtilization,
      billableSummary.monthlyBillable,
      pendingCandidatesFallback,
      inReviewFallback,
      acceptedFallback,
      onboardingCompleteFallback,
    ]
  );

  const analyticsSummary = useMemo(() => {
    const skillGaps = skillsGap?.skill_gaps || [];
    const criticalGaps = skillsGap?.critical_gaps || 0;
    const highPriorityInsights = skillGaps.filter(
      gap => (gap.priority || '').toLowerCase() === 'high'
    ).length;

    return {
      totalGaps: skillGaps.length,
      criticalGaps,
      highPriorityInsights,
    };
  }, [skillsGap]);

  const teamDistribution = useMemo(() => {
    if (!employees?.length) return [];

    const palette = ['from-blue-500 to-indigo-600', 'from-purple-500 to-pink-600', 'from-green-500 to-emerald-600', 'from-amber-500 to-orange-600'];

    const departmentCounts = employees.reduce((acc: Record<string, number>, emp: any) => {
      const dept = emp.department?.trim() || emp.location?.trim() || 'General';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});

    const sorted = Object.entries(departmentCounts).sort((a, b) => b[1] - a[1]);
    const topGroups = sorted.slice(0, 3);
    const remaining = sorted.slice(3).reduce((sum, [, count]) => sum + Number(count), 0);

    if (remaining > 0) {
      topGroups.push(['Other Teams', remaining]);
    }

    const total = employees.length;

    return topGroups.map(([label, count], index) => ({
      label,
      count: Number(count),
      percentage: total ? Math.round((Number(count) / total) * 100) : 0,
      barClass: palette[index % palette.length],
    }));
  }, [employees]);

  const formatCurrency = (value: number) =>
    Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
      value || 0
    );

  const aiInsightCards = useMemo(() => {
    const topGap = skillsGap?.skill_gaps
      ?.slice()
      .sort((a, b) => (b.gap || 0) - (a.gap || 0))[0];

    const benchCount = benchEmployees.length;
    const skillGapDescription = topGap
      ? `Need ${topGap.required} ${topGap.skill}, currently have ${topGap.available}.`
      : analyticsSummary.criticalGaps > 0
        ? `${analyticsSummary.criticalGaps} critical gap${analyticsSummary.criticalGaps === 1 ? '' : 's'} flagged across teams.`
        : 'AI has fresh insights across your talent pool. Review to identify hiring priorities.';

    return [
      {
        icon: AlertTriangle,
        color: 'text-amber-600',
        title: topGap ? `Skill shortage: ${topGap.skill}` : 'Review skills gap trends',
        description: skillGapDescription,
        action: 'View Skill Gaps',
        to: '/module/resources/analytics',
      },
      {
        icon: TrendingUp,
        color: 'text-blue-600',
        title: benchCount > 0 ? 'Utilization alert' : 'Utilization healthy',
        description:
          benchCount > 0
            ? `${benchCount} teammate${benchCount === 1 ? '' : 's'} on bench — consider reallocating.`
            : 'All active teammates are allocated. Keep monitoring utilization.',
        action: benchCount > 0 ? 'Allocate Bench Talent' : 'View Workforce',
        to: '/module/resources/management',
      },
      {
        icon: CheckCircle,
        color: 'text-green-600',
        title: stats.pendingCandidates > 0 ? 'Pipeline needs attention' : 'Pipeline on track',
        description: `${stats.pendingCandidates} pending • ${stats.inReview} in review • ${stats.onboardingComplete} onboarded`,
        action: 'Review Pipeline',
        to: '/module/resources/onboarding',
      },
    ];
  }, [
    skillsGap,
    benchEmployees.length,
    stats.pendingCandidates,
    stats.inReview,
    stats.onboardingComplete,
    analyticsSummary.criticalGaps,
  ]);

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
      cta: 'Go to Onboarding',
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
      cta: 'Manage Workforce',
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
      cta: 'Configure Access',
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
        { label: 'Critical Gaps', value: analyticsSummary.criticalGaps, icon: AlertTriangle, color: 'text-red-600' },
        { label: 'High Priority Insights', value: analyticsSummary.highPriorityInsights, icon: Sparkles, color: 'text-purple-600' },
      ],
      path: '/module/resources/analytics',
      cta: 'View Analytics',
    },
  ];

  // Show loading state while fetching dashboard stats
  if (isLoadingDashboard || isLoadingEmployees || isLoadingSkillsGap) {
    return (
      <div className="w-full min-h-screen bg-[#F5F3F2] font-outfit flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard statistics...</p>
        </div>
      </div>
    );
  }

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {modules.map((module) => {
            const IconComponent = module.icon;
            
            return (
              <Link
                key={module.id}
                to={module.path}
                className="relative bg-white rounded-xl border border-[#E7E7E7] shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${module.bgColor} opacity-15 pointer-events-none`}></div>

                <div className="relative flex flex-col gap-5 p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center">
                      <IconComponent className={`w-5 h-5 ${module.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <h2 className="text-xl font-semibold text-gray-900">{module.title}</h2>
                      <p className="text-sm text-gray-600 leading-snug truncate">
                        {module.description}
                      </p>
                    </div>
                  </div>

                  {module.stats.length > 0 && (
                    <div className="flex items-stretch gap-3">
                      {module.stats.map((stat, idx) => {
                        const StatIcon = stat.icon;
                        return (
                          <div
                            key={idx}
                            className="flex-1 min-w-0 flex items-center justify-between gap-3 px-4 py-3 bg-white rounded-lg border border-[#ECEDEF]"
                          >
                            <div className="flex items-center gap-3">
                              <StatIcon className={`w-5 h-5 ${stat.color}`} />
                              <div>
                                <p className="text-lg font-semibold text-gray-900 leading-tight">{stat.value}</p>
                                <p className="text-xs text-gray-600 font-medium">{stat.label}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex items-center justify-end">
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white bg-[#161950] hover:bg-[#1E2B5B] shadow-sm transition-all">
                      <span>{module.cta}</span>
                      <ArrowRight className="w-4 h-4" />
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
            {aiInsightCards.map((card, index) => {
              const InsightIcon = card.icon;
              const gradientPalette = ['from-amber-50 to-orange-50', 'from-blue-50 to-indigo-50', 'from-green-50 to-emerald-50'];
              const borderPalette = ['border-amber-200', 'border-blue-200', 'border-green-200'];

              return (
                <div
                  key={index}
                  className={`p-6 bg-gradient-to-br ${gradientPalette[index % gradientPalette.length]} rounded-xl border ${borderPalette[index % borderPalette.length]}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                      <InsightIcon className={`w-5 h-5 ${card.color}`} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-gray-900 leading-tight">{card.title}</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{card.description}</p>
                      <Link
                        to={card.to}
                        className="text-sm font-semibold text-[#161950] hover:text-[#1E2B5B] inline-flex items-center gap-1"
                      >
                        {card.action} →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Monthly Billable Value</h3>
            <div className="flex items-end gap-3 mb-6">
              <span className="text-5xl font-bold text-gray-900">
                {formatCurrency(billableSummary.monthlyBillable)}
              </span>
              <span className="text-green-600 text-sm font-bold mb-2 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {billableSummary.contributors > 0
                  ? `${billableSummary.contributors} active contributors`
                  : 'No active contributors'}
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 font-medium">Average Bill Rate</span>
                <span className="text-gray-900 font-bold">{formatCurrency(billableSummary.avgBillRate)}/hr</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 font-medium">Total Monthly Hours</span>
                <span className="text-gray-900 font-bold">
                  {billableSummary.totalMonthlyHours.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 font-medium">Projected 3-Month Value</span>
                <span className="text-gray-900 font-bold">
                  {formatCurrency(billableSummary.monthlyBillable * 3)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Team Distribution</h3>
            <div className="space-y-4">
              {teamDistribution.length ? (
                teamDistribution.map(team => (
                  <div key={team.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 font-medium">{team.label}</span>
                      <span className="text-gray-900 font-bold">
                        {team.count} ({team.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full bg-gradient-to-r ${team.barClass}`}
                        style={{ width: `${team.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-600">No team distribution data available yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ResourcesDashboardPage);

