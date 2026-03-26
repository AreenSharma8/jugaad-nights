# Jugaad Nights Backend API Documentation

## Overview

Complete backend application for Jugaad Nights Operations Management System built with NestJS, PostgreSQL, and Redis.

## Architecture

- **Framework**: NestJS v10+
- **Database**: PostgreSQL 15+
- **Caching**: Redis
- **API Documentation**: Swagger/OpenAPI
- **Report Generation**: ExcelJS, PDFKit
- **Containerization**: Docker & Docker Compose

## Project Structure

```
backend/
├── src/
│   ├── config/              # Database & Redis configuration
│   ├── common/              # Global filters, interceptors, pipes, middleware
│   ├── modules/
│   │   ├── users/           # User management & RBAC
│   │   ├── outlets/         # Restaurant outlet management
│   │   ├── sales/           # Sales orders & analytics
│   │   ├── inventory/       # Stock tracking & management
│   │   ├── wastage/         # Wastage tracking
│   │   ├── party-orders/    # Event order management
│   │   ├── attendance/      # Staff attendance tracking
│   │   ├── cashflow/        # Cash flow management
│   │   ├── analytics/       # Dashboard metrics
│   │   ├── reports/         # PDF/Excel report generation
│   │   ├── integrations/    # PetPooja & WhatsApp integrations
│   │   └── notifications/   # Notification system
│   └── services/            # Shared services (Redis)
└── Dockerfile               # Container image definition
```

## Environment Variables

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=jugaad_nights

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Application
NODE_ENV=development
APP_PORT=3000
APP_NAME=Jugaad Nights Operations API
JWT_SECRET=your-secret-key
```

## API Endpoints

### Core Endpoints

- `GET /api/docs` - Swagger API Documentation
- `GET /health` - Application health check

### User Management
- `GET /users` - List all users
- `POST /users` - Create new user
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `POST /users/:id/roles` - Assign roles to user

### Outlet Management
- `GET /outlets` - List all outlets
- `POST /outlets` - Create outlet
- `GET /outlets/:id` - Get outlet details
- `PATCH /outlets/:id` - Update outlet

### Sales Module
- `GET /sales` - Fetch sales data
- `GET /sales/trends` - Sales trend analysis
- `POST /sales/orders` - Create order
- `GET /sales/dashboard` - Dashboard metrics

### Inventory Management
- `GET /inventory` - List inventory items
- `POST /inventory` - Add inventory item
- `PATCH /inventory/:id` - Update stock
- `GET /inventory/low-stock` - Low stock alerts

### Wastage Tracking
- `GET /wastage` - Fetch wastage logs
- `POST /wastage` - Log wastage
- `GET /wastage/analytics` - Wastage analytics

### Party Orders
- `GET /party-orders` - List party orders
- `POST /party-orders` - Create party order
- `GET /party-orders/:id` - Get party order details

### Attendance
- `POST /attendance/checkin` - Staff check-in
- `POST /attendance/checkout` - Staff check-out
- `GET /attendance` - Attendance records

### Cash Flow
- `GET /cashflow` - Cash flow entries
- `POST /cashflow` - Add cash flow entry

### Reports
- `POST /reports/generate` - Generate report (PDF/Excel)
- `GET /reports/:id` - Download report
- `GET /reports/history/:outlet_id` - Report history

### Integrations
- `POST /integrations/petpooja/sync` - Trigger PetPooja sync
- `GET /integrations/petpooja/history/:outlet_id` - Sync history
- `POST /integrations/whatsapp/send` - Send WhatsApp message

## API Response Format

### Success Response
```json
{
  "status": "success",
  "data": {},
  "timestamp": "2026-03-12T10:30:00.000Z"
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "code": "ERROR_CODE",
  "timestamp": "2026-03-12T10:30:00.000Z"
}
```

## Running the Application

### Development
```bash
cd backend
npm install
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

## Docker Deployment

### Build and Run with Docker Compose
```bash
docker-compose up -d
```

This will start:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Backend API (port 3000)

### Individual Container Build
```bash
cd backend
docker build -t jugaad-nights-backend:latest .
docker run -p 3000:3000 jugaad-nights-backend:latest
```

## Database Schema

Key tables with multi-outlet support:

- `users` - User accounts with roles
- `roles` - Role definitions
- `permissions` - Permission definitions
- `outlets` - Restaurant outlet management
- `orders` - Sales orders
- `order_items` - Order line items
- `payments` - Payment records
- `inventory_items` - Inventory items
- `stock_transactions` - Stock history
- `purchase_orders` - Vendor purchase orders
- `wastage_entries` - Wastage logs
- `party_orders` - Event orders
- `party_order_items` - Party order items
- `attendance_records` - Staff attendance
- `cash_flow_entries` - Cash flow records
- `reports` - Generated reports
- `petpooja_sync_logs` - Integration sync logs

## Testing

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## Key Features

✅ **Multi-Outlet Support** - All data isolated by outlet_id
✅ **RBAC** - Role-based access control system
✅ **Real-time Cache** - Redis caching for dashboards
✅ **Report Generation** - PDF & Excel exports
✅ **PetPooja Integration** - Sync orders, inventory, menu
✅ **WhatsApp Notifications** - Alerts and updates
✅ **Audit Trail** - created_by, updated_by tracking
✅ **Soft Deletes** - Logical deletion with deleted_at
✅ **API Documentation** - Full Swagger documentation
✅ **Docker Support** - Production-ready containerization

## Development Guidelines

### Adding a New Module

1. Create `src/modules/module-name/`
2. Generate entities in `entities/`
3. Create DTOs in `dto/`
4. Implement repositories in `repositories/`
5. Create service in `module-name.service.ts`
6. Create controller in `module-name.controller.ts`
7. Create module in `module-name.module.ts`
8. Import in `app.module.ts`

### Database Migrations

```bash
# Create migration
npm run typeorm migration:create src/migrations/MigrationName

# Run migrations
npm run typeorm migration:run

# Revert migration
npm run typeorm migration:revert
```

## Performance Optimization

- ✅ Database query optimization with eager loading
- ✅ Redis caching for frequently accessed data
- ✅ Pagination for large datasets
- ✅ Index optimization on foreign keys
- ✅ Connection pooling for database

## Security Best Practices

- ✅ Input validation with class-validator
- ✅ Error handling with global exception filter
- ✅ CORS enabled for specific origins
- ✅ Bearer token authentication support
- ✅ Role-based access control

## Deployment

### Prerequisites
- Node.js v20+
- PostgreSQL 15+
- Redis 7+
- Docker (optional)

### Environment Setup
1. Copy `.env.example` to `.env`
2. Update database credentials
3. Configure Redis connection
4. Set JWT_SECRET for authentication

### Production Build
```bash
npm run build
npm run start:prod
```

## Support & Documentation

- Swagger API Docs: `http://localhost:3000/api/docs`
- GitHub Repository: [jugaad-nights-ops-hub](https://github.com/your-org/jugaad-nights-ops-hub)

## License

Proprietary - All rights reserved
