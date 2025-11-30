import api from './api';
import type { ApiResponse } from '../types';

export interface RecentActivity {
  id: string;
  userId: string;
  type: 'page' | 'workspace';
  entityId: string;
  entityName: string;
  createdAt: Date;
}

export const recentActivityService = {
  async getAll(): Promise<RecentActivity[]> {
    const response = await api.get<ApiResponse<RecentActivity[]>>('/recent-activity');
    return response.data.data || [];
  },
};



