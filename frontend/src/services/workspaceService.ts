import api from './api';
import type { Workspace, WorkspaceCreateInput, ApiResponse } from '../types';

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

  async addMember(workspaceId: string, email: string): Promise<any> {
    const response = await api.post<ApiResponse<any>>(`/workspaces/${workspaceId}/members`, { email });
    return response.data.data!;
  },

  async removeMember(workspaceId: string, userId: string): Promise<void> {
    await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
  },

  async getRecent(): Promise<{ lastAccessed: Workspace[]; newest: Workspace[] }> {
    const response = await api.get<ApiResponse<{ lastAccessed: Workspace[]; newest: Workspace[] }>>('/workspaces/recent');
    return response.data.data!;
  },
};



