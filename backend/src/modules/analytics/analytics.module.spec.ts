import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsModule } from './analytics.module';
import { AnalyticsService } from './services/analytics.service';
import { AnalyticsController } from './controllers/analytics.controller';
import { RedisService } from '../../services/redis.service';

describe('AnalyticsModule', () => {
  let module: TestingModule;
  let service: AnalyticsService;
  let controller: AnalyticsController;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            exists: jest.fn(),
            flushAll: jest.fn(),
          },
        },
      ],
      controllers: [AnalyticsController],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    controller = module.get<AnalyticsController>(AnalyticsController);
  });

  afterEach(async () => {
    await module.close();
  });

  describe('AnalyticsModule', () => {
    it('should be defined', () => {
      expect(module).toBeDefined();
    });

    it('should have AnalyticsService', () => {
      expect(service).toBeDefined();
    });

    it('should have AnalyticsController', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('AnalyticsService', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have getDashboardMetrics method', () => {
      expect(service.getDashboardMetrics).toBeDefined();
    });

    it('should have getOutletComparison method', () => {
      expect(service.getOutletComparison).toBeDefined();
    });

    it('should have getSalesTrends method', () => {
      expect(service.getSalesTrends).toBeDefined();
    });

    it('should have getRevenueByPaymentMethod method', () => {
      expect(service.getRevenueByPaymentMethod).toBeDefined();
    });

    it('should have getTopSellingItems method', () => {
      expect(service.getTopSellingItems).toBeDefined();
    });

    it('should have getInventoryHealthScore method', () => {
      expect(service.getInventoryHealthScore).toBeDefined();
    });
  });

  describe('AnalyticsController', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have getDashboardMetrics method', () => {
      expect(controller.getDashboardMetrics).toBeDefined();
    });

    it('should have getOutletComparison method', () => {
      expect(controller.getOutletComparison).toBeDefined();
    });

    it('should have getSalesTrends method', () => {
      expect(controller.getSalesTrends).toBeDefined();
    });

    it('should have getRevenueByPaymentMethod method', () => {
      expect(controller.getRevenueByPaymentMethod).toBeDefined();
    });

    it('should have getTopSellingItems method', () => {
      expect(controller.getTopSellingItems).toBeDefined();
    });

    it('should have getInventoryHealthScore method', () => {
      expect(controller.getInventoryHealthScore).toBeDefined();
    });

    it('should have clearCache method', () => {
      expect(controller.clearCache).toBeDefined();
    });
  });
});
