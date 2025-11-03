import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStaffPlanning } from '@/hooks/useStaffPlanning';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Users, 
  BarChart3, 
  CheckCircle, 
  ArrowLeft,
  Save,
  Download,
  Loader2,
  Edit
} from 'lucide-react';

// Import step components (we'll create these next)
import ProjectInfoForm from './components/ProjectInfoForm';
import StaffSelectionGrid from './components/StaffSelectionGrid';
import CostAnalysis from './components/CostAnalysis';
import PlanSummary from './components/PlanSummary';

interface ProjectInfo {
  projectId?: string;  // UUID
  projectName: string;
  projectDescription: string;
  projectStartDate: string;
  durationMonths: number;
  overheadRate: number;
  profitMargin: number;
  annualEscalationRate: number;
}

interface StaffMember {
  id: number;
  resourceId: string;  // UUID
  resourceName: string;
  role: string;
  level: string;
  startMonth: number;
  endMonth: number;
  hoursPerWeek: number;
  hourlyRate: number;
  monthlyCost: number;
  totalCost: number;
}

export default function CreateStaffPlan() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createStaffPlan, addStaffAllocation, updateStaffPlan, useStaffPlanDetail, isCreating } = useStaffPlanning();
  const [currentStep, setCurrentStep] = useState(1);
  const [currentPlanId, setCurrentPlanId] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    projectName: '',
    projectDescription: '',
    projectStartDate: '',
    durationMonths: 12,
    overheadRate: 25,
    profitMargin: 15,
    annualEscalationRate: 3
  });
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch existing plan data if in edit mode
  const planId = Number(id);
  const isValidEditId = id && !isNaN(planId) && planId > 0;
  const { data: existingPlan, isLoading: isLoadingExistingPlan } = useStaffPlanDetail(isValidEditId ? planId : 0);

  // Load existing plan data when in edit mode
  useEffect(() => {
    if (isValidEditId && existingPlan) {
      console.log('Loading existing plan for edit:', existingPlan);
      
      setIsEditMode(true);
      setCurrentPlanId(existingPlan.id);
      
      // Populate project info (using correct field names from API)
      const loadedProjectInfo = {
        projectId: existingPlan.project_id || undefined,
        projectName: existingPlan.project_name || '',
        projectDescription: existingPlan.project_description || '',
        projectStartDate: existingPlan.project_start_date || '',
        durationMonths: existingPlan.duration_months || 12,
        overheadRate: existingPlan.overhead_rate || 25,
        profitMargin: existingPlan.profit_margin || 15,
        annualEscalationRate: existingPlan.annual_escalation_rate || 3
      };
      
      console.log('Populated project info:', loadedProjectInfo);
      setProjectInfo(loadedProjectInfo);

      // Note: Allocations need to be fetched separately via getStaffPlanWithAllocations
      // For now, we'll keep the staff members empty in edit mode
      // Users can add/remove staff in Step 2

      toast({
        title: "Plan Loaded",
        description: `Editing: ${existingPlan.project_name}`,
      });
    }
  }, [id, existingPlan, toast]);

  const steps = [
    { id: 1, name: 'Project Info', icon: FileText, description: 'Project details' },
    { id: 2, name: 'Staff Planning', icon: Users, description: 'Add team members' },
    { id: 3, name: 'Cost Analysis', icon: BarChart3, description: 'Review costs' },
    { id: 4, name: 'Summary', icon: CheckCircle, description: 'Final review' }
  ];

  const handleProjectInfoSubmit = (data: ProjectInfo) => {
    setProjectInfo(data);
    setCurrentStep(2);
  };

  const handleStaffSelection = async (staff: StaffMember[]) => {
    setStaffMembers(staff);
    
    // Auto-save when staff selection is complete
    if (staff.length > 0) {
      await autoSaveProgress(projectInfo, staff);
    }
    
    setCurrentStep(3);
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Auto-save progress to database
  const autoSaveProgress = async (projectData: ProjectInfo, staff: StaffMember[]) => {
    if (!projectData.projectName || !projectData.projectStartDate) {
      console.warn('Cannot auto-save: missing required project info');
      return;
    }

    try {
      let planId = currentPlanId;

      // If plan doesn't exist yet, create it (create mode)
      if (!planId) {
        console.log('Creating new staff plan...');
        
        const planData = {
          project_id: null,  // Will be linked to real opportunity later
          project_name: projectData.projectName,
          project_description: projectData.projectDescription,
          project_start_date: projectData.projectStartDate,
          duration_months: projectData.durationMonths,
          overhead_rate: projectData.overheadRate,
          profit_margin: projectData.profitMargin,
          annual_escalation_rate: projectData.annualEscalationRate,
        };

        const newPlan = await createStaffPlan.mutateAsync(planData);
        console.log('Staff plan created:', newPlan);
        planId = newPlan.id;
        setCurrentPlanId(planId);
      } else {
        console.log('Using existing plan ID:', planId);
      }

      // Add all staff allocations (works for both create and edit mode)
      if (staff.length > 0 && planId) {
        console.log(`Adding ${staff.length} staff allocations to plan ${planId}...`);
        
        for (const member of staff) {
          await addStaffAllocation.mutateAsync({
            planId: planId,
            allocation: {
              resource_id: member.resourceId,
              resource_name: member.resourceName,
              role: member.role,
              level: member.level,
              start_month: member.startMonth,
              end_month: member.endMonth,
              hours_per_week: member.hoursPerWeek,
              hourly_rate: member.hourlyRate,
            },
          });
        }
        console.log('All staff allocations saved');
        
        // Update plan status to 'active' when team members are added
        if (isEditMode) {
          await updateStaffPlan.mutateAsync({
            id: planId,
            data: {
              status: 'active'
            }
          });
          console.log('Plan status updated to active');
        }
        
        toast({
          title: 'Team Members Saved',
          description: `${staff.length} team member(s) added to the plan`,
        });
      }
    } catch (error: any) {
      console.error('Auto-save failed:', error);
      toast({
        title: 'Save Failed',
        description: error.response?.data?.detail || error.message || 'Failed to save team members',
        variant: 'destructive'
      });
    }
  };

  const handleSave = async () => {
    if (!projectInfo.projectName || !projectInfo.projectStartDate) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in project name and start date',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);
    
    try {
      if (isEditMode && currentPlanId) {
        // Edit mode: Update existing plan
        const updateData = {
          project_name: projectInfo.projectName,
          description: projectInfo.projectDescription,
          start_date: projectInfo.projectStartDate,
          duration_months: projectInfo.durationMonths,
          overhead_rate: projectInfo.overheadRate,
          profit_margin: projectInfo.profitMargin,
          escalation_rate: projectInfo.annualEscalationRate,
        };

        await updateStaffPlan.mutateAsync({
          id: currentPlanId,
          data: updateData
        });

        toast({
          title: 'Success',
          description: 'Staff plan updated successfully!',
        });
      } else if (currentPlanId) {
        // Already saved, just navigate back
        toast({
          title: 'Success',
          description: 'Staff plan already saved!',
        });
      } else {
        // Create mode: Save new plan
        await autoSaveProgress(projectInfo, staffMembers);
        toast({
          title: 'Success',
          description: 'Staff plan saved successfully to database!',
        });
      }
      
      navigate('/staffing-plan');
    } catch (error: any) {
      console.error('Failed to save staff plan:', error);
      toast({
        title: 'Save Failed',
        description: error.response?.data?.detail || error.message || 'Failed to save staff plan',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    if (!projectInfo.projectName) {
      toast({
        title: 'Missing Information',
        description: 'Please complete the project information first',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Calculate totals
      const totalMonthlyCost = staffMembers.reduce((sum, m) => sum + m.monthlyCost, 0);
      const totalProjectCost = staffMembers.reduce((sum, m) => sum + m.totalCost, 0);

      // Create export data
      const exportData = {
        project: {
          name: projectInfo.projectName,
          description: projectInfo.projectDescription,
          startDate: projectInfo.projectStartDate,
          duration: `${projectInfo.durationMonths} months`,
          overheadRate: `${projectInfo.overheadRate}%`,
          profitMargin: `${projectInfo.profitMargin}%`,
          escalationRate: `${projectInfo.annualEscalationRate}%`,
        },
        staffing: staffMembers.map(m => ({
          name: m.resourceName,
          role: m.role,
          level: m.level,
          startMonth: m.startMonth,
          endMonth: m.endMonth,
          hoursPerWeek: m.hoursPerWeek,
          hourlyRate: `$${m.hourlyRate}`,
          monthlyCost: `$${m.monthlyCost.toLocaleString()}`,
          totalCost: `$${m.totalCost.toLocaleString()}`,
        })),
        totals: {
          teamSize: staffMembers.length,
          totalMonthlyCost: `$${totalMonthlyCost.toLocaleString()}`,
          totalProjectCost: `$${totalProjectCost.toLocaleString()}`,
        }
      };

      // Export as JSON (can be extended to CSV/Excel)
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${projectInfo.projectName.replace(/\s+/g, '_')}_staffing_plan.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Successful',
        description: `Staff plan exported as ${projectInfo.projectName.replace(/\s+/g, '_')}_staffing_plan.json`,
      });
    } catch (error: any) {
      toast({
        title: 'Export Failed',
        description: error.message || 'Failed to export staff plan',
        variant: 'destructive'
      });
    }
  };

  // Show loading state when fetching plan data in edit mode
  if (isLoadingExistingPlan && isValidEditId) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 font-outfit flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#161950' }} />
          <p className="text-gray-600">Loading staff plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 font-outfit">
      <div className="flex flex-col w-full">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <Link
                to="/staffing-plan"
                className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-[#1A1A1A] font-outfit">
                  {isEditMode ? 'Edit Staffing Plan' : 'Create Staffing Plan'}
                </h1>
                <p className="text-sm text-gray-600 mt-0.5">
                  {isEditMode 
                    ? 'Update your staffing plan details and allocations'
                    : 'Design comprehensive staffing plans with automatic cost calculations and multi-year projections'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={isSaving || isCreating}
                className="h-10 px-4 bg-white rounded-lg border border-gray-300 flex items-center gap-2 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 text-gray-700" />
                <span className="text-sm font-semibold text-gray-700">
                  {isSaving ? 'Saving...' : 'Save Plan'}
                </span>
              </button>
              <button
                onClick={handleExport}
                className="h-10 px-4 bg-green-600 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-all"
              >
                <Download className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white">Export</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-6">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(step.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : isCompleted
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } ${index < steps.length - 1 ? 'relative' : ''}`}
                  >
                    <StepIcon className="w-5 h-5" />
                    <div className="text-left">
                      <div className="text-sm font-semibold">{step.name}</div>
                      <div className="text-xs opacity-90">{step.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex-1 px-6 py-8">
          <div className="max-w-7xl mx-auto">
            {isEditMode && (
              <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#161950' }}>
                    <Edit className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-blue-900 mb-1">Edit Mode Active</h3>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• <strong>Project Name & Description:</strong> Locked (cannot be changed)</li>
                      <li>• <strong>Financial Parameters:</strong> Can be updated (duration, overhead, profit margin, escalation)</li>
                      <li>• <strong>Team Members:</strong> Add or remove staff allocations</li>
                      <li>• <strong>Cost Analysis:</strong> Will update automatically based on changes</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {currentStep === 1 && (
              <ProjectInfoForm
                initialData={projectInfo}
                onSubmit={handleProjectInfoSubmit}
                isEditMode={isEditMode}
              />
            )}
            
            {currentStep === 2 && (
              <StaffSelectionGrid
                projectInfo={projectInfo}
                selectedStaff={staffMembers}
                onComplete={handleStaffSelection}
                onBack={handlePrevious}
              />
            )}
            
            {currentStep === 3 && (
              <CostAnalysis
                projectInfo={projectInfo}
                staffMembers={staffMembers}
                onNext={handleNext}
                onBack={handlePrevious}
              />
            )}
            
            {currentStep === 4 && (
              <PlanSummary
                projectInfo={projectInfo}
                staffMembers={staffMembers}
                onSave={handleSave}
                onExport={handleExport}
                onBack={handlePrevious}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

