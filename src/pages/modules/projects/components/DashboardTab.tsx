import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FolderKanban,
  AlertTriangle,
  Clock,
  CheckCircle,
  Brain,
  Calendar,
  TrendingUp,
  Target,
  User,
  Search,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { Project } from '@/services/api/projectsApi';
import { getStatusColor, formatCurrency } from './utils';

interface DashboardTabProps {
  projects: Project[];
  isLoading: boolean;
  activeProjects: number;
  onHoldProjects: number;
  completedProjects: number;
  cancelledProjects: number;
  onProjectSelect: (project: Project) => void;
  onTabChange: (tab: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function DashboardTab({
  projects,
  isLoading,
  activeProjects,
  onHoldProjects,
  completedProjects,
  cancelledProjects,
  onProjectSelect,
  onTabChange,
  searchQuery = '',
  onSearchChange,
}: DashboardTabProps) {
  const filteredProjects = projects.filter(
    (p: any) => p.status !== 'cancelled'
  );

  // Calculate project status distribution
  const statusData = useMemo(() => {
    const statusCounts = filteredProjects.reduce((acc: any, project: any) => {
      const status = project.status || 'planning';
      const statusLabel = status.replace('_', ' ').toUpperCase();
      acc[statusLabel] = (acc[statusLabel] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count as number,
      color:
        status === 'COMPLETED'
          ? '#22c55e'
          : status === 'IN PROGRESS'
          ? '#3b82f6'
          : status === 'ON HOLD'
          ? '#f59e0b'
          : '#6b7280',
    }));
  }, [filteredProjects]);

  // Calculate average KPIs (mock data structure - adjust based on actual API)
  const avgKpis = useMemo(() => {
    // These would come from actual project data
    return [
      { name: 'DRO', value: 45, color: '#ef4444' },
      { name: 'DBO', value: 28, color: '#f59e0b' },
      { name: 'DUO', value: 17, color: '#3b82f6' },
    ];
  }, [projects]);

  return (
    <div className="space-y-6">
      {onSearchChange && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#667085] h-4 w-4" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#161950] focus:outline-none font-outfit bg-white text-[#1A1A1A]"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="h-20 p-5 bg-white rounded-2xl border border-[#E5E7EB] flex justify-between items-center shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <div className="w-14 h-14 p-3 bg-[#EAECF0] rounded-xl flex justify-center items-center overflow-hidden">
            <FolderKanban className="h-6 w-6 text-[#1D2939]" />
          </div>
          <div className="flex flex-col justify-between items-end">
            <div className="text-[#667085] text-sm font-normal font-outfit leading-tight">Active Projects</div>
            <div className="text-[#1A1A1A] text-2xl font-bold font-outfit leading-loose">
              {isLoading ? '...' : activeProjects}
            </div>
          </div>
        </div>

        <div className="h-20 p-5 bg-white rounded-2xl border border-[#E5E7EB] flex justify-between items-center shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <div className="w-14 h-14 p-3 bg-[#EAECF0] rounded-xl flex justify-center items-center overflow-hidden">
            <Clock className="h-6 w-6 text-[#1D2939]" />
          </div>
          <div className="flex flex-col justify-start items-end gap-3">
            <div className="text-[#667085] text-sm font-normal font-outfit leading-tight">On Hold</div>
            <div className="px-2.5 py-0.5 bg-[#FEF3C7] rounded-full flex justify-center items-center">
              <span className="text-[#DC6803] text-base font-medium font-outfit leading-tight">
                {isLoading ? '...' : onHoldProjects}
              </span>
            </div>
          </div>
        </div>

        <div className="h-20 p-5 bg-white rounded-2xl border border-[#E5E7EB] flex justify-between items-center shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <div className="w-14 h-14 p-3 bg-[#EAECF0] rounded-xl flex justify-center items-center overflow-hidden">
            <CheckCircle className="h-6 w-6 text-[#1D2939]" />
          </div>
          <div className="flex flex-col justify-between items-end">
            <div className="text-[#667085] text-sm font-normal font-outfit leading-tight">Completed</div>
            <div className="text-[#1A1A1A] text-2xl font-bold font-outfit leading-loose">
              {isLoading ? '...' : completedProjects}
            </div>
          </div>
        </div>

        <div className="h-20 p-5 bg-white rounded-2xl border border-[#E5E7EB] flex justify-between items-center shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <div className="w-14 h-14 p-3 bg-[#EAECF0] rounded-xl flex justify-center items-center overflow-hidden">
            <AlertTriangle className="h-6 w-6 text-[#1D2939]" />
          </div>
          <div className="flex flex-col justify-between items-end">
            <div className="text-[#667085] text-sm font-normal font-outfit leading-tight">Cancelled</div>
            <div className="text-[#1A1A1A] text-2xl font-bold font-outfit leading-loose">
              {isLoading ? '...' : cancelledProjects}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <h3 className="text-lg font-semibold text-[#1A1A1A] font-outfit mb-4">Project Status Distribution</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-[#667085] font-outfit">
              No data available
            </div>
          )}
        </div>

        <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#1A1A1A] font-outfit">AI-Enhanced Portfolio KPIs</h3>
            <div className="flex items-center space-x-2">
              <Brain className="h-4 w-4 text-purple-600" />
              <Badge className="bg-purple-100 text-purple-800 text-xs font-outfit">Predictive Analytics</Badge>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={avgKpis} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
              <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 12 }} />
              <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => [`${value} days`, 'Value']} />
              <Bar dataKey="value" name="Days">
                {avgKpis.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#E5E7EB] mt-4">
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900 font-outfit">Forecasted Profitability</span>
              </div>
              <div className="text-2xl font-bold text-purple-600 mb-1 font-outfit">87.3%</div>
              <div className="text-xs text-purple-700 font-outfit">
                AI predicts 12% increase vs. current 75.8% based on trend analysis
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-900 font-outfit">Schedule Slippage Risk</span>
              </div>
              <div className="text-2xl font-bold text-amber-600 mb-1 font-outfit">23%</div>
              <div className="text-xs text-amber-700 font-outfit">
                Early warning: 2 projects showing velocity decline patterns
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900 font-outfit">Portfolio Health Score</span>
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1 font-outfit">8.2/10</div>
              <div className="text-xs text-green-700 font-outfit">
                AI composite score: budget, schedule, and risk factors
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900 font-outfit">Predicted Completion</span>
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-1 font-outfit">Q3 2025</div>
              <div className="text-xs text-blue-700 font-outfit">
                AI forecast based on current velocity and resource allocation
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] flex flex-col gap-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <div className="flex justify-start items-start gap-6">
          <div className="flex-1 flex flex-col gap-1">
            <h2 className="text-[#1A1A1A] text-lg font-semibold font-outfit leading-7">
              Project Alerts & Insights
            </h2>
            <p className="text-[#667085] text-sm font-normal font-outfit">
              Key project updates and action items
            </p>
          </div>
          <Badge variant="outline" className="bg-[#F9FAFB] text-[#667085] border-[#E5E7EB] px-2.5 py-1 font-outfit">
            <Brain className="h-3 w-3 mr-1.5" />
            AI Enhanced
          </Badge>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB]">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-5 w-5 text-[#D92D20]" />
              <div>
                <p className="text-[#1A1A1A] text-sm font-semibold font-outfit">Budget Alerts</p>
                <p className="text-[#667085] text-xs font-normal font-outfit">Projects approaching budget limits</p>
              </div>
            </div>
            <Button size="sm" className="h-9 px-4 bg-[#161950] hover:bg-[#1E2B5B] text-white rounded-lg font-outfit">
              Review
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB]">
            <div className="flex items-center gap-4">
              <Clock className="h-5 w-5 text-[#DC6803]" />
              <div>
                <p className="text-[#1A1A1A] text-sm font-semibold font-outfit">Schedule Delays</p>
                <p className="text-[#667085] text-xs font-normal font-outfit">Projects with overdue milestones</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-9 px-4 border-[#E5E7EB] text-[#667085] hover:bg-white rounded-lg font-outfit"
              onClick={() => onTabChange('status')}
            >
              View Projects
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB]">
            <div className="flex items-center gap-4">
              <Target className="h-5 w-5 text-[#1D2939]" />
              <div>
                <p className="text-[#1A1A1A] text-sm font-semibold font-outfit">Milestone Updates</p>
                <p className="text-[#667085] text-xs font-normal font-outfit">Upcoming milestones in the next 7 days</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="h-9 px-4 border-[#E5E7EB] text-[#667085] hover:bg-white rounded-lg font-outfit">
              View All
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] flex flex-col gap-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <h2 className="text-[#1A1A1A] text-lg font-semibold font-outfit leading-7">
              Recent Projects
            </h2>
            <p className="text-[#667085] text-sm font-normal font-outfit">
              Latest project updates and activity
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-4 border-[#E5E7EB] text-[#667085] hover:bg-white rounded-lg font-outfit"
            onClick={() => onTabChange('projects')}
          >
            View All
          </Button>
        </div>
        <div className="flex flex-col gap-3">
          {isLoading ? (
            <div className="text-center py-8 text-[#667085] font-outfit">Loading projects...</div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-8 text-[#667085] font-outfit">No projects found</div>
          ) : (
            filteredProjects.slice(0, 5).map((project: any) => (
              <div
                key={project.id}
                className="p-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] hover:border-[#161950] cursor-pointer transition-colors"
                onClick={() => onProjectSelect(project)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 bg-[#EAECF0] rounded-lg flex items-center justify-center">
                      <FolderKanban className="h-5 w-5 text-[#1D2939]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[#1A1A1A] text-sm font-semibold font-outfit">
                          {project.title || project.name}
                        </h3>
                        <Badge className={`${getStatusColor(project.status)} text-xs font-outfit`}>
                          {project.status?.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-[#667085] text-xs font-normal font-outfit">
                        {project.account_name || project.client_name || 'No account'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {project.budget && (
                      <div className="text-right">
                        <p className="text-[#667085] text-xs font-normal font-outfit">Budget</p>
                        <p className="text-[#1A1A1A] text-sm font-semibold font-outfit">
                          {formatCurrency(project.budget.total_allocated)}
                        </p>
                      </div>
                    )}
                    <TrendingUp className="h-4 w-4 text-[#667085]" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
