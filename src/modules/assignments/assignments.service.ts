import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { AssignmentRepository } from './assignments.repository';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import {
  PaginationQuery,
  paginationParams,
  paginatedResponse,
} from '../../common/utils/pagination.util';
import { plainToInstance } from 'class-transformer';
import { SubmissionStatus } from '@prisma/client';
import { ResponseAssignmentDto } from './dto/response-assignment.dto';

type SubmissionItem = {
  id: string;
  studentId: string;
  status: SubmissionStatus;
  submittedAt: Date | null;
  submissionText: string | null;
  fileUrl: string | null;
  grade: unknown;
  passed: boolean | null;
  feedback: string | null;
  gradedAt: Date | null;
  student: { profile: { fullName: string | null } | null } | null;
};

@Injectable()
export class AssignmentsService {
  constructor(private readonly assignmentRepository: AssignmentRepository) {}

  async create(dto: CreateAssignmentDto, currentUser: JwtPayload) {
    if (
      currentUser.role !== UserRole.admin &&
      currentUser.role !== UserRole.instructor
    ) {
      throw new ForbiddenException('You are not allowed to create assignment');
    }

    return this.assignmentRepository.create(dto);
  }

  async findAll(query: PaginationQuery, user: JwtPayload) {
    const params = paginationParams(query);

    const filterUserId = user.role === UserRole.student ? user.sub : undefined;
    // For students, only include their own submission.
    // For instructors/admins, include all submissions.
    const includeSubmissionForUserId =
      user.role === UserRole.student ? user.sub : undefined;

    const [assignments, total] = await this.assignmentRepository.findAll(
      params,
      filterUserId,
      includeSubmissionForUserId,
    );

    const assignmentsDto = assignments.map((assignment) => {
      const { course, submissions, ...assignmentData } = assignment;

      const assignmentForDto = {
        ...assignmentData,
        courseName: course?.name ?? null,
        minPoints: assignmentData.minPoints
          ? Number(assignmentData.minPoints)
          : 0,
        createdAt: new Date(assignmentData.createdAt),
        updatedAt: new Date(assignmentData.updatedAt),
        dueDate: new Date(assignmentData.dueDate),
      };

      const responseDto = plainToInstance(
        ResponseAssignmentDto,
        assignmentForDto,
        {
          excludeExtraneousValues: true,
        },
      );

      // Map submissions array
      responseDto.submissions = (
        (submissions || []) as unknown as SubmissionItem[]
      ).map((submission) => ({
        submissionId: submission.id,
        userId: submission.studentId,
        fullName: submission.student?.profile?.fullName ?? null,
        status: submission.status,
        dateSubmitted: submission.submittedAt ?? null,
        submissionText: submission.submissionText ?? null,
        fileUrl: submission.fileUrl ?? null,
        grade: submission.grade != null ? Number(submission.grade) : null,
        passed: submission.passed ?? null,
        gradedAt: submission.gradedAt ?? null,
      }));

      return responseDto;
    });

    return paginatedResponse(assignmentsDto, total, params);
  }

  async findOne(id: string, user: JwtPayload) {
    const includeSubmissionForUserId =
      user.role === UserRole.student ? user.sub : undefined;

    const assignment = await this.assignmentRepository.findOne(
      id,
      includeSubmissionForUserId,
    );

    if (!assignment) {
      return null;
    }

    // Manual transformation similar to findAll
    const { course, submissions, ...assignmentData } = assignment;

    const assignmentForDto = {
      ...assignmentData,
      courseName: course?.name ?? null,
      minPoints: assignmentData.minPoints
        ? Number(assignmentData.minPoints)
        : 0,
      createdAt: new Date(assignmentData.createdAt),
      updatedAt: new Date(assignmentData.updatedAt),
      dueDate: new Date(assignmentData.dueDate),
    };

    const responseDto = plainToInstance(
      ResponseAssignmentDto,
      assignmentForDto,
      {
        excludeExtraneousValues: true,
      },
    );

    // Map submissions array
    responseDto.submissions = (
      (submissions || []) as unknown as SubmissionItem[]
    ).map((submission) => ({
      submissionId: submission.id,
      userId: submission.studentId,
      fullName: submission.student?.profile?.fullName ?? null,
      status: submission.status,
      dateSubmitted: submission.submittedAt ?? null,
      submissionText: submission.submissionText ?? null,
      fileUrl: submission.fileUrl ?? null,
      grade: submission.grade != null ? Number(submission.grade) : null,
      feedback: submission.feedback ?? null,
      passed: submission.passed ?? null,
    }));

    return responseDto;
  }

  update(id: string, dto: UpdateAssignmentDto) {
    return this.assignmentRepository.update(id, dto);
  }

  remove(id: string) {
    return this.assignmentRepository.remove(id);
  }
}
