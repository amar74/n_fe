import { memo } from 'react';
import { Link } from 'react-router-dom';
import { RolePermissionConfig } from './components/RolePermissionConfig';
import { useEmployees } from '@/hooks/useEmployees';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function PermissionsPage() {
  const { employees: allEmployees, isLoading, updateEmployee } = useEmployees();
  
  // Filter to get ONLY activated employees (those with user accounts)
  const employees = (allEmployees as any[] || []).filter((emp: any) => 
    emp.status === 'active' && emp.user_id != null
  );

  const handleUpdatePermissions = async (employeeId: string, permissions: string[]) => {
    console.log(`Updating permissions for ${employeeId}:`, permissions);
    try {
      await updateEmployee({ 
        id: employeeId, 
        data: { 
          // Store permissions in review_notes for now (can be moved to dedicated field later)
          review_notes: `Permissions: ${permissions.join(', ')}`
        } 
      });
      toast.success('Permissions updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update permissions');
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#F5F3F2] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading employees...</p>
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
              <Link to="/" className="text-gray-500 text-sm font-normal leading-tight hover:text-gray-900 transition-colors">
                Dashboard
              </Link>
              <span className="text-[#344054] text-sm font-normal leading-tight">/</span>
              <Link to="/module/resources" className="text-gray-500 text-sm font-normal leading-tight hover:text-gray-900 transition-colors">
                Resources
              </Link>
              <span className="text-[#344054] text-sm font-normal leading-tight">/</span>
              <span className="text-[#344054] text-sm font-semibold leading-tight">Role & Permissions</span>
            </div>
            
            <div>
              <h1 className="text-[#1A1A1A] text-3xl font-bold leading-loose">
                Role & Permissions
              </h1>
              <p className="text-gray-600 text-sm font-medium mt-1">
                Manage access and permissions for activated employee accounts only
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-lg border border-green-200">
            <p className="text-sm font-semibold text-green-700 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Showing {employees.length} activated employee{employees.length !== 1 ? 's' : ''} with user accounts
            </p>
          </div>
        </div>

        <RolePermissionConfig
          employees={employees}
          onUpdatePermissions={handleUpdatePermissions}
        />
      </div>
    </div>
  );
}

export default memo(PermissionsPage);

