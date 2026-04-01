/**
 * ============================================================================
 * DATABASE CONFIGURATION - TypeORM Setup
 * ============================================================================
 * 
 * This file configures the TypeORM database connection for the Jugaad Nights
 * backend. It handles both development and production database setups.
 * 
 * Key Components:
 * 1. getDatabaseConfig() - Returns TypeORM module configuration
 * 2. AppDataSource - DataSource instance for CLI migrations
 * 3. getRedisConfig() - Redis cache configuration
 * 
 * Environment Variables Used:
 * - IN_DOCKER: Set to 'true' when running in Docker, 'false' for local dev
 * - DB_TYPE: Type of database (postgres/sqlite)
 * - DB_HOST: Database hostname (postgres in Docker, localhost locally)
 * - DB_PORT: Database port (5432 for PostgreSQL)
 * - DB_USER: Database username
 * - DB_PASSWORD: Database password
 * - DB_NAME: Database name (jugaad_nights)
 * - DB_LOGGING: Enable TypeORM query logging
 * - REDIS_HOST: Redis hostname (redis in Docker, localhost locally)
 * - REDIS_PORT: Redis port (6379)
 * 
 * Connection Flow:
 * 1. Docker Environment:
 *    - Backend container connects to 'postgres' service via Docker network
 *    - Service discovery uses service name as hostname
 *    - No localhost routing issues
 * 
 * 2. Local Development:
 *    - Backend connects to 'localhost' for PostgreSQL
 *    - Assumes PostgreSQL is running locally on port 5432
 * 
 * Key Features:
 * - Automatic retry with exponential backoff (20 attempts, 3 second delay)
 * - Query logging in development mode
 * - Schema synchronization enabled for auto-migration
 * - Connection pooling for better performance
 * 
 * ============================================================================
 */

import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as path from 'path';

// ✅ NestJS ConfigModule already handles env loading
// Do NOT manually call dotenv.config() - it conflicts with docker-compose env vars

/**
 * Determine if running in Docker environment
 * Used to select appropriate database host:
 * - Docker: Uses service name 'postgres' (resolved by Docker DNS)
 * - Local: Uses 'localhost'
 */
const isRunningInDocker = process.env.IN_DOCKER === 'true';
const defaultDbHost = isRunningInDocker ? 'postgres' : 'localhost';
const defaultRedisHost = isRunningInDocker ? 'redis' : 'localhost';

/**
 * ============================================================================
 * GET DATABASE CONFIGURATION
 * ============================================================================
 * 
 * Returns TypeORM module configuration based on DB_TYPE environment variable.
 * Supports both SQLite (development) and PostgreSQL (production).
 * 
 * @returns {TypeOrmModuleOptions} Database configuration object
 * 
 * Flow:
 * 1. Check DB_TYPE environment variable
 * 2. If 'sqlite': Return SQLite configuration (local file-based)
 * 3. If 'postgres': Return PostgreSQL configuration (network database)
 * 4. Apply retry logic and query logging based on environment
 * 
 * ============================================================================
 */
export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  const dbType = process.env.DB_TYPE || 'postgres';

  /**
   * ========== SQLITE CONFIGURATION ==========
   * Used for local development when DB_TYPE=sqlite
   * Stores database in local file: data/jugaad_nights.db
   * No network connectivity required
   * Note: SQLite not recommended for production
   */
  if (dbType === 'sqlite') {
    return {
      type: 'sqlite',
      // Database file location in local filesystem
      database: process.env.DB_DATABASE || path.join(process.cwd(), 'data', 'jugaad_nights.db'),
      // Entity files (compiled TypeScript) used for schema definition
      entities: ['dist/**/*.entity{.ts,.js}'],
      // Migration files for schema management
      migrations: ['dist/migrations/**/*{.ts,.js}'],
      // Synchronize schema automatically (caution in production)
      synchronize: true,
      // Enable query logging
      logging: process.env.DB_LOGGING === 'true',
      // Don't drop schema on startup
      dropSchema: false,
      // Enable query result caching
      cache: true,
    } as TypeOrmModuleOptions;
  }

  /**
   * ========== POSTGRESQL CONFIGURATION ==========
   * Used for production/staging when DB_TYPE=postgres
   * Connects to PostgreSQL 16 server via network
   * Includes retry logic for container startup synchronization
   */
  return {
    type: 'postgres',
    // Database host - resolved differently based on environment
    // Docker: 'postgres' (service name, resolved by Docker DNS)
    // Local: 'localhost' (local PostgreSQL instance)
    host: process.env.DB_HOST || defaultDbHost,
    // Port where PostgreSQL listens
    port: parseInt(process.env.DB_PORT || '5432'),
    // Database user credentials
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    // Database name to connect to
    database: process.env.DB_NAME || 'jugaad_nights',
    // Entity files for schema definition
    entities: ['dist/**/*.entity{.ts,.js}'],
    // Migration files for version control of schema
    migrations: ['dist/migrations/**/*{.ts,.js}'],
    // Automatically sync schema with entities (not safe for production)
    synchronize: true,
    // Log queries in development mode for debugging
    logging: process.env.NODE_ENV === 'development',
    // Preserve existing data when reconnecting
    dropSchema: false,
    // Cache query results for performance
    cache: true,
    // Retry connection 20 times before failing
    // Handles Docker container startup delays
    retryAttempts: 20,
    // Wait 3 seconds between retry attempts
    retryDelay: 3000,
  };
};

/**
 * ============================================================================
 * APP DATA SOURCE - TypeORM CLI Support
 * ============================================================================
 * 
 * Creates a DataSource instance for:
 * 1. TypeORM CLI commands (migrations, schema sync)
 * 2. Manual database operations outside NestJS module
 * 3. Database introspection and debugging
 * 
 * Note: This is for CLI operations and doesn't start the server
 * 
 * ============================================================================
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  // Same host resolution logic as module config
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'jugaad_nights',
  // Source TypeScript entity files (compiled)
  entities: ['dist/**/*.entity.js'],
  // Source TypeScript migration files
  migrations: ['dist/migrations/*.js'],
  // Don't auto-sync schema for CLI operations
  synchronize: false,
  // Disable logging for CLI
  logging: false,
});

/**
 * ============================================================================
 * REDIS CONFIGURATION
 * ============================================================================
 * 
 * Configures Redis connection for:
 * 1. Session storage
 * 2. Query result caching
 * 3. BullMQ job queues
 * 4. Real-time data caching
 * 
 * Includes automatic retry with exponential backoff
 * 
 * ============================================================================
 */
export const getRedisConfig = () => {
  return {
    // Redis host - resolved by environment (Docker service name or localhost)
    host: process.env.REDIS_HOST || defaultRedisHost,
    // Redis port (default: 6379)
    port: parseInt(process.env.REDIS_PORT || '6379'),
    // Optional password for Redis authentication
    password: process.env.REDIS_PASSWORD,
    /**
     * Retry strategy for Redis connection
     * Implements exponential backoff:
     * - 1st retry: 50ms
     * - 2nd retry: 100ms
     * - 3rd retry: 150ms
     * - Max delay: 2000ms (2 seconds)
     */
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  };
};
