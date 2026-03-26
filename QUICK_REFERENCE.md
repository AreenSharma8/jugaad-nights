# Quick Reference Guide - Authentication & RBAC System

**Last Updated:** March 25, 2026  
**Version:** 2.0.0 (JWT Authentication & RBAC)

---

## 🚀 Quick Start Commands

### Start Backend
```bash
cd backend
npm install
npm run start:dev
# Opens at http://localhost:3000/api
```

### Start Frontend
```bash
npm install
npm run dev
# Opens at http://localhost:8080
```

---

## 📝 Creating Test Accounts

### Create Customer (Public Signup)
```bash
# Via UI: http://localhost:8080/signup
# Or via cURL:
curl -X POST http://localhost:3000/api/auth/signup/customer \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "password": "TestPass123!",
    "name": "Customer Name"
  }'
```

### Create Staff (Admin Only)
```bash
# Via Admin UI: Admin Dashboard → Add Staff
# Or via cURL:
curl -X POST http://localhost:3000/api/auth/signup/staff \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "staff@test.com",
    "password": "StaffPass123!",
    "name": "Staff Name",
    "department": "kitchen"
  }'
```

### Create Admin (Admin Only)
```bash
curl -X POST http://localhost:3000/api/auth/signup/admin \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin2@test.com",
    "password": "AdminPass123!",
    "name": "Admin Name"
  }'
```

---

## 🔐 Password Requirements

- **Minimum Length:** 8 characters
- **Lowercase:** At least 1 (a-z)
- **Uppercase:** At least 1 (A-Z)
- **Number:** At least 1 (0-9)
- **Special Character:** At least 1 (!@#$%^&*)

✅ Example: `TestPass123!`
❌ Bad: `password`, `Pass123`, `nospecial1A`

---

## 🔑 Login & Authentication

### Login
```typescript
// Via UI: http://localhost:8080/login
// Then auto-redirected:
//   - admin → /admin/dashboard
//   - staff → /staff/dashboard
//   - customer → /dashboard
```

### Get Token with cURL
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "password": "TestPass123!"
  }'
# Returns: { token: "...", user: { ... } }
```

### Login Credentials (Development)

| Role | Email | Password | Status |
|------|-------|----------|--------|
| Admin | `admin@jugaadnights.com` | Any | Mock (from old system) |
| Staff | `staff@jugaadnights.com` | Any | Mock (from old system) |
| Customer | Create via signup | Must meet requirements | Real |

---

## 🎨 Frontend Hooks & Context

### Using useAuth Hook
```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { 
    user,                    // Current user data
    token,                   // JWT token
    isAuthenticated,         // Boolean
    isLoading,              // Loading state during auth
    error,                  // Error message
    login,                  // Async login function
    signupCustomer,         // Async customer signup
    signupStaff,           // Async staff signup (admin only)
    signupAdmin,           // Async admin signup (admin only)
    logout,                // Logout function
    clearError,            // Clear error message
    hasRole,               // Check single role
    hasAnyRole,            // Check multiple roles
    hasAllRoles,           // Check all roles
    getUserType            // Get 'admin' | 'staff' | 'customer'
  } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  
  if (hasRole('admin')) {
    return <AdminPanel />;
  }
  
  if (getUserType() === 'staff') {
    return <StaffDashboard />;
  }
  
  return <CustomerDashboard />;
}
```

### Role Checking Examples
```typescript
const { hasRole, hasAnyRole, hasAllRoles } = useAuth();

// Single role check
if (hasRole('admin')) { /* Show admin features */ }

// Multiple roles (OR logic)
if (hasAnyRole(['admin', 'staff'])) { /* Show to both */ }

// All roles (AND logic - usually not needed)
if (hasAllRoles(['admin', 'manager'])) { /* Both required */ }
```

### Login Example
```typescript
const { login, error } = useAuth();

const handleLogin = async () => {
  try {
    await login(email, password);
    // Auto-redirected based on user_type
  } catch (err) {
    console.error('Login failed:', err);
  }
};
```

### Signup Example
```typescript
const { signupCustomer, error } = useAuth();

const handleSignup = async () => {
  try {
    await signupCustomer({
      email: 'user@example.com',
      password: 'SecurePass123!',
      name: 'John Doe',
      phone: '+91-9999999999'
    });
    // Auto-login and redirect to /dashboard
  } catch (err) {
    console.error('Signup failed:', err);
  }
};
```

---

## 🌐 API Endpoints

### Authentication (Public)
```
POST /auth/login                    - Login with email/password
POST /auth/signup/customer          - Customer registration
POST /auth/signup/staff            - Create staff (admin only)
POST /auth/signup/admin            - Create admin (admin only)
```

### Authentication (Protected)
```
POST /auth/verify                   - Verify current token
POST /auth/refresh                  - Get new token
```

### Admin Routes (admin role required)
```
GET  /admin/dashboard               - Admin dashboard data
GET  /admin/staff                   - List all staff
GET  /admin/inventory               - Inventory overview
GET  /admin/wastage                 - Wastage reports
```

### Staff Routes (staff or admin)
```
GET  /staff/dashboard               - Staff dashboard
GET  /staff/inventory               - Staff inventory view
POST /staff/inventory/:id/update    - Update inventory
GET  /staff/wastage                 - Wastage tracking
POST /staff/wastage                - Report wastage
GET  /staff/orders                  - View orders
POST /staff/orders/:id/status      - Update order status
```

---

## 🛡️ Backend Route Protection

### Using Guards & Decorators
```typescript
import { Controller, Get, UseGuards, Post } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Public } from '@/common/decorators/public.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  @Get('dashboard')
  getDashboard() { /* Admin only */ }

  @Post('staff')
  createStaff() { /* Admin only */ }
}

@Controller('staff')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('staff', 'admin')  // Staff or Admin
export class StaffController {
  @Get('dashboard')
  getDashboard() { /* Staff + Admin */ }
}

@Controller('auth')
export class AuthController {
  @Post('login')
  @Public()  // No auth required
  login() { /* Public endpoint */ }
}
```

---

## 🧪 API Testing with cURL

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "password": "TestPass123!"
  }'
# Response: { "token": "...", "user": { ... } }
```

### Signup Customer
```bash
curl -X POST http://localhost:3000/api/auth/signup/customer \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@test.com",
    "password": "NewPass123!",
    "name": "New User"
  }'
```

### Protected Route (Replace TOKEN)
```bash
curl -X GET http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer TOKEN"
```

### Admin Route (Admin Token Required)
```bash
curl -X GET http://localhost:3000/api/admin/dashboard \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Get New Token from Refresh
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Authorization: Bearer REFRESH_TOKEN"
```

---

## 📊 User Types & Routing

```
                    Login/Signup
                        ↓
                  Validate Credentials
                        ↓
                    Check user_type
                        ↓
        ┌───────────────┼───────────────┐
        ↓               ↓               ↓
    user_type="admin"   user_type="staff"   user_type="customer"
        ↓               ↓               ↓
    /admin/dashboard    /staff/dashboard    /dashboard
```

**User Type Settings:**
- `admin`: Full system access, manage staff, view analytics
- `staff`: Operational access, inventory management, order tracking
- `customer`: View orders, place orders, track status


---

## ⚠️ Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Password does not meet requirements" | Weak password | Use strong password: 8+ chars, uppercase, lowercase, number, special char |
| "Email already exists" | User already exists | Use different email or use login |
| "Invalid token" | Expired token | Login again to get new token |
| "Insufficient permissions" | Wrong role | Check user_type matches route requirements |
| "Cannot reach API" | Backend not running | Start: `cd backend && npm run start:dev` |
| "CORS error" | Frontend/backend domain issue | Check CORS_ORIGIN in backend .env |
| "Database connection error" | PostgreSQL not running | Start: `docker-compose up -d` |

---

## 🔍 Debugging Tips

### Check Auth State in Browser
```javascript
// DevTools Console Commands:
localStorage.getItem('auth_token')           // See token
JSON.parse(localStorage.getItem('auth_user')) // See user data
localStorage.getItem('auth_expires')          // See expiration time
```

### Decode JWT Token
```javascript
// Copy this in console
function decodeJWT(token) {
  const parts = token.split('.');
  return JSON.parse(atob(parts[1]));
}
const payload = decodeJWT(localStorage.getItem('auth_token'));
console.log(payload);
```

### Backend Logs
- Watch terminal where you ran: `npm run start:dev`
- Look for endpoint logs and error messages
- Check for bcrypt hashing logs

### Clear Auth Data
```javascript
// In console if stuck:
localStorage.removeItem('auth_token');
localStorage.removeItem('auth_user');
localStorage.removeItem('auth_expires');
location.reload();
```

---

## 📚 Documentation Files

For detailed information:
- **[auth-jwt-system.md](auth-jwt-system.md)** - JWT tokens, bcrypt, endpoints
- **[role-based-access-control.md](role-based-access-control.md)** - RBAC system & permissions
- **[signup-flow-design.md](signup-flow-design.md)** - Signup flows for all user types
- **[IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md)** - Full implementation summary

---

## 🎯 Quick Task Reference

### Task: Create Customer Account
1. Go to http://localhost:8080/signup
2. Fill email, password, name (password must be strong)
3. Submit → Auto-login → Redirect to /dashboard

### Task: Create Staff Account (Admin Only)
1. Login as admin
2. Go to Admin Dashboard
3. Click "Add New Staff"
4. Fill email, password, name, department
5. Submit

### Task: Test API with Token
```bash
# 1. Login to get token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"email@test.com","password":"Pass123!"}' | jq -r '.token')

# 2. Use token in request
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/admin/dashboard
```

### Task: Check If User Is Admin
```typescript
import { useAuth } from '@/hooks/useAuth';

function Component() {
  const { hasRole } = useAuth();
  
  if (hasRole('admin')) {
    return <AdminContent />;
  }
  return <UserContent />;
}
```

### Task: Logout User
```typescript
const { logout } = useAuth();

// Logout and redirect to login
logout();
```

---

## 🔐 Security Notes

- ✅ Passwords hashed with bcrypt (10 salt rounds)
- ✅ JWT tokens signed with HS256
- ✅ Tokens expire after 7 days
- ✅ Routes protected with JwtAuthGuard + RolesGuard
- ✅ Role-based access control (RBAC)
- ⚠️ Change JWT_SECRET in production (not "dev-secret")
- ⚠️ Use HTTPS in production
- ⚠️ Set CORS_ORIGIN to production domain

---

## 📁 Key Files to Know

**Frontend:**
- `src/contexts/AuthContext.tsx` → Auth state & providers
- `src/hooks/useAuth.ts` → Get auth data & functions
- `src/services/authApi.service.ts` → API calls
- `src/pages/Login.tsx` → Login page
- `src/pages/Signup.tsx` → Signup page
- `src/App.tsx` → Role-based routing logic

**Backend:**
- `backend/src/modules/auth/` → Auth logic
- `backend/src/modules/admin/` → Admin endpoints
- `backend/src/modules/staff/` → Staff endpoints
- `backend/src/modules/users/` → User entity
- `backend/src/common/guards/` → Route protection
- `backend/src/common/decorators/` → Annotations

---

**Last Updated:** March 25, 2026  
**For Support:** See IMPLEMENTATION_COMPLETE.md for detailed architecture


## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| 401 Unauthorized | No/invalid token | Login again, check token |
| 403 Forbidden | Insufficient role | Check @Roles decorator |
| 404 Not Found | Wrong endpoint | Verify endpoint URL |
| CORS error | Backend doesn't allow origin | Check CORS_ORIGIN in .env |
| "User not found" | Wrong email | Use correct demo email |
| Token not stored | Browser storage disabled | Enable localStorage |

---

## Performance Notes

- Login: ~100ms
- API calls: ~50ms (mock data)
- Token verification: ~1ms
- Webhook processing: ~100ms

---

## Security Checklist

- ✅ JWT tokens signed with HMAC SHA256
- ✅ Tokens expire after 7 days
- ✅ Roles checked on every protected endpoint
- ✅ Public endpoints marked with @Public()
- ✅ Passwords not logged
- ✅ CORS enabled for frontend only

---

## Links to Detailed Docs

- [Frontend Integration Guide](./FRONTEND_INTEGRATION_GUIDE.md)
- [Integration Setup Guide](./INTEGRATION_SETUP_GUIDE.md)
- [Implementation Summary](./INTEGRATION_IMPLEMENTATION_SUMMARY.md)
- [Backend API Documentation](./backend/API_DOCUMENTATION.md)

---

## Quick Video Demo Commands

### Terminal 1 - Start Backend
```bash
cd backend && npm run start:dev
```

### Terminal 2 - Start Frontend
```bash
npm run dev
```

### Browser
1. Open http://localhost:5173
2. Select "Admin"
3. Enter: admin@jugaadnights.com and any password
4. Click Sign In
5. Dashboard loads!

---

## Support

For detailed information, refer to:
1. FRONTEND_INTEGRATION_GUIDE.md - Complete integration guide
2. INTEGRATION_SETUP_GUIDE.md - Setup instructions
3. INTEGRATION_IMPLEMENTATION_SUMMARY.md - What was implemented
4. Backend API_DOCUMENTATION.md - API reference

---

**Status:** ✅ Ready to Use  
**Last Updated:** March 24, 2026

