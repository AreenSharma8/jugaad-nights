/**
 * ============================================================================
 * MAIN.TS - Application Entry Point
 * ============================================================================
 * This is the starting point of the NestJS application.
 * It:
 * 1. Creates the NestJS application instance
 * 2. Configures global settings (CORS, filters, interceptors, pipes)
 * 3. Sets up Swagger API documentation
 * 4. Starts the HTTP server on PORT 3000
 * 
 * Execution Flow:
 * 1. bootstrap() function called
 * 2. NestFactory.create(AppModule) loads all modules
 * 3. Global middleware/filters/interceptors applied
 * 4. Swagger docs generated
 * 5. Server listens on port 3000
 * ============================================================================
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

/**
 * ============================================================================
 * BOOTSTRAP FUNCTION - Initialize Application
 * ============================================================================
 */
async function bootstrap() {
  /**
   * Create NestJS application instance
   * - Loads AppModule and all imports
   * - Initializes dependency injection container
   * - Builds entire module tree
   */
  const app = await NestFactory.create(AppModule);

  /**
   * ========== CORS CONFIGURATION ==========
   * Allow frontend to make requests to this backend API
   * 
   * Development (NODE_ENV !== 'production'):
   * - Accept requests from localhost:8080 (frontend dev server)
   * - Accept requests from localhost:3000 (another backend instance)
   * - Accept from 127.0.0.1:8080 (loopback address)
   * 
   * Production:
   * - Accept only from FRONTEND_URL environment variable
   * - Default: http://localhost:8080
   * 
   * Security:
   * - credentials: true allows cookies/credentials in cross-origin requests
   * - Specific methods whitelisted (no "*" for production)
   * - Specific headers whitelisted
   */
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL || 'http://localhost:8080'
      : [
          'http://localhost:8080',      // Frontend dev server
          'http://127.0.0.1:8080',      // Loopback
          'http://localhost:3000',      // Another backend instance
        ],
    credentials: true,  // Allow cookies and Authorization header
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  /**
   * ========== GLOBAL EXCEPTION FILTER ==========
   * Catches ALL unhandled exceptions and formats them
   * into standardized error responses:
   * {
   *   "status": "error",
   *   "message": "Error description",
   *   "code": "ERROR_CODE",
   *   "timestamp": "2025-01-01T12:00:00Z"
   * }
   * 
   * Applied to all routes globally
   */
  app.useGlobalFilters(new GlobalExceptionFilter());

  /**
   * ========== GLOBAL RESPONSE INTERCEPTOR ==========
   * Wraps all successful responses in standard format:
   * {
   *   "status": "success",
   *   "data": { ... },
   *   "timestamp": "2025-01-01T12:00:00Z"
   * }
   * 
   * Provides consistent response format across entire API
   */
  app.useGlobalInterceptors(new ResponseInterceptor());

  /**
   * ========== GLOBAL VALIDATION PIPE ==========
   * Validates all incoming requests against DTOs
   * - Checks required fields
   * - Validates data types
   * - Ensures string lengths, email formats, etc.
   * - Returns 400 Bad Request with validation errors if invalid
   * 
   * Usage in DTOs via class-validator decorators:
   * @IsString()
   * @Length(3, 50)
   * name: string;
   */
  app.useGlobalPipes(new ValidationPipe());

  /**
   * ========== ROOT PATH HANDLER ==========
   * Handle GET / before global /api prefix is applied
   * Returns API status and helpful documentation links
   */
  app.use((req: any, res: any, next: any) => {
    if (req.path === '/' && req.method === 'GET') {
      return res.status(200).json({
        status: 'success',
        data: {
          service: 'Jugaad Nights Operations API',
          message: 'API is running and ready for requests',
          version: '1.0.0',
          apiDocs: 'http://localhost:3000/api/docs',
          healthCheck: 'http://localhost:3000/api/health',
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      });
    }
    next();
  });

  /**
   * ========== API PREFIX ==========
   * All routes are prefixed with /api
   * Example:
   * - Controller: GET /users
   * - Actual endpoint: GET /api/users
   * 
   * Purpose: Separate API from other routes (static files, etc.)
   */
  app.setGlobalPrefix('api');

  /**
   * ========== SWAGGER/OPENAPI SETUP ==========
   * Generates interactive API documentation
   * Accessible at: http://localhost:3000/api/docs
   * 
   * Features:
   * - Lists all endpoints
   * - Shows request/response schemas
   * - Try it out (execute requests in browser)
   * - Authentication bearer token support
   * 
   * Documentation:
   * - Title: Appears in browser tab
   * - Description: API overview
   * - Version: API version number
   * - addBearerAuth: Enables JWT token input in docs
   */
  const config = new DocumentBuilder()
    .setTitle('Jugaad Nights Operations API')
    .setDescription('Internal operations management API for restaurant management')
    .setVersion('1.0')
    .addBearerAuth()  // Enable "Authorize" button in Swagger UI
    .build();

  // Create and setup Swagger documentation
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  /**
   * ========== SERVER STARTUP ==========
   * Get port from environment or use default 3000
   * Start HTTP server listening on this port
   */
  const port = process.env.APP_PORT || 3000;
  await app.listen(port);

  /**
   * ========== STARTUP LOGS ==========
   * Print success message and URLs for developers
   */
  console.log(`✅ Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  console.log(`🔌 Connected to database: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}`);
}

/**
 * ========== ERROR HANDLING FOR BOOTSTRAP ==========
 * If bootstrap fails, print error and exit
 */
bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});

