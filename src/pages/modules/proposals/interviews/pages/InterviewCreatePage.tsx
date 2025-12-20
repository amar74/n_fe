import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  FileText,
  Brain,
  Target,
  Presentation,
  Palette,
  Image,
  Settings,
  RefreshCw,
  Edit3,
  Download,
  Eye,
  Calendar,
  Check,
  AlertCircle,
  Sparkles,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/shared';

interface ProposalData {
  id: string;
  name: string;
  client: string;
  value: string;
  status: string;
  marketSector: string;
  description: string;
  documents: string[];
}

interface DesignTheme {
  id: string;
  name: string;
  description: string;
  colors: string[];
}

interface SlideType {
  id: string;
  title: string;
  description: string;
  aiGenerated: boolean;
  essential: boolean;
}

interface AnalysisData {
  requirements: string[];
  keyTopics: string[];
  interviewPanel: string[];
  suggestedDuration: string;
  confidenceScore: number;
}

export default function InterviewCreatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const setupData = location.state || {};
  const proposalId = setupData.proposalId || '1';

  const [currentStep, setCurrentStep] = useState(1);
  const [interviewLetter, setInterviewLetter] = useState<File | null>(null);
  const [interviewLetterText, setInterviewLetterText] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('professional');
  const [selectedSlides, setSelectedSlides] = useState<string[]>([]);
  const [customImages, setCustomImages] = useState<File[]>([]);
  const [generatedPresentation, setGeneratedPresentation] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [presentationSettings, setPresentationSettings] = useState({
    duration: '30',
    format: 'slides',
    focus: 'technical',
  });

  const proposalData: ProposalData = {
    id: proposalId,
    name: setupData.account?.name || 'Downtown Revitalization',
    client: setupData.account?.name || 'Seattle Development Authority',
    value: '$3.8M',
    status: 'Submitted',
    marketSector: 'Urban Development',
    description: 'Comprehensive downtown area redevelopment and modernization initiative.',
    documents: [
      'Technical Proposal (45 pages)',
      'Cost Proposal (12 pages)',
      'Past Performance (8 projects)',
      'Team Qualifications (15 members)',
      'Project Approach (25 pages)',
      'Risk Management Plan (10 pages)',
    ],
  };

  const designThemes: DesignTheme[] = [
    {
      id: 'professional',
      name: 'Professional',
      description: 'Clean, corporate design with blue and gray tones',
      colors: ['#1e40af', '#64748b', '#f8fafc'],
    },
    {
      id: 'modern',
      name: 'Modern',
      description: 'Contemporary design with vibrant colors and gradients',
      colors: ['#7c3aed', '#06b6d4', '#f0f9ff'],
    },
    {
      id: 'corporate',
      name: 'Corporate',
      description: 'Traditional business presentation style',
      colors: ['#059669', '#374151', '#ffffff'],
    },
    {
      id: 'creative',
      name: 'Creative',
      description: 'Bold and innovative design with dynamic layouts',
      colors: ['#dc2626', '#f59e0b', '#fef3c7'],
    },
  ];

  const slideTypes: SlideType[] = [
    {
      id: 'intro',
      title: 'Introduction & Team',
      description: 'Team introductions and company overview',
      aiGenerated: true,
      essential: true,
    },
    {
      id: 'understanding',
      title: 'Project Understanding',
      description: 'Demonstration of project comprehension',
      aiGenerated: true,
      essential: true,
    },
    {
      id: 'approach',
      title: 'Technical Approach',
      description: 'Detailed methodology and implementation plan',
      aiGenerated: true,
      essential: true,
    },
    {
      id: 'experience',
      title: 'Relevant Experience',
      description: 'Past performance and similar projects',
      aiGenerated: true,
      essential: false,
    },
    {
      id: 'team-details',
      title: 'Team Qualifications',
      description: 'Individual team member expertise',
      aiGenerated: true,
      essential: false,
    },
    {
      id: 'timeline',
      title: 'Project Timeline',
      description: 'Schedule and milestones',
      aiGenerated: true,
      essential: false,
    },
    {
      id: 'innovation',
      title: 'Innovation & Value-Add',
      description: 'Unique solutions and added value',
      aiGenerated: true,
      essential: false,
    },
    {
      id: 'qa',
      title: 'Q&A Preparation',
      description: 'Anticipated questions and responses',
      aiGenerated: true,
      essential: false,
    },
  ];

  useEffect(() => {
    const essentialSlides = slideTypes.filter((slide) => slide.essential).map((slide) => slide.id);
    setSelectedSlides(essentialSlides);
  }, []);

  useEffect(() => {
    if (interviewLetter || interviewLetterText) {
      setTimeout(() => {
        setAnalysisData({
          requirements: [
            'Present project understanding in 15 minutes',
            'Demonstrate technical expertise in urban planning',
            'Show relevant experience in downtown revitalization',
            'Address sustainability and community impact',
            'Prepare for Q&A session (15 minutes)',
          ],
          keyTopics: [
            'Stakeholder Engagement',
            'Mixed-Use Development',
            'Transit-Oriented Design',
            'Historic Preservation',
            'Economic Development',
          ],
          interviewPanel: ['Planning Director', 'Project Manager', 'Community Representative', 'Technical Advisor'],
          suggestedDuration: '30 minutes',
          confidenceScore: 89,
        });

        toast.success('AI Analysis Complete - Interview requirements analyzed and presentation structure recommended.');
      }, 2000);
    }
  }, [interviewLetter, interviewLetterText]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    const file = event.target.files?.[0];
    if (file) {
      if (fileType === 'letter') {
        setInterviewLetter(file);
        toast.success(`${file.name} uploaded and is being analyzed.`);
      } else if (fileType === 'image') {
        setCustomImages([...customImages, file]);
        toast.success(`${file.name} has been added to your presentation assets.`);
      }
    }
  };

  const generatePresentation = async () => {
    setIsGenerating(true);

    setTimeout(() => {
      const mockPresentation = {
        id: `presentation_${Date.now()}`,
        title: `${proposalData.name} - Interview Presentation`,
        slides: selectedSlides.length,
        theme: selectedTheme,
        duration: `${presentationSettings.duration} minutes`,
        generatedAt: new Date().toISOString(),
        outline: [
          'Cover Slide with Team Introduction',
          'Project Understanding & Objectives',
          'Our Technical Approach',
          'Relevant Experience Showcase',
          'Team Qualifications & Expertise',
          'Project Timeline & Milestones',
          'Innovation & Value Proposition',
          'Q&A Preparation Points',
        ],
      };

      setGeneratedPresentation(mockPresentation);
      setIsGenerating(false);
      setCurrentStep(4);

      toast.success('Presentation Generated! Your interview presentation has been created and is ready for review.');
    }, 4000);
  };

  const handleSlideToggle = (slideId: string) => {
    setSelectedSlides((prev) =>
      prev.includes(slideId) ? prev.filter((id) => id !== slideId) : [...prev, slideId]
    );
  };

  const steps = ['Upload Interview Letter', 'Configure Presentation', 'Generate Content', 'Review & Refine'];

  return (
    <div className="w-full h-full bg-white font-outfit">
      <div className="flex flex-col w-full">
        <div className="max-w-7xl mx-auto px-6 py-6 w-full">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/module/proposals/interviews/setup')}
              className="font-outfit"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Interview Setup
            </Button>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold font-outfit text-[#1A1A1A] flex items-center gap-3">
                <Presentation className="h-8 w-8 text-[#161950]" />
                Create Interview Presentation
              </h2>
              <Badge variant="outline" className="bg-[#161950]/10 text-[#161950] border-[#161950]/20 font-outfit">
                <Brain className="h-3 w-3 mr-1" />
                AI Enhanced
              </Badge>
            </div>
            <p className="text-lg font-outfit text-gray-600">
              Develop a tailored presentation for your interview based on proposal documents and interview
              requirements
            </p>
          </div>

          <Card className="mb-8 border border-[#161950]/20 bg-[#161950]/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
                    <Target className="h-5 w-5 text-[#161950]" />
                    Linked Proposal
                  </CardTitle>
                  <CardDescription className="font-outfit">
                    This presentation is linked to your proposal and will leverage all uploaded documents
                  </CardDescription>
                </div>
                <Badge className="bg-[#161950] text-white font-outfit">
                  <Check className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold font-outfit text-[#1A1A1A]">{proposalData.name}</h4>
                  <p className="text-sm font-outfit text-gray-600">{proposalData.client}</p>
                </div>
                <div>
                  <p className="text-sm font-outfit text-gray-600">Value: {proposalData.value}</p>
                  <p className="text-sm font-outfit text-gray-600">Sector: {proposalData.marketSector}</p>
                </div>
                <div>
                  <p className="text-sm font-outfit text-gray-600">Documents: {proposalData.documents.length}</p>
                  <p className="text-sm font-outfit text-gray-600">Status: {proposalData.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold font-outfit ${
                      index + 1 <= currentStep
                        ? 'bg-[#161950] text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {index + 1 <= currentStep ? <Check className="h-4 w-4" /> : index + 1}
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium font-outfit ${
                      index + 1 <= currentStep ? 'text-[#161950]' : 'text-gray-600'
                    }`}
                  >
                    {step}
                  </span>
                  {index < steps.length - 1 && <div className="w-16 h-0.5 bg-gray-300 ml-4"></div>}
                </div>
              ))}
            </div>
          </div>

          {currentStep === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="border border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
                      <Upload className="h-5 w-5 text-[#161950]" />
                      Interview Letter & Requirements
                    </CardTitle>
                    <CardDescription className="font-outfit">
                      Upload the interview letter or provide the interview requirements to analyze presentation needs
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-sm font-medium font-outfit mb-2 block">
                        Upload Interview Letter (PDF, Word, etc.)
                      </Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#161950] transition-colors">
                        <input
                          type="file"
                          id="interview-letter"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={(e) => handleFileUpload(e, 'letter')}
                        />
                        <label htmlFor="interview-letter" className="cursor-pointer">
                          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 font-outfit mb-2">
                            {interviewLetter ? interviewLetter.name : 'Click to upload interview letter'}
                          </p>
                          <p className="text-sm text-gray-500 font-outfit">
                            Supports PDF, Word documents, and text files
                          </p>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex-1 h-px bg-gray-300"></div>
                      <span className="text-sm text-gray-500 font-outfit">OR</span>
                      <div className="flex-1 h-px bg-gray-300"></div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium font-outfit mb-2 block">
                        Paste Interview Requirements
                      </Label>
                      <Textarea
                        placeholder="Paste the interview letter content or requirements here..."
                        value={interviewLetterText}
                        onChange={(e) => setInterviewLetterText(e.target.value)}
                        className="min-h-[200px] font-outfit"
                      />
                    </div>

                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!interviewLetter && !interviewLetterText.trim()}
                      className="w-full bg-[#161950] hover:bg-[#161950]/90 font-outfit"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Analyze Requirements & Continue
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="border border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
                      <FileText className="h-5 w-5 text-[#161950]" />
                      Available Documents
                    </CardTitle>
                    <CardDescription className="font-outfit">
                      Documents from your linked proposal that will be analyzed
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {proposalData.documents.map((doc, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-[#161950]/5 rounded-lg">
                          <FileText className="h-4 w-4 text-[#161950]" />
                          <span className="text-sm font-outfit text-[#1A1A1A]">{doc}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium font-outfit text-green-800">AI Analysis Ready</span>
                      </div>
                      <p className="text-xs font-outfit text-green-700">
                        All documents will be analyzed to create relevant presentation content
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8">
              {analysisData && (
                <Card className="border border-[#161950]/20 bg-gradient-to-r from-[#161950]/5 to-[#161950]/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
                      <Brain className="h-5 w-5 text-[#161950]" />
                      AI Analysis Results
                    </CardTitle>
                    <CardDescription className="font-outfit">
                      Key insights and recommendations from your interview requirements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium font-outfit mb-3 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-[#161950]" />
                          Interview Requirements
                        </h5>
                        <ul className="space-y-2">
                          {analysisData.requirements.map((req, index) => (
                            <li key={index} className="text-sm font-outfit text-gray-700 flex items-start gap-2">
                              <Check className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium font-outfit mb-3 flex items-center gap-2">
                          <Target className="h-4 w-4 text-[#161950]" />
                          Key Topics to Address
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {analysisData.keyTopics.map((topic, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-[#161950]/10 text-[#161950] border-[#161950] font-outfit"
                            >
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border border-gray-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
                        <Presentation className="h-5 w-5 text-[#161950]" />
                        Select Presentation Slides
                      </CardTitle>
                      <CardDescription className="font-outfit">
                        Choose which sections to include in your presentation
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {slideTypes.map((slide) => (
                          <div
                            key={slide.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-all font-outfit ${
                              selectedSlides.includes(slide.id)
                                ? 'border-[#161950] bg-[#161950]/5'
                                : 'border-gray-200 hover:border-[#161950]'
                            }`}
                            onClick={() => handleSlideToggle(slide.id)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h6 className="font-medium text-sm">{slide.title}</h6>
                              <div className="flex items-center space-x-2">
                                {slide.essential && (
                                  <Badge
                                    variant="outline"
                                    className="bg-yellow-100 text-yellow-700 text-xs font-outfit"
                                  >
                                    Essential
                                  </Badge>
                                )}
                                <Checkbox
                                  checked={selectedSlides.includes(slide.id)}
                                  onCheckedChange={() => handleSlideToggle(slide.id)}
                                />
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{slide.description}</p>
                            {slide.aiGenerated && (
                              <div className="flex items-center gap-1">
                                <Sparkles className="h-3 w-3 text-[#161950]" />
                                <span className="text-xs text-[#161950] font-outfit">AI Generated</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
                        <Palette className="h-5 w-5 text-[#161950]" />
                        Design Theme
                      </CardTitle>
                      <CardDescription className="font-outfit">
                        Select a visual theme for your presentation
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {designThemes.map((theme) => (
                          <div
                            key={theme.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-all font-outfit ${
                              selectedTheme === theme.id
                                ? 'border-[#161950] bg-[#161950]/5'
                                : 'border-gray-200 hover:border-[#161950]'
                            }`}
                            onClick={() => setSelectedTheme(theme.id)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h6 className="font-medium">{theme.name}</h6>
                              <div className="flex space-x-1">
                                {theme.colors.map((color, index) => (
                                  <div
                                    key={index}
                                    className="w-4 h-4 rounded-full border"
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">{theme.description}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
                        <Image className="h-5 w-5 text-[#161950]" />
                        Custom Images
                      </CardTitle>
                      <CardDescription className="font-outfit">
                        Upload custom images to include in your presentation
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#161950] transition-colors">
                        <input
                          type="file"
                          id="custom-images"
                          className="hidden"
                          accept=".jpg,.jpeg,.png,.gif"
                          multiple
                          onChange={(e) => handleFileUpload(e, 'image')}
                        />
                        <label htmlFor="custom-images" className="cursor-pointer">
                          <Image className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600 text-sm font-outfit">
                            Upload project images, diagrams, or graphics
                          </p>
                        </label>
                      </div>
                      {customImages.length > 0 && (
                        <div className="mt-4 grid grid-cols-3 gap-2">
                          {customImages.map((image, index) => (
                            <div key={index} className="p-2 bg-gray-50 rounded border text-xs text-center font-outfit">
                              {image.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="border border-gray-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
                        <Settings className="h-5 w-5 text-[#161950]" />
                        Presentation Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium font-outfit mb-2 block">Duration (minutes)</Label>
                        <Select
                          value={presentationSettings.duration}
                          onValueChange={(value) =>
                            setPresentationSettings((prev) => ({ ...prev, duration: value }))
                          }
                        >
                          <SelectTrigger className="font-outfit">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="20">20 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="45">45 minutes</SelectItem>
                            <SelectItem value="60">60 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium font-outfit mb-2 block">Focus Area</Label>
                        <Select
                          value={presentationSettings.focus}
                          onValueChange={(value) =>
                            setPresentationSettings((prev) => ({ ...prev, focus: value }))
                          }
                        >
                          <SelectTrigger className="font-outfit">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technical">Technical Expertise</SelectItem>
                            <SelectItem value="experience">Past Experience</SelectItem>
                            <SelectItem value="team">Team Capabilities</SelectItem>
                            <SelectItem value="approach">Project Approach</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium font-outfit mb-2 block">Output Format</Label>
                        <Select
                          value={presentationSettings.format}
                          onValueChange={(value) =>
                            setPresentationSettings((prev) => ({ ...prev, format: value }))
                          }
                        >
                          <SelectTrigger className="font-outfit">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="slides">PowerPoint Slides</SelectItem>
                            <SelectItem value="pdf">PDF Document</SelectItem>
                            <SelectItem value="both">Both Formats</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {analysisData && (
                    <Card className="border border-[#161950]/20 bg-[#161950]/5">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
                          <TrendingUp className="h-5 w-5 text-[#161950]" />
                          AI Confidence Score
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <div className="text-3xl font-bold font-outfit text-[#161950] mb-2">
                            {analysisData.confidenceScore}%
                          </div>
                          <p className="text-sm font-outfit text-gray-700">
                            High confidence in creating relevant presentation content
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Button
                    onClick={() => setCurrentStep(3)}
                    className="w-full bg-[#161950] hover:bg-[#161950]/90 font-outfit"
                    disabled={selectedSlides.length === 0}
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Generate Presentation
                  </Button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <Card className="border border-gray-200">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 font-outfit text-[#1A1A1A]">
                  <Zap className="h-6 w-6 text-[#161950]" />
                  Generating Your Presentation
                </CardTitle>
                <CardDescription className="font-outfit">
                  AI is analyzing your documents and creating tailored presentation content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="max-w-md mx-auto">
                  <div className="flex items-center justify-center mb-4">
                    <RefreshCw className="h-16 w-16 text-[#161950] animate-spin" />
                  </div>
                  <Progress value={75} className="mb-4" />
                  <div className="text-center space-y-2">
                    <p className="text-sm font-outfit text-gray-600">Analyzing proposal documents...</p>
                    <p className="text-sm font-outfit text-gray-600">Extracting key information...</p>
                    <p className="text-sm font-outfit text-gray-600">Creating slide content...</p>
                    <p className="text-sm font-outfit text-gray-600">Applying design theme...</p>
                  </div>
                </div>

                <div className="text-center">
                  <Button
                    onClick={generatePresentation}
                    disabled={isGenerating}
                    className="bg-[#161950] hover:bg-[#161950]/90 font-outfit"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Start Generation
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 4 && generatedPresentation && (
            <div className="space-y-8">
              <Card className="border border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
                    <Check className="h-6 w-6 text-green-600" />
                    Presentation Generated Successfully!
                  </CardTitle>
                  <CardDescription className="font-outfit">
                    Your interview presentation is ready. Review and make refinements as needed.
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card className="border border-gray-200">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between font-outfit text-[#1A1A1A]">
                        <div className="flex items-center gap-2">
                          <Presentation className="h-5 w-5 text-[#161950]" />
                          {generatedPresentation.title}
                        </div>
                        <Badge className="bg-[#161950] text-white font-outfit">
                          {generatedPresentation.slides} slides
                        </Badge>
                      </CardTitle>
                      <CardDescription className="font-outfit">
                        Generated on {new Date(generatedPresentation.generatedAt).toLocaleString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm font-outfit">
                          <div>
                            <span className="font-medium">Theme:</span> {generatedPresentation.theme}
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span> {generatedPresentation.duration}
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium font-outfit mb-3">Presentation Outline</h5>
                          <div className="space-y-2">
                            {generatedPresentation.outline.map((slide: string, index: number) => (
                              <div
                                key={index}
                                className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg"
                              >
                                <div className="flex items-center justify-center w-6 h-6 bg-[#161950] text-white rounded-full text-xs font-medium font-outfit">
                                  {index + 1}
                                </div>
                                <span className="text-sm font-outfit">{slide}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="border border-gray-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
                        <Edit3 className="h-5 w-5 text-[#161950]" />
                        Refinement Options
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button variant="outline" className="w-full justify-start font-outfit">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Content
                      </Button>
                      <Button variant="outline" className="w-full justify-start font-outfit">
                        <Palette className="h-4 w-4 mr-2" />
                        Change Theme
                      </Button>
                      <Button variant="outline" className="w-full justify-start font-outfit">
                        <Settings className="h-4 w-4 mr-2" />
                        Adjust Settings
                      </Button>
                      <Button variant="outline" className="w-full justify-start font-outfit">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regenerate Slides
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
                        <Download className="h-5 w-5 text-[#161950]" />
                        Export Options
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button className="w-full bg-[#161950] hover:bg-[#161950]/90 font-outfit">
                        <Download className="h-4 w-4 mr-2" />
                        Download PowerPoint
                      </Button>
                      <Button variant="outline" className="w-full font-outfit">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview Presentation
                      </Button>
                      <Button variant="outline" className="w-full font-outfit">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Practice Session
                      </Button>
                    </CardContent>
                  </Card>

                  <Button
                    onClick={() => {
                      const interviewId = Date.now();
                      navigate(`/module/proposals/interviews/${interviewId}/edit`, {
                        state: {
                          interview: {
                            id: interviewId,
                            name: generatedPresentation.title,
                            client: proposalData.client,
                            status: 'Scheduled',
                            date: setupData.date,
                            time: setupData.time,
                            format: setupData.format,
                            location: setupData.location,
                          },
                        },
                      });
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 font-outfit"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Complete & Save
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

