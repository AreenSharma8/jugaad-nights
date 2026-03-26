/**
 * Petpooja Events Service
 * Processes real-time order events from Petpooja POS
 */

import { Injectable, Logger } from '@nestjs/common';
import { PetpoojaWebhookPayload } from '../dto/petpooja.dto';

export interface ProcessedOrder {
  order_id: string;
  outlet_id: string;
  status: string;
  message: string;
}

@Injectable()
export class PetpoojaEventsService {
  private readonly logger = new Logger(PetpoojaEventsService.name);
  
  // Store for tracking processed orders (prevent duplicates)
  private processedOrders = new Map<string, number>();
  private readonly DUPLICATE_CHECK_WINDOW = 60 * 1000; // 1 minute

  /**
   * Process orderdetails event from Petpooja
   */
  async processOrderDetailsEvent(payload: PetpoojaWebhookPayload): Promise<ProcessedOrder> {
    try {
      const { Restaurant, Order, Customer, OrderItem = [], Tax = [], Discount = [] } = payload;

      // Validate token if provided (optional)
      if (Order.token) {
        const isValidToken = this.validateWebhookToken(Order.token);
        if (!isValidToken) {
          this.logger.warn(`Invalid webhook token: ${Order.token}`);
          // Continue processing anyway as token is optional
        }
      }

      // Check for duplicate order (within 1 minute)
      const isDuplicate = this.isDuplicateOrder(Order.order_id);
      if (isDuplicate) {
        this.logger.warn(`Duplicate order detected: ${Order.order_id}`);
        return {
          order_id: Order.order_id,
          outlet_id: Restaurant.restID,
          status: 'duplicate',
          message: 'Duplicate order detected and skipped',
        };
      }

      // Map Petpooja order to internal format
      const internalOrder = this.mapPetpoojaOrderToInternal(payload);

      this.logger.log(`Processing order: ${Order.order_id} from outlet: ${Restaurant.restID}`);

      // TODO: Save to database
      // await this.ordersRepository.save(internalOrder);

      // TODO: Trigger downstream actions
      // - Update inventory
      // - Trigger notifications
      // - Update sales metrics

      this.logger.log(`Successfully processed order: ${Order.order_id}`);

      return {
        order_id: Order.order_id,
        outlet_id: Restaurant.restID,
        status: 'success',
        message: 'Order processed successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to process order details: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Map Petpooja order format to internal format
   */
  private mapPetpoojaOrderToInternal(payload: PetpoojaWebhookPayload): any {
    const { Restaurant, Order, Customer, OrderItem = [], Tax = [], Discount = [] } = payload;

    // Calculate totals
    let itemsTotal = 0;
    let taxTotal = 0;
    let discountTotal = 0;

    if (OrderItem && Array.isArray(OrderItem)) {
      itemsTotal = OrderItem.reduce((sum, item) => sum + (item.item_total || 0), 0);
    }

    if (Tax && Array.isArray(Tax)) {
      taxTotal = Tax.reduce((sum, tax) => sum + (tax.tax_amount || 0), 0);
    }

    if (Discount && Array.isArray(Discount)) {
      discountTotal = Discount.reduce((sum, disc) => sum + (disc.discount_amount || 0), 0);
    }

    return {
      remote_order_id: Order.order_id, // For deduplication
      outlet_id: Restaurant.restID,
      customer_name: Customer.name,
      customer_phone: Customer.phone,
      customer_email: Customer.email,
      order_type: Order.order_type,
      payment_type: Order.payment_type,
      order_from: Order.order_from,
      order_from_id: Order.order_from_id,
      sub_order_type: Order.sub_order_type,
      status: Order.status === 'Success' ? 'Success' : 'Cancelled',
      
      // Financial details
      sub_amount: itemsTotal,
      tax_amount: taxTotal,
      discount_amount: discountTotal,
      total_amount: Order.total_amount,
      net_amount: Order.total_amount - discountTotal,
      paid_amount: Order.paid_amount || Order.total_amount,
      payment_status: Order.payment_status || 'completed',

      // Items
      items: OrderItem.map(item => ({
        item_id: item.item_id,
        item_name: item.item_name,
        item_size: item.item_size,
        quantity: item.quantity,
        unit_price: item.unit_price,
        amount: item.item_total,
        addon_details: item.addon_details,
      })),

      // Taxes
      taxes: Tax.map(tax => ({
        tax_name: tax.tax_name,
        tax_percentage: tax.tax_percentage,
        tax_amount: tax.tax_amount,
      })),

      // Discounts
      discounts: Discount.map(disc => ({
        discount_name: disc.discount_name,
        discount_type: disc.discount_type,
        discount_value: disc.discount_value,
        discount_amount: disc.discount_amount,
      })),

      // Metadata
      source: 'petpooja',
      source_timestamp: payload.timestamp ? new Date(payload.timestamp * 1000) : new Date(),
      raw_payload: JSON.stringify(payload),
    };
  }

  /**
   * Validate webhook token (optional)
   */
  private validateWebhookToken(token: string): boolean {
    // TODO: Implement token validation against outlet configuration
    // For now, return true to allow all tokens
    return true;
  }

  /**
   * Check if order is a duplicate (within time window)
   */
  private isDuplicateOrder(orderId: string): boolean {
    const lastProcessed = this.processedOrders.get(orderId);

    if (!lastProcessed) {
      this.processedOrders.set(orderId, Date.now());
      return false;
    }

    const timeSinceLastProcess = Date.now() - lastProcessed;

    if (timeSinceLastProcess < this.DUPLICATE_CHECK_WINDOW) {
      return true; // Duplicate
    }

    // Update timestamp
    this.processedOrders.set(orderId, Date.now());
    return false;
  }

  /**
   * Cleanup old entries from duplicate check
   */
  private cleanupOldEntries(): void {
    const now = Date.now();
    for (const [orderId, timestamp] of this.processedOrders.entries()) {
      if (now - timestamp > 24 * 60 * 60 * 1000) { // 24 hours
        this.processedOrders.delete(orderId);
      }
    }
  }
}

export default PetpoojaEventsService;
