import api from './api';
import type { Workspace, WorkspaceCreateInput, ApiResponse } from '@groop/shared';

export const workspaceService = {
  async getAll(): Promise<Workspace[]> {
    const response = await api.get<ApiResponse<Workspace[]>>('/workspaces');
    return response.data.data || [];
  },

  async getById(id: string): Promise<Workspace> {
    const response = await api.get<ApiResponse<Workspace>>(`/workspaces/${id}`);
    return response.data.data!;
  },

  async create(data: WorkspaceCreateInput): Promise<Workspace> {
    const response = await api.post<ApiResponse<Workspace>>('/workspaces', data);
    return response.data.data!;
  },

  async update(id: string, data: Partial<WorkspaceCreateInput>): Promise<Workspace> {
    const response = await api.put<ApiResponse<Workspace>>(`/workspaces/${id}`, data);
    return response.data.data!;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/workspaces/${id}`);
  },
};



