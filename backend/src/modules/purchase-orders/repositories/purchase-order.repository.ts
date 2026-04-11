import { Injectable } from '@nestjs/common';
import { DataSource, Repository, IsNull } from 'typeorm';
import { PurchaseOrder } from '../entities/index';

@Injectable()
export class PurchaseOrderRepository extends Repository<PurchaseOrder> {
  constructor(private dataSource: DataSource) {
    super(
      PurchaseOrder,
      dataSource.createEntityManager(),
    );
  }

  async findByOutlet(outlet_id: string) {
    return this.find({
      where: {
        outlet_id,
        deleted_at: IsNull(),
      },
      relations: ['items'],
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findByIdWithItems(id: string) {
    return this.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['items'],
    });
  }
}
