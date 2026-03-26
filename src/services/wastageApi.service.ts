/**
 * Wastage API Service
 */

import { apiClient } from './api.client';

export interface WastageEntry {
  id: string;
  outlet_id: string;
  item_id: string;
  item_name: string;
  quantity_wasted: number;
  unit: string;
  unit_cost: number;
  total_cost: number;
  reason: string;
  reported_by: string;
  created_at?: string;
  updated_at?: string;
}

export interface WastageAnalytics {
  total_wastage_quantity: number;
  total_wastage_cost: number;
  wastage_percentage: number;
  by_reason: { [key: string]: { quantity: number; cost: number } };
  by_item: Array<{ item_name: string; quantity: number; cost: number }>;
  daily_wastage?: Array<{ date: string; quantity: number; cost: number }>;
}

export interface CreateWastageDto {
  item_id: string;
  quantity_wasted: number;
  unit: string;
  unit_cost: number;
  reason: string;
}

export interface WastageQuery {
  outlet_id?: string;
  start_date?: string;
  end_date?: string;
  reason?: string;
  limit?: number;
  offset?: number;
}

export const wastageApi = {
  /**
   * Get wastage entries
   */
  getAll: async (query?: WastageQuery): Promise<WastageEntry[]> => {
    const params = new URLSearchParams();
    if (query?.outlet_id) params.append('outlet_id', query.outlet_id);
    if (query?.start_date) params.append('start_date', query.start_date);
    if (query?.end_date) params.append('end_date', query.end_date);
    if (query?.reason) params.append('reason', query.reason);
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.offset) params.append('offset', query.offset.toString());

    return apiClient.get<WastageEntry[]>(`/wastage?${params.toString()}`);
  },

  /**
   * Get wastage entry by ID
   */
  getById: async (id: string): Promise<WastageEntry> => {
    return apiClient.get<WastageEntry>(`/wastage/${id}`);
  },

  /**
   * Create wastage entry
   */
  create: async (data: CreateWastageDto): Promise<WastageEntry> => {
    return apiClient.post<WastageEntry>('/wastage', data);
  },

  /**
   * Get wastage analytics
   */
  getAnalytics: async (outletId: string, days?: number): Promise<WastageAnalytics> => {
    return apiClient.get<WastageAnalytics>(
      `/wastage/analytics?outlet_id=${outletId}${days ? `&days=${days}` : ''}`
    );
  },

  /**
   * Delete wastage entry
   */
  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/wastage/${id}`);
  },
};

export default wastageApi;
