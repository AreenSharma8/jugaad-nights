import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  async sendNotification(
    phone_number: string,
    message: string,
  ): Promise<{ success: boolean; message_id: string }> {
    try {
      // Mock implementation - would integrate with actual WhatsApp API
      const message_id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      this.logger.log(
        `WhatsApp notification sent to ${phone_number}: ${message.substring(0, 50)}...`,
      );

      return {
        success: true,
        message_id,
      };
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp notification:`, error);
      throw error;
    }
  }

  async sendInventoryAlert(
    phone_number: string,
    item_name: string,
    current_quantity: number,
  ): Promise<{ success: boolean; message_id: string }> {
    const message = `⚠️ Low Stock Alert: ${item_name} is running low (${current_quantity} units remaining). Please reorder soon.`;
    return this.sendNotification(phone_number, message);
  }

  async sendPartyOrderNotification(
    phone_number: string,
    customer_name: string,
    event_date: string,
  ): Promise<{ success: boolean; message_id: string }> {
    const message = `🎉 New Party Order from ${customer_name} for ${event_date}. Check the app for details.`;
    return this.sendNotification(phone_number, message);
  }

  async sendDailySalesReport(
    phone_number: string,
    outlet_name: string,
    total_sales: number,
    order_count: number,
  ): Promise<{ success: boolean; message_id: string }> {
    const message = `📊 Daily Sales Report - ${outlet_name}\n💰 Total Sales: ${total_sales}\n📦 Orders: ${order_count}`;
    return this.sendNotification(phone_number, message);
  }
}
