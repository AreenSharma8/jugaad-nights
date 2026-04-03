# Phase 7: Party Orders Module Implementation

## Overview
This phase implemented event and catering order management including quotation generation, customer tracking, and special event handling.

## Work Completed

### 1. Database Schema

#### Tables Created

**customers**
- `id` (UUID, primary key)
- `outlet_id` (UUID, foreign key)
- `name` (string)
- `email` (string)
- `phone_number` (string, unique per outlet)
- `alternate_phone` (string, optional)
- `address_line1` (string)
- `address_line2` (string, optional)
- `city` (string)
- `state` (string)
- `zipcode` (string)
- `gst_number` (string, optional)
- `customer_type` (enum: INDIVIDUAL, CORPORATE, CATERER)
- `preferred_cuisine` (string)
- `special_requirements` (text)
- `lifetime_orders` (integer)
- `lifetime_spent` (decimal)
- `preferred_contact_method` (enum: PHONE, EMAIL, WHATSAPP)
- `last_order_date` (timestamp)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `created_by` (UUID)
- `updated_by` (UUID)
- `deleted_at` (timestamp)
- Indexes: outlet_id, phone_number, email, customer_type

**party_orders**
- `id` (UUID, primary key)
- `outlet_id` (UUID, foreign key)
- `quotation_number` (string, unique per outlet)
- `customer_id` (UUID, foreign key)
- `event_date` (date)
- `event_type` (enum: WEDDING, CORPORATE, BIRTHDAY, ANNIVERSARY, CASUAL, OTHER)
- `location` (string) - Event venue location
- `guest_count` (integer)
- `per_plate_rate` (decimal)
- `quotation_status` (enum: DRAFT, SENT, ACCEPTED, REJECTED, COUNTER_OFFER, EXPIRED)
- `order_status` (enum: QUOTATION, CONFIRMED, PREPARATION, READY, SERVED, COMPLETED, CANCELLED)
- `total_cost` (decimal, calculated)
- `advance_received` (decimal)
- `advance_date` (date, optional)
- `balance_amount` (decimal, calculated)
- `special_menu_requested` (boolean)
- `menu_details` (JSON)
- `decoration_requested` (boolean)
- `decoration_cost` (decimal, optional)
- `additional_charges` (JSON)
- `notes` (text)
- `assigned_to` (UUID, foreign key to users)
- `quotation_sent_date` (timestamp)
- `accepted_date` (timestamp, optional)
- `payment_terms` (enum: FULL_ADVANCE, HALF_ADVANCE, ON_DELIVERY)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `created_by` (UUID)
- `updated_by` (UUID)
- `deleted_at` (timestamp)
- Indexes: outlet_id, customer_id, event_date, quotation_status

**party_order_items**
- `id` (UUID, primary key)
- `party_order_id` (UUID, foreign key)
- `outlet_id` (UUID, foreign key)
- `item_name` (string)
- `item_code` (string, optional)
- `category` (string)
- `quantity` (decimal)
- `unit` (string)
- `unit_price` (decimal)
- `total_price` (decimal)
- `is_vegetarian` (boolean)
- `description` (string, optional)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `deleted_at` (timestamp)

**quotation_approval_history**
- `id` (UUID, primary key)
- `party_order_id` (UUID, foreign key)
- `outlet_id` (UUID, foreign key)
- `quotation_version` (integer)
- `status_change` (enum: SENT, ACCEPTED, REJECTED, COUNTER_OFFER)
- `previous_total` (decimal)
- `new_total` (decimal)
- `change_reason` (text)
- `customer_comment` (text)
- `approved_by` (UUID, optional)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 2. Entity Models (TypeORM)

#### Customer Entity
- Relationships:
  - `outlet` (many-to-one with Outlet)
  - `partyOrders` (one-to-many with PartyOrder)
  - `createdByUser` (many-to-one with User)
  - `updatedByUser` (many-to-one with User)
- Aggregated fields:
  - Lifetime orders count
  - Lifetime spent amount
  - Last order date
- Indexes: outlet_id, phone_number, email

#### PartyOrder Entity
- Relationships:
  - `outlet` (many-to-one with Outlet)
  - `customer` (many-to-one with Customer)
  - `items` (one-to-many with PartyOrderItem)
  - `assignedTo` (many-to-one with User)
  - `approvalHistory` (one-to-many with QuotationApprovalHistory)
  - `createdByUser` (many-to-one with User)
  - `updatedByUser` (many-to-one with User)
- Calculated fields:
  - Total cost (sum of items)
  - Balance amount (total_cost - advance_received)
  - Days until event
  - Quotation expiry status
- Indexes: outlet_id, customer_id, event_date

#### PartyOrderItem Entity
- Relationships:
  - `partyOrder` (many-to-one with PartyOrder)
  - `outlet` (many-to-one with Outlet)
- Denormalized item details for audit

#### QuotationApprovalHistory Entity
- Relationships:
  - `partyOrder` (many-to-one with PartyOrder)
- Audit trail for quotation changes
- Version tracking

### 3. Data Transfer Objects (DTOs)

#### CreateCustomerDto
```typescript
{
  name: string (required)
  email: string (required)
  phone_number: string (required, unique per outlet)
  address_line1: string (required)
  city: string (required)
  state: string (required)
  zipcode: string (required)
  customer_type: enum (required)
  gst_number?: string
  preferred_cuisine?: string
  special_requirements?: string
}
```

#### CreatePartyOrderDto
```typescript
{
  customer_id: UUID (required)
  event_date: date (required)
  event_type: enum (required)
  location: string (required)
  guest_count: number (required, > 0)
  per_plate_rate: decimal (required)
  special_menu_requested: boolean
  menu_details?: object
  decoration_requested: boolean
  decoration_cost?: decimal
  notes?: string
  assigned_to?: UUID
  items: [{
    item_name: string (required)
    category: string (required)
    quantity: decimal (required)
    unit: string (required)
    unit_price: decimal (required)
    is_vegetarian: boolean
  }] (required)
}
```

#### CreateQuotationDto
```typescript
{
  customer_id: UUID (required)
  event_date: date (required)
  event_type: enum (required)
  guest_count: number (required)
  per_plate_rate: decimal (required)
  items: PartyOrderItemDto[] (required)
  payment_terms: enum (required)
  notes?: string
}
```

#### SendQuotationDto
```typescript
{
  recipient_email: string (required)
  message?: string
  cc_emails?: string[]
}
```

#### AcceptQuotationDto
```typescript
{
  advance_amount?: decimal
  special_notes?: string
}
```

#### PartyOrderResponseDto
```typescript
{
  id: UUID
  quotation_number: string
  customer: CustomerDto
  event_date: date
  event_type: enum
  guest_count: number
  per_plate_rate: decimal
  items: PartyOrderItemDto[]
  total_cost: decimal
  advance_received: decimal
  balance_amount: decimal
  quotation_status: enum
  order_status: enum
  assigned_to: UserMinimalDto
  created_at: timestamp
}
```

### 4. Repository Pattern

#### CustomerRepository
- `findById(id)` - Get customer with orders
- `findByPhoneNumber(phone, outletId)` - Unique lookup
- `findByEmail(email, outletId)` - Email lookup
- `findByOutletId(outletId)` - All outlet customers
- `findByType(type, outletId)` - Filter by customer type
- `findFrequentCustomers(outletId, limit)` - Top customers
- `create(customerData)` - Create customer
- `update(id, updateData)` - Update customer
- `updateStats(customerId)` - Recalculate lifetime stats
- `softDelete(id)` - Soft delete customer
- Pagination support
- Search support (name, phone)

#### PartyOrderRepository
- `findById(id)` - Get order with items and customer
- `findByQuotationNumber(number, outletId)` - Unique lookup
- `findByCustomer(customerId)` - Customer's orders
- `findByStatus(status, outletId)` - Filter by quotation status
- `findByEventDate(outletId, startDate, endDate)` - Event date range
- `findUpcoming(outletId, days)` - Upcoming events
- `findByAssignee(userId, outletId)` - Orders assigned to user
- `create(orderData)` - Create order
- `update(id, updateData)` - Update order
- `createVersion(orderId)` - Save quotation version
- `softDelete(id)` - Soft delete order
- Pagination support
- Filtering support (status, date range, assignee)

#### PartyOrderItemRepository
- `findByOrderId(orderId)` - All items in order
- `create(itemData)` - Add item
- `update(id, updateData)` - Update item
- `delete(id)` - Remove item
- Aggregation (count, sum)

### 5. Service Layer

#### CustomerService
- Customer CRUD operations
- Validation:
  - Phone number uniqueness per outlet
  - Email format validation
  - Address completeness
  - GST number format
  - Customer type enum
- Business Logic:
  - Create customer
  - Update customer info
  - Calculate lifetime stats (orders, spent)
  - Find frequent customers
  - Segment customers by type
  - Soft delete with order preservation

#### PartyOrderService
- Party order CRUD operations
- Validation:
  - Customer existence
  - Event date in future
  - Guest count > 0
  - Per plate rate > 0
  - Item quantities > 0
  - Unit prices > 0
- Business Logic:
  - Create quotation with auto-calculation
  - Generate quotation number
  - Add items and calculate totals
  - Update items and recalculate totals
  - Apply additional charges
  - Track quotation versions
  - Accept quotation workflow
  - Advance payment tracking
  - Payment terms enforcement
  - Order status transitions

#### QuotationService
- Quotation-specific operations
- Validation:
  - Quotation number uniqueness
  - Quotation date format
- Business Logic:
  - Generate quotation document
  - Send quotation (email/WhatsApp)
  - Accept/reject quotation
  - Counter offer management
  - Quotation expiry (30 days)
  - Version history

#### PartyOrderAnalyticsService
- Analytics and reporting
- Validation:
  - Date range validity
  - Outlet existence
- Business Logic:
  - Upcoming events list
  - Event revenue projections
  - Customer segmentation
  - Event type breakdown
  - Conversion rate (quotation → order)
  - Average order value
  - Repeat customer metrics

### 6. Controller Layer

#### CustomersController
Endpoints:
- `GET /customers` - List customers
  - Query params: `outlet_id`, `type`, `page`, `limit`, `search`
  - Response: Paginated customers with stats
  
- `POST /customers` - Create customer
  - Body: CreateCustomerDto
  - Response: Created customer
  
- `GET /customers/:id` - Get customer
  - Response: Customer with orders summary
  
- `PATCH /customers/:id` - Update customer
  - Body: Partial CreateCustomerDto
  - Response: Updated customer
  
- `DELETE /customers/:id` - Soft delete
  - Validation: No active orders
  
- `GET /customers/:id/orders` - Customer's orders
  - Response: List of party orders

#### PartyOrdersController
Endpoints:
- `GET /party-orders` - List party orders
  - Query params: `outlet_id`, `status`, `event_date_from`, `event_date_to`, `page`, `limit`
  - Response: Paginated orders
  
- `POST /party-orders` - Create quotation
  - Body: CreateQuotationDto
  - Response: Created quotation in DRAFT status
  
- `GET /party-orders/:id` - Get quotation
  - Response: Full quotation with items and history
  
- `PATCH /party-orders/:id` - Update quotation (draft only)
  - Body: Partial CreateQuotationDto
  - Validation: Status must be DRAFT
  - Response: Updated quotation
  
- `POST /party-orders/:id/items` - Add items
  - Body: PartyOrderItemDto[]
  - Response: Updated quotation
  
- `DELETE /party-orders/:id/items/:item_id` - Remove item
  - Recalculates total
  
- `POST /party-orders/:id/send` - Send quotation
  - Body: SendQuotationDto
  - Generates PDF
  - Sends via email/WhatsApp
  - Updates quotation_status to SENT
  
- `POST /party-orders/:id/accept` - Accept quotation
  - Body: AcceptQuotationDto
  - Updates status to ACCEPTED/CONFIRMED
  - Calculates balance
  
- `POST /party-orders/:id/reject` - Reject quotation
  - Body: { reason: string }
  - Sets status to REJECTED
  
- `POST /party-orders/:id/counter-offer` - Counter offer
  - Body: { new_rate: decimal, message: string }
  - Saves version, sets status to COUNTER_OFFER
  
- `POST /party-orders/:id/advance-payment` - Record advance
  - Body: { amount: decimal, payment_date: date }
  - Updates advance_received, recalculates balance
  
- `GET /party-orders/:id/pdf` - Download quotation PDF
  - Response: PDF file blob
  
- `GET /party-orders/upcoming` - Upcoming events
  - Query params: `outlet_id`, `days` (default: 30)
  - Response: Upcoming orders with preparation status
  
- `GET /party-orders/analytics/conversion` - Conversion metrics
  - Query params: `outlet_id`
  - Response: Quotation to order conversion rate
  
- `GET /party-orders/analytics/revenue` - Revenue projection
  - Query params: `outlet_id`, `date_from`, `date_to`
  - Response: Expected revenue from confirmed orders

### 7. Quotation Workflow

#### Status Flow
```
DRAFT → SENT → ACCEPTED/REJECTED/COUNTER_OFFER → CONFIRMED → PREPARATION → READY → SERVED → COMPLETED
                                        ↓
                                (Counter offer: return to DRAFT for new quote)
```

#### Quotation Generation
- Auto-calculate total (per_plate_rate × guest_count)
- Include item details
- Add decoration charges
- Add additional charges
- Include GST if customer has GSTIN
- Format for PDF export

#### Quotation Expiry
- 30-day validity from SENT date
- Auto-expire old quotations
- Send reminder before expiry

### 8. Advance Payment Handling

#### Payment Status
- **FULL_ADVANCE**: 100% before event
- **HALF_ADVANCE**: 50% advance, 50% after delivery
- **ON_DELIVERY**: Full payment at delivery

#### Tracking
- Advance received date
- Amount received
- Balance calculation
- Payment reminders

### 9. API Response Format

All endpoints return:

**Success (201/200)**
```json
{
  "status": "success",
  "data": { /* customer, party order, or list */ },
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

**CustomerService Tests**
- Create customer
- Create duplicate phone (fails)
- Update customer
- Get customer with orders
- Soft delete customer
- Calculate lifetime stats
- Find frequent customers

**PartyOrderService Tests**
- Create quotation with items
- Calculate total correctly
- Add items to quotation
- Remove items and recalculate
- Update quotation details
- Send quotation (email/WhatsApp)
- Accept quotation
- Reject quotation
- Counter offer workflow
- Record advance payment
- Update balance after advance

**QuotationService Tests**
- Generate quotation PDF
- Generate quotation number
- Track quotation versions
- Handle quotation expiry

**PartyOrdersController Tests**
- POST /customers - Create customer (201)
- GET /customers - List customers (200)
- POST /party-orders - Create quotation (201)
- GET /party-orders - List orders (200)
- GET /party-orders/:id - Get order (200)
- PATCH /party-orders/:id - Update order (200)
- POST /party-orders/:id/items - Add items (201)
- DELETE /party-orders/:id/items/:item_id - Remove item (200)
- POST /party-orders/:id/send - Send quotation (200)
- POST /party-orders/:id/accept - Accept (200)
- GET /party-orders/:id/pdf - PDF download (200)
- Invalid customer (400)
- Past event date (400)
- Counter offer workflow

### Test Execution
```bash
npm run test -- party-orders
npm run test:e2e
```

## Key Features

✅ Customer management with lifetime stats  
✅ Multiple customer types (individual, corporate, caterer)  
✅ Party/event order tracking  
✅ Multiple event types (wedding, corporate, birthday, etc.)  
✅ Quotation generation with PDF  
✅ Item-level order details  
✅ Flexible pricing (per-plate rate)  
✅ Additional charges (decoration, special requests)  
✅ Quotation versioning and history  
✅ Counter-offer workflow  
✅ Advance payment tracking  
✅ Multiple payment terms support  
✅ Email/WhatsApp quotation delivery  
✅ Upcoming events tracking  
✅ Conversion rate analytics  
✅ Revenue projection  
✅ Soft delete support  

## Files Created

### Entities
- `src/modules/party-orders/entities/customer.entity.ts`
- `src/modules/party-orders/entities/party-order.entity.ts`
- `src/modules/party-orders/entities/party-order-item.entity.ts`
- `src/modules/party-orders/entities/quotation-approval-history.entity.ts`

### DTOs
- `src/modules/party-orders/dtos/create-customer.dto.ts`
- `src/modules/party-orders/dtos/create-party-order.dto.ts`
- `src/modules/party-orders/dtos/party-order-response.dtos.ts`
- `src/modules/party-orders/dtos/quotation.dtos.ts`

### Repositories
- `src/modules/party-orders/repositories/customer.repository.ts`
- `src/modules/party-orders/repositories/party-order.repository.ts`
- `src/modules/party-orders/repositories/party-order-item.repository.ts`

### Services
- `src/modules/party-orders/services/customer.service.ts`
- `src/modules/party-orders/services/party-order.service.ts`
- `src/modules/party-orders/services/quotation.service.ts`
- `src/modules/party-orders/services/party-order-analytics.service.ts`

### Controllers
- `src/modules/party-orders/controllers/customers.controller.ts`
- `src/modules/party-orders/controllers/party-orders.controller.ts`

### Module & Tests
- `src/modules/party-orders/party-orders.module.ts`
- `src/modules/party-orders/party-orders.service.spec.ts`
- `src/modules/party-orders/party-orders.controller.spec.ts`
- `test/party-orders.e2e-spec.ts`

---

**Status**: ✅ Complete  
**Test Result**: All tests passing  
**Ready for**: Phase 8 - Attendance & Cashflow Module Implementation
