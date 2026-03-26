/**
 * Party Orders API Service
 */

import { apiClient } from './api.client';

export interface PartyOrder {
  id: string;
  outlet_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  event_date: string;
  event_type: string;
  number_of_guests: number;
  order_status: 'Enquiry' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';
  total_amount: number;
  advance_paid: number;
  balance_amount: number;
  menu_items: PartyOrderItem[];
  special_requirements?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PartyOrderItem {
  id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface CreatePartyOrderDto {
  outlet_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  event_date: string;
  event_type: string;
  number_of_guests: number;
  total_amount: number;
  advance_paid: number;
  menu_items: Array<{ item_name: string; quantity: number; unit_price: number }>;
  special_requirements?: string;
}

export interface UpdatePartyOrderDto {
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  event_date?: string;
  number_of_guests?: number;
  total_amount?: number;
  advance_paid?: number;
  order_status?: string;
  special_requirements?: string;
}

export interface PartyOrderQuery {
  outlet_id?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export const partyOrdersApi = {
  /**
   * Get all party orders
   */
  getAll: async (query?: PartyOrderQuery): Promise<PartyOrder[]> => {
    const params = new URLSearchParams();
    if (query?.outlet_id) params.append('outlet_id', query.outlet_id);
    if (query?.status) params.append('status', query.status);
    if (query?.start_date) params.append('start_date', query.start_date);
    if (query?.end_date) params.append('end_date', query.end_date);
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.offset) params.append('offset', query.offset.toString());

    return apiClient.get<PartyOrder[]>(`/party-orders?${params.toString()}`);
  },

  /**
   * Get party order by ID
   */
  getById: async (id: string): Promise<PartyOrder> => {
    return apiClient.get<PartyOrder>(`/party-orders/${id}`);
  },

  /**
   * Create party order
   */
  create: async (data: CreatePartyOrderDto): Promise<PartyOrder> => {
    return apiClient.post<PartyOrder>('/party-orders', data);
  },

  /**
   * Update party order
   */
  update: async (id: string, data: UpdatePartyOrderDto): Promise<PartyOrder> => {
    return apiClient.patch<PartyOrder>(`/party-orders/${id}`, data);
  },

  /**
   * Update order status
   */
  updateStatus: async (id: string, status: string): Promise<PartyOrder> => {
    return apiClient.patch<PartyOrder>(`/party-orders/${id}`, { order_status: status });
  },

  /**
   * Record advance payment
   */
  recordPayment: async (id: string, amount: number, reference?: string): Promise<PartyOrder> => {
    return apiClient.post<PartyOrder>(`/party-orders/${id}/payment`, {
      amount,
      reference,
    });
  },

  /**
   * Get upcoming party orders
   */
  getUpcoming: async (outletId: string, days?: number): Promise<PartyOrder[]> => {
    return apiClient.get<PartyOrder[]>(
      `/party-orders/upcoming?outlet_id=${outletId}${days ? `&days=${days}` : ''}`
    );
  },

  /**
   * Delete party order
   */
  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/party-orders/${id}`);
  },
};

export default partyOrdersApi;
