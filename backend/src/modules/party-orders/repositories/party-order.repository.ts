import { Injectable } from '@nestjs/common';
import { DataSource, Repository, IsNull } from 'typeorm';
import { PartyOrder } from '../entities/party-order.entity';

@Injectable()
export class PartyOrderRepository extends Repository<PartyOrder> {
  constructor(private dataSource: DataSource) {
    super(PartyOrder, dataSource.createEntityManager());
  }

  async findByOutlet(outlet_id: string): Promise<PartyOrder[]> {
    return this.find({
      where: { outlet_id, deleted_at: IsNull() },
      relations: ['items'],
      order: { event_date: 'DESC' },
    });
  }

  async findById(id: string): Promise<PartyOrder | null> {
    return this.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['items'],
    });
  }
}
