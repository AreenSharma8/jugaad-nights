import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ReportsModule } from './reports.module';
import { ReportService } from './services/report.service';
import { ReportRepository } from './repositories/report.repository';
import { ReportController } from './controllers/report.controller';

describe('ReportsModule', () => {
  let module: TestingModule;
  let service: ReportService;
  let controller: ReportController;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ScheduleModule.forRoot()],
      providers: [
        ReportService,
        {
          provide: ReportRepository,
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            findByIdWithOutlet: jest.fn(),
            findByOutlet: jest.fn(),
            findByOutletAndType: jest.fn(),
            findRecentReports: jest.fn(),
            findByStatus: jest.fn(),
            softDelete: jest.fn(),
          },
        },
      ],
      controllers: [ReportController],
    }).compile();

    service = module.get<ReportService>(ReportService);
    controller = module.get<ReportController>(ReportController);
  });

  afterEach(async () => {
    await module.close();
  });

  describe('ReportsModule', () => {
    it('should be defined', () => {
      expect(module).toBeDefined();
    });

    it('should have ReportService', () => {
      expect(service).toBeDefined();
    });

    it('should have ReportController', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('ReportService', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have generateSummaryReportHTML method', () => {
      expect(service.generateSummaryReportHTML).toBeDefined();
    });

    it('should have generatePDFReport method', () => {
      expect(service.generatePDFReport).toBeDefined();
    });

    it('should have generateExcelReport method', () => {
      expect(service.generateExcelReport).toBeDefined();
    });

    it('should have getReportsByOutlet method', () => {
      expect(service.getReportsByOutlet).toBeDefined();
    });

    it('should have downloadReport method', () => {
      expect(service.downloadReport).toBeDefined();
    });
  });

  describe('ReportController', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have generateSummaryReport method', () => {
      expect(controller.generateSummaryReport).toBeDefined();
    });

    it('should have generateSalesReport method', () => {
      expect(controller.generateSalesReport).toBeDefined();
    });

    it('should have generateInventoryReport method', () => {
      expect(controller.generateInventoryReport).toBeDefined();
    });

    it('should have getReports method', () => {
      expect(controller.getReports).toBeDefined();
    });

    it('should have downloadReport method', () => {
      expect(controller.downloadReport).toBeDefined();
    });
  });
});
