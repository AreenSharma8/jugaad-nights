import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import { RedisModule } from './services/redis.module';
import { AppController } from './app.controller';
import { LoggingMiddleware } from './common/middleware/logging.middleware';
import { UsersModule } from './modules/users/users.module';
import { OutletsModule } from './modules/outlets/outlets.module';
import { SalesModule } from './modules/sales/sales.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { WastageModule } from './modules/wastage/wastage.module';
import { PartyOrdersModule } from './modules/party-orders/party-orders.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { CashFlowModule } from './modules/cashflow/cashflow.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(getDatabaseConfig()),
    RedisModule,
    AuthModule,
    UsersModule,
    OutletsModule,
    SalesModule,
    InventoryModule,
    WastageModule,
    PartyOrdersModule,
    AttendanceModule,
    CashFlowModule,
    IntegrationsModule,
    ReportsModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [],
  exports: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
