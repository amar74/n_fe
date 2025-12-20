import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Megaphone,
  Save,
  Eye,
  Target,
  Calendar,
  BarChart3,
  FileText,
  Image as ImageIcon,
  Share2,
  Users,
  TrendingUp,
  Mail,
  MessageSquare,
  Globe,
  Smartphone,
  Monitor,
  DollarSign,
  Zap,
  CheckCircle,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Upload,
  Video,
  Link2,
  Clock,
  MapPin,
  Filter,
  Download,
  RefreshCw,
  Activity,
  MousePointer,
  Heart,
  Repeat2,
  ExternalLink,
  Brain,
  Lightbulb,
  PieChart,
  LineChart,
  Sparkles,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/shared';
import { useProposals } from '@/hooks/proposals';
import { ProposalHeader } from '../../proposals/components/ProposalHeader';
import { ProposalProgressSteps } from '../../proposals/components/ProposalProgressSteps';
import { ProposalProgressCard } from '../../proposals/components/ProposalProgressCard';

export default function CampaignEditorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { useProposal, updateProposal, isUpdating } = useProposals();
  const [activeTab, setActiveTab] = useState('content');
  const [campaignProgress, setCampaignProgress] = useState(45);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(() => {
    const mode = location.state?.mode;
    const urlParams = new URLSearchParams(location.search);
    const urlMode = urlParams.get('mode');
    return mode === 'edit' || urlMode === 'edit';
  });
  
  // Fetch campaign data
  const { data: campaign, isLoading: isLoadingCampaign } = useProposal(id, !!id);
  
  // Load campaign data from API
  const [campaignData, setCampaignData] = useState({
    id: id || '',
    name: 'Untitled Campaign',
    client: '',
    status: 'draft',
    budget: 0,
    spent: 0,
    leads: 0,
    conversions: 0,
    startDate: '',
    endDate: '',
    targetAudience: '',
    description: '',
    channels: [] as string[],
  });

  useEffect(() => {
    if (campaign && id) {
      setCampaignData({
        id: campaign.id,
        name: campaign.title || 'Untitled Campaign',
        client: campaign.account_name || '',
        status: campaign.status || 'draft',
        budget: 150000,
        spent: 87500,
        leads: 156,
        conversions: 23,
        startDate: campaign.due_date || '',
        endDate: campaign.submission_date || '',
        targetAudience: 'Municipal Governments',
        description: campaign.summary || '',
        channels: ['Email Marketing', 'LinkedIn Ads', 'Industry Publications', 'Trade Shows'],
      });
      setCampaignProgress(campaign.progress || 45);
    } else if (location.state?.campaign) {
      setCampaignData(location.state.campaign);
    }
  }, [campaign, id, location.state]);

  const [campaignContent, setCampaignContent] = useState({
    headline: 'Transform Your Infrastructure with Expert Solutions',
    description: 'Comprehensive infrastructure development services tailored for municipal governments.',
    callToAction: 'Schedule a Consultation',
    keyMessages: [
      'Proven track record in municipal infrastructure',
      'Expert team with 20+ years experience',
      'Sustainable and cost-effective solutions',
    ],
  });

  const [targeting, setTargeting] = useState({
    audience: 'Municipal Governments',
    demographics: ['Government Officials', 'City Planners', 'Infrastructure Managers'],
    locations: ['United States', 'Canada'],
    interests: ['Infrastructure Development', 'Urban Planning', 'Public Works'],
  });

  const [schedule, setSchedule] = useState({
    startDate: '2024-10-01',
    endDate: '2024-12-31',
    milestones: [
      { id: 1, name: 'Campaign Launch', date: '2024-10-01', status: 'completed' },
      { id: 2, name: 'First Email Blast', date: '2024-10-15', status: 'completed' },
      { id: 3, name: 'LinkedIn Campaign Start', date: '2024-11-01', status: 'in-progress' },
      { id: 4, name: 'Trade Show Presentation', date: '2024-11-20', status: 'pending' },
    ],
  });

  const [analytics, setAnalytics] = useState({
    impressions: 45000,
    clicks: 2300,
    ctr: 5.1,
    conversionRate: 14.7,
    costPerLead: 560,
    roi: 240,
    reach: 32400,
    engagement: 1250,
    engagementRate: 2.8,
    costPerClick: 38.04,
    leads: 156,
    conversions: 23,
  });

  const [contentVariations, setContentVariations] = useState([
    { id: 1, platform: 'LinkedIn', headline: 'Transform Your Infrastructure', status: 'published', performance: 'high' },
    { id: 2, platform: 'Email', headline: 'Expert Solutions for Municipal Governments', status: 'scheduled', performance: 'medium' },
    { id: 3, platform: 'Twitter', headline: 'Infrastructure Development Experts', status: 'draft', performance: 'low' },
  ]);

  const [targetingDetails, setTargetingDetails] = useState({
    ageGroups: ['35-44', '45-54', '55+'],
    interests: ['Infrastructure Development', 'Urban Planning', 'Public Works', 'Government Services'],
    behaviors: ['Frequent LinkedIn Users', 'Email Newsletter Subscribers', 'Industry Event Attendees'],
    budgetAllocation: {
      linkedin: 40,
      email: 35,
      twitter: 15,
      facebook: 10,
    },
  });

  const [scheduleDetails, setScheduleDetails] = useState({
    timezone: 'America/New_York',
    optimalPostingTimes: ['9:00 AM', '1:00 PM', '5:00 PM'],
    frequency: 'Daily',
    autoSchedule: true,
  });

  const handleSave = async () => {
    if (!id) {
      toast.error('Campaign ID is required');
      return;
    }

    try {
      setIsLoading(true);
      await updateProposal({
        id,
        data: {
          title: campaignData.name,
        },
      });
      toast.success('Campaign saved successfully');
      setIsEditMode(false);
    } catch (error: any) {
      console.error('Error saving campaign:', error);
      toast.error(error.response?.data?.detail || 'Failed to save campaign');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  if ((isLoading || isLoadingCampaign) && id) {
    return (
      <div className="w-full h-full bg-white font-outfit flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#161950] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white font-outfit">
      <div className="flex flex-col w-full">
        <ProposalHeader
          proposalName={campaignData.name}
          clientName={campaignData.client}
          stage={campaignData.status}
          onSave={isEditMode ? handleSave : undefined}
          onEdit={!isEditMode ? handleEdit : undefined}
          onBack={() => navigate('/module/proposals/campaigns')}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <ProposalProgressSteps currentStep={2} />

            <ProposalProgressCard progress={campaignProgress} />

            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1 gap-1.5 bg-gray-100 rounded-lg mb-6">
            <TabsTrigger
              value="content"
              className="flex items-center justify-center gap-2 min-h-[50px] whitespace-normal data-[state=active]:bg-[#161950] data-[state=active]:text-white data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-600 font-outfit"
            >
              <FileText className="h-5 w-5" />
              <span>Content</span>
            </TabsTrigger>
            <TabsTrigger
              value="targeting"
              className="flex items-center justify-center gap-2 min-h-[50px] whitespace-normal data-[state=active]:bg-[#161950] data-[state=active]:text-white data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-600 font-outfit"
            >
              <Target className="h-5 w-5" />
              <span>Targeting</span>
            </TabsTrigger>
            <TabsTrigger
              value="schedule"
              className="flex items-center justify-center gap-2 min-h-[50px] whitespace-normal data-[state=active]:bg-[#161950] data-[state=active]:text-white data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-600 font-outfit"
            >
              <Calendar className="h-5 w-5" />
              <span>Schedule</span>
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="flex items-center justify-center gap-2 min-h-[50px] whitespace-normal data-[state=active]:bg-[#161950] data-[state=active]:text-white data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-600 font-outfit"
            >
              <BarChart3 className="h-5 w-5" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

                <TabsContent value="content" className="mt-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                      <Card className="border border-gray-200">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
                            <FileText className="h-5 w-5 text-[#161950]" />
                            Campaign Content
                          </CardTitle>
                          <CardDescription className="font-outfit mt-1">
                            Create and manage campaign messaging and content
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-6">
                          <div>
                            <Label className="text-sm font-semibold font-outfit text-[#1A1A1A] mb-2 block">
                              Headline
                            </Label>
                            {isEditMode ? (
                              <Input
                                value={campaignContent.headline}
                                onChange={(e) => setCampaignContent({ ...campaignContent, headline: e.target.value })}
                                className="font-outfit"
                                placeholder="Enter campaign headline"
                              />
                            ) : (
                              <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200 text-[#1A1A1A] font-outfit">
                                {campaignContent.headline || '—'}
                              </div>
                            )}
                          </div>
                          <div>
                            <Label className="text-sm font-semibold font-outfit text-[#1A1A1A] mb-2 block">
                              Description
                            </Label>
                            {isEditMode ? (
                              <Textarea
                                value={campaignContent.description}
                                onChange={(e) => setCampaignContent({ ...campaignContent, description: e.target.value })}
                                rows={4}
                                className="font-outfit"
                                placeholder="Enter campaign description"
                              />
                            ) : (
                              <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200 text-[#1A1A1A] font-outfit whitespace-pre-wrap min-h-[100px]">
                                {campaignContent.description || '—'}
                              </div>
                            )}
                          </div>
                          <div>
                            <Label className="text-sm font-semibold font-outfit text-[#1A1A1A] mb-2 block">
                              Call to Action
                            </Label>
                            {isEditMode ? (
                              <Input
                                value={campaignContent.callToAction}
                                onChange={(e) => setCampaignContent({ ...campaignContent, callToAction: e.target.value })}
                                className="font-outfit"
                                placeholder="Enter call to action"
                              />
                            ) : (
                              <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200 text-[#1A1A1A] font-outfit">
                                {campaignContent.callToAction || '—'}
                              </div>
                            )}
                          </div>
                          <div>
                            <Label className="text-sm font-semibold font-outfit text-[#1A1A1A] mb-2 block">
                              Key Messages
                            </Label>
                            {isEditMode ? (
                              <div className="space-y-2">
                                {campaignContent.keyMessages.map((message, index) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <Input
                                      value={message}
                                      onChange={(e) => {
                                        const newMessages = [...campaignContent.keyMessages];
                                        newMessages[index] = e.target.value;
                                        setCampaignContent({ ...campaignContent, keyMessages: newMessages });
                                      }}
                                      className="font-outfit"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const newMessages = campaignContent.keyMessages.filter((_, i) => i !== index);
                                        setCampaignContent({ ...campaignContent, keyMessages: newMessages });
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setCampaignContent({
                                      ...campaignContent,
                                      keyMessages: [...campaignContent.keyMessages, ''],
                                    });
                                  }}
                                  className="w-full font-outfit"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Message
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {campaignContent.keyMessages.length > 0 ? (
                                  campaignContent.keyMessages.map((message, index) => (
                                    <div key={index} className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200 text-[#1A1A1A] font-outfit">
                                      {message}
                                    </div>
                                  ))
                                ) : (
                                  <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200 text-gray-400 font-outfit italic">
                                    No key messages added
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border border-gray-200">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
                            <ImageIcon className="h-5 w-5 text-[#161950]" />
                            Media Assets
                          </CardTitle>
                          <CardDescription className="font-outfit mt-1">
                            Upload images, videos, and other media for your campaign
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-4">
                          {isEditMode ? (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-colors hover:border-[#161950] cursor-pointer">
                              <input type="file" id="media-upload" className="hidden" accept="image/*,video/*" multiple />
                              <label htmlFor="media-upload" className="cursor-pointer">
                                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm font-outfit text-gray-600 mb-1">Click to upload media</p>
                                <p className="text-xs font-outfit text-gray-500">Supports images and videos</p>
                              </label>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center bg-gray-50">
                              <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                              <p className="text-sm font-outfit text-gray-400 mb-1">Media upload disabled in view mode</p>
                            </div>
                          )}
                          <div className="grid grid-cols-3 gap-3">
                            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                              <ImageIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                              <Video className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                              <ImageIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border border-gray-200">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
                            <Share2 className="h-5 w-5 text-[#161950]" />
                            Platform-Specific Content
                          </CardTitle>
                          <CardDescription className="font-outfit mt-1">
                            Content variations optimized for each platform
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-4">
                            {contentVariations.map((variation) => (
                              <div
                                key={variation.id}
                                className="p-4 border border-gray-200 rounded-lg hover:border-[#161950] transition-all"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <Badge
                                      variant="outline"
                                      className="bg-[#161950]/10 text-[#161950] border-[#161950] font-outfit"
                                    >
                                      {variation.platform}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className={`font-outfit ${
                                        variation.status === 'published'
                                          ? 'bg-green-50 text-green-700 border-green-200'
                                          : variation.status === 'scheduled'
                                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                                          : 'bg-gray-50 text-gray-700 border-gray-200'
                                      }`}
                                    >
                                      {variation.status}
                                    </Badge>
                                  </div>
                                  {isEditMode && (
                                    <div className="flex items-center gap-2">
                                      <Button variant="ghost" size="sm">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="sm">
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                                <p className="text-sm font-outfit text-[#1A1A1A] mb-2">{variation.headline}</p>
                                <div className="flex items-center gap-2 text-xs font-outfit text-gray-600">
                                  <TrendingUp className="h-3 w-3" />
                                  <span>Performance: {variation.performance}</span>
                                </div>
                              </div>
                            ))}
                            {isEditMode && (
                              <Button variant="outline" className="w-full font-outfit">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Platform Content
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-6">
                      <Card className="border border-[#161950]/20 bg-[#161950]/5">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
                            <Brain className="h-5 w-5 text-[#161950]" />
                            AI Content Assistant
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-4">
                          <Button variant="outline" className="w-full justify-start font-outfit" disabled={!isEditMode}>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate Headlines
                          </Button>
                          <Button variant="outline" className="w-full justify-start font-outfit" disabled={!isEditMode}>
                            <Lightbulb className="h-4 w-4 mr-2" />
                            Suggest Messages
                          </Button>
                          <Button variant="outline" className="w-full justify-start font-outfit" disabled={!isEditMode}>
                            <Zap className="h-4 w-4 mr-2" />
                            Optimize Content
                          </Button>
                          <Button variant="outline" className="w-full justify-start font-outfit" disabled={!isEditMode}>
                            <Target className="h-4 w-4 mr-2" />
                            Platform Recommendations
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="border border-gray-200">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
                            <Eye className="h-5 w-5 text-[#161950]" />
                            Preview
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <Button variant="outline" className="w-full justify-start font-outfit">
                              <Smartphone className="h-4 w-4 mr-2" />
                              Mobile Preview
                            </Button>
                            <Button variant="outline" className="w-full justify-start font-outfit">
                              <Monitor className="h-4 w-4 mr-2" />
                              Desktop Preview
                            </Button>
                            <Button variant="outline" className="w-full justify-start font-outfit">
                              <Mail className="h-4 w-4 mr-2" />
                              Email Preview
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="targeting" className="mt-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                      <Card className="border border-gray-200">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
                            <Target className="h-5 w-5 text-[#161950]" />
                            Audience Targeting
                          </CardTitle>
                          <CardDescription className="font-outfit mt-1">
                            Define your target audience and demographics
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-6">
                          <div>
                            <Label className="text-sm font-semibold font-outfit text-[#1A1A1A] mb-2 block">
                              Primary Audience
                            </Label>
                            {isEditMode ? (
                              <Input
                                value={targeting.audience}
                                onChange={(e) => setTargeting({ ...targeting, audience: e.target.value })}
                                className="font-outfit"
                              />
                            ) : (
                              <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200 text-[#1A1A1A] font-outfit">
                                {targeting.audience || '—'}
                              </div>
                            )}
                          </div>
                          <div>
                            <Label className="text-sm font-semibold font-outfit text-[#1A1A1A] mb-2 block">
                              Demographics
                            </Label>
                            {isEditMode ? (
                              <div className="space-y-2">
                                {targeting.demographics.map((demo, index) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <Input
                                      value={demo}
                                      onChange={(e) => {
                                        const newDemos = [...targeting.demographics];
                                        newDemos[index] = e.target.value;
                                        setTargeting({ ...targeting, demographics: newDemos });
                                      }}
                                      className="font-outfit"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const newDemos = targeting.demographics.filter((_, i) => i !== index);
                                        setTargeting({ ...targeting, demographics: newDemos });
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setTargeting({
                                      ...targeting,
                                      demographics: [...targeting.demographics, ''],
                                    });
                                  }}
                                  className="w-full font-outfit"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Demographic
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {targeting.demographics.length > 0 ? (
                                  targeting.demographics.map((demo, index) => (
                                    <div key={index} className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200 text-[#1A1A1A] font-outfit">
                                      {demo}
                                    </div>
                                  ))
                                ) : (
                                  <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200 text-gray-400 font-outfit italic">
                                    No demographics added
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <div>
                            <Label className="text-sm font-semibold font-outfit text-[#1A1A1A] mb-2 block">
                              Locations
                            </Label>
                            {isEditMode ? (
                              <Select>
                                <SelectTrigger className="font-outfit">
                                  <SelectValue placeholder="Select locations" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="us">United States</SelectItem>
                                  <SelectItem value="ca">Canada</SelectItem>
                                  <SelectItem value="global">Global</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200 text-[#1A1A1A] font-outfit">
                                {targeting.locations.join(', ') || '—'}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border border-gray-200">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
                            <Users className="h-5 w-5 text-[#161950]" />
                            Age Groups
                          </CardTitle>
                          <CardDescription className="font-outfit mt-1">
                            Target specific age demographics
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex flex-wrap gap-2">
                            {['18-24', '25-34', '35-44', '45-54', '55-64', '65+'].map((age) => (
                              <Badge
                                key={age}
                                variant="outline"
                                className={`font-outfit ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                                } ${
                                  targetingDetails.ageGroups.includes(age)
                                    ? 'bg-[#161950] text-white border-[#161950]'
                                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#161950]'
                                }`}
                                onClick={() => {
                                  if (!isEditMode) return;
                                  const newAges = targetingDetails.ageGroups.includes(age)
                                    ? targetingDetails.ageGroups.filter((a) => a !== age)
                                    : [...targetingDetails.ageGroups, age];
                                  setTargetingDetails({ ...targetingDetails, ageGroups: newAges });
                                }}
                              >
                                {age}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border border-gray-200">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
                            <Filter className="h-5 w-5 text-[#161950]" />
                            Interests & Behaviors
                          </CardTitle>
                          <CardDescription className="font-outfit mt-1">
                            Target based on interests and online behaviors
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-4">
                          <div>
                            <Label className="text-sm font-semibold font-outfit text-[#1A1A1A] mb-2 block">
                              Interests
                            </Label>
                            {isEditMode ? (
                              <div className="flex flex-wrap gap-2">
                                {targetingDetails.interests.map((interest, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="bg-[#161950]/10 text-[#161950] border-[#161950] font-outfit"
                                  >
                                    {interest}
                                    <button
                                      onClick={() => {
                                        const newInterests = targetingDetails.interests.filter((_, i) => i !== index);
                                        setTargetingDetails({ ...targetingDetails, interests: newInterests });
                                      }}
                                      className="ml-2 hover:text-red-600"
                                    >
                                      ×
                                    </button>
                                  </Badge>
                                ))}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newInterest = prompt('Enter interest:');
                                    if (newInterest) {
                                      setTargetingDetails({
                                        ...targetingDetails,
                                        interests: [...targetingDetails.interests, newInterest],
                                      });
                                    }
                                  }}
                                  className="font-outfit"
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Add
                                </Button>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {targetingDetails.interests.length > 0 ? (
                                  targetingDetails.interests.map((interest, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="bg-[#161950]/10 text-[#161950] border-[#161950] font-outfit"
                                    >
                                      {interest}
                                    </Badge>
                                  ))
                                ) : (
                                  <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200 text-gray-400 font-outfit italic">
                                    No interests added
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <div>
                            <Label className="text-sm font-semibold font-outfit text-[#1A1A1A] mb-2 block">
                              Behaviors
                            </Label>
                            {isEditMode ? (
                              <div className="flex flex-wrap gap-2">
                                {targetingDetails.behaviors.map((behavior, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="bg-[#161950]/10 text-[#161950] border-[#161950] font-outfit"
                                  >
                                    {behavior}
                                    <button
                                      onClick={() => {
                                        const newBehaviors = targetingDetails.behaviors.filter((_, i) => i !== index);
                                        setTargetingDetails({ ...targetingDetails, behaviors: newBehaviors });
                                      }}
                                      className="ml-2 hover:text-red-600"
                                    >
                                      ×
                                    </button>
                                  </Badge>
                                ))}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newBehavior = prompt('Enter behavior:');
                                    if (newBehavior) {
                                      setTargetingDetails({
                                        ...targetingDetails,
                                        behaviors: [...targetingDetails.behaviors, newBehavior],
                                      });
                                    }
                                  }}
                                  className="font-outfit"
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Add
                                </Button>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {targetingDetails.behaviors.length > 0 ? (
                                  targetingDetails.behaviors.map((behavior, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="bg-[#161950]/10 text-[#161950] border-[#161950] font-outfit"
                                    >
                                      {behavior}
                                    </Badge>
                                  ))
                                ) : (
                                  <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200 text-gray-400 font-outfit italic">
                                    No behaviors added
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-6">
                      <Card className="border border-[#161950]/20 bg-[#161950]/5">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
                            <DollarSign className="h-5 w-5 text-[#161950]" />
                            Budget Allocation
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-4">
                          {Object.entries(targetingDetails.budgetAllocation).map(([platform, percentage]) => (
                            <div key={platform}>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-outfit text-[#1A1A1A] capitalize">{platform}</span>
                                <span className="text-sm font-semibold font-outfit text-[#161950]">{percentage}%</span>
                              </div>
                              <Progress value={percentage} className="h-2" />
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      <Card className="border border-gray-200">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
                            <Brain className="h-5 w-5 text-[#161950]" />
                            AI Recommendations
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-3">
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm font-outfit text-blue-900">
                              <Lightbulb className="h-4 w-4 inline mr-1" />
                              Expand to 25-34 age group for better reach
                            </p>
                          </div>
                          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm font-outfit text-green-900">
                              <CheckCircle className="h-4 w-4 inline mr-1" />
                              Current targeting shows high engagement potential
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="schedule" className="mt-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                      <Card className="border border-gray-200">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
                            <Calendar className="h-5 w-5 text-[#161950]" />
                            Campaign Schedule
                          </CardTitle>
                          <CardDescription className="font-outfit mt-1">
                            Manage campaign timeline and milestones
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-semibold font-outfit text-[#1A1A1A] mb-2 block">
                                Start Date
                              </Label>
                              {isEditMode ? (
                                <Input
                                  type="date"
                                  value={schedule.startDate}
                                  onChange={(e) => setSchedule({ ...schedule, startDate: e.target.value })}
                                  className="font-outfit"
                                />
                              ) : (
                                <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200 text-[#1A1A1A] font-outfit">
                                  {schedule.startDate ? new Date(schedule.startDate).toLocaleDateString() : '—'}
                                </div>
                              )}
                            </div>
                            <div>
                              <Label className="text-sm font-semibold font-outfit text-[#1A1A1A] mb-2 block">
                                End Date
                              </Label>
                              {isEditMode ? (
                                <Input
                                  type="date"
                                  value={schedule.endDate}
                                  onChange={(e) => setSchedule({ ...schedule, endDate: e.target.value })}
                                  className="font-outfit"
                                />
                              ) : (
                                <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200 text-[#1A1A1A] font-outfit">
                                  {schedule.endDate ? new Date(schedule.endDate).toLocaleDateString() : '—'}
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-semibold font-outfit text-[#1A1A1A] mb-4 block">
                              Milestones
                            </Label>
                            <div className="space-y-3">
                              {schedule.milestones.map((milestone) => (
                                <div
                                  key={milestone.id}
                                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-[#161950] transition-all"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="bg-[#161950]/10 p-2 rounded-lg">
                                      <Calendar className="h-4 w-4 text-[#161950]" />
                                    </div>
                                    <div>
                                      <h4 className="font-semibold font-outfit text-[#1A1A1A]">
                                        {milestone.name}
                                      </h4>
                                      <p className="text-sm text-gray-600 font-outfit">{milestone.date}</p>
                                    </div>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className={`font-outfit ${
                                      milestone.status === 'completed'
                                        ? 'bg-green-50 text-green-700 border-green-200'
                                        : milestone.status === 'in-progress'
                                        ? 'bg-[#161950]/5 text-[#161950] border-[#161950]/20'
                                        : 'bg-gray-50 text-gray-600 border-gray-200'
                                    }`}
                                  >
                                    {milestone.status}
                                  </Badge>
                                </div>
                              ))}
                              {isEditMode && (
                                <Button variant="outline" className="w-full font-outfit">
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Milestone
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border border-gray-200">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
                            <Clock className="h-5 w-5 text-[#161950]" />
                            Publishing Schedule
                          </CardTitle>
                          <CardDescription className="font-outfit mt-1">
                            Schedule content posts and publishing times
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-4">
                          <div className="space-y-3">
                            {[
                              { platform: 'LinkedIn', date: '2024-11-20', time: '9:00 AM', status: 'scheduled' },
                              { platform: 'Email', date: '2024-11-21', time: '10:00 AM', status: 'scheduled' },
                              { platform: 'Twitter', date: '2024-11-22', time: '2:00 PM', status: 'draft' },
                            ].map((post, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="bg-[#161950]/10 p-2 rounded-lg">
                                    <Share2 className="h-4 w-4 text-[#161950]" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold font-outfit text-[#1A1A1A]">
                                      {post.platform}
                                    </p>
                                    <p className="text-xs font-outfit text-gray-600">
                                      {post.date} at {post.time}
                                    </p>
                                  </div>
                                </div>
                                <Badge
                                  variant="outline"
                                  className={`font-outfit ${
                                    post.status === 'scheduled'
                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                      : 'bg-gray-50 text-gray-700 border-gray-200'
                                  }`}
                                >
                                  {post.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                          {isEditMode && (
                            <Button variant="outline" className="w-full font-outfit">
                              <Plus className="h-4 w-4 mr-2" />
                              Schedule Post
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-6">
                      <Card className="border border-gray-200">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
                            <Settings className="h-5 w-5 text-[#161950]" />
                            Schedule Settings
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-4">
                          <div>
                            <Label className="text-sm font-semibold font-outfit text-[#1A1A1A] mb-2 block">
                              Timezone
                            </Label>
                            {isEditMode ? (
                              <Select value={scheduleDetails.timezone}>
                                <SelectTrigger className="font-outfit">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                                  <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                                  <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                                  <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200 text-[#1A1A1A] font-outfit">
                                {scheduleDetails.timezone === 'America/New_York' ? 'Eastern Time (ET)' :
                                 scheduleDetails.timezone === 'America/Chicago' ? 'Central Time (CT)' :
                                 scheduleDetails.timezone === 'America/Denver' ? 'Mountain Time (MT)' :
                                 scheduleDetails.timezone === 'America/Los_Angeles' ? 'Pacific Time (PT)' :
                                 scheduleDetails.timezone || '—'}
                              </div>
                            )}
                          </div>
                          <div>
                            <Label className="text-sm font-semibold font-outfit text-[#1A1A1A] mb-2 block">
                              Posting Frequency
                            </Label>
                            {isEditMode ? (
                              <Select value={scheduleDetails.frequency}>
                                <SelectTrigger className="font-outfit">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Daily">Daily</SelectItem>
                                  <SelectItem value="Weekly">Weekly</SelectItem>
                                  <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
                                  <SelectItem value="Monthly">Monthly</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200 text-[#1A1A1A] font-outfit">
                                {scheduleDetails.frequency || '—'}
                              </div>
                            )}
                          </div>
                          <div>
                            <Label className="text-sm font-semibold font-outfit text-[#1A1A1A] mb-2 block">
                              Optimal Posting Times
                            </Label>
                            <div className="space-y-2">
                              {scheduleDetails.optimalPostingTimes.map((time, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="bg-[#161950]/10 text-[#161950] border-[#161950] font-outfit"
                                >
                                  {time}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-2">
                            <Label className="text-sm font-semibold font-outfit text-[#1A1A1A]">
                              Auto-schedule
                            </Label>
                            {isEditMode ? (
                              <input
                                type="checkbox"
                                checked={scheduleDetails.autoSchedule}
                                onChange={(e) =>
                                  setScheduleDetails({ ...scheduleDetails, autoSchedule: e.target.checked })
                                }
                                className="h-4 w-4 text-[#161950] rounded"
                              />
                            ) : (
                              <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200 text-[#1A1A1A] font-outfit">
                                {scheduleDetails.autoSchedule ? 'Yes' : 'No'}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border border-[#161950]/20 bg-[#161950]/5">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
                            <Activity className="h-5 w-5 text-[#161950]" />
                            Upcoming Posts
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <div className="p-3 bg-white rounded-lg border border-gray-200">
                              <p className="text-sm font-semibold font-outfit text-[#1A1A1A]">LinkedIn Post</p>
                              <p className="text-xs font-outfit text-gray-600">Tomorrow at 9:00 AM</p>
                            </div>
                            <div className="p-3 bg-white rounded-lg border border-gray-200">
                              <p className="text-sm font-semibold font-outfit text-[#1A1A1A]">Email Campaign</p>
                              <p className="text-xs font-outfit text-gray-600">Nov 21 at 10:00 AM</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="analytics" className="mt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <Eye className="h-5 w-5 text-[#161950]" />
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="text-2xl font-bold font-outfit text-[#161950] mb-1">
                          {analytics.impressions.toLocaleString()}
                        </div>
                        <p className="text-sm text-gray-600 font-outfit">Impressions</p>
                      </CardContent>
                    </Card>
                    <Card className="border border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <MousePointer className="h-5 w-5 text-[#161950]" />
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="text-2xl font-bold font-outfit text-[#161950] mb-1">
                          {analytics.clicks.toLocaleString()}
                        </div>
                        <p className="text-sm text-gray-600 font-outfit">Clicks</p>
                      </CardContent>
                    </Card>
                    <Card className="border border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <BarChart3 className="h-5 w-5 text-[#161950]" />
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="text-2xl font-bold font-outfit text-[#161950] mb-1">
                          {analytics.ctr}%
                        </div>
                        <p className="text-sm text-gray-600 font-outfit">CTR</p>
                      </CardContent>
                    </Card>
                    <Card className="border border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <Target className="h-5 w-5 text-[#161950]" />
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="text-2xl font-bold font-outfit text-[#161950] mb-1">
                          {analytics.conversionRate}%
                        </div>
                        <p className="text-sm text-gray-600 font-outfit">Conversion Rate</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="border border-gray-200">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
                          <BarChart3 className="h-5 w-5 text-[#161950]" />
                          Performance Metrics
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-outfit text-gray-600">Reach</span>
                          <span className="font-bold font-outfit text-[#1A1A1A]">
                            {analytics.reach?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-outfit text-gray-600">Engagement</span>
                          <span className="font-bold font-outfit text-[#1A1A1A]">
                            {analytics.engagement?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-outfit text-gray-600">Engagement Rate</span>
                          <span className="font-bold font-outfit text-[#161950]">{analytics.engagementRate}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-outfit text-gray-600">Cost Per Click</span>
                          <span className="font-bold font-outfit text-[#1A1A1A]">${analytics.costPerClick}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-outfit text-gray-600">Cost Per Lead</span>
                          <span className="font-bold font-outfit text-[#1A1A1A]">${analytics.costPerLead}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-outfit text-gray-600">ROI</span>
                          <span className="font-bold font-outfit text-[#161950]">{analytics.roi}%</span>
                        </div>
                        <div className="pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold font-outfit text-[#1A1A1A]">
                              Budget Utilization
                            </span>
                            <span className="text-sm font-outfit text-gray-600">
                              ${campaignData.spent?.toLocaleString()} / ${campaignData.budget?.toLocaleString()}
                            </span>
                          </div>
                          <Progress
                            value={((campaignData.spent || 0) / (campaignData.budget || 1)) * 100}
                            className="h-2"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-gray-200">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
                          <PieChart className="h-5 w-5 text-[#161950]" />
                          Channel Performance
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-4">
                        {[
                          { channel: 'LinkedIn', impressions: 25000, clicks: 1500, ctr: 6.0 },
                          { channel: 'Email', impressions: 12000, clicks: 480, ctr: 4.0 },
                          { channel: 'Twitter', impressions: 5000, clicks: 200, ctr: 4.0 },
                          { channel: 'Facebook', impressions: 3000, clicks: 120, ctr: 4.0 },
                        ].map((channel, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-semibold font-outfit text-[#1A1A1A]">
                                {channel.channel}
                              </span>
                              <span className="text-xs font-outfit text-gray-600">{channel.ctr}% CTR</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs font-outfit">
                              <div>
                                <span className="text-gray-600">Impressions: </span>
                                <span className="font-semibold text-[#1A1A1A]">
                                  {channel.impressions.toLocaleString()}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Clicks: </span>
                                <span className="font-semibold text-[#1A1A1A]">{channel.clicks.toLocaleString()}</span>
                              </div>
                            </div>
                            <Progress value={channel.ctr * 10} className="h-1" />
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="border border-gray-200">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
                          <Users className="h-5 w-5 text-[#161950]" />
                          Audience Insights
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-outfit text-gray-600">Total Leads</span>
                            <span className="font-bold font-outfit text-[#1A1A1A]">{analytics.leads}</span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-outfit text-gray-600">Conversions</span>
                            <span className="font-bold font-outfit text-[#161950]">{analytics.conversions}</span>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-gray-200">
                          <p className="text-sm font-semibold font-outfit text-[#1A1A1A] mb-3">
                            Top Performing Demographics
                          </p>
                          <div className="space-y-2">
                            {[
                              { demo: 'Government Officials', percentage: 45 },
                              { demo: 'City Planners', percentage: 30 },
                              { demo: 'Infrastructure Managers', percentage: 25 },
                            ].map((item, index) => (
                              <div key={index}>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs font-outfit text-gray-600">{item.demo}</span>
                                  <span className="text-xs font-semibold font-outfit text-[#161950]">
                                    {item.percentage}%
                                  </span>
                                </div>
                                <Progress value={item.percentage} className="h-1" />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="pt-4 border-t border-gray-200">
                          <Button variant="outline" className="w-full font-outfit">
                            <Download className="h-4 w-4 mr-2" />
                            Export Report
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
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

