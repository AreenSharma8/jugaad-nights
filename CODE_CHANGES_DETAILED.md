# Code Changes - Unit Price Validation Fix

## File 1: Frontend - src/pages/Sales.tsx

### Change 1: handleEditOrder() Function
**Purpose**: Convert string prices from database to numbers when prefilling edit form

**Location**: Lines 135-155

```typescript
// ❌ BEFORE (Lines 135-155)
const handleEditOrder = (order: any) => {
  // Pre-fill form with order data
  setFormData({
    customer_name: order.customer_info?.name || "",
    customer_phone: order.customer_info?.phone || "",
    order_type: order.order_type || "Dine In",
    payment_type: order.payment_type || "Cash",
    items: order.items?.map((item: any) => ({
      item_name: item.item_name,
      quantity: item.quantity,                    // String from DB
      unit_price: item.unit_price,                // String from DB
    })) || [{ item_name: "", quantity: 1, unit_price: 0 }],
  });
  setEditingOrderId(order.id);
  setShowForm(true);
};

// ✅ AFTER (Lines 135-155)
const handleEditOrder = (order: any) => {
  // Pre-fill form with order data
  setFormData({
    customer_name: order.customer_info?.name || "",
    customer_phone: order.customer_info?.phone || "",
    order_type: order.order_type || "Dine In",
    payment_type: order.payment_type || "Cash",
    items: order.items?.map((item: any) => ({
      item_name: item.item_name,
      quantity: parseInt(String(item.quantity)) || 1,        // ✓ Converted to number
      unit_price: parseFloat(String(item.unit_price)) || 0,  // ✓ Converted to number
    })) || [{ item_name: "", quantity: 1, unit_price: 0 }],
  });
  setEditingOrderId(order.id);
  setShowForm(true);
};
```

### Change 2: handleSubmitOrder() Function  
**Purpose**: Ensure all numeric fields are properly typed before sending to API

**Location**: Lines 157-197

```typescript
// ❌ BEFORE (Lines 157-197)
const handleSubmitOrder = (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }

  const orderData = {
    customer_name: formData.customer_name || 'Walk-in Customer',
    customer_phone: formData.customer_phone || 'N/A',
    order_type: formData.order_type,
    payment_type: formData.payment_type,
    items: formData.items.filter(item => item.item_name && item.quantity && item.unit_price),
    outlet_id: user?.outlet_id,
  };

  // ... rest of function
};

// ✅ AFTER (Lines 157-197)
const handleSubmitOrder = (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }

  const orderData = {
    customer_name: formData.customer_name || 'Walk-in Customer',
    customer_phone: formData.customer_phone || 'N/A',
    order_type: formData.order_type,
    payment_type: formData.payment_type,
    items: formData.items
      .filter(item => item.item_name && item.quantity && item.unit_price)
      .map(item => ({                                          // ✓ Type conversion mapping
        item_name: item.item_name,
        quantity: parseInt(String(item.quantity)) || 1,        // ✓ Ensure integer
        unit_price: parseFloat(String(item.unit_price)) || 0,  // ✓ Ensure decimal number
      })),
    outlet_id: user?.outlet_id,
  };

  // ... rest of function
};
```

---

## File 2: Backend - backend/src/modules/sales/dto/sales.dto.ts

### Change 1: CreateOrderItemDto Class
**Purpose**: Add type transformation for numeric fields

**Location**: Lines 1-15

```typescript
// ❌ BEFORE (Lines 1-15)
import { IsNotEmpty, IsNumber, IsString, IsOptional, IsUUID, IsArray, ValidateNested, Matches, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsNotEmpty()
  @IsString()
  item_name: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  unit_price: number;

  @IsOptional()
  item_details?: Record<string, any>;
}

// ✅ AFTER (Lines 1-15)
import { IsNotEmpty, IsNumber, IsString, IsOptional, IsUUID, IsArray, ValidateNested, Matches, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsNotEmpty()
  @IsString()
  item_name: string;

  @IsNotEmpty()
  @Type(() => Number)  // ✓ Convert string to number
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @Type(() => Number)  // ✓ Convert string to number
  @IsNumber()
  unit_price: number;

  @IsOptional()
  item_details?: Record<string, any>;
}
```

### Change 2: CreateOrderDto Class
**Purpose**: Add type transformation for discount_amount field

**Location**: Lines 49-51

```typescript
// ❌ BEFORE (Lines 49-51)
export class CreateOrderDto {
  // ... other fields ...
  
  @IsOptional()
  @IsNumber()
  discount_amount?: number;
}

// ✅ AFTER (Lines 49-51)
export class CreateOrderDto {
  // ... other fields ...
  
  @IsOptional()
  @Type(() => Number)  // ✓ Convert string to number
  @IsNumber()
  discount_amount?: number;
}
```

---

## Why These Specific Changes

### Frontend Conversions

1. **`parseInt(String(...))`** for quantity:
   - Quantity should be whole numbers (1, 2, 3...)
   - Fallback to 1 if conversion fails

2. **`parseFloat(String(...))`** for unit_price:
   - Price can have decimals (280.50, 55.00...)
   - Fallback to 0 if conversion fails

3. **Defensive Coding**:
   - `String()` conversion handles case where value is already a number
   - Fallback values prevent sending NaN to API

### Backend Decorators

1. **`@Type(() => Number)` MUST come BEFORE `@IsNumber()`**:
   - Order is critical: transform first, then validate
   - If validation happens first, it rejects the string
   - `class-transformer` runs before `class-validator` with proper decorator order

2. **Location in DTO**:
   - Applied to `CreateOrderItemDto` which is nested in items array
   - Applied to parent `CreateOrderDto` for direct properties
   - Ensures consistency across nested and flat structures

---

## Validation Flow (Fixed)

### Before Fix
```
Frontend sends: { unit_price: "280.00" }
    ↓
Backend receives JSON string
    ↓
@IsNumber() validator runs
    ↓
❌ FAILS: "280.00" is string, not number → 400 Bad Request
```

### After Fix
```
Frontend sends: { unit_price: 280 }
    ↓
Backend receives JSON number
    ↓
@Type(() => Number) transforms (already correct type)
    ↓
@IsNumber() validator runs
    ↓
✅ PASSES: 280 is number → Request continues
```

---

## Testing the Fix

### Frontend Test
```javascript
// Before: Form contained strings
{ quantity: "1", unit_price: "280.00" }

// After: Form sends numbers
{ quantity: 1, unit_price: 280 }
```

### Backend Test
```bash
# Before: This failed with 400
curl -X PATCH http://localhost:3000/api/sales/order-id \
  -H "Content-Type: application/json" \
  -d '{"items":[{"unit_price":"280.00"}]}'

# After: This passes validation
curl -X PATCH http://localhost:3000/api/sales/order-id \
  -H "Content-Type: application/json" \
  -d '{"items":[{"unit_price":280}]}'
```

---

## Summary

**Total Files Changed**: 2
**Total Lines Modified**: ~15
**Complexity**: Low
**Impact**: High (Fixes critical feature)
**Backward Compatibility**: ✅ Yes (defensive coding handles both)
