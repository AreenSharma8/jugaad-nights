import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../services/redis.service';

export interface DashboardMetrics {
  outlet_id: string;
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  payment_methods: Record<string, number>;
  top_items: Array<{ name: string; quantity: number; revenue: number }>;
  inventory_health: {
    total_items: number;
    low_stock_items: number;
    inventory_value: number;
  };
  staffing: {
    checkins_today: number;
    average_hours: number;
  };
  wastage: {
    total_cost: number;
    total_entries: number;
  };
}

export interface OutletComparison {
  date: Date;
  outlets: Array<{
    outlet_id: string;
    outlet_name: string;
    orders: number;
    revenue: number;
    average_order_value: number;
  }>;
  best_performer: string;
  total_network_revenue: number;
}

export interface SalesTrend {
  date: string;
  orders: number;
  revenue: number;
  average_order_value: number;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private readonly CACHE_TTL = 5 * 60; // 5 minutes

  constructor(private redisService: RedisService) {}

  async getDashboardMetrics(outlet_id: string, forceRefresh: boolean = false): Promise<DashboardMetrics> {
    const cacheKey = `dashboard:${outlet_id}:${new Date().toISOString().split('T')[0]}`;

    // Check cache first
    if (!forceRefresh) {
      const cachedData = await this.redisService.get(cacheKey);
      if (cachedData) {
        this.logger.debug(`Dashboard metrics retrieved from cache for outlet: ${outlet_id}`);
        return JSON.parse(cachedData);
      }
    }

    // TODO: Aggregate data from:
    // - SalesService: total_orders, total_revenue, average_order_value, payment_methods, top_items
    // - InventoryService: total_items, low_stock_items, inventory_value
    // - AttendanceService: checkins_today, average_hours
    // - WastageService: total_cost, total_entries

    const metrics: DashboardMetrics = {
      outlet_id,
      total_orders: 0,
      total_revenue: 0,
      average_order_value: 0,
      payment_methods: {},
      top_items: [],
      inventory_health: {
        total_items: 0,
        low_stock_items: 0,
        inventory_value: 0,
      },
      staffing: {
        checkins_today: 0,
        average_hours: 0,
      },
      wastage: {
        total_cost: 0,
        total_entries: 0,
      },
    };

    // Cache the results
    await this.redisService.set(cacheKey, JSON.stringify(metrics), this.CACHE_TTL);

    return metrics;
  }

  async getOutletComparison(outlet_ids: string[]): Promise<OutletComparison> {
    const cacheKey = `comparison:${outlet_ids.sort().join(':')}:${new Date().toISOString().split('T')[0]}`;

    // Check cache
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      this.logger.debug('Outlet comparison retrieved from cache');
      return JSON.parse(cachedData);
    }

    // TODO: Fetch metrics for each outlet_id and compare
    // - Calculate total_network_revenue
    // - Identify best_performer (highest revenue)

    const comparison: OutletComparison = {
      date: new Date(),
      outlets: outlet_ids.map((id) => ({
        outlet_id: id,
        outlet_name: '',
        orders: 0,
        revenue: 0,
        average_order_value: 0,
      })),
      best_performer: outlet_ids[0],
      total_network_revenue: 0,
    };

    // Cache results
    await this.redisService.set(cacheKey, JSON.stringify(comparison), this.CACHE_TTL);

    return comparison;
  }

  async getSalesTrends(
    outlet_id: string,
    period: 'daily' | 'weekly' | 'monthly' = 'daily',
    days: number = 30,
  ): Promise<SalesTrend[]> {
    const cacheKey = `trends:${outlet_id}:${period}:${days}`;

    // Check cache
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      this.logger.debug(`Sales trends retrieved from cache for outlet: ${outlet_id}`);
      return JSON.parse(cachedData);
    }

    // TODO: Calculate trends from orders table
    // - Group by date (or week/month based on period)
    // - Sum orders, revenues
    // - Calculate average order value

    const trends: SalesTrend[] = [];

    for (let i = days; i > 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      trends.push({
        date: date.toISOString().split('T')[0],
        orders: 0,
        revenue: 0,
        average_order_value: 0,
      });
    }

    // Cache results
    await this.redisService.set(cacheKey, JSON.stringify(trends), this.CACHE_TTL);

    return trends;
  }

  async getRevenueByPaymentMethod(outlet_id: string): Promise<Record<string, number>> {
    const cacheKey = `payment_methods:${outlet_id}:${new Date().toISOString().split('T')[0]}`;

    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // TODO: Query payments grouped by payment_method and sum amounts

    const data: Record<string, number> = {
      cash: 0,
      card: 0,
      upi: 0,
      online: 0,
    };

    await this.redisService.set(cacheKey, JSON.stringify(data), this.CACHE_TTL);

    return data;
  }

  async getTopSellingItems(outlet_id: string, limit: number = 10): Promise<Array<{
    item_name: string;
    quantity_sold: number;
    revenue: number;
    average_price: number;
  }>> {
    const cacheKey = `top_items:${outlet_id}:${limit}`;

    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // TODO: Query order_items grouped by item_name, ordered by sum(total_price) DESC, limit

    const items = [];

    await this.redisService.set(cacheKey, JSON.stringify(items), this.CACHE_TTL);

    return items;
  }

  async getInventoryHealthScore(outlet_id: string): Promise<{
    score: number;
    status: 'healthy' | 'warning' | 'critical';
    total_items: number;
    low_stock_items: number;
    out_of_stock_items: number;
    inventory_turnover: number;
  }> {
    const cacheKey = `inventory_health:${outlet_id}`;

    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // TODO: Calculate health score based on:
    // - % of items with low stock
    // - % of items out of stock
    // - Inventory turnover rate

    const health = {
      score: 100,
      status: 'healthy' as const,
      total_items: 0,
      low_stock_items: 0,
      out_of_stock_items: 0,
      inventory_turnover: 0,
    };

    await this.redisService.set(cacheKey, JSON.stringify(health), this.CACHE_TTL);

    return health;
  }

  async clearDashboardCache(outlet_id: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `dashboard:${outlet_id}:${today}`;
    await this.redisService.del(cacheKey);
    this.logger.log(`Dashboard cache cleared for outlet: ${outlet_id}`);
  }

  async clearAllAnalyticsCaches(): Promise<void> {
    // TODO: Implement cache invalidation strategy
    this.logger.log('All analytics caches cleared');
  }
}
