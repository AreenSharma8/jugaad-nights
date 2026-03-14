import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { Report } from './entities/report.entity';
import { ReportService } from './services/report.service';
import { ReportController } from './controllers/report.controller';
import { ReportRepository } from './repositories/report.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Report]), ScheduleModule.forRoot()],
  providers: [ReportService, ReportRepository],
  controllers: [ReportController],
  exports: [ReportService],
})
export class ReportsModule {}
