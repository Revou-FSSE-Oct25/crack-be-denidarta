import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';

const mockSubmissionsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('SubmissionsController', () => {
  let controller: SubmissionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubmissionsController],
      providers: [
        { provide: SubmissionsService, useValue: mockSubmissionsService },
      ],
    }).compile();

    controller = module.get<SubmissionsController>(SubmissionsController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {});

  describe('findAll', () => {
    const mockUser = { sub: 'user-1', role: 'admin' };

    it('returns all submissions when no filter is provided', async () => {
      const submissions = [
        { id: 1, studentId: 1, assignmentId: 1, courseId: 1 },
        { id: 2, studentId: 2, assignmentId: 1, courseId: 1 },
      ];
      mockSubmissionsService.findAll.mockResolvedValue(submissions);

      const result = await controller.findAll(mockUser as any);

      expect(mockSubmissionsService.findAll).toHaveBeenCalledWith(
        {
          studentId: undefined,
          assignmentId: undefined,
          courseId: undefined,
        },
        { page: undefined, limit: undefined },
        mockUser,
      );
      expect(result).toEqual(submissions);
    });

    it('returns all submissions from a student across multiple courses', async () => {
      const submissions = [
        { id: 1, studentId: 3, assignmentId: 1, courseId: 1 },
        { id: 2, studentId: 3, assignmentId: 3, courseId: 2 },
        { id: 3, studentId: 3, assignmentId: 5, courseId: 3 },
      ];
      mockSubmissionsService.findAll.mockResolvedValue(submissions);

      const result = await controller.findAll(mockUser as any, '3');

      expect(mockSubmissionsService.findAll).toHaveBeenCalledWith(
        {
          studentId: '3',
          assignmentId: undefined,
          courseId: undefined,
        },
        { page: undefined, limit: undefined },
        mockUser,
      );
      expect(result).toHaveLength(3);
      expect(result).toEqual(submissions);
    });

    it('returns submissions filtered by assignmentId', async () => {
      const submissions = [
        { id: 1, studentId: 1, assignmentId: 5, courseId: 1 },
      ];
      mockSubmissionsService.findAll.mockResolvedValue(submissions);

      const result = await controller.findAll(mockUser as any, undefined, '5');

      expect(mockSubmissionsService.findAll).toHaveBeenCalledWith(
        {
          studentId: undefined,
          assignmentId: '5',
          courseId: undefined,
        },
        { page: undefined, limit: undefined },
        mockUser,
      );
      expect(result).toEqual(submissions);
    });

    it('returns submissions filtered by courseId', async () => {
      const submissions = [
        { id: 1, studentId: 1, assignmentId: 1, courseId: 2 },
      ];
      mockSubmissionsService.findAll.mockResolvedValue(submissions);

      const result = await controller.findAll(
        mockUser as any,
        undefined,
        undefined,
        '2',
      );

      expect(mockSubmissionsService.findAll).toHaveBeenCalledWith(
        {
          studentId: undefined,
          assignmentId: undefined,
          courseId: '2',
        },
        { page: undefined, limit: undefined },
        mockUser,
      );
      expect(result).toEqual(submissions);
    });
  });

  describe('findOne', () => {});

  describe('update', () => {});

  describe('remove', () => {});
});
