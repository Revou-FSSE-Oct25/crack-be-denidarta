import { AssignmentRepository } from './assignments.repository';
import { PrismaService } from '../../database/prisma.service';
import { AssignmentStatus } from '@prisma/client';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

// ── Prisma mock ───────────────────────────────────────────────────────────────

const mockAssignment = {
  create: jest.fn(),
  findMany: jest.fn(),
  findUnique: jest.fn(),
  update: jest.fn(),
  count: jest.fn(),
};

const mockCourse = { findUniqueOrThrow: jest.fn() };
const mockProgramEnrollment = { findMany: jest.fn(), count: jest.fn() };

const mockPrisma = {
  assignment: mockAssignment,
  course: mockCourse,
  programEnrollment: mockProgramEnrollment,
  $transaction: jest.fn((cb: (tx: typeof mockPrisma) => Promise<unknown>) =>
    cb(mockPrisma),
  ),
} as unknown as PrismaService;

// ── Fixtures ──────────────────────────────────────────────────────────────────

const baseDto: CreateAssignmentDto = {
  courseId: 'uuid-course-1',
  title: 'Midterm Assignment',
  dueDate: '2026-06-01T00:00:00.000Z',
};

const mockAssignmentRow = {
  id: 'uuid-assignment-1',
  ...baseDto,
  submitted: 0,
  toSubmit: 5,
  status: AssignmentStatus.draft,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('AssignmentRepository', () => {
  let repository: AssignmentRepository;

  beforeEach(() => {
    repository = new AssignmentRepository(mockPrisma);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(repository).toBeInstanceOf(AssignmentRepository);
  });

  // ── create — toSubmit populated from enrollment count ───────────────────────

  describe('create', () => {
    it('sets toSubmit to the number of enrolled students and creates submissions', async () => {
      mockCourse.findUniqueOrThrow.mockResolvedValue({
        programId: 'uuid-program-1',
      });
      mockProgramEnrollment.findMany.mockResolvedValue([
        { userId: 'user-1' },
        { userId: 'user-2' },
      ]);
      mockAssignment.create.mockResolvedValue(mockAssignmentRow);

      await repository.create(baseDto);

      expect(mockProgramEnrollment.findMany).toHaveBeenCalledWith({
        where: { programId: 'uuid-program-1', status: 'enrolled' },
        select: { userId: true },
      });
      expect(mockAssignment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            toSubmit: 2,
            submissions: {
              create: [{ studentId: 'user-1' }, { studentId: 'user-2' }],
            },
          }) as object,
        }),
      );
    });

    it('sets toSubmit to 0 when the course has no associated program', async () => {
      mockCourse.findUniqueOrThrow.mockResolvedValue({ programId: null });
      mockAssignment.create.mockResolvedValue({
        ...mockAssignmentRow,
        toSubmit: 0,
      });

      await repository.create(baseDto);

      expect(mockProgramEnrollment.findMany).not.toHaveBeenCalled();
      expect(mockAssignment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            toSubmit: 0,
            submissions: { create: [] },
          }) as object,
        }),
      );
    });

    it('returns the created assignment with submitted initialised to 0', async () => {
      mockCourse.findUniqueOrThrow.mockResolvedValue({
        programId: 'uuid-program-1',
      });
      mockProgramEnrollment.findMany.mockResolvedValue([
        { userId: 'u1' },
        { userId: 'u2' },
        { userId: 'u3' },
      ]);
      mockAssignment.create.mockResolvedValue({
        ...mockAssignmentRow,
        toSubmit: 3,
      });

      const result = await repository.create(baseDto);

      expect(result.toSubmit).toBe(3);
      expect(result.submitted).toBe(0);
    });
  });

  // ── findOne ──────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('returns the assignment by id', async () => {
      mockAssignment.findUnique.mockResolvedValue(mockAssignmentRow);

      const result = await repository.findOne('uuid-assignment-1');

      expect(mockAssignment.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-assignment-1' },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        include: expect.objectContaining({
          course: expect.any(Object) as object,
          submissions: expect.any(Object) as object,
        }),
      });
      expect(result).toEqual(mockAssignmentRow);
    });
  });

  // ── update ───────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('persists field changes and returns the updated assignment', async () => {
      const dto = { title: 'Updated Title' };
      const updated = { ...mockAssignmentRow, ...dto };
      mockAssignment.update.mockResolvedValue(updated);

      const result = await repository.update('uuid-assignment-1', dto);

      expect(mockAssignment.update).toHaveBeenCalledWith({
        where: { id: 'uuid-assignment-1' },
        data: { title: 'Updated Title' },
      });
      expect(result.title).toBe('Updated Title');
    });
  });

  // ── remove ───────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('soft-deletes by setting deletedAt', async () => {
      const deletedAt = new Date();
      mockAssignment.update.mockResolvedValue({
        ...mockAssignmentRow,
        deletedAt,
      });

      const result = await repository.remove('uuid-assignment-1');

      expect(mockAssignment.update).toHaveBeenCalledWith({
        where: { id: 'uuid-assignment-1' },
        data: { deletedAt: expect.any(Date) as Date },
      });
      expect(result.deletedAt).toEqual(deletedAt);
    });
  });
});
