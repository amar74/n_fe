import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Calendar,
  DollarSign,
  Brain,
  Target,
  AlertTriangle,
  Clock,
  Zap,
  BarChart3,
  Activity,
  Filter,
  SortAsc,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProposals } from '@/hooks/proposals';

export default function OngoingProposalsPage() {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('dueDate');
  const [filterBy, setFilterBy] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { useProposalsList } = useProposals();
  
  // Fetch ongoing proposals (draft, in_review, submitted)
  const { data: proposalsData, isLoading } = useProposalsList({
    type_filter: 'proposal',
    page: 1,
    size: 100,
    search: searchTerm || undefined,
  });

  const allProposals = proposalsData?.items || [];
  
  // Filter ongoing proposals
  const ongoingProposals = useMemo(() => {
    return allProposals
      .filter((p: any) => ['draft', 'in_review', 'submitted'].includes(p.status))
      .map((p: any) => ({
        id: p.id,
        name: p.title || 'Untitled Proposal',
        client: p.account_name || 'Unknown Client',
        value: p.total_value ? `$${(p.total_value / 1000000).toFixed(1)}M` : '$0',
        dueDate: p.due_date ? new Date(p.due_date).toLocaleDateString() : 'N/A',
        status: p.status === 'draft' ? 'In Progress' : p.status === 'in_review' ? 'In Review' : 'Submitted',
        stage: p.status === 'draft' ? 'Upload' : p.status === 'in_review' ? 'Detail/Refine' : 'Layout/Print',
        aiWinProbability: p.ai_win_probability || 70,
        predictedCompletion: p.due_date ? new Date(p.due_date).toLocaleDateString() : 'N/A',
        resourceBottleneck: null,
        riskLevel: (p.ai_win_probability || 70) < 60 ? 'high' : (p.ai_win_probability || 70) < 75 ? 'medium' : 'low',
        progressPercentage: p.progress || 15,
        behindSchedule: false,
      }));
  }, [allProposals]);

  // Calculate AI analytics
  const aiAnalytics = useMemo(() => {
    if (ongoingProposals.length === 0) return null;
    
    return {
      averageWinProbability: Math.round(
        ongoingProposals.reduce((sum, p) => sum + p.aiWinProbability, 0) / ongoingProposals.length
      ),
      totalPipelineValue: ongoingProposals.reduce(
        (sum, p) => sum + parseFloat(p.value.replace(/[$M,K]/g, '')) * (p.value.includes('M') ? 1000000 : 1000),
        0
      ),
      criticalProposals: ongoingProposals.filter(p => p.riskLevel === 'high' || p.behindSchedule).length,
      avgCompletionConfidence: 82,
    };
  }, [ongoingProposals]);

  const filteredProposals = useMemo(() => {
    return ongoingProposals.filter(proposal => {
      const matchesSearch = 
        proposal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.client.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterBy === 'all' || proposal.status.toLowerCase() === filterBy.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }, [ongoingProposals, searchTerm, filterBy]);

  return (
    <div className="w-full h-full bg-white font-outfit">
      <div className="flex flex-col w-full p-6 gap-6">
        {/* Back Button */}
        <div>
          <Link
            to="/proposals"
            className="inline-flex items-center p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span>Back to Proposals</span>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-bold text-[#1A1A1A] flex items-center gap-3 font-outfit">
              <FileText className="h-8 w-8 text-[#161950]" />
              Ongoing Proposals
            </h2>
            <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit">
              <Brain className="h-3 w-3 mr-1" />
              AI Enhanced
            </Badge>
          </div>
          <p className="text-lg text-slate-600">
            Track and manage your active proposals with AI-powered insights
          </p>
        </div>

        {/* AI Analytics */}
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
                  <span className="text-xs font-semibold font-outfit text-gray-600 uppercase tracking-wide">Confidence</span>
                </div>
                <div className="text-3xl font-bold font-outfit text-[#161950] mb-1">
                  {aiAnalytics.avgCompletionConfidence}%
                </div>
                <p className="text-sm text-gray-600 font-outfit">Completion Confidence</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Input
                placeholder="Search proposals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in progress">In Progress</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="review">Review</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dueDate">Sort by Due Date</SelectItem>
                <SelectItem value="value">Sort by Value</SelectItem>
                <SelectItem value="probability">Sort by Win Probability</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Proposals List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#161950] mx-auto mb-4"></div>
                <p className="text-gray-600">Loading proposals...</p>
              </div>
            </div>
          ) : filteredProposals.length > 0 ? (
            filteredProposals.map((proposal) => (
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
                      {proposal.behindSchedule && (
                        <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Behind Schedule
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3 font-outfit">{proposal.client}</p>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500 mb-4 font-outfit">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium">{proposal.value}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Due: {proposal.dueDate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Stage: {proposal.stage}</span>
                      </div>
                      {proposal.resourceBottleneck && (
                        <div className="flex items-center gap-1 text-orange-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Bottleneck: {proposal.resourceBottleneck}</span>
                        </div>
                      )}
                    </div>

                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600 font-outfit">Progress</span>
                        <span className="text-xs font-medium font-outfit">{proposal.progressPercentage}%</span>
                      </div>
                      <Progress value={proposal.progressPercentage} className="h-2" />
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 ml-6">
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
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="p-4 bg-gray-50 rounded-full">
                <FileText className="w-12 h-12 text-gray-400" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit">No ongoing proposals</h3>
                <p className="text-gray-500 text-sm font-outfit text-center max-w-md">
                  All proposals are completed or you haven't created any yet.
                </p>
              </div>
            </div>
          )}
        </div>

        {filteredProposals.length === 0 && (
          <Card className="border-2">
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No ongoing proposals</h3>
              <p className="text-gray-500 mb-4">All proposals are completed or no proposals match your filters.</p>
              <Button onClick={() => navigate('/proposals/setup')}>
                Create New Proposal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

