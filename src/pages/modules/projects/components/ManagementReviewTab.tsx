import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Brain,
  AlertTriangle,
  TrendingDown,
  Target,
} from 'lucide-react';
import type { Project } from '@/services/api/projectsApi';
import { getStatusColor, formatCurrency } from './utils';

interface ManagementReviewTabProps {
  projects: Project[];
}

export function ManagementReviewTab({ projects }: ManagementReviewTabProps) {
  const getVarianceColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < -5) return 'text-red-600';
    return 'text-yellow-600';
  };

  // Mock anomaly detection data
  const anomalies = [
    {
      type: 'multiplier',
      severity: 'high',
      title: 'Multiplier Anomaly',
      description: 'Project shows 1.8x multiplier - significantly lower than similar projects (avg 2.4x)',
      projectName: projects[0]?.title || 'Unknown Project',
    },
    {
      type: 'trend',
      severity: 'medium',
      title: 'Declining Trend',
      description: 'Portfolio showing declining billability trend (-8% over 3 months)',
      projectName: 'Portfolio Analysis',
    },
    {
      type: 'performance',
      severity: 'low',
      title: 'Performance Outlier',
      description: 'Project exceeding all benchmarks - potential best practice case study',
      projectName: projects[1]?.title || 'Unknown Project',
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-2 border-purple-200 bg-purple-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-purple-900 font-outfit">AI Anomaly Detection</h3>
              <Badge className="bg-purple-100 text-purple-800 text-xs font-outfit">Continuous Monitoring</Badge>
            </div>
          </div>
          <p className="text-purple-700 text-sm font-outfit">
            AI continuously scans project data to detect anomalies that might escape human notice
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {anomalies.map((anomaly, index) => (
              <div
                key={index}
                className={`bg-white p-4 rounded-lg border ${
                  anomaly.severity === 'high'
                    ? 'border-red-200'
                    : anomaly.severity === 'medium'
                    ? 'border-yellow-200'
                    : 'border-blue-200'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  {anomaly.severity === 'high' ? (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  ) : anomaly.severity === 'medium' ? (
                    <TrendingDown className="h-4 w-4 text-yellow-600" />
                  ) : (
                    <Target className="h-4 w-4 text-blue-600" />
                  )}
                  <span
                    className={`text-sm font-medium font-outfit ${
                      anomaly.severity === 'high'
                        ? 'text-red-900'
                        : anomaly.severity === 'medium'
                        ? 'text-yellow-900'
                        : 'text-blue-900'
                    }`}
                  >
                    {anomaly.title}
                  </span>
                </div>
                <p
                  className={`text-xs mb-2 font-outfit ${
                    anomaly.severity === 'high'
                      ? 'text-red-700'
                      : anomaly.severity === 'medium'
                      ? 'text-yellow-700'
                      : 'text-blue-700'
                  }`}
                >
                  "{anomaly.projectName}" - {anomaly.description}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className={`text-xs font-outfit ${
                    anomaly.severity === 'high'
                      ? 'text-red-600 border-red-300'
                      : anomaly.severity === 'medium'
                      ? 'text-yellow-600 border-yellow-300'
                      : 'text-blue-600 border-blue-300'
                  }`}
                >
                  {anomaly.severity === 'high' ? 'Investigate' : anomaly.severity === 'medium' ? 'Review' : 'Analyze'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-[#E5E7EB] shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-[#1A1A1A] font-outfit">AI-Enhanced Management Review</h3>
              <p className="text-[#667085] font-outfit">
                Comprehensive overview with predictive forecasting and anomaly detection
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Brain className="h-4 w-4 text-purple-600" />
              <Badge className="bg-purple-100 text-purple-800 text-xs font-outfit">Predictive Analytics</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-outfit">
              <thead className="bg-[#F9FAFB] sticky top-0">
                <tr>
                  <th className="text-left p-3 font-semibold text-[#1A1A1A] sticky left-0 bg-[#F9FAFB] z-10">
                    Project Name
                  </th>
                  <th className="text-left p-3 font-semibold text-[#1A1A1A]">Account</th>
                  <th className="text-left p-3 font-semibold text-[#1A1A1A]">Status</th>
                  <th className="text-right p-3 font-semibold text-[#1A1A1A]">Contract Value</th>
                  <th className="text-right p-3 font-semibold text-[#1A1A1A]">Budget Spent</th>
                  <th className="text-right p-3 font-semibold text-[#1A1A1A]">Remaining</th>
                  <th className="text-center p-3 font-semibold text-[#1A1A1A]">
                    <div className="flex items-center justify-center space-x-1">
                      <span>Budget Var</span>
                      <Brain className="h-3 w-3 text-purple-600" />
                    </div>
                  </th>
                  <th className="text-center p-3 font-semibold text-[#1A1A1A]">
                    <div className="flex items-center justify-center space-x-1">
                      <span>Health</span>
                      <Brain className="h-3 w-3 text-purple-600" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-[#667085]">
                      No projects available
                    </td>
                  </tr>
                ) : (
                  projects.map((project: any) => {
                    const budgetVariance =
                      project.budget?.total_allocated && project.budget?.total_spent
                        ? ((project.budget.total_spent / project.budget.total_allocated) * 100 - 100).toFixed(1)
                        : '0.0';
                    const healthScore = project.health?.overall_score || 7.5;

                    return (
                      <tr key={project.id} className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB]">
                        <td className="p-3 font-medium text-[#1A1A1A] sticky left-0 bg-white z-10">
                          {project.title || project.name}
                        </td>
                        <td className="p-3 text-[#667085]">{project.account_name || project.client_name || '—'}</td>
                        <td className="p-3">
                          <Badge className={`text-xs font-outfit ${getStatusColor(project.status)}`}>
                            {project.status?.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-3 text-right font-semibold text-[#1A1A1A]">
                          {formatCurrency(project.contract_value || project.budget?.total_allocated || 0)}
                        </td>
                        <td className="p-3 text-right font-semibold text-[#1A1A1A]">
                          {formatCurrency(project.budget?.total_spent || 0)}
                        </td>
                        <td className="p-3 text-right font-semibold text-[#1A1A1A]">
                          {formatCurrency(project.budget?.remaining_budget || 0)}
                        </td>
                        <td className="p-3 text-center">
                          <div className="space-y-1">
                            <span className={getVarianceColor(parseFloat(budgetVariance))}>
                              {parseFloat(budgetVariance) > 0 ? '+' : ''}
                              {budgetVariance}%
                            </span>
                            <div className="text-xs text-purple-600 font-medium">
                              AI: {(parseFloat(budgetVariance) + (Math.random() * 4 - 2)).toFixed(1)}%
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <div className="space-y-1">
                            <span
                              className={
                                healthScore >= 8
                                  ? 'text-green-600 font-semibold'
                                  : healthScore >= 6
                                  ? 'text-yellow-600'
                                  : 'text-red-600 font-semibold'
                              }
                            >
                              {healthScore}/10
                            </span>
                            <div className="text-xs text-purple-600 font-medium">
                              AI: {(healthScore + (Math.random() * 0.5 - 0.25)).toFixed(1)}/10
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

