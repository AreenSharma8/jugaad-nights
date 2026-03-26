# Integration Setup & Configuration Guide

## Quick Start

This guide provides step-by-step instructions to setup and run the integrated frontend and backend.

---

## Prerequisites

- **Node.js**: v20+ (https://nodejs.org/)
- **PostgreSQL**: 15+ (https://www.postgresql.org/)
- **Redis**: Latest (https://redis.io/)
- **Git**: Latest (https://git-scm.com/)

---

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Create `.env` file in `backend/` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=jugaad_nights

# Redis Configuration  
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Application Configuration
NODE_ENV=development
APP_PORT=3000
APP_NAME=Jugaad Nights Operations API

# Petpooja Integration
PETPOOJA_WEBHOOK_URL=http://localhost:3000/api/integrations/petpooja/webhook
PETPOOJA_VALIDATION_TOKEN=optional-static-token

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

### 3. Database Setup

**Create PostgreSQL database:**

```bash
psql -U postgres
CREATE DATABASE jugaad_nights;
\du  # Optional: check if user has proper permissions
```

**Run migrations:**

```bash
cd backend
npm run migration:run
```

**Optional: Seed test data:**

```bash
npm run seed
```

### 4. Start Backend Server

**Development mode (with auto-reload):**

```bash
npm run start:dev
```

**Production mode:**

```bash
npm run build
npm run start:prod
```

Backend will be available at: **http://localhost:3000**

### 5. Verify Backend is Running

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-03-24T10:30:00.000Z"
}
```

---

## Frontend Setup

### 1. Install Dependencies

```bash
cd .  # root directory (frontend)
npm install
# or
bun install  # if using Bun
```

### 2. Environment Configuration

Create `.env` file in root directory:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_ENV=development
```

### 3. Start Frontend Development Server

```bash
npm run dev
# or
bun run dev
```

Frontend will be available at: **http://localhost:5173**

### 4. Build for Production

```bash
npm run build
```

---

## Testing the Integration

### 1. Test Login

1. Open http://localhost:5173 in browser
2. Select role (Admin, Manager, or Staff)
3. Enter email: `admin@jugaadnights.com`
4. Enter password: any value (demo mode accepts any password)
5. Click "Sign In"
6. Should redirect to dashboard

### 2. Test Protected Routes

After login:
- Dashboard should display user information
- Navigation should work without redirecting to login
- Other authenticated pages should be accessible

### 3. Test JWT Token

**In browser console:**

```javascript
// Check token in localStorage
localStorage.getItem('auth_token');

// Check user in localStorage
JSON.parse(localStorage.getItem('auth_user'));

// Check logout works
// Click logout button, should redirect to login page
```

### 4. Test API Calls

**Sales API test (authenticated):**

```bash
curl -X GET http://localhost:3000/api/sales \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Replace YOUR_TOKEN_HERE with token from login response**

### 5. Test Petpooja Webhook

**Using cURL:**

```bash
curl -X POST http://localhost:3000/api/integrations/petpooja/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "orderdetails",
    "Restaurant": {
      "name": "Test Restaurant",
      "address": "123 Main St",
      "phone": "+91-1234567890",
      "restID": "rest-123",
      "city": "Ahmedabad",
      "state": "Gujarat"
    },
    "Customer": {
      "name": "Test Customer",
      "phone": "+91-9876543210",
      "email": "test@example.com",
      "gstin": "24ABCDE1234F2Z0"
    },
    "Order": {
      "order_id": "order-' + Date.now() + '",
      "order_type": "Dine In",
      "payment_type": "Cash",
      "order_from": "POS",
      "status": "Success",
      "total_amount": 450,
      "discount_amount": 0,
      "tax_amount": 81
    },
    "OrderItem": [
      {
        "item_name": "Butter Chicken",
        "item_size": "1kg",
        "quantity": 2,
        "unit_price": 225,
        "item_total": 450
      }
    ],
    "Tax": [
      {
        "tax_name": "SGST",
        "tax_percentage": 9,
        "tax_amount": 81
      }
    ],
    "Discount": []
  }'
```

**Expected response:**

```json
{
  "status": "success",
  "message": "Order data received and processed",
  "order_id": "order-..."
}
```

---

## API Testing with Postman

### Import Collection

1. Create new Postman collection: "Jugaad Nights"
2. Add requests as shown below

### Auth Endpoint

**Login**

```
POST http://localhost:3000/api/auth/login
Headers: Content-Type: application/json
Body:
{
  "email": "admin@jugaadnights.com",
  "password": "any-password"
}
```

**Save token from response**

### Sales Endpoints

**Get All Sales**

```
GET http://localhost:3000/api/sales
Headers: Authorization: Bearer {{token}}
```

**Get Sales Dashboard**

```
GET http://localhost:3000/api/sales/dashboard?outlet_id=550e8400-e29b-41d4-a716-446655440101
Headers: Authorization: Bearer {{token}}
```

**Create Order**

```
POST http://localhost:3000/api/sales/orders
Headers: 
  - Authorization: Bearer {{token}}
  - Content-Type: application/json
Body:
{
  "outlet_id": "550e8400-e29b-41d4-a716-446655440101",
  "customer_name": "John Doe",
  "order_type": "Dine In",
  "payment_type": "Cash",
  "total_amount": 450,
  "items": [
    {
      "item_name": "Butter Chicken",
      "quantity": 1,
      "unit_price": 350
    }
  ]
}
```

### Petpooja Webhook

**Receive Order**

```
POST http://localhost:3000/api/integrations/petpooja/webhook
Headers: Content-Type: application/json
Body: [See webhook payload above]
```

---

## Running Tests

### Backend Tests

**Unit & Integration Tests:**

```bash
cd backend
npm run test
```

**Test Coverage:**

```bash
npm run test:cov
```

**E2E Tests:**

```bash
npm run test:e2e
```

### Frontend Tests

**Run Tests:**

```bash
npm run test
```

**Watch Mode:**

```bash
npm run test:watch
```

---

## Docker Deployment (Optional)

### Backend Docker

**Build image:**

```bash
cd backend
docker build -t jugaad-backend .
```

**Run container:**

```bash
docker run -p 3000:3000 \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=5432 \
  -e DB_USERNAME=postgres \
  -e DB_PASSWORD=password \
  -e DB_NAME=jugaad_nights \
  -e REDIS_HOST=host.docker.internal \
  -e JWT_SECRET=secret \
  jugaad-backend
```

### Docker Compose

**Create docker-compose.yml in root:**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: jugaad_nights
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USERNAME: postgres
      DB_PASSWORD: postgres
      DB_NAME: jugaad_nights
      REDIS_HOST: redis
      REDIS_PORT: 6379
      JWT_SECRET: development-secret
    depends_on:
      - postgres
      - redis

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:3000/api
    depends_on:
      - backend

volumes:
  postgres_data:
```

**Start services:**

```bash
docker-compose up -d
```

**Stop services:**

```bash
docker-compose down
```

---

## Troubleshooting

### Issue: Backend fails to start

**Check port 3000 is not in use:**

```bash
# Windows
netstat -ano | findstr :3000

# macOS/Linux
lsof -i :3000
```

**Solution:** Kill process or change APP_PORT in .env

### Issue: Database connection failed

**Check PostgreSQL is running:**

```bash
psql -U postgres -d jugaad_nights
```

**Solution:** Verify DB_HOST, DB_PORT, credentials in .env

### Issue: Redis connection failed

**Check Redis is running:**

```bash
redis-cli ping
# Should return: PONG
```

**Solution:** Start Redis server or change REDIS_HOST in .env

### Issue: Frontend can't connect to backend

**Check CORS is enabled:**

Frontend .env should have:
```env
VITE_API_URL=http://localhost:3000/api
```

**Solution:** Verify backend CORS_ORIGIN matches frontend URL

### Issue: Login fails with "User not found"

**Solution:** Check email in .env matches mock user:
- `admin@jugaadnights.com`
- `manager@jugaadnights.com`
- `staff@jugaadnights.com`

### Issue: Token not being stored

**Check browser storage:**

1. Open DevTools (F12)
2. Go to Application > LocalStorage
3. Should see: `auth_token`, `auth_user`

**Solution:** Check browser allows localStorage

---

## Project Structure Summary

```
jugaad-nights-ops-hub-1/
├── backend/                          # NestJS backend
│   ├── src/
│   │   ├── common/
│   │   │   ├── guards/
│   │   │   ├── decorators/
│   │   │   └── utils/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── integrations/
│   │   │   │   ├── controllers/
│   │   │   │   ├── services/
│   │   │   │   └── dto/
│   │   │   └── [other modules]/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   ├── .env
│   └── Dockerfile
│
├── src/                              # React frontend
│   ├── services/                     # API service layer
│   │   ├── api.client.ts
│   │   ├── auth.service.ts
│   │   ├── authApi.service.ts
│   │   └── [module]Api.service.ts
│   ├── contexts/                     # Auth context
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── ProtectedRoute.tsx
│   ├── pages/
│   │   ├── Login.tsx
│   │   └── Dashboard.tsx
│   ├── components/
│   ├── App.tsx
│   └── main.tsx
│
├── package.json
├── .env
├── vite.config.ts
├── FRONTEND_INTEGRATION_GUIDE.md      # This file
└── README.md
```

---

## Performance Optimization

### Frontend

- Use React Query for server state management
- Implement code splitting with React.lazy
- Optimize images with WebP format
- Enable gzip compression

### Backend

- Add database indexing on frequently queried fields
- Implement Redis caching for dashboard data
- Use BullMQ for background jobs
- Add request logging and monitoring

---

## Security Considerations

1. **JWT_SECRET**: Change to strong random string in production
2. **HTTPS**: Use HTTPS in production
3. **CORS**: Whitelist allowed domains
4. **Rate Limiting**: Implement rate limiting on API endpoints
5. **Input Validation**: Always validate incoming payloads
6. **Authentication**: Enforce strong passwords
7. **Audit Logging**: Log all sensitive operations

---

## Next Steps

1. ✅ Start backend server
2. ✅ Start frontend server  
3. ✅ Test login flow
4. ✅ Test API endpoints
5. ✅ Test Petpooja webhook
6. ⬜ Connect to real PostgreSQL
7. ⬜ Setup real Petpooja account
8. ⬜ Configure WhatsApp integration
9. ⬜ Deploy to production
10. ⬜ Setup monitoring and alerting

---

## Support

For issues or questions:

1. Check [FRONTEND_INTEGRATION_GUIDE.md](./FRONTEND_INTEGRATION_GUIDE.md)
2. Review API documentation in backend/API_DOCUMENTATION.md
3. Check implementation docs in IMPLEMENTATION_DOCS/ folder
4. Review backend logs: `npm run start:dev`
5. Check frontend console for errors: DevTools > Console

