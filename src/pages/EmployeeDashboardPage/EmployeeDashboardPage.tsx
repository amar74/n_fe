import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ClipboardList,
  CheckCircle,
  Clock,
  FileText,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/services/api/client';

interface AssignedSurvey {
  id: string;
  title: string;
  description: string;
  status: string;
  is_completed: boolean;
  survey_link: string;
  distribution_id: string;
}

export default function EmployeeDashboardPage() {
  const navigate = useNavigate();
  const [assignedSurveys, setAssignedSurveys] = useState<AssignedSurvey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignedSurveys();
  }, []);

  const loadAssignedSurveys = async () => {
    try {
      setLoading(true);
      // Endpoint to get surveys assigned to logged-in employee
      const response = await apiClient.get('/employee/surveys/assigned');
      setAssignedSurveys(response.data);
    } catch (error) {
      console.error('Error loading assigned surveys:', error);
      toast.error('Failed to load surveys');
    } finally {
      setLoading(false);
    }
  };

  const handleTakeSurvey = (survey: AssignedSurvey) => {
    // Navigate to authenticated employee survey page
    navigate(`/employee/survey/${survey.id}`);
  };

  const pendingSurveys = assignedSurveys.filter(s => !s.is_completed);
  const completedSurveys = assignedSurveys.filter(s => s.is_completed);

  return (
    <div className="w-full h-full bg-[#F5F3F2] font-outfit">
      <div className="flex flex-col w-full p-6 gap-6">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <h1 className="text-[#1A1A1A] text-3xl font-semibold font-outfit leading-loose">My Surveys</h1>
          <p className="text-[#667085] text-sm font-normal font-outfit leading-tight">
            Complete surveys assigned to you
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-white rounded-2xl border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <ClipboardList className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{assignedSurveys.length}</p>
                <p className="text-sm text-gray-600">Total Assigned</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{pendingSurveys.length}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{completedSurveys.length}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Surveys */}
        {pendingSurveys.length > 0 && (
          <div className="p-6 bg-white rounded-2xl border border-gray-200">
            <h2 className="text-[#1A1A1A] text-lg font-semibold font-outfit mb-4">
              Pending Surveys ({pendingSurveys.length})
            </h2>
            <div className="space-y-3">
              {pendingSurveys.map((survey) => (
                <div 
                  key={survey.id}
                  className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border-2 border-orange-200"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{survey.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{survey.description}</p>
                    <Badge className="bg-orange-100 text-orange-700">
                      Awaiting Response
                    </Badge>
                  </div>
                  <Button
                    onClick={() => handleTakeSurvey(survey)}
                    className="bg-purple-900 hover:bg-purple-800"
                  >
                    Take Survey →
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Surveys */}
        {completedSurveys.length > 0 && (
          <div className="p-6 bg-white rounded-2xl border border-gray-200">
            <h2 className="text-[#1A1A1A] text-lg font-semibold font-outfit mb-4">
              Completed Surveys ({completedSurveys.length})
            </h2>
            <div className="space-y-3">
              {completedSurveys.map((survey) => (
                <div 
                  key={survey.id}
                  className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">{survey.title}</h3>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{survey.description}</p>
                    <Badge className="bg-green-100 text-green-700">
                      Completed
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading surveys...</p>
          </div>
        )}

        {!loading && assignedSurveys.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <ClipboardList className="h-16 w-16 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No surveys assigned to you yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

