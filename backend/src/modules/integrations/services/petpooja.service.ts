import { Injectable, Logger } from '@nestjs/common';
import { DataSource, Repository, IsNull } from 'typeorm';
import { PetpoojaSync } from '../entities/petpooja-sync.entity';

@Injectable()
export class PetpoojaIntegrationService {
  private readonly logger = new Logger(PetpoojaIntegrationService.name);
  private readonly repository: Repository<PetpoojaSync>;

  constructor(private dataSource: DataSource) {
    this.repository = dataSource.getRepository(PetpoojaSync);
  }

  async triggerSync(
    outlet_id: string,
    sync_type: 'orders' | 'inventory' | 'menu' | 'payments',
    created_by: string,
  ): Promise<PetpoojaSync> {
    const syncLog = this.repository.create({
      outlet_id,
      sync_type,
      status: 'pending',
      records_synced: 0,
      created_by,
    });

    const saved = await this.repository.save(syncLog);
    
    // Simulate sync process based on type
    try {
      let recordsCount = 0;
      switch (sync_type) {
        case 'orders':
          recordsCount = await this.syncOrders(outlet_id);
          break;
        case 'inventory':
          recordsCount = await this.syncInventory(outlet_id);
          break;
        case 'menu':
          recordsCount = await this.syncMenu(outlet_id);
          break;
        case 'payments':
          recordsCount = await this.syncPayments(outlet_id);
          break;
      }

      saved.status = 'success';
      saved.records_synced = recordsCount;
      this.logger.log(`Successfully synced ${recordsCount} ${sync_type} records`);
    } catch (error) {
      saved.status = 'failed';
      saved.error_message = error.message;
      this.logger.error(`Sync failed for ${sync_type}:`, error);
    }

    return this.repository.save(saved);
  }

  private async syncOrders(outlet_id: string): Promise<number> {
    // Mock implementation - would fetch from PetPooja API
    return Math.floor(Math.random() * 50) + 1;
  }

  private async syncInventory(outlet_id: string): Promise<number> {
    return Math.floor(Math.random() * 30) + 1;
  }

  private async syncMenu(outlet_id: string): Promise<number> {
    return Math.floor(Math.random() * 10) + 1;
  }

  private async syncPayments(outlet_id: string): Promise<number> {
    return Math.floor(Math.random() * 25) + 1;
  }

  async getSyncHistory(outlet_id: string, limit: number = 10): Promise<PetpoojaSync[]> {
    return this.repository.find({
      where: { outlet_id, deleted_at: IsNull() },
      order: { synced_at: 'DESC' },
      take: limit,
    });
  }
}
