import api from './api';
import type { Page, PageCreateInput, ApiResponse } from '@groop/shared';

export const pageService = {
  async getByWorkspace(workspaceId: string): Promise<Page[]> {
    const response = await api.get<ApiResponse<Page[]>>(`/pages?workspaceId=${workspaceId}`);
    return response.data.data || [];
  },

  async getById(id: string): Promise<Page> {
    const response = await api.get<ApiResponse<Page>>(`/pages/${id}`);
    return response.data.data!;
  },

  async create(data: PageCreateInput): Promise<Page> {
    const response = await api.post<ApiResponse<Page>>('/pages', data);
    return response.data.data!;
  },

  async update(id: string, content: any): Promise<Page> {
    const response = await api.put<ApiResponse<Page>>(`/pages/${id}`, { content });
    return response.data.data!;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/pages/${id}`);
  },
};



