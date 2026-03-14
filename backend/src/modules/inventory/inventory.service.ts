import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InventoryItem, StockTransaction } from './entities';
import { CreateInventoryItemDto, UpdateInventoryItemDto, StockTransactionDto } from './dto/inventory.dto';
import { InventoryRepository } from './repositories/inventory.repository';

@Injectable()
export class InventoryService {
  private readonly inventoryRepository: InventoryRepository;

  constructor(private dataSource: DataSource) {
    this.inventoryRepository = new InventoryRepository(dataSource);
  }

  async createItem(createDto: CreateInventoryItemDto, created_by: string): Promise<InventoryItem> {
    const item = this.inventoryRepository.create({
      ...createDto,
      created_by,
      updated_by: created_by,
    });
    return this.inventoryRepository.save(item);
  }

  async getByOutlet(outlet_id: string): Promise<InventoryItem[]> {
    return this.inventoryRepository.findByOutlet(outlet_id);
  }

  async updateQuantity(
    item_id: string,
    updateDto: UpdateInventoryItemDto,
    updated_by: string,
  ): Promise<InventoryItem> {
    const item = await this.inventoryRepository.findOne({ where: { id: item_id } });
    if (!item) throw new NotFoundException('Item not found');
    
    Object.assign(item, updateDto, { updated_by });
    return this.inventoryRepository.save(item);
  }

  async recordTransaction(transactionDto: StockTransactionDto, created_by: string): Promise<StockTransaction> {
    const item = await this.inventoryRepository.findOne({ where: { id: transactionDto.item_id } });
    if (!item) throw new NotFoundException('Item not found');

    const transactionRepo = this.dataSource.getRepository(StockTransaction);
    const transaction = transactionRepo.create({
      ...transactionDto,
      created_by,
    });
    
    // Update item quantity
    if (transactionDto.transaction_type === 'in') {
      item.current_quantity = (item.current_quantity as any) + (transactionDto.quantity as any);
    } else {
      item.current_quantity = (item.current_quantity as any) - (transactionDto.quantity as any);
    }
    
    item.updated_by = created_by;
    await this.inventoryRepository.save(item);

    return transactionRepo.save(transaction);
  }

  async getLowStockItems(outlet_id: string): Promise<InventoryItem[]> {
    return this.inventoryRepository.findLowStockItems(outlet_id);
  }
}
