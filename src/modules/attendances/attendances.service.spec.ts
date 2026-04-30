import { Test, TestingModule } from '@nestjs/testing';
import { AttendancesService } from './attendances.service';
import { AttendanceRepository } from './attendances.repository';

const mockAttendanceRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('AttendancesService', () => {
  afterEach(() => jest.clearAllMocks());

  it('should be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendancesService,
        { provide: AttendanceRepository, useValue: mockAttendanceRepository },
      ],
    }).compile();

    const service: unknown = module.get(AttendancesService);
    expect(service).toBeInstanceOf(AttendancesService);
  });
});
