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
} from '@/hooks/ai';
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
  Grid3x3,
  List,
} from 'lucide-react';
import { useToast } from '@/hooks/shared';
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
        <div className="p-6 border-b border-[#E5E7EB] bg-gradient-to-r from-[#161950] to-[#1E2B5B]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-white" />
                AI Chatbot Templates
              </h2>
              <p className="text-sm text-white/80 mt-1">Create and manage AI chatbot templates for different modules</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1 border border-white/20">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`h-8 px-3 ${viewMode === 'grid' ? 'bg-white text-[#161950]' : 'text-white hover:bg-white/20'}`}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`h-8 px-3 ${viewMode === 'list' ? 'bg-white text-[#161950]' : 'text-white hover:bg-white/20'}`}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48 border-white/20 bg-white/10 text-white">
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
        </div>
        <div className="p-6">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-[#161950] to-[#1E2B5B] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Bot className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#161950] mb-2">No templates found</h3>
              <p className="text-gray-600 mb-6">Create your first AI chatbot template to get started</p>
              <Button
                onClick={() => {
                  resetForm();
                  setIsCreateDialogOpen(true);
                }}
                className="bg-[#161950] hover:bg-[#0f1440] text-white shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Template
              </Button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map(template => (
                <Card key={template.id} className="border border-[#E5E7EB] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
                  <div className="h-2 bg-gradient-to-r from-[#161950] to-[#1E2B5B]"></div>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-[#161950] mb-2 group-hover:text-[#0f1440] transition-colors">
                          {template.name}
                        </CardTitle>
                        <Badge className="bg-[#F8FAFC] text-[#161950] border border-[#E5E7EB] hover:bg-[#161950] hover:text-white transition-colors">
                          {template.category}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(template)}
                          className="h-8 w-8 p-0 hover:bg-[#F8FAFC]"
                        >
                          <Edit className="h-4 w-4 text-[#161950]" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(template.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {template.description && (
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{template.description}</p>
                    )}
                    {template.tags && template.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {template.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs bg-[#F8FAFC] text-[#161950] border border-[#E5E7EB]">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {template.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                            +{template.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    {template.assigned_modules && template.assigned_modules.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {template.assigned_modules.slice(0, 3).map(module => (
                          <Badge key={module} variant="outline" className="text-xs border-[#E5E7EB] text-gray-700 bg-white">
                            <Layers className="h-3 w-3 mr-1" />
                            {module.replace('-', ' ')}
                          </Badge>
                        ))}
                        {template.assigned_modules.length > 3 && (
                          <Badge variant="outline" className="text-xs border-[#E5E7EB] text-gray-600">
                            +{template.assigned_modules.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Switch checked={template.is_active} disabled className="data-[state=checked]:bg-[#161950]" />
                          <Label className="text-xs font-medium text-gray-700">
                            {template.is_active ? 'Active' : 'Inactive'}
                          </Label>
                        </div>
                        {template.is_default && (
                          <Badge className="text-xs bg-[#161950] text-white">Default</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTemplates.map(template => (
                <Card key={template.id} className="border border-[#E5E7EB] shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group">
                  <div className="h-1 bg-gradient-to-r from-[#161950] to-[#1E2B5B]"></div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <CardTitle className="text-lg font-bold text-[#161950] group-hover:text-[#0f1440] transition-colors">
                                {template.name}
                              </CardTitle>
                              <Badge className="bg-[#F8FAFC] text-[#161950] border border-[#E5E7EB] hover:bg-[#161950] hover:text-white transition-colors">
                                {template.category}
                              </Badge>
                              {template.is_default && (
                                <Badge className="text-xs bg-[#161950] text-white">Default</Badge>
                              )}
                            </div>
                            {template.description && (
                              <p className="text-sm text-gray-600 leading-relaxed mb-3">{template.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="flex items-center gap-2">
                              <Switch checked={template.is_active} disabled className="data-[state=checked]:bg-[#161950]" />
                              <Label className="text-xs font-medium text-gray-700">
                                {template.is_active ? 'Active' : 'Inactive'}
                              </Label>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(template)}
                              className="h-8 w-8 p-0 hover:bg-[#F8FAFC]"
                            >
                              <Edit className="h-4 w-4 text-[#161950]" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(template.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
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
                                <Badge key={module} variant="outline" className="text-xs border-[#E5E7EB] text-gray-700 bg-white">
                                  <Layers className="h-3 w-3 mr-1" />
                                  {module.replace('-', ' ')}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

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

