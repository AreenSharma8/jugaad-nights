import { Controller, Post, Body, HttpException, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto, CustomerSignupDto, StaffSignupDto, AdminSignupDto } from './dto/signup.dto';
import { ApiResponse } from '../../common/interfaces/api-response.interface';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

/**
 * Authentication Controller
 * 
 * Handles user authentication, signup/registration, and token verification
 * with proper JWT and role-based access control
 */

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * User login
   * Public endpoint - anyone can login
   */
  @Public()
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

  /**
   * Customer signup
   * Public endpoint - anyone can register as customer
   */
  @Public()
  @Post('signup/customer')
  async signupCustomer(@Body() signupDto: CustomerSignupDto): Promise<ApiResponse> {
    try {
      const result = await this.authService.signupCustomer(signupDto);
      return {
        status: 'success',
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const statusCode =
        error.status === 409 || error.message?.includes('already exists')
          ? HttpStatus.CONFLICT
          : error.status === 400 || error.message?.includes('does not meet')
          ? HttpStatus.BAD_REQUEST
          : HttpStatus.INTERNAL_SERVER_ERROR;

      throw new HttpException(
        {
          status: 'error',
          message: error.message || 'Signup failed',
          code: error.code || 'SIGNUP_ERROR',
          timestamp: new Date().toISOString(),
        },
        statusCode,
      );
    }
  }

  /**
   * Staff signup
   * Protected endpoint - only admins can create staff accounts
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('signup/staff')
  async signupStaff(
    @Body() signupDto: StaffSignupDto,
    @Request() req: any,
  ): Promise<ApiResponse> {
    try {
      const result = await this.authService.signupStaff(signupDto, req.user.sub);
      return {
        status: 'success',
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const statusCode =
        error.status === 409 || error.message?.includes('already exists')
          ? HttpStatus.CONFLICT
          : error.status === 400 || error.message?.includes('does not meet')
          ? HttpStatus.BAD_REQUEST
          : HttpStatus.INTERNAL_SERVER_ERROR;

      throw new HttpException(
        {
          status: 'error',
          message: error.message || 'Staff signup failed',
          code: error.code || 'SIGNUP_ERROR',
          timestamp: new Date().toISOString(),
        },
        statusCode,
      );
    }
  }

  /**
   * Admin signup
   * Protected endpoint - only super admins can create admin accounts
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('signup/admin')
  async signupAdmin(
    @Body() signupDto: AdminSignupDto,
    @Request() req: any,
  ): Promise<ApiResponse> {
    try {
      const result = await this.authService.signupAdmin(signupDto, req.user.sub);
      return {
        status: 'success',
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const statusCode =
        error.status === 409 || error.message?.includes('already exists')
          ? HttpStatus.CONFLICT
          : error.status === 400 || error.message?.includes('does not meet')
          ? HttpStatus.BAD_REQUEST
          : HttpStatus.INTERNAL_SERVER_ERROR;

      throw new HttpException(
        {
          status: 'error',
          message: error.message || 'Admin signup failed',
          code: error.code || 'SIGNUP_ERROR',
          timestamp: new Date().toISOString(),
        },
        statusCode,
      );
    }
  }

  /**
   * Verify token
   * Protected endpoint - verifies JWT token validity
   */
  @UseGuards(JwtAuthGuard)
  @Post('verify')
  async verify(@Request() req: any): Promise<ApiResponse> {
    return {
      status: 'success',
      data: {
        user: req.user,
        valid: true,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Refresh token
   * Protected endpoint - generates new JWT token
   */
  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refresh(@Request() req: any): Promise<ApiResponse> {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const result = await this.authService.refreshToken(token);
      return {
        status: 'success',
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: error.message || 'Token refresh failed',
          code: 'TOKEN_REFRESH_ERROR',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}

