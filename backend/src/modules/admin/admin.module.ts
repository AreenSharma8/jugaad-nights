import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';

/**
 * Admin Module
 * 
 * Provides admin panel routes and functionality
 * Restricted to users with 'admin' role
 */

@Module({
  controllers: [AdminController],
  providers: [],
})
export class AdminModule {}
