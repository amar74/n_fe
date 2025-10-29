import { memo } from 'react';
import { Link } from 'react-router-dom';
import { AISkillsGapWidget } from './components/AISkillsGapWidget';
import { SmartNotificationPreview } from './components/SmartNotificationPreview';

// Mock employees for analytics
const mockAcceptedEmployees = [
  {
    name: 'Mike Johnson',
    email: 'mike.j@company.com',
    position: 'DevOps Engineer',
  },
  {
    name: 'Sarah Anderson',
    email: 'sarah.a@company.com',
    position: 'UI/UX Designer',
  },
  {
    name: 'David Chen',
    email: 'david.c@company.com',
    position: 'Senior Developer',
  },
];

function AnalyticsPage() {
  return (
    <div className="w-full min-h-screen bg-[#F5F3F2] font-outfit">
      <div className="flex flex-col w-full p-6 gap-6">
        {/* Header */}
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

        {/* AI Skills Gap Widget */}
        <AISkillsGapWidget totalEmployees={mockAcceptedEmployees.length} />

        {/* Smart Notification Preview */}
        {mockAcceptedEmployees.length > 0 && (
          <SmartNotificationPreview
            employeeName={mockAcceptedEmployees[0].name}
            employeeEmail={mockAcceptedEmployees[0].email}
            role={mockAcceptedEmployees[0].position}
          />
        )}
      </div>
    </div>
  );
}

export default memo(AnalyticsPage);

