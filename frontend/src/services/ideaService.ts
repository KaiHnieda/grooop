import api from './api';
import type { Idea, IdeaCreateInput, ApiResponse } from '@groop/shared';

export const ideaService = {
  async getAll(): Promise<Idea[]> {
    const response = await api.get<ApiResponse<Idea[]>>('/ideas');
    return response.data.data || [];
  },

  async create(data: IdeaCreateInput): Promise<Idea> {
    const response = await api.post<ApiResponse<Idea>>('/ideas', data);
    return response.data.data!;
  },

  async update(id: string, data: Partial<IdeaCreateInput>): Promise<Idea> {
    const response = await api.put<ApiResponse<Idea>>(`/ideas/${id}`, data);
    return response.data.data!;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/ideas/${id}`);
  },
};



