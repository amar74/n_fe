import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/services/api/client";
import { useQueryClient } from "@tanstack/react-query";
import { proposalKeys, useProposals } from "@/hooks/proposals/useProposals";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Palette,
  FileText,
  Target,
  Layout,
  Eye,
  Settings,
  CheckCircle,
  Download,
  Brain,
  Upload,
  Image as ImageIcon,
  Trash2,
  Wand2,
  Crop,
  Filter,
  Contrast,
  Sun,
  Zap,
  Sparkles,
  RotateCw,
  Scissors,
  Palette as PaletteIcon,
  Move3D,
  Lightbulb,
  Clock,
  ChevronDown,
  ChevronRight,
  Save,
  ArrowRight,
} from "lucide-react";
import { useToast } from "@/hooks/shared";

interface DesignOption {
  id: string;
  name: string;
  preview: string;
  colors: string[];
  description: string;
}

interface SectionDetail {
  name: string;
  required: boolean;
  pageLimit?: number;
  includeGraphics: boolean;
  includeInfographics: boolean;
  includeMatrixes: boolean;
  includeImages: boolean;
  includeTables: boolean;
  includeCharts: boolean;
  includeFlowcharts: boolean;
  selectedPages: number;
}

interface UploadedImage {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  purpose: 'cover' | 'background' | 'content' | 'logo';
  enhancementSettings: {
    brightness: number;
    contrast: number;
    saturation: number;
    blur: number;
    rotation: number;
    crop: { x: number; y: number; width: number; height: number } | null;
    filter: string;
    aiEnhanced: boolean;
  };
}

interface PlanTabProps {
  proposalId?: string;
  onSave?: () => void;
  onNext?: () => void;
}

export default function PlanTab({ proposalId, onSave, onNext }: PlanTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { useProposal } = useProposals();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const [selectedCover, setSelectedCover] = useState<string>("");
  const [selectedTabs, setSelectedTabs] = useState<string>("");
  const [primaryLayout, setPrimaryLayout] = useState<string>("");
  const [headerFooterStyle, setHeaderFooterStyle] = useState<string>("");
  const [totalPages, setTotalPages] = useState(50);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [selectedImageForEdit, setSelectedImageForEdit] = useState<UploadedImage | null>(null);
  const [isEnhancementDialogOpen, setIsEnhancementDialogOpen] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isAIDesignDialogOpen, setIsAIDesignDialogOpen] = useState(false);
  const [isGeneratingDesigns, setIsGeneratingDesigns] = useState(false);
  const [selectedAIDesign, setSelectedAIDesign] = useState<string | null>(null);
  const [customDesignInput, setCustomDesignInput] = useState("");
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0])); // First section expanded by default
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSections, setIsLoadingSections] = useState(false);
  const [sectionsSaved, setSectionsSaved] = useState(false);

  // Fetch proposal data if proposalId is available
  const { data: proposal } = useProposal(proposalId, !!proposalId);
  const [sectionDetails, setSectionDetails] = useState<SectionDetail[]>([
    {
      name: "Contents",
      required: true,
      pageLimit: 1,
      includeGraphics: false,
      includeInfographics: false,
      includeMatrixes: false,
      includeImages: false,
      includeTables: false,
      includeCharts: false,
      includeFlowcharts: false,
      selectedPages: 1,
    },
    {
      name: "Letter",
      required: true,
      pageLimit: 2,
      includeGraphics: true,
      includeInfographics: false,
      includeMatrixes: false,
      includeImages: true,
      includeTables: false,
      includeCharts: false,
      includeFlowcharts: false,
      selectedPages: 2,
    },
    {
      name: "Executive Summary",
      required: true,
      pageLimit: 4,
      includeGraphics: true,
      includeInfographics: true,
      includeMatrixes: false,
      includeImages: true,
      includeTables: false,
      includeCharts: true,
      includeFlowcharts: false,
      selectedPages: 3,
    },
    {
      name: "Qualifications",
      required: true,
      pageLimit: 8,
      includeGraphics: true,
      includeInfographics: true,
      includeMatrixes: true,
      includeImages: true,
      includeTables: true,
      includeCharts: false,
      includeFlowcharts: false,
      selectedPages: 6,
    },
    {
      name: "Technical Approach",
      required: true,
      pageLimit: 12,
      includeGraphics: true,
      includeInfographics: true,
      includeMatrixes: false,
      includeImages: true,
      includeTables: true,
      includeCharts: true,
      includeFlowcharts: true,
      selectedPages: 10,
    },
  ]);

  const designThemes: DesignOption[] = [
    {
      id: "modern-blue",
      name: "Modern Blue",
      preview: "🔵",
      colors: ["#2563eb", "#1d4ed8", "#1e40af"],
      description: "Clean, professional design with blue accents",
    },
    {
      id: "corporate-gray",
      name: "Corporate Gray",
      preview: "⚫",
      colors: ["#374151", "#4b5563", "#6b7280"],
      description: "Traditional corporate styling with gray tones",
    },
    {
      id: "vibrant-green",
      name: "Vibrant Green",
      preview: "🟢",
      colors: ["#059669", "#047857", "#065f46"],
      description: "Fresh, environmental-focused green theme",
    },
    {
      id: "elegant-purple",
      name: "Elegant Purple",
      preview: "🟣",
      colors: ["#7c3aed", "#6d28d9", "#5b21b6"],
      description: "Sophisticated purple with premium feel",
    },
  ];

  // Reverse mapping from section_type to display name
  const sectionTypeToNameMap: { [key: string]: string } = {
    'contents': 'Contents',
    'letter': 'Letter',
    'executive_summary': 'Executive Summary',
    'qualifications': 'Qualifications',
    'technical_approach': 'Technical Approach',
  };

  // Map API section to local SectionDetail format
  const mapApiSectionToLocal = (apiSection: any): SectionDetail => {
    const metadata = apiSection.extra_metadata || {};
    // Use the reverse mapping to get the display name, or fall back to title
    const displayName = sectionTypeToNameMap[apiSection.section_type] || apiSection.title || apiSection.section_type || 'Untitled Section';
    
    // Determine page limit based on section type
    const pageLimits: { [key: string]: number } = {
      'Contents': 1,
      'Letter': 2,
      'Executive Summary': 4,
      'Qualifications': 8,
      'Technical Approach': 12,
    };
    const pageLimit = pageLimits[displayName] || apiSection.page_count || 1;
    
    return {
      name: displayName,
      required: true,
      pageLimit: pageLimit,
      includeGraphics: metadata.includeGraphics || false,
      includeInfographics: metadata.includeInfographics || false,
      includeMatrixes: metadata.includeMatrixes || false,
      includeImages: metadata.includeImages || false,
      includeTables: metadata.includeTables || false,
      includeCharts: metadata.includeCharts || false,
      includeFlowcharts: metadata.includeFlowcharts || false,
      selectedPages: apiSection.page_count || 1,
    };
  };

  // Map local SectionDetail to API section format
  const mapLocalSectionToApi = (localSection: SectionDetail, sectionType: string, displayOrder: number): any => {
    return {
      section_type: sectionType,
      title: localSection.name,
      page_count: localSection.selectedPages,
      status: 'draft',
      display_order: displayOrder,
      extra_metadata: {
        includeGraphics: localSection.includeGraphics,
        includeInfographics: localSection.includeInfographics,
        includeMatrixes: localSection.includeMatrixes,
        includeImages: localSection.includeImages,
        includeTables: localSection.includeTables,
        includeCharts: localSection.includeCharts,
        includeFlowcharts: localSection.includeFlowcharts,
      },
    };
  };

  // Load design preferences and sections from proposal when proposal data is available
  useEffect(() => {
    if (proposal) {
      // Load design preferences from ai_metadata
      if (proposal.ai_metadata && typeof proposal.ai_metadata === 'object') {
        const designPrefs = proposal.ai_metadata as any;
        if (designPrefs.theme) setSelectedTheme(designPrefs.theme);
        if (designPrefs.coverLayout) setSelectedCover(designPrefs.coverLayout);
        if (designPrefs.tabsStyle) setSelectedTabs(designPrefs.tabsStyle);
        if (designPrefs.primaryLayout) setPrimaryLayout(designPrefs.primaryLayout);
        if (designPrefs.headerFooterStyle) setHeaderFooterStyle(designPrefs.headerFooterStyle);
        if (designPrefs.totalPages) setTotalPages(designPrefs.totalPages);
      }
      
      // Load sections
      if (proposal.sections && proposal.sections.length > 0) {
        setIsLoadingSections(true);
      try {
        const loadedSections = proposal.sections
          .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
          .map((section: any) => mapApiSectionToLocal(section));
        
        if (loadedSections.length > 0) {
          // Merge with default sections to ensure all 5 sections are present
          const defaultSectionNames = ['Contents', 'Letter', 'Executive Summary', 'Qualifications', 'Technical Approach'];
          const loadedSectionMap = new Map<string, SectionDetail>(loadedSections.map((s: SectionDetail) => [s.name, s]));
          
          // Page limits for each section
          const pageLimits: { [key: string]: number } = {
            'Contents': 1,
            'Letter': 2,
            'Executive Summary': 4,
            'Qualifications': 8,
            'Technical Approach': 12,
          };
          
          // Create final sections array with all required sections
          const finalSections: SectionDetail[] = defaultSectionNames.map((name): SectionDetail => {
            const loaded = loadedSectionMap.get(name);
            if (loaded) return loaded;
            
            // Return default section structure
            return {
              name,
              required: true,
              pageLimit: pageLimits[name] || 1,
              includeGraphics: false,
              includeInfographics: false,
              includeMatrixes: false,
              includeImages: false,
              includeTables: false,
              includeCharts: false,
              includeFlowcharts: false,
              selectedPages: 1,
            };
          });
          
          setSectionDetails(finalSections);
          setSectionsSaved(true); // Mark as saved if sections exist
          console.log('[PlanTab] Loaded sections from proposal:', finalSections);
        }
      } catch (error) {
        console.error('[PlanTab] Error loading sections:', error);
        toast.error('Failed to load sections from proposal');
        } finally {
          setIsLoadingSections(false);
        }
      } else if (!proposal.sections || proposal.sections.length === 0) {
        // If proposal exists but has no sections, keep default sections
        console.log('[PlanTab] No sections found in proposal, using defaults');
        setSectionsSaved(false);
      }
    }
  }, [proposal, toast]);

  // Save sections and design preferences to API
  const handleSaveSections = async () => {
    if (!proposalId) {
      toast.error('Proposal ID is required to save sections');
      return;
    }

    setIsSaving(true);
    try {
      // Save design preferences to proposal ai_metadata
      const designMetadata = {
        theme: selectedTheme,
        coverLayout: selectedCover,
        tabsStyle: selectedTabs,
        primaryLayout: primaryLayout,
        headerFooterStyle: headerFooterStyle,
        totalPages: totalPages,
      };

      // Update proposal with design metadata
      await apiClient.put(`/proposals/${proposalId}`, {
        ai_metadata: {
          ...(proposal?.ai_metadata || {}),
          ...designMetadata,
        },
      });

      const sectionTypeMap: { [key: string]: string } = {
        'Contents': 'contents',
        'Letter': 'letter',
        'Executive Summary': 'executive_summary',
        'Qualifications': 'qualifications',
        'Technical Approach': 'technical_approach',
      };

      // Get existing sections from proposal
      const existingSections = proposal?.sections || [];
      const existingSectionMap = new Map(existingSections.map((s: any) => [s.section_type, s]));

      // Save or update each section
      const savePromises = sectionDetails.map(async (localSection, index) => {
        const sectionType = sectionTypeMap[localSection.name] || localSection.name.toLowerCase().replace(/\s+/g, '_');
        const sectionData = mapLocalSectionToApi(localSection, sectionType, index);
        const existingSection = existingSectionMap.get(sectionType) as any;

        if (existingSection && existingSection.id) {
          // Update existing section
          const response = await apiClient.put(
            `/proposals/${proposalId}/sections/${existingSection.id}`,
            sectionData
          );
          return response.data;
        } else {
          // Create new section
          const response = await apiClient.post(
            `/proposals/${proposalId}/sections`,
            sectionData
          );
          return response.data;
        }
      });

      await Promise.all(savePromises);

      // Invalidate proposal query to refresh data
      await queryClient.invalidateQueries({ queryKey: proposalKeys.detail(proposalId) });
      
      setSectionsSaved(true);
      toast.success('Sections saved successfully!');
      onSave?.();
    } catch (error: any) {
      console.error('[PlanTab] Error saving sections:', error);
      toast.error(error.response?.data?.detail || 'Failed to save sections');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSectionChange = (
    index: number,
    field: keyof SectionDetail,
    value: any,
  ) => {
    const updatedSections = [...sectionDetails];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setSectionDetails(updatedSections);
  };

  const handleGenerateStrategy = () => {
    toast.info("AI is analyzing uploaded documents to create your pursuit strategy.");
  };

  const handleGenerateManagementPlan = () => {
    toast.info("Creating proposal management plan based on RFP requirements.");
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploadingImages(true);
    
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage: UploadedImage = {
            id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            url: e.target?.result as string,
            size: file.size,
            type: file.type,
            purpose: 'content',
            enhancementSettings: {
              brightness: 0,
              contrast: 0,
              saturation: 0,
              blur: 0,
              rotation: 0,
              crop: null,
              filter: 'none',
              aiEnhanced: false,
            },
          };
          
          setUploadedImages(prev => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      }
    });
    
    setTimeout(() => {
      setIsUploadingImages(false);
      toast.success(`Uploaded ${files.length} image(s) for proposal design.`);
    }, 1500);
  };

  const handleDeleteImage = (imageId: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
    toast.success("Image has been removed from the proposal design.");
  };

  const handleImagePurposeChange = (imageId: string, purpose: UploadedImage['purpose']) => {
    setUploadedImages(prev => 
      prev.map(img => 
        img.id === imageId ? { ...img, purpose } : img
      )
    );
  };

  const handleEnhancementChange = (setting: keyof UploadedImage['enhancementSettings'], value: any) => {
    if (selectedImageForEdit) {
      const updatedImage = {
        ...selectedImageForEdit,
        enhancementSettings: {
          ...selectedImageForEdit.enhancementSettings,
          [setting]: value,
        },
      };
      
      setSelectedImageForEdit(updatedImage);
      setUploadedImages(prev => 
        prev.map(img => 
          img.id === updatedImage.id ? updatedImage : img
        )
      );
    }
  };

  const handleAIEnhancement = () => {
    if (selectedImageForEdit) {
      toast.info("AI is analyzing and enhancing your image...");
      
      setTimeout(() => {
        handleEnhancementChange('aiEnhanced', true);
        handleEnhancementChange('brightness', 10);
        handleEnhancementChange('contrast', 15);
        handleEnhancementChange('saturation', 5);
        
        toast.success("Your image has been automatically enhanced for optimal proposal presentation.");
      }, 2000);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const [aiDesignOptions, setAiDesignOptions] = useState([
    {
      id: 'ai-design-1',
      name: 'Professional Executive',
      category: 'Corporate',
      coverStyle: 'Clean geometric layout with bold typography',
      tabStyle: 'Minimalist tabs with subtle gradients',
      colorScheme: ['#1a365d', '#2d3748', '#4a5568'],
      preview: '📊',
      description: 'Professional design focused on data visualization and executive summary presentation',
      features: ['Clean typography', 'Data-focused layouts', 'Professional color palette', 'Geometric elements']
    },
    {
      id: 'ai-design-2',
      name: 'Modern Infrastructure',
      category: 'Technical',
      coverStyle: 'Blueprint-inspired design with technical elements',
      tabStyle: 'Industrial tabs with construction theme',
      colorScheme: ['#2b6cb0', '#2c5282', '#2a69ac'],
      preview: '🏗️',
      description: 'Engineering-focused design perfect for infrastructure and construction proposals',
      features: ['Blueprint aesthetics', 'Technical diagrams', 'Engineering typography', 'Industrial color scheme']
    },
    {
      id: 'ai-design-3',
      name: 'Environmental Innovation',
      category: 'Sustainability',
      coverStyle: 'Nature-inspired with organic flowing elements',
      tabStyle: 'Green-themed tabs with sustainability icons',
      colorScheme: ['#22543d', '#2f855a', '#38a169'],
      preview: '🌱',
      description: 'Eco-friendly design emphasizing sustainability and environmental responsibility',
      features: ['Organic shapes', 'Sustainability focus', 'Nature-inspired palette', 'Environmental icons']
    }
  ]);

  const handleGenerateMoreDesigns = () => {
    setIsGeneratingDesigns(true);

    const generateCustomDesigns = () => {
      if (customDesignInput.trim()) {
        const inputLower = customDesignInput.toLowerCase();
        const designVariations = [];

        if (inputLower.includes('modern') || inputLower.includes('sleek') || inputLower.includes('minimalist')) {
          designVariations.push({
            id: `ai-design-${Date.now()}-modern`,
            name: 'Modern Custom',
            category: 'Custom',
            coverStyle: `Modern ${inputLower.includes('bold') ? 'bold' : 'clean'} design with custom elements`,
            tabStyle: 'Sleek modern tabs with refined typography',
            colorScheme: ['#1a202c', '#2d3748', '#4a5568'],
            preview: '✨',
            description: `Custom modern design based on your requirements: "${customDesignInput.substring(0, 60)}${customDesignInput.length > 60 ? '...' : ''}"`,
            features: ['Modern aesthetics', 'Custom styling', 'User-specified elements', 'Contemporary design']
          });
        }

        if (inputLower.includes('colorful') || inputLower.includes('vibrant') || inputLower.includes('bright')) {
          designVariations.push({
            id: `ai-design-${Date.now()}-vibrant`,
            name: 'Vibrant Custom',
            category: 'Custom',
            coverStyle: 'Colorful design with vibrant elements and dynamic layout',
            tabStyle: 'Bright tabs with energetic color scheme',
            colorScheme: ['#e53e3e', '#dd6b20', '#d69e2e'],
            preview: '🎨',
            description: `Vibrant design tailored to: "${customDesignInput.substring(0, 60)}${customDesignInput.length > 60 ? '...' : ''}"`,
            features: ['Vibrant colors', 'Dynamic elements', 'Custom requirements', 'Energetic design']
          });
        }

        if (inputLower.includes('professional') || inputLower.includes('corporate') || inputLower.includes('business')) {
          designVariations.push({
            id: `ai-design-${Date.now()}-professional`,
            name: 'Professional Custom',
            category: 'Custom',
            coverStyle: 'Professional corporate design with sophisticated elements',
            tabStyle: 'Executive-level tabs with premium styling',
            colorScheme: ['#2c5282', '#2a69ac', '#3182ce'],
            preview: '💼',
            description: `Professional design crafted for: "${customDesignInput.substring(0, 60)}${customDesignInput.length > 60 ? '...' : ''}"`,
            features: ['Corporate styling', 'Professional layout', 'Custom elements', 'Executive appeal']
          });
        }

        // If no specific keywords, create a general custom design
        if (designVariations.length === 0) {
          designVariations.push({
            id: `ai-design-${Date.now()}-custom`,
            name: 'Custom AI Design',
            category: 'Custom',
            coverStyle: 'Tailored design based on your specific requirements',
            tabStyle: 'Custom tabs designed to match your vision',
            colorScheme: ['#553c9a', '#6b46c1', '#7c3aed'],
            preview: '🎯',
            description: `AI-generated design based on: "${customDesignInput.substring(0, 60)}${customDesignInput.length > 60 ? '...' : ''}"`,
            features: ['Custom tailored', 'AI-generated', 'User requirements', 'Personalized design']
          });
        }

        return designVariations;
      } else {
        // Default designs when no input provided
        return [
          {
            id: `ai-design-${Date.now()}-1`,
            name: 'Innovation Tech',
            category: 'Technology',
            coverStyle: 'Futuristic design with digital elements',
            tabStyle: 'Tech-inspired tabs with neon accents',
            colorScheme: ['#553c9a', '#6b46c1', '#7c3aed'],
            preview: '💻',
            description: 'Technology-focused design for digital transformation and smart city proposals',
            features: ['Digital aesthetics', 'Tech elements', 'Future-forward design', 'Smart city theme']
          },
          {
            id: `ai-design-${Date.now()}-2`,
            name: 'Healthcare Excellence',
            category: 'Healthcare',
            coverStyle: 'Medical-inspired clean design with health icons',
            tabStyle: 'Healthcare tabs with medical color scheme',
            colorScheme: ['#c53030', '#e53e3e', '#f56565'],
            preview: '🏥',
            description: 'Healthcare-focused design for medical facility and wellness proposals',
            features: ['Medical aesthetics', 'Health icons', 'Clean design', 'Trust-building elements']
          },
          {
            id: `ai-design-${Date.now()}-3`,
            name: 'Transportation Hub',
            category: 'Transportation',
            coverStyle: 'Transit-inspired with movement and flow',
            tabStyle: 'Transportation tabs with route-like design',
            colorScheme: ['#2a69ac', '#3182ce', '#4299e1'],
            preview: '🚇',
            description: 'Transportation-focused design for transit and mobility proposals',
            features: ['Movement elements', 'Transit aesthetics', 'Flow design', 'Mobility icons']
          }
        ];
      }
    };

    setTimeout(() => {
      const newDesigns = generateCustomDesigns();
      setAiDesignOptions(prev => [...prev, ...newDesigns]);
      setIsGeneratingDesigns(false);

      toast.success(customDesignInput.trim()
        ? "AI has generated custom design options based on your requirements."
        : "3 additional AI-generated design options have been created based on your proposal context.");
    }, 2500);
  };

  const handleSelectAIDesign = (designId: string) => {
    setSelectedAIDesign(designId);
    const selectedDesign = aiDesignOptions.find(d => d.id === designId);
    if (selectedDesign) {
      // Apply the selected design theme
      setSelectedTheme(selectedDesign.category.toLowerCase());
      toast.success(`"${selectedDesign.name}" design has been applied to your proposal.`);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] mb-6">
        <div className="mb-6">
          <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit mb-2 flex items-center gap-2">
            <Target className="h-5 w-5 text-[#161950]" />
            Proposal Planning & Strategy
          </h3>
          <p className="text-gray-600 text-sm font-outfit">
            AI-powered tools to analyze requirements and create winning strategies
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-[#161950]/10 p-3 rounded-xl group-hover:bg-[#161950]/15 transition-colors">
                <Brain className="h-6 w-6 text-[#161950]" />
              </div>
              <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 text-xs font-outfit">
                Ready
              </Badge>
            </div>
            <h3 className="text-base font-semibold font-outfit text-[#1A1A1A] mb-2">
              RFP Mind Map
            </h3>
            <p className="text-xs text-gray-600 font-outfit mb-4 leading-relaxed">
              Visual representation of key requirements, stakeholders, and decision factors extracted from RFP documents
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Sparkles className="h-3 w-3" />
                <span className="font-outfit">AI Generated</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-xs"
                onClick={() => {
                  toast.info("RFP Mind Map view - Coming soon! This will show a visual representation of requirements and stakeholders.");
                }}
              >
                <Eye className="h-3 w-3 mr-1.5" />
                View
              </Button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-[#161950]/10 p-3 rounded-xl group-hover:bg-[#161950]/15 transition-colors">
                <FileText className="h-6 w-6 text-[#161950]" />
              </div>
              <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 text-xs font-outfit">
                Generate
              </Badge>
            </div>
            <h3 className="text-base font-semibold font-outfit text-[#1A1A1A] mb-2">
              Management Plan
            </h3>
            <p className="text-xs text-gray-600 font-outfit mb-4 leading-relaxed">
              Comprehensive project plan with timelines, milestones, resource allocation, and risk management strategies
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span className="font-outfit">~2 min</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-xs"
                onClick={handleGenerateManagementPlan}
              >
                <Download className="h-3 w-3 mr-1.5" />
                Generate
              </Button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-[#161950]/10 p-3 rounded-xl group-hover:bg-[#161950]/15 transition-colors">
                <Target className="h-6 w-6 text-[#161950]" />
              </div>
              <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 text-xs font-outfit">
                Generate
              </Badge>
            </div>
            <h3 className="text-base font-semibold font-outfit text-[#1A1A1A] mb-2">
              Pursuit Strategy
            </h3>
            <p className="text-xs text-gray-600 font-outfit mb-4 leading-relaxed">
              Win strategy with competitive analysis, client insights, differentiation points, and recommended approach
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Zap className="h-3 w-3" />
                <span className="font-outfit">AI Powered</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-xs"
                onClick={handleGenerateStrategy}
              >
                <Target className="h-3 w-3 mr-1.5" />
                Generate
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit mb-2 flex items-center gap-2">
              <Palette className="h-5 w-5 text-[#161950]" />
              Proposal Design
            </h3>
            <p className="text-gray-600 text-sm font-outfit">
              Customize visual theme, layout styles, and design elements for your proposal
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAIDesignDialogOpen(true)}
            className="flex items-center gap-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
          >
            <Brain className="h-4 w-4 text-[#161950]" />
            <span className="font-outfit">AI Designs</span>
          </Button>
        </div>
        
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base font-semibold font-outfit text-[#1A1A1A]">
                Proposal Theme
              </Label>
              <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 text-xs">
                {designThemes.find(t => t.id === selectedTheme)?.name || "Not Selected"}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {designThemes.map((theme) => (
                <div
                  key={theme.id}
                  className={`cursor-pointer rounded-xl border-2 transition-all p-5 hover:shadow-lg group ${
                    selectedTheme === theme.id
                      ? "border-[#161950] bg-gradient-to-br from-[#161950]/10 to-[#161950]/5 shadow-lg ring-2 ring-[#161950]/20 scale-[1.02]"
                      : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedTheme(theme.id)}
                >
                  <div className={`mb-4 rounded-lg p-4 flex items-center justify-center ${
                    selectedTheme === theme.id 
                      ? "bg-white border-2 border-[#161950]/20" 
                      : "bg-gray-50 border border-gray-200"
                  }`}>
                    <div className="text-5xl">{theme.preview}</div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold font-outfit text-[#1A1A1A] text-base">{theme.name}</h4>
                    {selectedTheme === theme.id && (
                      <div className="bg-[#161950] rounded-full p-1">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-600 font-outfit mb-4 leading-relaxed min-h-[2.5rem]">
                    {theme.description}
                  </p>
                  
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-500 font-outfit mb-2">Color Palette</p>
                    <div className="flex justify-center gap-2">
                      {theme.colors.map((color, index) => (
                        <div
                          key={index}
                          className={`w-6 h-6 rounded-lg border-2 shadow-sm transition-transform ${
                            selectedTheme === theme.id 
                              ? "border-white ring-1 ring-[#161950]/30" 
                              : "border-gray-200"
                          } group-hover:scale-110`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base font-semibold font-outfit text-[#1A1A1A]">
                Cover Page Layout
              </Label>
              <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 text-xs">
                {selectedCover || "Not Selected"}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {["Classic", "Modern", "Minimalist"].map((style) => (
                <div
                  key={style}
                  className={`cursor-pointer rounded-xl border-2 transition-all p-5 hover:shadow-md ${
                    selectedCover === style
                      ? "border-[#161950] bg-[#161950]/5 shadow-md ring-2 ring-[#161950]/20"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                  onClick={() => setSelectedCover(style)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <Layout className="h-6 w-6 text-gray-600" />
                    </div>
                    {selectedCover === style && (
                      <CheckCircle className="h-4 w-4 text-[#161950]" />
                    )}
                  </div>
                  <h4 className="font-semibold font-outfit text-[#1A1A1A]">{style}</h4>
                  <p className="text-xs text-gray-500 font-outfit mt-1">
                    {style === "Classic" && "Traditional professional layout"}
                    {style === "Modern" && "Contemporary design with bold elements"}
                    {style === "Minimalist" && "Clean and simple aesthetic"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base font-semibold font-outfit text-[#1A1A1A]">
                Proposal Tabs Style
              </Label>
              <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 text-xs">
                {selectedTabs || "Not Selected"}
              </Badge>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Input
                  placeholder="Number of tabs (e.g., 5)"
                  value="5"
                  onChange={() => {}}
                  className="border-gray-200 font-outfit max-w-32"
                />
                <span className="text-sm text-gray-500 font-outfit">tabs</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {["Standard", "Colored", "Minimalist"].map((style) => (
                  <div
                    key={style}
                    className={`cursor-pointer rounded-xl border-2 transition-all p-4 hover:shadow-md ${
                      selectedTabs === style
                        ? "border-[#161950] bg-[#161950]/5 shadow-md ring-2 ring-[#161950]/20"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                    onClick={() => setSelectedTabs(style)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold font-outfit text-[#1A1A1A] mb-1">{style} Tabs</h4>
                        <p className="text-xs text-gray-500 font-outfit">
                          {style === "Standard" && "Default tab styling"}
                          {style === "Colored" && "Colorful tab design"}
                          {style === "Minimalist" && "Simple tab appearance"}
                        </p>
                      </div>
                      {selectedTabs === style && (
                        <CheckCircle className="h-4 w-4 text-[#161950]" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-medium">
                Design Images & Assets
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI Enhanced
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>AI-powered image enhancement available</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center mb-4 hover:border-gray-300 transition-colors bg-gray-50">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              {isUploadingImages ? (
                <div className="space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#161950] mx-auto"></div>
                  <p className="text-sm text-gray-600">Uploading images...</p>
                  <Progress value={75} className="w-32 mx-auto" />
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Upload images for your proposal design
                    </p>
                    <p className="text-xs text-gray-500">
                      Supports JPG, PNG, GIF up to 10MB each
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Images
                  </Button>
                </div>
              )}
            </div>

            {uploadedImages.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Uploaded Images ({uploadedImages.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {uploadedImages.map((image) => (
                    <div key={image.id} className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-md transition-all">
                      <div className="p-3">
                        <div className="relative mb-3">
                          <img
                            src={image.url}
                            alt={image.name}
                            className="w-full h-24 object-cover rounded"
                            style={{
                              filter: `brightness(${100 + image.enhancementSettings.brightness}%) contrast(${100 + image.enhancementSettings.contrast}%) saturate(${100 + image.enhancementSettings.saturation}%) blur(${image.enhancementSettings.blur}px)`,
                              transform: `rotate(${image.enhancementSettings.rotation}deg)`,
                            }}
                          />
                          {image.enhancementSettings.aiEnhanced && (
                            <div className="absolute top-1 right-1">
                              <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 text-xs font-outfit">
                                <Sparkles className="h-2 w-2 mr-1" />
                                AI
                              </Badge>
                            </div>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 left-1 h-6 w-6 p-0"
                            onClick={() => handleDeleteImage(image.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-xs font-medium truncate">{image.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(image.size)}</p>
                          
                          <Select
                            value={image.purpose}
                            onValueChange={(value) => handleImagePurposeChange(image.id, value as UploadedImage['purpose'])}
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cover">Cover Image</SelectItem>
                              <SelectItem value="background">Background</SelectItem>
                              <SelectItem value="content">Content Image</SelectItem>
                              <SelectItem value="logo">Logo/Branding</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-7 text-xs"
                            onClick={() => {
                              setSelectedImageForEdit(image);
                              setIsEnhancementDialogOpen(true);
                            }}
                          >
                            <Wand2 className="h-3 w-3 mr-1" />
                            Enhance
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isEnhancementDialogOpen} onOpenChange={setIsEnhancementDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-[#161950]" />
              Image Enhancement Studio
            </DialogTitle>
            <DialogDescription>
              Enhance your image with AI-powered tools and manual adjustments
            </DialogDescription>
          </DialogHeader>
          
          {selectedImageForEdit && (
            <div className="space-y-6">
              
              <div className="text-center">
                <div className="relative inline-block">
                  <img
                    src={selectedImageForEdit.url}
                    alt={selectedImageForEdit.name}
                    className="max-w-full h-48 object-contain rounded border"
                    style={{
                      filter: `brightness(${100 + selectedImageForEdit.enhancementSettings.brightness}%) contrast(${100 + selectedImageForEdit.enhancementSettings.contrast}%) saturate(${100 + selectedImageForEdit.enhancementSettings.saturation}%) blur(${selectedImageForEdit.enhancementSettings.blur}px)`,
                      transform: `rotate(${selectedImageForEdit.enhancementSettings.rotation}deg)`,
                    }}
                  />
                  {selectedImageForEdit.enhancementSettings.aiEnhanced && (
                    <Badge className="absolute top-2 right-2 bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Enhanced
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-2">{selectedImageForEdit.name}</p>
              </div>

              <div className="bg-[#161950]/5 rounded-xl border border-[#161950]/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#161950]/10 p-2 rounded-lg">
                      <Sparkles className="h-5 w-5 text-[#161950]" />
                    </div>
                    <div>
                      <h4 className="font-semibold font-outfit text-[#1A1A1A]">AI Auto-Enhancement</h4>
                      <p className="text-sm text-gray-600 font-outfit">Let AI optimize your image automatically</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleAIEnhancement}
                    className="bg-[#161950] hover:bg-[#0f1440]"
                    disabled={selectedImageForEdit.enhancementSettings.aiEnhanced}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    {selectedImageForEdit.enhancementSettings.aiEnhanced ? 'Enhanced' : 'Enhance'}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold font-outfit text-[#1A1A1A] flex items-center gap-2">
                      <Sun className="h-4 w-4 text-[#161950]" />
                      Lighting & Color
                    </h4>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs font-medium">Brightness ({selectedImageForEdit.enhancementSettings.brightness}%)</Label>
                      <Input
                        type="range"
                        min="-50"
                        max="50"
                        value={selectedImageForEdit.enhancementSettings.brightness}
                        onChange={(e) => handleEnhancementChange('brightness', Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium">Contrast ({selectedImageForEdit.enhancementSettings.contrast}%)</Label>
                      <Input
                        type="range"
                        min="-50"
                        max="50"
                        value={selectedImageForEdit.enhancementSettings.contrast}
                        onChange={(e) => handleEnhancementChange('contrast', Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium">Saturation ({selectedImageForEdit.enhancementSettings.saturation}%)</Label>
                      <Input
                        type="range"
                        min="-50"
                        max="50"
                        value={selectedImageForEdit.enhancementSettings.saturation}
                        onChange={(e) => handleEnhancementChange('saturation', Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold font-outfit text-[#1A1A1A] flex items-center gap-2">
                      <Move3D className="h-4 w-4 text-[#161950]" />
                      Effects & Transform
                    </h4>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs font-medium">Blur ({selectedImageForEdit.enhancementSettings.blur}px)</Label>
                      <Input
                        type="range"
                        min="0"
                        max="10"
                        value={selectedImageForEdit.enhancementSettings.blur}
                        onChange={(e) => handleEnhancementChange('blur', Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium">Rotation ({selectedImageForEdit.enhancementSettings.rotation}°)</Label>
                      <Input
                        type="range"
                        min="-180"
                        max="180"
                        value={selectedImageForEdit.enhancementSettings.rotation}
                        onChange={(e) => handleEnhancementChange('rotation', Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium mb-2 block">Filter Effects</Label>
                      <Select
                        value={selectedImageForEdit.enhancementSettings.filter}
                        onValueChange={(value) => handleEnhancementChange('filter', value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="sepia">Sepia</SelectItem>
                          <SelectItem value="grayscale">Grayscale</SelectItem>
                          <SelectItem value="vintage">Vintage</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleEnhancementChange('brightness', 0);
                    handleEnhancementChange('contrast', 0);
                    handleEnhancementChange('saturation', 0);
                    handleEnhancementChange('blur', 0);
                    handleEnhancementChange('rotation', 0);
                    handleEnhancementChange('filter', 'none');
                    handleEnhancementChange('aiEnhanced', false);
                  }}
                >
                  <RotateCw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
                <Button variant="outline" size="sm">
                  <Crop className="h-3 w-3 mr-1" />
                  Crop
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="h-3 w-3 mr-1" />
                  More Filters
                </Button>
                <Button variant="outline" size="sm">
                  <PaletteIcon className="h-3 w-3 mr-1" />
                  Color Grading
                </Button>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsEnhancementDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  setIsEnhancementDialogOpen(false);
                  toast.success("Image enhancements have been saved to your proposal design.");
                }}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Apply Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAIDesignDialogOpen} onOpenChange={setIsAIDesignDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-[#161950]" />
              AI Generated Design Options
            </DialogTitle>
            <DialogDescription>
              Choose from AI-generated proposal designs tailored to your project type and client needs
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold font-outfit text-[#1A1A1A] flex items-center gap-2 mb-2">
                  <Brain className="h-5 w-5 text-[#161950]" />
                  Describe Your Design Vision
                </h3>
                <p className="text-sm text-gray-600 font-outfit">
                  Tell AI about your design preferences, industry focus, color preferences, or style requirements
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Design Requirements & Preferences
                  </Label>
                  <Textarea
                    placeholder="e.g., 'Modern and professional design with blue color scheme for infrastructure project. Need clean layouts with technical diagrams and corporate styling for city government client...'"
                    value={customDesignInput}
                    onChange={(e) => setCustomDesignInput(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">
                      💡 Be specific about colors, style, industry, or client type for better results
                    </p>
                    <span className="text-xs text-gray-400">
                      {customDesignInput.length}/500
                    </span>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium mb-2 block">Quick Suggestions</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Modern & minimalist',
                      'Professional corporate',
                      'Colorful & vibrant',
                      'Technical & detailed',
                      'Clean & simple',
                      'Bold & impactful'
                    ].map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                          const currentInput = customDesignInput.trim();
                          const newInput = currentInput
                            ? `${currentInput}, ${suggestion.toLowerCase()}`
                            : suggestion;
                          setCustomDesignInput(newInput);
                        }}
                      >
                        + {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>

                {customDesignInput.trim() && (
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">AI Preview</p>
                        <p className="text-xs text-blue-700">
                          Based on your input, AI will generate designs focusing on: {
                            customDesignInput.toLowerCase().includes('modern') ? 'modern aesthetics, ' : ''
                          }{
                            customDesignInput.toLowerCase().includes('professional') || customDesignInput.toLowerCase().includes('corporate') ? 'professional styling, ' : ''
                          }{
                            customDesignInput.toLowerCase().includes('colorful') || customDesignInput.toLowerCase().includes('vibrant') ? 'vibrant colors, ' : ''
                          }and your specific requirements.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {aiDesignOptions.map((design) => (
                <div
                  key={design.id}
                  className={`rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg p-4 ${
                    selectedAIDesign === design.id
                      ? 'border-[#161950] bg-[#161950]/5 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                  onClick={() => setSelectedAIDesign(design.id)}
                >
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-3xl">{design.preview}</div>
                      <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200">
                        {design.category}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold font-outfit text-[#1A1A1A] mb-2">{design.name}</h3>
                    <p className="text-sm text-gray-600 font-outfit">
                      {design.description}
                    </p>
                  </div>
                  <div className="space-y-3">
                    
                    <div>
                      <Label className="text-xs font-medium">Color Scheme</Label>
                      <div className="flex space-x-1 mt-1">
                        {design.colorScheme.map((color, index) => (
                          <div
                            key={index}
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs font-medium">Cover Style</Label>
                        <p className="text-xs text-gray-600">{design.coverStyle}</p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium">Tab Style</Label>
                        <p className="text-xs text-gray-600">{design.tabStyle}</p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs font-medium mb-1 block">Key Features</Label>
                      <div className="flex flex-wrap gap-1">
                        {design.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-[#161950] hover:bg-[#0f1440]"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectAIDesign(design.id);
                        }}
                        disabled={selectedAIDesign === design.id}
                      >
                        {selectedAIDesign === design.id ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Selected
                          </>
                        ) : (
                          'Use Design'
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-200 hover:bg-gray-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Future: Open design customization
                          toast.info("Design customization will be available in the next update.");
                        }}
                      >
                        <Wand2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-2 border-dashed border-[#161950]/20 bg-[#161950]/5 rounded-xl p-6 text-center">
              <div className="space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="bg-[#161950]/10 p-3 rounded-full">
                      <Sparkles className="h-8 w-8 text-[#161950]" />
                    </div>
                  </div>

                  {isGeneratingDesigns ? (
                    <div className="space-y-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#161950] mx-auto"></div>
                      <h4 className="font-semibold text-[#1A1A1A] font-outfit">Generating New Designs...</h4>
                      <p className="text-sm text-gray-600 font-outfit">
                        {customDesignInput.trim()
                          ? "AI is creating custom designs based on your specific requirements..."
                          : "AI is analyzing your proposal requirements to create personalized design options"
                        }
                      </p>
                      <Progress value={65} className="w-48 mx-auto" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-[#1A1A1A] font-outfit">
                        {customDesignInput.trim() ? "Generate Custom Designs" : "Need More Options?"}
                      </h4>
                      <p className="text-sm text-gray-600 font-outfit max-w-md mx-auto">
                        {customDesignInput.trim()
                          ? "Generate personalized designs based on your custom requirements above"
                          : "Generate additional AI-powered design variations based on your proposal content and industry focus"
                        }
                      </p>
                      <Button
                        onClick={handleGenerateMoreDesigns}
                        className="bg-[#161950] hover:bg-[#0f1440]"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        {customDesignInput.trim() ? "Generate Custom Designs" : "Generate More Designs"}
                      </Button>
                      {customDesignInput.trim() && (
                        <p className="text-xs text-[#161950] mt-2 font-outfit">
                          ✨ Custom designs will be created based on: "{customDesignInput.substring(0, 50)}..."
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {selectedAIDesign && (
              <div className="border-2 border-[#161950]/20 bg-[#161950]/5 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-[#161950]" />
                  <div>
                    <h4 className="font-semibold font-outfit text-[#1A1A1A]">
                      Design Selected: {aiDesignOptions.find(d => d.id === selectedAIDesign)?.name}
                    </h4>
                    <p className="text-sm text-gray-600 font-outfit">
                      This design will be applied to your proposal when you close this dialog
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600">
              💡 Tip: You can further customize any selected design in the main design section
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsAIDesignDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setIsAIDesignDialogOpen(false);
                  if (selectedAIDesign) {
                    toast.success("Your selected AI design has been applied to the proposal. You can further customize it below.");
                  }
                }}
                className="bg-[#161950] hover:bg-[#0f1440]"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Apply Design
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <div className="mb-6">
          <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit mb-2 flex items-center gap-2">
            <Settings className="h-5 w-5 text-[#161950]" />
            Section Details Configuration
          </h3>
          <p className="text-gray-600 text-sm font-outfit">
            Configure sections, page limits, and visual elements for your proposal
          </p>
        </div>
        
        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-semibold font-outfit text-[#1A1A1A] block mb-1">
                Total Page Limit
              </Label>
              <p className="text-xs text-gray-600 font-outfit">
                Set the maximum number of pages for the entire proposal
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={totalPages}
                onChange={(e) => setTotalPages(Number(e.target.value))}
                className="w-24 border-gray-200 font-outfit font-semibold text-center"
                min={1}
              />
              <span className="text-sm text-gray-600 font-outfit">pages</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {sectionDetails.map((section, index) => {
            const visualElementsCount = [
              section.includeGraphics,
              section.includeInfographics,
              section.includeMatrixes,
              section.includeImages,
              section.includeTables,
              section.includeCharts,
              section.includeFlowcharts,
            ].filter(Boolean).length;
            
            const isOpen = expandedSections.has(index);
            const toggleSection = () => {
              setExpandedSections(prev => {
                const newSet = new Set(prev);
                if (newSet.has(index)) {
                  newSet.delete(index);
                } else {
                  newSet.add(index);
                }
                return newSet;
              });
            };
            
            return (
              <Collapsible key={index} open={isOpen} onOpenChange={toggleSection}>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
                  <CollapsibleTrigger asChild>
                    <div className="cursor-pointer hover:bg-gray-50 transition-colors p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="bg-[#161950]/10 p-3 rounded-xl">
                            <FileText className="h-5 w-5 text-[#161950]" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-bold font-outfit text-[#1A1A1A] text-base">
                                {section.name}
                              </h4>
                              {section.required && (
                                <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 text-xs font-semibold font-outfit">
                                  Required
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-500 font-outfit">Pages:</span>
                                <span className="text-sm font-bold font-outfit text-[#1A1A1A]">
                                  {section.selectedPages}
                                </span>
                                {section.pageLimit && (
                                  <>
                                    <span className="text-xs text-gray-400">/</span>
                                    <span className="text-xs text-gray-500 font-outfit">
                                      {section.pageLimit} max
                                    </span>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-500 font-outfit">Elements:</span>
                                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs">
                                  {visualElementsCount} selected
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          {isOpen ? (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="px-5 pb-5 pt-0 border-t border-gray-100">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-5">
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-bold font-outfit text-[#1A1A1A] block mb-3">
                              Pages Allocated
                            </Label>
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <div className="flex items-center gap-4 mb-3">
                                <Input
                                  type="number"
                                  value={section.selectedPages}
                                  onChange={(e) =>
                                    handleSectionChange(
                                      index,
                                      "selectedPages",
                                      Number(e.target.value),
                                    )
                                  }
                                  max={section.pageLimit}
                                  min={1}
                                  className="border-gray-200 font-outfit font-semibold text-center w-20"
                                />
                                {section.pageLimit && (
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between text-xs mb-1">
                                      <span className="text-gray-600 font-outfit">Maximum Limit</span>
                                      <span className="font-semibold text-gray-700 font-outfit">
                                        {section.pageLimit} pages
                                      </span>
                                    </div>
                                    <Progress 
                                      value={(section.selectedPages / section.pageLimit) * 100} 
                                      className="h-2"
                                    />
                                  </div>
                                )}
                              </div>
                              {section.pageLimit && (
                                <p className="text-xs text-gray-500 font-outfit mt-2">
                                  {section.pageLimit - section.selectedPages} pages remaining
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <Label className="text-sm font-bold font-outfit text-[#1A1A1A]">
                              Visual Elements
                            </Label>
                            <Badge variant="outline" className="bg-[#161950]/10 text-[#161950] border-[#161950]/20 text-xs font-semibold">
                              {visualElementsCount} of 7 selected
                            </Badge>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { key: "includeGraphics", label: "Graphics", icon: "📊" },
                                { key: "includeInfographics", label: "Infographics", icon: "📈" },
                                { key: "includeMatrixes", label: "Matrices", icon: "📋" },
                                { key: "includeImages", label: "Images", icon: "🖼️" },
                                { key: "includeTables", label: "Tables", icon: "📊" },
                                { key: "includeCharts", label: "Charts", icon: "📉" },
                                { key: "includeFlowcharts", label: "Flow Charts", icon: "🔄" },
                              ].map((element) => {
                                const isChecked = section[element.key as keyof SectionDetail] as boolean;
                                return (
                                  <div
                                    key={element.key}
                                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition-all cursor-pointer ${
                                      isChecked
                                        ? "bg-[#161950]/10 border-[#161950]/30 shadow-sm"
                                        : "bg-white border-gray-200 hover:border-gray-300"
                                    }`}
                                    onClick={() =>
                                      handleSectionChange(
                                        index,
                                        element.key as keyof SectionDetail,
                                        !isChecked,
                                      )
                                    }
                                  >
                                    <Checkbox
                                      id={`${index}-${element.key}`}
                                      checked={isChecked}
                                      onCheckedChange={(checked) =>
                                        handleSectionChange(
                                          index,
                                          element.key as keyof SectionDetail,
                                          checked,
                                        )
                                      }
                                      className="border-gray-300"
                                    />
                                    <Label
                                      htmlFor={`${index}-${element.key}`}
                                      className={`text-xs font-outfit cursor-pointer flex items-center gap-2 flex-1 ${
                                        isChecked ? "text-[#1A1A1A] font-semibold" : "text-gray-600"
                                      }`}
                                    >
                                      <span className="text-base">{element.icon}</span>
                                      <span>{element.label}</span>
                                    </Label>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-[#161950]/5 rounded-lg border border-[#161950]/20">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-[#161950]" />
            <div>
              <p className="font-semibold font-outfit text-[#1A1A1A]">
                Total Pages:{" "}
                {sectionDetails.reduce(
                  (sum, section) => sum + section.selectedPages,
                  0,
                )}{" "}
                / {totalPages}
              </p>
              <p className="text-sm text-gray-600 font-outfit">
                AI will generate layouts based on your selections
                {uploadedImages.length > 0 && ` and ${uploadedImages.length} uploaded image(s)`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <div className="mb-6">
          <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit mb-2">
            Layout & Design Options
          </h3>
          <p className="text-gray-600 text-sm font-outfit">
            Choose overall layout patterns for your proposal sections
          </p>
        </div>
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-base font-medium mb-3 block">
                Primary Layout
              </Label>
              <Select value={primaryLayout} onValueChange={setPrimaryLayout}>
                <SelectTrigger>
                  <SelectValue placeholder="Select layout style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard (1 column)</SelectItem>
                  <SelectItem value="two-column">Two column</SelectItem>
                  <SelectItem value="mixed">Mixed layouts</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-base font-medium mb-3 block">
                Header & Footer Style
              </Label>
              <Select value={headerFooterStyle} onValueChange={setHeaderFooterStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="Select header/footer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="branded">Branded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Save and Next Buttons */}
      {(onSave || onNext) && (
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
          {onSave && (
            <Button
              onClick={handleSaveSections}
              variant="outline"
              disabled={isSaving || isLoadingSections || !proposalId}
              className="font-outfit border-[#161950] text-[#161950] hover:bg-[#161950]/5"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          )}
          {onNext && (
            <Button
              onClick={onNext}
              disabled={!sectionsSaved || sectionDetails.length === 0}
              className="font-outfit bg-[#161950] hover:bg-[#0f1440] text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
