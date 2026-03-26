import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceService } from './attendance.service';
import { DataSource } from 'typeorm';

describe('AttendanceModule', () => {
  let service: AttendanceService;

  beforeEach(async () => {
    const mockDataSource = { createEntityManager: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [AttendanceService, { provide: DataSource, useValue: mockDataSource }],
    }).compile();
    service = module.get<AttendanceService>(AttendanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
