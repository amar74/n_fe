/**
 * AddTeamMemberModal Component
 * Modal for selecting and adding employees to an account team
 */
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAccountTeam } from '@/hooks/useAccountTeam';
import { useEmployees } from '@/hooks/useEmployees';
import { Search, Briefcase, Mail, MapPin, CheckCircle2 } from 'lucide-react';

export interface AddTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: string;
}

export function AddTeamMemberModal({ isOpen, onClose, accountId }: AddTeamMemberModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [roleInAccount, setRoleInAccount] = useState('');

  const { employees, isLoading: isLoadingEmployees } = useEmployees();
  const { addTeamMember, isAdding, teamMembers } = useAccountTeam(accountId);

  // Filter employees: only show ACTIVATED employees (status='active' AND user_id exists)
  // Activated employees are those with user accounts created by admin
  const assignedEmployeeIds = new Set(teamMembers.map(tm => tm.employee_id));
  const filteredEmployees = (employees || []).filter(emp => {
    // Only show activated employees (those with user accounts)
    const empData = emp as any;
    if (emp.status !== 'active' || !empData.user_id) return false;
    
    // Exclude already assigned employees
    if (assignedEmployeeIds.has(emp.id)) return false;
    
    // Apply search filter
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      emp.name.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query) ||
      emp.employee_number.toLowerCase().includes(query) ||
      emp.job_title?.toLowerCase().includes(query) ||
      emp.department?.toLowerCase().includes(query)
    );
  });

  const selectedEmployee = (employees || []).find(emp => emp.id === selectedEmployeeId);

  const handleAdd = async () => {
    if (!selectedEmployeeId) return;

    try {
      await addTeamMember({
        employee_id: selectedEmployeeId,
        role_in_account: roleInAccount || undefined,
      });
      
      // Reset and close
      setSelectedEmployeeId(null);
      setRoleInAccount('');
      setSearchQuery('');
      onClose();
    } catch (error) {
      console.error('Error adding team member:', error);
    }
  };

  const handleClose = () => {
    setSelectedEmployeeId(null);
    setRoleInAccount('');
    setSearchQuery('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Only activated employees (with user accounts) are available for team assignment
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search employees by name, email, or employee number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected Employee Info */}
          {selectedEmployee && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <p className="text-sm font-medium text-indigo-900 mb-2">Selected Employee:</p>
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-indigo-600">
                    {selectedEmployee.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{selectedEmployee.name}</p>
                  <p className="text-sm text-gray-600">{selectedEmployee.job_title || selectedEmployee.role}</p>
                  <p className="text-sm text-gray-500">{selectedEmployee.email}</p>
                </div>
              </div>

              {/* Role in Account Input */}
              <div className="mt-4">
                <Label htmlFor="role">Role in This Account (Optional)</Label>
                <Input
                  id="role"
                  type="text"
                  placeholder="e.g., Lead Developer, Project Manager, Consultant"
                  value={roleInAccount}
                  onChange={(e) => setRoleInAccount(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Specify their role or responsibility for this specific account
                </p>
              </div>
            </div>
          )}

          {/* Employee List */}
          <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
            {isLoadingEmployees ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : employees.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  No Employees in System
                </h3>
                <p className="text-gray-500 text-sm max-w-md">
                  Please add employees to your organization first before assigning them to accounts.
                </p>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  {searchQuery ? 'No Employees Found' : 'No Available Employees'}
                </h3>
                <p className="text-gray-500 text-sm max-w-md">
                  {searchQuery 
                    ? 'Try adjusting your search criteria.'
                    : 'All activated employees (with user accounts) have already been assigned to this account.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <button
                    key={employee.id}
                    onClick={() => setSelectedEmployeeId(employee.id)}
                    className={`w-full p-4 flex items-start space-x-3 hover:bg-gray-50 transition-colors text-left ${
                      selectedEmployeeId === employee.id ? 'bg-indigo-50 hover:bg-indigo-50' : ''
                    }`}
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-gray-600">
                        {employee.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900 truncate">{employee.name}</p>
                        {selectedEmployeeId === employee.id && (
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{employee.employee_number}</p>
                      <div className="mt-2 space-y-1">
                        {employee.job_title && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Briefcase className="w-3 h-3 text-gray-400" />
                            <span className="truncate">{employee.job_title}</span>
                          </div>
                        )}
                        {employee.email && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span className="truncate">{employee.email}</span>
                          </div>
                        )}
                        {employee.location && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="truncate">{employee.location}</span>
                          </div>
                        )}
                      </div>
                      {employee.skills && employee.skills.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {employee.skills.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {skill}
                            </span>
                          ))}
                          {employee.skills.length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                              +{employee.skills.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isAdding}>
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!selectedEmployeeId || isAdding}
            className="bg-indigo-950 hover:bg-indigo-900 text-white"
          >
            {isAdding ? 'Adding...' : 'Add to Team'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

