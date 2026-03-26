/**
 * Dashboard API Service
 */

import { apiClient } from './api.client';

export interface DashboardMetrics {
  today_sales: number;
  today_orders: number;
  today_customers: number;
  this_month_sales: number;
  this_month_orders: number;
  average_order_value: number;
  total_outlets: number;
  active_staff: number;
}

export interface KeyMetric {
  label: string;
  value: number;
  unit: string;
  trend?: 'up' | 'down' | 'neutral';
  trend_percentage?: number;
}

export interface TopItem {
  item_name: string;
  quantity: number;
  revenue: number;
}

export interface OutletPerformance {
  outlet_name: string;
  outlet_id: string;
  sales: number;
  orders: number;
  customers: number;
  average_order_value: number;
}

export interface SalesChart {
  date: string;
  sales: number;
  orders: number;
}

export interface PaymentBreakdown {
  payment_type: string;
  amount: number;
  percentage: number;
  order_count: number;
}

export interface OrderTypeBreakdown {
  order_type: string;
  count: number;
  sales: number;
  percentage: number;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  key_metrics: KeyMetric[];
  top_selling_items: TopItem[];
  outlet_performance: OutletPerformance[];
  sales_chart: SalesChart[];
  payment_breakdown: PaymentBreakdown[];
  order_type_breakdown: OrderTypeBreakdown[];
  recent_orders?: Array<{ id: string; outlet: string; amount: number; created_at: string }>;
}

export interface DashboardQuery {
  outlet_id?: string;
  start_date?: string;
  end_date?: string;
}

export const dashboardApi = {
  /**
   * Get complete dashboard data
   */
  getDashboard: async (query?: DashboardQuery): Promise<DashboardData> => {
    const params = new URLSearchParams();
    if (query?.outlet_id) params.append('outlet_id', query.outlet_id);
    if (query?.start_date) params.append('start_date', query.start_date);
    if (query?.end_date) params.append('end_date', query.end_date);

    return apiClient.get<DashboardData>(`/dashboard?${params.toString()}`);
  },

  /**
   * Get key metrics
   */
  getMetrics: async (query?: DashboardQuery): Promise<DashboardMetrics> => {
    const params = new URLSearchParams();
    if (query?.outlet_id) params.append('outlet_id', query.outlet_id);
    if (query?.start_date) params.append('start_date', query.start_date);
    if (query?.end_date) params.append('end_date', query.end_date);

    return apiClient.get<DashboardMetrics>(`/dashboard/metrics?${params.toString()}`);
  },

  /**
   * Get sales chart data
   */
  getSalesChart: async (
    days?: number,
    outletId?: string
  ): Promise<SalesChart[]> => {
    const params = new URLSearchParams();
    if (days) params.append('days', days.toString());
    if (outletId) params.append('outlet_id', outletId);

    return apiClient.get<SalesChart[]>(`/dashboard/sales-chart?${params.toString()}`);
  },

  /**
   * Get outlet performance
   */
  getOutletPerformance: async (): Promise<OutletPerformance[]> => {
    return apiClient.get<OutletPerformance[]>('/dashboard/outlet-performance');
  },

  /**
   * Get payment breakdown
   */
  getPaymentBreakdown: async (outletId?: string): Promise<PaymentBreakdown[]> => {
    return apiClient.get<PaymentBreakdown[]>(
      `/dashboard/payment-breakdown${outletId ? `?outlet_id=${outletId}` : ''}`
    );
  },

  /**
   * Get order type breakdown
   */
  getOrderTypeBreakdown: async (outletId?: string): Promise<OrderTypeBreakdown[]> => {
    return apiClient.get<OrderTypeBreakdown[]>(
      `/dashboard/order-type-breakdown${outletId ? `?outlet_id=${outletId}` : ''}`
    );
  },
};

export default dashboardApi;
