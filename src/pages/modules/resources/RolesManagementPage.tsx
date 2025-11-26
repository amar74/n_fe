import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Shield, Edit, Trash2, Save, X, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useRoles, type Role } from '@/hooks/useRoles';

const AVAILABLE_PERMISSIONS = [
  { id: 'view_projects', label: 'View Projects', category: 'Projects' },
  { id: 'edit_projects', label: 'Edit Projects', category: 'Projects' },
  { id: 'delete_projects', label: 'Delete Projects', category: 'Projects' },
  { id: 'view_accounts', label: 'View Accounts', category: 'Accounts' },
  { id: 'edit_accounts', label: 'Edit Accounts', category: 'Accounts' },
  { id: 'delete_accounts', label: 'Delete Accounts', category: 'Accounts' },
  { id: 'view_opportunities', label: 'View Opportunities', category: 'Opportunities' },
  { id: 'edit_opportunities', label: 'Edit Opportunities', category: 'Opportunities' },
  { id: 'view_resources', label: 'View Resources', category: 'Resources' },
  { id: 'edit_resources', label: 'Edit Resources', category: 'Resources' },
  { id: 'manage_team', label: 'Manage Team', category: 'Team' },
  { id: 'view_reports', label: 'View Reports', category: 'Reports' },
  { id: 'export_data', label: 'Export Data', category: 'Reports' },
  { id: 'manage_roles', label: 'Manage Roles', category: 'System' },
  { id: 'system_settings', label: 'System Settings', category: 'System' },
];

// Predefined system roles (cannot be deleted)
const SYSTEM_ROLES: Role[] = [
  {
    id: 'employee',
    name: 'Employee',
    description: 'Standard employee with basic access to assigned work',
    permissions: ['view_projects', 'view_accounts', 'view_resources'],
    isSystem: true,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  {
    id: 'team_lead',
    name: 'Team Lead',
    description: 'Manages team members and projects',
    permissions: ['view_projects', 'edit_projects', 'view_accounts', 'edit_accounts', 'view_resources', 'manage_team', 'view_reports'],
    isSystem: true,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Department management with extended access',
    permissions: ['view_projects', 'edit_projects', 'view_accounts', 'edit_accounts', 'view_opportunities', 'edit_opportunities', 'view_resources', 'edit_resources', 'manage_team', 'view_reports', 'export_data'],
    isSystem: true,
    color: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'Full system access including role management',
    permissions: AVAILABLE_PERMISSIONS.map(p => p.id),
    isSystem: true,
    color: 'bg-red-100 text-red-700 border-red-200',
  },
];

function RolesManagementPage() {
  const { allRoles, systemRoles, customRoles, isLoading, createRole, updateRole, deleteRole } = useRoles();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const handleCreateRole = (roleData: Omit<Role, 'id'>) => {
    createRole(roleData);
    setIsCreateModalOpen(false);
  };

  const handleUpdateRole = (roleId: string, roleData: Partial<Role>) => {
    updateRole(roleId, roleData);
    setEditingRole(null);
  };

  const handleDeleteRole = (roleId: string) => {
    if (window.confirm('Are you sure you want to delete this role? Employees with this role will need to be reassigned.')) {
      deleteRole(roleId);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F3F2] font-outfit">
      <div className="flex flex-col w-full p-6 gap-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link to="/" className="text-gray-500 text-sm hover:text-gray-900">Dashboard</Link>
          <span className="text-gray-500">/</span>
          <Link to="/module/resources" className="text-gray-500 text-sm hover:text-gray-900">Resources</Link>
          <span className="text-gray-500">/</span>
          <span className="text-gray-900 text-sm font-semibold">Roles Management</span>
        </div>

        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Roles Management</h1>
            <p className="text-gray-600 text-sm mt-1">
              Create and manage roles with specific permissions (RBAC)
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#151950] hover:bg-[#1e2570] text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create New Role
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
              <p className="text-gray-600 font-outfit">Loading roles...</p>
            </div>
          </div>
        )}

        {/* System Roles */}
        {!isLoading && systemRoles && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#151950]" />
              System Roles (Default)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {systemRoles.map((role) => (
                <RoleCard
                  key={role.id}
                  role={role}
                  onEdit={null}
                  onDelete={null}
                />
              ))}
            </div>
          </div>
        )}

        {/* Custom Roles */}
        {!isLoading && customRoles && customRoles.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Custom Roles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {customRoles.map((role) => (
                <RoleCard
                  key={role.id}
                  role={role}
                  onEdit={() => setEditingRole(role)}
                  onDelete={() => handleDeleteRole(role.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Permissions Reference */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Permissions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(
              AVAILABLE_PERMISSIONS.reduce((acc, perm) => {
                if (!acc[perm.category]) acc[perm.category] = [];
                acc[perm.category].push(perm);
                return acc;
              }, {} as Record<string, typeof AVAILABLE_PERMISSIONS>)
            ).map(([category, perms]) => (
              <div key={category} className="border border-gray-200 rounded-xl p-4">
                <h3 className="font-semibold text-sm text-gray-700 mb-2">{category}</h3>
                <ul className="space-y-1">
                  {perms.map(perm => (
                    <li key={perm.id} className="text-sm text-gray-600 flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                      {perm.label}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create/Edit Role Modal */}
      {(isCreateModalOpen || editingRole) && (
        <RoleModal
          role={editingRole}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingRole(null);
          }}
          onSave={(data) => {
            if (editingRole) {
              handleUpdateRole(editingRole.id, data);
            } else {
              handleCreateRole(data);
            }
          }}
        />
      )}
    </div>
  );
}

// Role Card Component
function RoleCard({
  role,
  onEdit,
  onDelete,
}: {
  role: Role;
  onEdit: (() => void) | null;
  onDelete: (() => void) | null;
}) {
  return (
    <div className={`border-2 rounded-xl p-4 ${role.color || 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          <h3 className="font-semibold">{role.name}</h3>
        </div>
        {!role.isSystem && (
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-1 hover:bg-white/50 rounded"
                title="Edit Role"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-1 hover:bg-red-100 rounded"
                title="Delete Role"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            )}
          </div>
        )}
      </div>
      <p className="text-sm opacity-80 mb-3">{role.description}</p>
      <div className="flex items-center justify-between text-sm">
        <span className="opacity-70">{role.permissions?.length ?? 0} permissions</span>
        {role.isSystem && (
          <span className="text-xs px-2 py-1 bg-white/50 rounded">System</span>
        )}
      </div>
    </div>
  );
}

// Role Modal Component
function RoleModal({
  role,
  onClose,
  onSave,
}: {
  role: Role | null;
  onClose: () => void;
  onSave: (data: Omit<Role, 'id' | 'isSystem'>) => void;
}) {
  const [name, setName] = useState(role?.name || '');
  const [description, setDescription] = useState(role?.description || '');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(role?.permissions || []);
  const [color, setColor] = useState(role?.color || 'bg-indigo-100 text-indigo-700 border-indigo-200');

  const togglePermission = (permId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permId)
        ? prev.filter(p => p !== permId)
        : [...prev, permId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Role name is required');
      return;
    }
    onSave({ name, description, permissions: selectedPermissions, color });
  };

  const permissionsByCategory = AVAILABLE_PERMISSIONS.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_PERMISSIONS>);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-[#151950] to-[#1e2570] text-white px-8 py-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6" />
              <h2 className="text-2xl font-bold">
                {role ? 'Edit Role' : 'Create New Role'}
              </h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-3">
            <Label>Role Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Project Coordinator"
              required
            />
          </div>

          <div className="space-y-3">
            <Label>Description</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the responsibilities and access level..."
              className="w-full p-3 border border-gray-300 rounded-lg min-h-[80px]"
            />
          </div>

          <div className="space-y-3">
            <Label>Permissions *</Label>
            <p className="text-sm text-gray-600">Select default permissions for this role</p>
            <div className="space-y-4 max-h-[400px] overflow-y-auto border border-gray-200 rounded-xl p-4">
              {Object.entries(permissionsByCategory).map(([category, perms]) => (
                <div key={category} className="space-y-2">
                  <h4 className="font-semibold text-sm text-gray-700">{category}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {perms.map(perm => (
                      <label
                        key={perm.id}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(perm.id)}
                          onChange={() => togglePermission(perm.id)}
                          className="w-4 h-4 text-[#151950] border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Selected: {selectedPermissions.length} of {AVAILABLE_PERMISSIONS.length} permissions
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button type="button" onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#151950] hover:bg-[#1e2570] text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {role ? 'Update Role' : 'Create Role'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default memo(RolesManagementPage);

