import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ClassSessionsService } from './class-sessions.service';
import { ClassSessionRepository } from './class-sessions.repository';
import { AttendancesService } from '../attendances/attendances.service';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

const mockClassSessionsRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockAttendancesService = {
  generateForSession: jest.fn(),
};

describe('ClassSessionsService', () => {
  let service: ClassSessionsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassSessionsService,
        {
          provide: ClassSessionRepository,
          useValue: mockClassSessionsRepository,
        },
        { provide: AttendancesService, useValue: mockAttendancesService },
      ],
    }).compile();
    service = module.get<ClassSessionsService>(ClassSessionsService);
  });

  it('should be defined', () => {
    expect(service).toBeInstanceOf(ClassSessionsService);
  });

  it('findOne throws NotFoundException when session is absent', async () => {
    mockClassSessionsRepository.findOne.mockResolvedValueOnce(null);
    await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
  });

  describe('findAll', () => {
    const mockData = [
      {
        id: 'session-1',
        course: {
          id: 'course-1',
          name: 'Course 1',
          instructor: {
            id: 'instructor-1',
            profile: { fullName: 'Instructor One' },
          },
        },
      },
    ];

    it('should return paginated envelope for a student', async () => {
      const mockUser: JwtPayload = {
        sub: 'student-id',
        role: UserRole.student,
        email: 'student@example.com',
      };
      mockClassSessionsRepository.findAll.mockResolvedValueOnce({
        data: mockData,
        total: 1,
      });

      const result = await service.findAll({ page: 1, limit: 10 }, mockUser);

      expect(mockClassSessionsRepository.findAll).toHaveBeenCalledWith(
        { skip: 0, take: 10, page: 1, limit: 10 },
        mockUser.sub,
        undefined,
        undefined,
        undefined,
      );
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.meta.total).toBe(1);
      expect(result.data[0]).toHaveProperty('id', 'session-1');
    });

    it('should return paginated envelope for instructor/admin', async () => {
      const mockUser: JwtPayload = {
        sub: 'instructor-id',
        role: UserRole.instructor,
        email: 'instructor@example.com',
      };
      mockClassSessionsRepository.findAll.mockResolvedValueOnce({
        data: mockData,
        total: 15,
      });

      const result = await service.findAll({ page: 2, limit: 5 }, mockUser);

      expect(mockClassSessionsRepository.findAll).toHaveBeenCalledWith(
        { skip: 5, take: 5, page: 2, limit: 5 },
        undefined,
        undefined,
        undefined,
        undefined,
      );
      expect(result.meta.total).toBe(15);
    });
  });
});
