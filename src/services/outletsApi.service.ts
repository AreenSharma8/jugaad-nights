/**
 * Outlets API Service
 */

import { apiClient } from './api.client';

export interface OutletData {
  id: string;
  name: string;
  address: string;
  phone: string;
  city: string;
  state: string;
  pincode: string;
  manager_id?: string;
  petpooja_id?: string;
  petpooja_token?: string;
  webhook_url?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateOutletDto {
  name: string;
  address: string;
  phone: string;
  city: string;
  state: string;
  pincode: string;
  manager_id?: string;
  petpooja_id?: string;
  petpooja_token?: string;
  webhook_url?: string;
}

export interface UpdateOutletDto {
  name?: string;
  address?: string;
  phone?: string;
  city?: string;
  state?: string;
  pincode?: string;
  manager_id?: string;
  petpooja_id?: string;
  petpooja_token?: string;
  webhook_url?: string;
  is_active?: boolean;
}

export const outletsApi = {
  /**
   * Get all outlets
   */
  getAll: async (): Promise<OutletData[]> => {
    return apiClient.get<OutletData[]>('/outlets');
  },

  /**
   * Get outlet by ID
   */
  getById: async (id: string): Promise<OutletData> => {
    return apiClient.get<OutletData>(`/outlets/${id}`);
  },

  /**
   * Create new outlet
   */
  create: async (data: CreateOutletDto): Promise<OutletData> => {
    return apiClient.post<OutletData>('/outlets', data);
  },

  /**
   * Update outlet
   */
  update: async (id: string, data: UpdateOutletDto): Promise<OutletData> => {
    return apiClient.patch<OutletData>(`/outlets/${id}`, data);
  },

  /**
   * Delete outlet
   */
  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/outlets/${id}`);
  },

  /**
   * Get outlets for current user
   */
  getUserOutlets: async (): Promise<OutletData[]> => {
    return apiClient.get<OutletData[]>('/outlets/user/me');
  },
};

export default outletsApi;
