/**
 * Sales API Service
 */

import { apiClient } from './api.client';

export interface OrderData {
  id: string;
  outlet_id: string;
  order_number: string;
  customer_name?: string;
  customer_phone?: string;
  order_type: 'Dine In' | 'Pick Up' | 'Delivery';
  payment_type: 'Cash' | 'Card' | 'Online' | 'Other' | 'Part Payment';
  order_from: string;
  order_from_id?: string;
  sub_order_type?: string;
  status: 'Success' | 'Cancelled' | 'Pending';
  total_amount: number;
  tax_amount: number;
  discount_amount: number;
  net_amount: number;
  items: OrderItem[];
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  amount: number;
  item_id?: string;
}

export interface SalesQuery {
  outlet_id?: string;
  start_date?: string;
  end_date?: string;
  status?: 'Success' | 'Cancelled' | 'Pending';
  order_type?: string;
  payment_type?: string;
  limit?: number;
  offset?: number;
}

export interface SalesTrends {
  total_sales: number;
  total_orders: number;
  average_order_value: number;
  payment_breakdown: { [key: string]: number };
  order_type_breakdown: { [key: string]: number };
  hourly_sales?: { hour: string; sales: number }[];
  daily_sales?: { date: string; sales: number }[];
}

export interface SalesDashboard {
  today_sales: number;
  today_orders: number;
  this_month_sales: number;
  this_month_orders: number;
  average_order_value: number;
  top_items: Array<{ item_name: string; quantity: number; revenue: number }>;
  sales_by_outlet: Array<{ outlet_name: string; sales: number }>;
}

export const salesApi = {
  /**
   * Get sales data with optional filters
   */
  getSales: async (query?: SalesQuery): Promise<OrderData[]> => {
    const params = new URLSearchParams();
    if (query?.outlet_id) params.append('outlet_id', query.outlet_id);
    if (query?.start_date) params.append('start_date', query.start_date);
    if (query?.end_date) params.append('end_date', query.end_date);
    if (query?.status) params.append('status', query.status);
    if (query?.order_type) params.append('order_type', query.order_type);
    if (query?.payment_type) params.append('payment_type', query.payment_type);
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.offset) params.append('offset', query.offset.toString());

    return apiClient.get<OrderData[]>(`/sales?${params.toString()}`);
  },

  /**
   * Get sales trends
   */
  getTrends: async (outletId: string, days?: number): Promise<SalesTrends> => {
    return apiClient.get<SalesTrends>(
      `/sales/trends?outlet_id=${outletId}${days ? `&days=${days}` : ''}`
    );
  },

  /**
   * Get sales dashboard
   */
  getDashboard: async (outletId?: string): Promise<SalesDashboard> => {
    return apiClient.get<SalesDashboard>(
      `/sales/dashboard${outletId ? `?outlet_id=${outletId}` : ''}`
    );
  },

  /**
   * Get order by ID
   */
  getOrderById: async (orderId: string): Promise<OrderData> => {
    return apiClient.get<OrderData>(`/sales/orders/${orderId}`);
  },

  /**
   * Create new order
   */
  createOrder: async (data: Omit<OrderData, 'id' | 'created_at' | 'updated_at'>): Promise<OrderData> => {
    return apiClient.post<OrderData>('/sales/orders', data);
  },

  /**
   * Update order
   */
  updateOrder: async (orderId: string, data: Partial<OrderData>): Promise<OrderData> => {
    return apiClient.patch<OrderData>(`/sales/orders/${orderId}`, data);
  },

  /**
   * Cancel order
   */
  cancelOrder: async (orderId: string, reason?: string): Promise<OrderData> => {
    return apiClient.patch<OrderData>(`/sales/orders/${orderId}`, {
      status: 'Cancelled',
      cancellation_reason: reason,
    });
  },
};

export default salesApi;
