import { Controller, Get } from '@nestjs/common';
import type { ApiResponse } from './common/interfaces/api-response.interface';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  @Public()
  @Get()
  getHealth(): ApiResponse {
    return {
      status: 'success',
      data: {
        message: 'Jugaad Nights API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };
  }

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
