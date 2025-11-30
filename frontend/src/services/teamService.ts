import api from './api';
import type { Team, TeamCreateInput, ApiResponse } from '@groop/shared';

export const teamService = {
  async getAll(): Promise<Team[]> {
    const response = await api.get<ApiResponse<Team[]>>('/teams');
    return response.data.data || [];
  },

  async getById(id: string): Promise<Team> {
    const response = await api.get<ApiResponse<Team>>(`/teams/${id}`);
    return response.data.data!;
  },

  async create(data: TeamCreateInput): Promise<Team> {
    const response = await api.post<ApiResponse<Team>>('/teams', data);
    return response.data.data!;
  },

  async update(id: string, data: Partial<TeamCreateInput>): Promise<Team> {
    const response = await api.put<ApiResponse<Team>>(`/teams/${id}`, data);
    return response.data.data!;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/teams/${id}`);
  },

  async addMember(teamId: string, email: string): Promise<any> {
    const response = await api.post<ApiResponse<any>>(`/teams/${teamId}/members`, { email });
    return response.data.data!;
  },

  async removeMember(teamId: string, userId: string): Promise<void> {
    await api.delete(`/teams/${teamId}/members/${userId}`);
  },
};


