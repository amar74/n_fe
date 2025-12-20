import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Book,
  Calendar,
  Brain,
  CheckCircle,
  XCircle,
  TrendingUp,
  BarChart3,
  Download,
  Eye,
  Share2,
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
import { useToast } from '@/hooks/shared';
import { useProposals } from '@/hooks/proposals';

export default function CompletedBrochuresPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sortBy, setSortBy] = useState('completedDate');
  const [filterBy, setFilterBy] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { useProposalsList } = useProposals();
  
  // Fetch completed brochures
  const { data: brochuresData, isLoading } = useProposalsList({
    type_filter: 'brochure',
    page: 1,
    size: 100,
    search: searchTerm || undefined,
  });

  const allBrochures = brochuresData?.items || [];
  
  // Filter completed brochures
  const completedBrochures = useMemo(() => {
    return allBrochures
      .filter((b: any) => ['won', 'lost', 'archived'].includes(b.status))
      .map((b: any) => ({
        id: b.id,
        name: b.title || 'Untitled Brochure',
        client: b.account_name || 'Unknown Client',
        template: 'Corporate Clean',
        completedDate: b.submission_date ? new Date(b.submission_date).toLocaleDateString() : 'N/A',
        status: b.status === 'won' ? 'Published' : 'Completed',
        finalScore: b.ai_compliance_score || 85,
        distribution: 'Digital',
        views: 0,
      }));
  }, [allBrochures]);

  const filteredBrochures = useMemo(() => {
    return completedBrochures
      .filter(brochure => {
        const matchesSearch = 
          brochure.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          brochure.client.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = 
          filterBy === 'all' || 
          (filterBy === 'completed' && brochure.status === 'Completed') ||
          (filterBy === 'published' && brochure.status === 'Published');
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        if (sortBy === 'completedDate') return new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime();
        if (sortBy === 'score') return b.finalScore - a.finalScore;
        if (sortBy === 'views') return b.views - a.views;
        return 0;
      });
  }, [completedBrochures, searchTerm, filterBy, sortBy]);

  const totalBrochures = useMemo(() => completedBrochures.length, [completedBrochures]);
  const publishedBrochures = useMemo(() => completedBrochures.filter(b => b.status === 'Published').length, [completedBrochures]);
  const avgScore = useMemo(() => completedBrochures.length > 0 ? Math.round(completedBrochures.reduce((sum, b) => sum + b.finalScore, 0) / completedBrochures.length) : 0, [completedBrochures]);
  const totalViews = useMemo(() => completedBrochures.reduce((sum, b) => sum + b.views, 0), [completedBrochures]);

  return (
    <div className="w-full h-full bg-white font-outfit">
      <div className="flex flex-col w-full p-6 gap-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/module/proposals/brochures')}
          className="font-outfit"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-outfit text-[#1A1A1A] mb-2 flex items-center gap-2">
            <Book className="h-8 w-8 text-[#161950]" />
            Completed Brochures
          </h1>
          <p className="text-gray-600 font-outfit">
            Review completed brochures and performance analytics
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-[#161950]/10 p-2 rounded-lg">
              <Book className="h-5 w-5 text-[#161950]" />
            </div>
            <span className="text-sm font-semibold font-outfit text-gray-600 uppercase tracking-wide">Total</span>
          </div>
          <div className="text-3xl font-bold font-outfit text-[#1A1A1A]">{totalBrochures}</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-[#161950]/10 p-2 rounded-lg">
              <CheckCircle className="h-5 w-5 text-[#161950]" />
            </div>
            <span className="text-sm font-semibold font-outfit text-gray-600 uppercase tracking-wide">Published</span>
          </div>
          <div className="text-3xl font-bold font-outfit text-[#161950]">{publishedBrochures}</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-[#161950]/10 p-2 rounded-lg">
              <Brain className="h-5 w-5 text-[#161950]" />
            </div>
            <span className="text-sm font-semibold font-outfit text-gray-600 uppercase tracking-wide">Avg Score</span>
          </div>
          <div className="text-3xl font-bold font-outfit text-[#161950]">{avgScore}%</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-[#161950]/10 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-[#161950]" />
            </div>
            <span className="text-sm font-semibold font-outfit text-gray-600 uppercase tracking-wide">Total Views</span>
          </div>
          <div className="text-3xl font-bold font-outfit text-[#161950]">{totalViews.toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold font-outfit text-[#1A1A1A]">Completed Brochures</h2>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search brochures..."
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
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 font-outfit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completedDate">Date</SelectItem>
                <SelectItem value="score">Score</SelectItem>
                <SelectItem value="views">Views</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#161950] mx-auto mb-4"></div>
                <p className="text-gray-600">Loading brochures...</p>
              </div>
            </div>
          ) : filteredBrochures.length > 0 ? (
            filteredBrochures.map((brochure) => (
            <div
              key={brochure.id}
              className="bg-white rounded-2xl border-2 border-gray-200 hover:border-[#161950] hover:shadow-lg transition-all p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="bg-[#161950]/10 p-4 rounded-xl border border-[#161950]/20">
                    <CheckCircle className="h-7 w-7 text-[#161950]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold font-outfit text-[#1A1A1A]">
                        {brochure.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit"
                      >
                        {brochure.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 font-outfit mb-4">
                      <span className="flex items-center gap-1">
                        <span className="font-semibold text-[#1A1A1A]">Client:</span> {brochure.client}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span className="font-semibold text-[#1A1A1A]">Template:</span> {brochure.template}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Completed: {brochure.completedDate}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#161950]/10 p-2 rounded-lg">
                          <Brain className="h-5 w-5 text-[#161950]" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-outfit">AI Score</p>
                          <p className="text-sm font-semibold font-outfit text-[#1A1A1A]">
                            {brochure.finalScore}%
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-[#161950]/10 p-2 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-[#161950]" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-outfit">Total Views</p>
                          <p className="text-sm font-semibold font-outfit text-[#1A1A1A]">
                            {brochure.views.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-[#161950]/10 p-2 rounded-lg">
                          <Share2 className="h-5 w-5 text-[#161950]" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-outfit">Distribution</p>
                          <p className="text-sm font-semibold font-outfit text-[#1A1A1A]">
                            {brochure.distribution}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/module/proposals/brochures/${brochure.id}/view`)}
                    className="font-outfit border-[#161950] text-[#161950] hover:bg-[#161950] hover:text-white"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info('Downloading brochure...')}
                    className="font-outfit border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
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
                <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit">No completed brochures</h3>
                <p className="text-gray-500 text-sm font-outfit text-center max-w-md">
                  No brochures have been completed yet.
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

