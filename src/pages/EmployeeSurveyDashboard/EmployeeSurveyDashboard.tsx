import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  List,
  Users,
  FileText,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/services/api/client';

interface Survey {
  id: string;
  title: string;
  description: string;
  survey_type: string;
  status: string;
  created_at: string;
  total_responses?: number;
}

interface SurveyStats {
  total: number;
  draft: number;
  active: number;
  completed: number;
}

export default function EmployeeSurveyDashboard() {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SurveyStats>({
    total: 0,
    draft: 0,
    active: 0,
    completed: 0
  });

  useEffect(() => {
    loadEmployeeSurveys();
  }, []);

  const loadEmployeeSurveys = async () => {
    try {
      setLoading(true);
      // Load only employee surveys
      const response = await apiClient.get('/surveys');
      const allSurveys = response.data.surveys || [];
      
      // Filter to only employee-related surveys
      const employeeSurveys = allSurveys.filter((s: Survey) => 
        s.survey_type === 'employee_satisfaction' ||
        s.survey_type === 'employee_feedback'
      );
      
      setSurveys(employeeSurveys);
      
      // Calculate stats
      setStats({
        total: employeeSurveys.length,
        draft: employeeSurveys.filter((s: Survey) => s.status === 'draft').length,
        active: employeeSurveys.filter((s: Survey) => s.status === 'active').length,
        completed: employeeSurveys.filter((s: Survey) => s.status === 'completed').length
      });
    } catch (error) {
      console.error('Error loading employee surveys:', error);
      toast.error('Failed to load surveys');
    } finally {
      setLoading(false);
    }
  };

  const recentSurveys = surveys.slice(0, 5);

  return (
    <div className="w-full h-full bg-[#F5F3F2] font-outfit">
      <div className="flex flex-col w-full p-6 gap-6">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm font-normal font-outfit leading-tight">Dashboard</span>
              <span className="text-[#344054] text-sm font-normal font-outfit leading-tight">/</span>
              <span className="text-[#344054] text-sm font-normal font-outfit leading-tight">Employee Surveys</span>
            </div>
            <h1 className="text-[#1A1A1A] text-3xl font-semibold font-outfit leading-loose">Employee Survey Dashboard</h1>
            <p className="text-[#667085] text-sm font-normal font-outfit leading-tight">Manage and track employee feedback surveys</p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/surveys')}
              className="gap-2"
            >
              <List className="h-4 w-4" />
              All Surveys
            </Button>
            <Button
              onClick={() => navigate('/surveys/employee-builder')}
              className="gap-2 bg-purple-900 hover:bg-purple-800"
            >
              <Plus className="h-4 w-4" />
              Create Employee Survey
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-6 bg-white rounded-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-600">Total Employee Surveys</p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <FileText className="h-8 w-8 text-gray-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
            <p className="text-sm text-gray-600">Draft Surveys</p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            <p className="text-sm text-gray-600">Active Surveys</p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            <p className="text-sm text-gray-600">Completed Surveys</p>
          </div>
        </div>

        {/* Analytics Chart */}
        <div className="p-6 bg-white rounded-2xl border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[#1A1A1A] text-lg font-semibold font-outfit">Survey Status Distribution</h2>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {/* Draft Surveys Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Draft</span>
                <span className="text-sm font-semibold text-gray-900">{stats.draft}</span>
              </div>
              <div className="w-full h-8 bg-gray-100 rounded-lg overflow-hidden">
                <div 
                  className="h-full bg-gray-400 transition-all duration-500"
                  style={{ width: stats.total > 0 ? `${(stats.draft / stats.total) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>

            {/* Active Surveys Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Active</span>
                <span className="text-sm font-semibold text-gray-900">{stats.active}</span>
              </div>
              <div className="w-full h-8 bg-gray-100 rounded-lg overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: stats.total > 0 ? `${(stats.active / stats.total) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>

            {/* Completed Surveys Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Completed</span>
                <span className="text-sm font-semibold text-gray-900">{stats.completed}</span>
              </div>
              <div className="w-full h-8 bg-gray-100 rounded-lg overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: stats.total > 0 ? `${(stats.completed / stats.total) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>

            {stats.total === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No surveys yet. Create your first employee survey to see analytics.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Employee Surveys */}
        <div className="p-6 bg-white rounded-2xl border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[#1A1A1A] text-lg font-semibold font-outfit">Recent Employee Surveys</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/surveys')}
            >
              View All →
            </Button>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            </div>
          ) : recentSurveys.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No employee surveys yet</p>
              <Button 
                onClick={() => navigate('/surveys/employee-builder')}
                className="bg-purple-900 hover:bg-purple-800"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Employee Survey
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSurveys.map((survey) => (
                <div 
                  key={survey.id} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => {
                    if (survey.status === 'draft') {
                      navigate(`/surveys/${survey.id}/employee-edit`);
                    } else {
                      navigate(`/surveys/${survey.id}`);
                    }
                  }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">{survey.title}</h3>
                      {survey.status === 'active' && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      {survey.status === 'draft' && (
                        <FileText className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary" 
                        className="text-xs bg-purple-100 text-purple-700"
                      >
                        {survey.status}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(survey.created_at).toLocaleDateString()}
                      </span>
                      {survey.total_responses !== undefined && (
                        <span className="text-xs text-gray-500">
                          {survey.total_responses} responses
                        </span>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    {survey.status === 'draft' ? 'Edit →' : 'View →'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

