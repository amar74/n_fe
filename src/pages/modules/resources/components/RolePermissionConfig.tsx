import { Shield, Check, X, Edit2, Save, Search, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { toast } from 'sonner';
import { useRoles } from '@/hooks/useRoles';
import type { Employee } from './KanbanBoard';

type Permission = {
  id: string;
  name: string;
  description: string;
};

type RolePermissionConfigProps = {
  employees: Employee[];
  onUpdatePermissions: (employeeId: string, payload: { permissions: string[]; role?: string; department?: string }) => void;
};

const AVAILABLE_PERMISSIONS: Permission[] = [
  { id: 'projects', name: 'Projects', description: 'Access project management module' },
  { id: 'finance', name: 'Finance', description: 'View and manage financial data' },
  { id: 'resources', name: 'Resources', description: 'Manage team resources and onboarding' },
  { id: 'accounts', name: 'Accounts', description: 'Manage client accounts' },
  { id: 'reports', name: 'Reports', description: 'Generate and view reports' },
  { id: 'settings', name: 'Settings', description: 'Configure system settings' },
  { id: 'users', name: 'User Management', description: 'Manage user accounts' },
  { id: 'billing', name: 'Billing', description: 'Access billing and invoicing' },
];

export function RolePermissionConfig({ employees, onUpdatePermissions }: RolePermissionConfigProps) {
  const { allRoles, isLoading: isLoadingRoles, getRoleName } = useRoles();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, string[]>>({});
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({});
  const [selectedDepartments, setSelectedDepartments] = useState<Record<string, string>>({});
  const [employeePermissions, setEmployeePermissions] = useState<Record<string, string[]>>({});
  const [isLoadingPermissions, setIsLoadingPermissions] = useState<Record<string, boolean>>({});

  const {
    data: departments = [],
    isLoading: isLoadingDepartments,
  } = useQuery({
    queryKey: ['organization', 'departments'],
    queryFn: async () => {
      const response = await apiClient.get('/departments');
      return response.data || [];
    },
  });

  // Fetch permissions for each employee
  useEffect(() => {
    const fetchPermissions = async () => {
      const permissionsMap: Record<string, string[]> = {};
      
      for (const emp of employees) {
        if ((emp as any).user_id) {
          try {
            setIsLoadingPermissions(prev => ({ ...prev, [emp.id]: true }));
            const response = await apiClient.get(`/resources/users/${(emp as any).user_id}/permissions`);
            permissionsMap[emp.id] = response.data.permissions || ['projects', 'resources'];
          } catch (error) {
            console.error(`Error fetching permissions for ${emp.id}:`, error);
            permissionsMap[emp.id] = ['projects', 'resources'];
          } finally {
            setIsLoadingPermissions(prev => ({ ...prev, [emp.id]: false }));
          }
        } else {
          permissionsMap[emp.id] = ['projects', 'resources'];
        }
      }
      
      setEmployeePermissions(permissionsMap);
    };
    
    if (employees.length > 0) {
      fetchPermissions();
    }
  }, [employees]);

  // Filter by search only - parent already filters for active employees
  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditClick = (employeeId: string, employee: Employee) => {
    const currentRoleName = (employee as any).role || '';
    // Match role by name (since we're now using role names as values)
    const matchedRoleName =
      currentRoleName &&
      allRoles.find(role => role.name.toLowerCase() === currentRoleName.toLowerCase())?.name ||
      currentRoleName;

    setEditingEmployee(employeeId);
    setSelectedRoles({
      ...selectedRoles,
      [employeeId]: matchedRoleName || selectedRoles[employeeId] || allRoles[0]?.name || ''
    });
    setSelectedDepartments({
      ...selectedDepartments,
      [employeeId]: (employee as any).department || ''
    });
  };

  const handleSaveClick = async (employeeId: string, userId: string | null) => {
    try {
      const roleName = selectedRoles[employeeId] || '';
      const departmentName = selectedDepartments[employeeId] || '';

      onUpdatePermissions(employeeId, {
        permissions: [], // Permissions come from roles, not individual assignment
        role: roleName,
        department: departmentName,
      });
      
      toast.success('Role and department updated successfully');
      setEditingEmployee(null);
    } catch (error: any) {
      console.error('Error saving role and department:', error);
      toast.error(error.response?.data?.detail || 'Failed to update role and department');
    }
  };

  const togglePermission = (employeeId: string, permissionId: string) => {
    const current = selectedPermissions[employeeId] || [];
    const updated = current.includes(permissionId)
      ? current.filter(p => p !== permissionId)
      : [...current, permissionId];
    
    setSelectedPermissions({
      ...selectedPermissions,
      [employeeId]: updated
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl" style={{ backgroundColor: '#f0f0ff' }}>
            <Shield className="w-6 h-6" style={{ color: '#161950' }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Role & Permission Configuration</h2>
            <p className="text-sm text-gray-600 mt-1">Manage employee access and permissions (RBAC)</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search employees..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-14 pl-12 pr-4 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 transition-all font-medium"
          style={{ borderColor: '#ccc' }}
          onFocus={(e) => {
            e.target.style.borderColor = '#161950';
            e.target.style.boxShadow = '0 0 0 2px rgba(21, 25, 80, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#ccc';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Employee</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Designation</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Department</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Role</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Shield className="w-12 h-12 text-gray-300" />
                      <p className="text-gray-500 font-medium">
                        {searchQuery ? 'No employees match your search' : 'No activated employees found'}
                      </p>
                      <p className="text-sm text-gray-400">
                        {searchQuery 
                          ? 'Try a different search term' 
                          : 'Activate employees from the Onboarding page first'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => {
                  const isEditing = editingEmployee === employee.id;
                  const roleFromEmployee = (employee as any).role || '';
                  // Use role name as value (matching the dropdown)
                  const currentRole =
                    selectedRoles[employee.id] ||
                    roleFromEmployee ||
                    '';
                  const currentDepartment =
                    selectedDepartments[employee.id] || (employee as any).department || '';

                  return (
                    <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                      {/* Employee Name & Email */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{employee.name}</p>
                          <p className="text-xs text-gray-500">{employee.email}</p>
                        </div>
                      </td>
                      
                      {/* Designation (Job Title) */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700 font-medium">
                          {employee.position || 'N/A'}
                        </span>
                      </td>
                      
                      {/* Department */}
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <select
                            value={currentDepartment}
                            onChange={(e) =>
                              setSelectedDepartments({
                                ...selectedDepartments,
                                [employee.id]: e.target.value,
                              })
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#161950] focus:border-transparent"
                          >
                            <option value="">Select department</option>
                            {isLoadingDepartments ? (
                              <option>Loading departments...</option>
                            ) : (
                              departments.map((dept: any) => (
                                <option key={dept.id} value={dept.name}>
                                  {dept.name}
                                </option>
                              ))
                            )}
                          </select>
                        ) : (
                          <span className="text-sm text-gray-700 font-medium">
                            {currentDepartment || 'Not assigned'}
                          </span>
                        )}
                      </td>
                      
                      {/* Role (System Role: Employee, Admin, Manager, etc.) */}
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <select
                            value={currentRole}
                            onChange={(e) => setSelectedRoles({
                              ...selectedRoles,
                              [employee.id]: e.target.value
                            })}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#161950] focus:border-transparent"
                          >
                            <option value="">Select role</option>
                            {isLoadingRoles ? (
                              <option>Loading roles...</option>
                            ) : (
                              allRoles.map(role => (
                                <option key={role.id} value={role.name}>
                                  {role.name}
                                </option>
                              ))
                            )}
                          </select>
                        ) : (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                            {currentRole || getRoleName((employee as any).role) || 'Not assigned'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveClick(employee.id, (employee as any).user_id)}
                                className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-all"
                              >
                                <Save className="w-3 h-3" />
                                Save
                              </button>
                              <button
                                onClick={() => setEditingEmployee(null)}
                                className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-all"
                              >
                                <X className="w-3 h-3" />
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleEditClick(employee.id, employee)}
                              className="flex items-center gap-1 px-3 py-2 text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-all"
                              style={{ backgroundColor: '#161950' }}
                            >
                              <Edit2 className="w-3 h-3" />
                              Edit
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

