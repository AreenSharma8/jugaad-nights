# Jugaad Nights - System Architecture

## 🏗️ Overview

Jugaad Nights is a **modular monolith** restaurant operations management system built with modern full-stack technologies.

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                 │
│              http://localhost:8080                           │
│  - Responsive UI with shadcn/ui + Tailwind CSS              │
│  - TypeScript for type safety                               │
│  - Context API for state management                         │
└────────────────────┬────────────────────────────────────────┘
                     │ /api (nginx proxy)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Nginx (Reverse Proxy)                      │
│  - Routes /api to backend                                   │
│  - Serves static frontend files                             │
│  - GZIP compression enabled                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┬─────────────────┐
        ▼                         ▼                 ▼
┌──────────────┐    ┌────────────────────┐  ┌─────────────┐
│  NestJS API  │    │    PostgreSQL 16   │  │   Redis 7   │
│ :3000        │    │    :5432           │  │   :6379     │
│              │    │                    │  │             │
│ - Auth       │    │ Data Persistence   │  │ Caching     │
│ - Sales      │    │ Transactions       │  │ Queues      │
│ - Inventory  │    │ Multi-outlet       │  │ Sessions    │
│ - Reports    │    │ Isolation          │  │             │
└──────────────┘    └────────────────────┘  └─────────────┘
```

---

## 🏛️ Layered Architecture

### Frontend Layer
```
src/
├── pages/              # Route-based pages
├── components/         # Reusable UI components
├── contexts/           # Global state (Auth, etc.)
├── hooks/              # Custom React hooks
├── services/           # API client & business logic
└── lib/                # Utilities & helpers
```

### Backend Layer (NestJS Modules)
```
src/
├── common/             # Shared utilities, decorators, pipes
├── config/             # Database, environment config
├── modules/            # Feature modules
│   ├── users/          # Authentication & user management
│   ├── outlets/        # Multi-outlet management
│   ├── sales/          # Sales orders & transactions
│   ├── inventory/      # Stock management
│   ├── wastage/        # Wastage tracking
│   ├── attendance/     # Employee attendance
│   ├── cashflow/       # Cash management
│   └── reports/        # Analytics & reporting
└── migrations/         # TypeORM migrations
```

---

## 🔄 Data Flow

### Authentication Flow
```
1. User submits credentials
   ↓
2. Frontend → POST /auth/login
   ↓
3. Backend validates & generates JWT
   ↓
4. Frontend stores token in localStorage
   ↓
5. Subsequent requests include Bearer token
   ↓
6. Backend verifies JWT in auth middleware
```

### Multi-Outlet Isolation
```
Every transaction table includes:
├── outlet_id        (Outlet identifier)
├── created_by       (User ID)
├── created_at       (Timestamp)
├── updated_at       (Timestamp)
├── updated_by       (User ID)
└── deleted_at       (Soft delete)

→ Ensures complete data isolation between outlets
```

---

## 🗄️ Database Schema

### Core Tables
```
users
├── id (UUID)
├── email (unique)
├── password (hashed)
├── name
├── phone
├── outlet_id (FK)
└── roles (M2M relationship)

roles
├── id (UUID)
├── name
├── outlet_id (FK)
└── permissions (M2M)

outlets
├── id (UUID)
├── name
├── address
├── phone
├── email
└── is_active

sales_orders
├── id (UUID)
├── outlet_id (FK)
├── user_id (FK)
├── total_amount
├── items (relationship)
├── created_at
└── deleted_at (soft delete)
```

---

## 🔐 Security Architecture

### Authentication
- JWT tokens with expiration
- Password hashing with bcrypt
- Role-based access control (RBAC)

### API Protection
- Bearer token validation
- Request authorization checks
- Outlet isolation enforcement

### Data Protection
- Soft deletes (never truly delete)
- Audit columns (created_by, updated_by)
- CORS enabled only for frontend

---

## 🚀 Deployment Architecture

### Docker Stack
```
Services:
├── postgres:16-alpine     (Database)
├── redis:7-alpine         (Cache)
├── backend (NestJS)       (API)
└── frontend (Nginx)       (UI)

Networks:
└── jugaad-network         (Internal communication)

Volumes:
├── postgres_data          (Database persistence)
└── redis_data             (Redis persistence)
```

### Ports
- **8080**: Frontend (Nginx)
- **3000**: Backend (NestJS)
- **5432**: PostgreSQL
- **6379**: Redis

---

## 🔌 Integration Points

### External Services
- **PetPOOJA**: Restaurant POS sync
- **WhatsApp**: Notifications
- **Email**: Transactional emails

### Internal Queues (BullMQ)
- Order processing
- Report generation
- Notification delivery

---

## 📈 Scaling Considerations

### Current (Monolith)
- Single backend instance
- Shared database
- Redis for caching/sessions

### Future (Microservices)
- Split by business domain
- Database per service
- Event-driven architecture

---

## 🔄 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React | 18.2+ |
| **Frontend Build** | Vite | 5.4+ |
| **Backend** | NestJS | Latest |
| **Runtime** | Node.js | 20+ |
| **Language** | TypeScript | 5.8+ |
| **Database** | PostgreSQL | 16+ |
| **Cache** | Redis | 7+ |
| **ORM** | TypeORM | Latest |
| **Container** | Docker | Latest |

---

## 📝 Environment Configuration

### Frontend (.env)
```
VITE_API_URL=/api
```

### Backend (.env.development)
```
NODE_ENV=development
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=jugaad_nights
JWT_SECRET=your-secret-key
REDIS_HOST=redis
REDIS_PORT=6379
```

---

## 🎯 Design Principles

1. **Single Responsibility**: Each module handles one domain
2. **Modular**: Independent, replaceable components
3. **Scalable**: Easy to add outlets and users
4. **Secure**: JWT auth + RBAC + audit trails
5. **Maintainable**: Type-safe, well-documented code

