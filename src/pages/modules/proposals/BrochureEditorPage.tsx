  import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Book,
  Save,
  Eye,
  Download,
  Image as ImageIcon,
  Type,
  Layout,
  Palette,
  FileText,
  Plus,
  Edit2,
  Trash2,
  Upload,
  X,
  Check,
  Wand2,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Printer,
  Share2,
  Sparkles,
  Brain,
  MessageSquare,
  Send,
  Loader2,
  Lightbulb,
  Zap,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/shared';
import { ProposalHeader } from './components/ProposalHeader';
import { ProposalProgressSteps } from './components/ProposalProgressSteps';
import { ProposalProgressCard } from './components/ProposalProgressCard';

interface BrochureSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface DesignTheme {
  id: string;
  name: string;
  colors: string[];
  description: string;
}

interface UploadedImage {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
}

export default function BrochureEditorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('content');
  const [brochureProgress, setBrochureProgress] = useState(65);
  const [isEditMode, setIsEditMode] = useState(() => {
    const mode = location.state?.mode;
    const urlParams = new URLSearchParams(location.search);
    const urlMode = urlParams.get('mode');
    return mode === 'edit' || urlMode === 'edit';
  });
  const [sections, setSections] = useState<BrochureSection[]>([
    { id: '1', title: 'Cover Page', content: 'Welcome to our services...', order: 1 },
    { id: '2', title: 'About Us', content: 'We are a leading company...', order: 2 },
    { id: '3', title: 'Services', content: 'Our comprehensive services include...', order: 3 },
  ]);
  const [selectedSection, setSelectedSection] = useState<string>('1');
  const [selectedTheme, setSelectedTheme] = useState<string>('modern-blue');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [currentPreviewPage, setCurrentPreviewPage] = useState(0);
  const [sectionEditPrompts, setSectionEditPrompts] = useState<{[key: string]: string}>({});
  const [processingSectionEdit, setProcessingSectionEdit] = useState<{[key: string]: boolean}>({});
  const [recentChanges, setRecentChanges] = useState<Array<{id: string; sectionId: string; prompt: string; timestamp: string}>>([]);
  const [aiSuggestions, setAiSuggestions] = useState<Array<{type: string; suggestion: string; sectionId?: string}>>([
    { type: 'content', suggestion: 'Consider adding more specific details about your services', sectionId: '3' },
    { type: 'design', suggestion: 'The current theme works well for professional audiences' },
    { type: 'structure', suggestion: 'Adding a testimonials section could strengthen credibility' },
  ]);

  const brochureData = location.state?.brochure || {
    id: 1,
    name: "Transportation Solutions Brochure",
    client: "City of Springfield",
    status: "In Progress",
  };

  const designThemes: DesignTheme[] = [
    {
      id: 'modern-blue',
      name: 'Modern Blue',
      colors: ['#161950', '#2563eb', '#1e40af'],
      description: 'Professional and modern design with blue accents',
    },
    {
      id: 'corporate-gray',
      name: 'Corporate Gray',
      colors: ['#374151', '#4b5563', '#6b7280'],
      description: 'Traditional corporate styling',
    },
    {
      id: 'premium-purple',
      name: 'Premium Purple',
      colors: ['#7c3aed', '#6d28d9', '#5b21b6'],
      description: 'Sophisticated premium feel',
    },
    {
      id: 'tech-cyan',
      name: 'Tech Cyan',
      colors: ['#0891b2', '#0e7490', '#155e75'],
      description: 'Modern technology-focused theme',
    },
  ];

  const handleSave = () => {
    toast.success('Brochure saved successfully');
    setIsEditMode(false);
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleAddSection = () => {
    const newSection: BrochureSection = {
      id: Date.now().toString(),
      title: 'New Section',
      content: '',
      order: sections.length + 1,
    };
    setSections([...sections, newSection]);
    setSelectedSection(newSection.id);
    toast.success('New section added');
  };

  const handleDeleteSection = (id: string) => {
    if (sections.length <= 1) {
      toast.error('Cannot delete the last section');
      return;
    }
    setSections(sections.filter(s => s.id !== id));
    if (selectedSection === id) {
      setSelectedSection(sections[0].id);
    }
    toast.success('Section deleted');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newImage: UploadedImage = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          url: event.target?.result as string,
          size: file.size,
          uploadedAt: new Date().toISOString(),
        };
        setUploadedImages([...uploadedImages, newImage]);
      };
      reader.readAsDataURL(file);
    });
    toast.success(`${files.length} image(s) uploaded`);
  };

  const handleDeleteImage = (id: string) => {
    setUploadedImages(uploadedImages.filter(img => img.id !== id));
    toast.success('Image deleted');
  };

  const handleSectionEditPrompt = async (sectionId: string) => {
    const prompt = sectionEditPrompts[sectionId];
    if (!prompt?.trim()) {
      toast.error('Please enter a prompt describing the changes you want to make');
      return;
    }

    setProcessingSectionEdit(prev => ({ ...prev, [sectionId]: true }));

    toast.success('AI is processing your request...');

    // Simulate AI processing
    setTimeout(() => {
      setProcessingSectionEdit(prev => ({ ...prev, [sectionId]: false }));
      setSectionEditPrompts(prev => ({ ...prev, [sectionId]: '' }));

      // Simulate content update
      setSections(prev =>
        prev.map(section =>
          section.id === sectionId
            ? { ...section, content: section.content + '\n\n*Updated based on your request*' }
            : section
        )
      );

      // Add to recent changes
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
    <div className="w-full h-full bg-white font-outfit">
      <div className="flex flex-col w-full">
        <ProposalHeader
          proposalName={brochureData.name}
          clientName={brochureData.client}
          stage={brochureData.status}
          onSave={isEditMode ? handleSave : undefined}
          onEdit={!isEditMode ? handleEdit : undefined}
          onBack={() => navigate('/module/proposals/brochures')}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <ProposalProgressSteps currentStep={2} />

            <ProposalProgressCard progress={brochureProgress} />

            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 h-auto p-0 gap-1.5 bg-transparent">
                  <TabsTrigger
                    value="content"
                    className="flex items-center justify-center gap-2 min-h-[50px] whitespace-normal data-[state=active]:bg-[#161950] data-[state=active]:text-white data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-600 font-outfit"
                  >
                    <FileText className="h-5 w-5" />
                    <span>Content</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="design"
                    className="flex items-center justify-center gap-2 min-h-[50px] whitespace-normal data-[state=active]:bg-[#161950] data-[state=active]:text-white data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-600 font-outfit"
                  >
                    <Palette className="h-5 w-5" />
                    <span>Design</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="images"
                    className="flex items-center justify-center gap-2 min-h-[50px] whitespace-normal data-[state=active]:bg-[#161950] data-[state=active]:text-white data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-600 font-outfit"
                  >
                    <ImageIcon className="h-5 w-5" />
                    <span>Images</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="preview"
                    className="flex items-center justify-center gap-2 min-h-[50px] whitespace-normal data-[state=active]:bg-[#161950] data-[state=active]:text-white data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-600 font-outfit"
                  >
                    <Eye className="h-5 w-5" />
                    <span>Preview</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="mt-0 space-y-6">
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

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-1 space-y-3">
                        <h4 className="text-sm font-semibold font-outfit text-[#1A1A1A] mb-3">
                          Sections ({sections.length})
                        </h4>
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
                      </div>

                      <div className="lg:col-span-2">
                        {currentSection && (
                          <div className="space-y-4">
                            <div>
                              <Label className="font-outfit text-[#1A1A1A] mb-2">Section Title</Label>
                              {isEditMode ? (
                                <Input
                                  value={currentSection.title}
                                  onChange={(e) => {
                                    setSections(sections.map(s =>
                                      s.id === currentSection.id
                                        ? { ...s, title: e.target.value }
                                        : s
                                    ));
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
                                  onChange={(e) => {
                                    setSections(sections.map(s =>
                                      s.id === currentSection.id
                                        ? { ...s, content: e.target.value }
                                        : s
                                    ));
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
                  </div>
                </TabsContent>

                <TabsContent value="design" className="mt-0 space-y-6">
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold font-outfit text-[#1A1A1A] mb-2">
                        Design Theme Selection
                      </h3>
                      <p className="text-sm text-gray-600 font-outfit">
                        Choose a design theme that matches your brand and message
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {designThemes.map((theme) => (
                        <div
                          key={theme.id}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-75'
                          } ${
                            selectedTheme === theme.id
                              ? 'border-[#161950] bg-[#161950]/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => {
                            if (!isEditMode) return;
                            setSelectedTheme(theme.id);
                          }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold font-outfit text-[#1A1A1A] mb-1">
                                {theme.name}
                              </h4>
                              <p className="text-sm text-gray-600 font-outfit">
                                {theme.description}
                              </p>
                            </div>
                            {selectedTheme === theme.id && (
                              <Check className="h-5 w-5 text-[#161950]" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {theme.colors.map((color, idx) => (
                              <div
                                key={idx}
                                className="w-8 h-8 rounded-lg border-2 border-gray-200"
                                style={{ backgroundColor: color }}
                              ></div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="text-lg font-semibold font-outfit text-[#1A1A1A] mb-4">
                        Customization Options
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label className="font-outfit text-[#1A1A1A] mb-2">Primary Color</Label>
                          {isEditMode ? (
                            <div className="flex items-center gap-3">
                              <Input
                                type="color"
                                defaultValue="#161950"
                                className="w-20 h-10 p-1 border-2 border-gray-200 rounded-lg cursor-pointer"
                              />
                              <Input
                                type="text"
                                defaultValue="#161950"
                                className="font-outfit"
                              />
                            </div>
                          ) : (
                            <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200 text-[#1A1A1A] font-outfit flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg border-2 border-gray-200" style={{ backgroundColor: '#161950' }}></div>
                              <span>#161950</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <Label className="font-outfit text-[#1A1A1A] mb-2">Layout Style</Label>
                          {isEditMode ? (
                            <Select defaultValue="modern">
                              <SelectTrigger className="font-outfit">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="modern">Modern</SelectItem>
                                <SelectItem value="classic">Classic</SelectItem>
                                <SelectItem value="minimal">Minimal</SelectItem>
                                <SelectItem value="bold">Bold</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200 text-[#1A1A1A] font-outfit">
                              Modern
                            </div>
                          )}
                        </div>
                        <div>
                          <Label className="font-outfit text-[#1A1A1A] mb-2">Font Family</Label>
                          {isEditMode ? (
                            <Select defaultValue="outfit">
                              <SelectTrigger className="font-outfit">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="outfit">Outfit</SelectItem>
                                <SelectItem value="inter">Inter</SelectItem>
                                <SelectItem value="roboto">Roboto</SelectItem>
                                <SelectItem value="opensans">Open Sans</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200 text-[#1A1A1A] font-outfit">
                              Outfit
                            </div>
                          )}
                        </div>
                        <div>
                          <Label className="font-outfit text-[#1A1A1A] mb-2">Page Size</Label>
                          {isEditMode ? (
                            <Select defaultValue="letter">
                              <SelectTrigger className="font-outfit">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="letter">Letter (8.5" x 11")</SelectItem>
                                <SelectItem value="a4">A4 (210mm x 297mm)</SelectItem>
                                <SelectItem value="legal">Legal (8.5" x 14")</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200 text-[#1A1A1A] font-outfit">
                              Letter (8.5" x 11")
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                        <div className="flex items-center gap-3">
                          <div className="bg-purple-100 p-2 rounded-lg">
                            <Sparkles className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold font-outfit text-[#1A1A1A] mb-1">
                              AI Design Assistant
                            </p>
                            <p className="text-xs text-gray-600 font-outfit">
                              Generate custom design variations based on your preferences
                            </p>
                          </div>
                          {isEditMode && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="font-outfit border-purple-200 text-purple-700 hover:bg-purple-50"
                            >
                              <Wand2 className="h-4 w-4 mr-2" />
                              Generate
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4 bg-white">
                        <h4 className="font-semibold font-outfit text-[#1A1A1A] mb-3 flex items-center gap-2">
                          <Target className="h-4 w-4 text-[#161950]" />
                          AI Design Recommendations
                        </h4>
                        <div className="space-y-3">
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-start gap-2">
                              <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium font-outfit text-blue-900 mb-1">
                                  Theme Optimization
                                </p>
                                <p className="text-xs text-blue-700 font-outfit">
                                  The selected theme works well for professional audiences. Consider using the Modern Blue theme for better brand alignment.
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium font-outfit text-green-900 mb-1">
                                  Color Harmony
                                </p>
                                <p className="text-xs text-green-700 font-outfit">
                                  Your current color palette creates good visual hierarchy and readability.
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="flex items-start gap-2">
                              <Zap className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium font-outfit text-purple-900 mb-1">
                                  Layout Suggestion
                                </p>
                                <p className="text-xs text-purple-700 font-outfit">
                                  Consider using a two-column layout for better content organization and visual balance.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="images" className="mt-0 space-y-6">
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-semibold font-outfit text-[#1A1A1A] mb-2">
                          Image Gallery
                        </h3>
                        <p className="text-sm text-gray-600 font-outfit">
                          Upload and manage images for your brochure
                        </p>
                      </div>
                      <div>
                        {isEditMode && (
                          <input
                            type="file"
                            id="image-upload"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        )}
                        {isEditMode && (
                          <Button
                            onClick={() => document.getElementById('image-upload')?.click()}
                            className="bg-[#161950] hover:bg-[#0f1440] font-outfit"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Images
                          </Button>
                        )}
                      </div>
                    </div>

                    {uploadedImages.length === 0 ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 font-outfit mb-2">
                          No images uploaded yet
                        </p>
                        <p className="text-sm text-gray-500 font-outfit mb-4">
                          Upload images to enhance your brochure
                        </p>
                        {isEditMode && (
                          <Button
                            variant="outline"
                            onClick={() => document.getElementById('image-upload')?.click()}
                            className="font-outfit"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Images
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {uploadedImages.map((image) => (
                          <div
                            key={image.id}
                            className="relative group border-2 border-gray-200 rounded-lg overflow-hidden hover:border-[#161950] transition-all"
                          >
                            <img
                              src={image.url}
                              alt={image.name}
                              className="w-full h-48 object-cover"
                            />
                            {isEditMode && (
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="font-outfit"
                                >
                                  <Edit2 className="h-4 w-4 mr-2" />
                                  Edit
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteImage(image.id)}
                                  className="font-outfit"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </Button>
                              </div>
                            )}
                            <div className="p-2 bg-white">
                              <p className="text-xs font-medium font-outfit text-[#1A1A1A] truncate">
                                {image.name}
                              </p>
                              <p className="text-xs text-gray-500 font-outfit">
                                {(image.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="mt-0 space-y-6">
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-semibold font-outfit text-[#1A1A1A] mb-2">
                          Brochure Preview
                        </h3>
                        <p className="text-sm text-gray-600 font-outfit">
                          Preview your brochure before finalizing
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="font-outfit"
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="font-outfit"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="font-outfit"
                        >
                          <Printer className="h-4 w-4 mr-2" />
                          Print
                        </Button>
                      </div>
                    </div>

                    <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentPreviewPage(Math.max(0, currentPreviewPage - 1))}
                            disabled={currentPreviewPage === 0}
                            className="font-outfit"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="text-sm font-medium font-outfit text-[#1A1A1A]">
                            Page {currentPreviewPage + 1} of {sections.length}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentPreviewPage(Math.min(sections.length - 1, currentPreviewPage + 1))}
                            disabled={currentPreviewPage === sections.length - 1}
                            className="font-outfit"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPreviewZoom(Math.max(50, previewZoom - 10))}
                            className="font-outfit"
                          >
                            <ZoomOut className="h-4 w-4" />
                          </Button>
                          <span className="text-sm font-medium font-outfit text-[#1A1A1A] min-w-[60px] text-center">
                            {previewZoom}%
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPreviewZoom(Math.min(150, previewZoom + 10))}
                            className="font-outfit"
                          >
                            <ZoomIn className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="bg-gray-100 p-8 flex items-center justify-center min-h-[600px]">
                        <div
                          className="bg-white shadow-xl rounded-lg p-8 transition-transform"
                          style={{
                            transform: `scale(${previewZoom / 100})`,
                            transformOrigin: 'center',
                            width: '8.5in',
                            minHeight: '11in',
                          }}
                        >
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <h2 className="text-2xl font-bold font-outfit text-[#161950] mb-4">
                              {currentSection?.title || 'Brochure Page'}
                            </h2>
                            <p className="text-gray-600 font-outfit">
                              {currentSection?.content || 'Preview content will appear here'}
                            </p>
                            {uploadedImages.length > 0 && (
                              <div className="mt-6">
                                <div className="grid grid-cols-2 gap-4">
                                  {uploadedImages.slice(0, 2).map((img) => (
                                    <img
                                      key={img.id}
                                      src={img.url}
                                      alt={img.name}
                                      className="w-full h-32 object-cover rounded-lg"
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
