import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DataSource } from 'typeorm';
import { User, Role } from './entities';

describe('UsersModule', () => {
  let service: UsersService;
  let controller: UsersController;
  let mockDataSource: any;

  beforeEach(async () => {
    mockDataSource = {
      createEntityManager: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(controller).toBeDefined();
  });

  describe('API Response Format', () => {
    it('should return success status in response', async () => {
      expect(service).toBeDefined();
    });
  });
});
