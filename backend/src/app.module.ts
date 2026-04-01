/**
 * ============================================================================
 * BACKEND APPLICATION MODULE - Root NestJS Module
 * ============================================================================
 * This is the root module that bootstraps the entire NestJS application.
 * It sets up:
 * - Database connection (PostgreSQL via TypeORM)
 * - Cache layer (Redis)
 * - Authentication & Authorization
 * - All business modules
 * - Global filters, interceptors, and middleware
 * 
 * Module Architecture:
 * AppModule (root)
 *   ├── ConfigModule (environment variables)
 *   ├── TypeOrmModule (database)
 *   ├── RedisModule (caching & queues)
 *   ├── AuthModule (JWT authentication)
 *   └── Feature Modules:
 *       ├── UsersModule
 *       ├── OutletsModule
 *       ├── SalesModule
 *       ├── InventoryModule
 *       ├── WastageModule
 *       ├── PartyOrdersModule
 *       ├── AttendanceModule
 *       ├── CashFlowModule
 *       ├── IntegrationsModule
 *       ├── ReportsModule
 *       ├── AnalyticsModule
 *       └── Admin & Staff Modules
 * ============================================================================
 */

import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import { RedisModule } from './services/redis.module';
import { AppController } from './app.controller';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { LoggingMiddleware } from './common/middleware/logging.middleware';

// ========== FEATURE MODULES ==========
// Each module encapsulates a business domain with its own:
// - Controllers: API endpoints
// - Services: Business logic
// - DTOs: Data transfer objects
// - Entities: Database models
// - Repositories: Data access layer

import { UsersModule } from './modules/users/users.module';
import { OutletsModule } from './modules/outlets/outlets.module';
import { SalesModule } from './modules/sales/sales.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { WastageModule } from './modules/wastage/wastage.module';
import { PartyOrdersModule } from './modules/party-orders/party-orders.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { CashFlowModule } from './modules/cashflow/cashflow.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { StaffModule } from './modules/staff/staff.module';

/**
 * ============================================================================
 * ROOT APPLICATION MODULE DEFINITION
 * ============================================================================
 */
@Module({
  // ========== CONFIGURATION & INFRASTRUCTURE ==========
  imports: [
    /**
     * ConfigModule: Loads environment variables from .env file
     * Makes them available globally via ConfigService
     * Example: configService.get('DB_HOST')
     */
    ConfigModule.forRoot({
      isGlobal: true,  // Make environment variables accessible everywhere
      envFilePath: '.env',  // Load from .env file
      ignoreEnvFile: process.env.IN_DOCKER === 'true',  // ✅ Skip .env in Docker, use container env
    }),

    // TypeOrmModule: Database connection setup
    // - Connects to PostgreSQL (or SQLite in development)
    // - Auto-loads entities from src/[module]/entities/*.entity.ts
    // - Runs migrations if needed
    // - Provides DataSource for repositories
    TypeOrmModule.forRoot(getDatabaseConfig()),

    /**
     * RedisModule: Caching and queue management
     * - Provides ioredis client for cache operations
     * - Used by BullMQ for job queues
     * - Stores session data and cached responses
     */
    RedisModule,

    // ========== AUTHENTICATION MODULE ==========
    /**
     * AuthModule: Handles JWT authentication
     * - Verifies tokens from request headers
     * - Creates new tokens after login
     * - Provides authentication guards and decorators
     * - Note: Login logic is NOT here (external auth service)
     */
    AuthModule,

    // ========== FEATURE MODULES ==========
    // Each module handles a specific business domain

    /**
     * AdminModule: Administrative operations
     * - Outlet management
     * - User management
     * - System configuration
     * - Restricted to admin role
     */
    AdminModule,

    /**
     * StaffModule: Staff-specific operations
     * - Sales data they can access
     * - Attendance management
     * - Restricted to staff role
     */
    StaffModule,

    /**
     * UsersModule: User management
     * - Create, read, update, delete users
     * - Role management
     * - User profiles
     */
    UsersModule,

    /**
     * OutletsModule: Multi-outlet management
     * - Outlet configuration
     * - Outlet isolation for data
     * - Each operation scoped to outlet_id
     */
    OutletsModule,

    /**
     * SalesModule: Sales transactions
     * - Record sales
     * - Generate bills
     * - Track online/offline sales
     * - Payment reconciliation
     */
    SalesModule,

    /**
     * InventoryModule: Stock management
     * - Track inventory levels
     * - Manage stock movements
     * - Reorder points and alerts
     * - Stock reconciliation
     */
    InventoryModule,

    /**
     * WastageModule: Track product wastage
     * - Record food wastage
     * - Wastage analysis
     * - Cost tracking
     */
    WastageModule,

    /**
     * PartyOrdersModule: Catering orders
     * - Track party/catering orders
     * - Order status management
     * - Custom pricing
     */
    PartyOrdersModule,

    /**
     * AttendanceModule: Employee attendance
     * - Mark attendance (present, absent, late)
     * - Attendance reports
     * - Leave management
     */
    AttendanceModule,

    /**
     * CashFlowModule: Cash management
     * - Track cash in/out
     * - Daily cash reconciliation
     * - Bank deposits
     * - Cash position monitoring
     */
    CashFlowModule,

    /**
     * IntegrationsModule: External integrations
     * - PetPooja API integration (POS sync)
     * - WhatsApp notifications
     * - SMS alerts
     * - Payment gateway integration
     */
    IntegrationsModule,

    /**
     * ReportsModule: Business reports
     * - Sales reports
     * - Inventory reports
     * - Financial reports
     * - PDF/Excel exports
     */
    ReportsModule,

    /**
     * AnalyticsModule: Analytics and insights
     * - Sales analytics
     * - Trends analysis
     * - Performance metrics
     * - Dashboard data
     */
    AnalyticsModule,
  ],

  // ========== ROOT CONTROLLER ==========
  // Minimal controller for health checks and root endpoint
  controllers: [AppController],

  // ========== GLOBAL PROVIDERS ==========
  // Guards and other services applied globally to all routes
  providers: [
    /**
     * JwtAuthGuard: Validates JWT tokens
     * - Checks Authorization header for valid JWT
     * - Throws UnauthorizedException if invalid/missing
     * - Adds user to request object
     * - Applied globally to all routes
     */
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },

    /**
     * RolesGuard: Checks user permissions
     * - Validates user has required role
     * - Uses @Roles() decorator on controllers/methods
     * - Enforces role-based access control (RBAC)
     * - Applied globally after JwtAuthGuard
     */
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],

  exports: [],
})
export class AppModule implements NestModule {
  /**
   * ========== MIDDLEWARE CONFIGURATION ==========
   * Configure middleware to run for specific routes
   * Middleware executes before guards and controllers
   */
  configure(consumer: MiddlewareConsumer) {
    /**
     * LoggingMiddleware: Logs all HTTP requests
     * Logs:
     * - Request method and URL
     * - User ID (if authenticated)
     * - Response time
     * - Status code
     * Applied to all routes ('*')
     */
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}

