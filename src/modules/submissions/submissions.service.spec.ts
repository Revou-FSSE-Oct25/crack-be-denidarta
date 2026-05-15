import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SubmissionStatus, UserRole } from '@prisma/client';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { SubmissionsService } from './submissions.service';
import { SubmissionsRepository } from './submissions.repository';
import { ResponseSubmissionDto } from './dto/response-submission.dto';

// ── Repository mock ──────────────────────────────────────────────────────────

const mockCreate = jest.fn();
const mockFindAll = jest.fn();
const mockFindOne = jest.fn();
const mockFindOneWithAssignment = jest.fn();
const mockUpdate = jest.fn();
const mockSoftDelete = jest.fn();
const mockGrade = jest.fn();

const mockRepo = {
  create: mockCreate,
  findAll: mockFindAll,
  findOne: mockFindOne,
  findOneWithAssignment: mockFindOneWithAssignment,
  update: mockUpdate,
  softDelete: mockSoftDelete,
  grade: mockGrade,
} as unknown as SubmissionsRepository;

// ── Fixtures ─────────────────────────────────────────────────────────────────

const studentUser: JwtPayload = {
  sub: 'uuid-student-1',
  role: UserRole.student,
  email: 'student@test.com',
};

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

const mockSubmission = {
  id: 'uuid-sub-1',
  assignmentId: 'uuid-assignment-1',
  studentId: studentUser.sub,
  submissionText: 'My answer',
  fileUrl: null,
  submittedAt: new Date(),
  grade: null,
  passed: null,
  feedback: null,
  status: SubmissionStatus.submitted,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('SubmissionsService', () => {
  let service: SubmissionsService;

  beforeEach(() => {
    service = new SubmissionsService(mockRepo);
  });

  afterEach(() => jest.clearAllMocks());

  // ── create ──────────────────────────────────────────────────────────────────

  describe('create', () => {
    const dto = {
      assignmentId: 'uuid-assignment-1',
      studentId: studentUser.sub,
      submissionText: 'My answer',
    };

    it('allows a student to submit for themselves and increments submitted count', async () => {
      mockCreate.mockResolvedValue(mockSubmission);

      const result = await service.create(dto, studentUser);

      expect(mockCreate).toHaveBeenCalledWith(dto);
      expect(result).toBeInstanceOf(ResponseSubmissionDto);
      expect(result.id).toBe(mockSubmission.id);
    });

    it('allows an instructor to submit on behalf of a student', async () => {
      mockCreate.mockResolvedValue(mockSubmission);

      const result = await service.create(dto, instructorUser);

      expect(mockCreate).toHaveBeenCalledWith(dto);
      expect(result.id).toBe(mockSubmission.id);
    });

    it('allows an admin to submit on behalf of a student', async () => {
      mockCreate.mockResolvedValue(mockSubmission);

      const result = await service.create(dto, adminUser);

      expect(mockCreate).toHaveBeenCalledWith(dto);
      expect(result.id).toBe(mockSubmission.id);
    });

    it('throws ForbiddenException when a student submits for another student', async () => {
      const otherStudentDto = { ...dto, studentId: 'uuid-student-other' };

      await expect(
        service.create(otherStudentDto, studentUser),
      ).rejects.toThrow(ForbiddenException);
      expect(mockCreate).not.toHaveBeenCalled();
    });
  });

  // ── findAll ──────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns all submissions when no filter is provided', async () => {
      mockFindAll.mockResolvedValue([[mockSubmission], 1]);

      const result = await service.findAll({}, {}, adminUser);

      expect(mockFindAll).toHaveBeenCalledWith(
        {},
        expect.any(Object) as object,
      );
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toBeInstanceOf(ResponseSubmissionDto);
    });

    it('passes studentId filter to the repository', async () => {
      mockFindAll.mockResolvedValue([[mockSubmission], 1]);

      await service.findAll({ studentId: studentUser.sub }, {}, adminUser);

      expect(mockFindAll).toHaveBeenCalledWith(
        { studentId: studentUser.sub },
        expect.any(Object) as object,
      );
    });

    it('overrides studentId filter when requester is a student', async () => {
      mockFindAll.mockResolvedValue([[mockSubmission], 1]);

      await service.findAll({ studentId: 'someone-else' }, {}, studentUser);

      expect(mockFindAll).toHaveBeenCalledWith(
        { studentId: studentUser.sub },
        expect.any(Object) as object,
      );
    });

    it('passes assignmentId filter to the repository', async () => {
      mockFindAll.mockResolvedValue([[mockSubmission], 1]);

      await service.findAll(
        { assignmentId: 'uuid-assignment-1' },
        {},
        adminUser,
      );

      expect(mockFindAll).toHaveBeenCalledWith(
        { assignmentId: 'uuid-assignment-1' },
        expect.any(Object) as object,
      );
    });

    it('passes courseId filter to the repository', async () => {
      mockFindAll.mockResolvedValue([[mockSubmission], 1]);

      await service.findAll({ courseId: 'uuid-course-1' }, {}, adminUser);

      expect(mockFindAll).toHaveBeenCalledWith(
        { courseId: 'uuid-course-1' },
        expect.any(Object) as object,
      );
    });
  });

  // ── findOne ──────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('returns the submission when the requester is the owner', async () => {
      mockFindOne.mockResolvedValue(mockSubmission);

      const result = await service.findOne('uuid-sub-1', studentUser);

      expect(mockFindOne).toHaveBeenCalledWith('uuid-sub-1');
      expect(result).toBeInstanceOf(ResponseSubmissionDto);
      expect(result.id).toBe('uuid-sub-1');
    });

    it('returns the submission when the requester is an instructor', async () => {
      mockFindOne.mockResolvedValue(mockSubmission);

      const result = await service.findOne('uuid-sub-1', instructorUser);

      expect(result.id).toBe('uuid-sub-1');
    });

    it('throws NotFoundException when submission does not exist', async () => {
      mockFindOne.mockResolvedValue(null);

      await expect(service.findOne('uuid-sub-1', studentUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFoundException for soft-deleted submissions', async () => {
      mockFindOne.mockResolvedValue({
        ...mockSubmission,
        deletedAt: new Date(),
      });

      await expect(service.findOne('uuid-sub-1', studentUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("throws ForbiddenException when a student requests another student's submission", async () => {
      const otherSubmission = {
        ...mockSubmission,
        studentId: 'uuid-student-other',
      };
      mockFindOne.mockResolvedValue(otherSubmission);

      await expect(service.findOne('uuid-sub-1', studentUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ── update ───────────────────────────────────────────────────────────────────

  describe('update', () => {
    const dto = { submissionText: 'Updated answer' };

    it('allows the owner to update their submission', async () => {
      const updated = { ...mockSubmission, ...dto };
      mockFindOne.mockResolvedValue(mockSubmission);
      mockUpdate.mockResolvedValue(updated);

      const result = await service.update('uuid-sub-1', dto, studentUser);

      expect(mockUpdate).toHaveBeenCalledWith('uuid-sub-1', dto);
      expect(result.id).toBe('uuid-sub-1');
      expect(result.submissionText).toBe('Updated answer');
    });

    it('allows an admin to update any submission', async () => {
      mockFindOne.mockResolvedValue(mockSubmission);
      mockUpdate.mockResolvedValue(mockSubmission);

      await service.update('uuid-sub-1', dto, adminUser);

      expect(mockUpdate).toHaveBeenCalledWith('uuid-sub-1', dto);
    });

    it('throws NotFoundException when submission does not exist', async () => {
      mockFindOne.mockResolvedValue(null);

      await expect(
        service.update('uuid-sub-1', dto, studentUser),
      ).rejects.toThrow(NotFoundException);
    });

    it("throws ForbiddenException when a student tries to update another student's submission", async () => {
      const otherSubmission = {
        ...mockSubmission,
        studentId: 'uuid-student-other',
      };
      mockFindOne.mockResolvedValue(otherSubmission);

      await expect(
        service.update('uuid-sub-1', dto, studentUser),
      ).rejects.toThrow(ForbiddenException);
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  // ── remove ───────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('allows the owner to soft-delete their submission', async () => {
      const deletedAt = new Date();
      const softDeleted = { ...mockSubmission, deletedAt };
      mockFindOne.mockResolvedValue(mockSubmission);
      mockSoftDelete.mockResolvedValue(softDeleted);

      const result = await service.remove('uuid-sub-1', studentUser);

      expect(mockSoftDelete).toHaveBeenCalledWith('uuid-sub-1');
      expect(result).toMatchObject({ id: 'uuid-sub-1', deletedAt });
    });

    it('throws NotFoundException when submission does not exist', async () => {
      mockFindOne.mockResolvedValue(null);

      await expect(service.remove('uuid-sub-1', studentUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("throws ForbiddenException when a student tries to delete another student's submission", async () => {
      const otherSubmission = {
        ...mockSubmission,
        studentId: 'uuid-student-other',
      };
      mockFindOne.mockResolvedValue(otherSubmission);

      await expect(service.remove('uuid-sub-1', studentUser)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockSoftDelete).not.toHaveBeenCalled();
    });
  });

  // ── grade ────────────────────────────────────────────────────────────────────

  describe('grade', () => {
    const gradingCriteria = [
      { label: 'Code quality', points: 50 },
      { label: 'Tests', points: 50 },
    ];

    const submissionWithAssignment = {
      ...mockSubmission,
      assignment: { minPoints: 70, gradingCriteria },
    };

    const gradeDto = {
      criteriaScores: [
        { criteriaIndex: 0, checked: true },
        { criteriaIndex: 1, checked: true },
      ],
      feedback: 'Good work',
    };

    it('grades a submission and marks it as passed when all criteria checked', async () => {
      mockFindOneWithAssignment.mockResolvedValue(submissionWithAssignment);
      mockGrade.mockResolvedValue({
        ...mockSubmission,
        grade: 100,
        passed: true,
        status: SubmissionStatus.graded,
      });

      const result = await service.grade(
        'uuid-sub-1',
        gradeDto,
        instructorUser,
      );

      expect(mockGrade).toHaveBeenCalledWith(
        'uuid-sub-1',
        expect.objectContaining({
          grade: 100,
          passed: true,
          feedback: 'Good work',
          gradedBy: instructorUser.sub,
        }),
      );
      expect(result.passed).toBe(true);
      expect(result.grade).toBe(100);
      expect(result).toBeInstanceOf(ResponseSubmissionDto);
    });

    it('marks the submission as failed when no criteria are checked', async () => {
      const lowScoreDto = {
        criteriaScores: [
          { criteriaIndex: 0, checked: false },
          { criteriaIndex: 1, checked: false },
        ],
      };
      mockFindOneWithAssignment.mockResolvedValue(submissionWithAssignment);
      mockGrade.mockResolvedValue({
        ...mockSubmission,
        grade: 0,
        passed: false,
        status: SubmissionStatus.graded,
      });

      const result = await service.grade('uuid-sub-1', lowScoreDto, adminUser);

      expect(mockGrade).toHaveBeenCalledWith(
        'uuid-sub-1',
        expect.objectContaining({ grade: 0, passed: false }),
      );
      expect(result.passed).toBe(false);
    });

    it('throws ForbiddenException when a student tries to grade', async () => {
      await expect(
        service.grade('uuid-sub-1', gradeDto, studentUser),
      ).rejects.toThrow(ForbiddenException);
      expect(mockFindOneWithAssignment).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when submission does not exist', async () => {
      mockFindOneWithAssignment.mockResolvedValue(null);

      await expect(
        service.grade('uuid-sub-1', gradeDto, instructorUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when criteriaIndex is out of bounds', async () => {
      const badDto = {
        criteriaScores: [{ criteriaIndex: 5, checked: true }],
      };
      mockFindOneWithAssignment.mockResolvedValue(submissionWithAssignment);

      await expect(
        service.grade('uuid-sub-1', badDto, instructorUser),
      ).rejects.toThrow(/criteriaIndex 5 is out of bounds/);
    });
  });
});
