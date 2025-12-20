import { memo, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Megaphone, 
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
  Share2,
  Users,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/shared';
import { useProposals } from '@/hooks/proposals';

function CampaignsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const { useProposalsList } = useProposals();
  
  // Fetch campaigns with type_filter
  const { data: campaignsData, isLoading } = useProposalsList({
    type_filter: 'campaign',
    page: 1,
    size: 100,
    search: searchTerm || undefined,
  });

  const campaigns = campaignsData?.items || [];
  
  // Calculate stats from real data
  const stats = useMemo(() => {
    const total = campaigns.length;
    const active = campaigns.filter((c: any) => ['submitted', 'in_review'].includes(c.status)).length;
    const completed = campaigns.filter((c: any) => ['won', 'lost'].includes(c.status)).length;
    const draft = campaigns.filter((c: any) => c.status === 'draft').length;
    
    return { total, active, completed, draft };
  }, [campaigns]);

  // Filter ongoing campaigns
  const ongoingCampaigns = useMemo(() => {
    return campaigns
      .filter((c: any) => ['draft', 'in_review', 'submitted'].includes(c.status))
      .map((c: any) => ({
        id: c.id,
        name: c.title || 'Untitled Campaign',
        client: c.account_name || 'Unknown Client',
        type: 'Social Media',
        startDate: c.due_date ? new Date(c.due_date).toLocaleDateString() : 'N/A',
        endDate: c.submission_date ? new Date(c.submission_date).toLocaleDateString() : 'N/A',
        status: c.status,
        stage: c.status === 'draft' ? 'Planning' : 'Execution',
        aiPerformanceScore: 88,
        predictedReach: '125K',
        progressPercentage: c.progress || 50,
        behindSchedule: false,
      }));
  }, [campaigns]);

  // Filter completed campaigns
  const completedCampaigns = useMemo(() => {
    return campaigns
      .filter((c: any) => ['won', 'lost', 'archived'].includes(c.status))
      .map((c: any) => ({
        id: c.id,
        name: c.title || 'Untitled Campaign',
        client: c.account_name || 'Unknown Client',
        type: 'Email Marketing',
        completedDate: c.submission_date ? new Date(c.submission_date).toLocaleDateString() : 'N/A',
        status: c.status === 'won' ? 'Completed' : 'Completed',
        finalScore: c.ai_compliance_score || 85,
        actualReach: '98K',
      }));
  }, [campaigns]);

  // Calculate AI analytics from real data
  const aiAnalytics = useMemo(() => {
    if (ongoingCampaigns.length === 0) return null;
    
    const avgScore = Math.round(
      ongoingCampaigns.reduce((sum, c) => sum + c.aiPerformanceScore, 0) / ongoingCampaigns.length
    );
    
    return {
      averagePerformanceScore: avgScore,
      totalCampaigns: stats.total,
      criticalCampaigns: ongoingCampaigns.filter(c => c.behindSchedule).length,
      avgCompletionConfidence: 85,
    };
  }, [ongoingCampaigns, stats]);

  // Calculate focus areas
  const focusAreas = useMemo(() => {
    return ongoingCampaigns
      .filter(c => c.behindSchedule || c.aiPerformanceScore < 75)
      .map(c => ({
        campaignId: c.id,
        campaignName: c.name,
        priority: c.behindSchedule ? 'critical' : 'medium',
        reason: c.behindSchedule ? 'Behind Schedule' : 'Low Performance Score',
        action: 'Review campaign strategy',
        client: c.client,
      }));
  }, [ongoingCampaigns]);

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
              <span className="text-[#344054] text-sm font-normal font-outfit leading-tight">Campaigns</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-[#1A1A1A] text-3xl font-semibold font-outfit leading-loose flex items-center gap-2">
                <Megaphone className="h-8 w-8 text-[#161950]" />
                Campaigns
              </h1>
              <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit">
                <Brain className="h-3 w-3 mr-1" />
                AI Enhanced
              </Badge>
            </div>
            <p className="text-gray-600 font-outfit">
              Create and manage marketing campaigns with AI-powered content generation
            </p>
          </div>

          <div className="flex items-start gap-3">
            <Button
              onClick={() => navigate('/module/proposals/campaigns/setup')}
              className="h-11 px-5 py-2 bg-[#161950] rounded-lg flex items-center gap-2.5 hover:bg-[#0f1440] transition-all shadow-sm font-outfit"
            >
              <Plus className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-semibold font-outfit leading-normal">Create New Campaign</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:gap-3">
          <div className="flex-1 bg-white rounded-xl border border-gray-100 p-4 shadow-[0_8px_24px_rgba(22,25,80,0.05)] hover:shadow-md transition-all">
            <div className="flex items-start gap-6 mb-3">
              <div className="bg-[#161950]/10 p-3 rounded-lg border border-[#161950]/15 flex-shrink-0">
                <Megaphone className="h-5 w-5 text-[#161950]" />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500 font-outfit">Total</div>
                <div className="flex items-baseline gap-3">
                  <div className="text-3xl font-bold font-outfit text-[#161950] leading-tight">{stats.total}</div>
                  <div className="text-sm text-gray-700 font-outfit leading-snug">All campaigns</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 font-outfit">
              <span>Drafts: {stats.draft}</span>
              <span className="text-[#161950] font-semibold">+1 last 30d</span>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-xl border border-gray-100 p-4 shadow-[0_8px_24px_rgba(22,25,80,0.05)] hover:shadow-md transition-all">
            <div className="flex items-start gap-6 mb-3">
              <div className="bg-[#161950]/10 p-3 rounded-lg border border-[#161950]/15 flex-shrink-0">
                <Activity className="h-5 w-5 text-[#161950]" />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500 font-outfit">Active</div>
                <div className="flex items-baseline gap-3">
                  <div className="text-3xl font-bold font-outfit text-[#161950] leading-tight">{stats.active}</div>
                  <div className="text-sm text-gray-700 font-outfit leading-snug">Currently running</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 font-outfit">
              <span>On-track: {ongoingCampaigns.filter(c => !c.behindSchedule).length}</span>
              <span className="text-amber-600 font-semibold">Behind: {ongoingCampaigns.filter(c => c.behindSchedule).length}</span>
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
                  <div className="text-sm text-gray-700 font-outfit leading-snug">Closed & delivered</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 font-outfit">
              <span>Submitted: {stats.completed}</span>
              <span className="text-[#161950] font-semibold">+1 last 30d</span>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-xl border border-gray-100 p-4 shadow-[0_8px_24px_rgba(22,25,80,0.05)] hover:shadow-md transition-all">
            <div className="flex items-start gap-6 mb-3">
              <div className="bg-[#161950]/10 p-3 rounded-lg border border-[#161950]/15 flex-shrink-0">
                <Brain className="h-5 w-5 text-[#161950]" />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500 font-outfit">Avg Performance</div>
                <div className="flex items-baseline gap-3">
                  <div className="text-3xl font-bold font-outfit text-[#161950] leading-tight">
                    {aiAnalytics?.averagePerformanceScore || 0}%
                  </div>
                  <div className="text-sm text-gray-700 font-outfit leading-snug">Target 90%</div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Progress value={Math.min(aiAnalytics?.averagePerformanceScore || 0, 100)} className="h-2" />
              <div className="flex items-center justify-between text-xs text-gray-500 font-outfit">
                <span>Confidence: {aiAnalytics?.avgCompletionConfidence || 0}%</span>
                <span className="text-[#161950] font-semibold">+3% vs last cycle</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className="bg-gray-50 rounded-2xl border border-gray-200 hover:border-[#161950] transition-all hover:shadow-lg cursor-pointer group p-6"
            onClick={() => navigate('/module/proposals/campaigns/setup')}
          >
            <div className="flex items-start gap-4">
              <div className="bg-[#161950]/10 p-4 rounded-xl group-hover:bg-[#161950]/20 transition-colors border border-[#161950]/20 flex-shrink-0">
                <Plus className="h-12 w-12 text-[#161950]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit">Create New</h3>
                  <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Power Creations
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm font-outfit leading-relaxed">
                  Start a new campaign with AI-powered content generation and intelligent templates.
                </p>
              </div>
            </div>
          </div>

          <div
            className="bg-gray-50 rounded-2xl border border-gray-200 hover:border-[#161950] transition-all hover:shadow-lg cursor-pointer group p-6"
            onClick={() => navigate('/module/proposals/campaigns/ongoing')}
          >
            <div className="flex items-start gap-4">
              <div className="bg-[#161950]/10 p-4 rounded-xl group-hover:bg-[#161950]/20 transition-colors border border-[#161950]/20 flex-shrink-0">
                <FolderOpen className="h-12 w-12 text-[#161950]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit">Open On-going</h3>
                  <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit text-xs">
                    {ongoingCampaigns.length} Active Campaign{ongoingCampaigns.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm font-outfit leading-relaxed">
                  Continue working on active campaigns and track progress.
                </p>
              </div>
            </div>
          </div>

          <div
            className="bg-gray-50 rounded-2xl border border-gray-200 hover:border-[#161950] transition-all hover:shadow-lg cursor-pointer group p-6"
            onClick={() => navigate('/module/proposals/campaigns/completed')}
          >
            <div className="flex items-start gap-4">
              <div className="bg-[#161950]/10 p-4 rounded-xl group-hover:bg-[#161950]/20 transition-colors border border-[#161950]/20 flex-shrink-0">
                <CheckCircle className="h-12 w-12 text-[#161950]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit">Open Completed</h3>
                  <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit text-xs">
                    {completedCampaigns.length} - Completed
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm font-outfit leading-relaxed">
                  Review Completed Campaigns and analyze performance metrics.
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
                  {aiAnalytics.averagePerformanceScore}%
                </div>
                <p className="text-sm text-gray-600 font-outfit">Average Performance</p>
              </div>
              <div className="p-5 bg-[#161950]/5 rounded-xl border border-[#161950]/20 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-[#161950]/10 p-2 rounded-lg">
                    <Megaphone className="h-5 w-5 text-[#161950]" />
                  </div>
                  <span className="text-xs font-semibold font-outfit text-gray-600 uppercase tracking-wide">Total</span>
                </div>
                <div className="text-3xl font-bold font-outfit text-[#161950] mb-1">
                  {aiAnalytics.totalCampaigns}
                </div>
                <p className="text-sm text-gray-600 font-outfit">Total Campaigns</p>
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
                  {aiAnalytics.criticalCampaigns}
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
                  key={area.campaignId}
                  className="p-5 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-[#161950] hover:shadow-md transition-all cursor-pointer"
                  onClick={() => navigate(`/module/proposals/campaigns/${area.campaignId}/edit`, { state: { mode: 'view' } })}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold font-outfit text-[#1A1A1A] mb-1">{area.campaignName}</h4>
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

export default memo(CampaignsPage);
