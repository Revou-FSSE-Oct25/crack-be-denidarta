import { SubmissionsService } from './submissions.service';
import { SubmissionsRepository } from './submissions.repository';
import { SubmissionStatus } from '@prisma/client';

const mockCreate = jest.fn();
const mockFindAll = jest.fn();
const mockFindOne = jest.fn();
const mockUpdate = jest.fn();
const mockRemove = jest.fn();

const mockSubmissionsRepository = {
  create: mockCreate,
  findAll: mockFindAll,
  findOne: mockFindOne,
  update: mockUpdate,
  remove: mockRemove,
} as unknown as SubmissionsRepository;

const mockSubmission = {
  id: 1,
  assignmentId: 1,
  userId: 1,
  submissionText: 'My answer',
  fileUrl: null,
  submittedAt: new Date(),
  grade: null,
  passed: null,
  feedback: null,
  status: SubmissionStatus.SUBMITTED,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe('SubmissionsService', () => {
  let service: SubmissionsService;

  beforeEach(() => {
    service = new SubmissionsService(mockSubmissionsRepository);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('creates and returns a new submission', async () => {
      const dto = { assignmentId: 1, userId: 1, submissionText: 'My answer' };
      mockCreate.mockResolvedValue(mockSubmission);

      const result = await service.create(dto);

      expect(mockCreate).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockSubmission);
    });
  });

  describe('findAll', () => {
    it('returns all submissions when no filter is provided', async () => {
      const submissions = [
        mockSubmission,
        { ...mockSubmission, id: 2, userId: 2 },
      ];
      mockFindAll.mockResolvedValue(submissions);

      const result = await service.findAll();

      expect(mockFindAll).toHaveBeenCalledWith({});
      expect(result).toEqual(submissions);
    });

    it('returns submissions filtered by studentId', async () => {
      const submissions = [mockSubmission];
      mockFindAll.mockResolvedValue(submissions);

      const result = await service.findAll({ studentId: 1 });

      expect(mockFindAll).toHaveBeenCalledWith({
        studentId: 1,
      });
      expect(result).toEqual(submissions);
    });

    it('returns submissions filtered by assignmentId', async () => {
      const submissions = [mockSubmission];
      mockFindAll.mockResolvedValue(submissions);

      const result = await service.findAll({ assignmentId: 1 });

      expect(mockFindAll).toHaveBeenCalledWith({
        assignmentId: 1,
      });
      expect(result).toEqual(submissions);
    });

    it('returns submissions filtered by courseId', async () => {
      const submissions = [mockSubmission];
      mockFindAll.mockResolvedValue(submissions);

      const result = await service.findAll({ courseId: 1 });

      expect(mockFindAll).toHaveBeenCalledWith({
        courseId: 1,
      });
      expect(result).toEqual(submissions);
    });
  });

  describe('findOne', () => {
    it('returns a single submission by id', async () => {
      mockFindOne.mockResolvedValue(mockSubmission);

      const result = await service.findOne(1);

      expect(mockFindOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockSubmission);
    });
  });

  describe('update', () => {
    it('updates and returns the updated submission', async () => {
      const dto = { status: SubmissionStatus.GRADED, grade: 90 };
      const updated = { ...mockSubmission, ...dto };
      mockUpdate.mockResolvedValue(updated);

      const result = await service.update(1, dto);

      expect(mockUpdate).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('soft deletes a submission and persists it in the database', async () => {
      const deletedAt = new Date('2026-04-15T10:00:00.000Z');
      const softDeleted = { ...mockSubmission, deletedAt };
      mockRemove.mockResolvedValue(softDeleted);

      const result = await service.remove(1);

      expect(mockRemove).toHaveBeenCalledWith(1);
      expect(result).toMatchObject({
        id: mockSubmission.id,
        assignmentId: mockSubmission.assignmentId,
        userId: mockSubmission.userId,
        status: mockSubmission.status,
        deletedAt,
      });
    });
  });
});
