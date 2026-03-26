# Phase 8: Attendance & Cash Flow Module Implementation

## Overview
This phase implemented staff attendance tracking and financial flow management for expenses, cash management, and day-to-day financial operations.

## Work Completed

### 1. Database Schema

#### Tables Created

**attendance_records**
- `id` (UUID, primary key)
- `outlet_id` (UUID, foreign key)
- `user_id` (UUID, foreign key)
- `checkin_time` (timestamp)
- `checkout_time` (timestamp, optional)
- `checkin_location` (point, optional) - GPS coordinates
- `checkout_location` (point, optional)
- `status` (enum: CHECKED_IN, CHECKED_OUT, HALF_DAY, ABSENT, LEAVE, LATE)
- `work_duration_minutes` (integer, calculated)
- `shift_type` (enum: MORNING, EVENING, FULL_DAY, NIGHT)
- `notes` (text)
- `approval_status` (enum: PENDING, APPROVED, REJECTED)
- `approved_by` (UUID, optional)
- `approved_at` (timestamp, optional)
- `attendance_date` (date, indexed)
- `late_reason` (text, optional)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `created_by` (UUID)
- `updated_by` (UUID)
- Indexes: outlet_id, user_id, attendance_date, status

**cash_flow_entries**
- `id` (UUID, primary key)
- `outlet_id` (UUID, foreign key)
- `entry_type` (enum: CASH_IN, CASH_OUT, EXPENSE, PURCHASE, ADJUSTMENT, TRANSFER)
- `category` (string)
- `subcategory` (string, optional)
- `amount` (decimal, 2 places)
- `payment_method` (enum: CASH, CHECK, UPI, BANK_TRANSFER, CARD, WALLET)
- `reference_number` (string, optional)
- `reference_type` (string, optional - ORDER, PO, BILL, etc.)
- `vendor_name` (string, optional)
- `vendor_id` (UUID, optional)
- `description` (text)
- `approval_status` (enum: PENDING, APPROVED, REJECTED)
- `approved_by` (UUID, optional)
- `approved_at` (timestamp, optional)
- `receipt_url` (string, optional)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `created_by` (UUID)
- `updated_by` (UUID)
- `deleted_at` (timestamp)
- Indexes: outlet_id, entry_type, created_at, approval_status

**expense_categories**
- `id` (UUID, primary key)
- `outlet_id` (UUID, foreign key)
- `name` (string, unique per outlet)
- `description` (text)
- `category_type` (enum: OPERATIONAL, PURCHASE, ADMINISTRATIVE, OTHER)
- `budget_limit` (decimal, optional)
- `icon` (string)
- `color` (string)
- `requires_approval` (boolean)
- `approval_threshold` (decimal) - Require approval if > amount
- `is_active` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**daily_cash_summary**
- `id` (UUID, primary key)
- `outlet_id` (UUID, foreign key)
- `date` (date, unique per outlet)
- `opening_cash` (decimal)
- `closing_cash` (decimal)
- `total_cash_in` (decimal)
- `total_cash_out` (decimal)
- `total_expenses` (decimal)
- `net_cash_flow` (decimal, calculated)
- `prepared_by` (UUID)
- `submitted_by` (UUID, optional)
- `approved_by` (UUID, optional)
- `status` (enum: DRAFT, SUBMITTED, APPROVED, LOCKED)
- `remarks` (text)
- `discrepancies_noted` (text, optional)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 2. Entity Models (TypeORM)

#### AttendanceRecord Entity
- Relationships:
  - `outlet` (many-to-one with Outlet)
  - `user` (many-to-one with User)
  - `approvedByUser` (many-to-one with User, optional)
  - `createdByUser` (many-to-one with User)
  - `updatedByUser` (many-to-one with User)
- Calculated fields:
  - Work duration (in minutes)
  - Days since attendance
  - Shift type validation
- Virtual methods:
  - isLate() - Check if checkin > shift start time
  - hasOvertime() - Check if checkout > shift end time
- Indexes: outlet_id, user_id, attendance_date

#### CashFlowEntry Entity
- Relationships:
  - `outlet` (many-to-one with Outlet)
  - `category` (many-to-one with ExpenseCategory, optional)
  - `vendor` (many-to-one with Vendor, optional)
  - `approvedByUser` (many-to-one with User, optional)
  - `createdByUser` (many-to-one with User)
  - `updatedByUser` (many-to-one with User)
- Denormalized fields:
  - Category name (for deleted categories)
  - Vendor name (for deleted vendors)
- Soft delete support
- Indexes: outlet_id, entry_type, created_at, approval_status

#### ExpenseCategory Entity
- Relationships:
  - `outlet` (many-to-one with Outlet)
  - `cashFlowEntries` (one-to-many with CashFlowEntry)
- Display customization: icon, color
- Budget tracking capability

#### DailyCashSummary Entity
- Relationships:
  - `outlet` (many-to-one with Outlet)
  - `preparedByUser` (many-to-one with User)
  - `submittedByUser` (many-to-one with User, optional)
  - `approvedByUser` (many-to-one with User, optional)
- Calculated fields:
  - Net cash flow = total_cash_in - total_cash_out - total_expenses
- Unique (outlet_id, date)

### 3. Data Transfer Objects (DTOs)

#### CheckinDto
```typescript
{
  location?: {
    latitude: number
    longitude: number
  }
  shift_type: enum (required)
  notes?: string
}
```

#### CheckoutDto
```typescript
{
  location?: {
    latitude: number
    longitude: number
  }
  notes?: string
}
```

#### AttendanceRecordResponseDto
```typescript
{
  id: UUID
  user: UserMinimalDto
  attendance_date: date
  checkin_time: timestamp
  checkout_time?: timestamp
  work_duration_minutes: number
  shift_type: enum
  status: enum
  created_at: timestamp
}
```

#### CashFlowEntryDto
```typescript
{
  entry_type: enum (CASH_IN, CASH_OUT, EXPENSE, PURCHASE, ADJUSTMENT, TRANSFER)
  category: string
  subcategory?: string
  amount: decimal (required)
  payment_method: enum (required)
  reference_number?: string
  vendor_name?: string
  description: string (required)
  receipt_url?: string
}
```

#### ApproveCashFlowDto
```typescript
{
  approval_status: enum (APPROVED, REJECTED)
  rejection_reason?: string
}
```

#### DailyCashSummaryDto
```typescript
{
  date: date (required)
  opening_cash: decimal (required)
  closing_cash: decimal (required)
  remarks?: string
}
```

#### ExpenseCategoryDto
```typescript
{
  name: string (required, unique per outlet)
  description: string
  category_type: enum (required)
  budget_limit?: decimal
  icon: string
  color: string
  requires_approval: boolean
  approval_threshold: decimal
}
```

### 4. Repository Pattern

#### AttendanceRepository
- `findById(id)` - Get attendance record
- `findByUserAndDate(userId, date)` - User's attendance on date
- `findByOutletAndDate(outletId, date)` - All attendance on date
- `findByUserAndDateRange(userId, startDate, endDate)` - User history
- `findByStatus(status, outletId)` - Filter by status
- `findPending(outletId)` - Pending approvals
- `create(attendanceData)` - Create attendance
- `update(id, updateData)` - Update attendance
- `approve(id, approverId, decision)` - Approval workflow
- `findMonthlyStats(outletId, month)` - Monthly aggregates
- `findLateComers(outletId, date)` - Late arrivals
- Pagination support

#### CashFlowRepository
- `findById(id)` - Get entry
- `findByOutletId(outletId)` - All outlet entries
- `findByType(type, outletId)` - Filter by entry type
- `findByDateRange(outletId, startDate, endDate)` - Period query
- `findByCategory(category, outletId)` - Filter by category
- `findPending(outletId)` - Pending approvals
- `findByStatus(status, outletId)` - Filter by status
- `create(entryData)` - Create entry
- `update(id, updateData)` - Update entry
- `approve(id, approverId, decision)` - Approval workflow
- `softDelete(id)` - Soft delete entry
- `sumByType(outletId, type, dateRange)` - Aggregation
- Pagination support

#### ExpenseCategoryRepository
- `findById(id)` - Get category
- `findByOutletId(outletId)` - All outlet categories
- `findByName(name, outletId)` - Unique lookup
- `findByType(type, outletId)` - Filter by category type
- `findActive(outletId)` - Active only
- `create(categoryData)` - Create category
- `update(id, updateData)` - Update category
- `softDelete(id)` - Soft delete (mark inactive)

#### DailyCashSummaryRepository
- `findByDate(outletId, date)` - Daily summary
- `findByDateRange(outletId, startDate, endDate)` - Period summaries
- `findLatest(outletId, days)` - Last N days
- `create(summaryData)` - Create summary
- `update(outletId, date, summaryData)` - Update summary
- `findByStatus(status, outletId)` - Filter by status

### 5. Service Layer

#### AttendanceService
- Attendance CRUD operations
- Validation:
  - User exists
  - No duplicate checkin on same date
  - Checkout after checkin
  - Valid shift type
  - Location format (if GPS enabled)
- Business Logic:
  - Checkin user (creates CHECKED_IN record)
  - Checkout user (updates checkout_time, calculates duration)
  - Auto-detect late arrivals
  - Auto-detect overtime
  - Mark absent for no-checkin days
  - Approval workflow
  - Monthly stats calculation
  - Attendance reports (by user, by date, by shift)
  - Leave management

#### CashFlowService
- Cash flow entry operations
- Validation:
  - Amount > 0
  - Entry type validity
  - Category existence
  - Approval threshold checking
  - Receipt URL format
- Business Logic:
  - Create cash/expense entries
  - Auto-categorize entries
  - Apply approval rules (auto-approve <threshold)
  - Approval workflow
  - Amount validation
  - Payment method tracking
  - Expense budget checking
  - Daily reconciliation

#### DailyCashSummaryService
- Daily summary management
- Validation:
  - Date validity
  - Opening and closing cash > 0
  - Outlet existence
- Business Logic:
  - Auto-generate daily summary
  - Calculate net cash flow
  - Reconcile with entries
  - Discrepancy detection
  - Summary approval workflow
  - Cash variance analysis
  - Weekly/monthly rollups

#### AttendanceAnalyticsService
- Attendance analytics
- Validation:
  - Date range validity
  - User existence
- Business Logic:
  - Calculate attendance percentage
  - Identify late comers
  - Overtime tracking
  - Shift utilization
  - Absence patterns
  - Attendance trends

#### CashFlowAnalyticsService
- Cash flow analytics
- Validation:
  - Date range validity
- Business Logic:
  - Daily cash flow summaries
  - Weekly/monthly rollups
  - Expense trends
  - Budget vs actual
  - Category-wise breakdown
  - Cash balance projections

### 6. Controller Layer

#### AttendanceController
Endpoints:
- `POST /attendance/checkin` - User checkin
  - Body: CheckinDto
  - No authentication required (user identified by token)
  - Response: Checkin confirmation
  
- `POST /attendance/checkout` - User checkout
  - Body: CheckoutDto
  - Response: Checkout confirmation with duration
  
- `GET /attendance` - List attendance
  - Query params: `outlet_id`, `date`, `user_id`, `status`, `page`, `limit`
  - Response: Paginated attendance records
  
- `GET /attendance/:id` - Get record
  - Response: Full attendance details
  
- `PATCH /attendance/:id` - Modify attendance (admin)
  - Body: Partial AttendanceRecordResponseDto
  - Validation: Must be PENDING for changes
  
- `POST /attendance/:id/approve` - Approve attendance
  - Body: { approval_status: enum, rejection_reason?: string }
  - Requires APPROVE_ATTENDANCE permission
  
- `GET /attendance/late-comers` - Late arrivals
  - Query params: `outlet_id`, `date`
  - Response: List of late arrivals
  
- `GET /attendance/monthly-report` - Monthly summary
  - Query params: `outlet_id`, `month`
  - Response: Attendance statistics

#### CashFlowController
Endpoints:
- `GET /cash-flow` - List entries
  - Query params: `outlet_id`, `type`, `category`, `date_from`, `date_to`, `approval_status`, `page`, `limit`
  - Response: Paginated cash flow entries
  
- `POST /cash-flow` - Create entry
  - Body: CashFlowEntryDto
  - Auto-approval if < threshold
  - Response: Created entry
  
- `GET /cash-flow/:id` - Get entry
  - Response: Entry with category and references
  
- `PATCH /cash-flow/:id` - Update entry (pending only)
  - Body: Partial CashFlowEntryDto
  - Validation: Status must be PENDING
  
- `POST /cash-flow/:id/approve` - Approve/reject
  - Body: ApproveCashFlowDto
  - Requires APPROVE_CASH_FLOW permission
  
- `DELETE /cash-flow/:id` - Soft delete
  
- `GET /cash-flow/daily-summary` - Daily summary
  - Query params: `outlet_id`, `date`
  - Response: Daily cash flow summary
  
- `GET /cash-flow/analytics` - Analytics
  - Query params: `outlet_id`, `date_from`, `date_to`
  - Response: Cash flow trends and analysis

#### ExpenseCategoryController
Endpoints:
- `GET /expense-categories` - List categories
  - Query params: `outlet_id`, `type`, `is_active`
  - Response: Categories with budget info
  
- `POST /expense-categories` - Create category
  - Body: ExpenseCategoryDto
  
- `GET /expense-categories/:id` - Get category
  
- `PATCH /expense-categories/:id` - Update category
  
- `DELETE /expense-categories/:id` - Deactivate

#### DailyCashSummaryController
Endpoints:
- `GET /daily-cash-summary` - List summaries
  - Query params: `outlet_id`, `date_from`, `date_to`, `status`
  
- `GET /daily-cash-summary/:date` - Get summary for date
  
- `POST /daily-cash-summary` - Create/submit summary
  - Body: DailyCashSummaryDto
  
- `POST /daily-cash-summary/:date/approve` - Approve summary
  - Locks the summary for that date

### 7. Approval Workflows

#### Attendance Approval
- Manager reviews attendance
- Can modify late reasons
- Approve or reject
- Once approved, locked

#### Cash Flow Approval
- Amount < threshold: Auto-approved
- Amount >= threshold: Requires approval
- Expense categories can set custom threshold
- Approval audit trail

#### Daily Cash Summary Approval
- Prepared by outlet manager
- Submitted for approval
- Approved by higher authority
- Once approved, locked (no further changes)

### 8. API Response Format

All endpoints return:

**Success (201/200)**
```json
{
  "status": "success",
  "data": { /* attendance, cash flow, or summary */ },
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

### 9. Testing

#### Jest + Supertest Tests

**AttendanceService Tests**
- Checkin user
- Checkout user (calculate duration)
- Prevent duplicate checkin
- Detect late arrivals
- Detect overtime
- Attendance approval
- Monthly attendance calculation
- Late comer list

**CashFlowService Tests**
- Create cash-in entry
- Create expense entry
- Auto-approve < threshold
- Manual approve > threshold
- Reject entry
- Soft delete entry
- List entries with filtering
- Aggregate by category
- Aggregate by period

**DailyCashSummaryService Tests**
- Create daily summary
- Calculate net cash flow
- Reconcile with entries
- Submit summary
- Approve summary
- Lock summary after approval

**AttendanceController Tests**
- POST /attendance/checkin - Checkin (201)
- POST /attendance/checkout - Checkout (200)
- GET /attendance - List (200)
- GET /attendance/:id - Get (200)
- POST /attendance/:id/approve - Approve (200)
- GET /attendance/late-comers - Late list (200)
- Duplicate checkin (400)
- Checkout before checkin (400)

**CashFlowController Tests**
- POST /cash-flow - Create entry (201)
- GET /cash-flow - List (200)
- POST /cash-flow/:id/approve - Approve (200)
- Soft delete (200)
- Amount validation (400)
- Category validation (400)

### Test Execution
```bash
npm run test -- attendance
npm run test:e2e
```

## Key Features

✅ Staff checkin/checkout with GPS tracking  
✅ Automatic work duration calculation  
✅ Late arrival detection  
✅ Overtime tracking  
✅ Shift type management (morning, evening, full, night)  
✅ Attendance approval workflow  
✅ Monthly attendance statistics  
✅ Cash & expense entry tracking  
✅ Multiple payment methods support  
✅ Dynamic approval thresholds  
✅ Receipt attachment support  
✅ Expense category management  
✅ Budget limit tracking  
✅ Cash flow analytics  
✅ Daily cash summary with reconciliation  
✅ Cash discrepancy detection  
✅ Approval workflows (auto & manual)  
✅ Soft delete support  

## Files Created

### Entities
- `src/modules/attendance/entities/attendance-record.entity.ts`
- `src/modules/attendance/entities/cash-flow-entry.entity.ts`
- `src/modules/attendance/entities/expense-category.entity.ts`
- `src/modules/attendance/entities/daily-cash-summary.entity.ts`

### DTOs
- `src/modules/attendance/dtos/checkin.dto.ts`
- `src/modules/attendance/dtos/checkout.dto.ts`
- `src/modules/attendance/dtos/cash-flow.dtos.ts`
- `src/modules/attendance/dtos/attendance-response.dtos.ts`

### Repositories
- `src/modules/attendance/repositories/attendance.repository.ts`
- `src/modules/attendance/repositories/cash-flow.repository.ts`
- `src/modules/attendance/repositories/expense-category.repository.ts`
- `src/modules/attendance/repositories/daily-cash-summary.repository.ts`

### Services
- `src/modules/attendance/services/attendance.service.ts`
- `src/modules/attendance/services/cash-flow.service.ts`
- `src/modules/attendance/services/daily-cash-summary.service.ts`
- `src/modules/attendance/services/attendance-analytics.service.ts`
- `src/modules/attendance/services/cash-flow-analytics.service.ts`

### Controllers
- `src/modules/attendance/controllers/attendance.controller.ts`
- `src/modules/attendance/controllers/cash-flow.controller.ts`
- `src/modules/attendance/controllers/daily-cash-summary.controller.ts`
- `src/modules/attendance/controllers/expense-category.controller.ts`

### Module & Tests
- `src/modules/attendance/attendance.module.ts`
- `src/modules/attendance/attendance.service.spec.ts`
- `src/modules/attendance/attendance.controller.spec.ts`
- `test/attendance.e2e-spec.ts`

---

**Status**: ✅ Complete  
**Test Result**: All tests passing  
**Ready for**: Phase 9 - External Integrations Implementation
