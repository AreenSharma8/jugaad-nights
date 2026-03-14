# Phase 3: Outlets Module Implementation

## Overview
This phase implemented restaurant outlet management, allowing multi-outlet operations with centralized configuration and outlet-specific settings.

## Work Completed

### 1. Database Schema

#### Tables Created

**outlets**
- `id` (UUID, primary key)
- `name` (string, required)
- `location` (string)
- `city` (string)
- `state` (string)
- `zipcode` (string)
- `phone_number` (string)
- `email` (string)
- `manager_id` (UUID, foreign key to users)
- `status` (enum: ACTIVE, INACTIVE, UNDER_MAINTENANCE)
- `timezone` (string, default: IST)
- `operating_hours_start` (time)
- `operating_hours_end` (time)
- `seating_capacity` (integer)
- `cuisine_type` (string)
- `metadata` (JSON)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `created_by` (UUID)
- `updated_by` (UUID)
- `deleted_at` (timestamp, soft delete)
- Index fields: `name`, `city`, `status`, `manager_id`

**outlet_config**
- `id` (UUID, primary key)
- `outlet_id` (UUID, foreign key)
- `config_key` (string)
- `config_value` (JSON/text)
- `description` (text)
- `is_active` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `created_by` (UUID)
- `updated_by` (UUID)
- `deleted_at` (timestamp)
- Unique constraint: (outlet_id, config_key)

**outlet_settings** (Extended configuration)
- `id` (UUID, primary key)
- `outlet_id` (UUID, unique foreign key)
- `tax_rate` (decimal)
- `service_charge_percentage` (decimal)
- `currency_code` (string, default: INR)
- `language_preference` (string, default: en)
- `allow_online_orders` (boolean)
- `allow_reservations` (boolean)
- `allow_takeaway` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 2. Entity Models (TypeORM)

#### Outlet Entity
- Relationships:
  - `manager` (many-to-one with User)
  - `users` (many-to-many via UserOutlet)
  - `configurations` (one-to-many with OutletConfig)
  - `settings` (one-to-one with OutletSettings)
  - `orders` (one-to-many with Order)
  - `inventory` (one-to-many with InventoryItem)
  - `wastage` (one-to-many with WastageEntry)
- Indexes: Name, City, Status, Manager

#### OutletConfig Entity
- Relationships:
  - `outlet` (many-to-one with Outlet)
- Dynamic configuration storage
- Serialization support for JSON values
- Index: (outlet_id, config_key)

#### OutletSettings Entity
- Relationships:
  - `outlet` (one-to-one with Outlet)
- Standardized outlet settings
- Tax and service charge configuration
- Order type flags

### 3. Data Transfer Objects (DTOs)

#### CreateOutletDto
```typescript
{
  name: string (required)
  location: string
  city: string (required)
  state: string
  zipcode: string
  phone_number: string
  email: string
  manager_id: UUID (required)
  status: enum (ACTIVE, INACTIVE)
  timezone: string
  operating_hours_start: string (HH:MM)
  operating_hours_end: string (HH:MM)
  seating_capacity: number
  cuisine_type: string
}
```

#### UpdateOutletDto
```typescript
{
  name?: string
  location?: string
  city?: string
  phone_number?: string
  email?: string
  manager_id?: UUID
  status?: enum
  operating_hours_start?: string
  operating_hours_end?: string
  seating_capacity?: number
  cuisine_type?: string
}
```

#### OutletResponseDto
```typescript
{
  id: UUID
  name: string
  location: string
  city: string
  state: string
  zipcode: string
  phone_number: string
  email: string
  manager: UserResponseDto
  status: enum
  timezone: string
  operating_hours_start: string
  operating_hours_end: string
  seating_capacity: number
  cuisine_type: string
  user_count: number
  created_at: timestamp
  updated_at: timestamp
}
```

#### CreateOutletConfigDto
```typescript
{
  config_key: string (required)
  config_value: any (required)
  description: string
  is_active: boolean (default: true)
}
```

#### UpdateOutletConfigDto
```typescript
{
  config_value?: any
  description?: string
  is_active?: boolean
}
```

#### OutletSettingsDto
```typescript
{
  tax_rate: decimal
  service_charge_percentage: decimal
  currency_code: string
  language_preference: string
  allow_online_orders: boolean
  allow_reservations: boolean
  allow_takeaway: boolean
}
```

### 4. Repository Pattern

#### OutletRepository
- `findById(id)` - Get outlet with manager and config
- `findAll()` - All outlets
- `findByCity(city)` - Outlets by city
- `findByStatus(status)` - Filter by status
- `findByManager(managerId)` - Outlets managed by user
- `create(outletData)` - Create new outlet
- `update(id, updateData)` - Update outlet
- `softDelete(id)` - Soft delete outlet
- `findWithUsers(id)` - Outlet with assigned users
- Pagination support
- Search support (name, city, location)

#### OutletConfigRepository
- `findByOutletId(outletId)` - All configs for outlet
- `findByKey(outletId, key)` - Specific config lookup
- `findActiveConfigs(outletId)` - Active configs only
- `create(configData)` - Add new config
- `update(id, updateData)` - Update config value
- `delete(id)` - Delete config
- `softDelete(id)` - Soft delete config

#### OutletSettingsRepository
- `findByOutletId(outletId)` - Get settings
- `create(settingsData)` - Create default settings
- `update(outletId, settingsData)` - Update settings
- Cascade operations with outlet

### 5. Service Layer

#### OutletService
- Outlet CRUD operations
- Validation:
  - Outlet name uniqueness per city
  - Manager existence verification
  - City/state validation
  - Operating hours validation (end > start)
  - Seating capacity positive validation
- Business Logic:
  - Create outlet with default settings
  - Outlet status management
  - Manager assignment/change
  - User count aggregation
  - Outlet search and filtering
  - Bulk operations support

#### OutletConfigService
- Configuration management
- Validation:
  - Config key uniqueness per outlet
  - Value type validation
  - Reserved config keys protection
- Operations:
  - Get/set config values
  - Config inheritance (default values)
  - Feature flag management
  - Dynamic configuration retrieval

#### OutletSettingsService
- Settings management
- Tax and service charge calculations
- Currency and language preferences
- Order capability flags management

### 6. Controller Layer

#### OutletsController
Endpoints:
- `GET /outlets` - List all outlets
  - Query params: `city`, `status`, `page`, `limit`, `search`
  - Response: Paginated outlet list with manager details
  - Includes: User count, active status
  
- `POST /outlets` - Create new outlet
  - Body: CreateOutletDto
  - Validation: Manager must exist
  - Response: Created outlet with settings
  
- `GET /outlets/:id` - Get specific outlet
  - Response: Outlet with manager, config, and settings
  
- `PATCH /outlets/:id` - Update outlet
  - Body: UpdateOutletDto
  - Validation: Operating hours, seating capacity
  - Response: Updated outlet details
  
- `DELETE /outlets/:id` - Soft delete outlet
  - Validation: No active operations
  - Sets `deleted_at` timestamp
  
- `GET /outlets/:id/config` - Get all outlet configs
  - Response: List of configuration values
  
- `GET /outlets/:id/config/:key` - Get specific config
  - Response: Configuration value
  
- `POST /outlets/:id/config` - Add new config
  - Body: CreateOutletConfigDto
  - Response: Created config entry
  
- `PATCH /outlets/:id/config/:key` - Update config
  - Body: UpdateOutletConfigDto
  - Response: Updated config value
  
- `DELETE /outlets/:id/config/:key` - Delete config
  - Validation: Not a required config key
  
- `GET /outlets/:id/settings` - Get outlet settings
  - Response: Complete settings object
  
- `PATCH /outlets/:id/settings` - Update settings
  - Body: OutletSettingsDto (partial)
  - Validation: Tax rate 0-100, positive percentages
  - Response: Updated settings

### 7. Outlet Isolation & Multi-Tenancy

#### Request Filtering
- Middleware extracts `outlet_id` from request context
- All queries automatically filtered by outlet
- Cross-outlet access prevention

#### User-Outlet Assignment
- Users assigned to one or more outlets
- Primary outlet designation
- Scope validation on all operations

#### Outlet-Specific Behavior
- Timezone-aware operations
- Outlet-specific tax rates
- Service charge overrides
- Custom configurations per outlet

### 8. Configuration Management

#### Configuration Categories
- **Financial**: Tax rates, service charges, discounts
- **Operations**: Operating hours, seating, services
- **Features**: Online orders, reservations, takeaway
- **Integration**: PetPooja settings, payment gateway
- **Notifications**: Email, SMS, WhatsApp templates
- **Reporting**: Default report formats, retention

#### Default Configurations
- Standard tax rate (18%)
- Service charge (0% by default)
- Operating hours (10:00 - 23:00)
- Currency (INR)
- Language (English)

### 9. Validations & Constraints

#### Outlet Validation
- Name: Non-empty, unique with city
- Location: Non-empty string
- City/State: Valid location data
- Phone: Valid phone format
- Email: Valid email format
- Manager: Must be existing user with MANAGER role
- Operating hours: End time > start time
- Seating capacity: Positive integer
- Timezone: Valid IANA timezone

#### Config Validation
- Key: Non-empty, alphanumeric with underscore
- Value: JSON serializable
- Reserved keys: Cannot override system configs
- Active flag: Boolean

### 10. API Response Format

All endpoints return:

**Success (201/200)**
```json
{
  "status": "success",
  "data": { /* outlet, config, or list */ },
  "timestamp": "2024-03-13T10:30:00Z"
}
```

**Error (400/403/404/500)**
```json
{
  "status": "error",
  "message": "Error description",
  "code": "ERROR_CODE",
  "timestamp": "2024-03-13T10:30:00Z"
}
```

### 11. Testing

#### Jest + Supertest Tests

**OutletService Tests**
- Create outlet with valid data
- Create outlet with non-existent manager (fails)
- Create outlet with duplicate name in city (fails)
- Update outlet details
- Get outlet with config and settings
- List outlets with pagination
- List outlets with city filter
- Soft delete outlet
- Operating hours validation
- Seating capacity validation

**OutletConfigService Tests**
- Create config item
- Update config value
- Get config by key
- Duplicate key prevention (per outlet)
- Config active/inactive toggle
- Delete config item

**OutletSettingsService Tests**
- Create default settings on outlet creation
- Update tax rate
- Update service charge
- Get outlet settings
- Currency code validation
- Language preference validation

**OutletsController Tests**
- GET /outlets - List outlets (200)
- POST /outlets - Create outlet (201)
- GET /outlets/:id - Get outlet (200)
- PATCH /outlets/:id - Update outlet (200)
- DELETE /outlets/:id - Soft delete (200)
- GET /outlets/:id/config - List configs (200)
- GET /outlets/:id/config/:key - Get config (200)
- POST /outlets/:id/config - Add config (201)
- PATCH /outlets/:id/config/:key - Update config (200)
- DELETE /outlets/:id/config/:key - Delete config (200)
- Invalid manager (400)
- Duplicate outlet name (400)

### Test Execution
```bash
npm run test -- outlets
npm run test:e2e
```

## Key Features

✅ Multi-outlet management  
✅ Outlet configuration system  
✅ Manager assignment  
✅ Operating hours tracking  
✅ Seating capacity management  
✅ Custom settings per outlet  
✅ Tax and service charge configuration  
✅ Feature flags (online orders, reservations, takeaway)  
✅ Timezone support  
✅ Soft delete with data preservation  
✅ Pagination and filtering  

## Files Created

### Entities
- `src/modules/outlets/entities/outlet.entity.ts`
- `src/modules/outlets/entities/outlet-config.entity.ts`
- `src/modules/outlets/entities/outlet-settings.entity.ts`

### DTOs
- `src/modules/outlets/dtos/create-outlet.dto.ts`
- `src/modules/outlets/dtos/update-outlet.dto.ts`
- `src/modules/outlets/dtos/outlet-response.dto.ts`
- `src/modules/outlets/dtos/outlet-config.dto.ts`
- `src/modules/outlets/dtos/outlet-settings.dto.ts`

### Repositories
- `src/modules/outlets/repositories/outlet.repository.ts`
- `src/modules/outlets/repositories/outlet-config.repository.ts`
- `src/modules/outlets/repositories/outlet-settings.repository.ts`

### Services
- `src/modules/outlets/services/outlet.service.ts`
- `src/modules/outlets/services/outlet-config.service.ts`
- `src/modules/outlets/services/outlet-settings.service.ts`

### Controllers
- `src/modules/outlets/controllers/outlets.controller.ts`
- `src/modules/outlets/controllers/outlet-config.controller.ts`

### Module & Tests
- `src/modules/outlets/outlets.module.ts`
- `src/modules/outlets/outlets.service.spec.ts`
- `src/modules/outlets/outlets.controller.spec.ts`
- `test/outlets.e2e-spec.ts`

---

**Status**: ✅ Complete  
**Test Result**: All tests passing  
**Ready for**: Phase 4 - Sales Module Implementation
