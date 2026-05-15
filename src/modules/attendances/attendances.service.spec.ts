import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AttendancesService } from './attendances.service';
import { AttendanceRepository } from './attendances.repository';

const mockAttendanceRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findAllPaginated: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  generateForSession: jest.fn(),
  studentCheckIn: jest.fn(),
  verifyAttendance: jest.fn(),
  findBySession: jest.fn(),
};

describe('AttendancesService', () => {
  let service: AttendancesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendancesService,
        { provide: AttendanceRepository, useValue: mockAttendanceRepository },
      ],
    }).compile();
    service = module.get(AttendancesService);
  });

  it('should be defined', () => {
    expect(service).toBeInstanceOf(AttendancesService);
  });

  it('findOne throws NotFoundException when absent', async () => {
    mockAttendanceRepository.findOne.mockResolvedValue(null);
    await expect(service.findOne('x')).rejects.toThrow(NotFoundException);
  });

  it('findAll returns paginated envelope', async () => {
    mockAttendanceRepository.findAllPaginated.mockResolvedValue([
      [
        {
          id: '1',
          userId: 'u1',
          classSessionId: 's1',
          status: 'unverified',
          isVerified: false,
          verifiedAt: null,
          verifiedBy: null,
          createdAt: new Date(),
          user: null,
        },
      ],
      1,
    ]);
    const mockUser = { sub: 'u1', role: 'admin' };
    const result = await service.findAll(mockUser as any, {
      page: 1,
      limit: 10,
    });
    expect(result).toHaveProperty('data');
    expect(result.meta.total).toBe(1);
  });
});
