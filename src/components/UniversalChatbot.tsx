import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MessageCircle,
  Send,
  Bot,
  User,
  X,
  Copy,
  Check,
  Brain,
  Search,
  Sparkles,
  Code,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { copyToClipboard } from "@/utils/clipboard";
import { useAddChatMessage, type ChatMessage } from "@/hooks/useChat";

// Enhanced markdown-like formatting component with code block support
const FormattedText = ({ text }: { text: string }) => {
  const formatText = (content: string) => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    
    // Match inline code `code`
    const codeRegex = /`([^`]+)`/g;
    let match;
    
    while ((match = codeRegex.exec(content)) !== null) {
      // Add text before code
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }
      // Add code element
      parts.push(
        <code key={match.index} className="bg-[#161950]/10 text-[#161950] px-1.5 py-0.5 rounded text-xs font-mono font-['Outfit',sans-serif] border border-[#161950]/20">
          {match[1]}
        </code>
      );
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : [content];
  };
  
  // Check for code blocks
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const codeBlocks: Array<{ lang: string; code: string; index: number }> = [];
  let codeMatch;
  let codeIndex = 0;
  
  while ((codeMatch = codeBlockRegex.exec(text)) !== null) {
    codeBlocks.push({
      lang: codeMatch[1] || '',
      code: codeMatch[2],
      index: codeMatch.index
    });
  }
  
  if (codeBlocks.length > 0) {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    
    codeBlocks.forEach((block, idx) => {
      // Add text before code block
      if (block.index > lastIndex) {
        const beforeText = text.substring(lastIndex, block.index);
        parts.push(
          <div key={`text-${idx}`} className="mb-3">
            {renderTextContent(beforeText)}
          </div>
        );
      }
      
      // Add code block
      parts.push(
        <div key={`code-${idx}`} className="mb-4 rounded-lg overflow-hidden border border-gray-200 bg-gray-900">
          {block.lang && (
            <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 flex items-center gap-2">
              <Code className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs text-gray-400 font-['Outfit',sans-serif] uppercase tracking-wide">{block.lang}</span>
            </div>
          )}
          <pre className="p-4 overflow-x-auto">
            <code className="text-sm text-gray-100 font-mono font-['Outfit',sans-serif] leading-relaxed">
              {block.code}
            </code>
          </pre>
        </div>
      );
      
      lastIndex = block.index + codeMatch[0].length;
    });
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <div key="text-end" className="mt-3">
          {renderTextContent(text.substring(lastIndex))}
        </div>
      );
    }
    
    return <div className="space-y-2">{parts}</div>;
  }
  
  return renderTextContent(text);
  
  function renderTextContent(content: string) {
    return (
      <div className="space-y-2.5 font-['Outfit',sans-serif]">
        {content.split('\n').map((line, i) => {
          // Bold headers
          if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
            return (
              <p key={i} className="font-semibold text-[#161950] mb-2.5 text-base font-['Outfit',sans-serif]">
                {formatText(line.replace(/\*\*/g, ''))}
              </p>
            );
          }
          
          // List items
          if (line.trim().startsWith('- ')) {
            return (
              <li key={i} className="ml-5 list-disc text-gray-700 mb-1.5 font-['Outfit',sans-serif] leading-relaxed">
                {formatText(line.replace('- ', ''))}
              </li>
            );
          }
          
          // Numbered lists
          if (/^\d+\.\s/.test(line.trim())) {
            return (
              <li key={i} className="ml-5 list-decimal text-gray-700 mb-1.5 font-['Outfit',sans-serif] leading-relaxed">
                {formatText(line.replace(/^\d+\.\s/, ''))}
              </li>
            );
          }
          
          // Bold text (partial)
          if (line.trim().startsWith('**')) {
            return (
              <p key={i} className="font-semibold text-[#161950] mb-2.5 font-['Outfit',sans-serif]">
                {formatText(line)}
              </p>
            );
          }
          
          // Italic text
          if (line.trim().startsWith('*') && !line.trim().startsWith('**')) {
            return (
              <p key={i} className="italic text-gray-600 mb-2.5 font-['Outfit',sans-serif] leading-relaxed">
                {formatText(line.replace(/^\*+/, ''))}
              </p>
            );
          }
          
          // Regular paragraphs
          if (line.trim()) {
            return (
              <p key={i} className="mb-2.5 text-gray-800 leading-relaxed font-['Outfit',sans-serif]">
                {formatText(line)}
              </p>
            );
          }
          return <br key={i} />;
        })}
      </div>
    );
  }
};

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  module?: string;
  thinkingMode?: "normal" | "think" | "deep-think" | "research";
}

interface AIAgenticTemplate {
  id: number;
  name: string;
  description?: string;
  category: string;
  tags?: string[];
  assigned_modules?: string[];
  system_prompt: string;
  welcome_message?: string;
  quick_actions?: Record<string, any>;
  is_active: boolean;
  is_default: boolean;
  display_order: number;
}

type ChatbotProps = {
  currentModule?: string;
  template?: AIAgenticTemplate;
  sessionId?: string | null;
  sessionData?: any; // ChatSessionWithMessages
}

const DEFAULT_QUICK_ACTIONS = [
  "How do I create a new account?",
  "What's the status of my proposals?",
  "Show me project deadlines",
  "How to track opportunities?",
  "Generate a report",
  "Help with KPIs",
];

const MODULE_CONTEXT = {
  "Accounts": "account management, client relationships, contact information, account health scores",
  "Opportunities": "business opportunities, pipeline management, lead tracking, opportunity stages",
  "Proposals": "proposal creation, submission tracking, proposal templates, win rates",
  "Projects": "project management, timelines, deliverables, project status tracking",
  "Client Surveys": "survey creation, response collection, client feedback, survey analytics",
  "Campaigns": "marketing campaigns, campaign performance, audience targeting, campaign analytics",
  "Interviews": "interview scheduling, candidate management, interview feedback, hiring process",
  "KPIs": "key performance indicators, metrics tracking, performance analytics, reporting",
  "Finance": "financial tracking, budget management, revenue analysis, cost tracking",
  "Resources": "resource allocation, team management, utilization rates, resource planning",
  "Dashboard": "overview metrics, summary statistics, quick access to all modules"
};

export default function UniversalChatbot({ currentModule = "General", template, sessionId, sessionData }: ChatbotProps) {
  const { toast } = useToast();
  const addMessage = useAddChatMessage();
  const [isOpen, setIsOpen] = useState(false);
  
  // Get welcome message from session prompts, template, or default
  const getWelcomeMessage = () => {
    if (sessionData?.selected_prompts && sessionData.selected_prompts.length > 0) {
      return `Hello! I'm ready to help you with: ${sessionData.selected_prompts.slice(0, 3).join(', ')}${sessionData.selected_prompts.length > 3 ? '...' : ''}. What would you like to know?`;
    }
    return template?.welcome_message || 
      `Hello! I'm your intelligent assistant for Megapolis Technologies. I can help you with any questions about ${currentModule === "General" ? "all modules" : currentModule} or any other part of the system. What would you like to know?`;
  };

  // Initialize messages from session or default
  const initializeMessages = (): Message[] => {
    if (sessionData?.messages && sessionData.messages.length > 0) {
      return sessionData.messages.map((msg: ChatMessage) => ({
        id: msg.id,
        type: msg.role as "user" | "bot",
        content: msg.content,
        timestamp: new Date(msg.created_at),
        module: currentModule,
        thinkingMode: msg.thinking_mode as "normal" | "think" | "deep-think" | "research" | undefined,
      }));
    }
    return [{
      id: "welcome",
      type: "bot",
      content: getWelcomeMessage(),
      timestamp: new Date(),
      module: currentModule
    }];
  };

  const [messages, setMessages] = useState<Message[]>(initializeMessages());
  
  // Update messages when session data changes
  useEffect(() => {
    if (sessionData?.messages) {
      setMessages(initializeMessages());
    }
  }, [sessionData]);

  // Open dialog when a session is selected or when session data is loaded
  useEffect(() => {
    if (sessionId && sessionData) {
      setIsOpen(true);
    }
  }, [sessionId, sessionData]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingMode, setThinkingMode] = useState<"normal" | "think" | "deep-think" | "research">("normal");
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const generateBotResponse = (userMessage: string, mode: typeof thinkingMode): string => {
    const message = userMessage.toLowerCase();
    
    // Enhanced responses based on thinking mode
    let baseResponse = "";
    
    if (message.includes("account") || message.includes("client")) {
      baseResponse = "I can help you with account management! You can create new accounts by clicking the 'Add New Account' button, view client details including health scores and contact information, track communication history, and manage MSA status. Would you like me to guide you through any specific account-related task?";
    } else if (message.includes("opportunity") || message.includes("lead") || message.includes("pipeline")) {
      baseResponse = "For opportunities, you can track your sales pipeline, manage lead stages, view opportunity values and probabilities, set follow-up reminders, and generate pipeline reports. I can help you navigate to specific opportunities or explain how to update opportunity stages. What specific aspect of opportunity management interests you?";
    } else if (message.includes("proposal")) {
      baseResponse = "Regarding proposals, you can create new proposals using templates, track submission status, monitor win rates, collaborate with team members, and manage proposal deadlines. I can walk you through the proposal creation process or help you find specific proposals. What would you like to do with proposals?";
    } else if (message.includes("project")) {
      baseResponse = "For project management, you can view project timelines, track deliverables, monitor project health, assign team members, and generate progress reports. I can help you navigate to specific projects or explain how to update project status. What project information do you need?";
    } else if (message.includes("finance") || message.includes("budget") || message.includes("revenue")) {
      baseResponse = "Regarding finance, you can track revenue, manage budgets, monitor expenses, generate financial reports, analyze profitability, and set financial goals. I can help you navigate financial data or explain specific financial metrics. What financial information do you need?";
    } else {
      baseResponse = `Great question! Since you're in the ${currentModule} module, I can provide specific guidance. Could you be more specific about what you'd like to know?`;
    }

    // Add thinking mode prefixes
    if (mode === "think") {
      return `**Thinking through this...**\n\n${baseResponse}\n\n*I've considered the key aspects of your question and provided a thoughtful response.*`;
    } else if (mode === "deep-think") {
      return `**Deep Analysis**\n\n${baseResponse}\n\n**Additional Considerations:**\n- This requires careful evaluation of multiple factors\n- Consider the long-term implications\n- Review related data points for comprehensive understanding\n\n*I've conducted a thorough analysis to provide you with the most comprehensive answer.*`;
    } else if (mode === "research") {
      return `**Research Mode**\n\n${baseResponse}\n\n**Research Findings:**\n- Based on current data patterns\n- Cross-referenced with best practices\n- Analyzed similar scenarios\n\n**Sources Considered:**\n- Internal documentation\n- Historical data patterns\n- Industry standards\n\n*I've researched this topic thoroughly to give you an informed response.*`;
    }
    
    return baseResponse;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !sessionId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
      module: currentModule,
      thinkingMode: thinkingMode
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsTyping(true);

    // Save user message to session
    try {
      await addMessage.mutateAsync({
        sessionId,
        message: {
          role: 'user',
          content: currentInput,
          thinking_mode: thinkingMode,
        },
      });
    } catch (error) {
      console.error('Error saving user message:', error);
    }

    // Simulate thinking delay based on mode
    const delay = thinkingMode === "normal" ? 1000 : 
                  thinkingMode === "think" ? 2000 : 
                  thinkingMode === "deep-think" ? 3000 : 4000;

    setTimeout(async () => {
      const botResponseContent = generateBotResponse(currentInput, thinkingMode);
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: botResponseContent,
        timestamp: new Date(),
        module: currentModule,
        thinkingMode: thinkingMode
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);

      // Save bot message to session
      if (sessionId) {
        try {
          await addMessage.mutateAsync({
            sessionId,
            message: {
              role: 'bot',
              content: botResponseContent,
              thinking_mode: thinkingMode,
            },
          });
        } catch (error) {
          console.error('Error saving bot message:', error);
        }
      }
    }, delay + Math.random() * 1000);
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
    setTimeout(() => handleSendMessage(), 100);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleCopyMessage = async (messageId: string, content: string) => {
    try {
      await copyToClipboard(content);
      setCopiedMessageId(messageId);
      toast({
        title: "Copied!",
        description: "Message copied to clipboard",
      });
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy message to clipboard",
        variant: "destructive",
      });
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        type: "bot",
        content: getWelcomeMessage(),
        timestamp: new Date(),
        module: currentModule
      }
    ]);
    toast({
      title: "Chat Cleared",
      description: "Conversation history has been reset",
    });
  };

  const thinkingModeOptions = [
    { value: "normal" as const, label: "Normal", icon: MessageCircle, color: "text-gray-600" },
    { value: "think" as const, label: "Think", icon: Brain, color: "text-blue-600" },
    { value: "deep-think" as const, label: "Deep Think", icon: Sparkles, color: "text-purple-600" },
    { value: "research" as const, label: "Research", icon: Search, color: "text-emerald-600" },
  ];

  return (
    <>
      {/* Floating Chat Button - Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setIsOpen(true)}
                className="bg-[#161950] hover:bg-[#1E2B5B] text-white rounded-full p-4 shadow-[0_4px_12px_rgba(22,25,80,0.3)] hover:shadow-[0_6px_20px_rgba(22,25,80,0.4)] transition-all duration-300 hover:scale-110 h-16 w-16 font-['Outfit',sans-serif]"
              >
                <MessageCircle className="h-7 w-7" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="font-['Outfit',sans-serif] bg-[#161950] text-white border-0 shadow-lg">
              <p className="font-medium">AI Assistant</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {messages.length > 1 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold font-['Outfit',sans-serif] rounded-full w-7 h-7 flex items-center justify-center shadow-lg">
            {messages.length - 1}
          </div>
        )}
      </div>

      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 font-['Outfit',sans-serif] shadow-2xl border border-gray-200/50 rounded-xl overflow-hidden">
          <style>{`
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
          {/* Professional Header */}
          <DialogHeader className="px-6 py-4 bg-[#161950] text-white border-b border-[#1E2B5B]">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-3 text-white">
                <div className="w-11 h-11 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 shadow-lg">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-lg font-['Outfit',sans-serif] tracking-tight">{template?.name || "AI Assistant"}</div>
                  <div className="text-xs text-white/90 font-normal font-['Outfit',sans-serif] mt-0.5">
                    {currentModule && currentModule !== "General" ? `${currentModule} module` : "General Assistant"}
                  </div>
                </div>
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-9 w-9 p-0 text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Messages Container */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-gradient-to-b from-[#F5F3F2] via-white to-white font-['Outfit',sans-serif]"
            style={{ 
              scrollbarWidth: 'thin', 
              scrollbarColor: '#cbd5e1 transparent',
            }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'} transition-all duration-300`}
                style={{ animation: 'fadeInUp 0.3s ease-out' }}
              >
                {message.type === 'bot' && (
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-[#161950] rounded-full flex items-center justify-center shadow-md ring-2 ring-[#161950]/10">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                  </div>
                )}
                
                <div className={`flex flex-col gap-2.5 max-w-[82%] ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`rounded-xl px-5 py-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] ${
                      message.type === 'user'
                        ? 'bg-[#161950] text-white'
                        : 'bg-white text-gray-900 border border-gray-200/60'
                    }`}
                  >
                    {message.type === 'bot' ? (
                      <div className="text-sm leading-relaxed font-['Outfit',sans-serif] text-gray-800">
                        <FormattedText text={message.content} />
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap leading-relaxed font-['Outfit',sans-serif] text-white">{message.content}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2.5 px-1">
                    <span className="text-xs text-gray-500 font-['Outfit',sans-serif] font-medium">
                      {formatTime(message.timestamp)}
                    </span>
                    {message.thinkingMode && message.thinkingMode !== "normal" && (
                      <Badge 
                        variant="outline" 
                        className="text-xs font-['Outfit',sans-serif] border-gray-300 bg-white/80 backdrop-blur-sm"
                      >
                        {message.thinkingMode === "think" && "🧠 Think"}
                        {message.thinkingMode === "deep-think" && "✨ Deep Think"}
                        {message.thinkingMode === "research" && "🔍 Research"}
                      </Badge>
                    )}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:bg-gray-100 rounded-full transition-all hover:scale-110"
                            onClick={() => handleCopyMessage(message.id, message.content)}
                          >
                            {copiedMessageId === message.id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 text-gray-400 hover:text-[#161950]" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="font-['Outfit',sans-serif] bg-[#161950] text-white border-0">
                          <p>Copy message</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                {message.type === 'user' && (
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-[#161950] rounded-full flex items-center justify-center shadow-md ring-2 ring-[#161950]/10">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-4 justify-start transition-all duration-300" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-[#161950] rounded-full flex items-center justify-center shadow-md ring-2 ring-[#161950]/10 animate-pulse">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="bg-white rounded-xl px-5 py-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-200/60">
                  <div className="flex gap-2">
                    <div className="w-2.5 h-2.5 bg-[#161950] rounded-full animate-bounce"></div>
                    <div className="w-2.5 h-2.5 bg-[#161950] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2.5 h-2.5 bg-[#161950] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {(() => {
            // Use session prompts if available, otherwise use template quick actions or defaults
            const prompts = sessionData?.selected_prompts && sessionData.selected_prompts.length > 0
              ? sessionData.selected_prompts
              : (template?.quick_actions ? Object.values(template.quick_actions) : DEFAULT_QUICK_ACTIONS);
            
            return prompts.length > 0 && messages.length === 1 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
                <div className="flex flex-wrap gap-2.5">
                  {prompts.slice(0, 4).map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction(typeof action === 'string' ? action : String(action))}
                      className="text-xs h-9 px-4 font-['Outfit',sans-serif] border-gray-300 bg-white hover:bg-[#161950] hover:text-white hover:border-[#161950] transition-all shadow-sm hover:shadow-md"
                    >
                      {typeof action === 'string' ? action : String(action)}
                    </Button>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white px-6 py-4 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
            {/* Thinking Mode Selector */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs text-gray-600 font-semibold font-['Outfit',sans-serif] uppercase tracking-wider">Mode:</span>
              <div className="flex gap-2">
                {thinkingModeOptions.map((option) => {
                  const Icon = option.icon;
                  const isActive = thinkingMode === option.value;
                  return (
                    <TooltipProvider key={option.value}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={isActive ? "default" : "outline"}
                            size="sm"
                            onClick={() => setThinkingMode(option.value)}
                            className={`h-8 px-3.5 text-xs font-['Outfit',sans-serif] transition-all font-medium ${
                              isActive
                                ? 'bg-[#161950] hover:bg-[#1E2B5B] text-white shadow-md'
                                : 'bg-white hover:bg-gray-50 border-gray-300 hover:border-[#161950] text-gray-700'
                            }`}
                          >
                            <Icon className={`h-3.5 w-3.5 mr-1.5 ${isActive ? 'text-white' : option.color}`} />
                            {option.label}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="font-['Outfit',sans-serif] bg-[#161950] text-white border-0">
                          <p>
                            {option.value === "normal" && "Standard response mode"}
                            {option.value === "think" && "More thoughtful analysis"}
                            {option.value === "deep-think" && "Comprehensive deep analysis"}
                            {option.value === "research" && "Research-based response with sources"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            </div>

            {/* Input Field */}
            <div className="flex gap-2.5">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything..."
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                className="flex-1 border-gray-300 focus:border-[#161950] focus:ring-2 focus:ring-[#161950]/20 font-['Outfit',sans-serif] text-sm h-12 rounded-lg shadow-sm"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping || !sessionId}
                className="bg-[#161950] hover:bg-[#1E2B5B] text-white px-6 h-12 rounded-lg shadow-md hover:shadow-lg transition-all font-['Outfit',sans-serif] font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#161950]"
                title={!sessionId ? "Please create or select a chat session first" : ""}
              >
                <Send className="h-4 w-4" />
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearChat}
                      className="px-3 h-12 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Clear chat"
                    >
                      <X className="h-4 w-4 text-gray-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="font-['Outfit',sans-serif] bg-[#161950] text-white border-0">
                    <p>Clear chat</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
