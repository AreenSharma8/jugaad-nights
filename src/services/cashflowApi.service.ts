/**
 * Cashflow API Service
 */

import { apiClient } from './api.client';

export interface CashflowEntry {
  id: string;
  outlet_id: string;
  entry_type: 'INFLOW' | 'OUTFLOW';
  category: string;
  amount: number;
  description: string;
  payment_method: string;
  reference_id?: string;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

export interface CashflowBalance {
  outlet_id: string;
  opening_balance: number;
  total_inflow: number;
  total_outflow: number;
  closing_balance: number;
  date: string;
}

export interface CashflowAnalytics {
  total_inflow: number;
  total_outflow: number;
  net_cashflow: number;
  inflow_by_category: { [key: string]: number };
  outflow_by_category: { [key: string]: number };
  daily_balance?: Array<{ date: string; balance: number }>;
  cashflow_trend?: Array<{ date: string; inflow: number; outflow: number }>;
}

export interface CreateCashflowDto {
  outlet_id: string;
  entry_type: 'INFLOW' | 'OUTFLOW';
  category: string;
  amount: number;
  description: string;
  payment_method: string;
  reference_id?: string;
}

export interface CashflowQuery {
  outlet_id?: string;
  start_date?: string;
  end_date?: string;
  entry_type?: 'INFLOW' | 'OUTFLOW';
  category?: string;
  limit?: number;
  offset?: number;
}

export const cashflowApi = {
  /**
   * Get cashflow entries
   */
  getAll: async (query?: CashflowQuery): Promise<CashflowEntry[]> => {
    const params = new URLSearchParams();
    if (query?.outlet_id) params.append('outlet_id', query.outlet_id);
    if (query?.start_date) params.append('start_date', query.start_date);
    if (query?.end_date) params.append('end_date', query.end_date);
    if (query?.entry_type) params.append('entry_type', query.entry_type);
    if (query?.category) params.append('category', query.category);
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.offset) params.append('offset', query.offset.toString());

    return apiClient.get<CashflowEntry[]>(`/cashflow?${params.toString()}`);
  },

  /**
   * Get cashflow entry by ID
   */
  getById: async (id: string): Promise<CashflowEntry> => {
    return apiClient.get<CashflowEntry>(`/cashflow/${id}`);
  },

  /**
   * Create cashflow entry
   */
  create: async (data: CreateCashflowDto): Promise<CashflowEntry> => {
    return apiClient.post<CashflowEntry>('/cashflow', data);
  },

  /**
   * Get cashflow balance for a date
   */
  getBalance: async (outletId: string, date: string): Promise<CashflowBalance> => {
    return apiClient.get<CashflowBalance>(`/cashflow/balance?outlet_id=${outletId}&date=${date}`);
  },

  /**
   * Get cashflow analytics
   */
  getAnalytics: async (outletId: string, days?: number): Promise<CashflowAnalytics> => {
    return apiClient.get<CashflowAnalytics>(
      `/cashflow/analytics?outlet_id=${outletId}${days ? `&days=${days}` : ''}`
    );
  },

  /**
   * Update cashflow entry
   */
  update: async (id: string, data: Partial<CashflowEntry>): Promise<CashflowEntry> => {
    return apiClient.patch<CashflowEntry>(`/cashflow/${id}`, data);
  },

  /**
   * Delete cashflow entry
   */
  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/cashflow/${id}`);
  },
};

export default cashflowApi;
