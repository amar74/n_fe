import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Target,
  FolderKanban,
  Brain,
  FileText,
  Eye,
} from 'lucide-react';
import { useProjects } from '@/hooks/projects';
import { useToast } from '@/hooks/shared';
import type { Project } from '@/services/api/projectsApi';
import {
  DashboardTab,
  ProjectsTab,
  ProjectStatusTab,
  ManagementReviewTab,
} from './components';

export default function ProjectManagementPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPhase, setFilterPhase] = useState('all');

  const { useProjectsList } = useProjects();

  const { data: projectsData, isLoading } = useProjectsList({
    page: 1,
    size: 100,
    search: searchQuery || undefined,
    status: filterStatus !== 'all' ? filterStatus : undefined,
    phase: filterPhase !== 'all' ? filterPhase : undefined,
  });

  const projects = projectsData?.items || [];

  const activeProjects = projects.filter(
    (p: any) => p.status === 'in_progress'
  ).length;
  const onHoldProjects = projects.filter(
    (p: any) => p.status === 'on_hold'
  ).length;
  const completedProjects = projects.filter(
    (p: any) => p.status === 'completed'
  ).length;
  const cancelledProjects = projects.filter(
    (p: any) => p.status === 'cancelled'
  ).length;

  return (
    <div className="w-full h-full bg-[#F5F3F2] font-outfit">
      <div className="flex flex-col w-full p-6 gap-6">
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Link to="/" className="text-gray-500 text-sm font-normal font-outfit leading-tight hover:text-gray-900">
                Dashboard
              </Link>
              <span className="text-[#344054] text-sm font-normal font-outfit leading-tight">/</span>
              <span className="text-[#344054] text-sm font-normal font-outfit leading-tight">Project Management</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-[#1A1A1A] text-3xl font-semibold font-outfit leading-loose">
                Project Management
              </h1>
              <Badge variant="outline" className="bg-[#F9FAFB] text-[#667085] border-[#E5E7EB] px-2.5 py-1 font-outfit">
                <Brain className="h-3 w-3 mr-1.5" />
                AI-Powered
              </Badge>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Button
              onClick={() => navigate('/module/projects/create')}
              className="h-11 px-5 py-2 bg-[#161950] hover:bg-[#1E2B5B] rounded-lg flex items-center gap-2.5 shadow-sm font-outfit"
            >
              <Plus className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-medium font-outfit leading-normal">Create New Project</span>
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-1.5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
            <TabsList className="grid w-full grid-cols-3 bg-transparent gap-1 h-auto p-0 font-outfit">
              <TabsTrigger
                value="dashboard"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all font-outfit text-sm font-medium data-[state=active]:bg-[#161950] data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-[#667085] data-[state=inactive]:hover:text-[#1A1A1A] data-[state=inactive]:hover:bg-gray-50"
              >
                <Target className="h-4 w-4 flex-shrink-0" />
                <span className="leading-tight">PM Portfolio</span>
              </TabsTrigger>
              <TabsTrigger
                value="status"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all font-outfit text-sm font-medium data-[state=active]:bg-[#161950] data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-[#667085] data-[state=inactive]:hover:text-[#1A1A1A] data-[state=inactive]:hover:bg-gray-50"
              >
                <FileText className="h-4 w-4 flex-shrink-0" />
                <span className="leading-tight">Project Status Report</span>
              </TabsTrigger>
              <TabsTrigger
                value="management"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all font-outfit text-sm font-medium data-[state=active]:bg-[#161950] data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-[#667085] data-[state=inactive]:hover:text-[#1A1A1A] data-[state=inactive]:hover:bg-gray-50"
              >
                <Eye className="h-4 w-4 flex-shrink-0" />
                <span className="leading-tight">Management Review</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="space-y-6 mt-6">
            <DashboardTab
              projects={projects}
              isLoading={isLoading}
              activeProjects={activeProjects}
              onHoldProjects={onHoldProjects}
              completedProjects={completedProjects}
              cancelledProjects={cancelledProjects}
              onProjectSelect={setSelectedProject}
              onTabChange={setActiveTab}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </TabsContent>

          <TabsContent value="status" className="space-y-6 mt-6">
            <ProjectStatusTab
              projects={projects}
              selectedProject={selectedProject}
              onProjectSelect={setSelectedProject}
            />
          </TabsContent>

          <TabsContent value="management" className="space-y-6 mt-6">
            <ManagementReviewTab projects={projects} />
          </TabsContent>

          <TabsContent value="projects" className="space-y-6 mt-6">
            <ProjectsTab
              projects={projects}
              isLoading={isLoading}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterStatus={filterStatus}
              onFilterStatusChange={setFilterStatus}
              filterPhase={filterPhase}
              onFilterPhaseChange={setFilterPhase}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

