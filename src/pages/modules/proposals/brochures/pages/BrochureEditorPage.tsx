import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
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
import { useProposals } from '@/hooks/proposals';
import { ProposalHeader } from '../../proposals/components/ProposalHeader';
import { ProposalProgressSteps } from '../../proposals/components/ProposalProgressSteps';
import { ProposalProgressCard } from '../../proposals/components/ProposalProgressCard';
import { apiClient } from '@/services/api/client';
import { useQueryClient } from '@tanstack/react-query';
import { proposalKeys } from '@/hooks/proposals/useProposals';
import { ContentTab, DesignTab, ImagesTab, PreviewTab, LaunchTab } from '../components';
import type { BrochureSection, DesignTheme, UploadedImage } from '../components/types';

export default function BrochureEditorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { useProposal, updateProposal, isUpdating } = useProposals();
  const [activeTab, setActiveTab] = useState('content');
  const [brochureProgress, setBrochureProgress] = useState(65);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingSection, setIsSavingSection] = useState(false);
  const [isEditMode, setIsEditMode] = useState(() => {
    const mode = location.state?.mode;
    const urlParams = new URLSearchParams(location.search);
    const urlMode = urlParams.get('mode');
    // Always allow editing in brochure editor
    return mode !== 'view' && urlMode !== 'view';
  });
  
  // Fetch brochure data
  const { data: brochure, isLoading: isLoadingBrochure } = useProposal(id, !!id);
  const [sections, setSections] = useState<BrochureSection[]>([]);
  const [existingSectionMap, setExistingSectionMap] = useState<Map<string, any>>(new Map());
  const [selectedSection, setSelectedSection] = useState<string>('1');
  const [selectedTheme, setSelectedTheme] = useState<string>('modern-blue');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [pendingFiles, setPendingFiles] = useState<UploadedImage[]>([]); // Files waiting to be saved
  const [isSavingFiles, setIsSavingFiles] = useState(false);
  const [sectionEditPrompts, setSectionEditPrompts] = useState<{[key: string]: string}>({});
  const [processingSectionEdit, setProcessingSectionEdit] = useState<{[key: string]: boolean}>({});
  const [contentPrompt, setContentPrompt] = useState('');
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [recentChanges, setRecentChanges] = useState<Array<{id: string; sectionId: string; prompt: string; timestamp: string}>>([]);
  const [aiSuggestions, setAiSuggestions] = useState<Array<{type: string; suggestion: string; sectionId?: string}>>([]);
  const [opportunityData, setOpportunityData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [aiGeneratedBrochure, setAiGeneratedBrochure] = useState<any>(null);
  const [isGeneratingBrochure, setIsGeneratingBrochure] = useState(false);

  // Load brochure data from API
  const [brochureData, setBrochureData] = useState({
    id: id || '',
    name: 'Untitled Brochure',
    client: '',
    status: 'draft',
  });

  // Load brochure data and sections from API
  useEffect(() => {
    if (brochure && id) {
      setBrochureData({
        id: brochure.id,
        name: brochure.title || 'Untitled Brochure',
        client: brochure.account_name || '',
        status: brochure.status || 'draft',
      });

      // Load existing documents/images
      if (brochure.documents && Array.isArray(brochure.documents) && brochure.documents.length > 0) {
        console.log('[BrochureEditor] Loading existing documents:', brochure.documents);
        const existingFiles: UploadedImage[] = brochure.documents.map((doc: any) => {
          // Determine if it's an image based on category or file type
          const isImage = doc.category === 'image' || 
                         (doc.file_name && /\.(jpg|jpeg|png|gif|webp)$/i.test(doc.file_name)) ||
                         (doc.name && /\.(jpg|jpeg|png|gif|webp)$/i.test(doc.name));
          
          // Get URL - use file_url, file_path, or url field
          let url = doc.file_url || doc.file_path || doc.url || '';
          
          // If URL is relative, prepend API base URL
          if (url && !url.startsWith('http') && !url.startsWith('data:')) {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
            // Remove leading slash if present to avoid double slash
            url = `${baseUrl}${url.startsWith('/') ? url : '/' + url}`;
          }
          
          // If no URL, use placeholder based on file type
          if (!url) {
            // Use document icon placeholder SVG for all files without URLs
            url = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE0IDJINkMyLjY5IDIgMCAyLjY5IDAgNlYxOEMwIDIwLjMxIDEuNjkgMjIgNCAyMkgyMEMyMS4zMSAyMiAyMiAyMC4zMSAyMiAxOVY4TDE0IDJaIiBzdHJva2U9IiM2NjY2NjYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik0xNCAyVjhIMjIiIHN0cm9rZT0iIzY2NjY2NiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+';
          }
          
          const fileObj = {
            id: doc.id || Math.random().toString(36).substr(2, 9),
            name: doc.file_name || doc.name || 'Unknown file',
            url: url,
            size: doc.extra_metadata?.file_size || doc.file_size || 0,
            uploadedAt: doc.created_at || doc.uploaded_at || doc.uploadedAt || new Date().toISOString(),
            isSaved: true,
          };
          
          console.log('[BrochureEditor] Mapped document:', fileObj);
          return fileObj;
        });
        
        console.log('[BrochureEditor] Setting uploadedImages:', existingFiles);
        setUploadedImages(existingFiles);
      } else {
        console.log('[BrochureEditor] No documents found in brochure:', {
          hasDocuments: !!brochure.documents,
          isArray: Array.isArray(brochure.documents),
          length: brochure.documents?.length,
        });
      }
      setBrochureProgress(brochure.progress || 65);
      
      // Load opportunity data if available
      if (brochure.opportunity_id) {
        // Fetch opportunity details for auto-content generation
        apiClient.get(`/opportunities/${brochure.opportunity_id}`)
          .then(response => {
            setOpportunityData(response.data);
          })
          .catch(error => {
            console.error('Error fetching opportunity:', error);
          });
      }
      
      // Load sections from API
      if (brochure.sections && Array.isArray(brochure.sections) && brochure.sections.length > 0) {
        const loadedSections: BrochureSection[] = brochure.sections.map((section: any) => ({
          id: section.id || `section-${section.display_order || 0}`,
          title: section.title || 'Untitled Section',
          content: section.content || '',
          order: section.display_order || 0,
        }));
        setSections(loadedSections);
        
        // Create map of existing sections for updates
        const sectionMap = new Map<string, any>();
        brochure.sections.forEach((section: any) => {
          sectionMap.set(section.id || `section-${section.display_order || 0}`, section);
        });
        setExistingSectionMap(sectionMap);
        
        // Set first section as selected if available
        if (loadedSections.length > 0 && !selectedSection) {
          setSelectedSection(loadedSections[0].id);
        }
      }
      
    } else if (location.state?.brochure) {
      setBrochureData(location.state.brochure);
    }
  }, [brochure, id, location.state]);

  // Auto-generate sections based on opportunity when no sections exist
  useEffect(() => {
    if (brochure && id && sections.length === 0 && opportunityData && !isGeneratingContent) {
      // Auto-generate sections based on opportunity
      handleAutoGenerateSections();
    }
  }, [brochure, id, opportunityData, sections.length]);

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

  const handleSave = async () => {
    if (!id) {
      toast.error('Brochure ID is required');
      return;
    }

    try {
      setIsLoading(true);
      await updateProposal({
        id,
        data: {
          title: brochureData.name,
        },
      });
      toast.success('Brochure saved successfully');
      setIsEditMode(false);
    } catch (error: any) {
      console.error('Error saving brochure:', error);
      toast.error(error.response?.data?.detail || 'Failed to save brochure');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleAddSection = async () => {
    if (!id) {
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
    
    // Save to API
    try {
      setIsSavingSection(true);
      const response = await apiClient.post(`/proposals/${id}/sections`, {
        title: newSection.title,
        content: newSection.content,
        section_type: 'other',
        display_order: newSection.order,
      });
      
      // Update local section with server ID
      if (response.data?.sections) {
        const savedSection = response.data.sections[response.data.sections.length - 1];
        setSections(prev => prev.map(s => 
          s.id === newSection.id ? { ...s, id: savedSection.id } : s
        ));
        setExistingSectionMap(prev => new Map(prev).set(savedSection.id, savedSection));
        setSelectedSection(savedSection.id);
      }
      
      // Invalidate proposal cache
      queryClient.invalidateQueries({ queryKey: proposalKeys.detail(id) });
      toast.success('Section added successfully');
    } catch (error: any) {
      console.error('Error adding section:', error);
      toast.error(error.response?.data?.detail || 'Failed to add section');
      // Revert local change
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
    
    if (!id) {
      toast.error('Brochure ID is required');
      return;
    }
    
    // Check if it's an existing section (has UUID) or temp section
    const isExistingSection = existingSectionMap.has(sectionId);
    
    // Remove from local state first
    const updatedSections = sections.filter(s => s.id !== sectionId);
    setSections(updatedSections);
    if (selectedSection === sectionId) {
      setSelectedSection(updatedSections[0]?.id || '');
    }
    
    // Delete from API if it's an existing section
    // Note: API might not have delete endpoint, so we'll just remove locally
    // The section will remain in DB but won't be displayed
    if (isExistingSection) {
      // For now, just remove from local state
      // TODO: Implement soft delete or actual delete endpoint in backend
      setExistingSectionMap(prev => {
        const newMap = new Map(prev);
        newMap.delete(sectionId);
        return newMap;
      });
      toast.success('Section removed (note: section deletion from API pending)');
    } else {
      toast.success('Section removed');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageFiles(e.dataTransfer.files);
    }
  };

  // Handle file selection - store locally, don't upload yet
  const handleImageFiles = async (files: FileList) => {
    if (!files || files.length === 0) {
      console.log('[BrochureEditor] No files selected');
      return;
    }

    console.log('[BrochureEditor] Processing', files.length, 'file(s) for preview');

    const newPendingFiles: UploadedImage[] = [];

    for (const file of Array.from(files)) {
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      
      // Validate file type (allow images and common document types)
      const isImage = file.type.startsWith('image/');
      const isDocument = file.type.includes('pdf') || 
                        file.type.includes('document') || 
                        file.type.includes('text') ||
                        file.type.includes('spreadsheet') ||
                        file.name.endsWith('.pdf') ||
                        file.name.endsWith('.doc') ||
                        file.name.endsWith('.docx') ||
                        file.name.endsWith('.txt') ||
                        file.name.endsWith('.xls') ||
                        file.name.endsWith('.xlsx');
      
      if (!isImage && !isDocument) {
        toast.error(`${file.name} is not a supported file type`);
        continue;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum size is 10MB`);
        continue;
      }

      // Create preview immediately using Promise (only for images)
      let previewUrl = '';
      if (isImage) {
        previewUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
            resolve(event.target?.result as string);
          };
          reader.onerror = () => {
            resolve('');
          };
          reader.readAsDataURL(file);
        });
      } else {
        // For documents, use a placeholder icon
        previewUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE0IDJINkMyLjY5IDIgMCAyLjY5IDAgNlYxOEMwIDIwLjMxIDEuNjkgMjIgNCAyMkgyMEMyMS4zMSAyMiAyMiAyMC4zMSAyMiAxOVY4TDE0IDJaIiBzdHJva2U9IiM2NjY2NjYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik0xNCAyVjhIMjIiIHN0cm9rZT0iIzY2NjY2NiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+';
      }

      if (previewUrl) {
        const newFile: UploadedImage = {
          id: tempId,
          name: file.name,
          url: previewUrl,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          file: file, // Store the File object
          isSaved: false, // Mark as not saved yet
        };
        newPendingFiles.push(newFile);
      }
    }

    // Add to pending files
    if (newPendingFiles.length > 0) {
      setPendingFiles(prev => [...prev, ...newPendingFiles]);
      toast.info(`${newPendingFiles.length} file(s) ready to save. Click "Save Files" to upload.`);
    }

    // Reset file input after processing
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Save pending files to server
  const handleSaveFiles = async () => {
    if (!id) {
      toast.error('Brochure ID is required');
      return;
    }

    if (pendingFiles.length === 0) {
      toast.info('No files to save');
      return;
    }

    setIsSavingFiles(true);
    toast.info(`Saving ${pendingFiles.length} file(s)...`);

    const uploadResults: Array<{ success: boolean; fileName: string; error?: string }> = [];

    // Process each file sequentially
    for (const pendingFile of pendingFiles) {
      if (!pendingFile.file) {
        uploadResults.push({ success: false, fileName: pendingFile.name, error: 'File object missing' });
        continue;
      }

      const file = pendingFile.file;
      const isImage = file.type.startsWith('image/');

      try {
        const formData = new FormData();
        formData.append('file', file);
        const category = isImage ? 'image' : 'attachment';
        formData.append('category', category);
        
        console.log('[BrochureEditor] Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);
        
        const response = await apiClient.post(`/proposals/${id}/documents/upload`, formData);
        
        console.log('[BrochureEditor] Upload response:', response.data);
        
        if (response.data?.documents && Array.isArray(response.data.documents)) {
          const documents = response.data.documents;
          const uploadedDoc = documents[documents.length - 1];
          
          if (uploadedDoc?.id) {
            // Move from pending to uploadedImages
            setPendingFiles(prev => prev.filter(f => f.id !== pendingFile.id));
            setUploadedImages(prev => [...prev, {
              ...pendingFile,
              id: uploadedDoc.id,
              url: uploadedDoc.file_url || uploadedDoc.file_path || uploadedDoc.url || pendingFile.url,
              name: uploadedDoc.file_name || uploadedDoc.name || pendingFile.name,
              isSaved: true,
              file: undefined, // Remove file object after saving
            }]);
            
            console.log('[BrochureEditor] File saved successfully:', uploadedDoc.id);
            uploadResults.push({ success: true, fileName: file.name });
          } else {
            uploadResults.push({ success: false, fileName: file.name, error: 'No document ID in response' });
          }
        } else {
          uploadResults.push({ success: false, fileName: file.name, error: 'Invalid response format' });
        }
        
        // Invalidate query cache to refresh proposal data
        queryClient.invalidateQueries({ queryKey: proposalKeys.detail(id) });
      } catch (error: any) {
        console.error('[BrochureEditor] Error saving file:', error);
        const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Upload failed';
        toast.error(`Failed to save ${file.name}: ${errorMessage}`);
        uploadResults.push({ success: false, fileName: file.name, error: errorMessage });
      }
    }

    setIsSavingFiles(false);

    // Show summary
    const successCount = uploadResults.filter(r => r.success).length;
    const failCount = uploadResults.length - successCount;

    if (successCount > 0) {
      toast.success(`Successfully saved ${successCount} file(s)`);
    }
    if (failCount > 0 && successCount === 0) {
      toast.error(`Failed to save ${failCount} file(s). Please check the console for details.`);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageFiles(files);
    }
    // Reset file input
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!id) {
      toast.error('Brochure ID is required');
      return;
    }
    
    // Remove from local state first
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
    
    // Delete from API if it's not a temp ID
    // Note: Check if delete endpoint exists, if not just remove locally
    if (!imageId.startsWith('temp-')) {
      try {
        // Try to delete from API (endpoint may not exist yet)
        try {
          await apiClient.delete(`/proposals/${id}/documents/${imageId}`);
          queryClient.invalidateQueries({ queryKey: proposalKeys.detail(id) });
          toast.success('Image deleted successfully');
        } catch (deleteError: any) {
          // If delete endpoint doesn't exist (404), just remove locally
          if (deleteError.response?.status === 404) {
            console.warn('Delete endpoint not available, removing locally only');
            toast.success('Image removed (delete endpoint pending)');
          } else {
            throw deleteError;
          }
        }
      } catch (error: any) {
        console.error('Error deleting image:', error);
        toast.error(error.response?.data?.detail || 'Failed to delete image');
        // Revert local change - reload from API
        queryClient.invalidateQueries({ queryKey: proposalKeys.detail(id) });
      }
    } else {
      toast.success('Image removed');
    }
  };

  // AI-powered brochure generation
  const handleGenerateAIBrochure = async () => {
    if (!id || !brochure || !opportunityData) {
      toast.error('Missing required information to generate brochure');
      return;
    }

    setIsGeneratingBrochure(true);
    toast.info('🤖 AI is creating the perfect brochure for your opportunity...');

    try {
      // Collect all brochure data with comprehensive information
      const projectValue = opportunityData.project_value || brochure.total_value || 0;
      const currency = opportunityData.currency || brochure.currency || 'USD';
      const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      };

      const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return 'TBD';
        try {
          return new Date(dateStr).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
        } catch {
          return dateStr;
        }
      };

      const brochureContext = {
        opportunity: {
          name: opportunityData.project_name || opportunityData.name || '',
          description: opportunityData.description || '',
          value: projectValue,
          currency: currency,
          sector: opportunityData.market_sector || '',
          stage: opportunityData.stage || '',
          location: opportunityData.location || opportunityData.state || '',
          deadline: opportunityData.deadline || opportunityData.expected_rfp_date || '',
          myRole: opportunityData.my_role || '',
          teamSize: opportunityData.team_size || '',
          riskLevel: opportunityData.risk_level || '',
          clientName: opportunityData.client_name || brochure.account_name || '',
        },
        account: {
          name: brochure.account_name || opportunityData.client_name || '',
          type: brochure.account_type || '',
          id: brochure.account_id || '',
        },
        brochure: {
          title: brochure.title || '',
          status: brochure.status || '',
          createdAt: brochure.created_at || '',
        },
        sections: sections.map(s => ({
          title: s.title,
          content: s.content,
          order: s.order,
        })),
        design: {
          theme: selectedTheme,
        },
        images: uploadedImages.length,
        documents: brochure.documents?.length || 0,
      };

      console.log('[BrochureEditor] Generating AI brochure with context:', brochureContext);

      // Generate professional brochure content using AI
      let aiGeneratedContent: Record<string, string> = {};
      try {
        // Generate professional content for each section using AI
        const contentPromises = [];
        
        // Generate Executive Summary
        contentPromises.push(
          apiClient.post('/v1/chat/generate-response', {
            user_message: `Create a professional executive summary for a brochure about this opportunity:
            
Project: ${brochureContext.opportunity.name}
Client: ${brochureContext.account.name}
Value: ${formatCurrency(Number(brochureContext.opportunity.value))}
Sector: ${brochureContext.opportunity.sector}
Location: ${brochureContext.opportunity.location}
Deadline: ${formatDate(brochureContext.opportunity.deadline)}
Description: ${brochureContext.opportunity.description || 'N/A'}

Create a professional, compelling executive summary (200-300 words) that highlights:
1. Project overview and key objectives
2. Value proposition and benefits
3. Why we're the ideal partner
4. Key highlights and metrics

Format as professional markdown with proper headings, bold text for key points, and bullet points.`,
            module: 'proposals',
            use_case: 'content_development',
            thinking_mode: 'normal'
          }).then(res => res.data.response).catch(() => null)
        );

        // Generate Service Capabilities content
        contentPromises.push(
          apiClient.post('/v1/chat/generate-response', {
            user_message: `Create professional service capabilities content for a brochure:

Sector: ${brochureContext.opportunity.sector || 'Professional Services'}
Project Type: ${brochureContext.opportunity.myRole || 'Comprehensive Service Delivery'}
Team Size: ${brochureContext.opportunity.teamSize || 'Expert Team'}

Create detailed, professional content (300-400 words) covering:
1. Core service offerings specific to ${brochureContext.opportunity.sector || 'this sector'}
2. Technical expertise and capabilities
3. Industry-specific experience
4. Key differentiators and competitive advantages
5. Why we excel in this domain

Format as professional markdown with headings (##), subheadings (###), bold key points (**text**), and bullet lists. Make it compelling and detailed.`,
            module: 'proposals',
            use_case: 'content_development',
            thinking_mode: 'normal'
          }).then(res => res.data.response).catch(() => null)
        );

        // Generate Methodology content
        contentPromises.push(
          apiClient.post('/v1/chat/generate-response', {
            user_message: `Create professional methodology and approach content for a brochure:

Project: ${brochureContext.opportunity.name}
Sector: ${brochureContext.opportunity.sector || 'Professional Services'}

Create a comprehensive methodology section (400-500 words) describing:
1. Phase 1: Discovery & Strategic Planning (detailed approach)
2. Phase 2: Design & Development (methodologies, frameworks)
3. Phase 3: Implementation & Delivery (execution strategy)
4. Phase 4: Support & Continuous Improvement (ongoing engagement)

Format as professional markdown with clear phase headings (##), subheadings (###), detailed bullet points with bold key terms (**text**), and professional descriptions. Make it comprehensive and impressive.`,
            module: 'proposals',
            use_case: 'content_development',
            thinking_mode: 'normal'
          }).then(res => res.data.response).catch(() => null)
        );

        const [execSummary, serviceCapabilities, methodology] = await Promise.all(contentPromises);
        
        aiGeneratedContent = {
          executiveSummary: execSummary || '',
          serviceCapabilities: serviceCapabilities || '',
          methodology: methodology || '',
        };

        console.log('[BrochureEditor] AI content generated:', Object.keys(aiGeneratedContent));
      } catch (error) {
        console.warn('[BrochureEditor] AI generation failed, using enhanced templates:', error);
        // Continue with enhanced templates if AI fails
      }

      // Helper to get theme background colors
      const getThemeColors = (theme: string) => {
        const themes: Record<string, { primary: string; secondary: string; accent: string; bg: string; bgLight: string }> = {
          'modern-blue': {
            primary: '#161950',
            secondary: '#2563EB',
            accent: '#3B82F6',
            bg: '#EFF6FF',
            bgLight: '#DBEAFE',
          },
          'corporate-gray': {
            primary: '#4B5563',
            secondary: '#6B7280',
            accent: '#9CA3AF',
            bg: '#F9FAFB',
            bgLight: '#F3F4F6',
          },
          'premium-purple': {
            primary: '#7C3AED',
            secondary: '#8B5CF6',
            accent: '#A78BFA',
            bg: '#F5F3FF',
            bgLight: '#EDE9FE',
          },
          'tech-cyan': {
            primary: '#0891B2',
            secondary: '#06B6D4',
            accent: '#22D3EE',
            bg: '#ECFEFF',
            bgLight: '#CFFAFE',
          },
        };
        return themes[theme] || themes['modern-blue'];
      };

      const themeColors = getThemeColors(selectedTheme);

      // Generate comprehensive, professional PPT-style brochure structure with enhanced details
      const generatedSections: any[] = [
        // Cover Page
        {
          id: 'cover',
          title: '',
          content: '',
          type: 'cover',
          order: 0,
          backgroundColor: themeColors.primary,
          textAlign: 'center' as const,
        },
        // Executive Summary / Overview
        {
          id: 'executive-summary',
          title: 'Executive Summary',
          content: aiGeneratedContent.executiveSummary || `## Project Overview\n\n${brochureContext.opportunity.description || `This comprehensive proposal outlines our approach to delivering exceptional results for ${brochureContext.opportunity.name}. We combine industry-leading expertise, innovative solutions, and a commitment to excellence to ensure your project's success.`}\n\n### Key Highlights\n\n${brochureContext.opportunity.value ? `**Project Value:** ${formatCurrency(Number(brochureContext.opportunity.value))}\n\n` : ''}${brochureContext.opportunity.location ? `**Project Location:** ${brochureContext.opportunity.location}\n\n` : ''}${brochureContext.opportunity.sector ? `**Industry Sector:** ${brochureContext.opportunity.sector}\n\n` : ''}${brochureContext.opportunity.deadline ? `**Project Deadline:** ${formatDate(brochureContext.opportunity.deadline)}\n\n` : ''}### Our Commitment\n\nWe are dedicated to delivering a solution that not only meets but exceeds your expectations, driving measurable business value and long-term success.`,
          type: 'summary',
          order: 1,
          backgroundColor: themeColors.bg,
          textAlign: 'left' as const,
          imageIndex: uploadedImages.length > 0 ? 0 : null,
        },
        // Project Details
        {
          id: 'project-details',
          title: 'Project Details & Scope',
          content: `## Comprehensive Project Information\n\n### Project Name\n**${brochureContext.opportunity.name}**\n\n### Client Information\n**Client Organization:** ${brochureContext.account.name}\n\n${brochureContext.account.type ? `**Client Type:** ${brochureContext.account.type}\n\n` : ''}### Project Specifications\n\n${brochureContext.opportunity.sector ? `**Market Sector:** ${brochureContext.opportunity.sector}\n\n` : ''}${brochureContext.opportunity.stage ? `**Current Stage:** ${brochureContext.opportunity.stage.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}\n\n` : ''}${brochureContext.opportunity.riskLevel ? `**Risk Level:** ${brochureContext.opportunity.riskLevel.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}\n\n` : ''}${brochureContext.opportunity.location ? `**Geographic Location:** ${brochureContext.opportunity.location}\n\n` : ''}${brochureContext.opportunity.deadline ? `**Project Deadline:** ${formatDate(brochureContext.opportunity.deadline)}\n\n` : ''}### Project Scope\n\nOur comprehensive approach encompasses all aspects of project delivery, from initial planning through final implementation and ongoing support. We will work closely with your team to ensure alignment with your strategic objectives and business requirements.`,
          type: 'details',
          order: 2,
          backgroundColor: themeColors.bgLight,
          textAlign: 'left' as const,
          imageIndex: uploadedImages.length > 1 ? 1 : null,
        },
        // Financial Overview
        ...(brochureContext.opportunity.value ? [{
          id: 'financial-overview',
          title: 'Financial Overview & Value Proposition',
          content: `## Project Investment Analysis\n\n### Total Project Value\n**${formatCurrency(Number(brochureContext.opportunity.value))}**\n\n### Comprehensive Value Proposition\n\nOur strategic approach ensures maximum return on investment through multiple value drivers:\n\n- **Strategic Planning Excellence:** Optimized resource allocation, budget management, and financial forecasting to ensure cost-effective delivery\n- **Operational Efficiency Gains:** Streamlined processes, automation, and workflow optimization resulting in significant cost savings\n- **Quality Assurance Framework:** Comprehensive risk mitigation strategies and quality control measures that prevent costly rework\n- **Long-term Value Creation:** Sustainable solutions with scalable architecture and ongoing support that deliver continuous benefits\n- **Innovation & Best Practices:** Leveraging cutting-edge technologies and industry best practices to maximize efficiency and effectiveness\n\n### Resource Allocation\n\n${brochureContext.opportunity.teamSize ? `**Proposed Team Size:** ${brochureContext.opportunity.teamSize} dedicated professionals across multiple disciplines\n\n` : ''}${brochureContext.opportunity.myRole ? `**Our Primary Role:** ${brochureContext.opportunity.myRole}\n\n` : ''}### Investment Protection\n\nWe understand that project investment requires careful management. Our transparent cost structure, regular financial reporting, and value-driven approach ensure you receive maximum return on your investment while maintaining budget discipline.`,
          type: 'financial',
          order: 3,
          backgroundColor: themeColors.bg,
          textAlign: 'left' as const,
          imageIndex: uploadedImages.length > 2 ? 2 : null,
        }] : []),
        // Service Capabilities
        {
          id: 'service-capabilities',
          title: 'Our Service Capabilities & Expertise',
          content: aiGeneratedContent.serviceCapabilities || `## Comprehensive Service Portfolio\n\n${brochureContext.opportunity.sector ? `### Specialization in ${brochureContext.opportunity.sector}` : '### Core Competencies & Expertise'}\n\nOur team brings extensive, industry-recognized expertise in ${brochureContext.opportunity.sector || 'professional services'}, delivering a comprehensive suite of capabilities:\n\n### Core Service Offerings\n\n- **Strategic Consulting & Advisory:** Data-driven insights, market analysis, and expert guidance to inform strategic decision-making and drive business outcomes\n- **End-to-End Project Management:** Comprehensive project delivery from initiation through closure, with meticulous oversight and stakeholder management\n- **Technical Excellence & Innovation:** Cutting-edge solutions leveraging the latest technologies, frameworks, and industry best practices\n- **Quality Assurance & Testing:** Rigorous quality control frameworks, comprehensive testing protocols, and continuous improvement methodologies\n- **Support & Maintenance Services:** Ongoing support, maintenance, optimization, and enhancement services to ensure long-term success\n- **Change Management & Training:** Comprehensive change management strategies and training programs to ensure smooth adoption and user success\n\n### Why We're the Right Partner\n\n- **Proven Track Record:** Demonstrated success in delivering ${brochureContext.opportunity.sector || 'complex'} projects with measurable results\n- **Experienced Team:** ${brochureContext.opportunity.teamSize || 'Highly skilled'} professionals with deep domain expertise and industry knowledge\n- **Client-Centric Approach:** Tailored solutions designed specifically for your unique requirements and business context\n- **Innovation Leadership:** Continuous innovation through adoption of emerging technologies and methodologies\n- **Excellence Commitment:** Unwavering commitment to quality, excellence, and delivering value at every stage of engagement`,
          type: 'services',
          order: 4,
          backgroundColor: themeColors.bgLight,
          textAlign: 'left' as const,
          imageIndex: uploadedImages.length > 3 ? 3 : null,
        },
      ];

        // Add existing sections if they exist
        if (sections.length > 0) {
          sections.forEach((section, index) => {
            generatedSections.push({
              id: section.id,
              title: section.title,
              content: section.content || `## ${section.title}\n\nDetailed, comprehensive content for the ${section.title} section, providing in-depth information and insights relevant to your project requirements.`,
              type: 'custom',
              order: 5 + index,
              backgroundColor: index % 2 === 0 ? themeColors.bg : themeColors.bgLight,
              textAlign: 'left' as const,
              imageIndex: uploadedImages.length > (4 + index) ? (4 + index) : null,
            });
          });
        } else {
          // Add default sections if no custom sections exist
          generatedSections.push(
            {
              id: 'methodology',
              title: 'Our Proven Methodology & Approach',
              content: aiGeneratedContent.methodology || `## Comprehensive Project Delivery Framework\n\n### Phase 1: Discovery & Strategic Planning\n\n**Comprehensive Requirements Analysis:** Deep-dive analysis to understand your business needs, technical requirements, and strategic objectives through stakeholder interviews, workshops, and documentation review.\n\n**Stakeholder Engagement & Alignment:** Systematic engagement with key stakeholders to ensure buy-in, alignment, and clear communication of project goals and expectations.\n\n**Risk Assessment & Mitigation Planning:** Proactive identification, assessment, and mitigation of potential risks through comprehensive risk management frameworks and contingency planning.\n\n**Resource Planning & Allocation:** Strategic resource allocation, team composition, and capacity planning to ensure optimal utilization and project success.\n\n### Phase 2: Design & Development\n\n**Solution Design & Architecture:** Comprehensive solution design and architectural planning that aligns with your technical requirements and strategic objectives.\n\n**Agile Development & Iterative Refinement:** Agile methodologies with iterative development cycles, regular demonstrations, and continuous feedback integration.\n\n**Quality Assurance & Testing:** Comprehensive quality assurance framework with multi-level testing including unit, integration, system, and user acceptance testing.\n\n**Documentation & Knowledge Transfer:** Comprehensive documentation including technical specifications, user guides, and knowledge transfer sessions to ensure team enablement.\n\n### Phase 3: Implementation & Delivery\n\n**Phased Rollout & Deployment:** Strategic phased deployment approach minimizing disruption while ensuring smooth transition and system availability.\n\n**Training & Change Management:** Comprehensive training programs and change management initiatives to ensure user adoption and organizational readiness.\n\n**Go-Live Support & Stabilization:** Dedicated go-live support with rapid issue resolution, performance monitoring, and stabilization activities.\n\n**Performance Monitoring & Optimization:** Continuous performance monitoring, analytics, and optimization to ensure system efficiency and user satisfaction.\n\n### Phase 4: Support & Continuous Improvement\n\n**Ongoing Maintenance & Support:** Proactive maintenance, support services, and issue resolution to ensure system reliability and availability.\n\n**Continuous Improvement Initiatives:** Regular reviews, feedback analysis, and enhancement initiatives to drive continuous value and optimization.\n\n**Performance Monitoring & Analytics:** Advanced analytics and reporting to track performance metrics, user adoption, and business value realization.\n\n**Strategic Advisory & Consultation:** Ongoing strategic advisory services to support decision-making, optimization, and future enhancements.`,
              type: 'methodology',
              order: 5,
              backgroundColor: themeColors.bg,
              textAlign: 'left' as const,
              imageIndex: uploadedImages.length > 4 ? 4 : null,
            },
            {
              id: 'key-differentiators',
              title: 'Key Differentiators & Competitive Advantages',
              content: `## What Sets Us Apart in the Market\n\n### Experience & Industry Expertise\n\n**Industry Leadership:** Recognized expertise and thought leadership in ${brochureContext.opportunity.sector || 'professional services'}, with deep understanding of industry challenges, trends, and best practices.\n\n**Proven Track Record:** Successfully delivered ${brochureContext.opportunity.sector ? `numerous ${brochureContext.opportunity.sector} projects` : 'hundreds of projects'} with measurable results, client satisfaction, and demonstrated business value.\n\n**Team Excellence:** ${brochureContext.opportunity.teamSize || 'Highly skilled'} professionals with deep domain knowledge, certifications, and continuous learning to stay at the forefront of industry developments.\n\n### Innovation & Technology Leadership\n\n**Cutting-edge Solutions:** Adoption of latest technologies, frameworks, and methodologies to deliver innovative, future-ready solutions.\n\n**Innovative Approaches:** Creative problem-solving, design thinking, and optimization techniques that drive efficiency and effectiveness.\n\n**Future-ready Architecture:** Scalable, adaptable, and extensible solutions designed to grow with your business and adapt to changing requirements.\n\n### Client-Centric Approach\n\n**Tailored Solutions:** Customized solutions specifically designed to meet your unique requirements, business context, and strategic objectives.\n\n**Collaborative Partnership:** Transparent communication, regular updates, and collaborative decision-making throughout the project lifecycle.\n\n**Value-driven Delivery:** Focus on delivering measurable business value, ROI, and outcomes that align with your strategic objectives.\n\n### Quality & Reliability Excellence\n\n**Rigorous Quality Assurance:** Comprehensive quality control frameworks, testing protocols, and continuous improvement methodologies.\n\n**Proactive Risk Management:** Advanced risk identification, assessment, and mitigation strategies to minimize project risks and ensure delivery success.\n\n**Reliable Delivery Commitment:** Proven track record of on-time, on-budget delivery with transparent project management and stakeholder communication.`,
              type: 'differentiators',
              order: 6,
              backgroundColor: themeColors.bgLight,
              textAlign: 'left' as const,
              imageIndex: uploadedImages.length > 5 ? 5 : null,
            }
          );
        }

      // Add closing sections with enhanced details
      const baseOrder = generatedSections.length;
      generatedSections.push(
        {
          id: 'project-timeline',
          title: 'Project Timeline & Key Milestones',
          content: `## Comprehensive Project Timeline\n\n${brochureContext.opportunity.deadline ? `### Target Completion Date: ${formatDate(brochureContext.opportunity.deadline)}` : '### Timeline Overview & Delivery Schedule'}\n\n### Detailed Project Milestones\n\n1. **Phase 1 - Planning & Discovery:** Requirements gathering, stakeholder alignment, project setup, and planning activities (2-4 weeks)\n\n2. **Phase 2 - Design & Development:** Solution design, architecture planning, development, and iterative refinement (8-12 weeks)\n\n3. **Phase 3 - Testing & Quality Assurance:** Comprehensive testing, quality assurance, user acceptance testing, and refinement (2-4 weeks)\n\n4. **Phase 4 - Deployment & Go-Live:** Phased deployment, training, go-live support, and stabilization activities (2-3 weeks)\n\n5. **Phase 5 - Support & Optimization:** Ongoing support, maintenance, monitoring, and continuous improvement (Ongoing)\n\n### Our Commitment to Delivery Excellence\n\nWe are committed to delivering this project on schedule while maintaining the highest standards of quality. Our agile methodology ensures flexibility to accommodate evolving requirements while staying on track. We provide regular progress updates, milestone reviews, and transparent communication throughout the project lifecycle.\n\n### Risk Mitigation & Contingency Planning\n\nOur comprehensive risk management approach includes proactive identification, assessment, and mitigation strategies to minimize schedule risks and ensure timely delivery.`,
          type: 'timeline',
          order: baseOrder,
          backgroundColor: themeColors.bg,
          textAlign: 'left' as const,
          imageIndex: uploadedImages.length > 6 ? 6 : null,
        },
        {
          id: 'team-expertise',
          title: 'Our Expert Team & Capabilities',
          content: `## Dedicated Project Team\n\n### Core Team Composition\n\n${brochureContext.opportunity.teamSize ? `**Team Size:** ${brochureContext.opportunity.teamSize} dedicated professionals with specialized expertise across multiple disciplines\n\n` : '**Team Structure:** Multi-disciplinary team of experienced experts, each bringing specialized skills and knowledge\n\n'}${brochureContext.opportunity.myRole ? `**Our Primary Role & Responsibility:** ${brochureContext.opportunity.myRole}\n\n` : '**Our Approach:** Full-service project delivery with end-to-end accountability and support\n\n'}### Core Expertise Areas\n\n**Project Management & Coordination:** Certified project managers with extensive experience in complex project delivery, stakeholder management, and risk mitigation.\n\n**Technical Development & Implementation:** Senior developers and architects with deep technical expertise in modern technologies, frameworks, and best practices.\n\n**Quality Assurance & Testing:** Dedicated QA professionals with comprehensive testing frameworks and quality control methodologies.\n\n**Business Analysis & Consulting:** Experienced business analysts and consultants with strong domain knowledge and analytical capabilities.\n\n**Change Management & Training:** Specialized change management experts and trainers to ensure smooth adoption and user enablement.\n\n### Why Our Team Stands Out\n\n- **Collective Experience:** Combined decades of experience in ${brochureContext.opportunity.sector || 'professional services'} with proven track record of success\n- **Diverse Skill Sets:** Comprehensive skill coverage across all project requirements and technical domains\n- **Seamless Collaboration:** Strong teamwork, communication, and coordination to ensure integrated delivery\n- **Client Dedication:** Unwavering commitment to your project's success and satisfaction`,
          type: 'team',
          order: baseOrder + 1,
          backgroundColor: themeColors.bgLight,
          textAlign: 'left' as const,
          imageIndex: uploadedImages.length > 7 ? 7 : null,
        },
        {
          id: 'success-metrics',
          title: 'Expected Outcomes & Success Metrics',
          content: `## Comprehensive Success Measurement Framework\n\n### Key Performance Indicators (KPIs)\n\n**On-Time Delivery Excellence:** Adherence to project timeline, milestone completion, and delivery schedule with 95%+ on-time performance target.\n\n**Budget Compliance & Financial Management:** Delivery within allocated budget with transparent financial reporting and cost optimization.\n\n**Quality Standards & Excellence:** Meeting or exceeding all quality requirements with comprehensive quality assurance and testing protocols.\n\n**Client Satisfaction & Stakeholder Approval:** Positive stakeholder feedback, user satisfaction, and approval ratings exceeding 90%.\n\n**Business Value Realization:** Measurable impact on business objectives, KPIs, and strategic goals with quantifiable ROI.\n\n### Expected Business Benefits\n\n- **Operational Efficiency Improvements:** Streamlined processes, automation, and optimization resulting in 20-30% efficiency gains\n- **Enhanced Service Delivery Capabilities:** Improved service quality, response times, and customer satisfaction\n- **Risk Reduction & Quality Enhancement:** Proactive risk management and quality assurance leading to reduced incidents and improved reliability\n- **Strategic Alignment:** Alignment with business goals, objectives, and long-term strategic direction\n- **Long-term Value Creation:** Sustainable solutions delivering continuous value, scalability, and adaptability\n\n### Our Success Criteria & Definition\n\nWe define project success through comprehensive criteria:\n\n1. **Solution Excellence:** Delivering a solution that not only meets but exceeds all functional and technical requirements\n2. **Budget & Timeline Discipline:** Staying within budget and timeline constraints while maintaining quality standards\n3. **Quality Excellence:** Exceeding quality expectations through rigorous testing and quality assurance\n4. **Stakeholder Satisfaction:** Ensuring positive stakeholder feedback, user adoption, and satisfaction\n5. **Long-term Value Creation:** Creating sustainable value that supports your organization's long-term success and growth`,
          type: 'metrics',
          order: baseOrder + 2,
          backgroundColor: themeColors.bg,
          textAlign: 'left' as const,
          imageIndex: uploadedImages.length > 8 ? 8 : null,
        },
        {
          id: 'next-steps',
          title: 'Next Steps & Call to Action',
          content: `## Let's Begin This Journey Together\n\n### Proposed Next Steps & Engagement Process\n\n1. **Detailed Requirements Discussion:** Comprehensive project requirements review, stakeholder alignment session, and scope definition to ensure complete understanding\n\n2. **Customized Proposal Refinement:** Tailored solution proposal development based on your specific needs, requirements, and strategic objectives\n\n3. **Team Introduction & Kickoff:** Meet the dedicated team members who will work on your project, understand roles, and establish communication protocols\n\n4. **Timeline & Milestone Confirmation:** Finalize detailed project timeline, milestones, deliverables, and success criteria with your team\n\n5. **Engagement Formalization:** Agreement signing, contract finalization, and project kickoff to begin our collaborative journey\n\n### Why Choose Us as Your Partner\n\n- **Proven Expertise & Track Record:** Demonstrated success in delivering ${brochureContext.opportunity.sector || 'complex'} projects with measurable results\n- **Client-Focused Approach:** Your success is our top priority, with dedicated attention and support throughout the engagement\n- **Transparent Communication:** Regular updates, open dialogue, and transparent reporting to keep you informed and engaged\n- **Value-Driven Delivery:** Focus on delivering measurable business value, ROI, and outcomes that matter to your organization\n- **Long-term Partnership:** Commitment to long-term collaboration, support, and continuous improvement beyond project completion\n\n### Ready to Get Started?\n\n**We're excited about the opportunity to partner with you on this important initiative.**\n\nContact us today to learn more about our capabilities, discuss your specific requirements, and explore how we can support your ${brochureContext.opportunity.sector || 'business'} needs and drive success.\n\n${brochureContext.opportunity.value ? `**Project Investment:** ${formatCurrency(Number(brochureContext.opportunity.value))}\n\n` : ''}**Let's create something exceptional together and achieve remarkable results.**`,
          type: 'cta',
          order: baseOrder + 3,
          backgroundColor: themeColors.bgLight,
          textAlign: 'center' as const,
          imageIndex: uploadedImages.length > 9 ? 9 : null,
        }
      );

      const generatedBrochure = {
        id: `ai-brochure-${Date.now()}`,
        title: `${brochureContext.account.name} - ${brochureContext.opportunity.name} - Service Capabilities Brochure`,
        cover: {
          title: brochureContext.opportunity.name,
          subtitle: brochureContext.account.name,
          tagline: brochureContext.opportunity.sector 
            ? `Professional ${brochureContext.opportunity.sector} Solutions`
            : 'Professional Service Capabilities',
          backgroundImage: uploadedImages.length > 0 ? uploadedImages[0].url : null,
          projectValue: brochureContext.opportunity.value ? formatCurrency(Number(brochureContext.opportunity.value)) : null,
          deadline: brochureContext.opportunity.deadline ? formatDate(brochureContext.opportunity.deadline) : null,
        },
        sections: generatedSections,
        design: {
          theme: selectedTheme,
          primaryColor: themeColors.primary,
          secondaryColor: themeColors.secondary,
          accentColor: themeColors.accent,
          backgroundColor: themeColors.bg,
          backgroundLightColor: themeColors.bgLight,
        },
        metadata: {
          generatedAt: new Date().toISOString(),
          opportunityId: brochure.opportunity_id,
          accountId: brochure.account_id,
          totalPages: generatedSections.length,
          imagesCount: uploadedImages.length,
        },
      };

      setAiGeneratedBrochure(generatedBrochure);
      toast.success('✨ AI brochure generated successfully!');
      
    } catch (error: any) {
      console.error('[BrochureEditor] Error generating AI brochure:', error);
      toast.error('Failed to generate brochure. Please try again.');
    } finally {
      setIsGeneratingBrochure(false);
    }
  };

  const handleAutoGenerateSections = async () => {
    if (!id || !opportunityData) return;

    setIsGeneratingContent(true);
    toast.success('🤖 AI is generating content based on the opportunity...');

    try {
      // Generate sections based on opportunity
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

      // Save sections to API
      if (id) {
        for (const section of autoSections) {
          try {
            const response = await apiClient.post(`/proposals/${id}/sections`, {
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
        queryClient.invalidateQueries({ queryKey: proposalKeys.detail(id) });
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

    if (!id) {
      toast.error('Brochure ID is required');
      return;
    }

    setIsGeneratingContent(true);
    toast.success('🤖 AI is generating content based on your prompt...');

    try {
      // Generate content based on prompt and opportunity data
      const oppName = opportunityData?.project_name || opportunityData?.name || 'the project';
      const oppDesc = opportunityData?.description || '';
      
      // Simulate AI content generation
      const generatedContent = `Based on your request: "${contentPrompt}"\n\nFor ${oppName}:\n\n${oppDesc ? `Project Overview: ${oppDesc.substring(0, 300)}...\n\n` : ''}This section addresses your specific requirements and provides relevant information tailored to your needs.`;

      // Create a new section with generated content
      const newSection: BrochureSection = {
        id: `temp-${Date.now()}`,
        title: contentPrompt.substring(0, 50) || 'New Section',
        content: generatedContent,
        order: sections.length + 1,
      };

      setSections(prev => [...prev, newSection]);
      setSelectedSection(newSection.id);
      setContentPrompt('');

      // Save to API
      try {
        const response = await apiClient.post(`/proposals/${id}/sections`, {
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
        queryClient.invalidateQueries({ queryKey: proposalKeys.detail(id) });
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

  if ((isLoading || isLoadingBrochure) && id) {
    return (
      <div className="w-full h-full bg-white font-outfit flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#161950] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading brochure data...</p>
        </div>
      </div>
    );
  }

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
                <TabsList className="grid w-full grid-cols-5 h-auto p-0 gap-1.5 bg-transparent">
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
                  <TabsTrigger
                    value="launch"
                    className="flex items-center justify-center gap-2 min-h-[50px] whitespace-normal data-[state=active]:bg-[#161950] data-[state=active]:text-white data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-600 font-outfit"
                  >
                    <Zap className="h-5 w-5" />
                    <span>Launch</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="mt-0 space-y-6">
                  <ContentTab
                    brochureId={id}
                    sections={sections}
                    setSections={setSections}
                    selectedSection={selectedSection}
                    setSelectedSection={setSelectedSection}
                    existingSectionMap={existingSectionMap}
                    setExistingSectionMap={setExistingSectionMap}
                    isEditMode={isEditMode}
                    isSavingSection={isSavingSection}
                    setIsSavingSection={setIsSavingSection}
                    sectionEditPrompts={sectionEditPrompts}
                    setSectionEditPrompts={setSectionEditPrompts}
                    processingSectionEdit={processingSectionEdit}
                    setProcessingSectionEdit={setProcessingSectionEdit}
                    contentPrompt={contentPrompt}
                    setContentPrompt={setContentPrompt}
                    isGeneratingContent={isGeneratingContent}
                    setIsGeneratingContent={setIsGeneratingContent}
                    recentChanges={recentChanges}
                    setRecentChanges={setRecentChanges}
                    aiSuggestions={aiSuggestions}
                    opportunityData={opportunityData}
                    onNext={() => setActiveTab('design')}
                  />
                </TabsContent>

                <TabsContent value="design" className="mt-0 space-y-6">
                  <DesignTab
                    brochureId={id}
                    designThemes={designThemes}
                    selectedTheme={selectedTheme}
                    setSelectedTheme={setSelectedTheme}
                    isEditMode={isEditMode}
                    onNext={() => setActiveTab('images')}
                    brochure={brochure}
                    onDesignSaved={() => {
                      queryClient.invalidateQueries({ queryKey: proposalKeys.detail(id) });
                    }}
                  />
                </TabsContent>

                <TabsContent value="images" className="mt-0 space-y-6">
                  <ImagesTab
                    brochureId={id}
                    uploadedImages={uploadedImages}
                    setUploadedImages={setUploadedImages}
                    pendingFiles={pendingFiles}
                    setPendingFiles={setPendingFiles}
                    isSavingFiles={isSavingFiles}
                    setIsSavingFiles={setIsSavingFiles}
                    isEditMode={isEditMode}
                    onNext={() => setActiveTab('preview')}
                  />
                </TabsContent>

                <TabsContent value="preview" className="mt-0 space-y-6">
                  <PreviewTab
                    sections={sections}
                    uploadedImages={uploadedImages}
                    selectedTheme={selectedTheme}
                    opportunityData={opportunityData}
                    brochure={brochure}
                    aiGeneratedBrochure={aiGeneratedBrochure}
                    setAiGeneratedBrochure={setAiGeneratedBrochure}
                    isGeneratingBrochure={isGeneratingBrochure}
                    setIsGeneratingBrochure={setIsGeneratingBrochure}
                    onNext={() => setActiveTab('launch')}
                    handleGenerateAIBrochure={handleGenerateAIBrochure}
                  />
                </TabsContent>

                <TabsContent value="launch" className="mt-0 space-y-6">
                  <LaunchTab
                    brochureId={id}
                    sections={sections}
                    uploadedImages={uploadedImages}
                    selectedTheme={selectedTheme}
                    designThemes={designThemes}
                    onSave={async () => {
                      if (!id) {
                        toast.error('Brochure ID is required');
                        return;
                      }
                      try {
                        setIsLoading(true);
                        await updateProposal({
                          id,
                          data: {},
                        });
                        toast.success('Brochure saved successfully!');
                        queryClient.invalidateQueries({ queryKey: proposalKeys.detail(id) });
                      } catch (error: any) {
                        console.error('Error saving brochure:', error);
                        toast.error(error.response?.data?.detail || 'Failed to save brochure');
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    onViewDetails={() => {
                      if (id) {
                        navigate(`/proposals/${id}`);
                      }
                    }}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
