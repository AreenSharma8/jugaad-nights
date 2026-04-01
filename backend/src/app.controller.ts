import { Controller, Get } from '@nestjs/common';
import type { ApiResponse } from './common/interfaces/api-response.interface';
import { Public } from './common/decorators/public.decorator';

/**
 * Root controller for root path and public health endpoints
 * Note: This controller is registered BEFORE global prefix,
 * so it responds to / (root) instead of /api/
 */
@Controller()
export class AppController {
  /**
   * Root status endpoint accessible at GET /
   * Returns API status and version info
   */
  @Public()
  @Get()
  getRoot(): ApiResponse {
    return {
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
    };
  }

  /**
   * Health check endpoint accessible at GET /api/health
   * Returns simple OK status for monitoring and load balancers
   * Affected by global /api prefix, so responds to /api/health
   */
  @Public()
  @Get('health')
  health(): ApiResponse {
    return {
      status: 'success',
      data: { message: 'OK' },
      timestamp: new Date().toISOString(),
    };
  }
}
