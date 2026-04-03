# Role-Based Access Control (RBAC) Implementation

## Overview
A flexible, permission-driven role-based access control system for the Jugaad Nights operations hub with three user types: Admin, Staff, and Customer.

## User Types and Access Levels

### 1. **Admin (Owner)**
**User Type**: `admin`

#### Capabilities
- Full system access and control
- Create and manage Staff accounts
- Access to analytics and reporting
- Inventory management and control
- Wastage tracking and reporting
- User and role management
- System configuration

#### Default Permissions
- `admin:create-staff`
- `admin:manage-roles`
- `admin:view-analytics`
- `admin:manage-inventory`
- `admin:manage-wastage`
- `admin:create-admin`

#### Routes
- **Base**: `/admin`
- **Subroutes**:
  - `/admin/dashboard` - Control panel with stats
  - `/admin/staff` - Staff management
  - `/admin/inventory` - Inventory control
  - `/admin/wastage` - Wastage reports
  - `/admin/analytics` - Business analytics

#### Frontend Access
- Admin Dashboard with management options
- Staff creation and management interface
- Analytics dashboard with charts
- Full system configuration options

### 2. **Staff (Team Member)**
**User Type**: `staff`

#### Capabilities
- View and manage assigned tasks
- Update inventory levels
- Report wastage
- Process orders
- Limited analytics access (own data only)
- Cannot create accounts or manage other staff

#### Default Permissions
- `staff:view-inventory`
- `staff:update-inventory`
- `staff:report-wastage`
- `staff:manage-orders`
- `staff:view-personal-analytics`

#### Routes
- **Base**: `/staff`
- **Subroutes**:
  - `/staff/dashboard` - Operational dashboard
  - `/staff/inventory` - Inventory management
  - `/staff/wastage` - Wastage tracking
  - `/staff/orders` - Order management

#### Frontend Access
- Staff Dashboard with pending orders
- Inventory level updates
- Wastage reporting form
- Daily task checklist

### 3. **Customer**
**User Type**: `customer`

#### Capabilities
- Browse menu items
- Place orders
- View order history
- Manage personal profile
- No staff or admin features

#### Default Permissions
- `customer:view-menu`
- `customer:place-order`
- `customer:view-orders`
- `customer:manage-profile`

#### Routes
- **Base**: `/dashboard`
- **Subroutes**:
  - `/dashboard/sales` - Sales history
  - `/dashboard/inventory` - Menu items
  - `/dashboard/orders` - Order management

#### Frontend Access
- Customer dashboard
- Menu browsing
- Order placement
- Order tracking

## Architecture

### Backend Implementation

#### Database Schema

**users table** - Enhanced with user_type
```sql
id (UUID)
email (VARCHAR, unique)
name (VARCHAR)
password (VARCHAR, hashed)
user_type (VARCHAR): 'admin' | 'staff' | 'customer'
phone (VARCHAR, nullable)
gender (VARCHAR, nullable)
age (INT, nullable)
department (VARCHAR, nullable) -- For staff
is_active (BOOLEAN, default: true)
outlet_id (UUID)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

**roles table**
```sql
id (UUID)
outlet_id (UUID)
name (VARCHAR, unique)
description (TEXT, nullable)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

**permissions table**
```sql
id (UUID)
name (VARCHAR, unique)
resource (VARCHAR)
action (VARCHAR): CREATE | READ | UPDATE | DELETE | APPROVE
description (TEXT, nullable)
created_at (TIMESTAMP)
```

**user_roles table** - Junction table
```sql
id (UUID)
user_id (UUID, FK)
role_id (UUID, FK)
outlet_id (UUID)
created_at (TIMESTAMP)
```

**role_permissions table** - Junction table
```sql
id (UUID)
role_id (UUID, FK)
permission_id (UUID, FK)
created_at (TIMESTAMP)
```

#### Guard Implementation

**JWT Auth Guard** (`backend/src/common/guards/jwt-auth.guard.ts`)
- Validates JWT token on all protected routes
- Respects `@Public()` decorator for public endpoints
- Extracts user information into `request.user`

**Roles Guard** (`backend/src/common/guards/roles.guard.ts`)
- Validates user has required role(s)
- Allows multiple roles (OR logic)
- Respects `@Roles()` decorator

#### Decorator Usage

```typescript
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  @Get('dashboard')
  async getDashboard() { /* ... */ }
}

@Controller('staff')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('staff', 'admin')  // Both staff and admin can access
export class StaffController {
  @Get('inventory')
  async getInventory() { /* ... */ }
}

@Controller('auth')
export class AuthController {
  @Public()  // No authentication required
  @Post('login')
  async login() { /* ... */ }
}
```

### Frontend Implementation

#### Role-Based Routing (`src/App.tsx`)
```typescript
const RoleBasedRouter = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Loading />;

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Admin only */}
      {user?.user_type === 'admin' && (
        <Route path="/admin" element={<AdminDashboard />} />
      )}

      {/* Staff only */}
      {user?.user_type === 'staff' && (
        <Route path="/staff" element={<StaffDashboard />} />
      )}

      {/* Customer */}
      {user?.user_type === 'customer' && (
        <Route path="/dashboard" element={<CustomerDashboard />} />
      )}

      {/* Default redirect */}
      <Route path="/" element={<Navigate to={getDefaultRoute(user)} />} />
    </Routes>
  );
};
```

#### Role Check Utilities (`src/hooks/useAuth.ts`)
```typescript
const { hasRole, hasAnyRole, hasAllRoles, getUserType } = useAuth();

// Check single role
if (hasRole('admin')) { /* Show admin features */ }

// Check any role (OR logic)
if (hasAnyRole(['admin', 'manager'])) { /* Show features */ }

// Check all roles (AND logic)
if (hasAllRoles(['staff', 'manager'])) { /* Show features */ }

// Get user type
const userType = getUserType(); // 'admin' | 'staff' | 'customer'
```

#### Context Methods
```typescript
export interface AuthContextType {
  // Role checking methods
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
  getUserType: () => string | null;

  // Signup methods by role
  signupCustomer: (credentials) => Promise<void>;
  signupStaff: (credentials) => Promise<void>;  // Admin only
  signupAdmin: (credentials) => Promise<void>;  // Admin only
}
```

## Permission Model

### Predefined Permission Structure

```
Resource: users
├── Permission: users:create
├── Permission: users:read
├── Permission: users:update
├── Permission: users:delete

Resource: inventory
├── Permission: inventory:view
├── Permission: inventory:update
├── Permission: inventory:manage

Resource: wastage
├── Permission: wastage:view
├── Permission: wastage:create
├── Permission: wastage:report

Resource: orders
├── Permission: orders:view
├── Permission: orders:create
├── Permission: orders:manage
├── Permission: orders:approve
```

### Role-Permission Mapping

**Admin Role**
- `users:create`
- `users:read`
- `users:update`
- `users:delete`
- `inventory:*`
- `wastage:*`
- `orders:*`

**Staff Role**
- `inventory:view`
- `inventory:update`
- `wastage:view`
- `wastage:create`
- `orders:view`
- `orders:manage`

**Customer Role**
- `orders:view`
- `orders:create`
- `profile:read`
- `profile:update`

## API Endpoint Security

### Admin Endpoints
```
GET    /admin/dashboard        ✓ Admin only
GET    /admin/staff            ✓ Admin only
POST   /admin/staff            ✓ Admin only
GET    /admin/inventory        ✓ Admin only
GET    /admin/wastage          ✓ Admin only
GET    /admin/analytics        ✓ Admin only
```

### Staff Endpoints
```
GET    /staff/dashboard        ✓ Staff + Admin
GET    /staff/inventory        ✓ Staff + Admin
POST   /staff/inventory/:id    ✓ Staff + Admin
GET    /staff/wastage          ✓ Staff + Admin
POST   /staff/wastage          ✓ Staff + Admin
GET    /staff/orders           ✓ Staff + Admin
POST   /staff/orders/:id       ✓ Staff + Admin
```

### Public Endpoints
```
POST   /auth/login             ✓ Public
POST   /auth/signup/customer   ✓ Public
POST   /auth/verify            ✓ Authenticated
POST   /auth/refresh           ✓ Authenticated
```

## Signup Flow Design

### Customer Signup Flow
1. Navigate to `/signup`
2. Fill signup form (email, password, name, optional: phone, gender, age)
3. Submit form
4. Automatic login → Redirect to `/dashboard`
5. `user_type: 'customer'` set by default

### Staff Signup Flow
1. Admin logged in, navigates to Staff management
2. Click "Add New Staff"
3. Admin fills staff form (email, password, name, department)
4. Admin assigns role
5. Staff account created with `user_type: 'staff'`
6. Email sent to staff member with login credentials
7. Account accessible at `/staff` on first login

### Admin Signup Flow
1. System initialization or super-admin creates account
2. Account created with `user_type: 'admin'`
3. Full access to system

## Conditional Features Based on Role

### Feature Flag Implementation

```typescript
// Frontend component with role-based features
const Dashboard = () => {
  const { hasRole, hasAnyRole } = useAuth();

  return (
    <>
      {/* Visible to everyone */}
      <Header />

      {/* Admin only */}
      {hasRole('admin') && <AdminPanel />}

      {/* Staff or Admin */}
      {hasAnyRole(['staff', 'admin']) && <InventoryWidget />}

      {/* Customer only */}
      {!hasRole('admin') && !hasRole('staff') && <OrderForm />}
    </>
  );
};
```

## Access Control Patterns

### Pattern 1: Route-Level Access Control
```typescript
<Route 
  path="/admin" 
  element={user?.user_type === 'admin' ? <Admin /> : <Navigate to="/dashboard" />}
/>
```

### Pattern 2: Component-Level Access Control
```typescript
{hasRole('admin') && <AdminFeature />}
```

### Pattern 3: API-Level Access Control
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Get('/admin/data')
async getAdminData() { /* ... */ }
```

### Pattern 4: Conditional Navigation
```typescript
const navigate = useNavigate();
if (hasRole('admin')) {
  navigate('/admin');
} else if (hasRole('staff')) {
  navigate('/staff');
} else {
  navigate('/dashboard');
}
```

## Best Practices

1. **Always use guards on backend**
   - Never trust frontend role checks for security
   - Backend guards are the source of truth

2. **Frontend role checks for UX**
   - Hide admin features from non-admins
   - Redirect to appropriate dashboards
   - Show/hide navigation items by role

3. **Granular permissions**
   - Use specific permissions, not just role names
   - Allows flexible permission assignment
   - Easier to audit and maintain

4. **Consistent naming**
   - Use `resource:action` format
   - Keep permission names consistent
   - Document all permissions

5. **Security through design**
   - Fail securely (deny by default)
   - Separate concerns (auth vs. authz)
   - Test role-based access controls

## Testing Role-Based Access

### Backend Testing
```bash
# Test unauthorized access (no token)
curl http://localhost:3000/api/admin/dashboard
# Expected: 401 Unauthorized

# Test with customer token on admin endpoint
curl -H "Authorization: Bearer <customer-token>" \
  http://localhost:3000/api/admin/dashboard
# Expected: 403 Forbidden

# Test with admin token on admin endpoint
curl -H "Authorization: Bearer <admin-token>" \
  http://localhost:3000/api/admin/dashboard
# Expected: 200 OK
```

### Frontend Testing
- Log in as different user types
- Verify correct dashboard loads
- Verify navigation menus are role-specific
- Verify buttons/features are hidden/shown correctly
- Test route redirects for unauthorized users

## Troubleshooting

### Issue: Getting "Insufficient Permissions"
- Verify user has correct role assigned
- Check role-permission mapping
- Ensure JWT token is valid and fresh

### Issue: Seeing admin features as staff
- Clear browser localStorage
- Force re-login
- Check role assignment in database

### Issue: Routes redirecting to login
- Verify JWT token is stored
- Check token validity (not expired)
- Ensure Authorization header format: `Bearer <token>`

## Future Enhancements

1. **Dynamic Permissions**
   - Runtime permission assignment
   - Custom role creation
   - Permission templates

2. **Multi-Outlet Access**
   - User access to multiple outlets
   - Outlet-specific permissions
   - Cross-outlet reporting

3. **Audit Logging**
   - Track all permission changes
   - Access logging
   - Security event monitoring

4. **API Scopes**
   - Different token scopes
   - Fine-grained API access control
   - Temporary elevated permissions

5. **Approval Workflows**
   - Role-based approval chains
   - Escalation procedures
   - Audit trail
