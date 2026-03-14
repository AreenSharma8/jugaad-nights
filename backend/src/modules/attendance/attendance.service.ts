import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AttendanceRecord } from './entities';
import { CheckInDto, CheckOutDto } from './dto/attendance.dto';
import { AttendanceRepository } from './repositories/attendance.repository';

@Injectable()
export class AttendanceService {
  private readonly attendanceRepository: AttendanceRepository;

  constructor(private dataSource: DataSource) {
    this.attendanceRepository = new AttendanceRepository(dataSource);
  }

  async checkIn(checkInDto: CheckInDto, created_by: string): Promise<AttendanceRecord> {
    const record = this.attendanceRepository.create({
      ...checkInDto,
      check_in_time: new Date(),
      status: 'checked_in',
      created_by,
      updated_by: created_by,
    });
    return this.attendanceRepository.save(record);
  }

  async checkOut(checkOutDto: CheckOutDto, updated_by: string): Promise<AttendanceRecord> {
    const record = await this.attendanceRepository.findOne({
      where: { id: checkOutDto.attendance_id },
    });
    if (!record) throw new NotFoundException('Attendance record not found');

    record.check_out_time = new Date();
    record.status = 'checked_out';
    record.updated_by = updated_by;

    if (record.check_in_time) {
      const diffMs = record.check_out_time.getTime() - record.check_in_time.getTime();
      record.total_hours = (diffMs / (1000 * 60 * 60)) as any;
    }

    return this.attendanceRepository.save(record);
  }

  async getByOutlet(outlet_id: string): Promise<AttendanceRecord[]> {
    return this.attendanceRepository.findByOutlet(outlet_id);
  }
}
