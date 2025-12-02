import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { useToast } from '@/hooks/use-toast';

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'bot';
  content: string;
  thinking_mode?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface ChatSession {
  id: string;
  org_id?: string;
  created_by?: string;
  title: string;
  description?: string;
  template_id?: number;
  selected_topics?: string[];
  selected_prompts?: string[];
  module?: string;
  metadata?: Record<string, any>;
  status: string;
  created_at: string;
  updated_at: string;
  last_message_at?: string;
  message_count?: number;
}

export interface ChatSessionWithMessages extends ChatSession {
  messages: ChatMessage[];
}

export interface ChatSessionCreate {
  title: string;
  description?: string;
  template_id?: number;
  selected_topics?: string[];
  selected_prompts?: string[];
  module?: string;
  metadata?: Record<string, any>;
}

export interface ChatSessionUpdate {
  title?: string;
  description?: string;
  status?: string;
  metadata?: Record<string, any>;
}

export interface ChatMessageCreate {
  role: 'user' | 'bot';
  content: string;
  thinking_mode?: string;
  metadata?: Record<string, any>;
}

const CHAT_KEYS = {
  all: ['chat'] as const,
  sessions: () => [...CHAT_KEYS.all, 'sessions'] as const,
  session: (id: string) => [...CHAT_KEYS.sessions(), id] as const,
  byModule: (module: string) => [...CHAT_KEYS.sessions(), 'module', module] as const,
};

export const useChatSessions = (params?: {
  module?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: [...CHAT_KEYS.sessions(), params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.module) queryParams.append('module', params.module);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.limit) queryParams.append('limit', String(params.limit));
      if (params?.offset) queryParams.append('offset', String(params.offset));
      
      const response = await apiClient.get(`/v1/chat/sessions?${queryParams.toString()}`);
      return response.data as { sessions: ChatSession[]; total: number };
    },
  });
};

export const useChatSession = (sessionId: string | null) => {
  return useQuery({
    queryKey: CHAT_KEYS.session(sessionId || ''),
    queryFn: async () => {
      const response = await apiClient.get(`/v1/chat/sessions/${sessionId}`);
      return response.data as ChatSessionWithMessages;
    },
    enabled: !!sessionId,
  });
};

export const useCreateChatSession = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: ChatSessionCreate) => {
      const response = await apiClient.post('/v1/chat/sessions', data);
      return response.data as ChatSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.sessions() });
      toast({
        title: 'Success',
        description: 'Chat session created successfully',
      });
    },
    onError: (error: any) => {
      const detail = error.response?.data?.detail || error.message || 'Failed to create chat session';
      toast({
        title: 'Error',
        description: typeof detail === 'string' ? detail : 'Failed to create chat session',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateChatSession = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ChatSessionUpdate }) => {
      const response = await apiClient.put(`/v1/chat/sessions/${id}`, data);
      return response.data as ChatSession;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.sessions() });
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.session(variables.id) });
      toast({
        title: 'Success',
        description: 'Chat session updated successfully',
      });
    },
    onError: (error: any) => {
      const detail = error.response?.data?.detail || error.message || 'Failed to update chat session';
      toast({
        title: 'Error',
        description: typeof detail === 'string' ? detail : 'Failed to update chat session',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteChatSession = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/v1/chat/sessions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.sessions() });
      toast({
        title: 'Success',
        description: 'Chat session deleted successfully',
      });
    },
    onError: (error: any) => {
      const detail = error.response?.data?.detail || error.message || 'Failed to delete chat session';
      toast({
        title: 'Error',
        description: typeof detail === 'string' ? detail : 'Failed to delete chat session',
        variant: 'destructive',
      });
    },
  });
};

export const useAddChatMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, message }: { sessionId: string; message: ChatMessageCreate }) => {
      const response = await apiClient.post(`/v1/chat/sessions/${sessionId}/messages`, message);
      return response.data as ChatMessage;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.session(variables.sessionId) });
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.sessions() });
    },
    onError: (error: any) => {
      console.error('Error adding chat message:', error);
    },
  });
};

