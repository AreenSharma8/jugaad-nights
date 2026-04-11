import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PurchaseOrder, PurchaseOrderItem } from './entities';
import { PurchaseOrderRepository } from './repositories/purchase-order.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseOrder, PurchaseOrderItem])],
  controllers: [PurchaseOrdersController],
  providers: [PurchaseOrdersService, PurchaseOrderRepository],
  exports: [PurchaseOrdersService],
})
export class PurchaseOrdersModule {}
