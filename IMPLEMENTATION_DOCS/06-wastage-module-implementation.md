# Phase 6: Wastage Module Implementation

## Overview
This phase implemented comprehensive wastage tracking and analytics for restaurant waste management, enabling insights into waste patterns and cost optimization.

## Work Completed

### 1. Database Schema

#### Tables Created

**wastage_entries**
- `id` (UUID, primary key)
- `outlet_id` (UUID, foreign key)
- `inventory_item_id` (UUID, optional - foreign key)
- `item_name` (string)
- `category` (string)
- `wastage_category_id` (UUID, foreign key)
- `quantity` (decimal)
- `unit` (enum: KG, L, PIECES, DOZEN, CARTON)
- `unit_cost` (decimal, 2 places)
- `waste_value` (decimal, 2 places) - quantity × unit_cost
- `reason` (enum: EXPIRED, SPOILED, DAMAGED, REJECTED, OVER_COOKED, CUSTOMER_RETURN, PREPARATION_LOSS, OTHER)
- `description` (text)
- `reported_by` (UUID, foreign key to users)
- `approved_by` (UUID, optional - foreign key)
- `approval_status` (enum: PENDING, APPROVED, REJECTED)
- `approved_at` (timestamp, optional)
- `estimated_salvage_value` (decimal, optional)
- `photo_url` (string, optional)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `created_by` (UUID)
- `updated_by` (UUID)
- `deleted_at` (timestamp)
- Indexes: outlet_id, created_at, wastage_category_id, approval_status

**wastage_categories**
- `id` (UUID, primary key)
- `outlet_id` (UUID, foreign key)
- `name` (string)
- `description` (text)
- `icon` (string, optional)
- `color` (string, optional) - Hex color for UI
- `is_active` (boolean)
- `order` (integer) - Display order
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `created_by` (UUID)
- `updated_by` (UUID)
- Unique constraint: (outlet_id, name)

**wastage_daily_summary**
- `id` (UUID, primary key)
- `outlet_id` (UUID, foreign key)
- `date` (date)
- `total_entries` (integer)
- `total_quantity` (decimal)
- `total_waste_value` (decimal, 2 places)
- `approved_entries` (integer)
- `pending_entries` (integer)
- `rejected_entries` (integer)
- `waste_by_reason` (JSON)
- `waste_by_category` (JSON)
- `approval_rate` (decimal) - Percentage approved
- `created_at` (timestamp)
- `updated_at` (timestamp)
- Unique constraint: (outlet_id, date)

**wastage_monthly_summary**
- `id` (UUID, primary key)
- `outlet_id` (UUID, foreign key)
- `month` (date) - First day of month
- `total_waste_value` (decimal, 2 places)
- `average_daily_waste` (decimal, 2 places)
- `total_entries` (integer)
- `approved_percentage` (decimal)
- `top_reason` (string)
- `top_category` (string)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 2. Entity Models (TypeORM)

#### WastageEntry Entity
- Relationships:
  - `outlet` (many-to-one with Outlet)
  - `inventoryItem` (many-to-one with InventoryItem, optional)
  - `category` (many-to-one with WastageCategory)
  - `reportedByUser` (many-to-one with User)
  - `approvedByUser` (many-to-one with User, optional)
  - `createdByUser` (many-to-one with User)
  - `updatedByUser` (many-to-one with User)
- Calculated fields:
  - Waste value (quantity × unit_cost)
  - Days since entry
- Indexes: outlet_id, created_at, approval_status

#### WastageCategory Entity
- Relationships:
  - `outlet` (many-to-one with Outlet)
  - `entries` (one-to-many with WastageEntry)
- Display customization: icon, color, order

#### WastageDailySummary Entity
- Relationships:
  - `outlet` (many-to-one with Outlet)
- Aggregated daily metrics
- Reason and category breakdowns (JSON)
- Approval rate calculation

#### WastageMonthly Summary Entity
- Relationships:
  - `outlet` (many-to-one with Outlet)
- Aggregated monthly metrics
- Trend analysis
- Top reasons and categories

### 3. Data Transfer Objects (DTOs)

#### CreateWastageEntryDto
```typescript
{
  inventory_item_id?: UUID
  item_name: string (required)
  category_id: UUID (required)
  quantity: decimal (required, > 0)
  unit: enum (required)
  unit_cost: decimal (required)
  reason: enum (required)
  description?: string
  estimated_salvage_value?: decimal
  photo_url?: string
}
```

#### ApproveWastageEntryDto
```typescript
{
  approval_status: enum (APPROVED, REJECTED)
  rejection_reason?: string (required if REJECTED)
}
```

#### WastageEntryResponseDto
```typescript
{
  id: UUID
  item_name: string
  category: WastageCategoryDto
  quantity: decimal
  unit: enum
  waste_value: decimal
  reason: enum
  approval_status: enum
  reported_by: UserMinimalDto
  approved_by?: UserMinimalDto
  approval_rate: string (percentage)
  created_at: timestamp
  approved_at?: timestamp
}
```

#### WastageCategoryDto
```typescript
{
  id: UUID
  name: string
  description: string
  icon?: string
  color?: string
  is_active: boolean
}
```

#### WastageAnalyticsDto
```typescript
{
  date: date
  total_entries: number
  total_waste_value: decimal
  total_quantity: decimal
  waste_by_reason: {
    [reason: string]: { quantity, value }
  }
  waste_by_category: {
    [category: string]: { quantity, value }
  }
  approval_status_breakdown: {
    approved: number
    pending: number
    rejected: number
  }
  approval_rate: decimal (percentage)
}
```

### 4. Repository Pattern

#### WastageEntryRepository
- `findById(id)` - Get entry with all relationships
- `findByOutletId(outletId)` - All outlet entries
- `findByStatus(status, outletId)` - Filter by approval status
- `findByReason(reason, outletId)` - Filter by wastage reason
- `findByCategory(categoryId)` - Filter by category
- `findByDateRange(outletId, startDate, endDate)` - Period query
- `findPending(outletId)` - Awaiting approval
- `create(entryData)` - Create new entry
- `update(id, updateData)` - Update entry
- `approve(id, approverId, decision)` - Approval workflow
- `softDelete(id)` - Soft delete entry
- `countByStatus(outletId)` - Status aggregation
- Pagination support
- Filtering support

#### WastageCategoryRepository
- `findById(id)` - Get category with icon/color
- `findByOutletId(outletId)` - All outlet categories
- `findByName(name, outletId)` - Unique lookup
- `findActive(outletId)` - Active categories only
- `create(categoryData)` - Create category
- `update(id, updateData)` - Update category
- `getUsageCount(categoryId)` - How many entries use category
- `softDelete(id)` - Soft delete (mark inactive)
- Pagination support

#### WastageDailySummaryRepository
- `findByDate(outletId, date)` - Daily summary
- `findByDateRange(outletId, startDate, endDate)` - Period summaries
- `findLatest(outletId, days)` - Last N days
- `create(summaryData)` - Create daily summary
- `update(outletId, date, summaryData)` - Update summary
- `calculateTrends(outletId, days)` - Trend analysis

### 5. Service Layer

#### WastageEntryService
- Wastage entry CRUD operations
- Validation:
  - Quantity > 0
  - Unit cost > 0
  - Reason enum validation
  - Category existence
  - Item existence (if inventory_item_id provided)
  - Photo URL format (if provided)
- Business Logic:
  - Create entry (PENDING status)
  - Update entry (only when PENDING)
  - Approve/reject entry workflow
  - Calculate waste value
  - Update inventory (on approval)
  - Generate alerts (high waste rate)
  - Bulk entry support

#### WastageCategoryService
- Category management
- Validation:
  - Category name uniqueness per outlet
  - Color format (hex)
  - Icon availability
- Business Logic:
  - Create default categories
  - Category management (CRUD)
  - Category usage tracking
  - Inactive old categories

#### WastageAnalyticsService
- Analytics calculations
- Validation:
  - Date range validity
  - Outlet existence
- Business Logic:
  - Generate daily summary
  - Calculate waste by reason
  - Calculate waste by category
  - Calculate approval rates
  - Trend analysis (daily vs monthly)
  - Top wastage items
  - Top waste reasons
  - Comparative analysis (vs previous period)
  - Cost impact analysis

### 6. Controller Layer

#### WastageController
Endpoints:
- `GET /wastage` - List wastage entries
  - Query params: `outlet_id`, `status`, `reason`, `category_id`, `date_from`, `date_to`, `page`, `limit`
  - Response: Paginated wastage entries with category info
  
- `POST /wastage` - Create wastage entry
  - Body: CreateWastageEntryDto
  - Status: Set to PENDING
  - Response: Created entry with entry_id
  
- `GET /wastage/:id` - Get specific entry
  - Response: Full entry details with approvals
  
- `PATCH /wastage/:id` - Update entry (pending only)
  - Body: Partial CreateWastageEntryDto
  - Validation: Entry must be PENDING
  - Response: Updated entry
  
- `DELETE /wastage/:id` - Delete pending entry
  - Validation: Entry must be PENDING
  
- `POST /wastage/:id/approve` - Approve/reject entry
  - Body: ApproveWastageEntryDto
  - Requires APPROVE_WASTAGE permission
  - Updates inventory on approval
  - Response: Entry with approval details
  
- `GET /wastage/analytics/daily` - Daily analytics
  - Query params: `outlet_id`, `date` (defaults to today)
  - Response: Daily waste summary with breakdowns
  
- `GET /wastage/analytics/monthly` - Monthly analytics
  - Query params: `outlet_id`, `month` (defaults to current)
  - Response: Monthly summary with trends
  
- `GET /wastage/analytics/trends` - Waste trends
  - Query params: `outlet_id`, `days` (default: 30)
  - Response: Trend data with growth/decline
  
- `GET /wastage/analytics/top-reasons` - Top waste reasons
  - Query params: `outlet_id`, `limit` (default: 10), `days`
  - Response: Ranked reasons by quantity/value
  
- `GET /wastage/analytics/breakdown` - Reason/category breakdown
  - Query params: `outlet_id`, `date_from`, `date_to`
  - Response: Pie/bar chart data

#### WastageCategoryController
Endpoints:
- `GET /wastage-categories` - List categories
  - Query params: `outlet_id`, `is_active`
  - Response: Categories with icon/color
  
- `POST /wastage-categories` - Create category
  - Body: { name, description, icon, color }
  - Response: Created category
  
- `GET /wastage-categories/:id` - Get category
  
- `PATCH /wastage-categories/:id` - Update category
  
- `DELETE /wastage-categories/:id` - Deactivate category
  - Validation: Can only deactivate (keeps data)

### 7. Approval Workflow

#### Entry Lifecycle
```
Created (PENDING)
    ↓
[Manager reviews]
    ↓
Approved (APPROVED) OR Rejected (REJECTED)
    ↓
[If approved: update inventory, close]
[If rejected: notify reporter, allow re-submission]
```

#### Approval Rules
- Required for items valued > ₹500
- Batch approval for multiple entries
- Approval audit trail
- Rejection reasons tracked

### 8. Analytics Capabilities

#### Daily Analytics
- Total waste (quantity and value)
- Entries by status
- Breakdown by reason
- Breakdown by category
- Approval rate
- Major waste items

#### Monthly Analytics
- Total waste value
- Average daily waste
- Top reasons
- Top categories
- Approval trends
- Cost impact (vs sales)

#### Trend Analysis
- Day-over-day changes
- Week-over-week comparison
- Month-over-month comparison
- Seasonal patterns
- Anomaly detection (unusually high waste)

### 9. Notifications

#### Alert Triggers
- **High daily waste**: Total waste > 5% of previous day's sales
- **Pending approvals**: >5 entries pending approval
- **Consistent reason**: Same reason repeated 5+ times in 7 days
- **Unauthorized categories**: Entries in disabled category

#### Notification Methods
- In-app notifications
- WhatsApp to manager
- Email to admin
- Dashboard alerts

### 10. API Response Format

All endpoints return:

**Success (201/200)**
```json
{
  "status": "success",
  "data": { /* entry, category, or analytics */ },
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

### 11. Testing

#### Jest + Supertest Tests

**WastageEntryService Tests**
- Create wastage entry
- Create entry with inventory item
- Calculate waste value correctly
- Update pending entry
- Approve entry (updates inventory)
- Reject entry
- List entries with filtering
- Filter by reason and category
- Validate quantities

**WastageCategoryService Tests**
- Create default categories
- Create custom category
- Duplicate category name (fails)
- Update category
- Deactivate category
- Get category usage count

**WastageAnalyticsService Tests**
- Calculate daily summary
- Breakdown by reason
- Breakdown by category
- Calculate approval rate
- Trend analysis (30 days)
- Top reasons analysis
- Cost impact vs sales

**WastageController Tests**
- POST /wastage - Create entry (201)
- GET /wastage - List entries (200)
- GET /wastage/:id - Get entry (200)
- PATCH /wastage/:id - Update entry (200)
- POST /wastage/:id/approve - Approve (200)
- POST /wastage/:id/approve - Reject (200)
- GET /wastage/analytics/daily - Daily (200)
- GET /wastage/analytics/monthly - Monthly (200)
- GET /wastage/analytics/trends - Trends (200)
- Invalid approval (403)
- High waste detection

### Test Execution
```bash
npm run test -- wastage
npm run test:e2e
```

## Key Features

✅ Wastage entry creation with photo support  
✅ Multiple wastage reasons (expiry, spoilage, damage, etc.)  
✅ Customizable wastage categories  
✅ Approval workflow for accountability  
✅ Automatic inventory updates on approval  
✅ Waste value calculation and tracking  
✅ Daily waste summary aggregation  
✅ Monthly waste trends  
✅ Top wastage items and reasons  
✅ Waste by reason/category breakdowns  
✅ Approval rate tracking  
✅ Cost impact analysis  
✅ Trend detection (day/week/month comparisons)  
✅ Automated alerts (high waste detection)  
✅ Salvage value tracking (partial recovery)  
✅ Soft delete support  

## Files Created

### Entities
- `src/modules/wastage/entities/wastage-entry.entity.ts`
- `src/modules/wastage/entities/wastage-category.entity.ts`
- `src/modules/wastage/entities/wastage-daily-summary.entity.ts`
- `src/modules/wastage/entities/wastage-monthly-summary.entity.ts`

### DTOs
- `src/modules/wastage/dtos/create-wastage-entry.dto.ts`
- `src/modules/wastage/dtos/approve-wastage-entry.dto.ts`
- `src/modules/wastage/dtos/wastage-response.dtos.ts`
- `src/modules/wastage/dtos/wastage-analytics.dto.ts`

### Repositories
- `src/modules/wastage/repositories/wastage-entry.repository.ts`
- `src/modules/wastage/repositories/wastage-category.repository.ts`
- `src/modules/wastage/repositories/wastage-summary.repository.ts`

### Services
- `src/modules/wastage/services/wastage-entry.service.ts`
- `src/modules/wastage/services/wastage-category.service.ts`
- `src/modules/wastage/services/wastage-analytics.service.ts`

### Controllers
- `src/modules/wastage/controllers/wastage.controller.ts`
- `src/modules/wastage/controllers/wastage-category.controller.ts`

### Module & Tests
- `src/modules/wastage/wastage.module.ts`
- `src/modules/wastage/wastage.service.spec.ts`
- `src/modules/wastage/wastage.controller.spec.ts`
- `test/wastage.e2e-spec.ts`

---

**Status**: ✅ Complete  
**Test Result**: All tests passing  
**Ready for**: Phase 7 - Party Orders Module Implementation
