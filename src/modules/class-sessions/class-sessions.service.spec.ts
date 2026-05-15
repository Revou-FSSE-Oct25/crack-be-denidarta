import { Test, TestingModule } from '@nestjs/testing';
import { ClassSessionsService } from './class-sessions.service';
import { ClassSessionRepository } from './class-sessions.repository';
import { AttendancesService } from '../attendances/attendances.service';

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
  afterEach(() => jest.clearAllMocks());

  it('should be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassSessionsService,
        {
          provide: ClassSessionRepository,
          useValue: mockClassSessionsRepository,
        },
        {
          provide: AttendancesService,
          useValue: mockAttendancesService,
        },
      ],
    }).compile();

    const service = module.get<ClassSessionsService>(ClassSessionsService);
    expect(service).toBeInstanceOf(ClassSessionsService);
  });

  describe('findAll', () => {
    let service: ClassSessionsService;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ClassSessionsService,
          {
            provide: ClassSessionRepository,
            useValue: mockClassSessionsRepository,
          },
          {
            provide: AttendancesService,
            useValue: mockAttendancesService,
          },
        ],
      }).compile();

      service = module.get<ClassSessionsService>(ClassSessionsService);
    });

    it('should return paginated class sessions for a student', async () => {
      const mockUser = { sub: 'student-id', role: 'student' };
      const mockPaginationParams = { skip: 0, take: 10, page: 1, limit: 10 };
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
      const mockTotal = 1;

      mockClassSessionsRepository.findAll.mockResolvedValueOnce({
        data: mockData,
        total: mockTotal,
      });

      const [items, total] = await service.findAll(
        mockPaginationParams,
        mockUser as any,
      );

      expect(mockClassSessionsRepository.findAll).toHaveBeenCalledWith(
        mockPaginationParams,
        mockUser.sub,
      );
      expect(total).toBe(mockTotal);
      expect(items).toHaveLength(1);
      expect(items[0]).toHaveProperty('id', 'session-1');
      expect(items[0]).toHaveProperty('instructor');
      expect(items[0].instructor).toEqual({
        userId: 'instructor-1',
        profile: { fullName: 'Instructor One' },
      });
      expect(items[0]).toHaveProperty('course');
      expect(items[0].course).toEqual({
        id: 'course-1',
        name: 'Course 1',
      });
    });

    it('should return paginated class sessions for an instructor/admin', async () => {
      const mockUser = { sub: 'instructor-id', role: 'instructor' };
      const mockPaginationParams = { skip: 5, take: 5, page: 2, limit: 5 };
      const mockData = [
        {
          id: 'session-3',
          course: {
            id: 'course-2',
            name: 'Course 2',
            instructor: {
              id: 'instructor-2',
              profile: { fullName: 'Instructor Two' },
            },
          },
        },
      ];
      const mockTotal = 15;

      mockClassSessionsRepository.findAll.mockResolvedValueOnce({
        data: mockData,
        total: mockTotal,
      });

      const [items, total] = await service.findAll(
        mockPaginationParams,
        mockUser as any,
      );

      expect(mockClassSessionsRepository.findAll).toHaveBeenCalledWith(
        mockPaginationParams,
        undefined, // userId should be undefined for instructor/admin
      );
      expect(total).toBe(mockTotal);
      expect(items).toHaveLength(1);
      expect(items[0]).toHaveProperty('id', 'session-3');
      expect(items[0].instructor).toEqual({
        userId: 'instructor-2',
        profile: { fullName: 'Instructor Two' },
      });
    });
  });
});
