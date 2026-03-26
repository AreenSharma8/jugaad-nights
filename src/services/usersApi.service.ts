/**
 * Users API Service
 */

import { apiClient } from './api.client';

export interface UserData {
  id: string;
  email: string;
  name: string;
  phone: string;
  outlet_id: string;
  role: string;
  roles: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserDto {
  email: string;
  name: string;
  phone: string;
  outlet_id: string;
  role: string;
  password: string;
}

export interface UpdateUserDto {
  name?: string;
  phone?: string;
  outlet_id?: string;
  role?: string;
}

export const usersApi = {
  /**
   * Get all users
   */
  getAll: async (query?: { outlet_id?: string; role?: string }): Promise<UserData[]> => {
    const params = new URLSearchParams();
    if (query?.outlet_id) params.append('outlet_id', query.outlet_id);
    if (query?.role) params.append('role', query.role);

    return apiClient.get<UserData[]>(`/users?${params.toString()}`);
  },

  /**
   * Get user by ID
   */
  getById: async (id: string): Promise<UserData> => {
    return apiClient.get<UserData>(`/users/${id}`);
  },

  /**
   * Create new user
   */
  create: async (data: CreateUserDto): Promise<UserData> => {
    return apiClient.post<UserData>('/users', data);
  },

  /**
   * Update user
   */
  update: async (id: string, data: UpdateUserDto): Promise<UserData> => {
    return apiClient.patch<UserData>(`/users/${id}`, data);
  },

  /**
   * Delete user
   */
  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/users/${id}`);
  },

  /**
   * Assign roles to user
   */
  assignRoles: async (userId: string, roles: string[]): Promise<UserData> => {
    return apiClient.post<UserData>(`/users/${userId}/roles`, { roles });
  },
};

export default usersApi;
