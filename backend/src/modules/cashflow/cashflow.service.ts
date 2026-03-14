import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CashFlowEntry } from './entities';
import { CreateCashFlowEntryDto } from './dto/cashflow.dto';
import { CashFlowRepository } from './repositories/cashflow.repository';

@Injectable()
export class CashFlowService {
  private readonly cashFlowRepository: CashFlowRepository;

  constructor(private dataSource: DataSource) {
    this.cashFlowRepository = new CashFlowRepository(dataSource);
  }

  async addEntry(createDto: CreateCashFlowEntryDto, created_by: string): Promise<CashFlowEntry> {
    const entry = this.cashFlowRepository.create({
      ...createDto,
      created_by,
      updated_by: created_by,
    });
    return this.cashFlowRepository.save(entry);
  }

  async getByOutlet(outlet_id: string): Promise<CashFlowEntry[]> {
    return this.cashFlowRepository.findByOutlet(outlet_id);
  }

  async getCashFlowSummary(outlet_id: string): Promise<any> {
    const entries = await this.cashFlowRepository.findByOutlet(outlet_id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.cashFlowRepository.calculateCashFlow(outlet_id, today, tomorrow);
  }
}
