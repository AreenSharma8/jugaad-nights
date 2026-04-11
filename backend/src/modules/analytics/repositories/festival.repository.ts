import { Injectable } from '@nestjs/common';
import { DataSource, Repository, IsNull } from 'typeorm';
import { Festival } from '../entities';

@Injectable()
export class FestivalRepository extends Repository<Festival> {
  constructor(private dataSource: DataSource) {
    super(Festival, dataSource.createEntityManager());
  }

  async findByOutlet(outlet_id: string): Promise<Festival[]> {
    return this.find({
      where: {
        outlet_id,
        deleted_at: IsNull(),
      },
      order: {
        start_date: 'DESC',
      },
    });
  }

  async findById(id: string): Promise<Festival | null> {
    return this.findOne({
      where: {
        id,
        deleted_at: IsNull(),
      },
    });
  }

  async findActiveFestivals(outlet_id: string): Promise<Festival[]> {
    return this.find({
      where: {
        outlet_id,
        status: 'active',
        deleted_at: IsNull(),
      },
      order: {
        start_date: 'ASC',
      },
    });
  }

  async getFestivalMetrics(outlet_id: string, festivalId: string): Promise<{
    expected_sales: number;
    actual_sales: number;
    budget: number;
    actual_expenses: number;
    roi: number;
    status: string;
  } | null> {
    const festival = await this.findOne({
      where: {
        id: festivalId,
        outlet_id,
        deleted_at: IsNull(),
      },
    });

    if (!festival) {
      return null;
    }

    const roi = festival.actual_sales > 0
      ? ((festival.actual_sales - festival.actual_expenses) / festival.actual_expenses) * 100
      : 0;

    return {
      expected_sales: parseFloat(festival.expected_sales as any),
      actual_sales: parseFloat(festival.actual_sales as any),
      budget: parseFloat(festival.budget as any),
      actual_expenses: parseFloat(festival.actual_expenses as any),
      roi: parseFloat(roi.toFixed(2)),
      status: festival.status,
    };
  }

  async deleteFestival(id: string): Promise<void> {
    await this.update(
      { id },
      { deleted_at: new Date() },
    );
  }
}
