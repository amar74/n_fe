import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  ArrowLeft,
  Download,
  Search,
  Filter,
  Eye,
  Calendar,
  User,
  Building2,
  CheckCircle,
  Clock,
  Star,
  MessageSquare,
  TrendingUp,
  Users,
  BarChart3,
  PieChart,
  Activity,
  Mail,
  Link2,
  Copy,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/services/api/client';

interface Survey {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

interface SurveyResponse {
  id: string;
  response_code: string;
  survey_id: string;
  account_id: string;
  contact_id: string;
  response_data: Record<string, any>;
  finished: boolean;
  meta: Record<string, any> | null;
  time_to_complete: number | null;
  created_at: string;
  updated_at: string;
  account?: {
    account_id: string;
    client_name: string;
  };
  contact?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function SurveyResponsesPage() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (surveyId) {
      loadSurveyData();
    }
  }, [surveyId]);

  // Debug: Log when responses state changes
  useEffect(() => {
    console.log('📊 Responses state updated:', responses.length, 'items');
    if (responses.length > 0) {
      console.log('📊 First response sample:', responses[0]);
    }
  }, [responses]);

  const loadSurveyData = async () => {
    try {
      setLoading(true);
      
      // Load survey details first
      try {
        const surveyResponse = await apiClient.get(`/surveys/${surveyId}`);
        setSurvey(surveyResponse.data);
        console.log('✅ Survey loaded:', surveyResponse.data);
      } catch (surveyError: any) {
        console.error('❌ Survey load error:', surveyError);
        throw surveyError;
      }
      
      // Load responses separately to catch specific errors
      try {
        const responsesResponse = await apiClient.get(`/surveys/${surveyId}/responses`);
        console.log('📥 Raw responses data:', responsesResponse.data);
        console.log('📊 Data type:', typeof responsesResponse.data);
        console.log('📊 Is Array:', Array.isArray(responsesResponse.data));
        
        // Set responses - handle both array and object formats
        if (Array.isArray(responsesResponse.data)) {
          console.log(`✅ Setting ${responsesResponse.data.length} responses`);
          setResponses(responsesResponse.data);
        } else if (responsesResponse.data?.responses) {
          console.log(`✅ Setting ${responsesResponse.data.responses.length} responses from object`);
          setResponses(responsesResponse.data.responses);
        } else {
          console.warn('⚠️ No responses data found, setting empty array');
          setResponses([]);
        }
      } catch (responsesError: any) {
        console.error('❌ Responses load error:', responsesError);
        console.error('❌ Error response:', responsesError.response);
        console.error('❌ Error status:', responsesError.response?.status);
        console.error('❌ Error data:', responsesError.response?.data);
        
        // Don't throw - just show empty responses
        setResponses([]);
        
        if (responsesError.response?.status === 500) {
          toast.error('Server error loading responses. Check console for details.');
        }
      }
      
    } catch (error: any) {
      console.error('💥 Fatal error loading survey:', error);
      if (error.response?.status === 404) {
        toast.error('Survey not found');
      } else {
        toast.error('Failed to load survey');
      }
    } finally {
      setLoading(false);
      console.log('🏁 Loading complete. Responses count:', responses.length);
    }
  };

  const filteredResponses = responses.filter(response => {
    // Handle search - if no search term, match all
    const matchesSearch = !searchTerm || 
      response.contact?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      response.contact?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      response.account?.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      response.meta?.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      response.meta?.contact_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'completed' && response.finished) ||
      (statusFilter === 'incomplete' && !response.finished);
    
    return matchesSearch && matchesStatus;
  });

  // Debug logging
  console.log('🔍 Total responses:', responses.length);
  console.log('🔍 Filtered responses:', filteredResponses.length);
  console.log('🔍 Search term:', searchTerm);
  console.log('🔍 Status filter:', statusFilter);
  if (responses.length > 0 && filteredResponses.length === 0) {
    console.log('⚠️ All responses filtered out! First response:', responses[0]);
    console.log('⚠️ Contact data:', responses[0].contact);
    console.log('⚠️ Meta data:', responses[0].meta);
  }

  const handleExportData = () => {
    // Implement export functionality
    toast.info('Export functionality coming soon');
  };

  const handleCopySurveyLink = () => {
    const surveyLink = `${window.location.origin}/survey/${surveyId}`;
    navigator.clipboard.writeText(surveyLink);
    toast.success('Survey link copied to clipboard!');
  };

  const handleShareSurvey = () => {
    const surveyLink = `${window.location.origin}/survey/${surveyId}`;
    if (navigator.share) {
      navigator.share({
        title: survey?.title || 'Survey',
        text: 'Please take this survey',
        url: surveyLink,
      });
    } else {
      handleCopySurveyLink();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const renderResponseData = (responseData: Record<string, any>) => {
    return Object.entries(responseData).map(([key, value]) => (
      <div key={key} className="mb-2">
        <span className="font-medium text-gray-700">{key}:</span>{' '}
        <span className="text-gray-600">
          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
        </span>
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Survey not found</h3>
              <p className="text-gray-500 mb-4">
                The requested survey could not be found.
              </p>
              <Button onClick={() => navigate('/surveys')}>
                Back to Surveys
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Calculate analytics
  const totalResponses = responses.length;
  const completedResponses = responses.filter(r => r.finished).length;
  const completionRate = totalResponses > 0 ? ((completedResponses / totalResponses) * 100).toFixed(1) : '0';
  const avgCompletionTime = responses.length > 0 
    ? responses.reduce((sum, r) => sum + (r.time_to_complete || 0), 0) / responses.length 
    : 0;

  // Get unique accounts and contacts
  const uniqueAccounts = new Set(responses.map(r => r.account_id).filter(Boolean)).size;
  const uniqueContacts = new Set(responses.map(r => r.contact_id).filter(Boolean)).size;

  return (
    <div className="w-full h-full bg-[#F5F3F2] font-outfit">
      <div className="flex flex-col w-full p-6 gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="h-10 border border-gray-300 hover:border-indigo-500 hover:bg-indigo-50"
              onClick={() => navigate('/surveys')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">Surveys</span>
                <span className="text-gray-500 text-sm">/</span>
                <span className="text-[#1A1A1A] text-sm font-medium">{survey.title}</span>
              </div>
              <h1 className="text-[#1A1A1A] text-3xl font-semibold font-outfit">{survey.title}</h1>
              <p className="text-[#667085] text-sm">{survey.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`${survey.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} border-0`}>
              {survey.status}
            </Badge>
            <Button 
              variant="outline" 
              className="h-10 border-gray-300 hover:border-indigo-500"
              onClick={() => navigate(`/surveys/${surveyId}/analytics`)}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <Button onClick={handleExportData} variant="outline" className="h-10">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Survey Link Section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-[#1A1A1A]">Survey Link</h2>
            </div>
            <Badge className="bg-indigo-100 text-indigo-800 border-0">Public Access</Badge>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Share this link with contacts to let them access the survey directly
          </p>
          
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3 font-mono text-sm text-[#1A1A1A] overflow-x-auto">
              {window.location.origin}/survey/{surveyId}
            </div>
            <Button
              variant="outline"
              className="h-11 border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 flex-shrink-0"
              onClick={handleCopySurveyLink}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
            <Button
              variant="outline"
              className="h-11 border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 flex-shrink-0"
              onClick={handleShareSurvey}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
          
          <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Eye className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              <span className="font-medium">Tip:</span> Anyone with this link can access and submit the survey. Use this for email campaigns, social media, or direct sharing.
            </p>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Responses</p>
                  <p className="text-3xl font-bold text-[#1A1A1A]">{totalResponses}</p>
                </div>
                <div className="h-12 w-12 bg-indigo-50 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
                  <p className="text-3xl font-bold text-[#1A1A1A]">{completionRate}%</p>
                </div>
                <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Unique Accounts</p>
                  <p className="text-3xl font-bold text-[#1A1A1A]">{uniqueAccounts}</p>
                </div>
                <div className="h-12 w-12 bg-purple-50 rounded-full flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg. Time</p>
                  <p className="text-3xl font-bold text-[#1A1A1A]">{formatTime(Math.round(avgCompletionTime))}</p>
                </div>
                <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by contact name, email, or account..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 border-gray-300"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 h-11 border-gray-300">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Responses</SelectItem>
                <SelectItem value="completed">Completed Only</SelectItem>
                <SelectItem value="incomplete">Incomplete Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Responses Section */}
        {filteredResponses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">No responses found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all'
                ? 'No responses match your current filters.'
                : 'No responses have been received yet. Share your survey to start collecting feedback.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">
                All Responses ({filteredResponses.length})
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {filteredResponses.map((response) => (
                  <Card key={response.id} className="border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${response.finished ? 'bg-green-50' : 'bg-yellow-50'}`}>
                            {response.finished ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <Clock className="h-5 w-5 text-yellow-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-[#1A1A1A]">
                                {response.contact?.name || response.meta?.contact_name || 'Anonymous'}
                              </h3>
                              <Badge className={`${response.finished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} border-0`}>
                                {response.finished ? 'Completed' : 'In Progress'}
                              </Badge>
                              {response.meta?.submission_type === 'public_link' && (
                                <Badge className="bg-blue-100 text-blue-800 border-0">
                                  Public Link
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Mail className="h-4 w-4" />
                                {response.contact?.email || response.meta?.contact_email || 'N/A'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Building2 className="h-4 w-4" />
                                {response.account?.client_name || 'Public Submission'}
                              </span>
                              {response.meta?.contact_phone && (
                                <span className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  {response.meta.contact_phone}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(response.created_at)}
                              </span>
                              {response.time_to_complete && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {formatTime(response.time_to_complete)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Response Data */}
                      <div className="mt-4 border-t border-gray-200 pt-4">
                        <h4 className="text-sm font-semibold text-[#1A1A1A] mb-3">Response Details</h4>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          {renderResponseData(response.response_data)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}