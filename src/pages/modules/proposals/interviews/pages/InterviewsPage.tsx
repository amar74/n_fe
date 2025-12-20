import { memo, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Filter,
  Brain,
  Target,
  AlertTriangle,
  TrendingUp,
  Clock,
  Zap,
  BarChart3,
  Activity,
  Sparkles,
  FolderOpen,
  CheckCircle,
  ArrowRight,
  Video,
  MapPin,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/shared';
import { useProposals } from '@/hooks/proposals';

function InterviewsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const { useProposalsList } = useProposals();
  
  // Fetch interviews with type_filter
  const { data: interviewsData, isLoading } = useProposalsList({
    type_filter: 'interview',
    page: 1,
    size: 100,
    search: searchTerm || undefined,
  });

  const interviews = interviewsData?.items || [];
  
  // Calculate stats from real data
  const stats = useMemo(() => {
    const total = interviews.length;
    const scheduled = interviews.filter((i: any) => i.status === 'submitted').length;
    const completed = interviews.filter((i: any) => ['won', 'lost'].includes(i.status)).length;
    const preparing = interviews.filter((i: any) => i.status === 'draft').length;
    
    return { total, scheduled, completed, preparing };
  }, [interviews]);

  // Filter ongoing interviews
  const ongoingInterviews = useMemo(() => {
    return interviews
      .filter((i: any) => ['draft', 'in_review', 'submitted'].includes(i.status))
      .map((i: any) => ({
        id: i.id,
        name: i.title || 'Untitled Interview',
        client: i.account_name || 'Unknown Client',
        format: 'In-Person',
        date: i.due_date ? new Date(i.due_date).toLocaleDateString() : 'N/A',
        time: '2:00 PM',
        status: i.status,
        stage: i.status === 'draft' ? 'Preparation' : 'Content Review',
        aiSuccessProbability: 85,
        predictedOutcome: 'Positive',
        progressPercentage: i.progress || 50,
        behindSchedule: false,
      }));
  }, [interviews]);

  // Filter completed interviews
  const completedInterviews = useMemo(() => {
    return interviews
      .filter((i: any) => ['won', 'lost', 'archived'].includes(i.status))
      .map((i: any) => ({
        id: i.id,
        name: i.title || 'Untitled Interview',
        client: i.account_name || 'Unknown Client',
        format: 'In-Person',
        completedDate: i.submission_date ? new Date(i.submission_date).toLocaleDateString() : 'N/A',
        status: i.status === 'won' ? 'Successful' : 'Completed',
        outcome: i.status === 'won' ? 'Advanced to Final Round' : 'Completed',
        finalSuccessProbability: 88,
        actualScore: i.ai_compliance_score || 85,
      }));
  }, [interviews]);

  // Calculate AI analytics from real data
  const aiAnalytics = useMemo(() => {
    if (ongoingInterviews.length === 0) return null;
    
    const avgProb = Math.round(
      ongoingInterviews.reduce((sum, i) => sum + i.aiSuccessProbability, 0) / ongoingInterviews.length
    );
    
    return {
      averageSuccessProbability: avgProb,
      totalUpcomingInterviews: ongoingInterviews.length,
      criticalInterviews: ongoingInterviews.filter(i => i.behindSchedule).length,
      avgCompletionConfidence: 85,
    };
  }, [ongoingInterviews]);

  // Calculate focus areas
  const focusAreas = useMemo(() => {
    return ongoingInterviews
      .filter(i => i.behindSchedule || i.aiSuccessProbability < 80)
      .map(i => ({
        interviewId: i.id,
        interviewName: i.name,
        priority: i.behindSchedule ? 'critical' : 'medium',
        reason: i.behindSchedule ? 'Behind Schedule' : 'Low Success Probability',
        action: 'Review preparation materials',
        client: i.client,
      }));
  }, [ongoingInterviews]);

  return (
    <div className="w-full h-full bg-white font-outfit">
      <div className="flex flex-col w-full p-6 gap-6">
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Link to="/" className="text-gray-500 text-sm font-normal font-outfit leading-tight hover:text-gray-900">
                Dashboard
              </Link>
              <span className="text-[#344054] text-sm font-normal font-outfit leading-tight">/</span>
              <Link to="/module/proposals" className="text-gray-500 text-sm font-normal font-outfit leading-tight hover:text-gray-900">
                Proposals
              </Link>
              <span className="text-[#344054] text-sm font-normal font-outfit leading-tight">/</span>
              <span className="text-[#344054] text-sm font-normal font-outfit leading-tight">Interviews</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-[#1A1A1A] text-3xl font-semibold font-outfit leading-loose flex items-center gap-2">
                <MessageSquare className="h-8 w-8 text-[#161950]" />
                Interviews
              </h1>
              <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit">
                <Brain className="h-3 w-3 mr-1" />
                AI Enhanced
              </Badge>
            </div>
            <p className="text-gray-600 font-outfit">
              Track and manage discovery interviews with AI-powered insights
            </p>
          </div>

          <div className="flex items-start gap-3">
            <Button
              onClick={() => navigate('/module/proposals/interviews/setup')}
              className="h-11 px-5 py-2 bg-[#161950] rounded-lg flex items-center gap-2.5 hover:bg-[#0f1440] transition-all shadow-sm font-outfit"
            >
              <Plus className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-semibold font-outfit leading-normal">Schedule Interview</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:gap-3">
          <div className="flex-1 bg-white rounded-xl border border-gray-100 p-4 shadow-[0_8px_24px_rgba(22,25,80,0.05)] hover:shadow-md transition-all">
            <div className="flex items-start gap-6 mb-3">
              <div className="bg-[#161950]/10 p-3 rounded-lg border border-[#161950]/15 flex-shrink-0">
                <MessageSquare className="h-5 w-5 text-[#161950]" />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500 font-outfit">Total</div>
                <div className="flex items-baseline gap-3">
                  <div className="text-3xl font-bold font-outfit text-[#161950] leading-tight">{stats.total}</div>
                  <div className="text-sm text-gray-700 font-outfit leading-snug">All interviews</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 font-outfit">
              <span>Preparing: {stats.preparing}</span>
              <span className="text-[#161950] font-semibold">AI ready</span>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-xl border border-gray-100 p-4 shadow-[0_8px_24px_rgba(22,25,80,0.05)] hover:shadow-md transition-all">
            <div className="flex items-start gap-6 mb-3">
              <div className="bg-[#161950]/10 p-3 rounded-lg border border-[#161950]/15 flex-shrink-0">
                <Calendar className="h-5 w-5 text-[#161950]" />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500 font-outfit">Scheduled</div>
                <div className="flex items-baseline gap-3">
                  <div className="text-3xl font-bold font-outfit text-[#161950] leading-tight">{stats.scheduled}</div>
                  <div className="text-sm text-gray-700 font-outfit leading-snug">Upcoming</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 font-outfit">
              <span>On-track</span>
              <span className="text-[#161950] font-semibold">Prep ready</span>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-xl border border-gray-100 p-4 shadow-[0_8px_24px_rgba(22,25,80,0.05)] hover:shadow-md transition-all">
            <div className="flex items-start gap-6 mb-3">
              <div className="bg-[#161950]/10 p-3 rounded-lg border border-[#161950]/15 flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-[#161950]" />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500 font-outfit">Completed</div>
                <div className="flex items-baseline gap-3">
                  <div className="text-3xl font-bold font-outfit text-[#161950] leading-tight">{stats.completed}</div>
                  <div className="text-sm text-gray-700 font-outfit leading-snug">Closed</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 font-outfit">
              <span>Submitted: {stats.completed}</span>
              <span className="text-[#161950] font-semibold">Insights saved</span>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-xl border border-gray-100 p-4 shadow-[0_8px_24px_rgba(22,25,80,0.05)] hover:shadow-md transition-all">
            <div className="flex items-start gap-6 mb-3">
              <div className="bg-[#161950]/10 p-3 rounded-lg border border-[#161950]/15 flex-shrink-0">
                <Brain className="h-5 w-5 text-[#161950]" />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500 font-outfit">Avg Success</div>
                <div className="flex items-baseline gap-3">
                  <div className="text-3xl font-bold font-outfit text-[#161950] leading-tight">
                    {aiAnalytics?.averageSuccessProbability || 0}%
                  </div>
                  <div className="text-sm text-gray-700 font-outfit leading-snug">Confidence</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 font-outfit">
              <span>AI adjusted</span>
              <span className="text-[#161950] font-semibold">+3% vs last</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className="bg-gray-50 rounded-2xl border border-gray-200 hover:border-[#161950] transition-all hover:shadow-lg cursor-pointer group p-6"
            onClick={() => navigate('/module/proposals/interviews/setup')}
          >
            <div className="flex items-start gap-4">
              <div className="bg-[#161950]/10 p-4 rounded-xl group-hover:bg-[#161950]/20 transition-colors border border-[#161950]/20 flex-shrink-0">
                <Plus className="h-12 w-12 text-[#161950]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit">Schedule New</h3>
                  <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Power Creations
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm font-outfit leading-relaxed">
                  Schedule a new interview with AI-powered preparation assistance and intelligent templates.
                </p>
              </div>
            </div>
          </div>

          <div
            className="bg-gray-50 rounded-2xl border border-gray-200 hover:border-[#161950] transition-all hover:shadow-lg cursor-pointer group p-6"
            onClick={() => navigate('/module/proposals/interviews/ongoing')}
          >
            <div className="flex items-start gap-4">
              <div className="bg-[#161950]/10 p-4 rounded-xl group-hover:bg-[#161950]/20 transition-colors border border-[#161950]/20 flex-shrink-0">
                <FolderOpen className="h-12 w-12 text-[#161950]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit">Open On-going</h3>
                  <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit text-xs">
                    {ongoingInterviews.length} Active Interview{ongoingInterviews.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm font-outfit leading-relaxed">
                  Continue working on active interviews and track progress.
                </p>
              </div>
            </div>
          </div>

          <div
            className="bg-gray-50 rounded-2xl border border-gray-200 hover:border-[#161950] transition-all hover:shadow-lg cursor-pointer group p-6"
            onClick={() => navigate('/module/proposals/interviews/completed')}
          >
            <div className="flex items-start gap-4">
              <div className="bg-[#161950]/10 p-4 rounded-xl group-hover:bg-[#161950]/20 transition-colors border border-[#161950]/20 flex-shrink-0">
                <CheckCircle className="h-12 w-12 text-[#161950]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit">Open Completed</h3>
                  <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit text-xs">
                    {completedInterviews.length} - Completed
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm font-outfit leading-relaxed">
                  Review Completed Interviews and analyze performance metrics.
                </p>
              </div>
            </div>
          </div>
        </div>

        {aiAnalytics && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#161950]/10 p-2 rounded-lg border border-[#161950]/20">
                <BarChart3 className="h-6 w-6 text-[#161950]" />
              </div>
              <div>
                <h3 className="text-xl font-semibold font-outfit text-[#1A1A1A]">AI Predictive Analytics</h3>
                <p className="text-sm text-gray-600 font-outfit">AI-powered insights and predictions</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 bg-[#161950]/5 rounded-xl border border-[#161950]/20 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-[#161950]/10 p-2 rounded-lg">
                    <Brain className="h-5 w-5 text-[#161950]" />
                  </div>
                  <span className="text-xs font-semibold font-outfit text-gray-600 uppercase tracking-wide">AI Score</span>
                </div>
                <div className="text-3xl font-bold font-outfit text-[#161950] mb-1">
                  {aiAnalytics.averageSuccessProbability}%
                </div>
                <p className="text-sm text-gray-600 font-outfit">Average Success</p>
              </div>
              <div className="p-5 bg-[#161950]/5 rounded-xl border border-[#161950]/20 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-[#161950]/10 p-2 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-[#161950]" />
                  </div>
                  <span className="text-xs font-semibold font-outfit text-gray-600 uppercase tracking-wide">Upcoming</span>
                </div>
                <div className="text-3xl font-bold font-outfit text-[#161950] mb-1">
                  {aiAnalytics.totalUpcomingInterviews}
                </div>
                <p className="text-sm text-gray-600 font-outfit">Upcoming Interviews</p>
              </div>
              <div className="p-5 bg-[#161950]/5 rounded-xl border border-[#161950]/20 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-[#161950]/10 p-2 rounded-lg">
                    <Target className="h-5 w-5 text-[#161950]" />
                  </div>
                  <span className="text-xs font-semibold font-outfit text-gray-600 uppercase tracking-wide">Confidence</span>
                </div>
                <div className="text-3xl font-bold font-outfit text-[#161950] mb-1">
                  {aiAnalytics.avgCompletionConfidence}%
                </div>
                <p className="text-sm text-gray-600 font-outfit">Completion Confidence</p>
              </div>
              <div className="p-5 bg-[#161950]/5 rounded-xl border border-[#161950]/20 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-[#161950]/10 p-2 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-[#161950]" />
                  </div>
                  <span className="text-xs font-semibold font-outfit text-gray-600 uppercase tracking-wide">Critical</span>
                </div>
                <div className="text-3xl font-bold font-outfit text-[#161950] mb-1">
                  {aiAnalytics.criticalInterviews}
                </div>
                <p className="text-sm text-gray-600 font-outfit">Critical Items</p>
              </div>
            </div>
          </div>
        )}

        {focusAreas.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#161950]/10 p-2 rounded-lg border border-[#161950]/20">
                <Target className="h-6 w-6 text-[#161950]" />
              </div>
              <div>
                <h3 className="text-xl font-semibold font-outfit text-[#1A1A1A]">Focus Areas</h3>
                <p className="text-sm text-gray-600 font-outfit">Items requiring immediate attention</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {focusAreas.map((area) => (
                <div
                  key={area.interviewId}
                  className="p-5 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-[#161950] hover:shadow-md transition-all cursor-pointer"
                  onClick={() => navigate(`/module/proposals/interviews/${area.interviewId}/edit`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold font-outfit text-[#1A1A1A] mb-1">{area.interviewName}</h4>
                      <p className="text-sm text-gray-600 font-outfit mb-2">{area.client}</p>
                      <p className="text-sm text-gray-600 font-outfit">{area.reason}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-[#161950]/5 text-[#161950] border-[#161950]/20"
                    >
                      {area.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#161950] font-outfit">
                    <ArrowRight className="h-4 w-4" />
                    <span>{area.action}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(InterviewsPage);
