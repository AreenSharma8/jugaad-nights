import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '../../services/redis.module';
import { AnalyticsService } from './services/analytics.service';
import { AnalyticsController } from './controllers/analytics.controller';
import { Festival } from './entities';
import { FestivalRepository } from './repositories';

@Module({
  imports: [
    TypeOrmModule.forFeature([Festival]),
    RedisModule,
  ],
  providers: [AnalyticsService, FestivalRepository],
  controllers: [AnalyticsController],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
