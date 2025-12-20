import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  MessageCircle,
} from 'lucide-react';
import { useAIAgenticTemplatesByModule, type AIAgenticTemplate } from '@/hooks/ai';
import UniversalChatbot from './UniversalChatbot';
import ChatHistorySidebar from './ChatHistorySidebar';
import ChatSessionModal from './ChatSessionModal';
import { useChatSession } from '@/hooks/ai';

const MODULE_MAP: Record<string, string> = {
  '/module/opportunities': 'opportunities',
  '/module/accounts': 'accounts',
  '/module/proposals': 'proposals',
  '/module/resources': 'resources',
  '/module/contracts': 'contracts',
  '/module/projects': 'projects',
  '/module/finance': 'finance', // Matches both /module/finance and /module/finance/planning
  '/module/procurement': 'procurement',
  '/module/kpis': 'kpis',
  '/module/survey': 'survey',
  '/module/delivery-models': 'delivery-models',
  '/module/ai-agentic': 'ai-agentic',
};

// Full component with chat history and session management
export default function ChatbotSelector() {
  const location = useLocation();
  const [selectedChatbot, setSelectedChatbot] = useState<number | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const currentModule = Object.entries(MODULE_MAP).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] || null;

  const { data, isLoading, error } = useAIAgenticTemplatesByModule(currentModule || '');
  const { data: sessionData } = useChatSession(selectedSessionId);

  // Filter to only active templates
  const templates = (data?.templates || []).filter(t => t.is_active);

  useEffect(() => {
    if (templates.length === 1 && !selectedChatbot) {
      setSelectedChatbot(templates[0].id);
    }
  }, [templates, selectedChatbot]);

  // Load session data and set template if session has one
  useEffect(() => {
    if (sessionData?.template_id && !selectedChatbot) {
      setSelectedChatbot(sessionData.template_id);
    }
  }, [sessionData, selectedChatbot]);

  // Only show if we have a current module AND active templates exist
  if (!currentModule || isLoading) {
    return null;
  }

  if (error) {
    console.error('Error loading AI Agentic templates:', error);
    return null;
  }

  if (templates.length === 0) {
    return null;
  }

  const selectedTemplate: AIAgenticTemplate | undefined = templates.find(t => t.id === selectedChatbot) || templates[0];

  if (!selectedTemplate) {
    return null;
  }

  const handleSessionCreated = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    // Dialog will open automatically via useEffect in UniversalChatbot when sessionId is set
  };

  const handleSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    // Dialog will open automatically via useEffect in UniversalChatbot when sessionId is set
  };

  return (
    <>
      <div className="fixed bottom-24 right-6 z-40">
        <ChatHistorySidebar
          currentModule={currentModule}
          onSelectSession={handleSelectSession}
          onCreateNew={() => setIsCreateModalOpen(true)}
          selectedSessionId={selectedSessionId}
        />
      </div>

      <ChatSessionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSessionCreated={handleSessionCreated}
        currentModule={currentModule}
      />

      <UniversalChatbot
        currentModule={currentModule}
        template={selectedTemplate}
        sessionId={selectedSessionId}
        sessionData={sessionData}
      />
    </>
  );
}
