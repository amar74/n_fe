import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Save,
  X,
  Lock,
  Unlock,
  CheckCircle2,
  Eye,
  Grid3x3,
  List,
} from 'lucide-react';
import { useToast } from '@/hooks/shared';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { useAuth } from '@/hooks/auth';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  color?: string;
}

interface RoleCreate {
  name: string;
  description: string;
  permissions: string[];
  color?: string;
}

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

// System roles (predefined, cannot be deleted)
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

export function RoleManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { authState } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<RoleCreate>({
    name: '',
    description: '',
    permissions: [],
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  });

  // Check if user is admin
  const isAdmin = authState.user?.role?.toLowerCase() === 'admin' || 
                 authState.user?.role?.toLowerCase() === 'vendor' ||
                 authState.user?.role?.toLowerCase() === 'super_admin';

  // Fetch all roles from API (system + custom)
  const { data: allRolesData, isLoading } = useQuery<{ roles: Role[] }>({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await apiClient.get('/resources/roles');
      return response.data;
    },
  });

  // Separate system and custom roles
  const systemRolesList = allRolesData?.roles?.filter((r: Role) => r.isSystem) || SYSTEM_ROLES;
  const customRoles = allRolesData?.roles?.filter((r: Role) => !r.isSystem) || [];

  // Create role mutation
  const createMutation = useMutation({
    mutationFn: async (data: RoleCreate) => {
      const response = await apiClient.post('/resources/roles', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast({
        title: '✅ Role Created',
        description: 'Custom role has been created successfully.',
      });
      setIsCreateDialogOpen(false);
      setFormData({ name: '', description: '', permissions: [], color: 'bg-indigo-100 text-indigo-700 border-indigo-200' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to create role',
        variant: 'destructive',
      });
    },
  });

  // Update role mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<RoleCreate> }) => {
      const response = await apiClient.put(`/resources/roles/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast({
        title: '✅ Role Updated',
        description: 'Role has been updated successfully.',
      });
      setEditingRole(null);
      setFormData({ name: '', description: '', permissions: [], color: 'bg-indigo-100 text-indigo-700 border-indigo-200' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to update role',
        variant: 'destructive',
      });
    },
  });

  // Delete role mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/resources/roles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast({
        title: '✅ Role Deleted',
        description: 'Role has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to delete role',
        variant: 'destructive',
      });
    },
  });

  const handleCreate = () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Role name is required',
        variant: 'destructive',
      });
      return;
    }
    if (formData.permissions.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'At least one permission must be selected',
        variant: 'destructive',
      });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleUpdate = () => {
    if (!editingRole || !formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Role name is required',
        variant: 'destructive',
      });
      return;
    }
    updateMutation.mutate({ id: editingRole.id, data: formData });
  };

  const handleDelete = (role: Role) => {
    if (window.confirm(`Are you sure you want to delete "${role.name}"? Employees with this role will need to be reassigned.`)) {
      deleteMutation.mutate(role.id);
    }
  };

  const handleEditClick = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      color: role.color || 'bg-indigo-100 text-indigo-700 border-indigo-200',
    });
  };

  const togglePermission = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const permissionsByCategory = AVAILABLE_PERMISSIONS.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_PERMISSIONS>);

  // Use roles from API, fallback to SYSTEM_ROLES if API fails
  const allRoles = systemRolesList.length > 0 ? systemRolesList : SYSTEM_ROLES;

  return (
    <Card className="border border-gray-200 shadow-sm bg-white">
      <CardHeader className="border-b border-gray-200 bg-gray-50/50 px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#161950] rounded-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">
                Role Management
              </CardTitle>
              <p className="text-sm text-gray-500 mt-0.5">
                Manage roles and permissions for your organization
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 p-1 bg-white border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[#161950] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Grid View"
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#161950] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            {isAdmin && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditMode(!isEditMode)}
                  className="flex items-center gap-2 h-10 px-4 border-gray-300"
                >
                  {isEditMode ? (
                    <>
                      <Lock className="h-4 w-4" />
                      Lock Editing
                    </>
                  ) : (
                    <>
                      <Unlock className="h-4 w-4" />
                      Enable Editing
                    </>
                  )}
                </Button>
                {isEditMode && (
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        className="bg-[#161950] hover:bg-[#0f1440] text-white shadow-sm h-10 px-4"
                        onClick={() => {
                          setFormData({ name: '', description: '', permissions: [], color: 'bg-indigo-100 text-indigo-700 border-indigo-200' });
                          setEditingRole(null);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Role
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader className="pb-4 border-b border-gray-200">
                        <DialogTitle className="text-xl font-bold text-gray-900">Create New Role</DialogTitle>
                        <DialogDescription className="text-sm text-gray-600 mt-1">
                          Create a custom role with specific permissions for your organization
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-5 py-6">
                        <div>
                          <label className="text-sm font-semibold text-gray-900 mb-2 block">
                            Role Name <span className="text-red-500">*</span>
                          </label>
                          <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Project Coordinator, Finance Manager"
                            className="h-11 border-gray-300 focus:border-[#161950] focus:ring-[#161950]"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-900 mb-2 block">
                            Description <span className="text-red-500">*</span>
                          </label>
                          <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe the responsibilities and access level for this role..."
                            rows={3}
                            className="border-gray-300 focus:border-[#161950] focus:ring-[#161950] resize-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-900 mb-3 block">
                            Permissions <span className="text-red-500">*</span>
                            <span className="text-gray-500 font-normal text-xs ml-2">
                              ({formData.permissions.length} selected)
                            </span>
                          </label>
                          <div className="space-y-4 max-h-[400px] overflow-y-auto border-2 border-gray-200 rounded-xl p-5 bg-gray-50/50">
                            {Object.entries(permissionsByCategory).map(([category, perms]) => (
                              <div key={category} className="space-y-3">
                                <h4 className="font-bold text-sm text-gray-900 uppercase tracking-wide border-b border-gray-300 pb-1.5">
                                  {category}
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                  {perms.map(perm => (
                                    <label
                                      key={perm.id}
                                      className="flex items-center gap-2.5 cursor-pointer hover:bg-white p-2.5 rounded-lg border border-transparent hover:border-gray-300 transition-all"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={formData.permissions.includes(perm.id)}
                                        onChange={() => togglePermission(perm.id)}
                                        className="w-4 h-4 text-[#161950] border-gray-300 rounded focus:ring-[#161950] focus:ring-2"
                                      />
                                      <span className="text-sm text-gray-700 font-medium">{perm.label}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <DialogFooter className="pt-4 border-t border-gray-200">
                        <Button
                          variant="outline"
                          onClick={() => setIsCreateDialogOpen(false)}
                          disabled={createMutation.isPending}
                          className="h-10 px-6 border-gray-300"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreate}
                          disabled={createMutation.isPending}
                          className="bg-[#161950] hover:bg-[#0f1440] text-white h-10 px-6"
                        >
                          {createMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Create Role
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {!isEditMode && (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-gray-200 rounded">
                <Eye className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">View Mode</p>
                <p className="text-sm text-gray-600 mt-1">
                  Roles and permissions are displayed in read-only mode. {isAdmin ? 'Enable editing to modify roles.' : 'Contact an administrator to modify roles.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#161950]" />
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-5">
                <div className="h-px flex-1 bg-gray-200"></div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide px-3">
                  System Roles (Predefined)
                </h3>
                <div className="h-px flex-1 bg-gray-200"></div>
              </div>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allRoles.map((role) => (
                    <div
                      key={role.id}
                      className={`group relative border-2 rounded-xl p-5 bg-white transition-all duration-200 ${role.color?.includes('border') ? role.color : 'border-gray-200 hover:border-gray-300'} ${role.color?.includes('bg-') ? role.color.split(' ')[0] : ''}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <div className={`p-2 rounded-lg shrink-0 ${role.color?.includes('bg-blue') ? 'bg-blue-200' : role.color?.includes('bg-purple') ? 'bg-purple-200' : role.color?.includes('bg-amber') ? 'bg-amber-200' : role.color?.includes('bg-red') ? 'bg-red-200' : 'bg-gray-200'}`}>
                            <Shield className="w-4 h-4 text-gray-700" />
                          </div>
                          <h3 className="font-bold text-gray-900 text-base truncate">{role.name}</h3>
                        </div>
                        <Badge variant="outline" className="text-xs font-medium border-gray-300 bg-white text-gray-700 shrink-0">
                          System
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">{role.description}</p>
                      <div className="space-y-2.5">
                        <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                          Permissions ({role.permissions.length})
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {role.permissions.slice(0, 3).map(permId => {
                            const perm = AVAILABLE_PERMISSIONS.find(p => p.id === permId);
                            return perm ? (
                              <Badge 
                                key={permId} 
                                variant="outline" 
                                className="text-xs font-medium border-gray-300 bg-gray-50 text-gray-700"
                              >
                                {perm.label}
                              </Badge>
                            ) : null;
                          })}
                          {role.permissions.length > 3 && (
                            <Badge 
                              variant="outline" 
                              className="text-xs font-medium border-gray-300 bg-gray-50 text-gray-700"
                            >
                              +{role.permissions.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {allRoles.map((role) => (
                    <div
                      key={role.id}
                      className={`group flex items-center gap-4 p-4 border-2 rounded-xl bg-white transition-all duration-200 ${role.color?.includes('border') ? role.color : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className={`p-3 rounded-lg shrink-0 ${role.color?.includes('bg-blue') ? 'bg-blue-200' : role.color?.includes('bg-purple') ? 'bg-purple-200' : role.color?.includes('bg-amber') ? 'bg-amber-200' : role.color?.includes('bg-red') ? 'bg-red-200' : 'bg-gray-200'}`}>
                        <Shield className="w-5 h-5 text-gray-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-gray-900 text-base">{role.name}</h3>
                          <Badge variant="outline" className="text-xs font-medium border-gray-300 bg-white text-gray-700">
                            System
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed mb-2">{role.description}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                            Permissions ({role.permissions.length}):
                          </span>
                          {role.permissions.slice(0, 5).map(permId => {
                            const perm = AVAILABLE_PERMISSIONS.find(p => p.id === permId);
                            return perm ? (
                              <Badge 
                                key={permId} 
                                variant="outline" 
                                className="text-xs font-medium border-gray-300 bg-gray-50 text-gray-700"
                              >
                                {perm.label}
                              </Badge>
                            ) : null;
                          })}
                          {role.permissions.length > 5 && (
                            <Badge 
                              variant="outline" 
                              className="text-xs font-medium border-gray-300 bg-gray-50 text-gray-700"
                            >
                              +{role.permissions.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {customRoles && customRoles.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <div className="h-px flex-1 bg-gray-200"></div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide px-3">
                    Custom Roles
                  </h3>
                  <div className="h-px flex-1 bg-gray-200"></div>
                </div>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {customRoles.map((role) => (
                      <div
                        key={role.id}
                        className="group relative border-2 border-gray-200 rounded-xl p-5 bg-white hover:border-[#161950] hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-[#161950] transition-colors shrink-0">
                              <Shield className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="font-bold text-gray-900 text-base truncate">{role.name}</h3>
                          </div>
                          {isEditMode && (
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleEditClick(role)}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Edit Role"
                              >
                                <Edit className="w-4 h-4 text-gray-600" />
                              </button>
                              <button
                                onClick={() => handleDelete(role)}
                                className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Role"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">{role.description}</p>
                        <div className="space-y-2.5">
                          <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                            Permissions ({role.permissions.length})
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {role.permissions.slice(0, 3).map(permId => {
                              const perm = AVAILABLE_PERMISSIONS.find(p => p.id === permId);
                              return perm ? (
                                <Badge 
                                  key={permId} 
                                  variant="outline" 
                                  className="text-xs font-medium border-gray-300 bg-gray-50 text-gray-700"
                                >
                                  {perm.label}
                                </Badge>
                              ) : null;
                            })}
                            {role.permissions.length > 3 && (
                              <Badge 
                                variant="outline" 
                                className="text-xs font-medium border-gray-300 bg-gray-50 text-gray-700"
                              >
                                +{role.permissions.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {customRoles.map((role) => (
                      <div
                        key={role.id}
                        className="group flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl bg-white hover:border-[#161950] hover:shadow-md transition-all duration-200"
                      >
                        <div className="p-3 rounded-lg bg-gray-100 group-hover:bg-[#161950] transition-colors shrink-0">
                          <Shield className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-bold text-gray-900 text-base">{role.name}</h3>
                            {isEditMode && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleEditClick(role)}
                                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                  title="Edit Role"
                                >
                                  <Edit className="w-4 h-4 text-gray-600" />
                                </button>
                                <button
                                  onClick={() => handleDelete(role)}
                                  className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Role"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </button>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed mb-2">{role.description}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                              Permissions ({role.permissions.length}):
                            </span>
                            {role.permissions.slice(0, 5).map(permId => {
                              const perm = AVAILABLE_PERMISSIONS.find(p => p.id === permId);
                              return perm ? (
                                <Badge 
                                  key={permId} 
                                  variant="outline" 
                                  className="text-xs font-medium border-gray-300 bg-gray-50 text-gray-700"
                                >
                                  {perm.label}
                                </Badge>
                              ) : null;
                            })}
                            {role.permissions.length > 5 && (
                              <Badge 
                                variant="outline" 
                                className="text-xs font-medium border-gray-300 bg-gray-50 text-gray-700"
                              >
                                +{role.permissions.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {(!customRoles || customRoles.length === 0) && isEditMode && (
              <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 mb-4">
                  <Shield className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-900 font-semibold text-base mb-1">No custom roles yet</p>
                <p className="text-sm text-gray-500 mb-6">
                  Create custom roles with specific permissions
                </p>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-[#161950] hover:bg-[#0f1440] text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Custom Role
                </Button>
              </div>
            )}
          </div>
        )}

        {editingRole && isEditMode && (
          <Dialog open={!!editingRole} onOpenChange={() => setEditingRole(null)}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="pb-4 border-b border-gray-200">
                <DialogTitle className="text-xl font-bold text-gray-900">Edit Role</DialogTitle>
                <DialogDescription className="text-sm text-gray-600 mt-1">
                  Update role information and permissions
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-5 py-6">
                <div>
                  <label className="text-sm font-semibold text-gray-900 mb-2 block">
                    Role Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Project Coordinator"
                    className="h-11 border-gray-300 focus:border-[#161950] focus:ring-[#161950]"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-900 mb-2 block">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the responsibilities and access level for this role..."
                    rows={3}
                    className="border-gray-300 focus:border-[#161950] focus:ring-[#161950] resize-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-900 mb-3 block">
                    Permissions <span className="text-red-500">*</span>
                    <span className="text-gray-500 font-normal text-xs ml-2">
                      ({formData.permissions.length} selected)
                    </span>
                  </label>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto border-2 border-gray-200 rounded-xl p-5 bg-gray-50/50">
                    {Object.entries(permissionsByCategory).map(([category, perms]) => (
                      <div key={category} className="space-y-3">
                        <h4 className="font-bold text-sm text-gray-900 uppercase tracking-wide border-b border-gray-300 pb-1.5">
                          {category}
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {perms.map(perm => (
                            <label
                              key={perm.id}
                              className="flex items-center gap-2.5 cursor-pointer hover:bg-white p-2.5 rounded-lg border border-transparent hover:border-gray-300 transition-all"
                            >
                              <input
                                type="checkbox"
                                checked={formData.permissions.includes(perm.id)}
                                onChange={() => togglePermission(perm.id)}
                                className="w-4 h-4 text-[#161950] border-gray-300 rounded focus:ring-[#161950] focus:ring-2"
                              />
                              <span className="text-sm text-gray-700 font-medium">{perm.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter className="pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setEditingRole(null)}
                  disabled={updateMutation.isPending}
                  className="h-10 px-6 border-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdate}
                  disabled={updateMutation.isPending}
                  className="bg-[#161950] hover:bg-[#0f1440] text-white h-10 px-6"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Role
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}

