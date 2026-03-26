import { Test, TestingModule } from '@nestjs/testing';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { DataSource } from 'typeorm';

describe('SalesModule', () => {
  let service: SalesService;
  let controller: SalesController;
  let mockDataSource: any;

  beforeEach(async () => {
    mockDataSource = {
      createEntityManager: jest.fn(),
      getRepository: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesController],
      providers: [
        SalesService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: 'RedisService',
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
    controller = module.get<SalesController>(SalesController);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(controller).toBeDefined();
  });
});
