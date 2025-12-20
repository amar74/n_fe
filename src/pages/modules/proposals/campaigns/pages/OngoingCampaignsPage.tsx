import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Megaphone,
  Calendar,
  Brain,
  Target,
  AlertTriangle,
  Clock,
  BarChart3,
  Activity,
  Eye,
  TrendingUp,
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

export default function OngoingCampaignsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sortBy, setSortBy] = useState('startDate');
  const [filterBy, setFilterBy] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { useProposalsList } = useProposals();
  
  // Fetch ongoing campaigns
  const { data: campaignsData, isLoading } = useProposalsList({
    type_filter: 'campaign',
    page: 1,
    size: 100,
    search: searchTerm || undefined,
  });

  const allCampaigns = campaignsData?.items || [];
  
  // Filter ongoing campaigns
  const ongoingCampaigns = useMemo(() => {
    return allCampaigns
      .filter((c: any) => ['draft', 'in_review', 'submitted'].includes(c.status))
      .map((c: any) => ({
        id: c.id,
        name: c.title || 'Untitled Campaign',
        client: c.account_name || 'Unknown Client',
        type: 'Social Media',
        startDate: c.due_date ? new Date(c.due_date).toLocaleDateString() : 'N/A',
        endDate: c.submission_date ? new Date(c.submission_date).toLocaleDateString() : 'N/A',
        status: c.status === 'draft' ? 'Active' : 'Active',
        stage: c.status === 'draft' ? 'Planning' : 'Execution',
        aiPerformanceScore: 88,
        predictedReach: '125K',
        progressPercentage: c.progress || 50,
        behindSchedule: false,
      }));
  }, [allCampaigns]);

  // Calculate AI analytics
  const aiAnalytics = useMemo(() => {
    if (ongoingCampaigns.length === 0) return null;
    
    return {
      averagePerformanceScore: Math.round(
        ongoingCampaigns.reduce((sum, c) => sum + c.aiPerformanceScore, 0) / ongoingCampaigns.length
      ),
      totalCampaigns: ongoingCampaigns.length,
      criticalCampaigns: ongoingCampaigns.filter(c => c.behindSchedule).length,
    };
  }, [ongoingCampaigns]);

  const filteredCampaigns = useMemo(() => {
    return ongoingCampaigns
      .filter(campaign => {
        const matchesSearch = 
          campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          campaign.client.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = 
          filterBy === 'all' || 
          (filterBy === 'behind' && campaign.behindSchedule);
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        if (sortBy === 'startDate') return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        if (sortBy === 'score') return b.aiPerformanceScore - a.aiPerformanceScore;
        if (sortBy === 'progress') return b.progressPercentage - a.progressPercentage;
        return 0;
      });
  }, [ongoingCampaigns, searchTerm, filterBy, sortBy]);

  return (
    <div className="w-full h-full bg-white font-outfit">
      <div className="flex flex-col w-full p-6 gap-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/module/proposals/campaigns')}
          className="font-outfit"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-outfit text-[#1A1A1A] mb-2 flex items-center gap-2">
            <Megaphone className="h-8 w-8 text-[#161950]" />
            Active Campaigns
          </h1>
          <p className="text-gray-600 font-outfit">
            Manage and monitor active marketing campaigns
          </p>
        </div>
      </div>

      {aiAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-[#161950]/10 p-2 rounded-lg">
                <Brain className="h-5 w-5 text-[#161950]" />
              </div>
              <span className="text-sm font-semibold font-outfit text-gray-600 uppercase tracking-wide">AI Score</span>
            </div>
            <div className="text-3xl font-bold font-outfit text-[#161950]">
              {aiAnalytics.averagePerformanceScore}%
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-[#161950]/10 p-2 rounded-lg">
                <Megaphone className="h-5 w-5 text-[#161950]" />
              </div>
              <span className="text-sm font-semibold font-outfit text-gray-600 uppercase tracking-wide">Total</span>
            </div>
            <div className="text-3xl font-bold font-outfit text-[#161950]">{aiAnalytics.totalCampaigns}</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-[#161950]/10 p-2 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-[#161950]" />
              </div>
              <span className="text-sm font-semibold font-outfit text-gray-600 uppercase tracking-wide">Critical</span>
            </div>
            <div className="text-3xl font-bold font-outfit text-[#161950]">{aiAnalytics.criticalCampaigns}</div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold font-outfit text-[#1A1A1A]">Active Campaigns</h2>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search campaigns..."
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
                <SelectItem value="startDate">Start Date</SelectItem>
                <SelectItem value="score">AI Score</SelectItem>
                <SelectItem value="progress">Progress</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#161950] mx-auto mb-4"></div>
                <p className="text-gray-600">Loading campaigns...</p>
              </div>
            </div>
          ) : filteredCampaigns.length > 0 ? (
            filteredCampaigns.map((campaign) => (
            <Card
              key={campaign.id}
              className="border-2 hover:shadow-md transition-all cursor-pointer"
              onClick={() => navigate(`/module/proposals/campaigns/${campaign.id}/edit`, { state: { mode: 'view', campaign } })}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="bg-[#161950]/10 p-3 rounded-lg">
                      <Megaphone className="h-6 w-6 text-[#161950]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold font-outfit text-[#1A1A1A]">
                          {campaign.name}
                        </h3>
                        <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit">
                          {campaign.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 font-outfit mb-3">
                        <span>{campaign.client}</span>
                        <span>•</span>
                        <span>{campaign.type}</span>
                        <span>•</span>
                        <span>{campaign.startDate} - {campaign.endDate}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-outfit text-gray-600">Progress</span>
                          <span className="font-outfit font-semibold text-[#1A1A1A]">
                            {campaign.progressPercentage}%
                          </span>
                        </div>
                        <Progress value={campaign.progressPercentage} className="h-2 bg-gray-100" />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant="outline"
                      className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit"
                    >
                      <Brain className="h-3 w-3 mr-1" />
                      {campaign.aiPerformanceScore}% AI Score
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-outfit">
                      <TrendingUp className="h-4 w-4" />
                      <span>Predicted Reach: {campaign.predictedReach}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/module/proposals/campaigns/${campaign.id}/edit`, { state: { mode: 'view', campaign } });
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
                <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit">No ongoing campaigns</h3>
                <p className="text-gray-500 text-sm font-outfit text-center max-w-md">
                  All campaigns are completed or you haven't created any yet.
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

