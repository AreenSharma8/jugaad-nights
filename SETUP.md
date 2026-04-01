# Jugaad Nights Operations Hub - Setup Guide

## 🚀 Quick Start (Choose One)

### Option 1: Docker Compose (Recommended - All-in-One)
```bash
./start.sh
# or manually:
docker-compose up --build
```

**Access:**
- Frontend: http://localhost:8080
- Backend API: http://localhost:3000
- API Docs: http://localhost:3000/api/docs

**See:** [00_START_HERE_DOCKER.md](./00_START_HERE_DOCKER.md)

---

### Option 2: Local Development (3 Terminals)

**Terminal 1 - Database & Cache:**
```bash
docker-compose up postgres redis -d
# Wait for services to be healthy
```

**Terminal 2 - Backend:**
```bash
cd backend
npm install
npm run build
npm run migration:run       # Apply database migrations
npm run start:dev           # Start NestJS API
```

**Terminal 3 - Frontend:**
```bash
npm install
npm run dev
```

**Access:**
- Frontend: http://localhost:8080
- Backend API: http://localhost:3000

---

## 📋 Project Structure

```
jugaad-nights/
├── backend/
│   ├── src/
│   │   ├── migrations/              # TypeORM database migrations
│   │   ├── modules/                 # 12 feature modules
│   │   ├── config/                  # Database configuration
│   │   └── common/                  # Shared utilities
│   ├── package.json                 # Backend dependencies
│   └── README.md                    # Backend documentation
├── src/                             # Frontend React code
├── docker-compose.yml               # Docker orchestration
├── 00_START_HERE_DOCKER.md          # Docker quick start
├── TYPEORM_QUICK_START_MIGRATIONS.md
└── [other documentation files]
```

---

## 🗄️ Database Migrations (TypeORM)

**TypeORM is the Node.js equivalent of SQLAlchemy + Alembic**

### Running Migrations

**With Docker:**
```bash
./start.sh                                    # Start all services
docker-compose exec backend npm run migration:run  # Apply migrations
```

**Locally:**
```bash
cd backend
npm run build
npm run migration:run  # Apply database schema
```

### Creating New Migrations

After modifying an entity:
```bash
npm run migration:generate -- -n DescriptiveName
npm run migration:run
```

**See:** [TYPEORM_QUICK_START_MIGRATIONS.md](./TYPEORM_QUICK_START_MIGRATIONS.md)

---

## 🔌 Backend API Endpoints

All API calls go through: `http://localhost:3000/api`

#### Authentication
- `POST /auth/login` - User login

#### Outlets
- `GET /outlets` - List all outlets
- `POST /outlets` - Create outlet
- `GET /outlets/:id` - Get outlet details
- `PATCH /outlets/:id` - Update outlet
- `DELETE /outlets/:id` - Delete outlet

#### Sales
- `POST /sales` - Create order
- `GET /sales` - List orders
- `GET /sales/:id` - Get order details
- `POST /sales/payments` - Add payment
- `GET /sales/trends` - Sales analytics

#### Inventory
- `GET /inventory` - List items
- `POST /inventory` - Create item
- `PATCH /inventory/:id` - Update item
- `GET /inventory/low-stock` - Low stock alerts
- `POST /inventory/transactions` - Record transaction

#### Wastage
- `POST /wastage` - Log wastage
- `GET /wastage` - List wastage records
- `GET /wastage/analytics` - Wastage analytics

#### Party Orders
- `POST /party-orders` - Create quotation
- `GET /party-orders` - List orders
- `GET /party-orders/:id` - Get details
- `PATCH /party-orders/:id/status` - Update status

#### Attendance
- `POST /attendance/checkin` - Staff check-in
- `POST /attendance/checkout` - Staff check-out
- `GET /attendance` - List attendance

#### Cash Flow
- `POST /cash-flow` - Add entry
- `GET /cash-flow` - List entries
- `GET /cash-flow/summary` - Daily summary

#### Analytics
- `GET /analytics/dashboard` - Dashboard metrics
- `GET /analytics/comparison` - Outlet comparison
- `GET /analytics/trends` - Sales trends
- `GET /analytics/inventory-health` - Inventory health

#### Reports
- `POST /reports/generate/summary` - Generate summary report
- `POST /reports/generate/sales` - Generate sales report
- `GET /reports` - List reports
- `GET /reports/:id/download` - Download report

---

## Frontend React Query Hooks

All hooks are in `src/hooks/useApi.ts`:

### Usage Example

```typescript
import { 
  useOutlets, 
  useCreateOrder, 
  useDashboardMetrics 
} from "@/hooks/useApi";

function MyComponent() {
  // Fetch data
  const { data: outlets, isLoading } = useOutlets();
  
  // Mutate data
  const { mutate: createOrder, isPending } = useCreateOrder();
  
  // Analytics
  const { data: metrics } = useDashboardMetrics(outlet_id);

  return (
    // Component JSX
  );
}
```

---

## Database Schema

### Core Tables
- **users** - Staff accounts with roles and permissions
- **outlets** - Restaurant locations/branches
- **orders** - Sales transactions
- **order_items** - Items in each order
- **payments** - Payment records
- **inventory_items** - Stock tracking
- **stock_transactions** - Audit trail
- **wastage_entries** - Wastage logs
- **party_orders** - Event quotations
- **party_order_items** - Items in party orders
- **attendance_records** - Staff check-in/out
- **cash_flow_entries** - Cash transactions
- **reports** - Generated reports

---

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov
```

**Expected Results**: 12 test suites, 45 tests

### Test Coverage

All modules have comprehensive test coverage:
- ✅ AppModule
- ✅ UsersModule & RBAC
- ✅ OutletsModule
- ✅ SalesModule with analytics
- ✅ InventoryModule with low-stock alerts
- ✅ WastageModule
- ✅ PartyOrdersModule
- ✅ AttendanceModule
- ✅ CashFlowModule
- ✅ IntegrationsModule (PetPooja, WhatsApp)
- ✅ ReportsModule (PDF, Excel)
- ✅ AnalyticsModule (Dashboard, Trends)

---

## Troubleshooting

### Port Already in Use

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
psql -U postgres -d jugaad_nights -c "SELECT 1"

# Reset database (dev only)
npm run resetdb
```

### Redis Connection Issues

```bash
# Check Redis is running
redis-cli ping

# Clear cache
redis-cli FLUSHALL
```

### Frontend Cannot Connect to Backend

1. Verify backend is running: `curl http://localhost:3000/api`
2. Check CORS is enabled in `src/main.ts`
3. Check `.env` file has correct `VITE_API_URL`
4. Check browser console for CORS errors
5. Verify proxy in `vite.config.ts`

---

## Architecture Highlights

### Backend Architecture
- **Modular Monolith**: 12 focused modules
- **Repository Pattern**: Database abstraction layer
- **Service Layer**: Business logic separation
- **Global Middleware**: Logging, error handling, validation
- **Soft Deletes**: Non-destructive deletion
- **Audit Trails**: Created_by, updated_by tracking
- **Redis Caching**: 5-minute TTL on analytics
- **Scheduled Tasks**: PetPooja sync, auto reports

### Frontend Architecture
- **React Query**: Server state management
- **TypeScript**: Full type safety
- **Shadcn/ui**: Component library
- **React Router**: Client-side routing
- **Auth Context**: Global auth state
- **API Client**: Centralized requests

---

## Performance Optimizations

1. **Caching Strategy**: Redis for dashboard metrics
2. **Query Optimization**: Lazy loading, eager relations
3. **API Response**: Standardized format, minimal payload
4. **Frontend**: React Query caching, memoization
5. **Database**: Indexes on frequently queried fields

---

## Security Features

- ✅ CORS protection
- ✅ Input validation (class-validator)
- ✅ Error filtering (sensitive data hidden)
- ✅ Role-based access control (RBAC)
- ✅ Bearer token authentication
- ✅ Soft deletes (audit trail)
- ✅ SQL injection protection (TypeORM)

---

## Production Deployment Checklist

- [ ] Update `JWT_SECRET` in `.env`
- [ ] Set `NODE_ENV=production`
- [ ] Enable database backups
- [ ] Configure Redis persistence
- [ ] Set up monitoring/logging
- [ ] Configure reverse proxy (nginx/Apache)
- [ ] Enable SSL/TLS certificates
- [ ] Set up automated backups
- [ ] Configure email notifications
- [ ] Test disaster recovery plan

---

## Support & Documentation

- **API Docs**: http://localhost:3000/api/docs (Swagger)
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Node**: 20+
- **React**: 18+

---

## License

All rights reserved © 2024 Jugaad Nights
