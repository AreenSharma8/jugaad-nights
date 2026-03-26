import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WastageController } from './wastage.controller';
import { WastageService } from './wastage.service';
import { WastageEntry } from './entities';
import { WastageRepository } from './repositories/wastage.repository';

@Module({
  imports: [TypeOrmModule.forFeature([WastageEntry])],
  controllers: [WastageController],
  providers: [WastageService, WastageRepository],
  exports: [WastageService],
})
export class WastageModule {}
