import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiResponse } from '../../common/interfaces/api-response.interface';

/**
 * ⚠️ MOCK AUTH FOR TESTING
 * 
 * Provides mock authentication for development/testing purposes.
 * Accepts any email with any password for ease of testing.
 * Replace with real authentication service in production.
 */

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<ApiResponse> {
    try {
      const result = await this.authService.login(loginDto);
      return {
        status: 'success',
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: error.message || 'Login failed',
          code: 'AUTH_ERROR',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
