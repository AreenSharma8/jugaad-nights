import { Injectable } from '@nestjs/common';
import { DataSource, Repository, IsNull } from 'typeorm';
import { InventoryItem } from '../entities/inventory-item.entity';

@Injectable()
export class InventoryRepository extends Repository<InventoryItem> {
  constructor(private dataSource: DataSource) {
    super(InventoryItem, dataSource.createEntityManager());
  }

  async findByOutlet(outlet_id: string): Promise<InventoryItem[]> {
    return this.find({
      where: { outlet_id, deleted_at: IsNull() },
      relations: ['transactions'],
    });
  }

  async findLowStockItems(outlet_id: string): Promise<InventoryItem[]> {
    const items = await this.find({
      where: { outlet_id, deleted_at: IsNull() },
    });
    return items.filter((item) => item.current_quantity <= item.min_quantity);
  }
}
