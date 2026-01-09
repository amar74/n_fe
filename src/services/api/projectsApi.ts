import { apiClient } from './client';

export interface Project {
  id: string;
  project_id?: string;
  title: string;
  account_id?: string;
  account_name?: string;
  proposal_id?: string;
  contract_id?: string;
  contract_value?: number;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  phase: 'discovery' | 'planning' | 'execution' | 'implementation' | 'closing';
  priority: 'low' | 'medium' | 'high';
  start_date?: string;
  end_date?: string;
  timeline?: {
    total_duration?: number;
    elapsed_time?: number;
    remaining_time?: number;
    milestones_total?: number;
    milestones_completed?: number;
  };
  team?: {
    project_manager?: string;
    technical_lead?: string;
    team_size?: number;
    client_contacts?: Array<{
      name: string;
      title: string;
      role: string;
    }>;
  };
  milestones?: Array<{
    id: string;
    title: string;
    status: 'completed' | 'in_progress' | 'pending' | 'scheduled';
    due_date?: string;
    completed_date?: string;
  }>;
  budget?: {
    total_allocated?: number;
    total_spent?: number;
    remaining_budget?: number;
    burn_rate?: number;
    projected_completion?: number;
  };
  health?: {
    overall_score?: number;
    schedule_health?: 'on_track' | 'at_risk' | 'delayed';
    budget_health?: 'on_budget' | 'under_budget' | 'over_budget';
    risk_level?: 'low' | 'medium' | 'high';
    client_satisfaction?: number;
  };
  deliverables?: Array<{
    id: string;
    title: string;
    status: 'not_started' | 'planning' | 'in_development' | 'testing' | 'completed';
    progress?: number;
  }>;
  risks?: Array<{
    id: string;
    description: string;
    probability?: 'low' | 'medium' | 'high';
    impact?: 'low' | 'medium' | 'high';
    mitigation?: string;
  }>;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectCreateRequest {
  title: string;
  account_id?: string;
  account_name?: string;
  proposal_id?: string;
  contract_id?: string;
  contract_value?: number;
  status?: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  phase?: 'discovery' | 'planning' | 'execution' | 'implementation' | 'closing';
  priority?: 'low' | 'medium' | 'high';
  start_date?: string;
  end_date?: string;
  timeline?: {
    total_duration?: number;
    milestones?: Array<{
      title: string;
      due_date?: string;
    }>;
  };
  team?: {
    project_manager?: string;
    technical_lead?: string;
    team_size?: number;
  };
}

export interface ProjectUpdateRequest {
  title?: string;
  status?: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  phase?: 'discovery' | 'planning' | 'execution' | 'implementation' | 'closing';
  priority?: 'low' | 'medium' | 'high';
  start_date?: string;
  end_date?: string;
  contract_value?: number;
  milestones?: Array<{
    id?: string;
    title: string;
    status?: 'completed' | 'in_progress' | 'pending' | 'scheduled';
    due_date?: string;
    completed_date?: string;
  }>;
  budget?: {
    total_allocated?: number;
    total_spent?: number;
  };
  [key: string]: any;
}

export interface ProjectsListResponse {
  items: Project[];
  total: number;
  page: number;
  size: number;
}

class ProjectsApi {
  private basePath = '/projects';

  async list(params?: {
    page?: number;
    size?: number;
    status?: string;
    phase?: string;
    priority?: string;
    account?: string;
    search?: string;
  }): Promise<ProjectsListResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.size) queryParams.append('size', params.size.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.phase) queryParams.append('phase', params.phase);
      if (params?.priority) queryParams.append('priority', params.priority);
      if (params?.account) queryParams.append('account', params.account);
      if (params?.search) queryParams.append('search', params.search);

      const response = await apiClient.get(`${this.basePath}?${queryParams.toString()}`);
      const data = response.data?.data || response.data;
      
      if (Array.isArray(data)) {
        return {
          items: data,
          total: data.length,
          page: params?.page || 1,
          size: params?.size || 10,
        };
      }
      
      if (data?.items && typeof data.total === 'number') {
        return data;
      }
      
      return {
        items: data?.items || [],
        total: data?.total || data?.count || 0,
        page: data?.page || params?.page || 1,
        size: data?.size || data?.limit || params?.size || 10,
      };
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 501) {
        return {
          items: [],
          total: 0,
          page: params?.page || 1,
          size: params?.size || 10,
        };
      }
      throw error;
    }
  }

  async get(id: string): Promise<Project> {
    try {
      const response = await apiClient.get(`${this.basePath}/${id}`);
      return response.data?.data || response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Project with ID ${id} not found`);
      }
      throw error;
    }
  }

  async create(data: ProjectCreateRequest): Promise<Project> {
    try {
      const response = await apiClient.post(this.basePath, data);
      return response.data?.data || response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'Invalid project data';
        throw new Error(errorMsg);
      }
      throw error;
    }
  }

  async update(id: string, data: ProjectUpdateRequest): Promise<Project> {
    try {
      const response = await apiClient.put(`${this.basePath}/${id}`, data);
      return response.data?.data || response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Project with ID ${id} not found`);
      }
      if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'Invalid update data';
        throw new Error(errorMsg);
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }

  async archive(id: string): Promise<Project> {
    const response = await apiClient.put(`${this.basePath}/${id}`, { status: 'cancelled' });
    return response.data?.data || response.data;
  }
}

export const projectsApi = new ProjectsApi();

