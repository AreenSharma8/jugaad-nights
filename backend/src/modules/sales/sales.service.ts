import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  Inject,
} from '@nestjs/common';
import { DataSource, IsNull } from 'typeorm';
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
    // Build customer_info object
    const customerInfo = {
      ...(createOrderDto.customer_info || {}),
      name: createOrderDto.customer_name || 'Walk-in Customer',
      phone: createOrderDto.customer_phone || 'N/A',
    };

    // Get today's date in IST
    const today = new Date();
    const istDate = new Date(today.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
    const orderDateStr = istDate.toISOString().split('T')[0];

    // Get sequential order number for today
    const ordersRepository = this.dataSource.getRepository(Order);
    const todayOrderCount = await ordersRepository.count({
      where: {
        outlet_id: createOrderDto.outlet_id,
        order_date: orderDateStr,
        deleted_at: IsNull(),
      },
    });
    const orderNumber = todayOrderCount + 1;

    // Calculate totals FIRST
    const itemsRepository = this.dataSource.getRepository(OrderItem);
    const itemTotals = createOrderDto.items.map((item) => ({
      ...item,
      total_price: item.quantity * item.unit_price,
    }));

    const subtotal = itemTotals.reduce((sum, item) => sum + item.total_price, 0);
    const discountAmount = createOrderDto.discount_amount || 0;
    const taxAmount = subtotal * 0.05; // 5% GST
    const totalAmount = subtotal - discountAmount + taxAmount;

    // 🔥 Step 1: Create and SAVE ORDER FIRST (without items)
    const order = this.salesRepository.create({
      outlet_id: createOrderDto.outlet_id,
      order_type: createOrderDto.order_type || 'Dine In',
      payment_type: createOrderDto.payment_type || 'Cash',
      customer_info: customerInfo,
      status: 'pending',
      order_number: orderNumber,
      order_date: orderDateStr,
      total_amount: totalAmount as any,
      tax_amount: taxAmount as any,
      discount_amount: discountAmount as any,
      created_by,
      updated_by: created_by,
    });

    const savedOrder = await this.salesRepository.save(order);
    this.logger.log(`Order saved: ID=${savedOrder.id}, OrderNumber=${savedOrder.order_number}`);

    // 🔥 Step 2: Create items with the SAVED order's ID
    const items = itemTotals.map((item) =>
      itemsRepository.create({
        ...item,
        order_id: savedOrder.id, // Use the saved order's ID
        created_by,
        updated_by: created_by,
      }),
    );

    // 🔥 Step 3: Save items
    await itemsRepository.save(items);
    this.logger.log(`Items saved: OrderID=${savedOrder.id}, ItemCount=${items.length}`);

    // 🔥 Step 4: Return complete order with items attached
    savedOrder.items = items;
    return savedOrder;
  }

  async updateOrder(
    orderId: string,
    updateOrderDto: CreateOrderDto,
    updated_by: string,
  ): Promise<Order> {
    // Fetch existing order
    const order = await this.getOrderById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Build updated customer_info
    const customerInfo = {
      ...(updateOrderDto.customer_info || {}),
      name: updateOrderDto.customer_name || order.customer_info?.name || 'Walk-in Customer',
      phone: updateOrderDto.customer_phone || order.customer_info?.phone || 'N/A',
    };

    // Calculate new totals
    const itemTotals = updateOrderDto.items.map((item) => ({
      ...item,
      total_price: item.quantity * item.unit_price,
    }));

    const subtotal = itemTotals.reduce((sum, item) => sum + item.total_price, 0);
    const discountAmount = updateOrderDto.discount_amount || 0;
    const taxAmount = subtotal * 0.05; // 5% GST
    const totalAmount = subtotal - discountAmount + taxAmount;

    // 🔥 Step 1: Update order details
    order.outlet_id = updateOrderDto.outlet_id || order.outlet_id; // ✅ Preserve outlet_id
    order.customer_info = customerInfo;
    order.order_type = updateOrderDto.order_type || order.order_type;
    order.payment_type = updateOrderDto.payment_type || order.payment_type;
    order.total_amount = totalAmount as any;
    order.tax_amount = taxAmount as any;
    order.discount_amount = discountAmount as any;
    order.updated_by = updated_by;

    const updatedOrder = await this.salesRepository.save(order);
    this.logger.log(`Order updated: ID=${updatedOrder.id}`);

    // 🔥 Step 2: Delete old items
    const itemsRepository = this.dataSource.getRepository(OrderItem);
    await itemsRepository.delete({ order_id: orderId });
    this.logger.log(`Old items deleted: OrderID=${orderId}`);

    // 🔥 Step 3: Create new items
    const newItems = itemTotals.map((item) =>
      itemsRepository.create({
        ...item,
        order_id: orderId,
        created_by: updated_by,
        updated_by: updated_by,
      }),
    );

    // 🔥 Step 4: Save new items
    await itemsRepository.save(newItems);
    this.logger.log(`New items created: OrderID=${orderId}, ItemCount=${newItems.length}`);

    // 🔥 Step 5: Return updated order with items
    updatedOrder.items = newItems;
    return updatedOrder;
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
