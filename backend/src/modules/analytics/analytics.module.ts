import { Module } from '@nestjs/common';
import { RedisModule } from '../../services/redis.module';
import { AnalyticsService } from './services/analytics.service';
import { AnalyticsController } from './controllers/analytics.controller';

@Module({
  imports: [RedisModule],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
