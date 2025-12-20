import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Megaphone,
  FileText,
  Brain,
  Target,
  Sparkles,
  RefreshCw,
  Edit3,
  Download,
  Eye,
  Calendar,
  Check,
  AlertCircle,
  Zap,
  TrendingUp,
  Image,
  Palette,
  Settings,
  Users,
  Globe,
  Mail,
  MessageSquare,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/shared';

interface Account {
  id: number;
  name: string;
  type: string;
  location: string;
}

interface CampaignContent {
  headline: string;
  description: string;
  callToAction: string;
  keyMessages: string[];
}

interface GeneratedCampaign {
  id: string;
  title: string;
  content: CampaignContent;
  platforms: string[];
  generatedAt: string;
  confidenceScore: number;
}

export default function CampaignCreatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const setupData = location.state || {};

  const [currentStep, setCurrentStep] = useState(1);
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignObjective, setCampaignObjective] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [campaignContent, setCampaignContent] = useState<CampaignContent>({
    headline: '',
    description: '',
    callToAction: '',
    keyMessages: [],
  });
  const [generatedCampaign, setGeneratedCampaign] = useState<GeneratedCampaign | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);

  const account: Account = setupData.account || {
    id: 1,
    name: 'City of Springfield',
    type: 'Government',
    location: 'Springfield, IL',
  };

  const campaignType = setupData.campaignType || 'social-media';

  const platforms = [
    { id: 'linkedin', name: 'LinkedIn', icon: Users },
    { id: 'email', name: 'Email Marketing', icon: Mail },
    { id: 'twitter', name: 'Twitter/X', icon: MessageSquare },
    { id: 'facebook', name: 'Facebook', icon: Globe },
  ];

  useEffect(() => {
    if (campaignTitle && campaignObjective) {
      setTimeout(() => {
        setAnalysisData({
          suggestedHeadlines: [
            `Transform Your Infrastructure with ${account.name}`,
            `Expert Solutions for ${account.type} Sector`,
            `Partner with Industry Leaders in Infrastructure`,
          ],
          suggestedMessages: [
            'Proven track record in infrastructure development',
            'Expert team with 20+ years of experience',
            'Sustainable and cost-effective solutions',
          ],
          confidenceScore: 87,
        });
      }, 1500);
    }
  }, [campaignTitle, campaignObjective]);

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId) ? prev.filter((id) => id !== platformId) : [...prev, platformId]
    );
  };

  const generateCampaign = async () => {
    setIsGenerating(true);

    setTimeout(() => {
      const mockCampaign: GeneratedCampaign = {
        id: `campaign_${Date.now()}`,
        title: campaignTitle || 'New Campaign',
        content: {
          headline: analysisData?.suggestedHeadlines[0] || 'Transform Your Infrastructure',
          description:
            campaignDescription ||
            `Comprehensive marketing campaign for ${account.name} focusing on ${campaignObjective}`,
          callToAction: 'Schedule a Consultation',
          keyMessages: analysisData?.suggestedMessages || [
            'Proven expertise in infrastructure',
            'Expert team with extensive experience',
            'Sustainable solutions',
          ],
        },
        platforms: selectedPlatforms,
        generatedAt: new Date().toISOString(),
        confidenceScore: analysisData?.confidenceScore || 85,
      };

      setGeneratedCampaign(mockCampaign);
      setIsGenerating(false);
      setCurrentStep(4);

      toast.success('Campaign Generated! Your marketing campaign has been created and is ready for review.');
    }, 4000);
  };

  const steps = ['Campaign Details', 'Content Configuration', 'Generate Content', 'Review & Launch'];

  return (
    <div className="w-full h-full bg-white font-outfit">
      <div className="flex flex-col w-full">
        <div className="max-w-7xl mx-auto px-6 py-6 w-full">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/module/proposals/campaigns/setup')}
              className="font-outfit"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Campaign Setup
            </Button>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold font-outfit text-[#1A1A1A] flex items-center gap-3">
                <Megaphone className="h-8 w-8 text-[#161950]" />
                Create Marketing Campaign
              </h2>
              <Badge variant="outline" className="bg-[#161950]/10 text-[#161950] border-[#161950]/20 font-outfit">
                <Brain className="h-3 w-3 mr-1" />
                AI Enhanced
              </Badge>
            </div>
            <p className="text-lg font-outfit text-gray-600">
              Create a comprehensive marketing campaign with AI-powered content generation
            </p>
          </div>

          <Card className="mb-8 border border-[#161950]/20 bg-[#161950]/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
                    <Target className="h-5 w-5 text-[#161950]" />
                    Campaign Setup
                  </CardTitle>
                  <CardDescription className="font-outfit">
                    Account and campaign type selected for this campaign
                  </CardDescription>
                </div>
                <Badge className="bg-[#161950] text-white font-outfit">
                  <Check className="h-3 w-3 mr-1" />
                  Configured
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold font-outfit text-[#1A1A1A]">{account.name}</h4>
                  <p className="text-sm font-outfit text-gray-600">{account.type}</p>
                </div>
                <div>
                  <p className="text-sm font-outfit text-gray-600">Location: {account.location}</p>
                  <p className="text-sm font-outfit text-gray-600 capitalize">
                    Type: {campaignType.replace('-', ' ')}
                  </p>
                </div>
                <div>
                  <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950] font-outfit">
                    {campaignType.replace('-', ' ')}
                  </Badge>
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
                      <FileText className="h-5 w-5 text-[#161950]" />
                      Campaign Details
                    </CardTitle>
                    <CardDescription className="font-outfit">
                      Define your campaign objectives and target audience
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-sm font-medium font-outfit mb-2 block">
                        Campaign Title
                      </Label>
                      <Input
                        value={campaignTitle}
                        onChange={(e) => setCampaignTitle(e.target.value)}
                        placeholder="Enter campaign title..."
                        className="font-outfit"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium font-outfit mb-2 block">
                        Campaign Objective
                      </Label>
                      <Input
                        value={campaignObjective}
                        onChange={(e) => setCampaignObjective(e.target.value)}
                        placeholder="What do you want to achieve with this campaign?"
                        className="font-outfit"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium font-outfit mb-2 block">
                        Campaign Description
                      </Label>
                      <Textarea
                        value={campaignDescription}
                        onChange={(e) => setCampaignDescription(e.target.value)}
                        placeholder="Describe your campaign goals and approach..."
                        rows={4}
                        className="font-outfit"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium font-outfit mb-2 block">
                        Target Audience
                      </Label>
                      <Input
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        placeholder="Who is your target audience?"
                        className="font-outfit"
                      />
                    </div>

                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!campaignTitle || !campaignObjective}
                      className="w-full bg-[#161950] hover:bg-[#161950]/90 font-outfit"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Continue to Content Configuration
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div>
                {analysisData && (
                  <Card className="border border-[#161950]/20 bg-[#161950]/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
                        <Brain className="h-5 w-5 text-[#161950]" />
                        AI Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-semibold font-outfit mb-2">Suggested Headlines</p>
                          <div className="space-y-2">
                            {analysisData.suggestedHeadlines?.map((headline: string, index: number) => (
                              <div
                                key={index}
                                className="p-2 bg-white rounded border border-gray-200 text-sm font-outfit cursor-pointer hover:border-[#161950]"
                                onClick={() => setCampaignTitle(headline)}
                              >
                                {headline}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
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
                      AI Content Recommendations
                    </CardTitle>
                    <CardDescription className="font-outfit">
                      AI-generated content suggestions based on your campaign details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium font-outfit mb-3 flex items-center gap-2">
                          <Target className="h-4 w-4 text-[#161950]" />
                          Key Messages
                        </h5>
                        <div className="space-y-2">
                          {analysisData.suggestedMessages?.map((msg: string, index: number) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-[#161950]/10 text-[#161950] border-[#161950] font-outfit mr-2 mb-2"
                            >
                              {msg}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium font-outfit mb-3 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-[#161950]" />
                          Confidence Score
                        </h5>
                        <div className="text-3xl font-bold font-outfit text-[#161950]">
                          {analysisData.confidenceScore}%
                        </div>
                        <p className="text-sm font-outfit text-gray-600">
                          High confidence in generating relevant content
                        </p>
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
                        <FileText className="h-5 w-5 text-[#161950]" />
                        Content Configuration
                      </CardTitle>
                      <CardDescription className="font-outfit">
                        Configure your campaign content and messaging
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <Label className="text-sm font-medium font-outfit mb-2 block">Headline</Label>
                        <Input
                          value={campaignContent.headline}
                          onChange={(e) =>
                            setCampaignContent({ ...campaignContent, headline: e.target.value })
                          }
                          placeholder="Enter campaign headline..."
                          className="font-outfit"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium font-outfit mb-2 block">Description</Label>
                        <Textarea
                          value={campaignContent.description}
                          onChange={(e) =>
                            setCampaignContent({ ...campaignContent, description: e.target.value })
                          }
                          rows={4}
                          placeholder="Enter campaign description..."
                          className="font-outfit"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium font-outfit mb-2 block">Call to Action</Label>
                        <Input
                          value={campaignContent.callToAction}
                          onChange={(e) =>
                            setCampaignContent({ ...campaignContent, callToAction: e.target.value })
                          }
                          placeholder="Enter call to action..."
                          className="font-outfit"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
                        <Globe className="h-5 w-5 text-[#161950]" />
                        Select Platforms
                      </CardTitle>
                      <CardDescription className="font-outfit">
                        Choose which platforms to use for this campaign
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {platforms.map((platform) => {
                          const Icon = platform.icon;
                          const isSelected = selectedPlatforms.includes(platform.id);
                          return (
                            <div
                              key={platform.id}
                              className={`p-4 border rounded-lg cursor-pointer transition-all font-outfit ${
                                isSelected
                                  ? 'border-[#161950] bg-[#161950]/5'
                                  : 'border-gray-200 hover:border-[#161950]'
                              }`}
                              onClick={() => handlePlatformToggle(platform.id)}
                            >
                              <div className="flex items-center gap-3">
                                <Icon className="h-5 w-5 text-[#161950]" />
                                <span className="font-medium">{platform.name}</span>
                                {isSelected && <Check className="h-4 w-4 text-[#161950] ml-auto" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  {analysisData && (
                    <Card className="border border-[#161950]/20 bg-[#161950]/5">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
                          <TrendingUp className="h-5 w-5 text-[#161950]" />
                          AI Confidence
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <div className="text-3xl font-bold font-outfit text-[#161950] mb-2">
                            {analysisData.confidenceScore}%
                          </div>
                          <p className="text-sm font-outfit text-gray-700">
                            High confidence in generating effective campaign content
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Button
                    onClick={() => setCurrentStep(3)}
                    className="w-full bg-[#161950] hover:bg-[#161950]/90 font-outfit"
                    disabled={selectedPlatforms.length === 0}
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Generate Campaign
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
                  Generating Your Campaign
                </CardTitle>
                <CardDescription className="font-outfit">
                  AI is creating tailored marketing content for your campaign
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="max-w-md mx-auto">
                  <div className="flex items-center justify-center mb-4">
                    <RefreshCw className="h-16 w-16 text-[#161950] animate-spin" />
                  </div>
                  <Progress value={75} className="mb-4" />
                  <div className="text-center space-y-2">
                    <p className="text-sm font-outfit text-gray-600">Analyzing campaign requirements...</p>
                    <p className="text-sm font-outfit text-gray-600">Generating content variations...</p>
                    <p className="text-sm font-outfit text-gray-600">Optimizing for selected platforms...</p>
                    <p className="text-sm font-outfit text-gray-600">Finalizing campaign assets...</p>
                  </div>
                </div>

                <div className="text-center">
                  <Button
                    onClick={generateCampaign}
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

          {currentStep === 4 && generatedCampaign && (
            <div className="space-y-8">
              <Card className="border border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
                    <Check className="h-6 w-6 text-green-600" />
                    Campaign Generated Successfully!
                  </CardTitle>
                  <CardDescription className="font-outfit">
                    Your marketing campaign is ready. Review and launch when ready.
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card className="border border-gray-200">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between font-outfit text-[#1A1A1A]">
                        <div className="flex items-center gap-2">
                          <Megaphone className="h-5 w-5 text-[#161950]" />
                          {generatedCampaign.title}
                        </div>
                        <Badge className="bg-[#161950] text-white font-outfit">
                          {generatedCampaign.platforms.length} Platform
                          {generatedCampaign.platforms.length !== 1 ? 's' : ''}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="font-outfit">
                        Generated on {new Date(generatedCampaign.generatedAt).toLocaleString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h5 className="font-medium font-outfit mb-2">Headline</h5>
                          <p className="text-sm font-outfit text-gray-700">{generatedCampaign.content.headline}</p>
                        </div>
                        <div>
                          <h5 className="font-medium font-outfit mb-2">Description</h5>
                          <p className="text-sm font-outfit text-gray-700">
                            {generatedCampaign.content.description}
                          </p>
                        </div>
                        <div>
                          <h5 className="font-medium font-outfit mb-2">Call to Action</h5>
                          <p className="text-sm font-outfit text-gray-700">
                            {generatedCampaign.content.callToAction}
                          </p>
                        </div>
                        <div>
                          <h5 className="font-medium font-outfit mb-2">Key Messages</h5>
                          <div className="flex flex-wrap gap-2">
                            {generatedCampaign.content.keyMessages.map((msg, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="bg-[#161950]/10 text-[#161950] border-[#161950] font-outfit"
                              >
                                {msg}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium font-outfit mb-2">Platforms</h5>
                          <div className="flex flex-wrap gap-2">
                            {generatedCampaign.platforms.map((platformId) => {
                              const platform = platforms.find((p) => p.id === platformId);
                              if (!platform) return null;
                              const Icon = platform.icon;
                              return (
                                <Badge
                                  key={platformId}
                                  variant="outline"
                                  className="bg-[#161950]/10 text-[#161950] border-[#161950] font-outfit"
                                >
                                  <Icon className="h-3 w-3 mr-1" />
                                  {platform.name}
                                </Badge>
                              );
                            })}
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
                        Change Design
                      </Button>
                      <Button variant="outline" className="w-full justify-start font-outfit">
                        <Settings className="h-4 w-4 mr-2" />
                        Adjust Settings
                      </Button>
                      <Button variant="outline" className="w-full justify-start font-outfit">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regenerate Content
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
                        <Download className="h-5 w-5 text-[#161950]" />
                        Launch Options
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button className="w-full bg-[#161950] hover:bg-[#161950]/90 font-outfit">
                        <Download className="h-4 w-4 mr-2" />
                        Export Campaign
                      </Button>
                      <Button variant="outline" className="w-full font-outfit">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview Campaign
                      </Button>
                      <Button variant="outline" className="w-full font-outfit">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Launch
                      </Button>
                    </CardContent>
                  </Card>

                  <Button
                    onClick={() => {
                      const campaignId = Date.now();
                      navigate(`/module/proposals/campaigns/${campaignId}/edit`, {
                        state: {
                          campaign: {
                            id: campaignId,
                            name: generatedCampaign.title,
                            client: account.name,
                            status: 'Draft',
                            budget: 0,
                            spent: 0,
                            leads: 0,
                            conversions: 0,
                            startDate: new Date().toISOString().split('T')[0],
                            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                              .toISOString()
                              .split('T')[0],
                            targetAudience: targetAudience,
                            description: generatedCampaign.content.description,
                            channels: generatedCampaign.platforms.map((p) => {
                              const platform = platforms.find((pl) => pl.id === p);
                              return platform?.name || p;
                            }),
                          },
                          mode: 'view',
                        },
                      });
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 font-outfit"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Complete & Launch
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

