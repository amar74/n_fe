import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Book,
  Calendar,
  Brain,
  Target,
  AlertTriangle,
  Clock,
  BarChart3,
  Activity,
  Filter,
  SortAsc,
  ArrowRight,
  Image,
  Download,
  Eye,
  FileText,
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
import { useToast } from '@/hooks/shared';
import { useProposals } from '@/hooks/proposals';

export default function OngoingBrochuresPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sortBy, setSortBy] = useState('dueDate');
  const [filterBy, setFilterBy] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { useProposalsList } = useProposals();
  
  // Fetch ongoing brochures
  const { data: brochuresData, isLoading } = useProposalsList({
    type_filter: 'brochure',
    page: 1,
    size: 100,
    search: searchTerm || undefined,
  });

  const allBrochures = brochuresData?.items || [];
  
  // Filter ongoing brochures
  const ongoingBrochures = useMemo(() => {
    return allBrochures
      .filter((b: any) => ['draft', 'in_review', 'submitted'].includes(b.status))
      .map((b: any) => ({
        id: b.id,
        name: b.title || 'Untitled Brochure',
        client: b.account_name || 'Unknown Client',
        template: 'Modern Corporate',
        dueDate: b.due_date ? new Date(b.due_date).toLocaleDateString() : 'N/A',
        status: b.status === 'draft' ? 'In Progress' : b.status === 'in_review' ? 'In Review' : 'Submitted',
        stage: b.status === 'draft' ? 'Design' : 'Content Review',
        aiEffectivenessScore: 85,
        predictedCompletion: b.due_date ? new Date(b.due_date).toLocaleDateString() : 'N/A',
        resourceBottleneck: null,
        riskLevel: 'low',
        progressPercentage: b.progress || 50,
        behindSchedule: false,
      }));
  }, [allBrochures]);

  // Calculate AI analytics
  const aiAnalytics = useMemo(() => {
    if (ongoingBrochures.length === 0) return null;
    
    return {
      averageEffectivenessScore: Math.round(
        ongoingBrochures.reduce((sum, b) => sum + b.aiEffectivenessScore, 0) / ongoingBrochures.length
      ),
      totalBrochures: ongoingBrochures.length,
      criticalBrochures: ongoingBrochures.filter(b => b.riskLevel === 'high' || b.behindSchedule).length,
      avgCompletionConfidence: 85,
    };
  }, [ongoingBrochures]);

  const filteredBrochures = useMemo(() => {
    return ongoingBrochures
      .filter(brochure => {
        const matchesSearch = 
          brochure.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          brochure.client.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = 
          filterBy === 'all' || 
          (filterBy === 'risk' && brochure.riskLevel === 'high') ||
          (filterBy === 'behind' && brochure.behindSchedule);
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        if (sortBy === 'dueDate') return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        if (sortBy === 'score') return b.aiEffectivenessScore - a.aiEffectivenessScore;
        if (sortBy === 'progress') return b.progressPercentage - a.progressPercentage;
        return 0;
      });
  }, [ongoingBrochures, searchTerm, filterBy, sortBy]);

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
            Ongoing Brochures
          </h1>
          <p className="text-gray-600 font-outfit">
            Track and manage active brochure development
          </p>
        </div>
      </div>

      {aiAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-[#161950]/10 p-2 rounded-lg">
                <Brain className="h-5 w-5 text-[#161950]" />
              </div>
              <span className="text-sm font-semibold font-outfit text-gray-600 uppercase tracking-wide">AI Score</span>
            </div>
            <div className="text-3xl font-bold font-outfit text-[#161950]">
              {aiAnalytics.averageEffectivenessScore}%
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-[#161950]/10 p-2 rounded-lg">
                <Book className="h-5 w-5 text-[#161950]" />
              </div>
              <span className="text-sm font-semibold font-outfit text-gray-600 uppercase tracking-wide">Total</span>
            </div>
            <div className="text-3xl font-bold font-outfit text-[#161950]">{aiAnalytics.totalBrochures}</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-[#161950]/10 p-2 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-[#161950]" />
              </div>
              <span className="text-sm font-semibold font-outfit text-gray-600 uppercase tracking-wide">Critical</span>
            </div>
            <div className="text-3xl font-bold font-outfit text-[#161950]">{aiAnalytics.criticalBrochures}</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-[#161950]/10 p-2 rounded-lg">
                <Target className="h-5 w-5 text-[#161950]" />
              </div>
              <span className="text-sm font-semibold font-outfit text-gray-600 uppercase tracking-wide">Confidence</span>
            </div>
            <div className="text-3xl font-bold font-outfit text-[#161950]">
              {aiAnalytics.avgCompletionConfidence}%
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold font-outfit text-[#1A1A1A]">Active Brochures</h2>
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
                <SelectItem value="risk">High Risk</SelectItem>
                <SelectItem value="behind">Behind Schedule</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 font-outfit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dueDate">Due Date</SelectItem>
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
                <p className="text-gray-600">Loading brochures...</p>
              </div>
            </div>
          ) : filteredBrochures.length > 0 ? (
            filteredBrochures.map((brochure) => (
            <div
              key={brochure.id}
              className="bg-white rounded-2xl border-2 border-gray-200 hover:border-[#161950] hover:shadow-lg transition-all cursor-pointer p-6"
              onClick={() => navigate(`/module/proposals/brochures/${brochure.id}/edit`, { state: { mode: 'view', brochure } })}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="bg-[#161950]/10 p-4 rounded-xl border border-[#161950]/20">
                    <Book className="h-7 w-7 text-[#161950]" />
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
                        {brochure.riskLevel} risk
                      </Badge>
                      <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit">
                        {brochure.stage}
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
                        Due: {brochure.dueDate}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="font-outfit text-gray-600">Progress</span>
                          <span className="font-outfit font-semibold text-[#1A1A1A]">
                            {brochure.progressPercentage}%
                          </span>
                        </div>
                        <Progress 
                          value={brochure.progressPercentage} 
                          className="h-3 bg-gray-100"
                        />
                      </div>
                      {brochure.resourceBottleneck && (
                        <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                          <span className="text-sm text-[#161950] font-outfit">
                            <span className="font-semibold">Bottleneck:</span> {brochure.resourceBottleneck}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500 font-outfit">
                        <span>Predicted Completion: {brochure.predictedCompletion}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant="outline"
                      className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit"
                    >
                      <Brain className="h-3 w-3 mr-1" />
                      {brochure.aiEffectivenessScore}% AI Score
                    </Badge>
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 font-outfit">
                      {brochure.status}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/module/proposals/brochures/${brochure.id}/edit`, { state: { mode: 'view', brochure } });
                    }}
                    className="font-outfit border-[#161950] text-[#161950] hover:bg-[#161950] hover:text-white"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
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
                <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit">No ongoing brochures</h3>
                <p className="text-gray-500 text-sm font-outfit text-center max-w-md">
                  All brochures are completed or you haven't created any yet.
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

