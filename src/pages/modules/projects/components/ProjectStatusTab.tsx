import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  FolderKanban,
  Eye,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  Brain,
  MapPin,
} from 'lucide-react';
import type { Project } from '@/services/api/projectsApi';
import { getStatusColor, formatCurrency } from './utils';

interface ProjectStatusTabProps {
  projects: Project[];
  selectedProject: Project | null;
  onProjectSelect: (project: Project) => void;
}

export function ProjectStatusTab({
  projects,
  selectedProject,
  onProjectSelect,
}: ProjectStatusTabProps) {
  const navigate = useNavigate();
  const project = selectedProject || projects[0];

  const getMetricBoxColor = (value: number, threshold: number, inverse = false) => {
    const isGood = inverse ? value < threshold : value > threshold;
    return isGood ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50';
  };

  const getVarianceColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < -5) return 'text-red-600';
    return 'text-yellow-600';
  };

  if (!project) {
    return (
      <div className="text-center py-16 text-[#667085] font-outfit">
        No projects available. Please create a project first.
      </div>
    );
  }

  // Mock financial details - these would come from actual API
  const projectDetails = {
    netRevenueYtd: project.budget?.total_spent || 0,
    ebitaYtd: (project.budget?.total_spent || 0) * 0.3,
    wipOpen: project.budget?.remaining_budget || 0,
    grossRevenue: project.budget?.total_allocated || 0,
    directLaborCost: (project.budget?.total_spent || 0) * 0.6,
    overheadCost: (project.budget?.total_spent || 0) * 0.2,
    ebita: (project.budget?.total_spent || 0) * 0.2,
    multiplier: 2.4,
    billability: 87,
    teamSize: project.team?.team_size || 0,
    daysUntilEndDate: project.end_date
      ? Math.ceil((new Date(project.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : 0,
    budgetVariance: 5.2,
    scheduleVariance: -2.1,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      <div className="lg:col-span-1">
        <Card className="h-full border border-[#E5E7EB] shadow-sm">
          <CardHeader>
            <h3 className="text-lg font-semibold text-[#1A1A1A] font-outfit">Projects</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {projects.map((proj: any) => (
                <div
                  key={proj.id}
                  onClick={() => onProjectSelect(proj)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors font-outfit ${
                    project.id === proj.id
                      ? 'bg-[#161950] text-white border-[#161950]'
                      : 'bg-[#F9FAFB] hover:bg-gray-100 border border-[#E5E7EB]'
                  }`}
                >
                  <p className="font-medium text-sm">{proj.title}</p>
                  <p className={`text-xs ${project.id === proj.id ? 'text-white/80' : 'text-[#667085]'}`}>
                    {proj.account_name || 'No account'}
                  </p>
                  <Badge
                    className={`text-xs mt-1 ${
                      project.id === proj.id
                        ? 'bg-white/20 text-white'
                        : getStatusColor(proj.status)
                    }`}
                  >
                    {proj.status?.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-3 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="text-center p-6">
              <div className="text-2xl font-bold font-outfit">{formatCurrency(projectDetails.netRevenueYtd)}</div>
              <div className="text-sm opacity-90 font-outfit">Net Revenue YTD</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="text-center p-6">
              <div className="text-2xl font-bold font-outfit">{formatCurrency(projectDetails.ebitaYtd)}</div>
              <div className="text-sm opacity-90 font-outfit">EBITA YTD</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="text-center p-6">
              <div className="text-2xl font-bold font-outfit">{formatCurrency(projectDetails.wipOpen)}</div>
              <div className="text-sm opacity-90 font-outfit">WIP + Open Total</div>
            </CardContent>
          </Card>
        </div>

        <Card className="border border-[#E5E7EB] shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-[#1A1A1A] font-outfit">{project.title}</h3>
                <p className="text-[#667085] font-outfit">{project.account_name || 'No account'}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/module/projects/${project.id}`)}
                className="ml-4 font-outfit"
              >
                <Eye className="h-4 w-4 mr-2" />
                Project Details
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-3 rounded-lg border-2 ${getMetricBoxColor(projectDetails.multiplier, 2.0)}`}>
                <div className="text-sm text-[#667085] font-outfit">Multiplier</div>
                <div className="text-lg font-bold font-outfit">{projectDetails.multiplier.toFixed(1)}x</div>
              </div>

              <div className={`p-3 rounded-lg border-2 ${getMetricBoxColor(projectDetails.billability, 85)}`}>
                <div className="text-sm text-[#667085] font-outfit">Billability</div>
                <div className="text-lg font-bold font-outfit">{projectDetails.billability}%</div>
              </div>

              <div className={`p-3 rounded-lg border-2 ${getMetricBoxColor(projectDetails.budgetVariance, -5, true)}`}>
                <div className="text-sm text-[#667085] font-outfit">Budget Variance</div>
                <div className={`text-lg font-bold font-outfit ${getVarianceColor(projectDetails.budgetVariance)}`}>
                  {projectDetails.budgetVariance > 0 ? '+' : ''}
                  {projectDetails.budgetVariance.toFixed(1)}%
                </div>
              </div>

              <div className={`p-3 rounded-lg border-2 ${getMetricBoxColor(projectDetails.daysUntilEndDate, 0)}`}>
                <div className="text-sm text-[#667085] font-outfit">Days to End</div>
                <div
                  className={`text-lg font-bold font-outfit ${
                    projectDetails.daysUntilEndDate < 0 ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {projectDetails.daysUntilEndDate}
                </div>
              </div>

              <div className="p-3 rounded-lg border-2 border-[#E5E7EB] bg-[#F9FAFB]">
                <div className="text-sm text-[#667085] font-outfit">Team Size</div>
                <div className="text-lg font-bold font-outfit">{projectDetails.teamSize}</div>
              </div>

              <div className="p-3 rounded-lg border-2 border-[#E5E7EB] bg-[#F9FAFB]">
                <div className="text-sm text-[#667085] font-outfit">Contract Value</div>
                <div className="text-lg font-bold font-outfit">{formatCurrency(project.contract_value || 0)}</div>
              </div>

              <div className="p-3 rounded-lg border-2 border-[#E5E7EB] bg-[#F9FAFB]">
                <div className="text-sm text-[#667085] font-outfit">Schedule Variance</div>
                <div className={`text-lg font-bold font-outfit ${getVarianceColor(projectDetails.scheduleVariance)}`}>
                  {projectDetails.scheduleVariance > 0 ? '+' : ''}
                  {projectDetails.scheduleVariance.toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
              <h4 className="font-semibold text-[#1A1A1A] mb-3 font-outfit">Financial Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-outfit">
                <div>
                  <span className="text-[#667085]">Gross Revenue:</span>
                  <div className="font-semibold text-[#1A1A1A]">{formatCurrency(projectDetails.grossRevenue)}</div>
                </div>
                <div>
                  <span className="text-[#667085]">Direct Labor:</span>
                  <div className="font-semibold text-[#1A1A1A]">{formatCurrency(projectDetails.directLaborCost)}</div>
                </div>
                <div>
                  <span className="text-[#667085]">Overhead:</span>
                  <div className="font-semibold text-[#1A1A1A]">{formatCurrency(projectDetails.overheadCost)}</div>
                </div>
                <div>
                  <span className="text-[#667085]">EBITA:</span>
                  <div className="font-semibold text-green-600">{formatCurrency(projectDetails.ebita)}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <h4 className="font-semibold text-purple-900 font-outfit">AI-Generated Project Summary</h4>
              <Badge className="bg-purple-100 text-purple-800 text-xs font-outfit">AI-Powered</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <h5 className="font-medium text-[#1A1A1A] mb-2 font-outfit">Current Status Overview</h5>
              <p className="text-sm text-[#667085] font-outfit">
                The <strong>{project.title}</strong> is currently{' '}
                <span className="text-green-600 font-medium">on track</span> with strong financial performance
                showing {projectDetails.billability}% billability and {projectDetails.multiplier.toFixed(1)}x multiplier.
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <h5 className="font-medium text-[#1A1A1A] mb-2 font-outfit">Upcoming Milestones</h5>
              <ul className="text-sm text-[#667085] space-y-1 font-outfit">
                {project.milestones && project.milestones.length > 0 ? (
                  project.milestones.slice(0, 3).map((milestone: any) => (
                    <li key={milestone.id}>
                      • <strong>{milestone.title}:</strong>{' '}
                      {milestone.due_date
                        ? new Date(milestone.due_date).toLocaleDateString()
                        : 'TBD'}
                    </li>
                  ))
                ) : (
                  <li>• No upcoming milestones defined</li>
                )}
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <h5 className="font-medium text-[#1A1A1A] mb-2 font-outfit">Critical Risk Factors</h5>
              <p className="text-sm text-[#667085] font-outfit">
                AI analysis identifies{' '}
                <span className="text-amber-600 font-medium">moderate risk</span> in budget variance
                ({projectDetails.budgetVariance > 0 ? '+' : ''}
                {projectDetails.budgetVariance.toFixed(1)}%). Recommended mitigation: review resource allocation
                and timeline buffers.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-200 bg-amber-50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h4 className="font-semibold text-amber-900 font-outfit">Automated Risk Flagging</h4>
              <Badge className="bg-amber-100 text-amber-800 text-xs font-outfit">AI-Powered</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {projectDetails.budgetVariance > 10 && (
              <div className="flex items-center justify-between p-3 bg-white border border-red-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-red-900 font-outfit">Budget Variance Alert</p>
                    <p className="text-xs text-red-700 font-outfit">
                      Budget variance exceeds 10% threshold - requires immediate attention
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="text-red-600 border-red-300 font-outfit">
                  Review
                </Button>
              </div>
            )}

            {projectDetails.daysUntilEndDate < 30 && projectDetails.daysUntilEndDate > 0 && (
              <div className="flex items-center justify-between p-3 bg-white border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900 font-outfit">Project Ending Soon</p>
                    <p className="text-xs text-yellow-700 font-outfit">
                      Project ending in {projectDetails.daysUntilEndDate} days - ensure all deliverables are on track
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="text-yellow-600 border-yellow-300 font-outfit">
                  Monitor
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

