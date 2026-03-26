import { Test, TestingModule } from '@nestjs/testing';
import { CashFlowService } from './cashflow.service';
import { DataSource } from 'typeorm';

describe('CashFlowModule', () => {
  let service: CashFlowService;

  beforeEach(async () => {
    const mockDataSource = { createEntityManager: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [CashFlowService, { provide: DataSource, useValue: mockDataSource }],
    }).compile();
    service = module.get<CashFlowService>(CashFlowService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
