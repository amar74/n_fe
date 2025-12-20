import { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  FileText,
  Timer,
  Upload,
  Eye,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/shared';

interface OverviewTabProps {
  interviewData?: {
    id?: number;
    name?: string;
    client?: string;
    date?: string;
    time?: string;
    format?: string;
    location?: string;
  };
}

export default function OverviewTab({ interviewData }: OverviewTabProps) {
  const { toast } = useToast();
  const [interviewLetter, setInterviewLetter] = useState<{
    name: string;
    size: string;
    uploadDate: string;
  } | null>(null);
  const [overview, setOverview] = useState(
    'Comprehensive presentation for metropolitan transit system expansion including route planning, infrastructure development, and ridership projections.'
  );

  const preparationProgress = {
    materials: 75,
    teamPreparation: 60,
    presentation: 80,
    qaPreparation: 50,
  };

  const upcomingTasks = [
    { task: 'Finalize presentation slides', due: 'Dec 16, 2024', status: 'in_progress' },
    { task: 'Review panel member backgrounds', due: 'Dec 17, 2024', status: 'pending' },
    { task: 'Practice presentation with team', due: 'Dec 17, 2024', status: 'pending' },
    { task: 'Prepare Q&A responses', due: 'Dec 17, 2024', status: 'in_progress' },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setInterviewLetter({
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        uploadDate: new Date().toLocaleDateString(),
      });
      toast.success(`${file.name} uploaded successfully.`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
              <FileText className="h-5 w-5 text-[#161950]" />
              Project Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 font-outfit">{overview}</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
              <MapPin className="h-5 w-5 text-[#161950]" />
              Interview Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-[#161950]" />
              <span className="text-sm font-medium font-outfit">Format:</span>
              <span className="text-sm font-outfit">{interviewData?.format || 'Not set'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#161950]" />
              <span className="text-sm font-medium font-outfit">Time:</span>
              <span className="text-sm font-outfit">{interviewData?.time || 'Not set'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#161950]" />
              <span className="text-sm font-medium font-outfit">Location:</span>
              <span className="text-sm font-outfit">{interviewData?.location || 'Not set'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#161950]" />
              <span className="text-sm font-medium font-outfit">Panel Size:</span>
              <span className="text-sm font-outfit">5 members</span>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
              <FileText className="h-4 w-4 text-[#161950]" />
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-[#161950] hover:text-[#161950]/80 p-0 h-auto font-outfit"
                  >
                    Client Interview Letter
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Client Interview Letter</DialogTitle>
                    <DialogDescription>
                      Upload the official interview invitation letter or email from the client
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {interviewLetter ? (
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded">
                            <FileText className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold font-outfit text-[#1A1A1A]">
                              {interviewLetter.name}
                            </h4>
                            <p className="text-sm font-outfit text-gray-600">
                              {interviewLetter.size} • Uploaded {interviewLetter.uploadDate}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="font-outfit">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setInterviewLetter(null)}
                            className="font-outfit"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-[#161950]/30 rounded-lg p-8 text-center">
                        <Upload className="h-12 w-12 mx-auto mb-4 text-[#161950]" />
                        <h3 className="text-lg font-semibold font-outfit text-[#1A1A1A] mb-2">
                          Upload Interview Letter
                        </h3>
                        <p className="text-gray-600 font-outfit mb-4">
                          Drag and drop the interview invitation letter, or click to browse
                        </p>
                        <div className="relative inline-block">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.txt,.jpg,.png"
                            onChange={handleFileUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Button variant="outline" className="font-outfit text-[#161950] border-[#161950]">
                            <Upload className="h-4 w-4 mr-2" />
                            Choose File
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 font-outfit">
                          Supported formats: PDF, Word, Text, Images (max 10MB)
                        </p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
            <Timer className="h-5 w-5 text-[#161950]" />
            Preparation Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(preparationProgress).map(([area, progress]) => (
              <div key={area} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium font-outfit capitalize">
                    {area.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-sm font-bold font-outfit">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
            <Clock className="h-5 w-5 text-[#161950]" />
            Upcoming Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingTasks.map((task, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium font-outfit text-[#1A1A1A]">{task.task}</h4>
                  <p className="text-sm font-outfit text-gray-600">Due: {task.due}</p>
                </div>
                <Badge
                  variant="outline"
                  className={`font-outfit ${
                    task.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : task.status === 'in_progress'
                      ? 'bg-[#161950]/10 text-[#161950]'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {task.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

