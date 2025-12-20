import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Brain,
  Filter,
  CheckCircle,
  XCircle,
  TrendingUp,
  PieChart,
  BarChart3,
  FileText,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

export default function CompletedProposalsPage() {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('completedDate');
  const [filterBy, setFilterBy] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { useProposalsList } = useProposals();
  
  // Fetch completed proposals (won, lost, archived)
  const { data: proposalsData, isLoading } = useProposalsList({
    type_filter: 'proposal',
    page: 1,
    size: 100,
    search: searchTerm || undefined,
  });

  const allProposals = proposalsData?.items || [];
  
  // Filter completed proposals
  const completedProposals = useMemo(() => {
    return allProposals
      .filter((p: any) => ['won', 'lost', 'archived'].includes(p.status))
      .map((p: any) => ({
        id: p.id,
        name: p.title || 'Untitled Proposal',
        client: p.account_name || 'Unknown Client',
        value: p.total_value ? `$${(p.total_value / 1000000).toFixed(1)}M` : '$0',
        completedDate: p.submission_date || p.won_at || p.lost_at ? new Date(p.submission_date || p.won_at || p.lost_at).toLocaleDateString() : 'N/A',
        status: p.status === 'won' ? 'Won' : 'Lost',
        finalWinProbability: p.ai_win_probability || 70,
        actualScore: p.ai_compliance_score || 85,
        aiAccuracy: 85,
        lessonLearned: 'Proposal completed',
      }));
  }, [allProposals]);

  const filteredProposals = useMemo(() => {
    return completedProposals
      .filter(proposal => {
        const matchesSearch = 
          proposal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          proposal.client.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = 
          filterBy === 'all' || 
          (filterBy === 'won' && proposal.status === 'Won') ||
          (filterBy === 'lost' && proposal.status === 'Lost');
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        if (sortBy === 'completedDate') return new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime();
        if (sortBy === 'value') {
          const aVal = parseFloat(a.value.replace(/[$M,K]/g, ''));
          const bVal = parseFloat(b.value.replace(/[$M,K]/g, ''));
          return bVal - aVal;
        }
        if (sortBy === 'aiAccuracy') return b.aiAccuracy - a.aiAccuracy;
        return 0;
      });
  }, [completedProposals, searchTerm, filterBy, sortBy]);

  const wonProposals = useMemo(() => completedProposals.filter(p => p.status === 'Won').length, [completedProposals]);
  const totalValue = useMemo(() => completedProposals.reduce((sum, p) => {
    const value = parseFloat(p.value.replace(/[$M,K]/g, ''));
    const multiplier = p.value.includes('M') ? 1000000 : 1000;
    return sum + (value * multiplier);
  }, 0), [completedProposals]);
  const avgAccuracy = useMemo(() => completedProposals.length > 0 ? Math.round(completedProposals.reduce((sum, p) => sum + p.aiAccuracy, 0) / completedProposals.length) : 0, [completedProposals]);
  const winRate = useMemo(() => completedProposals.length > 0 ? Math.round((wonProposals / completedProposals.length) * 100) : 0, [completedProposals, wonProposals]);

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
              <CheckCircle className="h-8 w-8 text-[#161950]" />
              Completed Proposals Analysis
            </h2>
            <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit">
              <Brain className="h-3 w-3 mr-1" />
              AI Enhanced
            </Badge>
          </div>
          <p className="text-lg text-slate-600">
            Review completed proposals and analyze performance metrics with AI insights
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
            <div className="text-3xl font-bold font-outfit text-[#161950] mb-2">{winRate}%</div>
            <p className="text-sm text-gray-600 font-outfit">Win Rate</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
            <div className="text-3xl font-bold font-outfit text-[#161950] mb-2">
              ${(totalValue / 1000000).toFixed(1)}M
            </div>
            <p className="text-sm text-gray-600 font-outfit">Total Value</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
            <div className="text-3xl font-bold font-outfit text-[#161950] mb-2">{avgAccuracy}%</div>
            <p className="text-sm text-gray-600 font-outfit">AI Accuracy</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
            <div className="text-3xl font-bold font-outfit text-[#161950] mb-2">{completedProposals.length}</div>
            <p className="text-sm text-gray-600 font-outfit">Total Completed</p>
          </div>
        </div>

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
                <SelectItem value="won">Won</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completedDate">Sort by Date</SelectItem>
                <SelectItem value="value">Sort by Value</SelectItem>
                <SelectItem value="aiAccuracy">Sort by AI Accuracy</SelectItem>
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
            <div key={proposal.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-lg">{proposal.name}</h4>
                      <Badge 
                        variant="outline" 
                        className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit"
                      >
                        {proposal.status === 'Won' ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {proposal.status}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-3">{proposal.client}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Value</p>
                        <p className="font-semibold">{proposal.value}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Completed</p>
                        <p className="font-semibold">{proposal.completedDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">AI Predicted</p>
                        <p className="font-semibold">{proposal.finalWinProbability}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">AI Accuracy</p>
                        <p className="font-semibold text-[#161950]">{proposal.aiAccuracy}%</p>
                      </div>
                    </div>

                    <div className="p-4 bg-[#161950]/5 border border-[#161950]/20 rounded-lg">
                      <p className="text-sm font-medium text-[#1A1A1A] mb-1 font-outfit">Lesson Learned:</p>
                      <p className="text-sm text-gray-600 font-outfit">{proposal.lessonLearned}</p>
                    </div>
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
                <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit">No completed proposals</h3>
                <p className="text-gray-500 text-sm font-outfit text-center max-w-md">
                  No proposals have been completed yet.
                </p>
              </div>
            </div>
          )}
        </div>

        {filteredProposals.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
            <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold font-outfit text-[#1A1A1A] mb-2">No completed proposals</h3>
            <p className="text-gray-500 mb-4 font-outfit">No proposals match your filters or no proposals have been completed yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

