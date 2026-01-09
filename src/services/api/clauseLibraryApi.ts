import { apiClient } from './client';

export interface ClauseLibraryItem {
  id: string;
  title: string;
  category: string;
  clause_text: string;
  acceptable_alternatives: string[];
  fallback_positions: string[];
  risk_level: 'preferred' | 'acceptable' | 'fallback';
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  version?: number;
}

export interface ClauseCategory {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
}

export interface ClauseLibraryCreateRequest {
  title: string;
  category: string;
  clause_text: string;
  acceptable_alternatives?: string[];
  fallback_positions?: string[];
  risk_level?: 'preferred' | 'acceptable' | 'fallback';
}

export interface ClauseLibraryUpdateRequest {
  title?: string;
  category?: string;
  clause_text?: string;
  acceptable_alternatives?: string[];
  fallback_positions?: string[];
  risk_level?: 'preferred' | 'acceptable' | 'fallback';
}

export interface ClauseLibraryListResponse {
  items: ClauseLibraryItem[];
  total: number;
  page: number;
  size: number;
}

class ClauseLibraryApi {
  private basePath = '/contracts/clauses';

  async list(params?: {
    page?: number;
    size?: number;
    category?: string;
    search?: string;
  }): Promise<ClauseLibraryListResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.size) queryParams.append('size', params.size.toString());
      if (params?.category) queryParams.append('category', params.category);
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

  async get(id: string): Promise<ClauseLibraryItem> {
    try {
      const response = await apiClient.get(`${this.basePath}/${id}`);
      return response.data?.data || response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Clause with ID ${id} not found`);
      }
      throw error;
    }
  }

  async create(data: ClauseLibraryCreateRequest): Promise<ClauseLibraryItem> {
    try {
      const response = await apiClient.post(this.basePath, data);
      return response.data?.data || response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'Invalid clause data';
        throw new Error(errorMsg);
      }
      throw error;
    }
  }

  async update(id: string, data: ClauseLibraryUpdateRequest): Promise<ClauseLibraryItem> {
    try {
      const response = await apiClient.put(`${this.basePath}/${id}`, data);
      return response.data?.data || response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Clause with ID ${id} not found`);
      }
      if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'Invalid update data';
        throw new Error(errorMsg);
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.basePath}/${id}`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Clause with ID ${id} not found`);
      }
      throw error;
    }
  }

  // Get categories
  async getCategories(): Promise<ClauseCategory[]> {
    try {
      const response = await apiClient.get(`${this.basePath}/categories`);
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 501) {
        return [];
      }
      throw error;
    }
  }

  // Create category
  async createCategory(name: string, description?: string): Promise<ClauseCategory> {
    try {
      const response = await apiClient.post(`${this.basePath}/categories`, {
        name,
        description,
      });
      return response.data?.data || response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'Invalid category data';
        throw new Error(errorMsg);
      }
      throw error;
    }
  }
}

export const clauseLibraryApi = new ClauseLibraryApi();

