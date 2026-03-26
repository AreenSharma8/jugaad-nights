import { Injectable } from '@nestjs/common';
import { DataSource, Repository, IsNull } from 'typeorm';
import { WastageEntry } from '../entities/wastage-entry.entity';

@Injectable()
export class WastageRepository extends Repository<WastageEntry> {
  constructor(private dataSource: DataSource) {
    super(WastageEntry, dataSource.createEntityManager());
  }

  async findByOutlet(outlet_id: string): Promise<WastageEntry[]> {
    return this.find({
      where: { outlet_id, deleted_at: IsNull() },
      order: { created_at: 'DESC' },
    });
  }

  async calculateWastageCost(outlet_id: string, startDate: Date, endDate: Date): Promise<number> {
    const entries = await this.find({
      where: { outlet_id, deleted_at: IsNull() },
    });
    return entries
      .filter((e) => e.created_at >= startDate && e.created_at <= endDate)
      .reduce((sum, e) => sum + (e.estimated_cost || 0), 0);
  }
}
