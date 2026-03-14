import { Test, TestingModule } from '@nestjs/testing';
import { WastageService } from './wastage.service';
import { DataSource } from 'typeorm';

describe('WastageModule', () => {
  let service: WastageService;

  beforeEach(async () => {
    const mockDataSource = { createEntityManager: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [WastageService, { provide: DataSource, useValue: mockDataSource }],
    }).compile();
    service = module.get<WastageService>(WastageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
