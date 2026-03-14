import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { AttendanceRecord } from './entities';
import { AttendanceRepository } from './repositories/attendance.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AttendanceRecord])],
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceRepository],
  exports: [AttendanceService],
})
export class AttendanceModule {}
