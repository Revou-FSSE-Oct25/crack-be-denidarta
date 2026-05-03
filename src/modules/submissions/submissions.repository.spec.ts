import { SubmissionsRepository } from './submissions.repository';
import { PrismaService } from '../../database/prisma.service';
import { SubmissionStatus } from '@prisma/client';

const mockAssignmentSubmission = {
  create: jest.fn(),
  findMany: jest.fn(),
  findUnique: jest.fn(),
  update: jest.fn(),
};

const mockPrisma = {
  assignmentSubmission: mockAssignmentSubmission,
} as unknown as PrismaService;

const mockSubmission = {
  id: 'uuid-1',
  assignmentId: 'uuid-assignment-1',
  userId: 'uuid-user-1',
  submissionText: 'My answer',
  fileUrl: null,
  submittedAt: new Date('2026-04-15T10:00:00.000Z'),
  grade: null,
  passed: null,
  feedback: null,
  status: SubmissionStatus.submitted,
  createdAt: new Date('2026-04-15T10:00:00.000Z'),
  updatedAt: new Date('2026-04-15T10:00:00.000Z'),
  deletedAt: null,
};

describe('SubmissionsRepository', () => {
  let repository: SubmissionsRepository;

  beforeEach(() => {
    repository = new SubmissionsRepository(mockPrisma);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('creates and returns a new submission', async () => {
      const dto = {
        assignmentId: 'uuid-assignment-1',
        userId: 'uuid-user-1',
        submissionText: 'My answer',
      };
      mockAssignmentSubmission.create.mockResolvedValue(mockSubmission);

      const result = await repository.create(dto);

      expect(mockAssignmentSubmission.create).toHaveBeenCalledWith({
        data: dto,
      });
      expect(result).toEqual(mockSubmission);
    });
  });

  describe('findAll', () => {
    it('returns all submissions excluding soft deleted records', async () => {
      const submissions = [mockSubmission, { ...mockSubmission, id: 'uuid-2' }];
      mockAssignmentSubmission.findMany.mockResolvedValue(submissions);

      const result = await repository.findAll();

      expect(mockAssignmentSubmission.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
      });
      expect(result).toEqual(submissions);
    });

    it('returns submissions filtered by studentId', async () => {
      mockAssignmentSubmission.findMany.mockResolvedValue([mockSubmission]);

      const result = await repository.findAll({ studentId: 'uuid-user-1' });

      expect(mockAssignmentSubmission.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null, userId: 'uuid-user-1' },
      });
      expect(result).toEqual([mockSubmission]);
    });

    it('returns submissions filtered by assignmentId', async () => {
      mockAssignmentSubmission.findMany.mockResolvedValue([mockSubmission]);

      const result = await repository.findAll({
        assignmentId: 'uuid-assignment-1',
      });

      expect(mockAssignmentSubmission.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null, assignmentId: 'uuid-assignment-1' },
      });
      expect(result).toEqual([mockSubmission]);
    });
  });

  describe('findOne', () => {
    it('returns a submission by id', async () => {
      mockAssignmentSubmission.findUnique.mockResolvedValue(mockSubmission);

      const result = await repository.findOne('uuid-1');

      expect(mockAssignmentSubmission.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
      });
      expect(result).toEqual(mockSubmission);
    });
  });

  describe('update', () => {
    it('updates and returns the updated submission', async () => {
      const dto = { status: SubmissionStatus.graded, grade: 90 };
      const updated = { ...mockSubmission, ...dto };
      mockAssignmentSubmission.update.mockResolvedValue(updated);

      const result = await repository.update('uuid-1', dto);

      expect(mockAssignmentSubmission.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: dto,
      });
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('soft deletes a submission by setting deletedAt', async () => {
      const deletedAt = new Date('2026-04-15T10:00:00.000Z');
      const softDeleted = { ...mockSubmission, deletedAt };
      mockAssignmentSubmission.update.mockResolvedValue(softDeleted);

      const result = await repository.remove('uuid-1');

      expect(mockAssignmentSubmission.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { deletedAt: expect.any(Date) as Date },
      });
      expect(result).toMatchObject({ id: 'uuid-1', deletedAt });
    });
  });
});
