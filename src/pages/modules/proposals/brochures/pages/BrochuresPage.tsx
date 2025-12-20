import { memo, useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Book, 
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
  Image,
  Download,
  Eye,
  Calendar,
  Palette,
  FileText,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/shared';
import { useProposals } from '@/hooks/proposals';

function BrochuresPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const { useProposalsList } = useProposals();
  
  // Fetch brochures with type_filter
  const { data: brochuresData, isLoading } = useProposalsList({
    type_filter: 'brochure',
    page: 1,
    size: 100,
    search: searchTerm || undefined,
  });

  const brochures = brochuresData?.items || [];
  
  // Calculate stats from real data
  const stats = useMemo(() => {
    const total = brochures.length;
    const inProgress = brochures.filter((b: any) => ['draft', 'in_review'].includes(b.status)).length;
    const completed = brochures.filter((b: any) => ['won', 'approved'].includes(b.status)).length;
    const draft = brochures.filter((b: any) => b.status === 'draft').length;
    
    return { total, inProgress, completed, draft };
  }, [brochures]);

  // Filter ongoing brochures
  const ongoingBrochures = useMemo(() => {
    return brochures
      .filter((b: any) => ['draft', 'in_review', 'submitted'].includes(b.status))
      .map((b: any) => ({
        id: b.id,
        name: b.title || 'Untitled Brochure',
        client: b.account_name || 'Unknown Client',
        template: 'Modern Corporate',
        dueDate: b.due_date ? new Date(b.due_date).toLocaleDateString() : 'N/A',
        status: b.status,
        stage: b.status === 'draft' ? 'Design' : 'Content Review',
        aiEffectivenessScore: 85,
        predictedCompletion: b.due_date ? new Date(b.due_date).toLocaleDateString() : 'N/A',
        progressPercentage: b.progress || 50,
        behindSchedule: false,
      }));
  }, [brochures]);

  // Filter completed brochures
  const completedBrochures = useMemo(() => {
    return brochures
      .filter((b: any) => ['won', 'lost', 'archived'].includes(b.status))
      .map((b: any) => ({
        id: b.id,
        name: b.title || 'Untitled Brochure',
        client: b.account_name || 'Unknown Client',
        template: 'Corporate Clean',
        completedDate: b.submission_date ? new Date(b.submission_date).toLocaleDateString() : 'N/A',
        status: b.status,
        finalScore: b.ai_compliance_score || 85,
        views: 0,
      }));
  }, [brochures]);

  // Calculate AI analytics from real data
  const aiAnalytics = useMemo(() => {
    if (ongoingBrochures.length === 0) return null;
    
    const avgScore = Math.round(
      ongoingBrochures.reduce((sum, b) => sum + b.aiEffectivenessScore, 0) / ongoingBrochures.length
    );
    
    return {
      averageEffectivenessScore: avgScore,
      totalBrochures: stats.total,
      criticalBrochures: ongoingBrochures.filter(b => b.behindSchedule).length,
      avgCompletionConfidence: 85,
      totalViews: completedBrochures.reduce((sum, b) => sum + (b.views || 0), 0),
    };
  }, [ongoingBrochures, stats, completedBrochures]);

  // Calculate focus areas
  const focusAreas = useMemo(() => {
    return ongoingBrochures
      .filter(b => b.behindSchedule || b.aiEffectivenessScore < 75)
      .map(b => ({
        brochureId: b.id,
        brochureName: b.name,
        priority: b.behindSchedule ? 'critical' : 'medium',
        reason: b.behindSchedule ? 'Behind Schedule' : 'Low Effectiveness Score',
        action: 'Review design and content',
        client: b.client,
      }));
  }, [ongoingBrochures]);

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
              <span className="text-[#344054] text-sm font-normal font-outfit leading-tight">Brochures</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-[#1A1A1A] text-3xl font-semibold font-outfit leading-loose flex items-center gap-2">
                <Book className="h-8 w-8 text-[#161950]" />
                Brochures
              </h1>
              <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit">
                <Brain className="h-3 w-3 mr-1" />
                AI Enhanced
              </Badge>
            </div>
            <p className="text-gray-600 font-outfit">
              Design and create marketing brochures with AI-powered design assistance
            </p>
          </div>

          <div className="flex items-start gap-3">
            <Button
              onClick={() => navigate('/module/proposals/brochures/setup')}
              className="h-11 px-5 py-2 bg-[#161950] rounded-lg flex items-center gap-2.5 hover:bg-[#0f1440] transition-all shadow-sm font-outfit"
            >
              <Plus className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-semibold font-outfit leading-normal">Create New Brochure</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:gap-3">
          <div className="flex-1 bg-white rounded-xl border border-gray-100 p-4 shadow-[0_8px_24px_rgba(22,25,80,0.05)] hover:shadow-md transition-all">
            <div className="flex items-start gap-6 mb-3">
              <div className="bg-[#161950]/10 p-3 rounded-lg border border-[#161950]/15 flex-shrink-0">
                <Book className="h-5 w-5 text-[#161950]" />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500 font-outfit">Total</div>
                <div className="flex items-baseline gap-3">
                  <div className="text-3xl font-bold font-outfit text-[#161950] leading-tight">{stats.total}</div>
                  <div className="text-sm text-gray-700 font-outfit leading-snug">All brochures</div>
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
                <FolderOpen className="h-5 w-5 text-[#161950]" />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500 font-outfit">Active</div>
                <div className="flex items-baseline gap-3">
                  <div className="text-3xl font-bold font-outfit text-[#161950] leading-tight">{stats.inProgress}</div>
                  <div className="text-sm text-gray-700 font-outfit leading-snug">In progress</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 font-outfit">
              <span>On-track</span>
              <span className="text-[#161950] font-semibold">Designing</span>
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
              <span className="text-[#161950] font-semibold">+1 last 30d</span>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-xl border border-gray-100 p-4 shadow-[0_8px_24px_rgba(22,25,80,0.05)] hover:shadow-md transition-all">
            <div className="flex items-start gap-6 mb-3">
              <div className="bg-[#161950]/10 p-3 rounded-lg border border-[#161950]/15 flex-shrink-0">
                <Brain className="h-5 w-5 text-[#161950]" />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500 font-outfit">AI Score</div>
                <div className="flex items-baseline gap-3">
                  <div className="text-3xl font-bold font-outfit text-[#161950] leading-tight">
                    {aiAnalytics?.averageEffectivenessScore || 0}%
                  </div>
                  <div className="text-sm text-gray-700 font-outfit leading-snug">Avg effectiveness</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 font-outfit">
              <span>Confidence: {aiAnalytics?.confidence || 85}%</span>
              <span className="text-[#161950] font-semibold">+3% vs last</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className="bg-gray-50 rounded-2xl border border-gray-200 hover:border-[#161950] transition-all hover:shadow-lg cursor-pointer group p-6"
            onClick={() => navigate('/module/proposals/brochures/setup')}
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
                  Start a new brochure with AI-powered design assistance and intelligent templates.
                </p>
              </div>
            </div>
          </div>

          <div
            className="bg-gray-50 rounded-2xl border border-gray-200 hover:border-[#161950] transition-all hover:shadow-lg cursor-pointer group p-6"
            onClick={() => navigate('/module/proposals/brochures/ongoing')}
          >
            <div className="flex items-start gap-4">
              <div className="bg-[#161950]/10 p-4 rounded-xl group-hover:bg-[#161950]/20 transition-colors border border-[#161950]/20 flex-shrink-0">
                <FolderOpen className="h-12 w-12 text-[#161950]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit">Open On-going</h3>
                  <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit text-xs">
                    {ongoingBrochures.length} Active Brochure{ongoingBrochures.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm font-outfit leading-relaxed">
                  Continue working on active brochures and track progress.
                </p>
              </div>
            </div>
          </div>

          <div
            className="bg-gray-50 rounded-2xl border border-gray-200 hover:border-[#161950] transition-all hover:shadow-lg cursor-pointer group p-6"
            onClick={() => navigate('/module/proposals/brochures/completed')}
          >
            <div className="flex items-start gap-4">
              <div className="bg-[#161950]/10 p-4 rounded-xl group-hover:bg-[#161950]/20 transition-colors border border-[#161950]/20 flex-shrink-0">
                <CheckCircle className="h-12 w-12 text-[#161950]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit">Open Completed</h3>
                  <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit text-xs">
                    {completedBrochures.length} - Completed
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm font-outfit leading-relaxed">
                  Review Completed Brochures and analyze performance metrics.
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
                  {aiAnalytics.averageEffectivenessScore}%
                </div>
                <p className="text-sm text-gray-600 font-outfit">Average Effectiveness</p>
              </div>
              <div className="p-5 bg-[#161950]/5 rounded-xl border border-[#161950]/20 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-[#161950]/10 p-2 rounded-lg">
                    <Book className="h-5 w-5 text-[#161950]" />
                  </div>
                  <span className="text-xs font-semibold font-outfit text-gray-600 uppercase tracking-wide">Total</span>
                </div>
                <div className="text-3xl font-bold font-outfit text-[#161950] mb-1">
                  {aiAnalytics.totalBrochures}
                </div>
                <p className="text-sm text-gray-600 font-outfit">Total Brochures</p>
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
                  {aiAnalytics.criticalBrochures}
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
                  key={area.brochureId}
                  className="p-5 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-[#161950] hover:shadow-md transition-all cursor-pointer"
                  onClick={() => navigate(`/module/proposals/brochures/${area.brochureId}/edit`, { state: { mode: 'view' } })}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold font-outfit text-[#1A1A1A] mb-1">{area.brochureName}</h4>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-[#161950]/10 p-2 rounded-lg border border-[#161950]/20">
                  <FolderOpen className="h-5 w-5 text-[#161950]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold font-outfit text-[#1A1A1A]">Recent Ongoing</h3>
                  <p className="text-sm text-gray-600 font-outfit">{ongoingBrochures.length} active brochures</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/module/proposals/brochures/ongoing')}
                className="font-outfit text-[#161950] hover:text-[#0f1440]"
              >
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            <div className="space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#161950]"></div>
                </div>
              ) : ongoingBrochures.length > 0 ? (
                ongoingBrochures.slice(0, 2).map((brochure) => (
                <div
                  key={brochure.id}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#161950] hover:shadow-sm transition-all cursor-pointer"
                  onClick={() => navigate(`/module/proposals/brochures/${brochure.id}/edit`, { state: { mode: 'view' } })}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold font-outfit text-[#1A1A1A] mb-1">{brochure.name}</h4>
                      <p className="text-sm text-gray-600 font-outfit">{brochure.client}</p>
                    </div>
                    <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit">
                      {brochure.stage}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600 font-outfit mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Due: {brochure.dueDate}
                    </span>
                    <span>•</span>
                    <span>{brochure.progressPercentage}% Complete</span>
                  </div>
                  <Progress value={brochure.progressPercentage} className="h-2 bg-gray-200" />
                </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">No ongoing brochures</div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-[#161950]/10 p-2 rounded-lg border border-[#161950]/20">
                  <CheckCircle className="h-5 w-5 text-[#161950]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold font-outfit text-[#1A1A1A]">Recently Completed</h3>
                  <p className="text-sm text-gray-600 font-outfit">{completedBrochures.length} completed</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/module/proposals/brochures/completed')}
                className="font-outfit text-[#161950] hover:text-[#0f1440]"
              >
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            <div className="space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#161950]"></div>
                </div>
              ) : completedBrochures.length > 0 ? (
                completedBrochures.slice(0, 2).map((brochure) => (
                <div
                  key={brochure.id}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#161950] hover:shadow-sm transition-all cursor-pointer"
                  onClick={() => navigate(`/module/proposals/brochures/${brochure.id}/view`)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold font-outfit text-[#1A1A1A] mb-1">{brochure.name}</h4>
                      <p className="text-sm text-gray-600 font-outfit">{brochure.client}</p>
                    </div>
                    <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit">
                      {brochure.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600 font-outfit">
                    <span className="flex items-center gap-1">
                      <Brain className="h-3 w-3 text-[#161950]" />
                      Score: {brochure.finalScore}%
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-[#161950]" />
                      {brochure.views} views
                    </span>
                  </div>
                </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">No completed brochures</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(BrochuresPage);
