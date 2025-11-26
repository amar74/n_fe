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
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useAIAgenticTemplates,
  useCreateAIAgenticTemplate,
  useUpdateAIAgenticTemplate,
  useDeleteAIAgenticTemplate,
  type AIAgenticTemplate,
  type AIAgenticTemplateCreate,
} from '@/hooks/useAIAgentic';
import {
  Bot,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Save,
  X,
  Sparkles,
  Tag,
  Layers,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const AVAILABLE_MODULES = [
  'opportunities',
  'accounts',
  'proposals',
  'resources',
  'contracts',
  'projects',
  'finance',
  'procurement',
  'kpis',
  'survey',
  'delivery-models',
];

const CATEGORIES = [
  'Account Management',
  'Business Development',
  'Client Engagement',
  'Project Management',
  'Data Analysis',
  'Report Generation',
  'Process Automation',
  'General Assistant',
];

export default function AIAgenticPage() {
  const { data, isLoading, error } = useAIAgenticTemplates({ include_inactive: true });
  const createMutation = useCreateAIAgenticTemplate();
  const updateMutation = useUpdateAIAgenticTemplate();
  const deleteMutation = useDeleteAIAgenticTemplate();
  const { toast } = useToast();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AIAgenticTemplate | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const [formData, setFormData] = useState<AIAgenticTemplateCreate>({
    name: '',
    description: '',
    category: '',
    tags: [],
    assigned_modules: [],
    system_prompt: '',
    welcome_message: '',
    quick_actions: {},
    is_active: true,
    is_default: false,
    display_order: 0,
  });

  const [newTag, setNewTag] = useState('');

  const templates = data?.templates || [];
  const filteredTemplates = categoryFilter === 'all'
    ? templates
    : templates.filter(t => t.category === categoryFilter);

  const handleCreate = () => {
    if (!formData.name || !formData.category || !formData.system_prompt) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Clean up form data before sending
    const cleanedData = {
      ...formData,
      description: formData.description || undefined,
      welcome_message: formData.welcome_message || undefined,
      tags: formData.tags && formData.tags.length > 0 ? formData.tags : undefined,
      assigned_modules: formData.assigned_modules && formData.assigned_modules.length > 0 ? formData.assigned_modules : undefined,
      quick_actions: formData.quick_actions && Object.keys(formData.quick_actions).length > 0 ? formData.quick_actions : undefined,
    };

    createMutation.mutate(cleanedData, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        resetForm();
      },
    });
  };

  const handleUpdate = () => {
    if (!editingTemplate) return;

    if (!formData.name || !formData.category || !formData.system_prompt) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Clean up form data before sending
    const cleanedData = {
      ...formData,
      description: formData.description || undefined,
      welcome_message: formData.welcome_message || undefined,
      tags: formData.tags && formData.tags.length > 0 ? formData.tags : undefined,
      assigned_modules: formData.assigned_modules && formData.assigned_modules.length > 0 ? formData.assigned_modules : undefined,
      quick_actions: formData.quick_actions && Object.keys(formData.quick_actions).length > 0 ? formData.quick_actions : undefined,
    };

    updateMutation.mutate(
      { id: editingTemplate.id, data: cleanedData },
      {
        onSuccess: () => {
          setEditingTemplate(null);
          resetForm();
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (template: AIAgenticTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      category: template.category,
      tags: template.tags || [],
      assigned_modules: template.assigned_modules || [],
      system_prompt: template.system_prompt,
      welcome_message: template.welcome_message || '',
      quick_actions: template.quick_actions || {},
      is_active: template.is_active,
      is_default: template.is_default,
      display_order: template.display_order,
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      tags: [],
      assigned_modules: [],
      system_prompt: '',
      welcome_message: '',
      quick_actions: {},
      is_active: true,
      is_default: false,
      display_order: 0,
    });
    setNewTag('');
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag.trim()],
      });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(t => t !== tag) || [],
    });
  };

  const toggleModule = (module: string) => {
    const modules = formData.assigned_modules || [];
    if (modules.includes(module)) {
      setFormData({
        ...formData,
        assigned_modules: modules.filter(m => m !== module),
      });
    } else {
      setFormData({
        ...formData,
        assigned_modules: [...modules, module],
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">Error loading templates: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F5F3F2] font-outfit p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 text-[#161950]">
              <Bot className="h-8 w-8 text-[#161950]" />
              AI Agentic Management
            </h1>
            <p className="text-gray-600 mt-2">Create and manage AI chatbot templates for different modules</p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setIsCreateDialogOpen(true);
            }}
            className="bg-[#161950] hover:bg-[#0f1440] text-white shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-lg overflow-hidden">
        <div className="p-6 border-b border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#161950]">Templates</h2>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48 border-[#E5E7EB]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="p-6">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No templates found. Create your first template to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map(template => (
                <div key={template.id} className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">
                  <div className="p-5 border-b border-[#E5E7EB]">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-[#161950] mb-2">{template.name}</h3>
                        <Badge className="bg-[#F8FAFC] text-[#161950] border border-[#E5E7EB]" variant="outline">{template.category}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(template)}
                          className="hover:bg-[#F8FAFC]"
                        >
                          <Edit className="h-4 w-4 text-[#161950]" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(template.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    {template.description && (
                      <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                    )}
                    <div className="space-y-3">
                      {template.tags && template.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {template.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs bg-[#F8FAFC] text-[#161950] border border-[#E5E7EB]">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {template.assigned_modules && template.assigned_modules.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {template.assigned_modules.map(module => (
                            <Badge key={module} variant="outline" className="text-xs border-[#E5E7EB] text-gray-700">
                              <Layers className="h-3 w-3 mr-1" />
                              {module}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-4 pt-2 border-t border-[#E5E7EB]">
                        <div className="flex items-center gap-2">
                          <Switch checked={template.is_active} disabled />
                          <Label className="text-xs font-medium text-gray-700">
                            {template.is_active ? 'Active' : 'Inactive'}
                          </Label>
                        </div>
                        {template.is_default && (
                          <Badge className="text-xs bg-[#161950] text-white">Default</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || !!editingTemplate} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setEditingTemplate(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-[#E5E7EB]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#161950]">
              <Sparkles className="h-5 w-5 text-[#161950]" />
              {editingTemplate ? 'Edit Template' : 'Create New Template'}
            </DialogTitle>
            <DialogDescription>
              Configure your AI chatbot template with category, tags, and module assignments
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="font-medium text-[#161950] mb-2 block">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Account Management Assistant"
                  className="border-[#E5E7EB]"
                />
              </div>
              <div>
                <Label htmlFor="category" className="font-medium text-[#161950] mb-2 block">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="border-[#E5E7EB]">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="font-medium text-[#161950] mb-2 block">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this chatbot template"
                rows={2}
                className="border-[#E5E7EB]"
              />
            </div>

            <div>
              <Label htmlFor="system_prompt" className="font-medium text-[#161950] mb-2 block">System Prompt *</Label>
              <Textarea
                id="system_prompt"
                value={formData.system_prompt}
                onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                placeholder="Define the AI's behavior, role, and capabilities..."
                rows={6}
                className="border-[#E5E7EB]"
              />
            </div>

            <div>
              <Label htmlFor="welcome_message" className="font-medium text-[#161950] mb-2 block">Welcome Message</Label>
              <Textarea
                id="welcome_message"
                value={formData.welcome_message}
                onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
                placeholder="Initial greeting message for users"
                rows={2}
                className="border-[#E5E7EB]"
              />
            </div>

            <div>
              <Label className="font-medium text-[#161950] mb-2 block">Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  className="border-[#E5E7EB]"
                />
                <Button type="button" onClick={addTag} size="sm" className="bg-[#161950] hover:bg-[#0f1440] text-white">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {formData.tags?.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="font-medium text-[#161950] mb-2 block">Assigned Modules</Label>
              <div className="grid grid-cols-3 gap-2 mt-2 border border-[#E5E7EB] rounded-lg p-4 bg-[#F8FAFC]">
                {AVAILABLE_MODULES.map(module => (
                  <div key={module} className="flex items-center space-x-2">
                    <Checkbox
                      id={module}
                      checked={formData.assigned_modules?.includes(module)}
                      onCheckedChange={() => toggleModule(module)}
                    />
                    <Label htmlFor={module} className="text-sm capitalize cursor-pointer text-gray-700 font-medium">
                      {module.replace('-', ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-[#F8FAFC] rounded-lg border border-[#E5E7EB]">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label className="font-medium text-[#161950] cursor-pointer">Active</Label>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-[#F8FAFC] rounded-lg border border-[#E5E7EB]">
                <Switch
                  checked={formData.is_default}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
                />
                <Label className="font-medium text-[#161950] cursor-pointer">Default</Label>
              </div>
              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E5E7EB]">
                <Label htmlFor="display_order" className="font-medium text-[#161950] mb-2 block">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  className="border-[#E5E7EB]"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setEditingTemplate(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={editingTemplate ? handleUpdate : handleCreate}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-[#161950] hover:bg-[#0f1440] text-white shadow-lg"
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {editingTemplate ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}

