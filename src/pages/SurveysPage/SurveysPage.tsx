import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  BarChart3,
  Users,
  Calendar,
  Star,
  MoreVertical
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
  updated_at: string;
  total_responses?: number;
  response_rate?: number;
  avg_rating?: number;
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  archived: 'bg-gray-100 text-gray-600'
};

const statusLabels = {
  draft: 'Draft',
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
  archived: 'Archived'
};

export default function SurveysPage() {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    loadSurveys();
  }, [statusFilter, typeFilter]);

  const loadSurveys = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      
      const response = await apiClient.get(`/surveys?${params}`);
      setSurveys(response.data.surveys || []);
    } catch (error: any) {
      console.error('Error loading surveys:', error);
      toast.error('Failed to load surveys');
    } finally {
      setLoading(false);
    }
  };

  const filteredSurveys = surveys.filter(survey => 
    survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    survey.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateSurvey = () => {
    navigate('/surveys/builder');
  };

  const handleViewSurvey = (surveyId: string) => {
    navigate(`/surveys/${surveyId}`);
  };

  const handleEditSurvey = (surveyId: string) => {
    navigate(`/surveys/${surveyId}/edit`);
  };

  const handleViewAnalytics = (surveyId: string) => {
    navigate(`/surveys/${surveyId}/analytics`);
  };

  const handleViewResponses = (surveyId: string) => {
    navigate(`/surveys/${surveyId}/responses`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSurveyTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      customer_satisfaction: 'Customer Satisfaction',
      account_feedback: 'Account Feedback',
      nps: 'NPS Survey',
      opportunity_feedback: 'Opportunity Feedback',
      general: 'General Survey'
    };
    return labels[type] || type;
  };

  return (
    <div className="w-full h-full bg-[#F5F3F2] font-outfit">
      <div className="flex flex-col w-full p-6 gap-6">
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm font-normal font-outfit leading-tight">Dashboard</span>
              <span className="text-[#344054] text-sm font-normal font-outfit leading-tight">/</span>
              <span className="text-[#344054] text-sm font-normal font-outfit leading-tight">Surveys</span>
            </div>
            <h1 className="text-[#1A1A1A] text-3xl font-semibold font-outfit leading-loose">Client Surveys</h1>
            <p className="text-[#667085] text-sm font-normal font-outfit leading-tight">Create and manage client satisfaction surveys</p>
          </div>
          
          <div className="flex items-start gap-3">
            <button 
              onClick={handleCreateSurvey}
              className="h-11 px-5 py-2 bg-indigo-950 rounded-lg flex items-center gap-2.5 hover:bg-indigo-900 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="text-white text-xs font-medium font-outfit leading-normal">Create Survey</span>
            </button>
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-gray-200 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search surveys..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 h-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48 h-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="customer_satisfaction">Customer Satisfaction</SelectItem>
                <SelectItem value="account_feedback">Account Feedback</SelectItem>
                <SelectItem value="nps">NPS Survey</SelectItem>
                <SelectItem value="opportunity_feedback">Opportunity Feedback</SelectItem>
                <SelectItem value="general">General Survey</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredSurveys.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No surveys found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'No surveys match your current filters.'
                  : 'Get started by creating your first survey.'}
              </p>
              <Button onClick={handleCreateSurvey}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Survey
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSurveys.map((survey) => (
              <div key={survey.id} className="p-6 bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {survey.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={statusColors[survey.status as keyof typeof statusColors]}>
                        {statusLabels[survey.status as keyof typeof statusLabels]}
                      </Badge>
                      <Badge variant="outline" className="border border-gray-300 text-gray-700">
                        {getSurveyTypeLabel(survey.survey_type)}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
                
                <div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {survey.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      Created {formatDate(survey.created_at)}
                    </div>
                    
                    {survey.total_responses !== undefined && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Users className="h-4 w-4" />
                        {survey.total_responses} responses
                      </div>
                    )}
                    
                    {survey.avg_rating !== undefined && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Star className="h-4 w-4" />
                        {survey.avg_rating}/5 average rating
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border border-gray-300 hover:border-indigo-500 hover:bg-indigo-50"
                      onClick={() => handleViewSurvey(survey.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    
                    {survey.status === 'draft' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditSurvey(survey.id)}
                        className="border border-gray-300 hover:border-indigo-500 hover:bg-indigo-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {survey.total_responses && survey.total_responses > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewAnalytics(survey.id)}
                        className="border border-gray-300 hover:border-indigo-500 hover:bg-indigo-50"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {filteredSurveys.length > 0 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <span className="text-sm text-gray-500">
                Page 1 of 1
              </span>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}