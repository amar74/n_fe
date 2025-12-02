import { memo } from 'react';
import { Link } from 'react-router-dom';
import { AISkillsGapWidget } from './components/AISkillsGapWidget';
import { UtilizationAnalytics } from './components/UtilizationAnalytics';
import { PerformanceAnalytics } from './components/PerformanceAnalytics';
import { useEmployees, useEmployeeAnalytics } from '@/hooks/useEmployees';
import { Loader2 } from 'lucide-react';

function AnalyticsPage() {
  const { employees, isLoading } = useEmployees();
  const { skillsGap, isLoadingSkillsGap } = useEmployeeAnalytics();
  
  // Filter to get accepted/active employees
  const acceptedEmployees = (employees as any[] || []).filter((emp: any) => 
    emp.status === 'accepted' || emp.status === 'active'
  );

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#F5F3F2] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F5F3F2] font-outfit">
      <div className="flex flex-col w-full p-6 gap-6">
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Link to="/" className="text-gray-500 text-sm font-normal font-outfit leading-tight hover:text-gray-900 transition-colors">
                Dashboard
              </Link>
              <span className="text-[#344054] text-sm font-normal font-outfit leading-tight">/</span>
              <Link to="/module/resources" className="text-gray-500 text-sm font-normal font-outfit leading-tight hover:text-gray-900 transition-colors">
                Resources
              </Link>
              <span className="text-[#344054] text-sm font-normal font-outfit leading-tight">/</span>
              <span className="text-[#344054] text-sm font-semibold font-outfit leading-tight">AI Analytics</span>
            </div>
            
            <div>
              <h1 className="text-[#1A1A1A] text-3xl font-bold font-outfit leading-loose">
                AI Analytics & Insights
              </h1>
              <p className="text-gray-600 text-sm font-medium mt-1">
                AI-powered workforce optimization and skills analysis
              </p>
            </div>
          </div>
        </div>

        <AISkillsGapWidget totalEmployees={acceptedEmployees.length} employees={acceptedEmployees} />
        
        <UtilizationAnalytics employees={acceptedEmployees} />
        
        <PerformanceAnalytics employees={acceptedEmployees} />
      </div>
    </div>
  );
}

export default memo(AnalyticsPage);

