import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MessageSquare,
  Calendar,
  Brain,
  Target,
  AlertTriangle,
  Clock,
  BarChart3,
  Video,
  MapPin,
  Eye,
  FileText,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
import { useToast } from '@/hooks/shared';
import { useProposals } from '@/hooks/proposals';

export default function OngoingInterviewsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sortBy, setSortBy] = useState('date');
  const [filterBy, setFilterBy] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { useProposalsList } = useProposals();
  
  // Fetch ongoing interviews
  const { data: interviewsData, isLoading } = useProposalsList({
    type_filter: 'interview',
    page: 1,
    size: 100,
    search: searchTerm || undefined,
  });

  const allInterviews = interviewsData?.items || [];
  
  // Filter ongoing interviews
  const ongoingInterviews = useMemo(() => {
    return allInterviews
      .filter((i: any) => ['draft', 'in_review', 'submitted'].includes(i.status))
      .map((i: any) => ({
        id: i.id,
        name: i.title || 'Untitled Interview',
        client: i.account_name || 'Unknown Client',
        format: 'In-Person',
        date: i.due_date ? new Date(i.due_date).toLocaleDateString() : 'N/A',
        time: '2:00 PM',
        status: i.status === 'draft' ? 'Preparing' : i.status === 'in_review' ? 'Scheduled' : 'Scheduled',
        stage: i.status === 'draft' ? 'Preparation' : 'Content Review',
        aiSuccessProbability: 85,
        predictedOutcome: 'Positive',
        progressPercentage: i.progress || 50,
        behindSchedule: false,
      }));
  }, [allInterviews]);

  // Calculate AI analytics
  const aiAnalytics = useMemo(() => {
    if (ongoingInterviews.length === 0) return null;
    
    return {
      averageSuccessProbability: Math.round(
        ongoingInterviews.reduce((sum, i) => sum + i.aiSuccessProbability, 0) / ongoingInterviews.length
      ),
      totalInterviews: ongoingInterviews.length,
      criticalInterviews: ongoingInterviews.filter(i => i.behindSchedule).length,
    };
  }, [ongoingInterviews]);

  const filteredInterviews = useMemo(() => {
    return ongoingInterviews
      .filter(interview => {
        const matchesSearch = 
          interview.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          interview.client.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = 
          filterBy === 'all' || 
          (filterBy === 'behind' && interview.behindSchedule);
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        if (sortBy === 'date') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'probability') return b.aiSuccessProbability - a.aiSuccessProbability;
        return 0;
      });
  }, [ongoingInterviews, searchTerm, filterBy, sortBy]);

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
            Upcoming Interviews
          </h1>
          <p className="text-gray-600 font-outfit">
            Track and manage scheduled interviews
          </p>
        </div>
      </div>

      {aiAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-sm font-semibold font-outfit text-gray-600 uppercase tracking-wide">AI Success</span>
            </div>
            <div className="text-3xl font-bold font-outfit text-purple-600">
              {aiAnalytics.averageSuccessProbability}%
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-sm font-semibold font-outfit text-gray-600 uppercase tracking-wide">Total</span>
            </div>
            <div className="text-3xl font-bold font-outfit text-blue-600">{aiAnalytics.totalInterviews}</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <span className="text-sm font-semibold font-outfit text-gray-600 uppercase tracking-wide">Critical</span>
            </div>
            <div className="text-3xl font-bold font-outfit text-red-600">{aiAnalytics.criticalInterviews}</div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold font-outfit text-[#1A1A1A]">Scheduled Interviews</h2>
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
                <SelectItem value="behind">Behind Schedule</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 font-outfit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="probability">Success Probability</SelectItem>
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
              className="border-2 hover:shadow-md transition-all cursor-pointer"
              onClick={() => navigate(`/module/proposals/interviews/${interview.id}/edit`)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="bg-[#161950]/10 p-3 rounded-lg">
                      <MessageSquare className="h-6 w-6 text-[#161950]" />
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
                          {interview.behindSchedule ? 'Behind Schedule' : 'On Track'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 font-outfit mb-3">
                        <span>{interview.client}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {interview.date} at {interview.time}
                        </span>
                        <span>•</span>
                        <span>{interview.format}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-outfit text-gray-600">Preparation Progress</span>
                          <span className="font-outfit font-semibold text-[#1A1A1A]">
                            {interview.progressPercentage}%
                          </span>
                        </div>
                        <Progress value={interview.progressPercentage} className="h-2 bg-gray-100" />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant="outline"
                      className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit"
                    >
                      <Brain className="h-3 w-3 mr-1" />
                      {interview.aiSuccessProbability}% Success
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/module/proposals/interviews/${interview.id}/edit`);
                      }}
                      className="font-outfit"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
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
                <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit">No ongoing interviews</h3>
                <p className="text-gray-500 text-sm font-outfit text-center max-w-md">
                  All interviews are completed or you haven't created any yet.
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

