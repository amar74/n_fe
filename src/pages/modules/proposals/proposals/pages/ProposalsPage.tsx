import { memo, useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
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
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProposals } from '@/hooks/proposals';

function ProposalsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { useProposalsList } = useProposals();
  
  // Fetch all proposals with type_filter for proposals only
  const { data: proposalsData, isLoading } = useProposalsList({
    type_filter: 'proposal',
    page: 1,
    size: 100,
    search: searchTerm || undefined,
  });

  const proposals = proposalsData?.items || [];
  
  // Calculate stats from real data
  const stats = useMemo(() => {
    const total = proposals.length;
    const draft = proposals.filter((p: any) => p.status === 'draft').length;
    const submitted = proposals.filter((p: any) => p.status === 'submitted').length;
    const approved = proposals.filter((p: any) => p.status === 'approved').length;
    const inReview = proposals.filter((p: any) => p.status === 'in_review').length;
    
    return { total, draft, submitted, approved, inReview };
  }, [proposals]);

  // Filter ongoing proposals (draft, in_review, submitted)
  const ongoingProposals = useMemo(() => {
    return proposals
      .filter((p: any) => ['draft', 'in_review', 'submitted'].includes(p.status))
      .map((p: any) => ({
        id: p.id,
        name: p.title || 'Untitled Proposal',
        client: p.account_name || 'Unknown Client',
        value: p.total_value ? `$${(p.total_value / 1000000).toFixed(1)}M` : '$0',
        dueDate: p.due_date ? new Date(p.due_date).toLocaleDateString() : 'N/A',
        status: p.status,
        stage: p.status === 'draft' ? 'Upload' : p.status === 'in_review' ? 'Detail/Refine' : 'Layout/Print',
        aiWinProbability: p.ai_win_probability || 70,
        progressPercentage: p.progress || 15,
        riskLevel: (p.ai_win_probability || 70) < 60 ? 'high' : (p.ai_win_probability || 70) < 75 ? 'medium' : 'low',
      }));
  }, [proposals]);

  // Filter completed proposals (won, lost, archived)
  const completedProposals = useMemo(() => {
    return proposals
      .filter((p: any) => ['won', 'lost', 'archived'].includes(p.status))
      .map((p: any) => ({
        id: p.id,
        name: p.title || 'Untitled Proposal',
        client: p.account_name || 'Unknown Client',
        value: p.total_value ? `$${(p.total_value / 1000000).toFixed(1)}M` : '$0',
        completedDate: p.submission_date ? new Date(p.submission_date).toLocaleDateString() : 'N/A',
        status: p.status,
        finalScore: p.ai_compliance_score || 85,
      }));
  }, [proposals]);

  // Calculate AI analytics from real data
  const aiAnalytics = useMemo(() => {
    if (ongoingProposals.length === 0) return null;
    
    const avgWinProb = Math.round(
      ongoingProposals.reduce((sum, p) => sum + p.aiWinProbability, 0) / ongoingProposals.length
    );
    
    const totalPipelineValue = ongoingProposals.reduce(
      (sum, p) => sum + parseFloat(p.value.replace(/[$M,K]/g, '')) * (p.value.includes('M') ? 1000000 : 1000),
      0
    );
    
    const criticalProposals = ongoingProposals.filter(p => p.riskLevel === 'high').length;
    
    return {
      averageWinProbability: avgWinProb,
      totalPipelineValue,
      criticalProposals,
    };
  }, [ongoingProposals]);

  // Calculate focus areas
  const focusAreas = useMemo(() => {
    return ongoingProposals
      .filter(p => p.riskLevel === 'high' || p.aiWinProbability < 70)
      .map(p => ({
        proposalId: p.id,
        proposalName: p.name,
        priority: p.riskLevel === 'high' ? 'high' : 'medium',
        reason: p.riskLevel === 'high' ? 'High Risk' : 'Low Win Probability',
      }));
  }, [ongoingProposals]);


  return (
    <div className="w-full h-full bg-white font-outfit">
      <div className="flex flex-col w-full p-6 gap-6">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Link to="/" className="text-gray-500 text-sm font-normal font-outfit leading-tight hover:text-gray-900">
                Dashboard
              </Link>
              <span className="text-[#344054] text-sm font-normal font-outfit leading-tight">/</span>
              <span className="text-[#344054] text-sm font-normal font-outfit leading-tight">Proposals</span>
            </div>
            <div className="flex items-center gap-3">
            <h1 className="text-[#1A1A1A] text-3xl font-semibold font-outfit leading-loose">Proposals</h1>
              <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit">
                <Brain className="h-3 w-3 mr-1" />
                AI Enhanced
              </Badge>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Button
              onClick={() => navigate('/proposals/setup')}
              className="h-11 px-5 py-2 bg-[#161950] rounded-lg flex items-center gap-2.5 hover:bg-[#0f1440] transition-all shadow-sm"
            >
              <Plus className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-semibold font-outfit leading-normal">Create Proposal</span>
            </Button>
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/proposals/setup">
            <div className="bg-gray-50 rounded-2xl border border-gray-200 hover:border-[#161950] transition-all hover:shadow-lg cursor-pointer group p-6">
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
                    Start a new proposal with AI-powered assistance and intelligent templates.
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/proposals/ongoing">
            <div className="bg-gray-50 rounded-2xl border border-gray-200 hover:border-[#161950] transition-all hover:shadow-lg cursor-pointer group p-6">
              <div className="flex items-start gap-4">
                <div className="bg-[#161950]/10 p-4 rounded-xl group-hover:bg-[#161950]/20 transition-colors border border-[#161950]/20 flex-shrink-0">
                  <FolderOpen className="h-12 w-12 text-[#161950]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit">Open On-going</h3>
                    <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit text-xs">
                      {ongoingProposals.length} Active Proposal{ongoingProposals.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm font-outfit leading-relaxed">
                    Continue working on active proposals and track progress.
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/proposals/completed">
            <div className="bg-gray-50 rounded-2xl border border-gray-200 hover:border-[#161950] transition-all hover:shadow-lg cursor-pointer group p-6">
              <div className="flex items-start gap-4">
                <div className="bg-[#161950]/10 p-4 rounded-xl group-hover:bg-[#161950]/20 transition-colors border border-[#161950]/20 flex-shrink-0">
                  <CheckCircle className="h-12 w-12 text-[#161950]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit">Open Completed</h3>
                    <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit text-xs">
                      {completedProposals?.length || 0} - Completed
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm font-outfit leading-relaxed">
                    Review Completed Proposals and analyze performance metrics.
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-3">
          <div className="flex-1 bg-white rounded-xl border border-gray-100 p-4 shadow-[0_8px_24px_rgba(22,25,80,0.05)] hover:shadow-md transition-all">
            <div className="flex items-start gap-6 mb-3">
              <div className="bg-[#161950]/10 p-3 rounded-lg border border-[#161950]/15 flex-shrink-0">
                <FileText className="h-5 w-5 text-[#161950]" />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500 font-outfit">Total</div>
                <div className="flex items-baseline gap-3">
                  <div className="text-3xl font-bold font-outfit text-[#161950] leading-tight">{stats.total}</div>
                  <div className="text-sm text-gray-700 font-outfit leading-snug">All proposals</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 font-outfit">
              <span>In review: {stats.inReview}</span>
              <span className="text-[#161950] font-semibold">+1 last 30d</span>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-xl border border-gray-100 p-4 shadow-[0_8px_24px_rgba(22,25,80,0.05)] hover:shadow-md transition-all">
            <div className="flex items-start gap-6 mb-3">
              <div className="bg-[#161950]/10 p-3 rounded-lg border border-[#161950]/15 flex-shrink-0">
                <FileText className="h-5 w-5 text-[#161950]" />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500 font-outfit">Draft</div>
                <div className="flex items-baseline gap-3">
                  <div className="text-3xl font-bold font-outfit text-[#161950] leading-tight">{stats.draft}</div>
                  <div className="text-sm text-gray-700 font-outfit leading-snug">In progress</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 font-outfit">
              <span>Need review</span>
              <span className="text-[#161950] font-semibold">AI ready</span>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-xl border border-gray-100 p-4 shadow-[0_8px_24px_rgba(22,25,80,0.05)] hover:shadow-md transition-all">
            <div className="flex items-start gap-6 mb-3">
              <div className="bg-[#161950]/10 p-3 rounded-lg border border-[#161950]/15 flex-shrink-0">
                <FileText className="h-5 w-5 text-[#161950]" />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500 font-outfit">Submitted</div>
                <div className="flex items-baseline gap-3">
                  <div className="text-3xl font-bold font-outfit text-[#161950] leading-tight">{stats.submitted}</div>
                  <div className="text-sm text-gray-700 font-outfit leading-snug">Awaiting approval</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 font-outfit">
              <span>Review SLA</span>
              <span className="text-[#161950] font-semibold">+1 last 30d</span>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-xl border border-gray-100 p-4 shadow-[0_8px_24px_rgba(22,25,80,0.05)] hover:shadow-md transition-all">
            <div className="flex items-start gap-6 mb-3">
              <div className="bg-[#161950]/10 p-3 rounded-lg border border-[#161950]/15 flex-shrink-0">
                <FileText className="h-5 w-5 text-[#161950]" />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500 font-outfit">Approved</div>
                <div className="flex items-baseline gap-3">
                  <div className="text-3xl font-bold font-outfit text-[#161950] leading-tight">{stats.approved}</div>
                  <div className="text-sm text-gray-700 font-outfit leading-snug">Ready to execute</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 font-outfit">
              <span>Confidence: 85%</span>
              <span className="text-[#161950] font-semibold">+2% vs last</span>
            </div>
          </div>
        </div>

        {/* AI Predictive Analytics */}
        {aiAnalytics && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="h-5 w-5 text-[#161950]" />
              <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit">AI Predictive Analytics</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 bg-[#161950]/5 rounded-xl border border-[#161950]/20 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-[#161950]/10 p-2 rounded-lg">
                    <Brain className="h-5 w-5 text-[#161950]" />
                  </div>
                  <span className="text-xs font-semibold font-outfit text-gray-600 uppercase tracking-wide">Win Prob</span>
                </div>
                <div className="text-3xl font-bold font-outfit text-[#161950] mb-1">
                  {aiAnalytics.averageWinProbability}%
                </div>
                <p className="text-sm text-gray-600 font-outfit">Avg Win Probability</p>
              </div>
              <div className="p-5 bg-[#161950]/5 rounded-xl border border-[#161950]/20 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-[#161950]/10 p-2 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-[#161950]" />
                  </div>
                  <span className="text-xs font-semibold font-outfit text-gray-600 uppercase tracking-wide">Pipeline</span>
                </div>
                <div className="text-3xl font-bold font-outfit text-[#161950] mb-1">
                  ${(aiAnalytics.totalPipelineValue / 1000000).toFixed(1)}M
                </div>
                <p className="text-sm text-gray-600 font-outfit">Pipeline Value</p>
              </div>
              <div className="p-5 bg-[#161950]/5 rounded-xl border border-[#161950]/20 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-[#161950]/10 p-2 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-[#161950]" />
                  </div>
                  <span className="text-xs font-semibold font-outfit text-gray-600 uppercase tracking-wide">Critical</span>
                </div>
                <div className="text-3xl font-bold font-outfit text-[#161950] mb-1">
                  {aiAnalytics.criticalProposals}
                </div>
                <p className="text-sm text-gray-600 font-outfit">Critical Issues</p>
              </div>
              <div className="p-5 bg-[#161950]/5 rounded-xl border border-[#161950]/20 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-[#161950]/10 p-2 rounded-lg">
                    <Target className="h-5 w-5 text-[#161950]" />
                  </div>
                  <span className="text-xs font-semibold font-outfit text-gray-600 uppercase tracking-wide">In Review</span>
                </div>
                <div className="text-3xl font-bold font-outfit text-[#161950] mb-1">
                  {stats.inReview}
                </div>
                <p className="text-sm text-gray-600 font-outfit">In Review</p>
              </div>
            </div>
          </div>
        )}

        {/* AI Focus Areas */}
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
              <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit">
                {focusAreas.length} Issues
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {focusAreas.map((focus) => (
                <div
                  key={focus.proposalId}
                  className="p-5 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-[#161950] hover:shadow-md transition-all cursor-pointer"
                  onClick={() => navigate(`/proposals/${focus.proposalId}/edit`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold font-outfit text-[#1A1A1A] mb-1">{focus.proposalName}</h4>
                      <p className="text-sm text-gray-600 font-outfit">{focus.reason}</p>
                    </div>
                    <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20">
                      {focus.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#161950] font-outfit">
                    <ArrowRight className="h-4 w-4" />
                    <span>Take Action</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Proposals List */}
        <Card className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search proposals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-gray-50 rounded-lg border border-gray-200 text-sm font-outfit focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              />
            </div>
            <button className="h-12 px-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2 hover:bg-gray-100 transition-colors">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 text-sm font-medium font-outfit">Filter</span>
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#161950] mx-auto mb-4"></div>
                <p className="text-gray-600">Loading proposals...</p>
              </div>
            </div>
          ) : ongoingProposals.length > 0 ? (
            <div className="space-y-4">
              {ongoingProposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="bg-white rounded-2xl border border-gray-200 hover:border-[#161950] transition-colors cursor-pointer shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]"
                  onClick={() => navigate(`/proposals/${proposal.id}/edit`)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-lg font-outfit text-[#1A1A1A]">{proposal.name}</h4>
                          <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit">
                            {proposal.riskLevel}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2 font-outfit">{proposal.client}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 font-outfit mb-4">
                          <span>Value: {proposal.value}</span>
                          <span>Due: {proposal.dueDate}</span>
                          <span>Stage: {proposal.stage}</span>
                        </div>
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600 font-outfit">Progress</span>
                            <span className="text-xs font-medium font-outfit">{proposal.progressPercentage}%</span>
                          </div>
                          <Progress value={proposal.progressPercentage} className="h-2" />
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 ml-4">
                        <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit">
                          <Target className="h-3 w-3 mr-1" />
                          {proposal.aiWinProbability}% Win
                        </Badge>
                        <Button variant="ghost" size="sm" className="text-gray-600">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="p-4 bg-gray-50 rounded-full">
                <FileText className="w-12 h-12 text-gray-400" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit">No proposals yet</h3>
              <p className="text-gray-500 text-sm font-outfit text-center max-w-md">
                Create and manage professional proposals for your clients. Track submission status and approvals.
              </p>
            </div>
              <Button
                onClick={() => navigate('/proposals/setup')}
                className="mt-4 h-11 px-6 py-2 bg-[#161950] rounded-lg flex items-center gap-2 hover:bg-[#0f1440] transition-all shadow-sm"
              >
              <Plus className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-semibold font-outfit">Create Your First Proposal</span>
              </Button>
          </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default memo(ProposalsPage);
