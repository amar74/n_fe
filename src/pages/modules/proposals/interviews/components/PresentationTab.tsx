import { useState } from 'react';
import {
  Presentation,
  FileText,
  Download,
  Target,
  Users,
  UserPlus,
  Bot,
  Eye,
  X,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/shared';

interface PanelMember {
  id: number;
  name: string;
  title: string;
  organization: string;
  bio?: string;
}

export default function PresentationTab() {
  const { toast } = useToast();
  const [panelMembers, setPanelMembers] = useState<PanelMember[]>([]);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [newPanelMember, setNewPanelMember] = useState({ name: '', title: '', organization: '' });
  const [presentationFile, setPresentationFile] = useState<{
    name: string;
    size: string;
    lastModified: string;
    status: string;
  } | null>({
    name: 'Metro_Transit_Presentation_DRAFT.pptx',
    size: '18.3 MB',
    lastModified: 'Dec 14, 2024 4:30 PM',
    status: 'In Progress',
  });

  const objectives = [
    'Present innovative transit expansion solutions',
    'Demonstrate technical expertise in transit planning',
    'Showcase relevant experience and past performance',
    'Address community impact and accessibility',
  ];

  const keyTopics = [
    'Route Optimization',
    'Infrastructure Development',
    'Ridership Forecasting',
    'Community Engagement',
    'Cost-Benefit Analysis',
  ];

  const teamMembers = [
    { name: 'Dr. Michael Chang', role: 'Transportation Planner', expertise: 'Transit Systems' },
    { name: 'Angela Brown', role: 'Traffic Engineer', expertise: 'Flow Optimization' },
    { name: 'Kevin Martinez', role: 'Data Analyst', expertise: 'Ridership Modeling' },
  ];

  const addPanelMember = () => {
    if (newPanelMember.name && newPanelMember.title) {
      const member: PanelMember = {
        ...newPanelMember,
        id: Date.now(),
      };
      setPanelMembers([...panelMembers, member]);
      setNewPanelMember({ name: '', title: '', organization: '' });
      setShowAddPanel(false);
      toast.success(`${member.name} has been added to the panel.`);
    }
  };

  const generateAiBio = async (member: PanelMember) => {
    const aiGeneratedBio = `${member.name} is a distinguished professional with over 15 years of experience in ${member.title.toLowerCase()} at ${member.organization || 'their organization'}. Known for expertise in infrastructure development, transportation planning, and public sector project management.`;

    setPanelMembers(prev =>
      prev.map(p => (p.id === member.id ? { ...p, bio: aiGeneratedBio } : p))
    );
    toast.success('AI bio generated successfully');
  };

  const removePanelMember = (id: number) => {
    setPanelMembers(prev => prev.filter(p => p.id !== id));
    toast.success('Panel member removed');
  };

  return (
    <div className="space-y-6">
      {presentationFile ? (
        <Card className="border border-[#161950]/20 bg-[#161950]/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
              <Presentation className="h-5 w-5 text-[#161950]" />
              Presentation File
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 font-outfit">
                {presentationFile.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold font-outfit text-[#1A1A1A]">
                    {presentationFile.name}
                  </h4>
                  <p className="text-sm font-outfit text-gray-600">
                    {presentationFile.size} • Modified {presentationFile.lastModified}
                  </p>
                </div>
              </div>
              <Button className="bg-[#161950] hover:bg-[#161950]/90 font-outfit">
                <Download className="h-4 w-4 mr-2" />
                Download Draft
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="p-8 text-center">
            <Presentation className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold font-outfit text-[#1A1A1A] mb-2">
              Presentation Not Started
            </h3>
            <p className="text-gray-600 font-outfit">
              The presentation development is scheduled to begin soon.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
              <Target className="h-5 w-5 text-[#161950]" />
              Presentation Objectives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {objectives.map((objective, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-outfit">{objective}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
              <FileText className="h-5 w-5 text-[#161950]" />
              Key Topics to Cover
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {keyTopics.map((topic, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-[#161950]/10 text-[#161950] border-[#161950] font-outfit"
                >
                  {topic}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
            <Users className="h-5 w-5 text-[#161950]" />
            Presentation Team
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.map((member, index) => (
              <Card key={index} className="border border-gray-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold font-outfit text-[#1A1A1A]">{member.name}</h4>
                  <p className="text-sm font-outfit text-[#161950] font-medium">{member.role}</p>
                  <p className="text-xs font-outfit text-gray-600 mt-1">{member.expertise}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between font-outfit text-[#1A1A1A]">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#161950]" />
              Interview Panel Members
            </div>
            <Dialog open={showAddPanel} onOpenChange={setShowAddPanel}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="font-outfit text-[#161950] border-[#161950]">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Panel Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Panel Member</DialogTitle>
                  <DialogDescription>
                    Add interview panel member details to track who will be present during the
                    presentation.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newPanelMember.name}
                      onChange={(e) =>
                        setNewPanelMember({ ...newPanelMember, name: e.target.value })
                      }
                      placeholder="Enter panel member name"
                      className="font-outfit"
                    />
                  </div>
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newPanelMember.title}
                      onChange={(e) =>
                        setNewPanelMember({ ...newPanelMember, title: e.target.value })
                      }
                      placeholder="e.g., Senior Project Manager"
                      className="font-outfit"
                    />
                  </div>
                  <div>
                    <Label htmlFor="organization">Organization</Label>
                    <Input
                      id="organization"
                      value={newPanelMember.organization}
                      onChange={(e) =>
                        setNewPanelMember({ ...newPanelMember, organization: e.target.value })
                      }
                      placeholder="e.g., City of Springfield"
                      className="font-outfit"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddPanel(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addPanelMember} className="bg-[#161950] hover:bg-[#161950]/90">
                      Add Member
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {panelMembers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="font-outfit">No panel members added yet.</p>
              <p className="text-sm font-outfit">
                Add panel members as you receive the information from the client.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {panelMembers.map((member) => (
                <Card key={member.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold font-outfit text-[#1A1A1A]">{member.name}</h4>
                        <p className="text-sm font-outfit text-[#161950] font-medium">
                          {member.title}
                        </p>
                        {member.organization && (
                          <p className="text-xs font-outfit text-gray-600">{member.organization}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateAiBio(member)}
                          className="font-outfit text-[#161950] border-[#161950]"
                        >
                          <Bot className="h-3 w-3 mr-1" />
                          AI Bio
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removePanelMember(member.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {member.bio && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="text-xs font-outfit">
                            <Eye className="h-3 w-3 mr-1" />
                            View Bio
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{member.name} - Professional Bio</DialogTitle>
                            <DialogDescription>AI-generated professional biography</DialogDescription>
                          </DialogHeader>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm font-outfit text-gray-700">{member.bio}</p>
                            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                              <Bot className="h-3 w-3" />
                              Generated by AI based on professional title and organization
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

