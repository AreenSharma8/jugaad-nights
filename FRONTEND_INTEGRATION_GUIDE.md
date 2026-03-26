# Frontend-Backend Integration Guide

## Overview

This guide provides comprehensive documentation for integrating the Jugaad Nights frontend with the backend API, implementing JWT authentication with RBAC, and handling Petpooja webhook integration.

---

## Table of Contents

1. [Architecture](#architecture)
2. [API Service Layer](#api-service-layer)
3. [Authentication & Authorization](#authentication--authorization)
4. [Frontend Integration Examples](#frontend-integration-examples)
5. [Petpooja Webhook Integration](#petpooja-webhook-integration)
6. [Testing Guide](#testing-guide)
7. [Troubleshooting](#troubleshooting)

---

## Architecture

### Frontend Structure

```
src/
├── contexts/
│   └── AuthContext.tsx          # Authentication state management
├── hooks/
│   ├── useAuth.ts               # Auth context consumer
│   └── ProtectedRoute.tsx        # Route protection with RBAC
├── services/
│   ├── api.client.ts            # Base HTTP client
│   ├── auth.service.ts          # Token storage utilities
│   ├── authApi.service.ts       # Auth API endpoints
│   ├── [module]Api.service.ts   # Module-specific APIs
│   └── index.ts                 # Service exports
└── pages/
    ├── Login.tsx                # Login page with API integration
    └── Dashboard.tsx            # Example dashboard with API calls
```

### Backend Structure

```
backend/src/
├── common/
│   ├── utils/
│   │   └── jwt.service.ts       # JWT signing and verification
│   ├── guards/
│   │   ├── jwt-auth.guard.ts    # JWT validation guard
│   │   └── roles.guard.ts       # RBAC guard
│   └── decorators/
│       ├── roles.decorator.ts   # @Roles() decorator
│       ├── public.decorator.ts  # @Public() decorator
│       └── current-user.decorator.ts  # @CurrentUser() decorator
├── modules/
│   ├── auth/
│   │   ├── auth.service.ts      # Login and token generation
│   │   └── auth.controller.ts   # Auth endpoints
│   ├── integrations/
│   │   ├── controllers/
│   │   │   └── petpooja-webhook.controller.ts
│   │   ├── services/
│   │   │   ├── petpooja.service.ts
│   │   │   └── petpooja-events.service.ts
│   │   └── dto/
│   │       ├── integration.dto.ts
│   │       └── petpooja.dto.ts
│   └── [module]/
│       ├── [module].controller.ts
│       └── [module].service.ts
```

---

## API Service Layer

### Base API Client

The `api.client.ts` provides a centralized HTTP client with automatic token injection:

```typescript
import { apiClient } from '@/services';

// GET request
const data = await apiClient.get('/endpoint');

// POST request with body
const result = await apiClient.post('/endpoint', { field: 'value' });

// PATCH request
const updated = await apiClient.patch('/endpoint/:id', { field: 'new value' });

// DELETE request
await apiClient.delete('/endpoint/:id');
```

### Authentication Service

Token management utilities:

```typescript
import { authService } from '@/services';

// Store token after login
authService.setAuth(loginResponse);

// Get token
const token = authService.getToken();

// Check if authenticated
if (authService.isAuthenticated()) { ... }

// Check roles
if (authService.hasRole('admin')) { ... }
if (authService.hasAnyRole(['admin', 'manager'])) { ... }

// Clear auth
authService.clearAuth();
```

### Module-Specific API Services

Example: Sales API

```typescript
import { salesApi } from '@/services';

// Get sales data
const orders = await salesApi.getSales({
  outlet_id: 'outlet-123',
  start_date: '2026-03-01',
  end_date: '2026-03-31',
  limit: 50
});

// Get sales trends
const trends = await salesApi.getTrends('outlet-123', 30); // Last 30 days

// Get dashboard summary
const dashboard = await salesApi.getDashboard('outlet-123');

// Create order
const newOrder = await salesApi.createOrder({
  outlet_id: 'outlet-123',
  customer_name: 'John Doe',
  order_type: 'Dine In',
  payment_type: 'Cash',
  total_amount: 450,
  items: [...],
  // ... other fields
});
```

---

## Authentication & Authorization

### Login Flow

**Frontend (Login.tsx):**

```typescript
import { useAuth } from '@/hooks/useAuth';

export const Login = () => {
  const { login, isLoading, error } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      showError(err.message);
    }
  };

  return <form onSubmit={handleLogin}>...</form>;
};
```

**Backend (auth.controller.ts):**

```typescript
@Post('login')
async login(@Body() loginDto: LoginDto): Promise<ApiResponse> {
  const result = await this.authService.login(loginDto);
  // Returns: { user, token }
}
```

### JWT Token Structure

The JWT token contains:

```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "role": "admin",
  "roles": ["admin", "manager"],
  "outlet_id": "outlet-uuid",
  "iat": 1234567890,
  "exp": 1234654290
}
```

### Protected Routes

**Frontend ProtectedRoute:**

```typescript
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute requiredRoles={['admin', 'manager']}>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

**Backend Endpoint Protection:**

```typescript
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesController {
  
  // Admin only endpoint
  @Get()
  @Roles('admin')
  async getAllSales() { ... }

  // Manager and Admin
  @Get('outlet/:id')
  @Roles('admin', 'manager')
  async getOutletSales(@Param('id') outletId: string) { ... }

  // Public endpoint (no auth required)
  @Post('webhook')
  @Public()
  async handleWebhook(@Body() payload: any) { ... }

  // Any authenticated user
  @Get('my-sales')
  async getMySales(@CurrentUser() user: JwtPayload) {
    // user contains { sub, email, role, roles, outlet_id, iat, exp }
  }
}
```

---

## Frontend Integration Examples

### Example 1: Dashboard with API Integration

```typescript
import { useEffect, useState } from 'react';
import { dashboardApi } from '@/services';
import { useAuth } from '@/hooks/useAuth';

export const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const outletId = user?.outlet_id;
        const dashboardData = await dashboardApi.getDashboard({ outlet_id: outletId });
        setData(dashboardData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.outlet_id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Sales: {data?.metrics?.today_sales}</h1>
      {/* Render data... */}
    </div>
  );
};
```

### Example 2: Sales Module with Filtering

```typescript
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { salesApi } from '@/services';
import { useAuth } from '@/hooks/useAuth';

export const Sales = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    outlet_id: user?.outlet_id,
    start_date: '2026-03-01',
    end_date: '2026-03-31',
  });

  // Fetch sales data
  const { data: orders, isLoading } = useQuery({
    queryKey: ['sales', filters],
    queryFn: () => salesApi.getSales(filters),
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: (orderData) => salesApi.createOrder(orderData),
    onSuccess: () => {
      // Refresh sales list
      queryClient.invalidateQueries({ queryKey: ['sales', filters] });
    },
  });

  const handleCreateOrder = async (formData) => {
    try {
      await createOrderMutation.mutateAsync({
        ...formData,
        outlet_id: user?.outlet_id,
      });
      toast.success('Order created successfully');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      {/* Filters */}
      {/* Orders Table */}
      {/* Create Order Form */}
    </div>
  );
};
```

### Example 3: Role-Based UI

```typescript
import { useAuth } from '@/hooks/useAuth';

export const Operations = () => {
  const { hasRole, hasAnyRole } = useAuth();

  return (
    <div>
      {hasRole('admin') && (
        <AdminPanel />
      )}
      
      {hasAnyRole(['admin', 'manager']) && (
        <ReportsSection />
      )}

      {!hasRole('admin') && (
        <LimitedViewSection />
      )}
    </div>
  );
};
```

---

## Petpooja Webhook Integration

### Webhook Endpoint

**URL:** `POST /integrations/petpooja/webhook`  
**Authentication:** None (public endpoint)  
**Rate Limit:** None (handle any traffic volume)

### Payload Structure

```json
{
  "event": "orderdetails",
  "Restaurant": {
    "name": "Your Restaurant",
    "address": "Address",
    "phone": "+91-1234567890",
    "restID": "uniqueRestaurantID",
    "city": "Ahmedabad",
    "state": "Gujarat"
  },
  "Customer": {
    "name": "John Doe",
    "phone": "+91-9876543210",
    "email": "john@example.com",
    "gstin": "24ABCDE1234F2Z0"
  },
  "Order": {
    "token": "optional-static-token",
    "order_id": "12345",
    "order_type": "Dine In",
    "payment_type": "Cash",
    "order_from": "POS",
    "order_from_id": null,
    "sub_order_type": "AC",
    "status": "Success",
    "total_amount": 450,
    "discount_amount": 50,
    "tax_amount": 81,
    "payment_status": "Paid",
    "paid_amount": 450
  },
  "OrderItem": [
    {
      "item_id": "item-123",
      "item_name": "Butter Chicken",
      "item_size": "1kg",
      "quantity": 1,
      "unit_price": 350,
      "item_total": 350
    }
  ],
  "Tax": [
    {
      "tax_name": "SGST",
      "tax_percentage": 9,
      "tax_amount": 40.5
    }
  ],
  "Discount": [
    {
      "discount_name": "Happy Hour",
      "discount_type": "percentage",
      "discount_value": 10,
      "discount_amount": 50
    }
  ],
  "timestamp": 1626000000
}
```

### Backend Processing

The webhook is processed in `PetpoojaEventsService`:

1. **Validation**: Checks event type and required fields
2. **Token Validation**: Optional token validation against outlet configuration
3. **Deduplication**: Prevents processing duplicate orders within 1-minute window
4. **Mapping**: Converts Petpooja format to internal order format
5. **Storage**: Saves order with idempotency check (using `remote_order_id`)
6. **Downstream**: Triggers inventory updates, notifications, etc.

### Testing the Webhook

**Using cURL:**

```bash
curl -X POST http://localhost:3000/api/integrations/petpooja/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "orderdetails",
    "Restaurant": {
      "name": "Test Restaurant",
      "restID": "test-rest-123"
    },
    "Customer": {
      "name": "Test Customer",
      "phone": "+91-9876543210"
    },
    "Order": {
      "order_id": "order-123",
      "order_type": "Dine In",
      "payment_type": "Cash",
      "order_from": "POS",
      "status": "Success",
      "total_amount": 450
    },
    "OrderItem": []
  }'
```

**Using Postman:**

1. Create new POST request
2. URL: `http://localhost:3000/api/integrations/petpooja/webhook`
3. Body (JSON):
```json
{
  "event": "orderdetails",
  // ... payload
}
```

### Frontend Listening for Webhook Events

If you need to listen to webhook events on the frontend (e.g., real-time updates), use Server-Sent Events or WebSockets:

```typescript
// Setup EventSource for real-time updates
const source = new EventSource('http://localhost:3000/api/events/orders');

source.onmessage = (event) => {
  const order = JSON.parse(event.data);
  // Update UI with new order
};

source.onerror = (error) => {
  console.error('Event stream error:', error);
  source.close();
};
```

---

## Testing Guide

### 1. Test Authentication

**Test Case 1: Login with valid credentials**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@jugaadnights.com",
    "password": "any-password"
  }'
```

Expected Response:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "...",
      "email": "admin@jugaadnights.com",
      "role": "admin",
      "roles": ["admin", "manager", "staff"]
    },
    "token": "eyJhbGc..."
  }
}
```

### 2. Test Protected Endpoint

```bash
curl -X GET http://localhost:3000/api/sales \
  -H "Authorization: Bearer eyJhbGc..."
```

### 3. Test Role-Based Access

```bash
# Admin endpoint (staff should be denied)
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer staff-token"
```

Expected: 403 Forbidden

### 4. Test Frontend Login

1. Open http://localhost:5173/
2. Select "Admin" role
3. Enter email: `admin@jugaadnights.com`
4. Enter password: any value
5. Click "Sign In"
6. Should redirect to dashboard

### 5. Test Petpooja Webhook

Use the cURL example provided above or create a Postman collection.

---

## Troubleshooting

### Issue: Login fails with "Invalid token"

**Solution:**
- Check JWT_SECRET is set in backend .env
- Ensure token is properly stored in localStorage
- Verify token hasn't expired

### Issue: Protected routes show 403 Forbidden

**Solution:**
- Check user role is in requiredRoles list
- Verify JWT payload contains roles array
- Check RolesGuard is properly configured

### Issue: API calls return 401 Unauthorized

**Solution:**
- Ensure token is being sent in Authorization header
- Verify token is valid and hasn't expired
- Check JwtAuthGuard is applied to route

### Issue: Petpooja webhook returns 400 Bad Request

**Solution:**
- Validate payload contains all required fields
- Check event type is "orderdetails"
- Verify JSON format is correct
- Check for missing Restaurant, Customer, or Order objects

### Issue: Duplicate orders being created

**Solution:**
- Check DUPLICATE_CHECK_WINDOW in petpooja-events.service.ts
- Verify remote_order_id is unique per order
- Check database has unique constraint on remote_order_id

---

## Environment Variables

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_ENV=development
```

### Backend (.env)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=jugaad_nights

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key-change-in-production

# Application
NODE_ENV=development
APP_PORT=3000
APP_NAME=Jugaad Nights Operations API
```

---

## Next Steps

1. **Database Integration**: Connect order storage to PostgreSQL
2. **Real-time Updates**: Implement WebSockets for live order updates
3. **Notification Service**: Trigger WhatsApp/Email on order receipt
4. **Analytics**: Connect dashboard to real data
5. **Performance**: Add caching with Redis
6. **Monitoring**: Setup error tracking and logging

