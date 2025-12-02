import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Plus,
  Trash2,
  Clock,
  History,
  Sparkles,
  Tag,
} from 'lucide-react';
import { useChatSessions, useDeleteChatSession, type ChatSession } from '@/hooks/useChat';
import { useToast } from '@/hooks/use-toast';

interface ChatHistorySidebarProps {
  currentModule?: string;
  onSelectSession: (sessionId: string) => void;
  onCreateNew: () => void;
  selectedSessionId?: string | null;
}

export default function ChatHistorySidebar({
  currentModule,
  onSelectSession,
  onCreateNew,
  selectedSessionId,
}: ChatHistorySidebarProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const deleteSession = useDeleteChatSession();

  const { data, isLoading, refetch } = useChatSessions({
    module: currentModule,
    limit: 50,
  });

  const sessions = data?.sessions || [];

  const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this chat session?')) {
      try {
        await deleteSession.mutateAsync(sessionId);
        toast({
          title: 'Success',
          description: 'Chat session deleted successfully',
        });
        refetch();
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'No messages';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="font-['Outfit',sans-serif] bg-white hover:bg-gray-50 border-gray-200 shadow-sm"
        >
          <History className="h-4 w-4 mr-2" />
          Chat History
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[420px] sm:w-[480px] font-['Outfit',sans-serif] bg-gradient-to-b from-gray-50 to-white p-0">
        <div className="h-full flex flex-col">
          {/* Header */}
          <SheetHeader className="px-6 py-5 border-b bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#161950] to-[#8B5CF6] rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <SheetTitle className="text-lg font-semibold font-['Outfit',sans-serif] text-gray-900">
                    Chat History
                  </SheetTitle>
                  <SheetDescription className="text-xs text-gray-500 font-['Outfit',sans-serif] mt-0.5">
                    {currentModule ? `${currentModule.charAt(0).toUpperCase() + currentModule.slice(1)} module` : 'All chats'}
                  </SheetDescription>
                </div>
              </div>
            </div>
          </SheetHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {/* Create New Button */}
            <Button
              onClick={() => {
                onCreateNew();
                setIsOpen(false);
              }}
              className="w-full bg-[#161950] hover:bg-[#1E2B5B] text-white font-['Outfit',sans-serif] h-11 mb-4 shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Chat
            </Button>

            {/* Sessions List */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-[#161950] border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-sm text-gray-500 font-['Outfit',sans-serif]">Loading chats...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-700 font-['Outfit',sans-serif] mb-1">No chat sessions yet</p>
                <p className="text-xs text-gray-500 font-['Outfit',sans-serif]">Create your first chat to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session: ChatSession) => (
                  <div
                    key={session.id}
                    onClick={() => {
                      onSelectSession(session.id);
                      setIsOpen(false);
                    }}
                    className={`group relative p-4 rounded-xl border cursor-pointer transition-all hover:shadow-lg font-['Outfit',sans-serif] ${
                      selectedSessionId === session.id
                        ? 'border-[#161950] bg-gradient-to-br from-[#161950]/5 to-[#8B5CF6]/5 shadow-md'
                        : 'border-gray-200 bg-white hover:border-[#161950]/30'
                    }`}
                  >
                    {/* Selected Indicator */}
                    {selectedSessionId === session.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#161950] to-[#8B5CF6] rounded-l-xl"></div>
                    )}

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Title */}
                        <div className="flex items-start gap-2 mb-2">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                            selectedSessionId === session.id
                              ? 'bg-[#161950]'
                              : 'bg-gray-100 group-hover:bg-gray-200'
                          }`}>
                            <MessageSquare className={`h-4 w-4 ${
                              selectedSessionId === session.id ? 'text-white' : 'text-gray-600'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-semibold text-sm font-['Outfit',sans-serif] truncate ${
                              selectedSessionId === session.id ? 'text-[#161950]' : 'text-gray-900'
                            }`}>
                              {session.title}
                            </h3>
                            {session.description && (
                              <p className="text-xs text-gray-600 mt-0.5 line-clamp-1 font-['Outfit',sans-serif]">
                                {session.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="flex items-center gap-3 mt-3 text-xs font-['Outfit',sans-serif]">
                          <span className="flex items-center gap-1 text-gray-500">
                            <Clock className="h-3 w-3" />
                            {formatTime(session.last_message_at || session.created_at)}
                          </span>
                          {session.message_count !== undefined && session.message_count > 0 && (
                            <Badge 
                              variant="outline" 
                              className={`text-xs font-['Outfit',sans-serif] ${
                                selectedSessionId === session.id
                                  ? 'border-[#161950]/30 bg-[#161950]/10 text-[#161950]'
                                  : 'border-gray-200 bg-gray-50'
                              }`}
                            >
                              {session.message_count} {session.message_count === 1 ? 'msg' : 'msgs'}
                            </Badge>
                          )}
                        </div>

                        {/* Topics */}
                        {session.selected_topics && session.selected_topics.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {session.selected_topics.slice(0, 2).map((topic) => (
                              <Badge
                                key={topic}
                                variant="outline"
                                className={`text-xs font-['Outfit',sans-serif] px-2 py-0.5 ${
                                  selectedSessionId === session.id
                                    ? 'border-[#161950]/30 bg-[#161950]/10 text-[#161950]'
                                    : 'border-gray-200 bg-gray-50 text-gray-700'
                                }`}
                              >
                                <Tag className="h-2.5 w-2.5 mr-1" />
                                {topic}
                              </Badge>
                            ))}
                            {session.selected_topics.length > 2 && (
                              <Badge
                                variant="outline"
                                className={`text-xs font-['Outfit',sans-serif] px-2 py-0.5 ${
                                  selectedSessionId === session.id
                                    ? 'border-[#161950]/30 bg-[#161950]/10 text-[#161950]'
                                    : 'border-gray-200 bg-gray-50 text-gray-700'
                                }`}
                              >
                                +{session.selected_topics.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDelete(session.id, e)}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
