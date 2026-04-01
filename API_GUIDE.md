# API Documentation

## Base URLs

| Environment | URL |
|-------------|-----|
| **Development** | http://localhost:3000 |
| **Docker** | http://localhost:3000 |
| **Production** | TBD |

**API Endpoint Base**: `/api`

---

## Authentication

All endpoints (except login/signup) require Bearer token:

```bash
Authorization: Bearer <jwt_token>
```

### Token Format
- **Type**: JWT (JSON Web Token)
- **Algorithm**: HS256
- **Payload**:
  ```json
  {
    "sub": "user-id",
    "email": "user@example.com",
    "role": "admin",
    "outlet_id": "outlet-id",
    "iat": 1234567890,
    "exp": 1234654290
  }
  ```

---

## Response Format

### Success Response
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "John Doe"
  },
  "timestamp": "2026-04-01T20:00:00.000Z"
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "timestamp": "2026-04-01T20:00:00.000Z"
}
```

---

## Authentication Endpoints

### POST /auth/login
Authenticate user with credentials

**Request**:
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@jugaadnights.com",
  "password": "Demo@12345"
}
```

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@jugaadnights.com",
      "name": "Admin User",
      "role": "admin",
      "roles": ["admin"],
      "outlet_id": "outlet-uuid",
      "user_type": "admin"
    },
    "token": "eyJhbGc..."
  }
}
```

---

### POST /auth/signup/customer
Customer self-registration

**Request**:
```bash
POST /api/auth/signup/customer
Content-Type: application/json

{
  "email": "customer@example.com",
  "password": "SecurePass123!",
  "name": "Customer Name",
  "phone": "+91-9999-999-999"
}
```

**Response** (201): Same as login

---

### POST /auth/signup/staff
Admin creates staff account

**Request**:
```bash
POST /api/auth/signup/staff
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "staff@example.com",
  "password": "SecurePass123!",
  "name": "Staff Member",
  "phone": "+91-9999-999-998",
  "role_id": "role-uuid"
}
```

**Response** (201): Same as login

---

### POST /auth/verify
Verify token validity

**Request**:
```bash
POST /api/auth/verify
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "valid": true
  }
}
```

---

### GET /auth/me
Get current authenticated user

**Request**:
```bash
GET /api/auth/me
Authorization: Bearer <token>
```

**Response** (200): User object

---

### POST /auth/refresh
Refresh expired token

**Request**:
```bash
POST /api/auth/refresh
Authorization: Bearer <expired_token>
```

**Response** (200): New token object

---

### POST /auth/logout
Logout current user

**Request**:
```bash
POST /api/auth/logout
Authorization: Bearer <token>
```

**Response** (200): `{"status": "success"}`

---

## Users Endpoints

### GET /users
Get all users (admin only)

**Request**:
```bash
GET /api/users?page=1&limit=10&search=john
Authorization: Bearer <token>
```

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Filter by name/email
- `role`: Filter by role

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "items": [...],
    "total": 50,
    "page": 1,
    "limit": 10
  }
}
```

---

### GET /users/:id
Get user details

**Request**:
```bash
GET /api/users/user-uuid
Authorization: Bearer <token>
```

**Response** (200): User object

---

### PATCH /users/:id
Update user

**Request**:
```bash
PATCH /api/users/user-uuid
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "+91-..."
}
```

**Response** (200): Updated user

---

## Sales Endpoints

### POST /sales/orders
Create sales order

**Request**:
```bash
POST /api/sales/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "outlet_id": "outlet-uuid",
  "customer_name": "John",
  "items": [
    {
      "product_id": "product-uuid",
      "quantity": 2,
      "unit_price": 100
    }
  ],
  "payment_method": "cash",
  "total_amount": 200
}
```

**Response** (201): Created order

---

### GET /sales/orders
Get sales orders

**Request**:
```bash
GET /api/sales/orders?outlet_id=uuid&date_from=2026-04-01
Authorization: Bearer <token>
```

**Query Parameters**:
- `outlet_id`: Filter by outlet
- `date_from`: Start date
- `date_to`: End date
- `payment_method`: cash/card/online
- `status`: pending/completed/cancelled

**Response** (200): Paginated orders

---

### GET /sales/orders/:id
Get order details

**Request**:
```bash
GET /api/sales/orders/order-uuid
Authorization: Bearer <token>
```

**Response** (200): Order object with items

---

### PATCH /sales/orders/:id
Update order

**Request**:
```bash
PATCH /api/sales/orders/order-uuid
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "completed",
  "notes": "Updated notes"
}
```

**Response** (200): Updated order

---

## Inventory Endpoints

### GET /inventory/items
Get inventory items

**Request**:
```bash
GET /api/inventory/items?outlet_id=uuid&category=beverages
Authorization: Bearer <token>
```

**Query Parameters**:
- `outlet_id`: Filter by outlet
- `category`: Filter by category
- `low_stock`: Boolean (show low stock items)

**Response** (200): List of items

---

### POST /inventory/adjustments
Adjust stock

**Request**:
```bash
POST /api/inventory/adjustments
Authorization: Bearer <token>
Content-Type: application/json

{
  "outlet_id": "outlet-uuid",
  "item_id": "item-uuid",
  "adjustment_type": "add|remove|correction",
  "quantity": 10,
  "reason": "Stock received from supplier"
}
```

**Response** (201): Created adjustment

---

## Reports Endpoints

### GET /reports/daily-sales
Daily sales report

**Request**:
```bash
GET /api/reports/daily-sales?outlet_id=uuid&date=2026-04-01
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "date": "2026-04-01",
    "outlet_id": "uuid",
    "total_sales": 5000,
    "order_count": 25,
    "payment_breakdown": {
      "cash": 3000,
      "card": 2000
    }
  }
}
```

---

### GET /reports/inventory-summary
Inventory summary report

**Request**:
```bash
GET /api/reports/inventory-summary?outlet_id=uuid
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "total_items": 150,
    "low_stock_items": 5,
    "total_value": 50000
  }
}
```

---

## Health Endpoints

### GET /health
System health check

**Request**:
```bash
GET /api/health
```

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "status": "success",
    "database": "connected",
    "redis": "connected"
  }
}
```

---

## Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| `SUCCESS` | 200 | Request successful |
| `CREATED` | 201 | Resource created |
| `BAD_REQUEST` | 400 | Invalid request |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | No permission |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict |
| `VALIDATION_ERROR` | 422 | Validation failed |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting

Currently: No rate limiting enabled

Future: Will implement per-user rate limits

---

## Pagination

Implemented on list endpoints:

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Response Includes**:
- `items`: Array of results
- `total`: Total count
- `page`: Current page
- `limit`: Items per page

---

## Testing with cURL

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@jugaadnights.com",
    "password": "Demo@12345"
  }'
```

### Get Users (with token)
```bash
TOKEN="your_jwt_token_here"

curl http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN"
```

---

## API Versioning

Current Version: **v1** (default)

Future: Support `Accept: application/vnd.jugaad+json;version=2`

