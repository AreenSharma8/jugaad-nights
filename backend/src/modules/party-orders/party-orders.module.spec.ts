import { Test, TestingModule } from '@nestjs/testing';
import { PartyOrdersService } from './party-orders.service';
import { DataSource } from 'typeorm';

describe('PartyOrdersModule', () => {
  let service: PartyOrdersService;

  beforeEach(async () => {
    const mockDataSource = { createEntityManager: jest.fn(), getRepository: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [PartyOrdersService, { provide: DataSource, useValue: mockDataSource }],
    }).compile();
    service = module.get<PartyOrdersService>(PartyOrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
