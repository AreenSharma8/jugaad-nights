/**
 * JWT Authentication Guard
 * Validates JWT token on protected routes
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { jwtService } from '../utils/jwt.service';
import { PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if endpoint is marked as @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    try {
      const token = this.extractToken(request);

      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      const payload = jwtService.verify(token);
      request.user = payload;

      return true;
    } catch (error) {
      this.logger.warn(`Authentication failed: ${error.message}`);
      throw new UnauthorizedException({
        status: 'error',
        message: error.message || 'Invalid token',
        code: 'UNAUTHORIZED',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Extract JWT from Authorization header
   */
  private extractToken(request: any): string | null {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return null;
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer') {
      return null;
    }

    return token;
  }
}

export default JwtAuthGuard;
