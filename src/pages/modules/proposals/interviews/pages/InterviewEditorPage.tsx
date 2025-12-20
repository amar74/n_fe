import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  MessageSquare,
  Save,
  Eye,
  Calendar,
  Clock,
  Video,
  FileText,
  Users,
  Brain,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useToast } from '@/hooks/shared';
import { useProposals } from '@/hooks/proposals';
import { ProposalHeader } from '../../proposals/components/ProposalHeader';
import { ProposalProgressSteps } from '../../proposals/components/ProposalProgressSteps';
import { ProposalProgressCard } from '../../proposals/components/ProposalProgressCard';
import { OverviewTab, PresentationTab, PerformanceTab, FeedbackTab } from '../components';

export default function InterviewEditorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { useProposal, updateProposal, isUpdating } = useProposals();
  const [activeTab, setActiveTab] = useState('overview');
  const [interviewProgress, setInterviewProgress] = useState(70);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch interview data
  const { data: interview, isLoading: isLoadingInterview } = useProposal(id, !!id);
  
  // Load interview data from API
  const [interviewData, setInterviewData] = useState({
    id: id || '',
    name: 'Untitled Interview',
    client: '',
    status: 'draft',
    date: '',
    time: '',
  });

  useEffect(() => {
    if (interview && id) {
      setInterviewData({
        id: interview.id,
        name: interview.title || 'Untitled Interview',
        client: interview.account_name || '',
        status: interview.status || 'draft',
        date: interview.due_date ? new Date(interview.due_date).toLocaleDateString() : '',
        time: '2:00 PM',
      });
      setInterviewProgress(interview.progress || 70);
    } else if (location.state?.interview) {
      setInterviewData(location.state.interview);
    }
  }, [interview, id, location.state]);

  const handleSave = async () => {
    if (!id) {
      toast.error('Interview ID is required');
      return;
    }

    try {
      setIsLoading(true);
      await updateProposal({
        id,
        data: {
          title: interviewData.name,
        },
      });
      toast.success('Interview preparation saved successfully');
    } catch (error: any) {
      console.error('Error saving interview:', error);
      toast.error(error.response?.data?.detail || 'Failed to save interview');
    } finally {
      setIsLoading(false);
    }
  };

  if ((isLoading || isLoadingInterview) && id) {
    return (
      <div className="w-full h-full bg-white font-outfit flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#161950] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interview data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white font-outfit">
      <div className="flex flex-col w-full">
        <ProposalHeader
          proposalName={interviewData.name}
          clientName={interviewData.client}
          stage={interviewData.status}
          onSave={handleSave}
          onBack={() => navigate('/module/proposals/interviews')}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <ProposalProgressSteps currentStep={2} />

            <ProposalProgressCard progress={interviewProgress} />

            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto p-0 gap-1.5 bg-transparent">
            <TabsTrigger
              value="overview"
              className="flex items-center justify-center gap-2 min-h-[50px] whitespace-normal data-[state=active]:bg-[#161950] data-[state=active]:text-white data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-600 font-outfit"
            >
              <FileText className="h-5 w-5" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="presentation"
              className="flex items-center justify-center gap-2 min-h-[50px] whitespace-normal data-[state=active]:bg-[#161950] data-[state=active]:text-white data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-600 font-outfit"
            >
              <Brain className="h-5 w-5" />
              <span>Presentation</span>
            </TabsTrigger>
            <TabsTrigger
              value="performance"
              className="flex items-center justify-center gap-2 min-h-[50px] whitespace-normal data-[state=active]:bg-[#161950] data-[state=active]:text-white data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-600 font-outfit"
            >
              <MessageSquare className="h-5 w-5" />
              <span>Performance</span>
            </TabsTrigger>
            <TabsTrigger
              value="feedback"
              className="flex items-center justify-center gap-2 min-h-[50px] whitespace-normal data-[state=active]:bg-[#161950] data-[state=active]:text-white data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-600 font-outfit"
            >
              <Eye className="h-5 w-5" />
              <span>Feedback</span>
            </TabsTrigger>
          </TabsList>

                <TabsContent value="overview" className="mt-0">
                  <OverviewTab interviewData={interviewData} />
                </TabsContent>

                <TabsContent value="presentation" className="mt-0">
                  <PresentationTab />
                </TabsContent>

                <TabsContent value="performance" className="mt-0">
                  <PerformanceTab />
                </TabsContent>

                <TabsContent value="feedback" className="mt-0">
                  <FeedbackTab interviewDate={interviewData?.date} aiSuccessProbability={85} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

