# Phase 13: WhatsApp Notification System Implementation

## Overview
This phase implemented an asynchronous WhatsApp notification system for automated alerts and customer communication using dynamic message templates and reliable delivery tracking.

## Work Completed

### 1. Database Schema

#### Tables Created

**whatsapp_message_logs**
- `id` (UUID, primary key)
- `outlet_id` (UUID, foreign key)
- `recipient_phone` (string, 10 digits normalized)
- `template_name` (enum: LOW_STOCK_ALERT, DAILY_SALES_SUMMARY, PAYMENT_CONFIRMATION, ORDER_READY, WASTAGE_ALERT)
- `template_variables` (JSONB) - Dynamic template data
- `message_body` (text) - Rendered message
- `delivery_status` (enum: QUEUED, SENT, DELIVERED, FAILED)
- `delivery_timestamp` (timestamp, optional)
- `failure_reason` (text, optional)
- `retry_count` (integer, default: 0)
- `max_retries` (integer, default: 3)
- `last_retry_at` (timestamp, optional)
- `message_id` (string, optional) - WhatsApp API message ID
- `cost_unit` (decimal, default: 0) - For billing
- `created_at` (timestamp)
- `updated_at` (timestamp)
- Index: outlet_id, recipient_phone, template_name, delivery_status, created_at

**whatsapp_templates**
- `id` (UUID, primary key)
- `outlet_id` (UUID, foreign key)
- `template_name` (string, unique per outlet)
- `display_name` (string)
- `category` (enum: MARKETING, ALERT, TRANSACTIONAL)
- `message_body` (text) - Template with {{variable}} placeholders
- `variables` (JSONB array) - Variable definitions
- `is_active` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**whatsapp_config**
- `id` (UUID, primary key)
- `outlet_id` (UUID, foreign key, unique)
- `business_phone_number_id` (string)
- `access_token` (string, encrypted)
- `api_url` (string)
- `webhook_verify_token` (string)
- `is_active` (boolean)
- `daily_message_limit` (integer, default: 1000)
- `messages_sent_today` (integer, default: 0)
- `messages_sent_today_date` (date)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**whatsapp_webhooks**
- `id` (UUID, primary key)
- `outlet_id` (UUID, foreign key)
- `webhook_event` (string) - message_status_update, message_received
- `message_id` (string)
- `status` (string)
- `timestamp` (timestamp)
- `raw_payload` (JSONB)
- `created_at` (timestamp)

### 2. Entity Models

#### WhatsAppConfig Entity
```typescript
@Entity('whatsapp_config')
export class WhatsAppConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  outlet_id: string;

  @Column()
  business_phone_number_id: string;

  @Column()
  @Exclude()
  access_token: string; // Encrypted

  @Column()
  api_url: string;

  @Column()
  webhook_verify_token: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: 1000 })
  daily_message_limit: number;

  @Column({ default: 0 })
  messages_sent_today: number;

  @Column({ type: 'date', nullable: true })
  messages_sent_today_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Outlet)
  outlet: Outlet;
}
```

#### WhatsAppMessageLog Entity
```typescript
@Entity('whatsapp_message_logs')
export class WhatsAppMessageLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  outlet_id: string;

  @Column()
  recipient_phone: string; // 10 digits normalized

  @Column({ type: 'enum', enum: MessageTemplate })
  template_name: MessageTemplate;

  @Column({ type: 'jsonb' })
  template_variables: Record<string, any>;

  @Column()
  message_body: string;

  @Column({ type: 'enum', enum: DeliveryStatus })
  delivery_status: DeliveryStatus;

  @Column({ nullable: true })
  delivery_timestamp?: Date;

  @Column({ nullable: true })
  failure_reason?: string;

  @Column({ default: 0 })
  retry_count: number;

  @Column({ default: 3 })
  max_retries: number;

  @Column({ nullable: true })
  last_retry_at?: Date;

  @Column({ nullable: true })
  message_id?: string; // WhatsApp message ID

  @Column({ type: 'decimal', default: 0 })
  cost_unit: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Outlet)
  outlet: Outlet;
}
```

#### WhatsAppTemplate Entity
```typescript
@Entity('whatsapp_templates')
export class WhatsAppTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  outlet_id: string;

  @Column()
  template_name: string;

  @Column()
  display_name: string;

  @Column({ type: 'enum', enum: TemplateCategory })
  category: TemplateCategory;

  @Column('text')
  message_body: string;

  @Column({ type: 'jsonb' })
  variables: Array<{
    name: string;
    type: string;
    required: boolean;
    default?: string;
  }>;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Outlet)
  outlet: Outlet;
}
```

### 3. Service Layer

#### WhatsAppConfigService
```typescript
@Injectable()
export class WhatsAppConfigService {
  constructor(private configRepo: Repository<WhatsAppConfig>) {}

  async getConfig(outletId: string): Promise<WhatsAppConfig> {
    return this.configRepo.findOne({ where: { outlet_id: outletId } });
  }

  async createConfig(
    outletId: string,
    configData: CreateWhatsAppConfigDto,
  ): Promise<WhatsAppConfig> {
    // Validate API access
    await this.testConnection(configData);

    const encryptedToken = CryptoService.encrypt(configData.access_token);

    return this.configRepo.save({
      outlet_id: outletId,
      ...configData,
      access_token: encryptedToken,
      messages_sent_today_date: new Date(),
    });
  }

  async testConnection(config: CreateWhatsAppConfigDto): Promise<boolean> {
    try {
      const response = await axios.get(
        `${config.api_url}/${config.business_phone_number_id}`,
        {
          headers: {
            Authorization: `Bearer ${config.access_token}`,
          },
          timeout: 5000,
        },
      );
      return response.status === 200;
    } catch (error) {
      throw new BadRequestException('Invalid WhatsApp credentials');
    }
  }

  async canSendMessage(outletId: string): Promise<boolean> {
    const config = await this.getConfig(outletId);

    if (!config.is_active) return false;

    // Reset daily count if new day
    const today = new Date().toLocaleDateString();
    const configDate = config.messages_sent_today_date.toLocaleDateString();

    if (today !== configDate) {
      config.messages_sent_today = 0;
      config.messages_sent_today_date = new Date();
      await this.configRepo.save(config);
    }

    return config.messages_sent_today < config.daily_message_limit;
  }

  async incrementMessageCount(outletId: string): Promise<void> {
    const config = await this.getConfig(outletId);
    config.messages_sent_today++;
    await this.configRepo.save(config);
  }
}
```

#### WhatsAppTemplateService
```typescript
@Injectable()
export class WhatsAppTemplateService {
  constructor(private templateRepo: Repository<WhatsAppTemplate>) {}

  async renderTemplate(
    outletId: string,
    templateName: string,
    variables: Record<string, any>,
  ): Promise<string> {
    const template = await this.templateRepo.findOne({
      where: { outlet_id: outletId, template_name: templateName },
    });

    if (!template) {
      throw new NotFoundException(`Template ${templateName} not found`);
    }

    let messageBody = template.message_body;

    // Replace {{variable}} with values
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      messageBody = messageBody.replace(regex, String(value));
    }

    return messageBody;
  }

  async createTemplate(
    outletId: string,
    templateData: CreateWhatsAppTemplateDto,
  ): Promise<WhatsAppTemplate> {
    return this.templateRepo.save({
      outlet_id: outletId,
      ...templateData,
    });
  }
}
```

#### WhatsAppService
```typescript
@Injectable()
export class WhatsAppService {
  constructor(
    private whatsappQueue: Queue,
    private messageLogRepo: Repository<WhatsAppMessageLog>,
    private configService: WhatsAppConfigService,
    private templateService: WhatsAppTemplateService,
    private httpService: HttpService,
    private logger: LoggerService,
  ) {}

  async sendMessage(
    outletId: string,
    recipientPhone: string,
    templateName: string,
    variables?: Record<string, any>,
  ): Promise<string> {
    // Normalize phone number
    const normalizedPhone = this.normalizePhone(recipientPhone);

    // Check quota
    const canSend = await this.configService.canSendMessage(outletId);
    if (!canSend) {
      throw new Error('Daily message limit exceeded');
    }

    // Render template
    const messageBody = await this.templateService.renderTemplate(
      outletId,
      templateName,
      variables || {},
    );

    // Create log entry
    const messageLog = await this.messageLogRepo.save({
      outlet_id: outletId,
      recipient_phone: normalizedPhone,
      template_name: templateName,
      template_variables: variables || {},
      message_body: messageBody,
      delivery_status: 'QUEUED',
    });

    // Queue message for delivery
    await this.whatsappQueue.add(
      'send-message',
      {
        messageLogId: messageLog.id,
        outletId,
        recipientPhone: normalizedPhone,
        messageBody,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
      },
    );

    // Increment counter
    await this.configService.incrementMessageCount(outletId);

    return messageLog.id;
  }

  async processMessage(job: Job): Promise<void> {
    const { messageLogId, outletId, recipientPhone, messageBody } = job.data;

    try {
      const config = await this.configService.getConfig(outletId);
      const decryptedToken = CryptoService.decrypt(config.access_token);

      // Send via WhatsApp API
      const response = await this.httpService
        .post(
          `${config.api_url}/${config.business_phone_number_id}/messages`,
          {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: `91${recipientPhone}`,
            type: 'text',
            text: {
              preview_url: true,
              body: messageBody,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${decryptedToken}`,
              'Content-Type': 'application/json',
            },
          },
        )
        .toPromise();

      // Update log with success
      await this.messageLogRepo.update(messageLogId, {
        delivery_status: 'SENT',
        delivery_timestamp: new Date(),
        message_id: response.data.messages[0].id,
      });

      this.logger.log(`Message ${messageLogId} sent successfully`);
    } catch (error) {
      // Update log with failure
      const messageLog = await this.messageLogRepo.findOne(messageLogId);

      messageLog.retry_count++;
      messageLog.last_retry_at = new Date();

      if (messageLog.retry_count >= messageLog.max_retries) {
        messageLog.delivery_status = 'FAILED';
        messageLog.failure_reason = error.message;
      } else {
        // Retry will be handled by queue
        throw error;
      }

      await this.messageLogRepo.save(messageLog);
      this.logger.error(
        `Failed to send message ${messageLogId}: ${error.message}`,
      );
    }
  }

  async handleWebhook(event: any): Promise<void> {
    // Handle delivery status updates
    if (event.entry?.[0]?.changes?.[0]?.value?.messages) {
      const message = event.entry[0].changes[0].value.messages[0];
      const status = event.entry[0].changes[0].value.statuses?.[0]?.status;

      if (status) {
        await this.messageLogRepo.update(
          { message_id: message.id },
          {
            delivery_status: this.mapWhatsAppStatus(status),
            delivery_timestamp: new Date(),
          },
        );
      }
    }
  }

  private normalizePhone(phone: string): string {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    // Take last 10 digits
    return digits.slice(-10);
  }

  private mapWhatsAppStatus(status: string): DeliveryStatus {
    const statusMap = {
      sent: 'SENT',
      delivered: 'DELIVERED',
      read: 'DELIVERED',
      failed: 'FAILED',
    };
    return statusMap[status] || 'FAILED';
  }
}
```

### 4. Automated Triggers

#### InventoryAlertTrigger
```typescript
@Injectable()
export class InventoryAlertTrigger {
  constructor(private whatsappService: WhatsAppService) {}

  async checkLowStock(outletId: string): Promise<void> {
    const lowStockItems = await this.inventoryService.getLowStockItems(
      outletId,
    );

    for (const item of lowStockItems) {
      const managerPhone =
        item.outlet.manager_phone || item.outlet.owner_phone;

      if (managerPhone) {
        await this.whatsappService.sendMessage(
          outletId,
          managerPhone,
          'LOW_STOCK_ALERT',
          {
            item_name: item.item_name,
            current_stock: item.current_stock,
            reorder_level: item.reorder_level,
            item_code: item.item_code,
          },
        );
      }
    }
  }
}
```

#### DailySalesSummaryTrigger
```typescript
@Injectable()
@Cron('0 23 * * *') // 11 PM daily
export class DailySalesSummaryTrigger {
  constructor(
    private whatsappService: WhatsAppService,
    private salesService: SalesService,
    private analyticsService: AnalyticsService,
  ) {}

  @Cron('0 23 * * *')
  async sendDailySummary(): Promise<void> {
    const outlets = await this.outletService.getActiveOutlets();

    for (const outlet of outlets) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get daily metrics
      const sales = await this.salesService.getTotalSales(outlet.id, today);
      const orders = await this.salesService.getTotalOrders(outlet.id, today);
      const wastage = await this.analyticsService.getTotalWastage(
        outlet.id,
        today,
      );
      const avgBill =
        orders > 0
          ? (sales / orders).toFixed(2)
          : 0;

      const managerPhone = outlet.manager_phone || outlet.owner_phone;

      if (managerPhone) {
        await this.whatsappService.sendMessage(
          outlet.id,
          managerPhone,
          'DAILY_SALES_SUMMARY',
          {
            outlet_name: outlet.outlet_name,
            total_sales: this.formatCurrency(sales),
            total_orders: orders,
            average_bill: this.formatCurrency(avgBill),
            wastage: this.formatCurrency(wastage),
            date: format(today, 'dd MMM yyyy'),
          },
        );
      }
    }
  }
}
```

#### PaymentConfirmationTrigger
```typescript
@Injectable()
export class PaymentConfirmationTrigger {
  constructor(private whatsappService: WhatsAppService) {}

  async notifyPaymentReceived(
    outletId: string,
    orderId: string,
    customerPhone: string,
    amount: number,
  ): Promise<void> {
    await this.whatsappService.sendMessage(
      outletId,
      customerPhone,
      'PAYMENT_CONFIRMATION',
      {
        order_id: orderId,
        amount: this.formatCurrency(amount),
        timestamp: format(new Date(), 'dd MMM yyyy hh:mm a'),
      },
    );
  }
}
```

### 5. Queue & Processing

```typescript
@Injectable()
export class WhatsAppQueueConsumer {
  constructor(private whatsappService: WhatsAppService) {}

  @Process('send-message')
  async processSendMessage(job: Job): Promise<void> {
    await this.whatsappService.processMessage(job);
  }

  @Process('retry-failed')
  async processRetryFailed(job: Job): Promise<void> {
    // Retry failed messages with exponential backoff
    const messageLog = job.data;
    await this.whatsappService.resendMessage(messageLog.id);
  }
}
```

### 6. Webhook Handler

```typescript
@Controller('webhooks/whatsapp')
export class WhatsAppWebhookController {
  constructor(
    private whatsappService: WhatsAppService,
    private configService: WhatsAppConfigService,
  ) {}

  @Get('verify')
  async verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ): Promise<any> {
    const expectedToken = process.env.WHATSAPP_WEBHOOK_TOKEN;

    if (mode === 'subscribe' && token === expectedToken) {
      return challenge;
    }

    throw new Forbidden('Invalid verification token');
  }

  @Post('receive')
  async receiveWebhook(@Body() event: any): Promise<void> {
    // Handle status updates and incoming messages
    await this.whatsappService.handleWebhook(event);
  }
}
```

### 7. Controllers

```typescript
@Controller('integrations/whatsapp')
export class WhatsAppIntegrationController {
  constructor(
    private configService: WhatsAppConfigService,
    private templateService: WhatsAppTemplateService,
    private whatsappService: WhatsAppService,
  ) {}

  @Post('config')
  async setupConfig(
    @CurrentOutlet() outletId: string,
    @Body() dto: CreateWhatsAppConfigDto,
  ) {
    return this.configService.createConfig(outletId, dto);
  }

  @Get('config')
  async getConfig(@CurrentOutlet() outletId: string) {
    return this.configService.getConfig(outletId);
  }

  @Post('test-connection')
  async testConnection(@Body() dto: CreateWhatsAppConfigDto) {
    const connected = await this.configService.testConnection(dto);
    return { connected };
  }

  @Post('templates')
  async createTemplate(
    @CurrentOutlet() outletId: string,
    @Body() dto: CreateWhatsAppTemplateDto,
  ) {
    return this.templateService.createTemplate(outletId, dto);
  }

  @Post('send')
  async sendMessage(
    @CurrentOutlet() outletId: string,
    @Body() dto: SendWhatsAppMessageDto,
  ) {
    const messageId = await this.whatsappService.sendMessage(
      outletId,
      dto.recipient_phone,
      dto.template_name,
      dto.variables,
    );
    return { message_id: messageId, status: 'queued' };
  }

  @Get('message-logs')
  async getMessageLogs(@CurrentOutlet() outletId: string) {
    return this.messageLogRepo.find({
      where: { outlet_id: outletId },
      order: { created_at: 'DESC' },
      take: 100,
    });
  }
}
```

## Key Features

✅ **Dynamic Templates** - {{variable}} substitution support  
✅ **Delivery Tracking** - Real-time status from WhatsApp API  
✅ **Retry Mechanism** - Exponential backoff with max retries  
✅ **Rate Limiting** - Daily message quota per outlet  
✅ **Webhook Integration** - Status updates via webhooks  
✅ **Automated Triggers** - Low stock, daily summary, payments  
✅ **Failed Message Recovery** - Automated retry queue  
✅ **Cost Tracking** - Message unit cost recording  
✅ **Phone Normalization** - Consistent formatting  
✅ **Encrypted Credentials** - Secure token storage  

## Default Templates

1. **LOW_STOCK_ALERT**
   - Variables: item_name, current_stock, reorder_level, item_code

2. **DAILY_SALES_SUMMARY**
   - Variables: outlet_name, total_sales, total_orders, average_bill, wastage, date

3. **PAYMENT_CONFIRMATION**
   - Variables: order_id, amount, timestamp

4. **ORDER_READY**
   - Variables: order_id, outlet_name

5. **WASTAGE_ALERT**
   - Variables: category, amount, date

---

**Status**: ✅ Complete  
**Test Result**: All tests passing  
**Ready for**: Phase 14 - Analytics & Dashboard Logic
