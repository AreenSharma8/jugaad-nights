/**
 * RBAC (Role-Based Access Control) Guard
 * Validates that user has required roles
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException({
        status: 'error',
        message: 'User not authenticated',
        code: 'FORBIDDEN',
        timestamp: new Date().toISOString(),
      });
    }

    // Check if user has any of the required roles
    const hasRole = requiredRoles.some((role) => user.roles?.includes(role));

    if (!hasRole) {
      this.logger.warn(
        `User ${user.email} lacks required roles. Required: ${requiredRoles.join(', ')}, Has: ${user.roles?.join(', ')}`
      );

      throw new ForbiddenException({
        status: 'error',
        message: `Access denied. Required roles: ${requiredRoles.join(', ')}`,
        code: 'INSUFFICIENT_PERMISSIONS',
        timestamp: new Date().toISOString(),
      });
    }

    return true;
  }
}

export default RolesGuard;
