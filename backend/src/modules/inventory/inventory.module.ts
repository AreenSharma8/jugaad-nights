import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { InventoryItem, StockTransaction } from './entities';
import { InventoryRepository } from './repositories/inventory.repository';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryItem, StockTransaction])],
  controllers: [InventoryController],
  providers: [InventoryService, InventoryRepository],
  exports: [InventoryService],
})
export class InventoryModule {}
