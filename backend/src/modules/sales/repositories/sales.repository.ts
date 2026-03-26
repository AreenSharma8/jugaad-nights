import { Injectable } from '@nestjs/common';
import { DataSource, Repository, IsNull, Between } from 'typeorm';
import { Order } from '../entities/order.entity';

@Injectable()
export class SalesRepository extends Repository<Order> {
  constructor(private dataSource: DataSource) {
    super(Order, dataSource.createEntityManager());
  }

  async findByIdWithRelations(id: string): Promise<Order | null> {
    return this.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['items', 'payments'],
    });
  }

  async findByOutlet(outlet_id: string): Promise<Order[]> {
    return this.find({
      where: { outlet_id, deleted_at: IsNull() },
      relations: ['items', 'payments'],
      order: { created_at: 'DESC' },
    });
  }

  async findByOutletAndDate(outlet_id: string, date: Date): Promise<Order[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.find({
      where: {
        outlet_id,
        deleted_at: IsNull(),
        created_at: Between(startOfDay, endOfDay),
      },
      relations: ['items', 'payments'],
    });
  }

  async calculateDailyRevenue(outlet_id: string, date: Date): Promise<number> {
    const orders = await this.findByOutletAndDate(outlet_id, date);
    return orders.reduce((sum, order) => sum + parseFloat(order.total_amount as any), 0);
  }
}
