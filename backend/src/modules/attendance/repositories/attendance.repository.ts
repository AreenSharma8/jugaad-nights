import { Injectable } from '@nestjs/common';
import { DataSource, Repository, IsNull } from 'typeorm';
import { AttendanceRecord } from '../entities/attendance-record.entity';

@Injectable()
export class AttendanceRepository extends Repository<AttendanceRecord> {
  constructor(private dataSource: DataSource) {
    super(AttendanceRecord, dataSource.createEntityManager());
  }

  async findByOutlet(outlet_id: string): Promise<AttendanceRecord[]> {
    return this.find({
      where: { outlet_id, deleted_at: IsNull() },
      order: { created_at: 'DESC' },
    });
  }

  async findTodayRecord(user_id: string, outlet_id: string): Promise<AttendanceRecord | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.findOne({
      where: { user_id, outlet_id, deleted_at: IsNull() },
    });
  }
}
