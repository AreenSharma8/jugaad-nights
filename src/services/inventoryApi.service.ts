/**
 * Inventory API Service
 */

import { apiClient } from './api.client';

export interface InventoryItem {
  id: string;
  outlet_id: string;
  item_name: string;
  item_code?: string;
  category: string;
  current_quantity: number;
  unit: string;
  reorder_level: number;
  reorder_quantity: number;
  unit_cost: number;
  supplier_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface InventoryTransaction {
  id: string;
  item_id: string;
  transaction_type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reference_id?: string;
  notes?: string;
  created_at?: string;
}

export interface LowStockAlert {
  item_id: string;
  item_name: string;
  current_quantity: number;
  reorder_level: number;
  unit: string;
  outlet_id: string;
}

export interface CreateInventoryItemDto {
  item_name: string;
  item_code?: string;
  category: string;
  current_quantity: number;
  unit: string;
  reorder_level: number;
  reorder_quantity: number;
  unit_cost: number;
  supplier_id?: string;
}

export interface UpdateInventoryItemDto {
  item_name?: string;
  category?: string;
  reorder_level?: number;
  reorder_quantity?: number;
  unit_cost?: number;
  supplier_id?: string;
}

export const inventoryApi = {
  /**
   * Get all inventory items
   */
  getAll: async (outletId?: string): Promise<InventoryItem[]> => {
    return apiClient.get<InventoryItem[]>(
      `/inventory${outletId ? `?outlet_id=${outletId}` : ''}`
    );
  },

  /**
   * Get inventory item by ID
   */
  getById: async (id: string): Promise<InventoryItem> => {
    return apiClient.get<InventoryItem>(`/inventory/${id}`);
  },

  /**
   * Create inventory item
   */
  create: async (data: CreateInventoryItemDto): Promise<InventoryItem> => {
    return apiClient.post<InventoryItem>('/inventory', data);
  },

  /**
   * Update inventory item
   */
  update: async (id: string, data: UpdateInventoryItemDto): Promise<InventoryItem> => {
    return apiClient.patch<InventoryItem>(`/inventory/${id}`, data);
  },

  /**
   * Update stock quantity
   */
  updateStock: async (
    id: string,
    quantity: number,
    type: 'IN' | 'OUT' | 'ADJUSTMENT' = 'ADJUSTMENT',
    notes?: string
  ): Promise<InventoryItem> => {
    return apiClient.patch<InventoryItem>(`/inventory/${id}/stock`, {
      quantity,
      type,
      notes,
    });
  },

  /**
   * Get low stock alerts
   */
  getLowStockAlerts: async (outletId?: string): Promise<LowStockAlert[]> => {
    return apiClient.get<LowStockAlert[]>(
      `/inventory/low-stock${outletId ? `?outlet_id=${outletId}` : ''}`
    );
  },

  /**
   * Get inventory transactions
   */
  getTransactions: async (itemId: string, limit?: number): Promise<InventoryTransaction[]> => {
    return apiClient.get<InventoryTransaction[]>(
      `/inventory/${itemId}/transactions${limit ? `?limit=${limit}` : ''}`
    );
  },

  /**
   * Delete inventory item
   */
  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/inventory/${id}`);
  },
};

export default inventoryApi;
