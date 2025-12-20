import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MessageSquare,
  Calendar,
  Brain,
  CheckCircle,
  TrendingUp,
  BarChart3,
  Eye,
  FileText,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
import { useToast } from '@/hooks/shared';
import { useProposals } from '@/hooks/proposals';

export default function CompletedInterviewsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sortBy, setSortBy] = useState('completedDate');
  const [filterBy, setFilterBy] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { useProposalsList } = useProposals();
  
  // Fetch completed interviews
  const { data: interviewsData, isLoading } = useProposalsList({
    type_filter: 'interview',
    page: 1,
    size: 100,
    search: searchTerm || undefined,
  });

  const allInterviews = interviewsData?.items || [];
  
  // Filter completed interviews
  const completedInterviews = useMemo(() => {
    return allInterviews
      .filter((i: any) => ['won', 'lost', 'archived'].includes(i.status))
      .map((i: any) => ({
        id: i.id,
        name: i.title || 'Untitled Interview',
        client: i.account_name || 'Unknown Client',
        format: 'In-Person',
        completedDate: i.submission_date ? new Date(i.submission_date).toLocaleDateString() : 'N/A',
        status: i.status === 'won' ? 'Successful' : 'Unsuccessful',
        outcome: i.status === 'won' ? 'Project Awarded' : 'Completed',
        finalSuccessProbability: 88,
        actualScore: i.ai_compliance_score || 85,
        aiAccuracy: 90,
      }));
  }, [allInterviews]);

  const filteredInterviews = useMemo(() => {
    return completedInterviews
      .filter(interview => {
        const matchesSearch = 
          interview.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          interview.client.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = 
          filterBy === 'all' || 
          (filterBy === 'successful' && interview.status === 'Successful') ||
          (filterBy === 'unsuccessful' && interview.status === 'Unsuccessful');
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        if (sortBy === 'completedDate') return new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime();
        if (sortBy === 'score') return b.actualScore - a.actualScore;
        if (sortBy === 'accuracy') return b.aiAccuracy - a.aiAccuracy;
        return 0;
      });
  }, [completedInterviews, searchTerm, filterBy, sortBy]);

  const successfulInterviews = useMemo(() => completedInterviews.filter(i => i.status === 'Successful').length, [completedInterviews]);
  const avgScore = useMemo(() => completedInterviews.length > 0 ? Math.round(completedInterviews.reduce((sum, i) => sum + i.actualScore, 0) / completedInterviews.length) : 0, [completedInterviews]);
  const avgAccuracy = useMemo(() => completedInterviews.length > 0 ? Math.round(completedInterviews.reduce((sum, i) => sum + i.aiAccuracy, 0) / completedInterviews.length) : 0, [completedInterviews]);

  return (
    <div className="w-full h-full bg-white font-outfit">
      <div className="flex flex-col w-full p-6 gap-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/module/proposals/interviews')}
          className="font-outfit"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-outfit text-[#1A1A1A] mb-2 flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-[#161950]" />
            Completed Interviews
          </h1>
          <p className="text-gray-600 font-outfit">
            Review completed interviews and outcomes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-[#161950]/10 p-2 rounded-lg">
              <CheckCircle className="h-5 w-5 text-[#161950]" />
            </div>
            <span className="text-sm font-semibold font-outfit text-gray-600 uppercase tracking-wide">Successful</span>
          </div>
          <div className="text-3xl font-bold font-outfit text-[#161950]">{successfulInterviews}</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-[#161950]/10 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-[#161950]" />
            </div>
            <span className="text-sm font-semibold font-outfit text-gray-600 uppercase tracking-wide">Avg Score</span>
          </div>
          <div className="text-3xl font-bold font-outfit text-[#161950]">{avgScore}%</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-[#161950]/10 p-2 rounded-lg">
              <Brain className="h-5 w-5 text-[#161950]" />
            </div>
            <span className="text-sm font-semibold font-outfit text-gray-600 uppercase tracking-wide">AI Accuracy</span>
          </div>
          <div className="text-3xl font-bold font-outfit text-[#161950]">{avgAccuracy}%</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold font-outfit text-[#1A1A1A]">Completed Interviews</h2>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search interviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 font-outfit"
            />
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-40 font-outfit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="successful">Successful</SelectItem>
                <SelectItem value="unsuccessful">Unsuccessful</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 font-outfit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completedDate">Date</SelectItem>
                <SelectItem value="score">Score</SelectItem>
                <SelectItem value="accuracy">AI Accuracy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#161950] mx-auto mb-4"></div>
                <p className="text-gray-600">Loading interviews...</p>
              </div>
            </div>
          ) : filteredInterviews.length > 0 ? (
            filteredInterviews.map((interview) => (
              <Card
                key={interview.id}
                className="border-2 hover:shadow-md transition-all"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="bg-[#161950]/10 p-3 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-[#161950]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold font-outfit text-[#1A1A1A]">
                            {interview.name}
                          </h3>
                          <Badge
                            variant="outline"
                            className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit"
                          >
                            {interview.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 font-outfit mb-3">
                          <span>{interview.client}</span>
                          <span>•</span>
                          <span>Completed: {interview.completedDate}</span>
                          <span>•</span>
                          <span>{interview.format}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm font-outfit">
                          <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4 text-[#161950]" />
                            <span className="text-gray-600">Score: </span>
                            <span className="font-semibold text-[#1A1A1A]">{interview.actualScore}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">Outcome: </span>
                            <span className="font-semibold text-[#1A1A1A]">{interview.outcome}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">AI Accuracy: </span>
                            <span className="font-semibold text-[#1A1A1A]">{interview.aiAccuracy}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/module/proposals/interviews/${interview.id}/view`)}
                        className="font-outfit"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="p-4 bg-gray-50 rounded-full">
                <FileText className="w-12 h-12 text-gray-400" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit">No completed interviews</h3>
                <p className="text-gray-500 text-sm font-outfit text-center max-w-md">
                  No interviews have been completed yet.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

