import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashFlowController } from './cashflow.controller';
import { CashFlowService } from './cashflow.service';
import { CashFlowEntry } from './entities';
import { CashFlowRepository } from './repositories/cashflow.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CashFlowEntry])],
  controllers: [CashFlowController],
  providers: [CashFlowService, CashFlowRepository],
  exports: [CashFlowService],
})
export class CashFlowModule {}
