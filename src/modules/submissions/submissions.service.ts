import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import {
  PaginationQuery,
  paginationParams,
  paginatedResponse,
} from '../../common/utils/pagination.util';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { ResponseSubmissionDto } from './dto/response-submission.dto';
import { SubmissionsRepository } from './submissions.repository';
import { GradingCriteriaItem } from './types/grading.types';

@Injectable()
export class SubmissionsService {
  constructor(private readonly submissionRepository: SubmissionsRepository) {}

  private toResponseDto(data: {
    grade?: unknown;
    [key: string]: unknown;
  }): ResponseSubmissionDto {
    const normalized = {
      ...data,
      grade: data?.grade != null ? Number(data.grade) : null,
    };
    return plainToInstance(ResponseSubmissionDto, normalized, {
      excludeExtraneousValues: true,
    });
  }

  // ---- Student Actions ----

  async submitAssignmentByStudent(
    id: string,
    dto: SubmitAssignmentDto,
    currentUser: JwtPayload,
  ) {
    const submission = await this.submissionRepository.findOne(id);

    if (!submission || (submission as Record<string, unknown>).deletedAt) {
      throw new NotFoundException('Submission not found');
    }

    // Students can only submit for themselves
    if (
      currentUser.role === UserRole.student &&
      (submission as Record<string, unknown>).studentId !== currentUser.sub
    ) {
      throw new ForbiddenException(
        'You are not allowed to submit this assignment',
      );
    }

    const result = await this.submissionRepository.submit(id, dto);
    return this.toResponseDto(result);
  }

  // ---- Create ----

  async create(dto: CreateSubmissionDto, currentUser: JwtPayload) {
    // Student can only submit for themselves; admin/instructor can submit on behalf of anyone
    const isPrivileged =
      currentUser.role === UserRole.admin ||
      currentUser.role === UserRole.instructor;

    if (!isPrivileged && dto.studentId !== currentUser.sub) {
      throw new ForbiddenException(
        'You can only create a submission for yourself',
      );
    }

    const result = await this.submissionRepository.create(dto);
    return this.toResponseDto(result);
  }

  // ---- Read ----

  async findAll(
    filter: {
      studentId?: string;
      assignmentId?: string;
      courseId?: string;
    } = {},
    query: PaginationQuery,
    currentUser: JwtPayload,
  ) {
    // RBAC: If student, override studentId filter to their own ID
    if (currentUser.role === UserRole.student) {
      filter.studentId = currentUser.sub;
    }

    const params = paginationParams(query);
    const [submissions, total] = await this.submissionRepository.findAll(
      filter,
      params,
    );

    return paginatedResponse(
      submissions.map((s) => this.toResponseDto(s)),
      total,
      params,
    );
  }

  async findOne(id: string, currentUser: JwtPayload) {
    const submission = await this.submissionRepository.findOne(id);

    if (!submission || (submission as Record<string, unknown>).deletedAt) {
      throw new NotFoundException('Submission not found');
    }

    const isPrivileged =
      currentUser.role === UserRole.admin ||
      currentUser.role === UserRole.instructor;
    const isOwner =
      (submission as Record<string, unknown>).studentId === currentUser.sub;

    if (!isPrivileged && !isOwner) {
      throw new ForbiddenException(
        'You are not allowed to view this submission',
      );
    }

    return this.toResponseDto(submission);
  }

  // ---- Update ----

  async update(id: string, dto: UpdateSubmissionDto, currentUser: JwtPayload) {
    const submission = await this.submissionRepository.findOne(id);

    if (!submission || (submission as Record<string, unknown>).deletedAt) {
      throw new NotFoundException('Submission not found');
    }

    const isPrivileged =
      currentUser.role === UserRole.admin ||
      currentUser.role === UserRole.instructor;
    const isOwner =
      (submission as Record<string, unknown>).studentId === currentUser.sub;

    if (!isPrivileged && !isOwner) {
      throw new ForbiddenException(
        'You are not allowed to update this submission',
      );
    }

    const result = await this.submissionRepository.update(id, dto);
    return this.toResponseDto(result);
  }

  // ---- Delete ----

  async remove(id: string, currentUser: JwtPayload) {
    const submission = await this.submissionRepository.findOne(id);

    if (!submission || (submission as Record<string, unknown>).deletedAt) {
      throw new NotFoundException('Submission not found');
    }

    const isPrivileged =
      currentUser.role === UserRole.admin ||
      currentUser.role === UserRole.instructor;
    const isOwner =
      (submission as Record<string, unknown>).studentId === currentUser.sub;

    if (!isPrivileged && !isOwner) {
      throw new ForbiddenException(
        'You are not allowed to delete this submission',
      );
    }

    return this.submissionRepository.softDelete(id);
  }

  // ---- Grading ----

  async grade(id: string, dto: GradeSubmissionDto, currentUser: JwtPayload) {
    // 1. Only admin / instructor can grade
    if (
      currentUser.role !== UserRole.admin &&
      currentUser.role !== UserRole.instructor
    ) {
      throw new ForbiddenException('You are not allowed to grade submissions');
    }

    // 2. Fetch submission + parent assignment in one query
    const submission =
      await this.submissionRepository.findOneWithAssignment(id);
    if (!submission || (submission as Record<string, unknown>).deletedAt) {
      throw new NotFoundException('Submission not found');
    }

    const assignmentData = (submission as Record<string, unknown>)
      .assignment as Record<string, unknown>;
    const minPoints = Number(assignmentData.minPoints);
    const gradingCriteria = assignmentData.gradingCriteria as
      | GradingCriteriaItem[]
      | null;

    // 3. Build final criteriaScores — pointsAwarded is derived from checked (binary: full points or zero)
    const finalCriteriaScores = dto.criteriaScores.map((score) => {
      const criteria = gradingCriteria?.[score.criteriaIndex];

      if (!criteria) {
        throw new BadRequestException(
          `criteriaIndex ${score.criteriaIndex} is out of bounds — assignment has ${gradingCriteria?.length ?? 0} criteria`,
        );
      }

      return {
        label: criteria.label,
        points: criteria.points,
        description: criteria.description ?? null,
        checked: score.checked,
        pointsAwarded: score.checked ? criteria.points : 0,
        notes: score.notes ?? null,
      };
    });

    // 4. Calculate total grade from computed pointsAwarded
    const finalGrade = finalCriteriaScores.reduce(
      (sum, s) => sum + s.pointsAwarded,
      0,
    );

    // 5. Passed if total grade meets the assignment's minimum passing points
    const passed = finalGrade >= minPoints;

    // 6. Persist in a single write — grade won't need to be re-computed
    const result = await this.submissionRepository.grade(id, {
      criteriaScores: finalCriteriaScores,
      grade: finalGrade,
      passed,
      feedback: dto.feedback,
      gradedBy: currentUser.sub,
      gradedAt: new Date(),
    });

    return this.toResponseDto(result);
  }
}
