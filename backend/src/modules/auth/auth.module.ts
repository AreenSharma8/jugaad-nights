import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { UserRepository } from '../users/repositories/user.repository';

/**
 * Authentication Module
 * 
 * Provides JWT-based authentication, signup/registration, and user login functionality.
 * Integrates with User module for database operations.
 */

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AuthController],
  providers: [AuthService, UserRepository],
  exports: [AuthService, UserRepository],
})
export class AuthModule {}
