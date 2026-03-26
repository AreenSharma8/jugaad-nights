# JWT-Based Authentication System Implementation

## Overview
A production-ready, JWT-based authentication system with secure password hashing (bcrypt), token management, and role-based access control (RBAC) for the Jugaad Nights operations hub.

## Features Implemented

### 1. **Secure Password Management**
- **Bcrypt Hashing**: Industry-standard password hashing with salt rounds of 10
- **Password Strength Validation**: Enforced requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- **Password Comparison**: Secure verification using bcrypt

### 2. **JWT Token System**
- **Token Generation**: HS256 algorithm with comprehensive payload
  - User ID (`sub`)
  - Email
  - Role and Roles array
  - Outlet ID
  - Issued at (`iat`) and Expiration (`exp`) timestamps
- **Token Expiration**: 7 days validity period
- **Token Verification**: Signature validation and expiration checks
- **Token Refresh**: Optional mechanism for session extension

### 3. **Authentication Endpoints**

#### Public Endpoints (No Auth Required)
```
POST /auth/login
- Body: { email, password }
- Returns: { user, token }

POST /auth/signup/customer
- Body: { email, password, name, phone?, gender?, age? }
- Returns: { user, token }
- Access: Public (anyone can signup)
```

#### Protected Endpoints (Admin Only)
```
POST /auth/signup/staff
- Body: { email, password, name, department?, role_id?, ... }
- Returns: { user, token }
- Access: Admin users only

POST /auth/signup/admin
- Body: { email, password, name, ... }
- Returns: { user, token }
- Access: Admin users only

POST /auth/verify
- Returns: { user, valid: true }
- Access: Authenticated users

POST /auth/refresh
- Returns: { token }
- Access: Authenticated users
```

## Backend Implementation

### Files Modified/Created

#### Core Authentication Services
- **`backend/src/common/utils/password.service.ts`** (NEW)
  - `hashPassword()`: Hash passwords with bcrypt
  - `comparePassword()`: Verify passwords securely
  - `validatePasswordStrength()`: Enforce password requirements
  - Singleton instance export

- **`backend/src/modules/auth/auth.service.ts`** (UPDATED)
  - `login()`: Authenticate with email/password
  - `signupCustomer()`: Public customer registration
  - `signupStaff()`: Admin-controlled staff registration
  - `signupAdmin()`: Admin account creation
  - `verifyToken()`: Token validation
  - `refreshToken()`: Token refresh mechanism
  - Database integration with UserRepository

- **`backend/src/modules/auth/auth.controller.ts`** (UPDATED)
  - POST `/auth/login`: User login endpoint
  - POST `/auth/signup/customer`: Customer registration
  - POST `/auth/signup/staff`: Staff creation (admin)
  - POST `/auth/signup/admin`: Admin creation
  - POST `/auth/verify`: Token verification
  - POST `/auth/refresh`: Token refresh
  - Comprehensive error handling with proper HTTP status codes

- **`backend/src/modules/auth/dto/signup.dto.ts`** (NEW)
  - `SignupDto`: Base signup DTO
  - `CustomerSignupDto`: Customer signup
  - `StaffSignupDto`: Staff signup with department
  - `AdminSignupDto`: Admin signup
  - `VerifySignupDto`: Email verification

- **`backend/src/modules/auth/auth.module.ts`** (UPDATED)
  - Imported `TypeOrmModule` and `UserRepository`
  - Proper DI configuration
  - Export AuthService for other modules

#### Entity Updates
- **`backend/src/modules/users/entities/user.entity.ts`** (UPDATED)
  - Added `password: string` field
  - Added `user_type: 'admin' | 'staff' | 'customer'`
  - Added `gender: string (nullable)`
  - Added `age: number (nullable)`
  - Added `department: string (nullable)`

#### Role-Specific Controllers
- **`backend/src/modules/admin/admin.controller.ts`** (NEW)
  - Admin dashboard routes
  - Staff management endpoints
  - Analytics endpoints
  - Inventory and wastage management
  - @Roles('admin') decorator enforcement

- **`backend/src/modules/staff/staff.controller.ts`** (NEW)
  - Staff dashboard
  - Inventory management
  - Wastage tracking
  - Order management
  - @Roles('staff', 'admin') decorator

#### Module Registration
- **`backend/src/app.module.ts`** (UPDATED)
  - Imported `AdminModule` and `StaffModule`
  - Added to imports array

## Frontend Implementation

### Files Modified/Created

#### Authentication Services
- **`src/services/auth.service.ts`** (UPDATED)
  - Updated `User` interface with `user_type` field
  - Added new user properties: `gender`, `age`, `department`

- **`src/services/authApi.service.ts`** (UPDATED)
  - Added `signupCustomer()` method
  - Added `signupStaff()` method
  - Added `signupAdmin()` method
  - New DTOs: `SignupCredentials`, `CustomerSignupCredentials`, etc.

#### Authentication Context
- **`src/contexts/AuthContext.tsx`** (UPDATED)
  - Added `signupCustomer()` method
  - Added `signupStaff()` method
  - Added `signupAdmin()` method
  - Added `getUserType()` method
  - Updated `AuthContextType` interface

#### Pages
- **`src/pages/Signup.tsx`** (NEW)
  - Customer signup form
  - Form validation
  - Password strength feedback
  - Optional fields: phone, gender, age
  - Navigation to login

- **`src/pages/AdminDashboard.tsx`** (NEW)
  - Admin control panel
  - Quick stats display
  - Staff management section
  - Analytics section
  - Navigation to admin sub-pages

- **`src/pages/StaffDashboard.tsx`** (NEW)
  - Staff operational dashboard
  - Pending orders display
  - Inventory alerts
  - Quick access to tasks

- **`src/pages/AdminWastage.tsx`** (NEW)
- **`src/pages/AdminInventory.tsx`** (NEW)
- **`src/pages/StaffInventory.tsx`** (NEW)
- **`src/pages/StaffWastage.tsx`** (NEW)
  - Placeholder pages for future implementation

#### Routing
- **`src/App.tsx`** (UPDATED)
  - Implemented role-based routing
  - Created `RoleBasedRouter` component
  - Routes organize by user type:
    - Admin: `/admin/*`
    - Staff: `/staff/*`
    - Customer: `/dashboard/*`
  - Dynamic redirects based on user role
  - Loading state handling

## API Response Format

### Success Response
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "User Name",
      "user_type": "customer",
      "roles": ["customer"],
      "outlet_id": "uuid"
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  },
  "timestamp": "2026-03-25T18:07:15.967Z"
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "code": "ERROR_CODE",
  "timestamp": "2026-03-25T18:07:15.967Z"
}
```

## Security Features

1. **Password Security**
   - Bcrypt hashing with 10 salt rounds
   - Password strength validation
   - Never stored in plaintext
   - Never transmitted in responses

2. **Token Security**
   - HS256 signature authentication
   - 7-day expiration time
   - Refresh token mechanism
   - Token stored in localStorage (frontend)

3. **Route Protection**
   - JWT auth guard on protected routes
   - Role-based access control via @Roles decorator
   - Public decorator for non-protected endpoints
   - Comprehensive error messaging

4. **Input Validation**
   - DTOs with class-validator
   - Email format validation
   - Password complexity enforcement
   - Type safety with TypeScript

## Usage Examples

### Customer Registration
```bash
curl -X POST http://localhost:3000/api/auth/signup/customer \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "SecurePass123!",
    "name": "John Doe",
    "phone": "+91-9999999999",
    "gender": "male",
    "age": 25
  }'
```

### User Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "SecurePass123!"
  }'
```

### Protected Route Access
```bash
curl -X GET http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer <token>"
```

### Staff Creation (Admin Only)
```bash
curl -X POST http://localhost:3000/api/auth/signup/staff \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "email": "staff@example.com",
    "password": "StaffPass123!",
    "name": "Staff Member",
    "department": "kitchen"
  }'
```

## Error Handling

| HTTP Status | Code | Scenario |
|---|---|---|
| 200 | - | Successful operation |
| 400 | BAD_REQUEST | Invalid password, missing fields |
| 401 | UNAUTHORIZED | Invalid credentials, expired token |
| 409 | CONFLICT | Email already exists |
| 403 | FORBIDDEN | Insufficient permissions |
| 500 | SERVER_ERROR | Internal server error |

## Testing Credentials

For development/testing, you can create test users:

```
Admin:
- Email: admin@test.com
- Password: AdminPass123!

Staff:
- Email: staff@test.com
- Password: StaffPass123!

Customer:
- Email: customer@test.com
- Password: CustomerPass123!
```

## Future Enhancements

1. **Two-Factor Authentication (2FA)**
   - SMS/Email verification codes
   - Authenticator app support

2. **OAuth Integration**
   - Google/GitHub login
   - Social authentication

3. **Session Management**
   - Active session tracking
   - Device management
   - Session revocation

4. **Audit Logging**
   - Login attempt tracking
   - Failed authentication logging
   - Security event monitoring

5. **Rate Limiting**
   - Failed login attempt limits
   - API rate limiting
   - DDoS protection

6. **Advanced Password Management**
   - Password reset via email
   - Password change notifications
   - Password history tracking

## Troubleshooting

### Common Issues

**Issue**: "Password does not meet security requirements"
- **Solution**: Ensure password has uppercase, lowercase, number, special character, and is 8+ characters

**Issue**: "User with email already exists"
- **Solution**: Use a different email or use login instead

**Issue**: "Invalid token" on protected routes
- **Solution**: Ensure token is properly formatted in Authorization header: `Bearer <token>`

**Issue**: "Insufficient permissions"
- **Solution**: Verify user role has required permissions for the endpoint

## References

- [JWT.io](https://jwt.io) - JWT specification
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)
