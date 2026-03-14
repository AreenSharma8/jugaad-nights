import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartyOrdersController } from './party-orders.controller';
import { PartyOrdersService } from './party-orders.service';
import { PartyOrder, PartyOrderItem } from './entities';
import { PartyOrderRepository } from './repositories/party-order.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PartyOrder, PartyOrderItem])],
  controllers: [PartyOrdersController],
  providers: [PartyOrdersService, PartyOrderRepository],
  exports: [PartyOrdersService],
})
export class PartyOrdersModule {}
