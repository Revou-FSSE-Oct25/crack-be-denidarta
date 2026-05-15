import { SubmissionsRepository } from './submissions.repository';
import { PrismaService } from '../../database/prisma.service';
import { SubmissionStatus } from '@prisma/client';

const mockAssignmentSubmission = {
  create: jest.fn(),
  findMany: jest.fn(),
  findUnique: jest.fn(),
  update: jest.fn(),
  count: jest.fn(),
};

const mockAssignment = {
  update: jest.fn(),
};

const mockPrisma = {
  assignmentSubmission: mockAssignmentSubmission,
  assignment: mockAssignment,
  $transaction: jest.fn(
    (cbOrArray: unknown[] | ((prisma: Record<string, unknown>) => unknown)) => {
      if (Array.isArray(cbOrArray)) return Promise.all(cbOrArray);
      return cbOrArray({
        assignmentSubmission: mockAssignmentSubmission,
        assignment: mockAssignment,
      });
    },
  ),
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
    it('creates the submission and increments assignment.submitted atomically', async () => {
      const dto = {
        assignmentId: 'uuid-assignment-1',
        studentId: 'uuid-student-1',
        submissionText: 'My answer',
      };
      mockAssignmentSubmission.create.mockResolvedValue(mockSubmission);
      mockAssignment.update.mockResolvedValue(undefined);

      const result = await repository.create(dto);

      expect(mockAssignmentSubmission.create).toHaveBeenCalledWith({
        data: dto,
        include: expect.any(Object) as object,
      });
      expect(mockAssignment.update).toHaveBeenCalledWith({
        where: { id: dto.assignmentId },
        data: { submitted: { increment: 1 } },
      });
      expect(result).toEqual(mockSubmission);
    });
  });

  describe('findAll', () => {
    const pagination = { skip: 0, take: 10, page: 1, limit: 10 };

    it('returns all submissions excluding soft deleted records', async () => {
      const submissions = [mockSubmission, { ...mockSubmission, id: 'uuid-2' }];
      mockAssignmentSubmission.findMany.mockResolvedValue(submissions);

      await repository.findAll({}, pagination);

      expect(mockAssignmentSubmission.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { deletedAt: null } }),
      );
    });

    it('returns submissions filtered by studentId', async () => {
      mockAssignmentSubmission.findMany.mockResolvedValue([mockSubmission]);

      await repository.findAll({ studentId: 'uuid-user-1' }, pagination);

      expect(mockAssignmentSubmission.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deletedAt: null, studentId: 'uuid-user-1' },
        }),
      );
    });

    it('returns submissions filtered by assignmentId', async () => {
      mockAssignmentSubmission.findMany.mockResolvedValue([mockSubmission]);

      await repository.findAll(
        { assignmentId: 'uuid-assignment-1' },
        pagination,
      );

      expect(mockAssignmentSubmission.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deletedAt: null, assignmentId: 'uuid-assignment-1' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('returns a submission by id', async () => {
      mockAssignmentSubmission.findUnique.mockResolvedValue(mockSubmission);

      const result = await repository.findOne('uuid-1');

      expect(mockAssignmentSubmission.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        include: expect.any(Object) as object,
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
        include: expect.any(Object) as object,
      });
      expect(result).toEqual(updated);
    });
  });

  describe('softDelete', () => {
    it('soft deletes a submission by setting deletedAt', async () => {
      const deletedAt = new Date('2026-04-15T10:00:00.000Z');
      const softDeleted = { ...mockSubmission, deletedAt };
      mockAssignmentSubmission.update.mockResolvedValue(softDeleted);

      const result = await repository.softDelete('uuid-1');

      expect(mockAssignmentSubmission.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { deletedAt: expect.any(Date) as Date },
      });
      expect(result).toMatchObject({ id: 'uuid-1', deletedAt });
    });
  });
});
