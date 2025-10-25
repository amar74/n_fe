import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Download,
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  Target,
  Clock,
  Star,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Frown,
  Meh,
  PieChart,
  Activity,
  CheckCircle,
  XCircle,
  Link2,
  Copy,
  Share2,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/services/api/client';

interface SurveyAnalytics {
  survey_id: string;
  survey_title: string;
  total_sent: number;
  total_responses: number;
  response_rate: number;
  avg_completion_time: number;
  by_account: AccountAnalytics[];
}

interface AccountAnalytics {
  account_id: string;
  account_name: string;
  total_surveys_sent: number;
  total_responses: number;
  response_rate: number;
  avg_satisfaction_score: number | null;
  last_response_date: string | null;
}

export default function SurveyAnalyticsPage() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<SurveyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (surveyId) {
      loadAnalytics();
    }
  }, [surveyId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/surveys/${surveyId}/analytics`);
      setAnalytics(response.data);
    } catch (error: any) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

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
        title: analytics?.survey_title || 'Survey',
        text: 'Please take this survey',
        url: surveyLink,
      });
    } else {
      handleCopySurveyLink();
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getResponseRateColor = (rate: number) => {
    if (rate >= 70) return 'text-green-600';
    if (rate >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getResponseRateIcon = (rate: number) => {
    if (rate >= 70) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (rate >= 50) return <TrendingUp className="h-4 w-4 text-yellow-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics available</h3>
              <p className="text-gray-500 mb-4">
                Analytics will be available once responses are received.
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
                <span className="text-[#1A1A1A] text-sm font-medium">{analytics.survey_title}</span>
              </div>
              <h1 className="text-[#1A1A1A] text-3xl font-semibold font-outfit">{analytics.survey_title}</h1>
              <p className="text-[#667085] text-sm">Survey Analytics & Insights</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="h-10 border-gray-300 hover:border-indigo-500"
              onClick={() => navigate(`/surveys/${surveyId}`)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              View Responses
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

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Sent</p>
                  <p className="text-3xl font-bold text-[#1A1A1A]">{analytics.total_sent}</p>
                </div>
                <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Responses</p>
                  <p className="text-3xl font-bold text-[#1A1A1A]">{analytics.total_responses}</p>
                </div>
                <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Response Rate</p>
                  <p className={`text-3xl font-bold ${getResponseRateColor(analytics.response_rate)}`}>
                    {analytics.response_rate.toFixed(1)}%
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-50 rounded-full flex items-center justify-center">
                  {getResponseRateIcon(analytics.response_rate)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg. Time</p>
                  <p className="text-3xl font-bold text-[#1A1A1A]">
                    {formatTime(analytics.avg_completion_time)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-50 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Response Overview */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-1">Response Overview</h2>
            <p className="text-sm text-gray-600">Survey distribution and response summary</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sent vs Responses */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-600">Distribution</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Sent</span>
                <span className="text-lg font-bold text-[#1A1A1A]">{analytics.total_sent}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Responses Received</span>
                <span className="text-lg font-bold text-green-600">{analytics.total_responses}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="text-lg font-bold text-gray-400">{analytics.total_sent - analytics.total_responses}</span>
              </div>
            </div>

            {/* Visual Progress */}
            <div className="col-span-2">
              <h3 className="text-sm font-medium text-gray-600 mb-3">Response Progress</h3>
              <div className="relative">
                <div className="w-full bg-gray-100 rounded-full h-6">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-6 rounded-full flex items-center justify-center transition-all duration-500" 
                    style={{ width: `${analytics.response_rate}%` }}
                  >
                    <span className="text-xs font-medium text-white">{analytics.response_rate.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{analytics.total_responses}</p>
                  <p className="text-xs text-gray-600">Completed</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-600">{analytics.total_sent - analytics.total_responses}</p>
                  <p className="text-xs text-gray-600">Remaining</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Engagement Score - Circular Progress */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-[#1A1A1A] mb-1">Overall Engagement</h2>
              <p className="text-sm text-gray-600">Response rate and participation</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center py-8">
            <div className="relative h-48 w-48">
              <svg className="transform -rotate-90 h-48 w-48">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#E5E7EB"
                  strokeWidth="16"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke={analytics.response_rate >= 70 ? "#10B981" : analytics.response_rate >= 50 ? "#F59E0B" : "#EF4444"}
                  strokeWidth="16"
                  fill="none"
                  strokeDasharray={`${(analytics.response_rate / 100) * 552.92} 552.92`}
                  className="transition-all duration-1000"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold text-[#1A1A1A]">{analytics.response_rate.toFixed(1)}%</span>
                <span className="text-sm text-gray-500 mt-1">Response Rate</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{analytics.total_sent}</p>
              <p className="text-xs text-gray-500">Sent</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{analytics.total_responses}</p>
              <p className="text-xs text-gray-500">Responses</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-400">{analytics.total_sent - analytics.total_responses}</p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
          </div>
        </div>

        {/* Response Distribution by Account */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-[#1A1A1A]">Account Performance</h2>
              <p className="text-sm text-gray-600">Response rates by account with visual breakdown</p>
            </div>
            <Badge className="bg-indigo-100 text-indigo-800 border-0">
              {analytics.by_account.length} Accounts
            </Badge>
          </div>
          
          {/* Horizontal Bar Chart */}
          <div className="space-y-4">
            {analytics.by_account.slice(0, 10).map((account, idx) => {
              const maxResponses = Math.max(...analytics.by_account.map(a => a.total_responses));
              const percentage = (account.total_responses / maxResponses) * 100;
              
              return (
                <div key={account.account_id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-sm font-medium text-gray-400 w-6">#{idx + 1}</span>
                      <span className="text-sm font-medium text-[#1A1A1A] truncate">{account.account_name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={`${account.response_rate >= 70 ? 'bg-green-100 text-green-800' : account.response_rate >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'} border-0 text-xs`}>
                        {account.response_rate.toFixed(0)}%
                      </Badge>
                      <span className="text-sm font-semibold text-[#1A1A1A] w-16 text-right">
                        {account.total_responses}/{account.total_surveys_sent}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        account.response_rate >= 70 ? 'bg-green-500' : 
                        account.response_rate >= 50 ? 'bg-yellow-500' : 
                        'bg-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Account Cards Grid */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-1">Detailed Account Breakdown</h2>
            <p className="text-sm text-gray-600">Individual account performance metrics</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.by_account.map((account) => (
              <Card key={account.account_id} className="border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#1A1A1A] mb-1 truncate">{account.account_name}</h3>
                      <p className="text-xs text-gray-500">Account Metrics</p>
                    </div>
                    <Badge className={`${account.response_rate >= 70 ? 'bg-green-100 text-green-800' : account.response_rate >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'} border-0 flex-shrink-0`}>
                      {account.response_rate.toFixed(0)}%
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Sent</span>
                      <span className="font-medium text-[#1A1A1A]">{account.total_surveys_sent}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Responses</span>
                      <span className="font-medium text-[#1A1A1A]">{account.total_responses}</span>
                    </div>
                    {account.avg_satisfaction_score && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Avg. Rating</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="font-medium text-[#1A1A1A]">
                            {account.avg_satisfaction_score.toFixed(1)}/5
                          </span>
                        </div>
                      </div>
                    )}
                    {account.last_response_date && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Last Response</span>
                        <span className="font-medium text-[#1A1A1A] text-xs">{formatDate(account.last_response_date)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}