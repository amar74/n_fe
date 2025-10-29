import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  BarChart3, 
  CheckCircle, 
  ArrowLeft,
  Save,
  Download
} from 'lucide-react';

// Import step components (we'll create these next)
import ProjectInfoForm from './components/ProjectInfoForm';
import StaffSelectionGrid from './components/StaffSelectionGrid';
import CostAnalysis from './components/CostAnalysis';
import PlanSummary from './components/PlanSummary';

interface ProjectInfo {
  projectId?: number;
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
  resourceId: number;
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
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
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

  const handleStaffSelection = (staff: StaffMember[]) => {
    setStaffMembers(staff);
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

  const handleSave = async () => {
    // Save plan logic
    console.log('Saving plan...', { projectInfo, staffMembers });
    // API call here
    navigate('/staffing-plan');
  };

  const handleExport = () => {
    console.log('Exporting plan...');
    // Export logic
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 font-outfit">
      <div className="flex flex-col w-full">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            {/* Left: Title */}
            <div className="flex items-center gap-4">
              <Link
                to="/staffing-plan"
                className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-[#1A1A1A] font-outfit">
                  Create Staffing Plan
                </h1>
                <p className="text-sm text-gray-600 mt-0.5">
                  Design comprehensive staffing plans with automatic cost calculations and multi-year projections
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                className="h-10 px-4 bg-white rounded-lg border border-gray-300 flex items-center gap-2 hover:bg-gray-50 transition-all"
              >
                <Save className="w-4 h-4 text-gray-700" />
                <span className="text-sm font-semibold text-gray-700">Save Plan</span>
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

        {/* Step Navigation */}
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

        {/* Content */}
        <div className="flex-1 px-6 py-8">
          <div className="max-w-7xl mx-auto">
            {currentStep === 1 && (
              <ProjectInfoForm
                initialData={projectInfo}
                onSubmit={handleProjectInfoSubmit}
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

