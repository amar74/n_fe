import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Settings,
  Brain,
  TrendingUp,
  Users,
  Plus,
  Shield,
  Zap,
  Loader2,
  Check,
} from 'lucide-react';
import { useContracts } from '@/hooks/contracts/useContracts';
import type { Contract } from '@/services/api/contractsApi';

interface WorkflowTabProps {
  selectedContract: Contract | null;
  onTabChange: (tab: string) => void;
}

export function WorkflowTab({ selectedContract, onTabChange }: WorkflowTabProps) {
  const { useContractWorkflow, updateContractMutation } = useContracts();
  const [isAddReviewerDialogOpen, setIsAddReviewerDialogOpen] = useState(false);
  const [selectedReviewerId, setSelectedReviewerId] = useState<string | null>(null);
  
  const { data: workflowData, isLoading, error, refetch } = useContractWorkflow(
    selectedContract?.id,
    true
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#161950] mr-3" />
        <div className="text-[#667085] font-outfit">Loading workflow data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="text-red-600 font-outfit text-lg mb-2">Error loading workflow data</div>
        <div className="text-[#667085] font-outfit text-sm">
          {error instanceof Error ? error.message : 'Please try again later'}
        </div>
      </div>
    );
  }

  if (!workflowData) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-[#667085] font-outfit">No workflow data available</div>
      </div>
    );
  }

  // Show message when no contract is selected (but still show general workflow stats)
  const showContractSpecificSteps = !!selectedContract;

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] flex flex-col gap-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <div className="flex justify-start items-start gap-6">
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <h2 className="text-[#1A1A1A] text-lg font-semibold font-outfit leading-7 flex items-center gap-2">
                <Settings className="h-5 w-5 text-[#161950]" />
                AI-Optimized Workflow Management
              </h2>
              <Badge variant="outline" className="bg-[#F9FAFB] text-[#667085] border-[#E5E7EB] px-2.5 py-1 font-outfit">
                <Brain className="h-3 w-3 mr-1.5" />
                AI Enhanced
              </Badge>
            </div>
            <p className="text-[#667085] text-sm font-normal font-outfit">
              AI analyzes workflow data to optimize processes and automatically assign reviewers
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB]">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-[#161950]" />
              <h5 className="font-semibold text-[#1A1A1A] font-outfit">Workflow Optimization</h5>
            </div>
            <p className="text-sm text-[#667085] mb-2 font-outfit">
              AI identifies bottlenecks in approval process and suggests optimizations to reduce cycle time
            </p>
            <div className="text-xs text-[#667085] font-outfit">
              Current avg cycle time: <strong className="text-[#1A1A1A]">
                {workflowData?.workflow_stats?.average_cycle_time_days != null 
                  ? Number(workflowData.workflow_stats.average_cycle_time_days).toFixed(1) 
                  : '0.0'} days</strong> | AI target: <strong className="text-[#1A1A1A]">
                {workflowData?.workflow_stats?.ai_target_cycle_time_days != null 
                  ? Number(workflowData.workflow_stats.ai_target_cycle_time_days).toFixed(1) 
                  : '6.1'} days</strong>
            </div>
          </div>
          <div className="p-4 bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB]">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-5 w-5 text-[#161950]" />
              <h5 className="font-semibold text-[#1A1A1A] font-outfit">Auto Reviewer Assignment</h5>
            </div>
            <p className="text-sm text-[#667085] mb-2 font-outfit">
              AI automatically assigns contracts to appropriate reviewer based on contract type and risk level
            </p>
            <div className="text-xs text-[#667085] font-outfit">
              Assignment accuracy: <strong className="text-[#1A1A1A]">
                {workflowData?.workflow_stats?.assignment_accuracy_percent != null 
                  ? Number(workflowData.workflow_stats.assignment_accuracy_percent).toFixed(0) 
                  : '0'}%</strong> | Manual override available
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] flex flex-col gap-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <div className="flex justify-start items-start gap-6">
          <div className="flex-1 flex flex-col gap-1">
            <h2 className="text-[#1A1A1A] text-lg font-semibold font-outfit leading-7 flex items-center gap-2">
              <Settings className="h-5 w-5 text-[#161950]" />
              Contract Review Workflow
            </h2>
            <p className="text-[#667085] text-sm font-normal font-outfit">
              Configure approval processes, assign reviewers, and manage workflow automation
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[#1A1A1A] font-outfit">Review Process Steps</h3>
              {!showContractSpecificSteps && (
                <Badge variant="outline" className="bg-[#FEF3C7] text-[#92400E] border-[#FCD34D] text-xs font-outfit">
                  General Workflow
                </Badge>
              )}
              {showContractSpecificSteps && selectedContract && (
                <Badge variant="outline" className="bg-[#D1FAE5] text-[#065F46] border-[#10B981] text-xs font-outfit">
                  {selectedContract.project_name || selectedContract.contract_id}
                </Badge>
              )}
            </div>
            {!showContractSpecificSteps && (
              <div className="p-4 bg-[#FEF3C7]/30 border border-[#FCD34D] rounded-xl mb-2">
                <p className="text-sm text-[#92400E] font-outfit">
                  <strong>Select a contract</strong> from the Contracts tab to view contract-specific workflow steps.
                </p>
                <Button
                  onClick={() => onTabChange('contracts')}
                  variant="outline"
                  size="sm"
                  className="mt-2 border-[#FCD34D] text-[#92400E] hover:bg-[#FCD34D]"
                >
                  Browse Contracts
                </Button>
              </div>
            )}
            <div className="flex flex-col gap-3">
              {workflowData?.workflow_steps && workflowData.workflow_steps.length > 0 ? (
                workflowData.workflow_steps.map((item: any) => (
                <div
                  key={item.step}
                  className="flex items-center gap-3 p-4 border border-[#E5E7EB] rounded-2xl bg-white"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold font-outfit ${
                      item.status === 'completed'
                        ? 'bg-[#039855]'
                        : item.status === 'in-progress'
                          ? 'bg-[#161950]'
                          : 'bg-[#D0D5DD]'
                    }`}
                  >
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-[#1A1A1A] font-outfit">{item.title}</h4>
                    <p className="text-sm text-[#667085] font-outfit">{item.description}</p>
                  </div>
                  <Badge
                    className={`font-outfit ${
                      item.status === 'completed'
                        ? 'bg-[#D1FADF] text-[#039855] border-[#039855]/20'
                        : item.status === 'in-progress'
                          ? 'bg-[#E5E7EB] text-[#161950] border-[#161950]/20'
                          : 'bg-[#F9FAFB] text-[#667085] border-[#E5E7EB]'
                    }`}
                  >
                    {item.status?.replace('-', ' ') || item.status}
                  </Badge>
                </div>
                ))
              ) : (
                <div className="text-sm text-[#667085] font-outfit p-4 border border-[#E5E7EB] rounded-2xl bg-white">
                  No workflow steps available
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-[#1A1A1A] font-outfit">Role Assignments</h3>
            <div className="flex flex-col gap-3">
              <div className="p-4 bg-white rounded-2xl border border-[#E5E7EB]">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-[#1A1A1A] font-outfit">Legal Reviewers</h4>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-9 px-4 border-[#E5E7EB] text-[#667085] hover:bg-[#F9FAFB] rounded-lg font-outfit"
                    onClick={() => setIsAddReviewerDialogOpen(true)}
                  >
                    <Plus className="h-3 w-3 mr-1.5" />
                    Add
                  </Button>
                </div>
                <div className="flex flex-col gap-2">
                  {workflowData?.reviewers && workflowData.reviewers.length > 0 ? (
                    workflowData.reviewers.slice(0, 5).map((reviewer: any, index: number) => (
                      <div key={reviewer.id || index} className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-[#667085] flex-shrink-0" />
                        <span className="text-sm text-[#1A1A1A] font-outfit flex-1">
                          {reviewer.name || reviewer.email || 'Unknown Reviewer'}
                          {reviewer.role && <span className="text-[#667085]"> ({reviewer.role})</span>}
                        </span>
                        {index === 0 && (
                          <Badge variant="outline" className="bg-[#F9FAFB] text-[#667085] border-[#E5E7EB] text-xs font-outfit flex-shrink-0">Primary</Badge>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-[#667085] font-outfit p-2">No reviewers assigned</div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#E5E7EB]">
                <h4 className="font-semibold mb-3 text-[#1A1A1A] font-outfit">Approval Authority</h4>
                <div className="flex flex-col gap-2">
                  {workflowData?.approval_authority_rules && workflowData.approval_authority_rules.length > 0 ? (
                    workflowData.approval_authority_rules.map((rule: string, index: number) => (
                      <div key={index} className="flex items-center gap-3">
                        <Shield className="h-4 w-4 text-[#667085]" />
                        <span className="text-sm text-[#1A1A1A] font-outfit">{rule}</span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <Shield className="h-4 w-4 text-[#667085]" />
                        <span className="text-sm text-[#1A1A1A] font-outfit">Director Level: &lt; $1M contracts</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Shield className="h-4 w-4 text-[#667085]" />
                        <span className="text-sm text-[#1A1A1A] font-outfit">VP Level: $1M - $5M contracts</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Shield className="h-4 w-4 text-[#667085]" />
                        <span className="text-sm text-[#1A1A1A] font-outfit">CEO Level: &gt; $5M contracts</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#E5E7EB]">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-[#1A1A1A] font-outfit">AI Automation Rules</h4>
                  <Badge variant="outline" className="bg-[#F9FAFB] text-[#667085] border-[#E5E7EB] px-2.5 py-1 font-outfit">
                    <Brain className="h-3 w-3 mr-1.5" />
                    AI Powered
                  </Badge>
                </div>
                <div className="flex flex-col gap-2">
                  {workflowData?.ai_automation_rules && workflowData.ai_automation_rules.length > 0 ? (
                    workflowData.ai_automation_rules.map((rule: string, index: number) => (
                      <div key={index} className="flex items-center gap-3">
                        <Zap className="h-4 w-4 text-[#161950]" />
                        <span className="text-sm text-[#1A1A1A] font-outfit">{rule}</span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <Zap className="h-4 w-4 text-[#161950]" />
                        <span className="text-sm text-[#1A1A1A] font-outfit">Auto-assign high risk contracts to senior counsel</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Zap className="h-4 w-4 text-[#161950]" />
                        <span className="text-sm text-[#1A1A1A] font-outfit">AI-triggered escalation after 48 hours</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Zap className="h-4 w-4 text-[#161950]" />
                        <span className="text-sm text-[#1A1A1A] font-outfit">Auto-generate exception templates from clause library</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Zap className="h-4 w-4 text-[#161950]" />
                        <span className="text-sm text-[#1A1A1A] font-outfit">Smart routing based on contract type and value</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Zap className="h-4 w-4 text-[#161950]" />
                        <span className="text-sm text-[#1A1A1A] font-outfit">Predictive workflow optimization suggestions</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isAddReviewerDialogOpen} onOpenChange={setIsAddReviewerDialogOpen}>
        <DialogContent className="max-w-2xl font-outfit">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-xl font-semibold text-[#1A1A1A] font-outfit">
              <Users className="h-6 w-6 text-[#161950]" />
              <span>Assign Reviewer to Contract</span>
            </DialogTitle>
            <DialogDescription className="text-sm text-[#667085] font-outfit">
              {selectedContract 
                ? `Select a reviewer to assign to "${selectedContract.project_name || selectedContract.contract_id}"`
                : 'Please select a contract first'}
            </DialogDescription>
          </DialogHeader>

          {!selectedContract ? (
            <div className="py-8 text-center">
              <p className="text-[#667085] font-outfit mb-4">No contract selected</p>
              <Button
                onClick={() => {
                  setIsAddReviewerDialogOpen(false);
                  onTabChange('contracts');
                }}
                className="bg-[#161950] hover:bg-[#1E2B5B] text-white font-outfit"
              >
                Browse Contracts
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {workflowData?.reviewers && workflowData.reviewers.length > 0 ? (
                  workflowData.reviewers.map((reviewer: any) => (
                    <div
                      key={reviewer.id}
                      className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${
                        selectedReviewerId === reviewer.id
                          ? 'border-[#161950] bg-[#F0F4FF]'
                          : 'border-[#E5E7EB] hover:border-[#161950]/30 hover:bg-[#F9FAFB]'
                      }`}
                      onClick={() => setSelectedReviewerId(reviewer.id)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Users className="h-5 w-5 text-[#667085] flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-semibold text-[#1A1A1A] font-outfit">
                            {reviewer.name || reviewer.email}
                          </p>
                          {reviewer.email && reviewer.name && (
                            <p className="text-sm text-[#667085] font-outfit">{reviewer.email}</p>
                          )}
                          {reviewer.role && (
                            <p className="text-sm text-[#667085] font-outfit">{reviewer.role}</p>
                          )}
                        </div>
                      </div>
                      {selectedReviewerId === reviewer.id && (
                        <Check className="h-5 w-5 text-[#161950] flex-shrink-0" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-[#667085] font-outfit">
                    No reviewers available
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddReviewerDialogOpen(false);
                    setSelectedReviewerId(null);
                  }}
                  className="font-outfit"
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    if (!selectedContract || !selectedReviewerId) return;
                    
                    try {
                      await updateContractMutation.mutateAsync({
                        id: selectedContract.id,
                        data: {
                          assigned_reviewer: selectedReviewerId,
                        },
                      });
                      setIsAddReviewerDialogOpen(false);
                      setSelectedReviewerId(null);
                      refetch();
                    } catch (error: any) {
                      // Error is already handled by the mutation's onError
                    }
                  }}
                  disabled={!selectedReviewerId || updateContractMutation.isPending}
                  className="bg-[#161950] hover:bg-[#1E2B5B] text-white font-outfit"
                >
                  {updateContractMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    'Assign Reviewer'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

