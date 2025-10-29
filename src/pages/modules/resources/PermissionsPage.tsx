import { memo } from 'react';
import { Link } from 'react-router-dom';
import { RolePermissionConfig } from './components/RolePermissionConfig';

// Mock employees for permissions (would come from API)
const mockEmployees = [
  {
    id: '1',
    number: 'EMP-001',
    name: 'Mike Johnson',
    email: 'mike.j@company.com',
    phone: '+1 234 567 8902',
    cvUrl: '/cv/mike.pdf',
    stage: 'accepted',
    appliedDate: '2024-10-01',
    reviewNotes: 'Excellent technical skills',
    position: 'DevOps Engineer',
    experience: '7 years',
    skills: ['AWS', 'Docker', 'Kubernetes'],
    rating: 5,
    location: 'Austin, TX',
  },
  {
    id: '2',
    number: 'EMP-002',
    name: 'Sarah Anderson',
    email: 'sarah.a@company.com',
    phone: '+1 234 567 8903',
    cvUrl: '/cv/sarah.pdf',
    stage: 'accepted',
    appliedDate: '2024-10-05',
    reviewNotes: 'Great design portfolio',
    position: 'UI/UX Designer',
    experience: '5 years',
    skills: ['Figma', 'Adobe XD', 'User Research'],
    rating: 5,
    location: 'New York, NY',
  },
  {
    id: '3',
    number: 'EMP-003',
    name: 'David Chen',
    email: 'david.c@company.com',
    phone: '+1 234 567 8904',
    cvUrl: '/cv/david.pdf',
    stage: 'accepted',
    appliedDate: '2024-09-20',
    reviewNotes: 'Strong full-stack developer',
    position: 'Senior Developer',
    experience: '8 years',
    skills: ['React', 'TypeScript', 'Node.js'],
    rating: 5,
    location: 'San Francisco, CA',
  },
];

function PermissionsPage() {
  const handleUpdatePermissions = (employeeId: string, permissions: string[]) => {
    console.log(`Updating permissions for ${employeeId}:`, permissions);
    alert(`Permissions updated successfully for employee ${employeeId}`);
  };

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
              <span className="text-[#344054] text-sm font-semibold font-outfit leading-tight">Role & Permissions</span>
            </div>
            
            <div>
              <h1 className="text-[#1A1A1A] text-3xl font-bold font-outfit leading-loose">
                Role & Permissions
              </h1>
              <p className="text-gray-600 text-sm font-medium mt-1">
                Manage employee access levels and permissions (RBAC)
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <RolePermissionConfig
          employees={mockEmployees}
          onUpdatePermissions={handleUpdatePermissions}
        />
      </div>
    </div>
  );
}

export default memo(PermissionsPage);

