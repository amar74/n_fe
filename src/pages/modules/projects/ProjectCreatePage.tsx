import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, FolderKanban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProjects } from '@/hooks/projects';
import { useToast } from '@/hooks/shared';
import type { ProjectCreateRequest } from '@/services/api/projectsApi';

export default function ProjectCreatePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createProjectMutation } = useProjects();

  const [formData, setFormData] = useState<ProjectCreateRequest>({
    title: '',
    account_id: '',
    account_name: '',
    contract_value: undefined,
    status: 'planning',
    phase: 'discovery',
    priority: 'medium',
    start_date: '',
    end_date: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Project title is required');
      return;
    }

    try {
      const payload: ProjectCreateRequest = {
        title: formData.title,
        status: formData.status,
        phase: formData.phase,
        priority: formData.priority,
      };

      if (formData.account_id) payload.account_id = formData.account_id;
      if (formData.account_name) payload.account_name = formData.account_name;
      if (formData.contract_value) payload.contract_value = formData.contract_value;
      if (formData.start_date) payload.start_date = formData.start_date;
      if (formData.end_date) payload.end_date = formData.end_date;

      const newProject = await createProjectMutation.mutateAsync(payload);
      navigate(`/module/projects/${newProject.id}`);
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast.error(error?.message || 'Failed to create project');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3F2] font-outfit">
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/module/projects')}
            className="mb-4 text-[#667085] hover:text-[#1A1A1A] font-outfit"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#EAECF0] rounded-xl flex items-center justify-center">
              <FolderKanban className="h-6 w-6 text-[#1D2939]" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-[#1A1A1A] font-outfit">Create New Project</h1>
              <p className="text-[#667085] font-outfit mt-1">Add a new project to track and manage</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border border-[#E5E7EB] shadow-sm">
            <CardHeader>
              <CardTitle className="font-outfit text-[#1A1A1A]">Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title" className="font-outfit text-[#1A1A1A]">
                  Project Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter project title"
                  className="mt-2 font-outfit border-[#E5E7EB] focus:border-[#161950]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="account_name" className="font-outfit text-[#1A1A1A]">
                    Account Name
                  </Label>
                  <Input
                    id="account_name"
                    value={formData.account_name || ''}
                    onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                    placeholder="Enter account name"
                    className="mt-2 font-outfit border-[#E5E7EB] focus:border-[#161950]"
                  />
                </div>

                <div>
                  <Label htmlFor="contract_value" className="font-outfit text-[#1A1A1A]">
                    Contract Value
                  </Label>
                  <Input
                    id="contract_value"
                    type="number"
                    value={formData.contract_value || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contract_value: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    placeholder="0.00"
                    className="mt-2 font-outfit border-[#E5E7EB] focus:border-[#161950]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="status" className="font-outfit text-[#1A1A1A]">
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="mt-2 font-outfit border-[#E5E7EB] focus:border-[#161950]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="phase" className="font-outfit text-[#1A1A1A]">
                    Phase
                  </Label>
                  <Select
                    value={formData.phase}
                    onValueChange={(value: any) => setFormData({ ...formData, phase: value })}
                  >
                    <SelectTrigger className="mt-2 font-outfit border-[#E5E7EB] focus:border-[#161950]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="discovery">Discovery</SelectItem>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="execution">Execution</SelectItem>
                      <SelectItem value="implementation">Implementation</SelectItem>
                      <SelectItem value="closing">Closing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority" className="font-outfit text-[#1A1A1A]">
                    Priority
                  </Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger className="mt-2 font-outfit border-[#E5E7EB] focus:border-[#161950]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="start_date" className="font-outfit text-[#1A1A1A]">
                    Start Date
                  </Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date || ''}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="mt-2 font-outfit border-[#E5E7EB] focus:border-[#161950]"
                  />
                </div>

                <div>
                  <Label htmlFor="end_date" className="font-outfit text-[#1A1A1A]">
                    End Date
                  </Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date || ''}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="mt-2 font-outfit border-[#E5E7EB] focus:border-[#161950]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 border-t border-[#E5E7EB]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/module/projects')}
                  className="font-outfit border-[#E5E7EB] text-[#667085] hover:bg-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="font-outfit bg-[#161950] hover:bg-[#1E2B5B] text-white"
                  disabled={createProjectMutation.isPending}
                >
                  {createProjectMutation.isPending ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Project
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}

