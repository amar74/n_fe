import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { Badge } from '@/components/ui/badge';
import { MessageSquare, X, Plus, Tag } from 'lucide-react';
import { useCreateChatSession, type ChatSessionCreate } from '@/hooks/useChat';
import { useAIAgenticTemplates, type AIAgenticTemplate } from '@/hooks/useAIAgentic';
import { useToast } from '@/hooks/use-toast';

interface ChatSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionCreated: (sessionId: string) => void;
  currentModule?: string;
}

const DEFAULT_TOPICS = [
  'Account Management',
  'Opportunity Tracking',
  'Proposal Creation',
  'Project Management',
  'Financial Analysis',
  'Resource Planning',
  'Client Communication',
  'Reporting & Analytics',
  'Data Enrichment',
  'Workflow Automation',
];

const DEFAULT_PROMPTS = [
  'How do I create a new account?',
  'What\'s the status of my proposals?',
  'Show me project deadlines',
  'How to track opportunities?',
  'Generate a financial report',
  'Help with KPIs',
  'Explain account health scores',
  'How to manage resources?',
];

export default function ChatSessionModal({
  isOpen,
  onClose,
  onSessionCreated,
  currentModule = 'General',
}: ChatSessionModalProps) {
  const { toast } = useToast();
  const createSession = useCreateChatSession();
  const { data: templatesData } = useAIAgenticTemplates({ is_active: true });

  const [formData, setFormData] = useState<ChatSessionCreate>({
    title: '',
    description: '',
    template_id: undefined,
    selected_topics: [],
    selected_prompts: [],
    module: currentModule,
  });

  const [templateValue, setTemplateValue] = useState<string | undefined>(undefined);

  const [customTopic, setCustomTopic] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        template_id: undefined,
        selected_topics: [],
        selected_prompts: [],
        module: currentModule,
      });
      setTemplateValue(undefined);
      setCustomTopic('');
      setCustomPrompt('');
    }
  }, [isOpen, currentModule]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a chat session title',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await createSession.mutateAsync(formData);
      toast({
        title: 'Success',
        description: 'Chat session created successfully',
      });
      onSessionCreated(result.id);
      onClose();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const toggleTopic = (topic: string) => {
    setFormData(prev => ({
      ...prev,
      selected_topics: prev.selected_topics?.includes(topic)
        ? prev.selected_topics.filter(t => t !== topic)
        : [...(prev.selected_topics || []), topic],
    }));
  };

  const addCustomTopic = () => {
    if (customTopic.trim() && !formData.selected_topics?.includes(customTopic.trim())) {
      setFormData(prev => ({
        ...prev,
        selected_topics: [...(prev.selected_topics || []), customTopic.trim()],
      }));
      setCustomTopic('');
    }
  };

  const removeTopic = (topic: string) => {
    setFormData(prev => ({
      ...prev,
      selected_topics: prev.selected_topics?.filter(t => t !== topic) || [],
    }));
  };

  const togglePrompt = (prompt: string) => {
    setFormData(prev => ({
      ...prev,
      selected_prompts: prev.selected_prompts?.includes(prompt)
        ? prev.selected_prompts.filter(p => p !== prompt)
        : [...(prev.selected_prompts || []), prompt],
    }));
  };

  const addCustomPrompt = () => {
    if (customPrompt.trim() && !formData.selected_prompts?.includes(customPrompt.trim())) {
      setFormData(prev => ({
        ...prev,
        selected_prompts: [...(prev.selected_prompts || []), customPrompt.trim()],
      }));
      setCustomPrompt('');
    }
  };

  const removePrompt = (prompt: string) => {
    setFormData(prev => ({
      ...prev,
      selected_prompts: prev.selected_prompts?.filter(p => p !== prompt) || [],
    }));
  };

  const templates = templatesData?.templates || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto font-['Outfit',sans-serif]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-['Outfit',sans-serif]">
            <MessageSquare className="h-5 w-5 text-[#161950]" />
            Create New Chat Session
          </DialogTitle>
          <DialogDescription className="font-['Outfit',sans-serif]">
            Set up a new chat session with topics and prompts to guide the conversation
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title" className="font-['Outfit',sans-serif] font-medium">
              Session Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Q4 Planning Discussion"
              className="mt-1.5 font-['Outfit',sans-serif]"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="font-['Outfit',sans-serif] font-medium">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of this chat session..."
              className="mt-1.5 font-['Outfit',sans-serif]"
              rows={3}
            />
          </div>

          {/* Template Selection */}
          {templates.length > 0 && (
            <div>
              <Label htmlFor="template" className="font-['Outfit',sans-serif] font-medium">
                AI Template (Optional)
              </Label>
              <Select
                value={templateValue}
                onValueChange={(value) => {
                  setTemplateValue(value);
                  setFormData(prev => ({ ...prev, template_id: value ? parseInt(value) : undefined }));
                }}
              >
                <SelectTrigger className="mt-1.5 font-['Outfit',sans-serif]">
                  <SelectValue placeholder="Select an AI template (Optional)" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id.toString()}>
                      {template.name} {template.category && `(${template.category})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Topics Selection */}
          <div>
            <Label className="font-['Outfit',sans-serif] font-medium mb-2 block">
              Topics
            </Label>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {DEFAULT_TOPICS.map((topic) => (
                  <Badge
                    key={topic}
                    variant={formData.selected_topics?.includes(topic) ? 'default' : 'outline'}
                    className={`cursor-pointer font-['Outfit',sans-serif] ${
                      formData.selected_topics?.includes(topic)
                        ? 'bg-[#161950] text-white hover:bg-[#1E2B5B]'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => toggleTopic(topic)}
                  >
                    {topic}
                  </Badge>
                ))}
              </div>
              
              {/* Custom Topic Input */}
              <div className="flex gap-2">
                <Input
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="Add custom topic..."
                  className="font-['Outfit',sans-serif]"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTopic())}
                />
                <Button
                  type="button"
                  onClick={addCustomTopic}
                  variant="outline"
                  size="sm"
                  className="font-['Outfit',sans-serif]"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Selected Topics */}
              {formData.selected_topics && formData.selected_topics.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.selected_topics.map((topic) => (
                    <Badge
                      key={topic}
                      variant="default"
                      className="bg-[#161950] text-white font-['Outfit',sans-serif]"
                    >
                      {topic}
                      <button
                        type="button"
                        onClick={() => removeTopic(topic)}
                        className="ml-2 hover:bg-[#1E2B5B] rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Prompts Selection */}
          <div>
            <Label className="font-['Outfit',sans-serif] font-medium mb-2 block">
              Prompts
            </Label>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {DEFAULT_PROMPTS.map((prompt) => (
                  <Badge
                    key={prompt}
                    variant={formData.selected_prompts?.includes(prompt) ? 'default' : 'outline'}
                    className={`cursor-pointer font-['Outfit',sans-serif] text-xs ${
                      formData.selected_prompts?.includes(prompt)
                        ? 'bg-[#161950] text-white hover:bg-[#1E2B5B]'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => togglePrompt(prompt)}
                  >
                    {prompt}
                  </Badge>
                ))}
              </div>
              
              {/* Custom Prompt Input */}
              <div className="flex gap-2">
                <Input
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Add custom prompt..."
                  className="font-['Outfit',sans-serif]"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomPrompt())}
                />
                <Button
                  type="button"
                  onClick={addCustomPrompt}
                  variant="outline"
                  size="sm"
                  className="font-['Outfit',sans-serif]"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Selected Prompts */}
              {formData.selected_prompts && formData.selected_prompts.length > 0 && (
                <div className="flex flex-col gap-2 mt-2">
                  {formData.selected_prompts.map((prompt) => (
                    <Badge
                      key={prompt}
                      variant="default"
                      className="bg-[#161950] text-white font-['Outfit',sans-serif] justify-between w-fit"
                    >
                      {prompt}
                      <button
                        type="button"
                        onClick={() => removePrompt(prompt)}
                        className="ml-2 hover:bg-[#1E2B5B] rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="font-['Outfit',sans-serif]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createSession.isPending}
              className="bg-[#161950] hover:bg-[#1E2B5B] text-white font-['Outfit',sans-serif]"
            >
              {createSession.isPending ? 'Creating...' : 'Create Session'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

