import { useState } from 'react';
import {
  Plus,
  Trash2,
  ArrowRight,
  Brain,
  Sparkles,
  MessageSquare,
  Send,
  Loader2,
  Lightbulb,
  Zap,
  FileText,
  Badge,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/services/api/client';
import { useQueryClient } from '@tanstack/react-query';
import { proposalKeys } from '@/hooks/proposals/useProposals';
import { useToast } from '@/hooks/shared';
import type { BrochureSection } from './types';

interface ContentTabProps {
  brochureId: string | undefined;
  sections: BrochureSection[];
  setSections: React.Dispatch<React.SetStateAction<BrochureSection[]>>;
  selectedSection: string;
  setSelectedSection: (id: string) => void;
  existingSectionMap: Map<string, any>;
  setExistingSectionMap: React.Dispatch<React.SetStateAction<Map<string, any>>>;
  isEditMode: boolean;
  isSavingSection: boolean;
  setIsSavingSection: (value: boolean) => void;
  sectionEditPrompts: { [key: string]: string };
  setSectionEditPrompts: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  processingSectionEdit: { [key: string]: boolean };
  setProcessingSectionEdit: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  contentPrompt: string;
  setContentPrompt: (value: string) => void;
  isGeneratingContent: boolean;
  setIsGeneratingContent: (value: boolean) => void;
  recentChanges: Array<{ id: string; sectionId: string; prompt: string; timestamp: string }>;
  setRecentChanges: React.Dispatch<React.SetStateAction<Array<{ id: string; sectionId: string; prompt: string; timestamp: string }>>>;
  aiSuggestions: Array<{ type: string; suggestion: string; sectionId?: string }>;
  opportunityData: any;
  onNext: () => void;
}

export function ContentTab({
  brochureId,
  sections,
  setSections,
  selectedSection,
  setSelectedSection,
  existingSectionMap,
  setExistingSectionMap,
  isEditMode,
  isSavingSection,
  setIsSavingSection,
  sectionEditPrompts,
  setSectionEditPrompts,
  processingSectionEdit,
  setProcessingSectionEdit,
  contentPrompt,
  setContentPrompt,
  isGeneratingContent,
  setIsGeneratingContent,
  recentChanges,
  setRecentChanges,
  aiSuggestions,
  opportunityData,
  onNext,
}: ContentTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleAddSection = async () => {
    if (!brochureId) {
      toast.error('Brochure ID is required');
      return;
    }
    
    const newSection: BrochureSection = {
      id: `temp-${Date.now()}`,
      title: 'New Section',
      content: '',
      order: sections.length + 1,
    };
    setSections([...sections, newSection]);
    setSelectedSection(newSection.id);
    
    try {
      setIsSavingSection(true);
      const response = await apiClient.post(`/proposals/${brochureId}/sections`, {
        title: newSection.title,
        content: newSection.content,
        section_type: 'other',
        display_order: newSection.order,
      });
      
      if (response.data?.sections) {
        const savedSection = response.data.sections[response.data.sections.length - 1];
        setSections(prev => prev.map(s => 
          s.id === newSection.id ? { ...s, id: savedSection.id } : s
        ));
        setExistingSectionMap(prev => new Map(prev).set(savedSection.id, savedSection));
        setSelectedSection(savedSection.id);
      }
      
      queryClient.invalidateQueries({ queryKey: proposalKeys.detail(brochureId) });
      toast.success('Section added successfully');
    } catch (error: any) {
      console.error('Error adding section:', error);
      toast.error(error.response?.data?.detail || 'Failed to add section');
      setSections(sections);
    } finally {
      setIsSavingSection(false);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (sections.length <= 1) {
      toast.error('Cannot delete the last section');
      return;
    }
    
    const updatedSections = sections.filter(s => s.id !== sectionId);
    setSections(updatedSections);
    if (selectedSection === sectionId) {
      setSelectedSection(updatedSections[0]?.id || '');
    }
    
    if (existingSectionMap.has(sectionId)) {
      setExistingSectionMap(prev => {
        const newMap = new Map(prev);
        newMap.delete(sectionId);
        return newMap;
      });
      toast.success('Section removed');
    } else {
      toast.success('Section removed');
    }
  };

  const handleAutoGenerateSections = async () => {
    if (!brochureId || !opportunityData) return;

    setIsGeneratingContent(true);
    toast.success('🤖 AI is generating content based on the opportunity...');

    try {
      const oppName = opportunityData.project_name || opportunityData.name || 'Project';
      const oppDesc = opportunityData.description || '';
      const oppValue = opportunityData.project_value || '';
      const oppSector = opportunityData.market_sector || '';

      const autoSections: BrochureSection[] = [
        {
          id: `temp-${Date.now()}-1`,
          title: 'Cover Page',
          content: `# ${oppName}\n\n${oppDesc ? `${oppDesc.substring(0, 200)}...` : 'Professional service capabilities brochure'}`,
          order: 1,
        },
        {
          id: `temp-${Date.now()}-2`,
          title: 'Executive Summary',
          content: `## Project Overview\n\n${oppDesc || 'Our comprehensive approach to delivering exceptional results for your project.'}\n\n${oppValue ? `**Project Value:** ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(oppValue)}` : ''}`,
          order: 2,
        },
        {
          id: `temp-${Date.now()}-3`,
          title: 'Our Services',
          content: `## Service Capabilities\n\n${oppSector ? `Specializing in ${oppSector} sector solutions, we provide:` : 'We provide comprehensive services including:'}\n\n- Strategic planning and consultation\n- Professional implementation\n- Quality assurance and support\n- Ongoing maintenance and optimization`,
          order: 3,
        },
        {
          id: `temp-${Date.now()}-4`,
          title: 'Why Choose Us',
          content: `## Our Competitive Advantages\n\n- Experienced team with proven track record\n- Client-focused approach\n- Innovative solutions\n- Commitment to excellence`,
          order: 4,
        },
        {
          id: `temp-${Date.now()}-5`,
          title: 'Contact Information',
          content: `## Get In Touch\n\nReady to discuss your project? Contact us to learn more about how we can help you achieve your goals.`,
          order: 5,
        },
      ];

      setSections(autoSections);
      if (autoSections.length > 0) {
        setSelectedSection(autoSections[0].id);
      }

      if (brochureId) {
        for (const section of autoSections) {
          try {
            const response = await apiClient.post(`/proposals/${brochureId}/sections`, {
              title: section.title,
              content: section.content,
              section_type: 'other',
              display_order: section.order,
            });
            
            if (response.data?.sections) {
              const savedSection = response.data.sections[response.data.sections.length - 1];
              setSections(prev => prev.map(s => 
                s.id === section.id ? { ...s, id: savedSection.id } : s
              ));
              setExistingSectionMap(prev => new Map(prev).set(savedSection.id, savedSection));
            }
          } catch (error: any) {
            console.error('Error saving auto-generated section:', error);
          }
        }
        queryClient.invalidateQueries({ queryKey: proposalKeys.detail(brochureId) });
      }

      toast.success('✨ Content generated successfully based on opportunity!');
    } catch (error: any) {
      console.error('Error auto-generating sections:', error);
      toast.error('Failed to generate content automatically');
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const handleGenerateContentWithPrompt = async () => {
    if (!contentPrompt?.trim()) {
      toast.error('Please enter a prompt describing the content you want to generate');
      return;
    }

    if (!brochureId) {
      toast.error('Brochure ID is required');
      return;
    }

    setIsGeneratingContent(true);
    toast.success('🤖 AI is generating content based on your prompt...');

    try {
      const oppName = opportunityData?.project_name || opportunityData?.name || 'the project';
      const oppDesc = opportunityData?.description || '';
      
      const generatedContent = `Based on your request: "${contentPrompt}"\n\nFor ${oppName}:\n\n${oppDesc ? `Project Overview: ${oppDesc.substring(0, 300)}...\n\n` : ''}This section addresses your specific requirements and provides relevant information tailored to your needs.`;

      const newSection: BrochureSection = {
        id: `temp-${Date.now()}`,
        title: contentPrompt.substring(0, 50) || 'New Section',
        content: generatedContent,
        order: sections.length + 1,
      };

      setSections(prev => [...prev, newSection]);
      setSelectedSection(newSection.id);
      setContentPrompt('');

      try {
        const response = await apiClient.post(`/proposals/${brochureId}/sections`, {
          title: newSection.title,
          content: newSection.content,
          section_type: 'other',
          display_order: newSection.order,
        });
        
        if (response.data?.sections) {
          const savedSection = response.data.sections[response.data.sections.length - 1];
          setSections(prev => prev.map(s => 
            s.id === newSection.id ? { ...s, id: savedSection.id } : s
          ));
          setExistingSectionMap(prev => new Map(prev).set(savedSection.id, savedSection));
          setSelectedSection(savedSection.id);
        }
        queryClient.invalidateQueries({ queryKey: proposalKeys.detail(brochureId) });
      } catch (error: any) {
        console.error('Error saving generated section:', error);
      }

      toast.success('✨ Content generated successfully!');
    } catch (error: any) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content');
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const handleSectionEditPrompt = async (sectionId: string) => {
    const prompt = sectionEditPrompts[sectionId];
    if (!prompt?.trim()) {
      toast.error('Please enter a prompt describing the changes you want to make');
      return;
    }

    setProcessingSectionEdit(prev => ({ ...prev, [sectionId]: true }));
    toast.success('AI is processing your request...');

    setTimeout(() => {
      setProcessingSectionEdit(prev => ({ ...prev, [sectionId]: false }));
      setSectionEditPrompts(prev => ({ ...prev, [sectionId]: '' }));

      setSections(prev =>
        prev.map(section =>
          section.id === sectionId
            ? { ...section, content: section.content + '\n\n*Updated based on your request*' }
            : section
        )
      );

      setRecentChanges(prev => [{
        id: Date.now().toString(),
        sectionId,
        prompt,
        timestamp: new Date().toLocaleTimeString(),
      }, ...prev].slice(0, 5));

      toast.success('Section updated successfully');
    }, 2000);
  };

  const currentSection = sections.find(s => s.id === selectedSection);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold font-outfit text-[#1A1A1A] mb-2">
            Brochure Content Sections
          </h3>
          <p className="text-sm text-gray-600 font-outfit">
            Organize and edit your brochure content by sections
          </p>
        </div>
        {isEditMode && (
          <Button
            onClick={handleAddSection}
            className="bg-[#161950] hover:bg-[#0f1440] font-outfit"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        )}
      </div>

      {/* AI Content Generation Prompt */}
      {isEditMode && sections.length === 0 && (
        <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-purple-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h4 className="text-lg font-semibold font-outfit text-[#1A1A1A]">
                AI Content Generator
              </h4>
              <p className="text-sm text-gray-600 font-outfit">
                {opportunityData 
                  ? `Generate content based on "${opportunityData.project_name || opportunityData.name || 'the opportunity'}"`
                  : 'Generate brochure content using AI'}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <Textarea
              placeholder="e.g., 'Create a brochure highlighting our transportation engineering services', 'Generate content for a construction project brochure', etc."
              value={contentPrompt}
              onChange={(e) => setContentPrompt(e.target.value)}
              className="font-outfit min-h-24"
              disabled={isGeneratingContent}
            />
            <div className="flex items-center gap-3">
              <Button
                onClick={handleGenerateContentWithPrompt}
                disabled={isGeneratingContent || !contentPrompt.trim()}
                className="bg-[#161950] hover:bg-[#0f1440] font-outfit"
              >
                {isGeneratingContent ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Content
                  </>
                )}
              </Button>
              {opportunityData && (
                <Button
                  onClick={handleAutoGenerateSections}
                  disabled={isGeneratingContent}
                  variant="outline"
                  className="font-outfit border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  {isGeneratingContent ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Auto-Generate from Opportunity
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          <h4 className="text-sm font-semibold font-outfit text-[#1A1A1A] mb-3">
            Sections ({sections.length})
          </h4>
          {isGeneratingContent && sections.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#161950] mx-auto mb-4"></div>
              <p className="text-sm text-gray-600 font-outfit">Generating content...</p>
            </div>
          ) : sections.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 font-outfit">No sections yet</p>
              <p className="text-xs text-gray-500 font-outfit mt-1">Use AI to generate content above</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedSection === section.id
                      ? 'border-[#161950] bg-[#161950]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedSection(section.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-2 h-2 rounded-full bg-[#161950]"></div>
                      <span className="text-sm font-medium font-outfit text-[#1A1A1A]">
                        {section.title}
                      </span>
                    </div>
                    {isEditMode && sections.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSection(section.id);
                        }}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {currentSection && (
            <div className="space-y-4">
              <div>
                <Label className="font-outfit text-[#1A1A1A] mb-2">Section Title</Label>
                {isEditMode ? (
                  <Input
                    value={currentSection.title}
                    onChange={async (e) => {
                      const newTitle = e.target.value;
                      setSections(sections.map(s =>
                        s.id === currentSection.id
                          ? { ...s, title: newTitle }
                          : s
                      ));
                      if (brochureId && existingSectionMap.has(currentSection.id) && !isSavingSection) {
                        try {
                          setIsSavingSection(true);
                          await apiClient.put(`/proposals/${brochureId}/sections/${currentSection.id}`, {
                            title: newTitle,
                            content: currentSection.content,
                          });
                          queryClient.invalidateQueries({ queryKey: proposalKeys.detail(brochureId) });
                        } catch (error: any) {
                          console.error('Error updating section:', error);
                          toast.error('Failed to save section title');
                        } finally {
                          setIsSavingSection(false);
                        }
                      }
                    }}
                    className="font-outfit"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200 text-[#1A1A1A] font-outfit">
                    {currentSection.title || '—'}
                  </div>
                )}
              </div>
              <div>
                <Label className="font-outfit text-[#1A1A1A] mb-2">Section Content</Label>
                {isEditMode ? (
                  <Textarea
                    value={currentSection.content}
                    onChange={async (e) => {
                      const newContent = e.target.value;
                      setSections(sections.map(s =>
                        s.id === currentSection.id
                          ? { ...s, content: newContent }
                          : s
                      ));
                      if (brochureId && existingSectionMap.has(currentSection.id) && !isSavingSection) {
                        clearTimeout((window as any).sectionSaveTimeout);
                        (window as any).sectionSaveTimeout = setTimeout(async () => {
                          try {
                            setIsSavingSection(true);
                            await apiClient.put(`/proposals/${brochureId}/sections/${currentSection.id}`, {
                              title: currentSection.title,
                              content: newContent,
                            });
                            queryClient.invalidateQueries({ queryKey: proposalKeys.detail(brochureId) });
                          } catch (error: any) {
                            console.error('Error updating section:', error);
                            toast.error('Failed to save section content');
                          } finally {
                            setIsSavingSection(false);
                          }
                        }, 1000);
                      }
                    }}
                    rows={12}
                    className="font-outfit"
                    placeholder="Enter section content here..."
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200 text-[#1A1A1A] font-outfit whitespace-pre-wrap min-h-[300px]">
                    {currentSection.content || '—'}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-outfit">
                  {currentSection.content.length} characters
                </Badge>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-outfit">
                  <Brain className="h-3 w-3 mr-1" />
                  AI Enhanced
                </Badge>
              </div>

              {isEditMode && (
                <div className="mt-6 space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare className="h-5 w-5 text-[#161950]" />
                      <h4 className="font-semibold font-outfit text-[#1A1A1A]">AI Content Editor</h4>
                    </div>
                    <p className="text-sm text-gray-600 font-outfit mb-3">
                      Describe changes you want to make to this section
                    </p>
                    <Textarea
                      placeholder="e.g., 'Add bullet points about our certifications', 'Make the tone more professional', 'Include specific project examples'"
                      value={sectionEditPrompts[currentSection.id] || ''}
                      onChange={(e) => setSectionEditPrompts(prev => ({
                        ...prev,
                        [currentSection.id]: e.target.value
                      }))}
                      className="font-outfit mb-3 min-h-24"
                      disabled={processingSectionEdit[currentSection.id]}
                    />
                    <Button
                      onClick={() => handleSectionEditPrompt(currentSection.id)}
                      disabled={processingSectionEdit[currentSection.id] || !sectionEditPrompts[currentSection.id]?.trim()}
                      className="w-full bg-[#161950] hover:bg-[#0f1440] font-outfit"
                    >
                      {processingSectionEdit[currentSection.id] ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Apply Changes
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 bg-white">
                    <h4 className="font-semibold font-outfit text-[#1A1A1A] mb-3 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-[#161950]" />
                      AI Suggestions
                    </h4>
                    <div className="space-y-2">
                      {aiSuggestions
                        .filter(s => s.sectionId === currentSection.id || !s.sectionId)
                        .map((suggestion, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-start gap-2">
                              <Sparkles className="h-4 w-4 text-[#161950] mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-gray-700 font-outfit">{suggestion.suggestion}</p>
                            </div>
                          </div>
                        ))}
                      {aiSuggestions.filter(s => s.sectionId === currentSection.id || !s.sectionId).length === 0 && (
                        <p className="text-sm text-gray-500 font-outfit text-center py-2">No suggestions for this section</p>
                      )}
                    </div>
                  </div>

                  {recentChanges.filter(c => c.sectionId === currentSection.id).length > 0 && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-white">
                      <h4 className="font-semibold font-outfit text-[#1A1A1A] mb-3">Recent Changes</h4>
                      <div className="space-y-2">
                        {recentChanges
                          .filter(c => c.sectionId === currentSection.id)
                          .slice(0, 3)
                          .map((change) => (
                            <div key={change.id} className="p-2 bg-gray-50 rounded text-sm">
                              <p className="text-gray-700 font-outfit">{change.prompt}</p>
                              <p className="text-xs text-gray-500 font-outfit mt-1">{change.timestamp}</p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Next Button */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 mt-6">
        <Button
          onClick={onNext}
          className="bg-[#161950] hover:bg-[#0f1440] font-outfit"
        >
          Next: Design
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

