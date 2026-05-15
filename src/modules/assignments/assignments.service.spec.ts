import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { AssignmentsService } from './assignments.service';
import { AssignmentRepository } from './assignments.repository';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

// ── Repository mock ───────────────────────────────────────────────────────────

const mockCreate = jest.fn();
const mockFindAll = jest.fn();
const mockFindOne = jest.fn();
const mockUpdate = jest.fn();
const mockRemove = jest.fn();

const mockRepo = {
  create: mockCreate,
  findAll: mockFindAll,
  findOne: mockFindOne,
  update: mockUpdate,
  remove: mockRemove,
} as unknown as AssignmentRepository;

// ── Fixtures ──────────────────────────────────────────────────────────────────

const instructorUser: JwtPayload = {
  sub: 'uuid-instructor-1',
  role: UserRole.instructor,
  email: 'instructor@test.com',
};

const adminUser: JwtPayload = {
  sub: 'uuid-admin-1',
  role: UserRole.admin,
  email: 'admin@test.com',
};

const studentUser: JwtPayload = {
  sub: 'uuid-student-1',
  role: UserRole.student,
  email: 'student@test.com',
};

const baseDto: CreateAssignmentDto = {
  courseId: 'uuid-course-1',
  title: 'Midterm Assignment',
  dueDate: '2026-06-01T00:00:00.000Z',
};

const mockAssignment = {
  id: 'uuid-assignment-1',
  ...baseDto,
  submitted: 0,
  toSubmit: 5,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('AssignmentsService', () => {
  let service: AssignmentsService;

  beforeEach(() => {
    service = new AssignmentsService(mockRepo);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeInstanceOf(AssignmentsService);
  });

  // ── create ───────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('creates an assignment with toSubmit set from program enrollment count', async () => {
      mockCreate.mockResolvedValue(mockAssignment);

      const result = await service.create(baseDto, instructorUser);

      expect(mockCreate).toHaveBeenCalledWith(baseDto);
      // toSubmit is populated by the repository layer from enrollment count
      expect(result.toSubmit).toBe(5);
      // submitted starts at 0 — no one has submitted yet
      expect(result.submitted).toBe(0);
    });

    it('allows an admin to create an assignment', async () => {
      mockCreate.mockResolvedValue(mockAssignment);

      const result = await service.create(baseDto, adminUser);

      expect(mockCreate).toHaveBeenCalledWith(baseDto);
      expect(result).toEqual(mockAssignment);
    });

    it('throws ForbiddenException when a student tries to create an assignment', async () => {
      await expect(service.create(baseDto, studentUser)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockCreate).not.toHaveBeenCalled();
    });
  });

  // ── findOne ───────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('throws NotFoundException when assignment is absent', async () => {
      mockFindOne.mockResolvedValue(null);
      await expect(service.findOne('bad-id', instructorUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns the assignment including submitted and toSubmit counters', async () => {
      const assignment = {
        ...mockAssignment,
        submitted: 3,
        toSubmit: 5,
        course: { name: 'Test Course' },
        submissions: [],
        minPoints: null,
      };
      mockFindOne.mockResolvedValue(assignment);

      const result = await service.findOne('uuid-assignment-1', instructorUser);

      expect(mockFindOne).toHaveBeenCalledWith('uuid-assignment-1', undefined);
      expect(result!.submitted).toBe(3);
      expect(result!.toSubmit).toBe(5);
    });
  });

  // ── update ───────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('updates the assignment and returns the result', async () => {
      const dto = { title: 'Updated Title' };
      const updated = { ...mockAssignment, ...dto };
      mockUpdate.mockResolvedValue(updated);

      const result = await service.update('uuid-assignment-1', dto);

      expect(mockUpdate).toHaveBeenCalledWith('uuid-assignment-1', dto);
      expect(result.title).toBe('Updated Title');
    });
  });

  // ── remove ───────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('delegates soft-delete to the repository', async () => {
      const deletedAt = new Date();
      mockRemove.mockResolvedValue({ ...mockAssignment, deletedAt });

      const result = await service.remove('uuid-assignment-1');

      expect(mockRemove).toHaveBeenCalledWith('uuid-assignment-1');
      expect(result.deletedAt).toEqual(deletedAt);
    });
  });
});
