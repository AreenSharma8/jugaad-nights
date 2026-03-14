import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

/**
 * ⚠️ DEVELOPMENT ONLY AUTH MODULE
 * 
 * This module provides temporary authentication for development purposes.
 * It should be replaced with an external authentication service in production.
 * 
 * Rules from requirements:
 * - Authentication is handled by another service
 * - DO NOT implement Login, JWT creation, User login flows in production
 * - This is a temporary solution for development/testing only
 */

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
