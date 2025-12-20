import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, PlaneTakeoff, Edit3, Layout, Calendar } from 'lucide-react';
import UploadTab from '@/pages/modules/proposals/shared/components/proposal/UploadTab';
import PlanTab from '@/pages/modules/proposals/shared/components/proposal/PlanTab';
import DetailRefineTab from '@/pages/modules/proposals/shared/components/proposal/DetailRefineTab';
import LayoutPrintTab from '@/pages/modules/proposals/shared/components/proposal/LayoutPrintTab';
import ScheduleTab from '@/pages/modules/proposals/shared/components/proposal/ScheduleTab';

interface ProposalTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  completedTabs?: Set<string>;
  onSave?: () => void;
  onUploadNext?: () => void;
  onPlanNext?: () => void;
  onDetailNext?: () => void;
  onLayoutNext?: () => void;
  onScheduleNext?: () => void;
  proposalId?: string;
  onCreateProposal?: () => Promise<string | null>;
}

const tabs = [
  {
    id: 'upload',
    label: 'Upload',
    icon: Upload,
  },
  {
    id: 'plan',
    label: 'Plan',
    icon: PlaneTakeoff,
  },
  {
    id: 'detail',
    label: 'Detail/Refine',
    icon: Edit3,
  },
  {
    id: 'layout',
    label: 'Layout/Print',
    icon: Layout,
  },
  {
    id: 'schedule',
    label: 'Schedule',
    icon: Calendar,
  },
];

export function ProposalTabs({ 
  activeTab, 
  onTabChange, 
  completedTabs = new Set(), 
  onSave, 
  onUploadNext, 
  onPlanNext,
  onDetailNext,
  onLayoutNext,
  onScheduleNext,
  proposalId, 
  onCreateProposal 
}: ProposalTabsProps) {
  const tabOrder = ['upload', 'plan', 'detail', 'layout', 'schedule'];
  
  const isTabEnabled = (tabId: string) => {
    const tabIndex = tabOrder.indexOf(tabId);
    if (tabIndex === 0) return true; // Upload is always enabled
    
    // Check if all previous tabs are completed
    for (let i = 0; i < tabIndex; i++) {
      if (!completedTabs.has(tabOrder[i])) {
        return false;
      }
    }
    return true;
  };
  const handleTabClick = (tabId: string) => {
    if (isTabEnabled(tabId)) {
      onTabChange(tabId);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabClick} className="w-full">
      <div className="bg-white rounded-2xl border border-gray-200 p-1.5 mb-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <TabsList className="grid w-full grid-cols-5 bg-transparent gap-1 h-auto p-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const enabled = isTabEnabled(tab.id);
            const completed = completedTabs.has(tab.id);
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                disabled={!enabled}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl transition-all font-outfit ${
                  !enabled
                    ? 'opacity-50 cursor-not-allowed text-gray-400'
                    : completed
                    ? 'data-[state=active]:bg-[#161950] data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900 data-[state=inactive]:hover:bg-gray-50 border border-[#161950]/30'
                    : 'data-[state=active]:bg-[#161950] data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900 data-[state=inactive]:hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm font-medium leading-tight whitespace-nowrap">
                  {tab.label}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>

      {/* Tab Contents */}
      <TabsContent value="upload" className="mt-0 space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <div className="mb-6">
            <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit mb-2 flex items-center gap-2">
              <Upload className="h-5 w-5 text-[#161950]" />
              Upload Documents & Information
            </h3>
            <p className="text-gray-600 text-sm font-outfit">
              Upload RFPs, client documents, and company materials. AI will
              extract and organize information automatically.
            </p>
          </div>
          <UploadTab proposalId={proposalId} onSave={onSave} onNext={onUploadNext} onCreateProposal={onCreateProposal} />
        </div>
      </TabsContent>

      <TabsContent value="plan" className="mt-0 space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <div className="mb-6">
            <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit mb-2 flex items-center gap-2">
              <PlaneTakeoff className="h-5 w-5 text-[#161950]" />
              Proposal Planning & Strategy
            </h3>
            <p className="text-gray-600 text-sm font-outfit">
              AI-generated proposal design, management plan, and pursuit
              strategy based on uploaded documents.
            </p>
          </div>
          <PlanTab proposalId={proposalId} onSave={onSave} onNext={onPlanNext} />
        </div>
      </TabsContent>

      <TabsContent value="detail" className="mt-0 space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <div className="mb-6">
            <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit mb-2 flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-[#161950]" />
              Detail & Refine Content
            </h3>
            <p className="text-gray-600 text-sm font-outfit">
              Review and refine AI-generated content, ensure compliance, and
              optimize proposal sections.
            </p>
          </div>
          <DetailRefineTab onSave={onSave} onNext={onDetailNext} />
        </div>
      </TabsContent>

      <TabsContent value="layout" className="mt-0 space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <div className="mb-6">
            <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit mb-2 flex items-center gap-2">
              <Layout className="h-5 w-5 text-[#161950]" />
              Layout & Print Preview
            </h3>
            <p className="text-gray-600 text-sm font-outfit">
              Review final layout, check formatting compliance, and prepare for
              printing or digital submission.
            </p>
          </div>
          <LayoutPrintTab proposalId={proposalId} onSave={onSave} onNext={onLayoutNext} />
        </div>
      </TabsContent>

      <TabsContent value="schedule" className="mt-0 space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <div className="mb-6">
            <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit mb-2 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#161950]" />
              Project Schedule & Timeline
            </h3>
            <p className="text-gray-600 text-sm font-outfit">
              Manage project timeline, track milestones, and coordinate team
              activities throughout the proposal process.
            </p>
          </div>
          <ScheduleTab proposalId={proposalId} onSave={onSave} onNext={onScheduleNext} />
        </div>
      </TabsContent>
    </Tabs>
  );
}

