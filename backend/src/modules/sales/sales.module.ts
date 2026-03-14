import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '../../services/redis.module';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { Order, OrderItem, Payment } from './entities';
import { SalesRepository } from './repositories/sales.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Payment]), RedisModule],
  controllers: [SalesController],
  providers: [SalesService, SalesRepository],
  exports: [SalesService, SalesRepository],
})
export class SalesModule {}
