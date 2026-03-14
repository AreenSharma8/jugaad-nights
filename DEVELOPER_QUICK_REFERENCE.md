# Developer Quick Reference Guide

**Purpose**: Fast lookup for common tasks and commands  
**Last Updated**: March 14, 2026  
**Version**: 1.0

---

## 🚀 Quick Start

### Prerequisites
```bash
# Check Node.js version (need v18 or v20+)
node --version

# Check npm version
npm --version
```

### First Time Setup
```bash
# Install all dependencies
npm install

# Navigate to backend
cd backend && npm install

# Return to root
cd ..
```

### Start Development Servers

**Terminal 1 - Frontend**:
```bash
npm run dev
# Runs on: http://localhost:8080
```

**Terminal 2 - Backend**:
```bash
cd backend
npm run start:dev
# Runs on: http://localhost:3000/api
```

**Terminal 3 - Database & Redis** (Optional):
```bash
docker-compose up -d
# Starts PostgreSQL + Redis in Docker
```

---

## 📱 Frontend Development

### Common Commands
```bash
# Start dev server (hot reload)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Linting
npm run lint

# Type checking
npm run type-check
```

### Project Structure
```
src/
├── pages/          # Page components (routable)
├── components/     # Reusable components
├── hooks/          # Custom React hooks
├── context/        # State management (AuthContext)
├── lib/            # Utilities and services
├── App.tsx         # Main app + routing
└── main.tsx        # Entry point
```

### Adding a New Page

1. **Create page file**:
   ```bash
   touch src/pages/NewPage.tsx
   ```

2. **Add route in App.tsx**:
   ```typescript
   <Route path="/dashboard/new-page" element={<NewPage />} />
   ```

3. **Add navigation link in DashboardLayout.tsx**:
   ```typescript
   <NavLink to="/dashboard/new-page">
     <span>New Page</span>
   </NavLink>
   ```

4. **Implement with skeleton loaders**:
   ```typescript
   export default function NewPage() {
     const [data, setData] = useState(null);
     const [isLoading, setIsLoading] = useState(true);
     
     useEffect(() => {
       // Fetch data
       setIsLoading(false);
     }, []);
     
     return (
       <div>
         {isLoading ? <Skeleton /> : <DataDisplay data={data} />}
       </div>
     );
   }
   ```

### Authentication & Protected Routes

**Access Current User**:
```typescript
import { useAuth } from '@/context/AuthContext';

export function MyComponent() {
  const { user, token, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return <div>Welcome, {user?.name}</div>;
}
```

**Make API Calls with Auth**:
```typescript
import apiClient from '@/lib/api';

// API call automatically includes JWT token
const response = await apiClient.get('/sales');
```

### Styling Components

**With Tailwind CSS**:
```typescript
<div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
  <span className="text-lg font-semibold">Title</span>
  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
    Action
  </button>
</div>
```

**With shadcn/ui**:
```typescript
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>My Card</CardTitle>
  </CardHeader>
  <CardContent>
    <Button>Click Me</Button>
  </CardContent>
</Card>
```

### Toast Notifications

```typescript
import { useToast } from '@/hooks/use-toast';

export function MyComponent() {
  const { toast } = useToast();
  
  const handleSuccess = () => {
    toast({
      title: "Success",
      description: "Operation completed successfully",
      variant: "default"
    });
  };
  
  const handleError = () => {
    toast({
      title: "Error",
      description: "Something went wrong",
      variant: "destructive"
    });
  };
  
  return <div>...</div>;
}
```

### Loading States & Skeleton Loaders

**Basic Skeleton**:
```typescript
import { Skeleton } from "@/components/ui/skeleton";

{isLoading ? (
  <Skeleton className="h-12 w-full rounded-lg" />
) : (
  <DataDisplay data={data} />
)}
```

**Multiple Skeleton Rows**:
```typescript
{isLoading ? (
  <div className="space-y-2">
    {[...Array(5)].map((_, i) => (
      <Skeleton key={i} className="h-12 w-full" />
    ))}
  </div>
) : (
  <DataTable data={data} />
)}
```

---

## 🔙 Backend Development

### Common Commands
```bash
# Start dev server (auto-reload)
cd backend && npm run start:dev

# Build production version
npm run build

# Run production build
npm run start:prod

# Run tests
npm run test

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e

# Linting
npm run lint

# Database migrations
npm run migration:generate -- -n MigrationName
npm run migration:run
npm run migration:revert
```

### Project Structure
```
backend/src/
├── modules/           # Feature modules
│   ├── auth/
│   ├── users/
│   ├── outlets/
│   ├── sales/
│   └── ...
├── common/            # Shared functionality
│   ├── filters/       # Exception filters
│   ├── guards/        # Authorization guards
│   ├── pipes/         # Validation pipes
│   ├── interceptors/  # Response formatting
│   └── interfaces/    # TypeScript interfaces
├── config/            # Configuration
├── services/          # Shared services (Redis, etc.)
├── app.module.ts      # Main module
└── main.ts            # Entry point
```

### Creating a New Module

1. **Create module structure**:
   ```bash
   mkdir -p backend/src/modules/feature/{dto,entities,repositories,__tests__}
   ```

2. **Create controller**:
   ```bash
   touch backend/src/modules/feature/feature.controller.ts
   ```

3. **Create service**:
   ```bash
   touch backend/src/modules/feature/feature.service.ts
   ```

4. **Create entity**:
   ```bash
   touch backend/src/modules/feature/entities/feature.entity.ts
   ```

5. **Create module file**:
   ```bash
   touch backend/src/modules/feature/feature.module.ts
   ```

6. **Import in app.module.ts**:
   ```typescript
   import { FeatureModule } from './modules/feature/feature.module';
   
   @Module({
     imports: [FeatureModule, ...],
   })
   export class AppModule {}
   ```

### DB Operations

**Run migrations**:
```bash
cd backend
npm run migration:run
```

**Revert last migration**:
```bash
npm run migration:revert
```

**Create new migration**:
```bash
npm run migration:generate -- -n AddNewColumnToUsers
```

**Reset database** (⚠️ Deletes all data):
```bash
npm run migration:revert -- -a
npm run migration:run
```

### Environment Variables

**Backend** (`.env` in backend/):
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

# Server
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# Auth (if needed)
JWT_SECRET=your-secret-key
JWT_EXPIRY=24h
```

**Frontend** (`.env` in root/):
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Jugaad Nights
```

### API Response Format

**Success Response**:
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "timestamp": "2026-03-14T10:30:00.000Z"
}
```

**Error Response**:
```json
{
  "status": "error",
  "message": "User not found",
  "code": "NOT_FOUND",
  "timestamp": "2026-03-14T10:30:00.000Z"
}
```

### Create Service Method

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feature } from './entities/feature.entity';
import { CreateFeatureDto } from './dto/create-feature.dto';

@Injectable()
export class FeatureService {
  constructor(
    @InjectRepository(Feature)
    private readonly repository: Repository<Feature>,
  ) {}

  async create(dto: CreateFeatureDto) {
    const entity = this.repository.create(dto);
    return this.repository.save(entity);
  }

  async findAll() {
    return this.repository.find();
  }

  async findById(id: string) {
    return this.repository.findOneBy({ id });
  }

  async update(id: string, dto: Partial<CreateFeatureDto>) {
    await this.repository.update(id, dto);
    return this.findById(id);
  }

  async delete(id: string) {
    await this.repository.softDelete(id);
  }
}
```

### Create Controller Endpoint

```typescript
import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { FeatureService } from './feature.service';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { JwtGuard } from '@/common/guards/jwt.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@Controller('features')
@UseGuards(JwtGuard, RolesGuard)
export class FeatureController {
  constructor(private readonly service: FeatureService) {}

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @Roles('admin')
  async create(@Body() dto: CreateFeatureDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  async update(@Param('id') id: string, @Body() dto: Partial<CreateFeatureDto>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id') id: string) {
    await this.service.delete(id);
    return { status: 'deleted' };
  }
}
```

---

## 🐛 Debugging & Troubleshooting

### Frontend Issues

**App won't start**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Blank page / API errors**:
1. Open browser DevTools (F12)
2. Check **Console** tab for errors
3. Check **Network** tab for failed API calls
4. Verify backend is running: http://localhost:3000/api

**Hot reload not working**:
```bash
# Kill dev server and restart
npm run dev
```

**TypeScript errors**:
```bash
npm run type-check
# Fix reported errors
```

### Backend Issues

**Database connection error**:
```bash
# Check if PostgreSQL is running
docker-compose up -d

# Check connection string in .env
# Verify DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME
```

**Redis connection error**:
```bash
# Check Redis is running
docker ps

# Or restart Redis
docker-compose restart redis
```

**Port already in use**:
```bash
# Find process on port 3000
lsof -i :3000

# Kill it
kill -9 <PID>

# Restart backend
npm run start:dev
```

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `ECONNREFUSED` | Backend not running | Start backend: `npm run start:dev` |
| `TypeError: Cannot read property 'data'` | API response structure mismatch | Check API returns standard format |
| `401 Unauthorized` | JWT token missing/invalid | Login again or check token in localStorage |
| `Duplicate entry` | Unique constraint violated | Check for duplicate data |
| `Migration pending` | Unmigrated schema changes | Run `npm run migration:run` |

---

## 📦 Dependency Management

### Add Package (Frontend)
```bash
npm install package-name
# Or with specific version
npm install package-name@1.2.3
```

### Add Package (Backend)
```bash
cd backend
npm install package-name
```

### Remove Package
```bash
npm uninstall package-name
```

### Update All Packages
```bash
npm update
```

### Check for Security Vulnerabilities
```bash
npm audit

# Fix vulnerabilities
npm audit fix
```

### Important Dependencies

**Frontend**:
- `react` - UI library
- `react-router-dom` - Routing
- `axios` - HTTP client
- `tailwindcss` - Styling
- `lucide-react` - Icons
- `react-query` - Server state
- `zod` - Validation (to add)

**Backend**:
- `@nestjs/core` - NestJS framework
- `@nestjs/common` - Common utilities
- `typeorm` - ORM
- `pg` - PostgreSQL driver
- `redis` - Redis client
- `@nestjs/jwt` - JWT handling
- `bullmq` - Job queues

---

## 🧪 Testing

### Run Frontend Tests
```bash
npm run test
npm run test:watch        # Watch mode
npm run test -- Dashboard # Single file
```

### Run Backend Tests
```bash
cd backend
npm run test
npm run test:cov          # With coverage
npm run test:e2e          # End-to-end tests
```

### Write a Test

```typescript
// feature.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { FeatureService } from './feature.service';

describe('FeatureService', () => {
  let service: FeatureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FeatureService],
    }).compile();

    service = module.get<FeatureService>(FeatureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a feature', async () => {
    const result = await service.create({ name: 'Test' });
    expect(result).toHaveProperty('id');
  });
});
```

---

## 🚢 Git Workflow

### Clone Repository
```bash
git clone <repo-url>
cd jugaad-nights-ops-hub
```

### Create Feature Branch
```bash
git checkout -b feature/new-feature
# or
git checkout -b fix/bug-fix
```

### Commit Changes
```bash
git add .
git commit -m "feat: Added new feature"
# or
git commit -m "fix: Fixed login redirect bug"
```

### Push to Remote
```bash
git push origin feature/new-feature
```

### Create Pull Request
1. Push your branch
2. Go to GitHub
3. Create PR with description
4. Wait for review

### Commit Message Format
```
<type>: <subject>

<body>

<footer>
```

**Types**: feat, fix, docs, style, refactor, test, chore

**Examples**:
```
feat: Add dark mode support
fix: Resolve login redirect issue
docs: Update README with setup instructions
refactor: Simplify API response formatting
```

---

## 🔗 Useful Links

- **Frontend Documentation**: `./FRONTEND_IMPLEMENTATION.md`
- **Backend Documentation**: `./BACKEND_IMPLEMENTATION_SUMMARY.md`
- **Missing Features**: `./FRONTEND_MISSING_FEATURES.md`
- **API Docs**: http://localhost:3000/api/docs (when running)
- **React Docs**: https://react.dev
- **NestJS Docs**: https://docs.nestjs.com
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## 📞 Getting Help

1. **Check documentation first**: Read relevant .md file
2. **Check existing code**: Look at similar features
3. **Check git history**: `git log --grep=keyword`
4. **Check issues**: GitHub issues tab
5. **Ask team lead**: For context and decisions

---

## 🏁 Common Development Scenarios

### "I want to create a new page"
1. Read `FRONTEND_IMPLEMENTATION.md` > Page Implementations
2. Copy similar page
3. Update routes in App.tsx
4. Add navigation link
5. Implement with skeleton loaders

### "I want to add an API endpoint"
1. Read `BACKEND_IMPLEMENTATION_SUMMARY.md` > API Endpoints
2. Create controller method
3. Create service method
4. Add validation DTOs
5. Write tests
6. Update Swagger docs

### "I want to modify database schema"
1. Create new entity or modify existing
2. Generate migration: `npm run migration:generate`
3. Review and edit migration
4. Run migration: `npm run migration:run`
5. Update TypeORM entities

### "I found a bug"
1. Isolate the issue
2. Check console for errors
3. Check Network tab (for API errors)
4. Create a minimal test case
5. Report with steps to reproduce

---

**Last Updated**: March 14, 2026  
**Version**: 1.0  
**Status**: Production Ready
