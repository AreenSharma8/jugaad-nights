import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { DataSource } from 'typeorm';

describe('InventoryModule', () => {
  let service: InventoryService;

  beforeEach(async () => {
    const mockDataSource = { createEntityManager: jest.fn(), getRepository: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [InventoryService, { provide: DataSource, useValue: mockDataSource }],
    }).compile();
    service = module.get<InventoryService>(InventoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
