import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/shared';
import { useProposals } from '@/hooks/proposals';
import { apiClient } from '@/services/api/client';
import {
  ProposalHeader,
  ProposalProgressSteps,
  ProposalProgressCard,
  ProposalTabs,
} from '../components';

export default function ProposalEditorPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { useProposal, createProposal, updateProposal, isCreating, isUpdating } = useProposals();
  const [activeTab, setActiveTab] = useState('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [completedTabs, setCompletedTabs] = useState<Set<string>>(new Set());
  const [proposalData, setProposalData] = useState({
    name: id === 'create' ? 'New Proposal' : '',
    client: id === 'create' ? '' : '',
    value: id === 'create' ? '' : '',
    dueDate: id === 'create' ? '' : '',
    stage: 'draft',
    progress: 15,
  });

  // Get opportunity and account IDs from query params if creating new
  const opportunityId = searchParams.get('opportunityId');
  const accountId = searchParams.get('accountId');

  // Fetch proposal if editing
  const { data: proposal, isLoading: isLoadingProposal } = useProposal(id && id !== 'create' ? id : undefined, id !== 'create');

  // Load proposal data when proposal is fetched
  useEffect(() => {
    if (proposal && id && id !== 'create') {
      setProposalData({
        name: proposal.title || 'Untitled Proposal',
        client: proposal.account_name || '',
        value: proposal.total_value ? `$${proposal.total_value.toLocaleString()}` : '',
        dueDate: proposal.due_date || proposal.submission_date || '',
        stage: proposal.status || 'draft',
        progress: proposal.progress || 15,
      });
    }
  }, [proposal, id]);

  // Load opportunity data when creating new proposal
  useEffect(() => {
    if (id === 'create' && opportunityId) {
      const fetchOpportunity = async () => {
        setIsLoading(true);
        try {
          const response = await apiClient.get(`/opportunities/${opportunityId}`);
          const opportunity = response.data;
          setProposalData(prev => ({
            ...prev,
            name: opportunity.title || opportunity.opportunity_name || 'New Proposal',
            client: opportunity.account_name || opportunity.client_name || '',
            value: opportunity.estimated_value ? `$${opportunity.estimated_value.toLocaleString()}` : '',
            dueDate: opportunity.submission_deadline || opportunity.due_date || '',
          }));
        } catch (error: any) {
          console.error('Error fetching opportunity:', error);
          toast.error(error.response?.data?.detail || 'Failed to load opportunity data');
        } finally {
          setIsLoading(false);
        }
      };
      fetchOpportunity();
    }
  }, [id, opportunityId, toast]);

  const handleCreateProposal = async (): Promise<string | null> => {
    if (id && id !== 'create') {
      return id; // Already exists
    }
    
    try {
      setIsLoading(true);
      const numericValue = proposalData.value ? parseFloat(proposalData.value.replace(/[^0-9.]/g, '')) : null;
      const dueDate = proposalData.dueDate ? new Date(proposalData.dueDate).toISOString().split('T')[0] : null;
      
      // Ensure numericValue is a valid number or undefined (not NaN or null)
      const totalValue = (numericValue && !isNaN(numericValue)) ? numericValue : undefined;
      
      const proposalPayload: any = {
        title: proposalData.name || 'New Proposal',
        proposal_type: 'proposal',
        currency: 'USD',
      };
      
      // Only include optional fields if they have values
      if (opportunityId) proposalPayload.opportunity_id = opportunityId;
      if (accountId) proposalPayload.account_id = accountId;
      if (totalValue !== undefined) proposalPayload.total_value = totalValue;
      if (dueDate) proposalPayload.due_date = dueDate;
      
      console.log('Creating proposal with payload:', proposalPayload);
      
      const newProposal = await createProposal(proposalPayload);
      
      // Navigate to edit page with new proposal ID
      navigate(`/proposals/${newProposal.id}/edit`, { replace: true });
      toast.success('Proposal created successfully');
      return newProposal.id;
    } catch (error: any) {
      console.error('Error creating proposal:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to create proposal';
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id || id === 'create') {
      // Create new proposal
      await handleCreateProposal();
      return;
    }

    // Update existing proposal
    try {
      setIsLoading(true);
      const numericValue = proposalData.value ? parseFloat(proposalData.value.replace(/[^0-9.]/g, '')) : null;
      const dueDate = proposalData.dueDate ? new Date(proposalData.dueDate).toISOString().split('T')[0] : null;
      
      await updateProposal({
        id,
        data: {
          title: proposalData.name,
          total_value: numericValue,
          due_date: dueDate,
        },
      });
    } catch (error: any) {
      console.error('Error saving proposal:', error);
      toast.error(error.response?.data?.detail || 'Failed to save proposal');
    } finally {
      setIsLoading(false);
    }
  };

  // Update progress based on active tab
  const getProgress = () => {
    const tabProgress = {
      upload: 15,
      plan: 35,
      detail: 60,
      layout: 85,
      schedule: 100,
    };
    return tabProgress[activeTab as keyof typeof tabProgress] || 15;
  };

  // Handle tab change with validation
  const handleTabChange = (tab: string) => {
    const tabOrder = ['upload', 'plan', 'detail', 'layout', 'schedule'];
    const currentIndex = tabOrder.indexOf(activeTab);
    const targetIndex = tabOrder.indexOf(tab);

    // Allow going back to previous tabs
    if (targetIndex <= currentIndex) {
      setActiveTab(tab);
      return;
    }

    // Check if previous tabs are completed
    for (let i = 0; i < targetIndex; i++) {
      if (!completedTabs.has(tabOrder[i])) {
        toast.error(`Please complete the ${tabOrder[i]} tab before proceeding.`);
        return;
      }
    }

    setActiveTab(tab);
  };

  // Mark tab as completed
  const markTabCompleted = (tab: string) => {
    setCompletedTabs((prev) => new Set([...prev, tab]));
  };

  // Handle next from Upload tab
  const handleUploadNext = () => {
    markTabCompleted('upload');
    setActiveTab('plan');
    toast.success('Upload tab completed. Moving to Plan tab.');
  };

  // Handle next from Plan tab
  const handlePlanNext = () => {
    markTabCompleted('plan');
    setActiveTab('detail');
    toast.success('Plan tab completed. Moving to Detail/Refine tab.');
  };

  // Handle next from Detail tab
  const handleDetailNext = () => {
    markTabCompleted('detail');
    setActiveTab('layout');
    toast.success('Detail/Refine tab completed. Moving to Layout/Print tab.');
  };

  // Handle next from Layout tab
  const handleLayoutNext = () => {
    markTabCompleted('layout');
    setActiveTab('schedule');
    toast.success('Layout/Print tab completed. Moving to Schedule tab.');
  };

  // Handle next from Schedule tab
  const handleScheduleNext = () => {
    markTabCompleted('schedule');
    toast.success('All tabs completed! Proposal is ready for submission.');
  };

  if ((isLoading || isLoadingProposal) && id && id !== 'create') {
    return (
      <div className="w-full h-full bg-white font-outfit flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#161950] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading proposal data...</p>
        </div>
      </div>
    );
  }

  if (isLoading || isCreating || isUpdating) {
    return (
      <div className="w-full h-full bg-white font-outfit flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#161950] mx-auto mb-4"></div>
          <p className="text-gray-600">{id === 'create' ? 'Creating proposal...' : 'Saving proposal...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white font-outfit">
      <div className="flex flex-col w-full">
        <ProposalHeader
          proposalName={proposalData.name}
          clientName={proposalData.client}
          stage={proposalData.stage}
          onSave={handleSave}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <ProposalProgressSteps currentStep={2} />
            <ProposalProgressCard progress={getProgress()} />
            <ProposalTabs 
              activeTab={activeTab} 
              onTabChange={handleTabChange}
              completedTabs={completedTabs}
              onSave={handleSave}
              onUploadNext={handleUploadNext}
              onPlanNext={handlePlanNext}
              onDetailNext={handleDetailNext}
              onLayoutNext={handleLayoutNext}
              onScheduleNext={handleScheduleNext}
              proposalId={id && id !== 'create' ? id : undefined}
              onCreateProposal={handleCreateProposal}
            />

            {/* AI Assistant Chat (Floating) */}
            <div className="fixed bottom-6 right-6 z-50">
              <Button
                className="rounded-full w-14 h-14 bg-[#161950] hover:bg-[#0f1440] shadow-lg"
                onClick={() =>
                  toast.info("AI Assistant: Chat feature coming soon! AI will help with real-time guidance.")
                }
              >
                <MessageSquare className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

