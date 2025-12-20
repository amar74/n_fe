/**
 * TeamTab Component
 * Displays and manages team members assigned to an account
 */
import React, { useState } from 'react';
import { useAccountTeam, type AccountTeamMember } from '@/hooks/accounts';
import { Button } from '@/components/ui/button';
import { Plus, Mail, Phone, MapPin, Briefcase, DollarSign, X, LayoutGrid, List } from 'lucide-react';
import { AddTeamMemberModal } from './components/AddTeamMemberModal';

export interface TeamTabProps {
  accountId: string;
}

type ViewMode = 'grid' | 'list';

export function TeamTab({ accountId }: TeamTabProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  const {
    teamMembers,
    totalCount,
    isLoading,
    isRemoving,
    removeTeamMember,
  } = useAccountTeam(accountId);

  const handleRemoveMember = async (memberId: number, employeeName: string) => {
    if (window.confirm(`Are you sure you want to remove ${employeeName} from this account team?`)) {
      try {
        await removeTeamMember(memberId);
      } catch (error) {
        console.error('Error removing team member:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Members</h2>
          <p className="text-sm text-gray-600 mt-1.5">
            {totalCount} {totalCount === 1 ? 'member' : 'members'} assigned to this account
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-indigo-950 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-indigo-950 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-950 hover:bg-indigo-900 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Team Member
          </Button>
        </div>
      </div>

      {teamMembers.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-dashed border-gray-300 rounded-2xl p-16 text-center">
          <div className="flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-2xl flex items-center justify-center mb-6 border-2 border-indigo-100">
              <Briefcase className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Team Members Yet</h3>
            <p className="text-gray-600 mb-8 max-w-md text-base">
              Start building your account team by adding employees who will work on this account.
            </p>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-indigo-950 hover:bg-indigo-900 text-white px-6 py-3 text-base"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add First Team Member
            </Button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              onRemove={() => handleRemoveMember(member.id, member.employee?.name || 'Employee')}
              isRemoving={isRemoving}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {teamMembers.map((member) => (
            <TeamMemberListItem
              key={member.id}
              member={member}
              onRemove={() => handleRemoveMember(member.id, member.employee?.name || 'Employee')}
              isRemoving={isRemoving}
            />
          ))}
        </div>
      )}

      <AddTeamMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        accountId={accountId}
      />
    </div>
  );
}

interface TeamMemberCardProps {
  member: AccountTeamMember;
  onRemove: () => void;
  isRemoving: boolean;
}

function TeamMemberCard({ member, onRemove, isRemoving }: TeamMemberCardProps) {
  const employee = member.employee;

  if (!employee) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-gray-300 transition-all duration-200 relative group">
      <button
        onClick={onRemove}
        disabled={isRemoving}
        className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
        title="Remove from team"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start space-x-4 mb-5">
        <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-indigo-100">
          <span className="text-lg font-bold text-indigo-900">
            {employee.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 truncate">
            {employee.name}
          </h3>
          <p className="text-sm text-gray-500 font-medium mt-0.5">
            {employee.employee_number}
          </p>
        </div>
      </div>

      {member.role_in_account && (
        <div className="mb-5 pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-2 bg-indigo-50 px-3 py-2 rounded-lg">
            <Briefcase className="w-4 h-4 text-indigo-900" />
            <span className="text-sm font-semibold text-gray-900">Role:</span>
            <span className="text-sm font-medium text-indigo-900">{member.role_in_account}</span>
          </div>
        </div>
      )}

      <div className="space-y-3.5">
        {employee.job_title && (
          <div className="flex items-center space-x-2 text-sm">
            <Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-700 truncate">{employee.job_title}</span>
          </div>
        )}

        {employee.email && (
          <div className="flex items-center space-x-2 text-sm">
            <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <a
              href={`mailto:${employee.email}`}
              className="text-indigo-600 hover:text-indigo-700 truncate"
            >
              {employee.email}
            </a>
          </div>
        )}

        {employee.phone && (
          <div className="flex items-center space-x-2 text-sm">
            <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <a
              href={`tel:${employee.phone}`}
              className="text-gray-700 hover:text-indigo-600"
            >
              {employee.phone}
            </a>
          </div>
        )}

        {employee.location && (
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-700 truncate">{employee.location}</span>
          </div>
        )}

        {employee.department && (
          <div className="text-sm">
            <span className="text-gray-500">Department: </span>
            <span className="text-gray-700 font-medium">{employee.department}</span>
          </div>
        )}

        {employee.bill_rate && (
          <div className="flex items-center space-x-2 text-sm">
            <DollarSign className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-gray-700">
              ${employee.bill_rate}/hr
            </span>
          </div>
        )}

        {employee.experience && (
          <div className="text-sm">
            <span className="text-gray-500">Experience: </span>
            <span className="text-gray-700 font-medium">{employee.experience}</span>
          </div>
        )}

        {employee.skills && employee.skills.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-700 mb-2.5">Skills:</p>
            <div className="flex flex-wrap gap-1.5">
              {employee.skills.slice(0, 5).map((skill, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 bg-indigo-50 text-indigo-900 text-xs font-medium rounded-md border border-indigo-100"
                >
                  {skill}
                </span>
              ))}
              {employee.skills.length > 5 && (
                <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md border border-gray-200">
                  +{employee.skills.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${
          employee.status === 'active'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : employee.status === 'accepted'
            ? 'bg-blue-50 text-blue-800 border border-blue-200'
            : employee.status === 'pending'
            ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
            : 'bg-gray-100 text-gray-800 border border-gray-200'
        }`}>
          {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
        </span>
      </div>
    </div>
  );
}

interface TeamMemberListItemProps {
  member: AccountTeamMember;
  onRemove: () => void;
  isRemoving: boolean;
}

function TeamMemberListItem({ member, onRemove, isRemoving }: TeamMemberListItemProps) {
  const employee = member.employee;

  if (!employee) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-gray-300 transition-all duration-200 relative group">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-indigo-100">
          <span className="text-base font-bold text-indigo-900">
            {employee.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-gray-900 truncate">
            {employee.name}
          </h3>
          <p className="text-sm text-gray-500 font-medium">
            {employee.employee_number}
          </p>
        </div>

        {member.role_in_account && (
          <div className="hidden md:flex items-center px-3 py-1.5 bg-indigo-50 rounded-lg border border-indigo-100">
            <Briefcase className="w-4 h-4 text-indigo-900 mr-1.5" />
            <span className="text-sm font-semibold text-indigo-900">{member.role_in_account}</span>
          </div>
        )}

        {employee.job_title && (
          <div className="hidden lg:flex items-center text-sm text-gray-700 min-w-[150px]">
            <Briefcase className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
            <span className="truncate">{employee.job_title}</span>
          </div>
        )}

        <div className="hidden xl:flex items-center gap-4">
          {employee.email && (
            <a
              href={`mailto:${employee.email}`}
              className="flex items-center text-sm text-indigo-600 hover:text-indigo-700"
              title={employee.email}
            >
              <Mail className="w-4 h-4 mr-1.5" />
              <span className="max-w-[180px] truncate">{employee.email}</span>
            </a>
          )}
          {employee.phone && (
            <a
              href={`tel:${employee.phone}`}
              className="flex items-center text-sm text-gray-700 hover:text-indigo-600"
            >
              <Phone className="w-4 h-4 mr-1.5" />
              <span>{employee.phone}</span>
            </a>
          )}
        </div>

        {employee.location && (
          <div className="hidden lg:flex items-center text-sm text-gray-600 min-w-[120px]">
            <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
            <span className="truncate">{employee.location}</span>
          </div>
        )}

        {employee.bill_rate && (
          <div className="hidden xl:flex items-center text-sm font-medium text-green-700 min-w-[80px]">
            <DollarSign className="w-4 h-4 mr-0.5" />
            <span>{employee.bill_rate}/hr</span>
          </div>
        )}

        <span className={`hidden md:inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${
          employee.status === 'active'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : employee.status === 'accepted'
            ? 'bg-blue-50 text-blue-800 border border-blue-200'
            : employee.status === 'pending'
            ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
            : 'bg-gray-100 text-gray-800 border border-gray-200'
        }`}>
          {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
        </span>

        <button
          onClick={onRemove}
          disabled={isRemoving}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
          title="Remove from team"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {employee.skills && employee.skills.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-1.5">
          {employee.skills.slice(0, 4).map((skill, index) => (
            <span
              key={index}
              className="px-2.5 py-1 bg-indigo-50 text-indigo-900 text-xs font-medium rounded-md border border-indigo-100"
            >
              {skill}
            </span>
          ))}
          {employee.skills.length > 4 && (
            <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md border border-gray-200">
              +{employee.skills.length - 4} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}

