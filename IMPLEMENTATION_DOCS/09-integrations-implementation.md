# Phase 9: External Integrations Implementation

## Overview
This phase implemented integrations with PetPooja POS system and WhatsApp for order synchronization, inventory updates, and real-time notifications.

## Work Completed

### 1. PetPooja Integration

#### Overview
- Real-time synchronization with PetPooja POS system
- Bidirectional data sync (orders, inventory, payments, menu)
- Automated polling with configurable schedules
- Error handling and retry logic

#### Database Tables

**petpooja_sync_logs**
- `id` (UUID, primary key)
- `outlet_id` (UUID, foreign key)
- `sync_type` (enum: ORDERS, INVENTORY, MENU, PAYMENTS)
- `sync_start_time` (timestamp)
- `sync_end_time` (timestamp)
- `records_processed` (integer)
- `records_failed` (integer)
- `last_sync_cursor` (string) - For pagination
- `status` (enum: PENDING, IN_PROGRESS, COMPLETED, FAILED)
- `error_message` (text, optional)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**petpooja_config**
- `id` (UUID, primary key)
- `outlet_id` (UUID, foreign key, unique)
- `business_id` (string, required)
- `auth_token` (string, encrypted)
- `api_url` (string)
- `is_active` (boolean)
- `orders_sync_interval_minutes` (integer, default: 5)
- `inventory_sync_interval_minutes` (integer, default: 30)
- `menu_sync_interval_minutes` (integer, default: 60)
- `payments_sync_enabled` (boolean)
- `last_orders_sync` (timestamp)
- `last_inventory_sync` (timestamp)
- `last_menu_sync` (timestamp)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### API Endpoints (PetPooja)
```
GET /api/v2/orders?last_id={cursor}&limit=100
GET /api/v2/inventory?category_id={id}
GET /api/v2/menus
GET /api/v2/payments
```

#### Service Layer

**PetpoojaConfigService**
- Get/update PetPooja configuration
- Encryption/decryption of auth tokens
- Validation of API credentials
- Interval configuration management

**PetpoojaOrderSyncService**
- Fetch orders from PetPooja
- Map PetPooja orders to internal Order entities
- Handle partial orders (in-progress)
- Handle completed orders (create sales records)
- Update with payment status
- Error handling and retries
- Polling schedule: Every 5 minutes

**PetpoojaInventorySyncService**
- Fetch inventory updates from PetPooja
- Update internal inventory items
- Detect low stock items
- Sync consumption data
- Polling schedule: Every 30 minutes

**PetpoojaMenuSyncService**
- Fetch menu from PetPooja
- Update menu items (prices, availability)
- Handle item deactivation
- Category mapping
- Polling schedule: Every 1 hour

**PetpoojaPaymentSyncService**
- Fetch payment records
- Match with orders
- Update payment status
- Reconciliation support

#### Implementation Details

**Order Sync Flow**
```
1. Query PetPooja orders API with last_sync cursor
2. For each order:
   a. Check if order exists locally (by PetPooja ID)
   b. If new: Create order + items + payment
   c. If exists and status changed: Update status
   d. Log transaction in petpooja_sync_logs
3. Update last_sync_cursor
4. Store sync completion time
```

**Data Mapping**
```
PetPooja Order → Internal Order
- petpooja_order_id → external_reference_id
- Items → OrderItems
- Amount → Total
- Payment method → Payment
- Status → Order status
```

**Error Handling**
- Network timeout: Retry after 1 minute
- Invalid data: Log error, skip record, continue
- Rate limiting (429): Back off exponentially
- Auth failure (401): Alert admin, disable sync
- Data conflicts: Keep most recent, log discrepancy

### 2. WhatsApp Integration

#### Overview
- Real-time notifications via WhatsApp
- Multiple notification types (alerts, orders, inventory)
- Message templates for consistency
- Queue-based delivery with retry

#### Database Tables

**whatsapp_messages**
- `id` (UUID, primary key)
- `outlet_id` (UUID, foreign key)
- `recipient_phone` (string)
- `message_type` (enum: INVENTORY_ALERT, ORDER_READY, DAILY_SALES, WASTAGE_ALERT, PARTY_ORDER_UPDATE, EXPENSE_APPROVAL)
- `message_body` (text)
- `media_url` (string, optional)
- `status` (enum: QUEUED, SENT, DELIVERED, FAILED, READ)
- `provider_message_id` (string, optional)
- `error_message` (text, optional)
- `retry_count` (integer, default: 0)
- `max_retries` (integer, default: 3)
- `sent_at` (timestamp, optional)
- `delivered_at` (timestamp, optional)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**whatsapp_config**
- `id` (UUID, primary key)
- `outlet_id` (UUID, foreign key, unique)
- `provider` (enum: TWILIO, DIALOG_FLOW, WATI, CUSTOM)
- `api_key` (string, encrypted)
- `api_secret` (string, encrypted, optional)
- `phone_number` (string)
- `webhook_url` (string)
- `is_active` (boolean)
- `max_retries` (integer, default: 3)
- `retry_delay_seconds` (integer, default: 60)
- `daily_quota` (integer, optional)
- `daily_count` (integer, default: 0)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**whatsapp_templates**
- `id` (UUID, primary key)
- `outlet_id` (UUID, foreign key)
- `template_key` (string, unique per outlet)
- `template_name` (string)
- `message_type` (enum)
- `template_body` (text) - With {{variable}} placeholders
- `parameters` (json) - Expected parameters
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### Service Layer

**WhatsappConfigService**
- Get/update WhatsApp configuration
- Encryption/decryption of credentials
- Provider validation
- Quota management

**WhatsappQueueService**
- Enqueue messages to sending queue
- Priority assignment (high, normal, low)
- Batch processing
- Retry logic

**WhatsappSenderService**
- Send messages via provider API
- Handle delivery callbacks
- Track message status
- Error handling and retries
- Rate limiting compliance

**WhatsappNotificationService**
- Create notification messages
- Template rendering with variables
- Trigger notifications based on events
- Recipient selection

#### Message Templates

**Low Inventory Alert**
```
Template: "low_stock_alert"
Body: "🚨 Alert: {{item_name}} stock is low ({{current_qty}} {{unit}})
Reorder Level: {{reorder_level}} {{unit}}"
```

**Order Ready Notification**
```
Template: "order_ready"
Body: "✅ Order {{order_number}} is ready!
Total: ₹{{amount}}
Please collect from counter"
```

**Daily Sales Summary**
```
Template: "daily_sales_summary"
Body: "📊 Daily Sales Summary ({{date}})
Orders: {{order_count}}
Revenue: ₹{{total_sales}}
Avg Order Value: ₹{{avg_value}}"
```

**Wastage Alert**
```
Template: "wastage_alert"
Body: "⚠️ High Wastage Reported
Item: {{item_name}}
Quantity: {{quantity}} {{unit}}
Reason: {{reason}}"
```

**Party Order Update**
```
Template: "party_order_update"
Body: "📋 Party Order Status Update
Customer: {{customer_name}}
Event Date: {{event_date}}
Status: {{status}}"
```

**Expense Approval Request**
```
Template: "expense_approval"
Body: "💰 Expense Approval Required
Category: {{category}}
Amount: ₹{{amount}}
Description: {{description}}"
```

#### Notification Triggers

| Event | Message Type | Recipients | Priority |
|-------|-------------|-----------|----------|
| Stock < reorder_level | INVENTORY_ALERT | Manager, Procurement | High |
| Order completed | ORDER_READY | Waiter, Customer | Normal |
| Inventory expires in 7 days | INVENTORY_ALERT | Manager, Chef | High |
| Daily sales ready | DAILY_SALES | Owner, Manager | Normal |
| Wastage approval needed | WASTAGE_ALERT | Manager | Normal |
| High waste day | WASTAGE_ALERT | Owner | High |
| Party order status change | PARTY_ORDER_UPDATE | Customer | Normal |
| Expense > threshold | EXPENSE_APPROVAL | Manager, Owner | High |

#### Error Handling
- Invalid phone: Log and skip
- Provider error: Queue for retry
- Rate limit (429): Back off with exponential delay
- Auth failure (401): Alert admin, disable integration
- Message not delivered after max retries: Create incident

### 3. Integration Architecture

#### Queue-Based Processing

**BullMQ Queue: petpooja-orders-sync**
```typescript
{
  interval: 5 minutes
  processor: PetpoojaOrderSyncService.sync()
  retries: 3
  backoff: exponential
}
```

**BullMQ Queue: petpooja-inventory-sync**
```typescript
{
  interval: 30 minutes
  processor: PetpoojaInventorySyncService.sync()
  retries: 2
  backoff: exponential
}
```

**BullMQ Queue: petpooja-menu-sync**
```typescript
{
  interval: 1 hour
  processor: PetpoojaMenuSyncService.sync()
  retries: 2
  backoff: exponential
}
```

**BullMQ Queue: whatsapp-messages**
```typescript
{
  processor: WhatsappSenderService.send()
  retries: 3
  backoff: exponential
  delay: exponential between retries
}
```

#### Event-Driven Integration
```
Order Completed → Trigger WhatsApp notification → Add to queue
Inventory Low → Trigger WhatsApp alert → Add to queue
PetPooja Sync Completed → Log sync status → Update counters
```

### 4. Configuration Management

#### ConfigService Integration
```typescript
outlets.config.petpooja = {
  business_id: "...",
  auth_token: "...",
  api_url: "...",
  sync_intervals: {
    orders: 5,      // minutes
    inventory: 30,  // minutes
    menu: 60        // minutes
  },
  enabled: true
}

outlets.config.whatsapp = {
  provider: "TWILIO",
  api_key: "...",
  phone_number: "+91...",
  enabled: true,
  daily_quota: 1000
}
```

### 5. Controller Layer

#### IntegrationConfigController
Endpoints:
- `GET /integrations/petpooja/config` - Get PetPooja config
  
- `POST /integrations/petpooja/config` - Setup/update
  - Body: { business_id, auth_token, sync_intervals }
  - Validation: Test connection
  
- `POST /integrations/petpooja/test` - Test connection
  - Response: Connection status
  
- `POST /integrations/petpooja/sync/orders` - Manual sync
  
- `POST /integrations/petpooja/sync/inventory` - Manual sync
  
- `POST /integrations/petpooja/sync/menu` - Manual sync
  
- `GET /integrations/petpooja/sync-logs` - View sync history
  
- `GET /integrations/whatsapp/config` - Get WhatsApp config
  
- `POST /integrations/whatsapp/config` - Setup/update
  - Body: { provider, api_key, phone_number }
  
- `POST /integrations/whatsapp/test` - Test connection
  
- `GET /integrations/whatsapp/status` - Integration status
  
- `POST /integrations/webhook/petpooja` - Webhook handler
  - Provider sends updates here
  
- `POST /integrations/webhook/whatsapp` - Webhook handler
  - Provider sends delivery status

### 6. Data Consistency

#### Conflict Resolution
1. **Timestamp-based**: Keep most recent update
2. **Quantity-based**: PetPooja is source of truth (for inventory)
3. **Price-based**: Internal rates override PetPooja
4. **Status-based**: Order status from PetPooja, payment status independent

#### Audit Trail
- All syncs logged to `petpooja_sync_logs`
- All messages logged to `whatsapp_messages`
- Discrepancies recorded for review
- Manual overrides tracked

### 7. Monitoring & Alerts

#### Health Checks
- Daily sync success rate check
- Message delivery rate check
- Queue depth monitoring
- Failed job count tracking

#### Alerts
- Sync failure > 30 minutes: Alert admin
- Message delivery failure rate > 10%: Alert admin
- Queue depth > 1000: Alert admin
- API error rate > 5%: Alert admin

### 8. Testing

#### Jest Tests

**PetpoojaOrderSyncService Tests**
- Fetch orders from PetPooja
- Create local orders from sync
- Update existing orders
- Handle partial orders
- Handle errors and retries
- Update cursor on success

**PetpoojaInventorySyncService Tests**
- Fetch inventory from PetPooja
- Update stock levels
- Create low stock alerts
- Handle category mapping

**WhatsappSenderService Tests**
- Send message via API
- Handle delivery callbacks
- Track message status
- Retry on failure
- Rate limit handling
- Queue processing

**IntegrationController Tests**
- Setup PetPooja integration
- Test PetPooja connection
- Trigger manual sync jobs
- Setup WhatsApp integration
- Receive webhook callbacks

### Test Execution
```bash
npm run test -- integrations
npm run test:e2e
```

## Key Features

✅ **PetPooja Sync**:
   - Automatic order synchronization (5-min interval)
   - Inventory updates (30-min interval)
   - Menu sync (1-hour interval)
   - Payment reconciliation
   - Error handling and retry logic
   - Sync history and audit trail

✅ **WhatsApp Integration**:
   - Real-time notifications
   - Multiple message types
   - Custom templates
   - Delivery tracking
   - Retry mechanism
   - Queue-based processing
   - Daily quota management

✅ **Queue Management**:
   - BullMQ for reliable processing
   - Automatic scheduling
   - Error handling with backoff
   - Priority queue support

✅ **Configuration Management**:
   - Per-outlet integration settings
   - Encrypted credentials
   - Interval customization
   - Enable/disable toggles

✅ **Webhook Support**:
   - PetPooja push notifications
   - WhatsApp delivery callbacks
   - Signature verification

✅ **Monitoring**:
   - Sync logs and history
   - Message delivery tracking
   - Error alerts
   - Queue monitoring

## Files Created

### Entities
- `src/modules/integrations/entities/petpooja-config.entity.ts`
- `src/modules/integrations/entities/petpooja-sync-log.entity.ts`
- `src/modules/integrations/entities/whatsapp-message.entity.ts`
- `src/modules/integrations/entities/whatsapp-config.entity.ts`
- `src/modules/integrations/entities/whatsapp-template.entity.ts`

### Services
- `src/modules/integrations/services/petpooja-config.service.ts`
- `src/modules/integrations/services/petpooja-order-sync.service.ts`
- `src/modules/integrations/services/petpooja-inventory-sync.service.ts`
- `src/modules/integrations/services/petpooja-menu-sync.service.ts`
- `src/modules/integrations/services/whatsapp-config.service.ts`
- `src/modules/integrations/services/whatsapp-queue.service.ts`
- `src/modules/integrations/services/whatsapp-sender.service.ts`
- `src/modules/integrations/services/whatsapp-notification.service.ts`

### Controllers
- `src/modules/integrations/controllers/petpooja-integration.controller.ts`
- `src/modules/integrations/controllers/whatsapp-integration.controller.ts`
- `src/modules/integrations/controllers/integration-webhooks.controller.ts`

### Module & Tests
- `src/modules/integrations/integrations.module.ts`
- `src/modules/integrations/integrations.service.spec.ts`
- `src/modules/integrations/integrations.controller.spec.ts`
- `test/integrations.e2e-spec.ts`

---

**Status**: ✅ Complete  
**Test Result**: All tests passing  
**Ready for**: Phase 10 - Reports, Analytics & Deployment
