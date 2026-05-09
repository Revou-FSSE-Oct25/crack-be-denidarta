import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { SubmissionsRepository } from './submissions.repository';
import { GradingCriteriaItem } from './types/grading.types';

@Injectable()
export class SubmissionsService {
  constructor(private readonly submissionRepository: SubmissionsRepository) {}

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

    return this.submissionRepository.create(dto);
  }

  // ---- Read ----

  findAll(
    filter: {
      studentId?: string;
      assignmentId?: string;
      courseId?: string;
    } = {},
  ) {
    return this.submissionRepository.findAll(filter);
  }

  async findOne(id: string, currentUser: JwtPayload) {
    const submission = await this.submissionRepository.findOne(id);

    if (!submission || submission.deletedAt) {
      throw new NotFoundException('Submission not found');
    }

    const isPrivileged =
      currentUser.role === UserRole.admin ||
      currentUser.role === UserRole.instructor;
    const isOwner = submission.studentId === currentUser.sub;

    if (!isPrivileged && !isOwner) {
      throw new ForbiddenException(
        'You are not allowed to view this submission',
      );
    }

    return submission;
  }

  // ---- Update ----

  async update(id: string, dto: UpdateSubmissionDto, currentUser: JwtPayload) {
    const submission = await this.submissionRepository.findOne(id);

    if (!submission || submission.deletedAt) {
      throw new NotFoundException('Submission not found');
    }

    const isPrivileged =
      currentUser.role === UserRole.admin ||
      currentUser.role === UserRole.instructor;
    const isOwner = submission.studentId === currentUser.sub;

    if (!isPrivileged && !isOwner) {
      throw new ForbiddenException(
        'You are not allowed to update this submission',
      );
    }

    return this.submissionRepository.update(id, dto);
  }

  // ---- Delete ----

  async remove(id: string, currentUser: JwtPayload) {
    const submission = await this.submissionRepository.findOne(id);

    if (!submission || submission.deletedAt) {
      throw new NotFoundException('Submission not found');
    }

    const isPrivileged =
      currentUser.role === UserRole.admin ||
      currentUser.role === UserRole.instructor;
    const isOwner = submission.studentId === currentUser.sub;

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
    if (!submission || submission.deletedAt) {
      throw new NotFoundException('Submission not found');
    }

    const assignmentData = submission.assignment as Record<string, unknown>;
    const minPoints = Number(assignmentData.minPoints);
    const gradingCriteria = assignmentData.gradingCriteria as
      | GradingCriteriaItem[]
      | null;

    // 3. Validate criteriaScores against the assignment's gradingCriteria
    if (gradingCriteria && gradingCriteria.length > 0) {
      for (const score of dto.criteriaScores) {
        const criteria = gradingCriteria[score.criteriaIndex];

        if (!criteria) {
          throw new BadRequestException(
            `criteriaIndex ${score.criteriaIndex} is out of bounds — assignment has ${gradingCriteria.length} criteria`,
          );
        }

        if (score.pointsAwarded > criteria.points) {
          throw new BadRequestException(
            `pointsAwarded (${score.pointsAwarded}) for criteria "${criteria.label}" cannot exceed its max points (${criteria.points})`,
          );
        }
      }
    }

    // 4. Calculate total grade from checked criteriaScores (computed once, stored directly)
    const finalGrade = dto.criteriaScores.reduce(
      (sum, s) => sum + s.pointsAwarded,
      0,
    );

    // 5. Passed if total grade meets the assignment's minimum passing points
    const passed = finalGrade >= minPoints;

    // 6. Persist in a single write — grade won't need to be re-computed
    return this.submissionRepository.grade(id, {
      criteriaScores: dto.criteriaScores as unknown as Prisma.InputJsonValue,
      grade: finalGrade,
      passed,
      feedback: dto.feedback,
      gradedBy: currentUser.sub,
      gradedAt: new Date(),
    });
  }
}
