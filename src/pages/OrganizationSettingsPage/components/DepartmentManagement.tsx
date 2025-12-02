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
  FolderTree,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Save,
  X,
  Building2,
  Grid3x3,
  List,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';

interface Department {
  id: string;
  org_id: string;
  name: string;
  code: string | null;
  description: string | null;
  manager_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface DepartmentCreate {
  name: string;
  code?: string;
  description?: string;
  manager_id?: string;
  is_active?: boolean;
}

export function DepartmentManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState<DepartmentCreate>({
    name: '',
    code: '',
    description: '',
    is_active: true,
  });

  // Fetch departments
  const { data: departments, isLoading } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await apiClient.get('/departments?include_inactive=false');
      return response.data;
    },
  });

  // Create department mutation
  const createMutation = useMutation({
    mutationFn: async (data: DepartmentCreate) => {
      const response = await apiClient.post('/departments', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast({
        title: '✅ Department Created',
        description: 'Department has been created successfully.',
      });
      setIsCreateDialogOpen(false);
      setFormData({ name: '', code: '', description: '', is_active: true });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to create department',
        variant: 'destructive',
      });
    },
  });

  // Update department mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DepartmentCreate> }) => {
      const response = await apiClient.put(`/departments/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast({
        title: '✅ Department Updated',
        description: 'Department has been updated successfully.',
      });
      setEditingDepartment(null);
      setFormData({ name: '', code: '', description: '', is_active: true });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to update department',
        variant: 'destructive',
      });
    },
  });

  // Delete department mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/departments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast({
        title: '✅ Department Deleted',
        description: 'Department has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to delete department',
        variant: 'destructive',
      });
    },
  });

  const handleCreate = () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Department name is required',
        variant: 'destructive',
      });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleUpdate = () => {
    if (!editingDepartment || !formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Department name is required',
        variant: 'destructive',
      });
      return;
    }
    updateMutation.mutate({ id: editingDepartment.id, data: formData });
  };

  const handleDelete = (department: Department) => {
    if (window.confirm(`Are you sure you want to delete "${department.name}"?`)) {
      deleteMutation.mutate(department.id);
    }
  };

  const handleEditClick = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      code: department.code || '',
      description: department.description || '',
      is_active: department.is_active,
    });
  };

  return (
    <Card className="border border-gray-200 shadow-sm bg-white">
      <CardHeader className="border-b border-gray-200 bg-gray-50/50 px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#161950] rounded-lg">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">
                Department Management
              </CardTitle>
              <p className="text-sm text-gray-500 mt-0.5">
                Create and manage organizational departments
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
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
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-[#161950] hover:bg-[#0f1440] text-white shadow-sm h-10 px-4"
                  onClick={() => {
                    setFormData({ name: '', code: '', description: '', is_active: true });
                    setEditingDepartment(null);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Department
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader className="pb-4 border-b border-gray-200">
                <DialogTitle className="text-xl font-bold text-gray-900">Create New Department</DialogTitle>
                <DialogDescription className="text-sm text-gray-600 mt-1">
                  Add a new department to organize your team structure
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-5 py-6">
                <div>
                  <label className="text-sm font-semibold text-gray-900 mb-2 block">
                    Department Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Engineering, Sales, HR"
                    className="h-11 border-gray-300 focus:border-[#161950] focus:ring-[#161950]"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-900 mb-2 block">
                    Department Code <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                  </label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., ENG, SALES, HR"
                    maxLength={20}
                    className="h-11 border-gray-300 focus:border-[#161950] focus:ring-[#161950]"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-900 mb-2 block">
                    Description <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the department's purpose and responsibilities..."
                    rows={4}
                    className="border-gray-300 focus:border-[#161950] focus:ring-[#161950] resize-none"
                  />
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
                      Create Department
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#161950]" />
          </div>
        ) : departments && departments.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  className="group relative p-5 border-2 border-gray-200 rounded-xl bg-white hover:border-[#161950] hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2.5 bg-gray-100 rounded-lg group-hover:bg-[#161950] transition-colors shrink-0">
                        <FolderTree className="h-4 w-4 text-gray-600 group-hover:text-white transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-base mb-1.5 truncate">
                          {dept.name}
                        </h3>
                        {dept.code && (
                          <Badge 
                            variant="outline" 
                            className="text-xs font-medium border-gray-300 text-gray-700 bg-gray-50 mb-2"
                          >
                            {dept.code}
                          </Badge>
                        )}
                        {dept.description && (
                          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mt-2">
                            {dept.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(dept)}
                      className="flex-1 h-9 text-sm font-medium border-gray-300 hover:bg-gray-50"
                    >
                      <Edit className="h-3.5 w-3.5 mr-1.5" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(dept)}
                      className="h-9 px-3 border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  className="group flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl bg-white hover:border-[#161950] hover:shadow-md transition-all duration-200"
                >
                  <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-[#161950] transition-colors shrink-0">
                    <FolderTree className="h-5 w-5 text-gray-600 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-gray-900 text-base">
                        {dept.name}
                      </h3>
                      {dept.code && (
                        <Badge 
                          variant="outline" 
                          className="text-xs font-medium border-gray-300 text-gray-700 bg-gray-50"
                        >
                          {dept.code}
                        </Badge>
                      )}
                    </div>
                    {dept.description && (
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {dept.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(dept)}
                      className="h-9 px-4 text-sm font-medium border-gray-300 hover:bg-gray-50"
                    >
                      <Edit className="h-3.5 w-3.5 mr-1.5" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(dept)}
                      className="h-9 px-3 border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <FolderTree className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-900 font-semibold text-base mb-1">No departments yet</p>
            <p className="text-sm text-gray-500 mb-6">
              Create your first department to organize your team
            </p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-[#161950] hover:bg-[#0f1440] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Department
            </Button>
          </div>
        )}

        {/* Edit Dialog */}
        {editingDepartment && (
          <Dialog open={!!editingDepartment} onOpenChange={() => setEditingDepartment(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader className="pb-4 border-b border-gray-200">
                <DialogTitle className="text-xl font-bold text-gray-900">Edit Department</DialogTitle>
                <DialogDescription className="text-sm text-gray-600 mt-1">
                  Update department information and details
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-5 py-6">
                <div>
                  <label className="text-sm font-semibold text-gray-900 mb-2 block">
                    Department Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Engineering, Sales, HR"
                    className="h-11 border-gray-300 focus:border-[#161950] focus:ring-[#161950]"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-900 mb-2 block">
                    Department Code <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                  </label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., ENG, SALES, HR"
                    maxLength={20}
                    className="h-11 border-gray-300 focus:border-[#161950] focus:ring-[#161950]"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-900 mb-2 block">
                    Description <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the department's purpose and responsibilities..."
                    rows={4}
                    className="border-gray-300 focus:border-[#161950] focus:ring-[#161950] resize-none"
                  />
                </div>
              </div>
              <DialogFooter className="pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setEditingDepartment(null)}
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
                      Update Department
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

