import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { WastageEntry } from './entities';
import { CreateWastageEntryDto } from './dto/wastage.dto';
import { WastageRepository } from './repositories/wastage.repository';

@Injectable()
export class WastageService {
  private readonly wastageRepository: WastageRepository;

  constructor(private dataSource: DataSource) {
    this.wastageRepository = new WastageRepository(dataSource);
  }

  async logWastage(createDto: CreateWastageEntryDto, created_by: string): Promise<WastageEntry> {
    const entry = this.wastageRepository.create({
      ...createDto,
      created_by,
      updated_by: created_by,
    });
    return this.wastageRepository.save(entry);
  }

  async getByOutlet(outlet_id: string): Promise<WastageEntry[]> {
    return this.wastageRepository.findByOutlet(outlet_id);
  }

  async getWastageAnalytics(outlet_id: string): Promise<any> {
    const entries = await this.wastageRepository.findByOutlet(outlet_id);
    const totalWastage = entries.reduce((sum, e) => sum + (e.estimated_cost || 0), 0);
    const byCategory: Record<string, number> = {};

    entries.forEach((e) => {
      const cat = e.category || 'Other';
      byCategory[cat] = (byCategory[cat] || 0) + (e.estimated_cost || 0);
    });

    return {
      total_wastage_cost: totalWastage,
      total_entries: entries.length,
      by_category: byCategory,
    };
  }
}
