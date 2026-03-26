import { Injectable } from '@nestjs/common';
import { DataSource, Repository, IsNull } from 'typeorm';
import { CashFlowEntry } from '../entities/cash-flow-entry.entity';

@Injectable()
export class CashFlowRepository extends Repository<CashFlowEntry> {
  constructor(private dataSource: DataSource) {
    super(CashFlowEntry, dataSource.createEntityManager());
  }

  async findByOutlet(outlet_id: string): Promise<CashFlowEntry[]> {
    return this.find({
      where: { outlet_id, deleted_at: IsNull() },
      order: { created_at: 'DESC' },
    });
  }

  async calculateCashFlow(outlet_id: string, startDate: Date, endDate: Date): Promise<any> {
    const entries = await this.find({
      where: { outlet_id, deleted_at: IsNull() },
    });

    let inflow = 0;
    let outflow = 0;

    entries
      .filter((e) => e.created_at >= startDate && e.created_at <= endDate)
      .forEach((e) => {
        if (e.entry_type === 'in') {
          inflow += parseFloat(e.amount as any);
        } else {
          outflow += parseFloat(e.amount as any);
        }
      });

    return { inflow, outflow, net: inflow - outflow };
  }
}
