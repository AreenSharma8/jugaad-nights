import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  Inject,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Order, OrderItem, Payment } from './entities';
import { CreateOrderDto, CreatePaymentDto, SalesAnalyticsDto } from './dto/sales.dto';
import { SalesRepository } from './repositories/sales.repository';
import { RedisService } from '../../services/redis.service';

@Injectable()
export class SalesService {
  private readonly logger = new Logger(SalesService.name);
  private readonly salesRepository: SalesRepository;

  constructor(
    private dataSource: DataSource,
    private redisService: RedisService,
  ) {
    this.salesRepository = new SalesRepository(dataSource);
  }

  async createOrder(createOrderDto: CreateOrderDto, created_by: string): Promise<Order> {
    const order = this.salesRepository.create({
      outlet_id: createOrderDto.outlet_id,
      order_type: createOrderDto.order_type,
      customer_info: createOrderDto.customer_info,
      status: 'pending',
      created_by,
      updated_by: created_by,
    });

    // Calculate totals
    const itemsRepository = this.dataSource.getRepository(OrderItem);
    const items = createOrderDto.items.map((item) =>
      itemsRepository.create({
        ...item,
        total_price: item.quantity * item.unit_price,
        created_by,
        updated_by: created_by,
      }),
    );

    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.total_price as any), 0);
    const discountAmount = createOrderDto.discount_amount || 0;
    const taxAmount = subtotal * 0.05; // 5% tax
    const totalAmount = subtotal - discountAmount + taxAmount;

    order.items = items;
    order.total_amount = totalAmount as any;
    order.tax_amount = taxAmount as any;
    order.discount_amount = discountAmount as any;

    return this.salesRepository.save(order);
  }

  async getOrdersBySales(outlet_id: string): Promise<Order[]> {
    return this.salesRepository.findByOutlet(outlet_id);
  }

  async getOrderById(id: string): Promise<Order> {
    const order = await this.salesRepository.findByIdWithRelations(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async addPayment(createPaymentDto: CreatePaymentDto, created_by: string): Promise<Payment> {
    const order = await this.getOrderById(createPaymentDto.order_id);

    const paymentsRepository = this.dataSource.getRepository(Payment);
    const payment = paymentsRepository.create({
      order_id: createPaymentDto.order_id,
      payment_method: createPaymentDto.payment_method,
      amount: createPaymentDto.amount,
      transaction_id: createPaymentDto.transaction_id,
      payment_details: createPaymentDto.payment_details,
      status: 'completed',
      created_by,
      updated_by: created_by,
    });

    return paymentsRepository.save(payment);
  }

  async getSalesTrends(analyticsDto: SalesAnalyticsDto): Promise<any> {
    const cacheKey = `sales:trends:${analyticsDto.outlet_id}:${analyticsDto.date || 'today'}`;
    
    // Check cache first
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const orders = await this.salesRepository.findByOutlet(analyticsDto.outlet_id);
    
    const analytics = {
      total_orders: orders.length,
      total_revenue: orders.reduce((sum, order) => sum + parseFloat(order.total_amount as any), 0),
      average_order_value: orders.length > 0 
        ? orders.reduce((sum, order) => sum + parseFloat(order.total_amount as any), 0) / orders.length
        : 0,
      payment_methods: this.aggregatePaymentMethods(orders),
      top_items: this.getTopItems(orders),
    };

    // Cache for 5 minutes
    await this.redisService.set(cacheKey, JSON.stringify(analytics), 300);

    return analytics;
  }

  private aggregatePaymentMethods(orders: Order[]): Record<string, number> {
    const methods: Record<string, number> = {};
    orders.forEach((order) => {
      order.payments?.forEach((payment) => {
        methods[payment.payment_method] = (methods[payment.payment_method] || 0) + 1;
      });
    });
    return methods;
  }

  private getTopItems(orders: Order[]): any[] {
    const itemMap: Record<string, any> = {};
    orders.forEach((order) => {
      order.items?.forEach((item) => {
        if (!itemMap[item.item_name]) {
          itemMap[item.item_name] = { name: item.item_name, count: 0, revenue: 0 };
        }
        itemMap[item.item_name].count += item.quantity;
        itemMap[item.item_name].revenue += parseFloat(item.total_price as any);
      });
    });

    return Object.values(itemMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }
}
