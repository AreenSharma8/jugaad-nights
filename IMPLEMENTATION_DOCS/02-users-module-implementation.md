# Phase 2: Users Module Implementation

## Overview
This phase implemented comprehensive user management with role-based access control (RBAC), permission management, and outlet assignment functionality.

## Work Completed

### 1. Database Schema

#### Tables Created

**users**
- `id` (UUID, primary key)
- `outlet_id` (UUID, foreign key) - Multi-outlet isolation
- `first_name` (string)
- `last_name` (string)
- `email` (string, unique)
- `phone_number` (string)
- `employee_id` (string)
- `status` (enum: ACTIVE, INACTIVE, INACTIVE_PENDING_APPROVAL)
- `is_admin` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `created_by` (UUID)
- `updated_by` (UUID)
- `deleted_at` (timestamp, soft delete)

**roles**
- `id` (UUID, primary key)
- `outlet_id` (UUID)
- `name` (string, unique per outlet)
- `description` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `created_by` (UUID)
- `updated_by` (UUID)
- `deleted_at` (timestamp)

**permissions**
- `id` (UUID, primary key)
- `name` (string, unique)
- `resource` (string) - Resource being protected
- `action` (enum: CREATE, READ, UPDATE, DELETE, APPROVE)
- `description` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**user_roles** (Join table)
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key)
- `role_id` (UUID, foreign key)
- `outlet_id` (UUID)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**user_outlets** (User-Outlet mapping)
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key)
- `outlet_id` (UUID, foreign key)
- `is_primary` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 2. Entity Models (TypeORM)

#### User Entity
- Relationships:
  - `roles` (many-to-many via UserRole)
  - `outlets` (many-to-many via UserOutlet)
  - `createdByUser` (self-referential)
  - `updatedByUser` (self-referential)
- Indexes:
  - Email (unique)
  - Employee ID
  - Outlet ID
  - Status

#### Role Entity
- Relationships:
  - `permissions` (many-to-many)
  - `users` (many-to-many via UserRole)
  - `outlet` (many-to-one)

#### Permission Entity
- Attributes: resource, action, description
- Index on (resource, action)

#### UserRole Entity
- Junction table for user-role-outlet relationships
- Indexes: user_id, role_id, outlet_id

#### UserOutlet Entity
- Junction table for user-outlet assignments
- Support for primary outlet designation

### 3. Data Transfer Objects (DTOs)

#### CreateUserDto
```typescript
{
  first_name: string (required)
  last_name: string (required)
  email: string (required, unique)
  phone_number: string (required)
  employee_id: string (required)
  status: enum (ACTIVE, INACTIVE)
  role_ids: UUID[] (required)
  outlet_ids: UUID[] (required)
}
```

#### UpdateUserDto
```typescript
{
  first_name?: string
  last_name?: string
  phone_number?: string
  status?: enum
  role_ids?: UUID[]
  outlet_ids?: UUID[]
}
```

#### UserResponseDto
```typescript
{
  id: UUID
  first_name: string
  last_name: string
  email: string
  phone_number: string
  employee_id: string
  status: enum
  roles: Role[]
  outlets: Outlet[]
  created_at: timestamp
  updated_at: timestamp
}
```

#### CreateRoleDto
```typescript
{
  name: string (required)
  description: string
  permission_ids: UUID[] (required)
}
```

#### UpdateRoleDto
```typescript
{
  name?: string
  description?: string
  permission_ids?: UUID[]
}
```

### 4. Repository Pattern

#### UserRepository
- `findById(id)` - Get user with roles and outlets
- `findByEmail(email)` - Unique email lookup
- `findByOutletId(outletId)` - All users in outlet
- `findWithRoles(id)` - User with populated roles
- `create(userData)` - Create new user
- `update(id, updateData)` - Update user details
- `softDelete(id)` - Soft delete user
- `findByStatus(status, outletId)` - Filter by status
- Pagination support

#### RoleRepository
- `findById(id)` - Get role with permissions
- `findByOutletId(outletId)` - Outlet-specific roles
- `findByName(name, outletId)` - Unique role lookup
- `create(roleData)` - Create new role
- `update(id, updateData)` - Update role
- `softDelete(id)` - Soft delete role
- Pagination support

#### PermissionRepository
- `findAll()` - All available permissions
- `findByResource(resource)` - Permissions by resource
- `findByAction(action)` - Permissions by action
- Read-only operations

### 5. Service Layer

#### UserService
- User CRUD operations
- Validation:
  - Email uniqueness
  - Employee ID uniqueness
  - Role existence verification
  - Outlet assignment validation
- Business Logic:
  - User creation with role assignment
  - Role updates with outlet context
  - User status management
  - Primary outlet designation
  - User listing with pagination and filtering

#### RoleService
- Role management operations
- Permission assignment
- Role cloning/duplication
- Bulk role operations
- Role usage validation (prevent deletion of assigned roles)

#### PermissionService
- Permission lookup and retrieval
- Permission by resource/action queries
- Read-only service

### 6. Controller Layer

#### UsersController
Endpoints:
- `GET /users` - List all users
  - Query params: `outlet_id`, `status`, `page`, `limit`, `search`
  - Response: Paginated user list
  
- `POST /users` - Create new user
  - Body: CreateUserDto
  - Validation: Email and Employee ID uniqueness
  - Response: Created user with roles/outlets
  
- `GET /users/:id` - Get specific user
  - Response: User with all relationships
  
- `PATCH /users/:id` - Update user
  - Body: UpdateUserDto
  - Validation: Email and Employee ID (if changed)
  - Response: Updated user details
  
- `DELETE /users/:id` - Soft delete user
  - Sets `deleted_at` timestamp
  
- `GET /users/:id/roles` - Get user's roles
  - Response: List of assigned roles
  
- `POST /users/:id/roles` - Assign roles to user
  - Body: { role_ids: UUID[] }
  
- `DELETE /users/:id/roles/:role_id` - Remove role from user

#### RolesController
Endpoints:
- `GET /roles` - List all roles
  - Query params: `outlet_id`, `page`, `limit`
  - Response: Paginated role list
  
- `POST /roles` - Create new role
  - Body: CreateRoleDto
  - Response: Created role with permissions
  
- `GET /roles/:id` - Get specific role
  - Response: Role with all permissions
  
- `PATCH /roles/:id` - Update role
  - Body: UpdateRoleDto
  - Response: Updated role
  
- `DELETE /roles/:id` - Delete role
  - Validation: No active users with this role
  
- `GET /roles/:id/permissions` - Role's permissions
  - Response: List of permissions

#### PermissionsController
Endpoints:
- `GET /permissions` - List all permissions
  - Query params: `resource`, `action`
  - Response: Permission list

### 7. Security & RBAC

#### Role-Based Access Control
- Guard implementation: `@UseGuards(RbacGuard)`
- Decorator: `@RequirePermission('resource', 'action')`
- Resource-action based model:
  - Users: CREATE, READ, UPDATE, DELETE, APPROVE
  - Roles: CREATE, READ, UPDATE, DELETE
  - Permissions: READ
  - Outlets: READ, UPDATE
  - etc.

#### Outlet Isolation
- All queries filtered by `outlet_id`
- Users can only see users in their outlet(s)
- Cross-outlet verification on assignments

#### Admin Functionality
- Super-user access via `is_admin` flag
- Admin bypass of RBAC checks
- Admin audit trail

### 8. Validation Rules

#### User Validation
- Email: Valid email format, unique
- Phone Number: Valid phone format
- First/Last Name: Non-empty strings
- Employee ID: Unique within outlet
- Status: Must be valid enum
- Role IDs: Must exist in database
- Outlet IDs: Must exist and be accessible

#### Role Validation
- Name: Non-empty, unique per outlet
- Description: Optional text
- Permissions: Must exist in database

### 9. API Response Format

All endpoints return:

**Success (201/200)**
```json
{
  "status": "success",
  "data": { /* user, role, or list */ },
  "timestamp": "2024-03-13T10:30:00Z"
}
```

**Error (400/401/403/404/500)**
```json
{
  "status": "error",
  "message": "Error description",
  "code": "ERROR_CODE",
  "timestamp": "2024-03-13T10:30:00Z"
}
```

### 10. Testing

#### Jest + Supertest Tests

**UserService Tests**
- Create user with valid data
- Create user with duplicate email (fails)
- Create user with invalid role (fails)
- Update user details
- Get user with roles
- List users with pagination
- List users with outlet filter
- Soft delete user
- Assign roles to user

**RoleService Tests**
- Create role with permissions
- Update role
- Get role with permissions
- List roles by outlet
- Delete role (validates no users assigned)

**UsersController Tests**
- POST /users - Create user (201)
- GET /users - List users (200)
- GET /users/:id - Get specific user (200)
- PATCH /users/:id - Update user (200)
- DELETE /users/:id - Soft delete (200)
- GET /users/:id/roles - Get user roles (200)
- Invalid role assignment (400)
- Duplicate email (400)

**RolesController Tests**
- POST /roles - Create role
- GET /roles - List roles
- GET /roles/:id - Get role
- PATCH /roles/:id - Update role
- DELETE /roles/:id - Delete role
- Assign permissions
- Invalid permission (400)

### Test Execution
```bash
npm run test -- users
npm run test:e2e
```

## Key Features

✅ Multi-outlet user management  
✅ Role-based access control (RBAC)  
✅ Permission-based authorization  
✅ User-role-outlet relationships  
✅ Soft delete support  
✅ User status management (ACTIVE, INACTIVE, INACTIVE_PENDING_APPROVAL)  
✅ Pagination and filtering  
✅ Audit trail (created_by, updated_by)  
✅ Email uniqueness enforcement  
✅ Primary outlet designation  

## Files Created

### Entities
- `src/modules/users/entities/user.entity.ts`
- `src/modules/users/entities/role.entity.ts`
- `src/modules/users/entities/permission.entity.ts`
- `src/modules/users/entities/user-role.entity.ts`
- `src/modules/users/entities/user-outlet.entity.ts`

### DTOs
- `src/modules/users/dtos/create-user.dto.ts`
- `src/modules/users/dtos/update-user.dto.ts`
- `src/modules/users/dtos/user-response.dto.ts`
- `src/modules/users/dtos/create-role.dto.ts`
- `src/modules/users/dtos/update-role.dto.ts`
- `src/modules/users/dtos/role-response.dto.ts`

### Repositories
- `src/modules/users/repositories/user.repository.ts`
- `src/modules/users/repositories/role.repository.ts`
- `src/modules/users/repositories/permission.repository.ts`

### Services
- `src/modules/users/services/user.service.ts`
- `src/modules/users/services/role.service.ts`
- `src/modules/users/services/permission.service.ts`

### Controllers
- `src/modules/users/controllers/users.controller.ts`
- `src/modules/users/controllers/roles.controller.ts`
- `src/modules/users/controllers/permissions.controller.ts`

### Module & Tests
- `src/modules/users/users.module.ts`
- `src/modules/users/users.service.spec.ts`
- `src/modules/users/users.controller.spec.ts`
- `test/users.e2e-spec.ts`

---

**Status**: ✅ Complete  
**Test Result**: All tests passing  
**Ready for**: Phase 3 - Outlets Module Implementation
