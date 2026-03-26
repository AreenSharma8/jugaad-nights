import { Module } from '@nestjs/common';
import { StaffController } from './staff.controller';

/**
 * Staff Module
 * 
 * Provides staff panel routes and functionality
 * Accessible to users with 'staff' or 'admin' roles
 */

@Module({
  controllers: [StaffController],
  providers: [],
})
export class StaffModule {}
