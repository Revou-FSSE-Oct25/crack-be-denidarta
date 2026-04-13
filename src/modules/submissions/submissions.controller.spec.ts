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
    it('returns all submissions when no filter is provided', async () => {
      const submissions = [
        { id: 1, studentId: 1, assignmentId: 1, courseId: 1 },
        { id: 2, studentId: 2, assignmentId: 1, courseId: 1 },
      ];
      mockSubmissionsService.findAll.mockResolvedValue(submissions);

      const result = await controller.findAll();

      expect(mockSubmissionsService.findAll).toHaveBeenCalledWith({
        studentId: undefined,
        assignmentId: undefined,
        courseId: undefined,
      });
      expect(result).toEqual(submissions);
    });

    it('returns submissions filtered by studentId', async () => {
      const submissions = [
        { id: 1, studentId: 3, assignmentId: 1, courseId: 1 },
      ];
      mockSubmissionsService.findAll.mockResolvedValue(submissions);

      const result = await controller.findAll('3');

      expect(mockSubmissionsService.findAll).toHaveBeenCalledWith({
        studentId: 3,
        assignmentId: undefined,
        courseId: undefined,
      });
      expect(result).toEqual(submissions);
    });

    it('returns submissions filtered by assignmentId', async () => {
      const submissions = [
        { id: 1, studentId: 1, assignmentId: 5, courseId: 1 },
      ];
      mockSubmissionsService.findAll.mockResolvedValue(submissions);

      const result = await controller.findAll(undefined, '5');

      expect(mockSubmissionsService.findAll).toHaveBeenCalledWith({
        studentId: undefined,
        assignmentId: 5,
        courseId: undefined,
      });
      expect(result).toEqual(submissions);
    });

    it('returns submissions filtered by courseId', async () => {
      const submissions = [
        { id: 1, studentId: 1, assignmentId: 1, courseId: 2 },
      ];
      mockSubmissionsService.findAll.mockResolvedValue(submissions);

      const result = await controller.findAll(undefined, undefined, '2');

      expect(mockSubmissionsService.findAll).toHaveBeenCalledWith({
        studentId: undefined,
        assignmentId: undefined,
        courseId: 2,
      });
      expect(result).toEqual(submissions);
    });
  });

  describe('findOne', () => {});

  describe('update', () => {});

  describe('remove', () => {});
});
