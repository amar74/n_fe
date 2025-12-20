import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  FileText,
  Presentation,
  Send,
  Phone,
  CalendarDays,
  Target,
  TrendingUp,
  Save,
  ArrowRight,
  Eye,
} from "lucide-react";
import { useToast } from "@/hooks/shared";

interface ScheduleItem {
  id: string;
  task: string;
  category: "pre-rfp" | "post-rfp";
  startDate: string;
  endDate: string;
  assignee: string;
  status: "completed" | "in-progress" | "pending" | "overdue";
  progress: number;
  dependencies?: string[];
}

interface ReviewMilestone {
  id: string;
  name: string;
  type: "pink" | "red" | "final";
  date: string;
  participants: string[];
  status: "scheduled" | "completed" | "pending";
}

interface ScheduleTabProps {
  proposalId?: string;
  onSave?: () => void;
  onNext?: () => void;
}

export default function ScheduleTab({ proposalId, onSave, onNext }: ScheduleTabProps) {
  const { toast } = useToast();
  const [rfpReleaseDate, setRfpReleaseDate] = useState("2024-11-01");
  const [submissionDate, setSubmissionDate] = useState("2024-12-15");
  const [selectedPhase, setSelectedPhase] = useState<
    "pre-rfp" | "post-rfp" | "both"
  >("both");

  const scheduleItems: ScheduleItem[] = [
    // Pre-RFP Phase
    {
      id: "1",
      task: "RFI/SOI issued",
      category: "pre-rfp",
      startDate: "2024-09-15",
      endDate: "2024-09-15",
      assignee: "Client",
      status: "completed",
      progress: 100,
    },
    {
      id: "2",
      task: "Initial market research",
      category: "pre-rfp",
      startDate: "2024-09-16",
      endDate: "2024-09-30",
      assignee: "Research Team",
      status: "completed",
      progress: 100,
    },
    {
      id: "3",
      task: "Team assembly and role definition",
      category: "pre-rfp",
      startDate: "2024-10-01",
      endDate: "2024-10-15",
      assignee: "Project Manager",
      status: "completed",
      progress: 100,
    },
    {
      id: "4",
      task: "Client relationship building",
      category: "pre-rfp",
      startDate: "2024-10-01",
      endDate: "2024-10-31",
      assignee: "Business Development",
      status: "completed",
      progress: 100,
    },

    // Post-RFP Phase
    {
      id: "5",
      task: "RFP analysis and breakdown",
      category: "post-rfp",
      startDate: "2024-11-01",
      endDate: "2024-11-05",
      assignee: "Proposal Manager",
      status: "completed",
      progress: 100,
    },
    {
      id: "6",
      task: "Proposal kick-off meeting",
      category: "post-rfp",
      startDate: "2024-11-06",
      endDate: "2024-11-06",
      assignee: "All Team",
      status: "completed",
      progress: 100,
    },
    {
      id: "7",
      task: "Request information from subconsultants",
      category: "post-rfp",
      startDate: "2024-11-06",
      endDate: "2024-11-08",
      assignee: "Procurement",
      status: "completed",
      progress: 100,
    },
    {
      id: "8",
      task: "Site visit and technical assessment",
      category: "post-rfp",
      startDate: "2024-11-10",
      endDate: "2024-11-12",
      assignee: "Technical Team",
      status: "completed",
      progress: 100,
    },
    {
      id: "9",
      task: "Pre-proposal conference",
      category: "post-rfp",
      startDate: "2024-11-15",
      endDate: "2024-11-15",
      assignee: "Client",
      status: "completed",
      progress: 100,
    },
    {
      id: "10",
      task: "Finalize subconsultant selection",
      category: "post-rfp",
      startDate: "2024-11-16",
      endDate: "2024-11-20",
      assignee: "Procurement",
      status: "completed",
      progress: 100,
    },
    {
      id: "11",
      task: "Gather questions for client",
      category: "post-rfp",
      startDate: "2024-11-18",
      endDate: "2024-11-22",
      assignee: "Technical Team",
      status: "completed",
      progress: 100,
    },
    {
      id: "12",
      task: "Submit questions to client",
      category: "post-rfp",
      startDate: "2024-11-22",
      endDate: "2024-11-22",
      assignee: "Proposal Manager",
      status: "completed",
      progress: 100,
    },
    {
      id: "13",
      task: "Client answers posted",
      category: "post-rfp",
      startDate: "2024-11-29",
      endDate: "2024-11-29",
      assignee: "Client",
      status: "completed",
      progress: 100,
    },
    {
      id: "14",
      task: "Subconsultant information due",
      category: "post-rfp",
      startDate: "2024-11-25",
      endDate: "2024-11-30",
      assignee: "Subconsultants",
      status: "completed",
      progress: 100,
    },
    {
      id: "15",
      task: "Technical writing assignments due",
      category: "post-rfp",
      startDate: "2024-11-30",
      endDate: "2024-12-05",
      assignee: "Technical Writers",
      status: "in-progress",
      progress: 85,
    },
    {
      id: "16",
      task: "Pink team review",
      category: "post-rfp",
      startDate: "2024-12-06",
      endDate: "2024-12-07",
      assignee: "Review Team",
      status: "pending",
      progress: 0,
    },
    {
      id: "17",
      task: "Red team review",
      category: "post-rfp",
      startDate: "2024-12-09",
      endDate: "2024-12-10",
      assignee: "Review Team",
      status: "pending",
      progress: 0,
    },
    {
      id: "18",
      task: "Final changes and review",
      category: "post-rfp",
      startDate: "2024-12-11",
      endDate: "2024-12-13",
      assignee: "All Team",
      status: "pending",
      progress: 0,
    },
    {
      id: "19",
      task: "Print and production",
      category: "post-rfp",
      startDate: "2024-12-13",
      endDate: "2024-12-14",
      assignee: "Production Team",
      status: "pending",
      progress: 0,
    },
    {
      id: "20",
      task: "Proposal submission",
      category: "post-rfp",
      startDate: "2024-12-15",
      endDate: "2024-12-15",
      assignee: "Delivery Team",
      status: "pending",
      progress: 0,
    },
  ];

  const reviewMilestones: ReviewMilestone[] = [
    {
      id: "pink",
      name: "Pink Team Review",
      type: "pink",
      date: "2024-12-06",
      participants: ["Sarah Johnson", "Michael Chen", "Technical Team"],
      status: "scheduled",
    },
    {
      id: "red",
      name: "Red Team Review",
      type: "red",
      date: "2024-12-09",
      participants: ["Lisa Rodriguez", "External Reviewer", "Quality Team"],
      status: "pending",
    },
    {
      id: "final",
      name: "Final Review",
      type: "final",
      date: "2024-12-13",
      participants: ["Project Manager", "Principal", "Legal Review"],
      status: "pending",
    },
  ];

  const getStatusColor = (status: string) => {
    return "bg-[#161950]/5 text-[#161950] border-[#161950]/20";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "in-progress":
        return <Clock className="h-4 w-4" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const filteredItems = scheduleItems.filter((item) => {
    if (selectedPhase === "both") return true;
    return item.category === selectedPhase;
  });

  const completedTasks = scheduleItems.filter(
    (item) => item.status === "completed",
  ).length;
  const totalTasks = scheduleItems.length;
  const overallProgress = Math.round((completedTasks / totalTasks) * 100);

  const handleUpdateDate = () => {
    toast.success("Dates updated and schedule recalculated.");
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <div className="mb-6">
          <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit mb-2 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#161950]" />
            Proposal Schedule Overview
          </h3>
          <p className="text-gray-600 text-sm font-outfit">
            Track progress and manage timeline for proposal development
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-5 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all">
            <div className="bg-[#161950]/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-6 w-6 text-[#161950]" />
            </div>
            <div className="text-3xl font-bold font-outfit text-[#161950] mb-1">
              {overallProgress}%
            </div>
            <p className="text-sm text-gray-600 font-outfit font-medium">Overall Progress</p>
          </div>
          <div className="text-center p-5 bg-[#161950]/5 rounded-xl border border-[#161950]/20 hover:shadow-md transition-all">
            <div className="bg-[#161950]/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-6 w-6 text-[#161950]" />
            </div>
            <div className="text-3xl font-bold font-outfit text-[#161950] mb-1">
              {completedTasks}
            </div>
            <p className="text-sm text-gray-600 font-outfit font-medium">Tasks Completed</p>
          </div>
          <div className="text-center p-5 bg-[#161950]/5 rounded-xl border border-[#161950]/20 hover:shadow-md transition-all">
            <div className="bg-[#161950]/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Target className="h-6 w-6 text-[#161950]" />
            </div>
            <div className="text-3xl font-bold font-outfit text-[#161950] mb-1">
              {totalTasks - completedTasks}
            </div>
            <p className="text-sm text-gray-600 font-outfit font-medium">Tasks Remaining</p>
          </div>
          <div className="text-center p-5 bg-[#161950]/5 rounded-xl border border-[#161950]/20 hover:shadow-md transition-all">
            <div className="bg-[#161950]/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
              <CalendarDays className="h-6 w-6 text-[#161950]" />
            </div>
            <div className="text-3xl font-bold font-outfit text-[#161950] mb-1">
              {Math.ceil(
                (new Date(submissionDate).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24),
              )}
            </div>
            <p className="text-sm text-gray-600 font-outfit font-medium">Days Until Due</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-outfit text-gray-600">Progress</span>
            <span className="font-outfit font-semibold text-[#1A1A1A]">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-3 bg-gray-100" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <div className="mb-6">
          <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit mb-2 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#161950]" />
            Key Dates Configuration
          </h3>
          <p className="text-gray-600 text-sm font-outfit">
            Update critical dates to automatically adjust the schedule
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-sm font-semibold font-outfit text-[#1A1A1A] block mb-2">
              RFP Release Date
            </Label>
            <Input
              type="date"
              value={rfpReleaseDate}
              onChange={(e) => setRfpReleaseDate(e.target.value)}
              className="border-gray-200 font-outfit"
            />
          </div>
          <div>
            <Label className="text-sm font-semibold font-outfit text-[#1A1A1A] block mb-2">
              Submission Date
            </Label>
            <Input
              type="date"
              value={submissionDate}
              onChange={(e) => setSubmissionDate(e.target.value)}
              className="border-gray-200 font-outfit"
            />
          </div>
          <div className="flex items-end">
            <Button 
              onClick={handleUpdateDate} 
              className="w-full bg-[#161950] hover:bg-[#0f1440] font-outfit"
            >
              Update Schedule
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <div className="mb-4">
          <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit mb-2 flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#161950]" />
            Schedule Phases
          </h3>
          <p className="text-gray-600 text-sm font-outfit">
            View different phases of the proposal development process
          </p>
        </div>
        <Select 
          value={selectedPhase}
          onValueChange={(value: "pre-rfp" | "post-rfp" | "both") => setSelectedPhase(value)}
        >
          <SelectTrigger className="max-w-xs border-gray-200 font-outfit">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="both">All Phases</SelectItem>
            <SelectItem value="pre-rfp">Pre-RFP Phase</SelectItem>
            <SelectItem value="post-rfp">Post-RFP Phase</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <div className="mb-6">
          <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit mb-2 flex items-center gap-2">
            <Presentation className="h-5 w-5 text-[#161950]" />
            Review Milestones
          </h3>
          <p className="text-gray-600 text-sm font-outfit">
            Critical review points in the proposal development
          </p>
        </div>
        <div className="space-y-3">
          {reviewMilestones.map((milestone) => (
            <div
              key={milestone.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="p-3 rounded-xl bg-[#161950]/10">
                  <Presentation className="h-6 w-6 text-[#161950]" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold font-outfit text-[#1A1A1A] mb-1">
                    {milestone.name}
                  </h4>
                  <p className="text-sm text-gray-600 font-outfit mb-2">
                    {milestone.date}
                  </p>
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs text-gray-500 font-outfit">
                      {milestone.participants.join(", ")}
                    </span>
                  </div>
                </div>
              </div>
              <Badge
                variant="outline"
                className={`${getStatusColor(milestone.status)} font-outfit font-medium`}
              >
                {milestone.status === "scheduled" && (
                  <Calendar className="h-3 w-3 mr-1.5" />
                )}
                {milestone.status === "completed" && (
                  <CheckCircle className="h-3 w-3 mr-1.5" />
                )}
                {milestone.status === "pending" && (
                  <Clock className="h-3 w-3 mr-1.5" />
                )}
                {milestone.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <div className="mb-6">
          <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit mb-2 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-[#161950]" />
            Detailed Schedule
          </h3>
          <p className="text-gray-600 text-sm font-outfit">
            Complete timeline with all tasks and milestones
          </p>
        </div>
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-gray-200">
                  {getStatusIcon(item.status)}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold font-outfit text-[#1A1A1A] mb-2">
                    {item.task}
                  </h4>
                  <div className="flex items-center gap-4 mb-2 text-xs text-gray-600 font-outfit">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {item.startDate} - {item.endDate}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {item.assignee}
                    </span>
                  </div>
                  {item.status === "in-progress" && (
                    <div className="space-y-1.5 mt-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-outfit text-gray-600">Progress</span>
                        <span className="font-outfit font-semibold text-[#1A1A1A]">{item.progress}%</span>
                      </div>
                      <Progress
                        value={item.progress}
                        className="h-2 bg-gray-100"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 text-xs font-outfit font-medium"
                >
                  {item.category === "pre-rfp" ? "Pre-RFP" : "Post-RFP"}
                </Badge>
                <Badge
                  variant="outline"
                  className={`${getStatusColor(item.status)} font-outfit font-medium text-xs`}
                >
                  {item.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#161950]/5 rounded-2xl border border-[#161950]/20 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="justify-start border-gray-200 hover:bg-white hover:border-gray-300 font-outfit"
            onClick={() => toast.info("Exporting schedule...")}
          >
            <FileText className="h-4 w-4 mr-2 text-[#161950]" />
            Export Schedule
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="justify-start border-gray-200 hover:bg-white hover:border-gray-300 font-outfit"
            onClick={() => toast.info("Sharing timeline...")}
          >
            <Send className="h-4 w-4 mr-2 text-[#161950]" />
            Share Timeline
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="justify-start border-gray-200 hover:bg-white hover:border-gray-300 font-outfit"
            onClick={() => toast.info("Scheduling review...")}
          >
            <Phone className="h-4 w-4 mr-2 text-[#161950]" />
            Schedule Review
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="justify-start border-gray-200 hover:bg-white hover:border-gray-300 font-outfit"
            onClick={() => toast.info("Adding milestone...")}
          >
            <Calendar className="h-4 w-4 mr-2 text-[#161950]" />
            Add Milestone
          </Button>
        </div>
      </div>

      {/* Save Proposal and View Details Buttons */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
        {onSave && (
          <Button
            onClick={onSave}
            className="font-outfit bg-[#161950] hover:bg-[#0f1440] text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Proposal
          </Button>
        )}
        {proposalId && (
          <Button
            onClick={() => {
              // Navigate to proposal details view (or open preview modal)
              // This will open the proposal in read-only view
              window.open(`/proposals/${proposalId}`, '_blank');
            }}
            variant="outline"
            className="font-outfit border-[#161950] text-[#161950] hover:bg-[#161950]/5"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Proposal in Details
          </Button>
        )}
      </div>
    </div>
  );
}

