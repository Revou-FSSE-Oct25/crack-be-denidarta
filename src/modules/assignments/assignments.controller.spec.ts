import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

// ── Service mock ──────────────────────────────────────────────────────────────

const mockCreate = jest.fn();
const mockFindAll = jest.fn();
const mockFindOne = jest.fn();
const mockUpdate = jest.fn();
const mockRemove = jest.fn();

const mockAssignmentsService = {
  create: mockCreate,
  findAll: mockFindAll,
  findOne: mockFindOne,
  update: mockUpdate,
  remove: mockRemove,
};

// ── Fixtures ──────────────────────────────────────────────────────────────────

const instructorUser: JwtPayload = {
  sub: 'uuid-instructor-1',
  role: UserRole.instructor,
  email: 'instructor@test.com',
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

describe('AssignmentsController', () => {
  let controller: AssignmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssignmentsController],
      providers: [
        { provide: AssignmentsService, useValue: mockAssignmentsService },
      ],
    }).compile();

    controller = module.get<AssignmentsController>(AssignmentsController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeInstanceOf(AssignmentsController);
  });

  // ── create ───────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('delegates to the service and returns the assignment wrapped in data', async () => {
      mockCreate.mockResolvedValue(mockAssignment);

      const result = await controller.create(baseDto, instructorUser);

      expect(mockCreate).toHaveBeenCalledWith(baseDto, instructorUser);
      expect(result).toHaveProperty('data');
      expect(result.data.submitted).toBe(0);
      expect(result.data.toSubmit).toBe(5);
    });
  });

  // ── findOne ───────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('returns an assignment wrapped in data with submitted and toSubmit counters', async () => {
      const assignment = { ...mockAssignment, submitted: 3, toSubmit: 5 };
      mockFindOne.mockResolvedValue(assignment);

      const result = await controller.findOne(
        'uuid-assignment-1',
        instructorUser,
      );

      expect(mockFindOne).toHaveBeenCalledWith(
        'uuid-assignment-1',
        instructorUser,
      );
      expect(result).toHaveProperty('data');
      expect(result.data.submitted).toBe(3);
      expect(result.data.toSubmit).toBe(5);
    });
  });

  // ── update ────────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('delegates update to the service and returns the result wrapped in data', async () => {
      const dto = { title: 'New Title' };
      const updated = { ...mockAssignment, ...dto };
      mockUpdate.mockResolvedValue(updated);

      const result = await controller.update('uuid-assignment-1', dto);

      expect(mockUpdate).toHaveBeenCalledWith('uuid-assignment-1', dto);
      expect(result).toHaveProperty('data');
      expect(result.data.title).toBe('New Title');
    });
  });

  // ── remove ────────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('delegates soft-delete to the service and returns result wrapped in data', async () => {
      const deletedAt = new Date();
      mockRemove.mockResolvedValue({ ...mockAssignment, deletedAt });

      const result = await controller.remove('uuid-assignment-1');

      expect(mockRemove).toHaveBeenCalledWith('uuid-assignment-1');
      expect(result).toHaveProperty('data');
      expect(result.data.deletedAt).toEqual(deletedAt);
    });
  });
});
