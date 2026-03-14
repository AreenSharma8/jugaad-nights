import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { CheckInDto, CheckOutDto } from './dto/attendance.dto';

@ApiTags('Attendance')
@ApiBearerAuth()
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('checkin')
  @ApiOperation({ summary: 'Staff check-in' })
  async checkIn(@Body() checkInDto: CheckInDto) {
    const created_by = '123e4567-e89b-12d3-a456-426614174000';
    return this.attendanceService.checkIn(checkInDto, created_by);
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Staff check-out' })
  async checkOut(@Body() checkOutDto: CheckOutDto) {
    const updated_by = '123e4567-e89b-12d3-a456-426614174000';
    return this.attendanceService.checkOut(checkOutDto, updated_by);
  }

  @Get()
  @ApiOperation({ summary: 'Get attendance records' })
  async getRecords(@Query('outlet_id') outlet_id: string) {
    return this.attendanceService.getByOutlet(outlet_id);
  }
}
