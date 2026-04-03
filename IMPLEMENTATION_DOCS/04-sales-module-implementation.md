# Phase 4: Sales Module Implementation

## Overview
This phase implemented comprehensive sales tracking, order ingestion, revenue calculations, and analytics with caching for dashboard metrics.

## Work Completed

### 1. Database Schema

#### Tables Created

**orders**
- `id` (UUID, primary key)
- `outlet_id` (UUID, foreign key)
- `order_number` (string, unique per outlet)
- `customer_id` (UUID, optional - foreign key to customers)
- `order_type` (enum: DINE_IN, TAKEAWAY, DELIVERY, ONLINE)
- `table_number` (string, optional)
- `subtotal` (decimal, 2 places)
- `tax_amount` (decimal, 2 places)
- `service_charge` (decimal, 2 places)
- `discount_amount` (decimal, 2 places)
- `total_amount` (decimal, 2 places)
- `payment_method` (enum: CASH, CARD, UPI, ONLINE, WALLET)
- `payment_status` (enum: PENDING, COMPLETED, FAILED, REFUNDED)
- `order_status` (enum: CREATED, CONFIRMED, PREPARING, READY, SERVED, COMPLETED, CANCELLED)
- `notes` (text)
- `guest_count` (integer)
- `started_at` (timestamp)
- `completed_at` (timestamp)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `created_by` (UUID)
- `updated_by` (UUID)
- `deleted_at` (timestamp)
- Indexes: outlet_id, created_at, payment_status, order_status

**order_items**
- `id` (UUID, primary key)
- `order_id` (UUID, foreign key)
- `outlet_id` (UUID, foreign key)
- `item_id` (UUID, optional - foreign key to menu items)
- `item_name` (string)
- `item_code` (string)
- `quantity` (decimal)
- `unit_price` (decimal, 2 places)
- `total_price` (decimal, 2 places)
- `notes` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `deleted_at` (timestamp)
- Indexes: order_id, outlet_id

**payments**
- `id` (UUID, primary key)
- `outlet_id` (UUID, foreign key)
- `order_id` (UUID, foreign key)
- `transaction_id` (string, unique per outlet)
- `amount` (decimal, 2 places)
- `payment_method` (enum: CASH, CARD, UPI, ONLINE, WALLET)
- `gateway` (string, optional - RAZORPAY, PAYTM, etc.)
- `gateway_transaction_id` (string, optional)
- `gateway_response` (JSON)
- `status` (enum: INITIATED, COMPLETED, FAILED, REFUNDED)
- `refund_amount` (decimal, 2 places)
- `refund_reason` (text)
- `processed_at` (timestamp)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- Indexes: order_id, outlet_id, payment_method, status

**sales_summary** (Denormalized for analytics)
- `id` (UUID, primary key)
- `outlet_id` (UUID, foreign key, indexed)
- `date` (date, indexed)
- `orders_count` (integer)
- `total_sales` (decimal)
- `total_tax` (decimal)
- `total_service_charge` (decimal)
- `total_discount` (decimal)
- `average_transaction_value` (decimal)
- `payment_method_breakdown` (JSON)
- `order_type_breakdown` (JSON)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- Unique constraint: (outlet_id, date)

### 2. Entity Models (TypeORM)

#### Order Entity
- Relationships:
  - `outlet` (many-to-one with Outlet)
  - `customer` (many-to-one with Customer, optional)
  - `items` (one-to-many with OrderItem)
  - `payment` (one-to-one with Payment)
  - `createdByUser` (many-to-one with User)
  - `updatedByUser` (many-to-one with User)
- Virtual fields:
  - Calculated gratuity
  - Net amount after discount
  - Payment completion percentage
- Indexes: outlet_id, created_at, payment_status

#### OrderItem Entity
- Relationships:
  - `order` (many-to-one with Order)
  - `outlet` (many-to-one with Outlet)
- Denormalized item details for audit trail

#### Payment Entity
- Relationships:
  - `order` (one-to-one with Order)
  - `outlet` (many-to-one with Outlet)
- Payment gateway response archival
- Refund tracking

#### SalesSummary Entity
- Relationships:
  - `outlet` (many-to-one with Outlet)
- Aggregated daily metrics
- JSON breakdown storage
- Unique (outlet_id, date)

### 3. Data Transfer Objects (DTOs)

#### CreateOrderDto
```typescript
{
  customer_id?: UUID
  order_type: enum (DINE_IN, TAKEAWAY, DELIVERY, ONLINE)
  table_number?: string
  guest_count?: number
  notes?: string
}
```

#### AddOrderItemDto
```typescript
{
  item_id?: UUID
  item_name: string (required)
  item_code: string
  quantity: number (required, > 0)
  unit_price: decimal (required, > 0)
  notes?: string
}
```

#### UpdateOrderDto
```typescript
{
  customer_id?: UUID
  order_type?: enum
  table_number?: string
  order_status?: enum
  guest_count?: number
  notes?: string
}
```

#### CompleteOrderDto
```typescript
{
  subtotal: decimal (required)
  tax_amount: decimal
  service_charge: decimal
  discount_amount: decimal
  payment_method: enum (required)
  payment_provider?: string
}
```

#### ProcessPaymentDto
```typescript
{
  amount: decimal (required)
  payment_method: enum (required)
  gateway?: string
  gateway_transaction_id?: string
  gateway_response?: object
}
```

#### OrderResponseDto
```typescript
{
  id: UUID
  order_number: string
  order_type: enum
  table_number?: string
  guest_count: number
  subtotal: decimal
  tax_amount: decimal
  service_charge: decimal
  discount_amount: decimal
  total_amount: decimal
  items: OrderItemDto[]
  payment?: PaymentResponseDto
  order_status: enum
  payment_status: enum
  created_at: timestamp
  completed_at?: timestamp
}
```

#### SalesAnalyticsDto
```typescript
{
  date: date
  orders_count: number
  total_sales: decimal
  average_transaction_value: decimal
  payment_method_breakdown: object
  order_type_breakdown: object
  top_items: array
  growth_rate?: decimal
}
```

### 4. Repository Pattern

#### OrderRepository
- `findById(id)` - Get order with items and payment
- `findByOrderNumber(number, outletId)` - Unique order lookup
- `findByOutletId(outletId)` - All outlet orders
- `findByStatus(status, outletId)` - Filter by status
- `findByDateRange(outletId, startDate, endDate)` - Date-based query
- `findByPaymentStatus(status, outletId)` - Unpaid orders
- `create(orderData)` - Create new order
- `update(id, updateData)` - Update order
- `addItem(orderId, itemData)` - Add item to order
- `removeItem(itemId)` - Remove item from order
- `calculateTotal(orderId)` - Compute order total
- `softDelete(id)` - Soft delete order
- `findCompletedOrders(outletId, dateRange)` - For analytics
- Pagination support

#### PaymentRepository
- `findByOrderId(orderId)` - Get order payment
- `findByTransactionId(txnId, outletId)` - Unique lookup
- `findByStatus(status, outletId)` - Filter by status
- `findByPaymentMethod(method, outletId)` - Method-based query
- `findByDateRange(outletId, startDate, endDate)` - Revenue queries
- `create(paymentData)` - Record payment
- `update(id, updateData)` - Update payment status
- `processRefund(paymentId, amount, reason)` - Refund processing
- Revenue aggregations

#### SalesSummaryRepository
- `findByDate(outletId, date)` - Daily summary
- `findByDateRange(outletId, startDate, endDate)` - Period summary
- `create(summaryData)` - Create daily summary
- `update(outletId, date, summaryData)` - Update summary
- `findTrends(outletId, days)` - Trend analysis
- Aggregation queries

### 5. Service Layer

#### OrderService
- Order CRUD operations
- Validation:
  - Order number uniqueness per outlet
  - Item quantity positive
  - Unit price validation
  - Order type validation
  - Guest count positive
- Business Logic:
  - Order creation with unique number generation
  - Item addition/removal
  - Order status transitions
  - Total calculations (subtotal, tax, service charge, discount)
  - Order completion workflow
  - Bulk operations

#### PaymentService
- Payment processing operations
- Validation:
  - Amount > 0
  - Payment method validity
  - Gateway response validation
  - Refund amount <= original amount
- Business Logic:
  - Payment recording
  - Payment gateway integration
  - Refund processing
  - Payment status tracking
  - Revenue analytics aggregation

#### SalesAnalyticsService
- Sales metrics calculation
- Caching implementation
- Validation:
  - Date range validity
  - Outlet existence
  - Metric calculation accuracy
- Business Logic:
  - Daily sales summary generation
  - Trends and growth calculation
  - Payment method breakdown
  - Order type analysis
  - Top items identification
  - Revenue comparisons
  - Cache management with TTL

### 6. Controller Layer

#### SalesController
Endpoints:
- `GET /sales` - List orders
  - Query params: `outlet_id`, `order_status`, `date_from`, `date_to`, `page`, `limit`
  - Response: Paginated orders with totals
  
- `POST /sales` - Create new order
  - Body: CreateOrderDto
  - Response: Created order with order_number
  
- `GET /sales/:id` - Get specific order
  - Response: Order with items and payment details
  
- `PATCH /sales/:id` - Update order
  - Body: UpdateOrderDto
  - Validation: Status transitions allowed
  - Response: Updated order
  
- `POST /sales/:id/items` - Add item to order
  - Body: AddOrderItemDto
  - Validation: Order must be in CREATED/CONFIRMED status
  - Response: Order with new item
  
- `DELETE /sales/:id/items/:item_id` - Remove item
  - Validation: Order not yet served
  - Response: Updated order
  
- `POST /sales/:id/complete` - Complete and charge order
  - Body: CompleteOrderDto
  - Calculation: Final totals with tax/service charge
  - Response: Completed order with payment
  
- `GET /sales/analytics/dashboard` - Dashboard metrics
  - Query params: `outlet_id`, `date` (defaults to today)
  - Response: Daily metrics with caching (TTL: 5 minutes)
  - Cached key: `dashboard:{outlet_id}:{date}`
  
- `GET /sales/analytics/trends` - Sales trends
  - Query params: `outlet_id`, `days` (default: 30)
  - Response: Trend analysis with growth rates
  
- `GET /sales/analytics/payment-breakdown` - Payment analysis
  - Query params: `outlet_id`, `date_from`, `date_to`
  - Response: Payment method distribution
  
- `GET /sales/analytics/top-items` - Best sellers
  - Query params: `outlet_id`, `days`, `limit`
  - Response: Top items by quantity/revenue

#### PaymentsController
Endpoints:
- `GET /payments` - List payments
  - Query params: `outlet_id`, `status`, `method`, `date_from`, `date_to`
  - Response: Paginated payments
  
- `GET /payments/:id` - Get payment
  - Response: Payment with gateway details
  
- `POST /payments/:order_id` - Process payment
  - Body: ProcessPaymentDto
  - Response: Payment confirmation
  
- `POST /payments/:id/refund` - Process refund
  - Body: { amount, reason }
  - Validation: Amount <= original payment
  - Response: Refund confirmation
  
- `GET /payments/:id/receipt` - Generate receipt
  - Response: Receipt data for printing/email

### 7. Redis Caching Strategy

#### Cache Keys
```
dashboard:{outlet_id}:{date}
trends:{outlet_id}:{days}
payment_breakdown:{outlet_id}:{date_from}:{date_to}
top_items:{outlet_id}:{days}:{limit}
order_number:{outlet_id}:{sequence}
```

#### TTL Configuration
- Dashboard metrics: 5 minutes (300 seconds)
- Trends data: 1 hour (3600 seconds)
- Payment breakdown: 1 hour
- Top items: 1 hour
- Order number sequence: Never expire

#### Cache Invalidation
- On order completion
- On payment processing
- On refund
- On manual dashboard refresh
- Daily cleanup at midnight

### 8. Order Number Generation

#### Format
`ORD-{DATE}-{OUTLET_CODE}-{SEQUENCE}`
Example: `ORD-20240313-OUT001-00001`

#### Sequence
- Per outlet daily sequence
- Redis-based counter for concurrency
- Reset daily at 00:00 UTC

### 9. API Response Format

All endpoints return:

**Success (201/200)**
```json
{
  "status": "success",
  "data": { /* order, payment, or analytics */ },
  "timestamp": "2024-03-13T10:30:00Z"
}
```

**Error (400/403/404/500)**
```json
{
  "status": "error",
  "message": "Error description",
  "code": "ERROR_CODE",
  "timestamp": "2024-03-13T10:30:00Z"
}
```

### 10. Testing

#### Jest + Supertest Tests

**OrderService Tests**
- Create order generates unique order number
- Add items to order
- Calculate order totals correctly
- Update order status (valid transitions)
- Complete order and process payment
- Retrieve order with items
- List orders with filtering
- Soft delete order

**PaymentService Tests**
- Process payment successfully
- Record payment details
- Refund payment (partial and full)
- Validate payment amount
- Track payment status

**SalesAnalyticsService Tests**
- Calculate daily sales summary
- Cache dashboard metrics (5-min TTL)
- Calculate trends over days
- Payment method breakdown
- Top items analysis
- Cache invalidation on new orders

**SalesController Tests**
- POST /sales - Create order (201)
- GET /sales - List orders (200)
- GET /sales/:id - Get order (200)
- PATCH /sales/:id - Update order (200)
- POST /sales/:id/items - Add item (201)
- DELETE /sales/:id/items/:item_id - Remove item (200)
- POST /sales/:id/complete - Complete order (200)
- GET /sales/analytics/dashboard - Dashboard (200, cached)
- GET /sales/analytics/trends - Trends (200)
- GET /sales/analytics/payment-breakdown - Breakdown (200)
- POST /payments/:order_id - Process payment (201)
- POST /payments/:id/refund - Refund (200)
- Invalid order status (400)
- Duplicate order number (409)

### Test Execution
```bash
npm run test -- sales
npm run test:e2e
```

## Key Features

✅ Order creation and tracking  
✅ Multiple order types (dine-in, takeaway, delivery, online)  
✅ Item-level order details  
✅ Flexible payment methods  
✅ Tax and service charge calculations  
✅ Discount management  
✅ Payment status tracking  
✅ Refund processing  
✅ Revenue analytics  
✅ Sales trends and growth tracking  
✅ Payment method breakdown  
✅ Top items analysis  
✅ Redis caching for dashboard metrics (5-min TTL)  
✅ Daily sales summary aggregation  
✅ Soft delete support  

## Files Created

### Entities
- `src/modules/sales/entities/order.entity.ts`
- `src/modules/sales/entities/order-item.entity.ts`
- `src/modules/sales/entities/payment.entity.ts`
- `src/modules/sales/entities/sales-summary.entity.ts`

### DTOs
- `src/modules/sales/dtos/create-order.dto.ts`
- `src/modules/sales/dtos/update-order.dto.ts`
- `src/modules/sales/dtos/order-response.dto.ts`
- `src/modules/sales/dtos/payment.dto.ts`
- `src/modules/sales/dtos/sales-analytics.dto.ts`

### Repositories
- `src/modules/sales/repositories/order.repository.ts`
- `src/modules/sales/repositories/payment.repository.ts`
- `src/modules/sales/repositories/sales-summary.repository.ts`

### Services
- `src/modules/sales/services/order.service.ts`
- `src/modules/sales/services/payment.service.ts`
- `src/modules/sales/services/sales-analytics.service.ts`

### Controllers
- `src/modules/sales/controllers/sales.controller.ts`
- `src/modules/sales/controllers/payments.controller.ts`

### Module & Tests
- `src/modules/sales/sales.module.ts`
- `src/modules/sales/sales.service.spec.ts`
- `src/modules/sales/sales.controller.spec.ts`
- `test/sales.e2e-spec.ts`

---

**Status**: ✅ Complete  
**Test Result**: All tests passing  
**Cache Validation**: Redis TTL verified (5 minutes for dashboard)  
**Ready for**: Phase 5 - Inventory Module Implementation
