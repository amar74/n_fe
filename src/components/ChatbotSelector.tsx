import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Bot,
  MessageCircle,
  X,
  Sparkles,
  Tag,
  Layers,
} from 'lucide-react';
import { useAIAgenticTemplatesByModule, type AIAgenticTemplate } from '@/hooks/useAIAgentic';
import UniversalChatbot from './UniversalChatbot';

const MODULE_MAP: Record<string, string> = {
  '/module/opportunities': 'opportunities',
  '/module/accounts': 'accounts',
  '/module/proposals': 'proposals',
  '/module/resources': 'resources',
  '/module/contracts': 'contracts',
  '/module/projects': 'projects',
  '/module/finance': 'finance',
  '/module/procurement': 'procurement',
  '/module/kpis': 'kpis',
  '/module/survey': 'survey',
  '/module/delivery-models': 'delivery-models',
};

export default function ChatbotSelector() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedChatbot, setSelectedChatbot] = useState<number | null>(null);

  const currentModule = Object.entries(MODULE_MAP).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] || null;

  const { data, isLoading } = useAIAgenticTemplatesByModule(currentModule || '');

  const templates = data?.templates || [];

  useEffect(() => {
    if (templates.length === 1 && !selectedChatbot) {
      setSelectedChatbot(templates[0].id);
    }
  }, [templates, selectedChatbot]);

  if (!currentModule || templates.length === 0) {
    return null;
  }

  const selectedTemplate: AIAgenticTemplate | undefined = templates.find(t => t.id === selectedChatbot) || templates[0];

  if (!selectedTemplate) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          <Bot className="h-6 w-6" />
        </Button>
        {templates.length > 1 && (
          <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
            {templates.length}
          </div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Select AI Assistant
            </DialogTitle>
            <DialogDescription>
              Choose an AI assistant for {currentModule.replace('-', ' ')}
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Bot className="h-8 w-8 animate-pulse text-gray-400" />
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {templates.map(template => (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedChatbot === template.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                  onClick={() => {
                    setSelectedChatbot(template.id);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Bot className="h-4 w-4 text-purple-600" />
                        <h4 className="font-semibold">{template.name}</h4>
                      </div>
                      {template.description && (
                        <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                        {template.tags?.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {selectedChatbot === template.id && (
                      <div className="ml-2">
                        <div className="w-2 h-2 bg-purple-600 rounded-full" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {selectedTemplate && (
        <UniversalChatbot
          currentModule={currentModule}
          template={selectedTemplate}
        />
      )}
    </>
  );
}

