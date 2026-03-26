import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutletsController } from './outlets.controller';
import { OutletsService } from './outlets.service';
import { Outlet, OutletConfig } from './entities';
import { OutletRepository } from './repositories/outlet.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Outlet, OutletConfig])],
  controllers: [OutletsController],
  providers: [OutletsService, OutletRepository],
  exports: [OutletsService, OutletRepository],
})
export class OutletsModule {}
