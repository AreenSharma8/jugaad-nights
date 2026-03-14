import { Injectable } from '@nestjs/common';
import { DataSource, Repository, IsNull } from 'typeorm';
import { Report, ReportType, ReportStatus } from '../entities/report.entity';

@Injectable()
export class ReportRepository extends Repository<Report> {
  constructor(private dataSource: DataSource) {
    super(Report, dataSource.createEntityManager());
  }

  async findByIdWithOutlet(id: string): Promise<Report | null> {
    return this.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['outlet'],
    });
  }

  async findByOutlet(outlet_id: string): Promise<Report[]> {
    return this.find({
      where: { outlet_id, deleted_at: IsNull() },
      relations: ['outlet'],
      order: { created_at: 'DESC' },
    });
  }

  async findByOutletAndType(outlet_id: string, report_type: ReportType): Promise<Report[]> {
    return this.find({
      where: { outlet_id, report_type, deleted_at: IsNull() },
      order: { created_at: 'DESC' },
      take: 10,
    });
  }

  async findRecentReports(outlet_id: string, limit: number = 5): Promise<Report[]> {
    return this.find({
      where: { outlet_id, deleted_at: IsNull(), status: 'completed' },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  async findByStatus(status: ReportStatus): Promise<Report[]> {
    return this.find({
      where: { status, deleted_at: IsNull() },
      order: { created_at: 'ASC' },
    });
  }

  async findScheduledReports(): Promise<Report[]> {
    return this.find({
      where: { status: 'pending', deleted_at: IsNull() },
      order: { created_at: 'ASC' },
    });
  }
}
