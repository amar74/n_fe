import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, FolderKanban, Eye, Edit3 } from 'lucide-react';
import type { Project } from '@/services/api/projectsApi';
import { getStatusColor, getPhaseColor, formatCurrency, formatDate } from './utils';

interface ProjectsTabProps {
  projects: Project[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterStatus: string;
  onFilterStatusChange: (status: string) => void;
  filterPhase: string;
  onFilterPhaseChange: (phase: string) => void;
}

export function ProjectsTab({
  projects,
  isLoading,
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  filterPhase,
  onFilterPhaseChange,
}: ProjectsTabProps) {
  const navigate = useNavigate();

  const filteredProjects = projects.filter((project: any) => {
    const matchesSearch =
      (project.title || project.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.account_name || project.client_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.project_id || project.id || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || project.status === filterStatus;
    const matchesPhase =
      filterPhase === 'all' || project.phase === filterPhase;
    return matchesSearch && matchesStatus && matchesPhase;
  });

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#667085]" />
            <Input
              type="text"
              placeholder="Search projects by name, account, or ID..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 h-11 font-outfit border-[#E5E7EB] focus:border-[#161950] focus:ring-1 focus:ring-[#161950] bg-white text-[#1A1A1A]"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => onFilterStatusChange(e.target.value)}
            className="px-4 py-2.5 border border-[#E5E7EB] rounded-lg font-outfit bg-white text-[#667085] focus:border-[#161950] focus:ring-1 focus:ring-[#161950] h-11"
          >
            <option value="all">All Status</option>
            <option value="planning">Planning</option>
            <option value="in_progress">In Progress</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={filterPhase}
            onChange={(e) => onFilterPhaseChange(e.target.value)}
            className="px-4 py-2.5 border border-[#E5E7EB] rounded-lg font-outfit bg-white text-[#667085] focus:border-[#161950] focus:ring-1 focus:ring-[#161950] h-11"
          >
            <option value="all">All Phases</option>
            <option value="discovery">Discovery</option>
            <option value="planning">Planning</option>
            <option value="execution">Execution</option>
            <option value="implementation">Implementation</option>
            <option value="closing">Closing</option>
          </select>
          <Button
            onClick={() => navigate('/module/projects/create')}
            className="h-11 px-5 bg-[#161950] hover:bg-[#1E2B5B] text-white rounded-lg flex items-center gap-2.5 shadow-sm font-outfit whitespace-nowrap"
          >
            <Plus className="w-5 h-5 text-white" />
            <span className="text-white text-sm font-medium font-outfit leading-normal">New Project</span>
          </Button>
        </div>
      </div>

      <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] flex flex-col gap-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <div className="flex justify-start items-start gap-6">
          <div className="flex-1 flex flex-col gap-1">
            <h2 className="text-[#1A1A1A] text-lg font-semibold font-outfit leading-7">
              Projects Repository
            </h2>
            <p className="text-[#667085] text-sm font-normal font-outfit">
              Manage and track all your projects
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-[#667085]">Loading projects...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="p-4 bg-[#EAECF0] rounded-full">
              <FolderKanban className="w-12 h-12 text-[#667085]" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit">No projects found</h3>
              <p className="text-[#667085] text-sm font-outfit text-center max-w-md">
                {searchQuery || filterStatus !== 'all' || filterPhase !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first project'}
              </p>
            </div>
            {!searchQuery && filterStatus === 'all' && filterPhase === 'all' && (
              <Button
                onClick={() => navigate('/module/projects/create')}
                className="mt-4 h-11 px-6 bg-[#161950] hover:bg-[#1E2B5B] text-white rounded-lg font-outfit"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Project
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProjects.map((project: any) => (
              <div
                key={project.id}
                className="p-6 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] hover:border-[#161950] hover:shadow-md transition-all cursor-pointer"
                onClick={() => navigate(`/module/projects/${project.id}`)}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FolderKanban className="h-5 w-5 text-[#1D2939]" />
                        <h3 className="text-[#1A1A1A] text-base font-semibold font-outfit line-clamp-2">
                          {project.title || project.name}
                        </h3>
                      </div>
                      <p className="text-[#667085] text-sm font-normal font-outfit">
                        {project.account_name || project.client_name || 'No account'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={`${getStatusColor(project.status)} text-xs font-outfit`}>
                      {project.status?.replace('_', ' ').toUpperCase()}
                    </Badge>
                    {project.phase && (
                      <Badge className={`${getPhaseColor(project.phase)} text-xs font-outfit`}>
                        {project.phase?.toUpperCase()}
                      </Badge>
                    )}
                  </div>

                  {(project.budget || project.start_date || project.end_date) && (
                    <div className="flex flex-col gap-2 pt-2 border-t border-[#E5E7EB]">
                      {project.budget?.total_allocated && (
                        <div className="flex justify-between items-center">
                          <span className="text-[#667085] text-xs font-normal font-outfit">Budget</span>
                          <span className="text-[#1A1A1A] text-sm font-semibold font-outfit">
                            {formatCurrency(project.budget.total_allocated)}
                          </span>
                        </div>
                      )}
                      {project.start_date && (
                        <div className="flex justify-between items-center">
                          <span className="text-[#667085] text-xs font-normal font-outfit">Start Date</span>
                          <span className="text-[#1A1A1A] text-sm font-normal font-outfit">
                            {formatDate(project.start_date)}
                          </span>
                        </div>
                      )}
                      {project.end_date && (
                        <div className="flex justify-between items-center">
                          <span className="text-[#667085] text-xs font-normal font-outfit">End Date</span>
                          <span className="text-[#1A1A1A] text-sm font-normal font-outfit">
                            {formatDate(project.end_date)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E7EB]">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 border-[#E5E7EB] text-[#667085] hover:bg-white rounded-lg font-outfit"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/module/projects/${project.id}`);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1.5" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 border-[#E5E7EB] text-[#667085] hover:bg-white rounded-lg font-outfit"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/module/projects/${project.id}/edit`);
                      }}
                    >
                      <Edit3 className="h-4 w-4 mr-1.5" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

