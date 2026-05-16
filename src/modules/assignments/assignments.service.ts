import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { AssignmentRepository } from './assignments.repository';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import {
  paginationParams,
  paginatedResponse,
  PaginatedResponse,
} from '../../common/utils/pagination.util';
import { plainToInstance } from 'class-transformer';
import { SubmissionStatus } from '@prisma/client';
import { ResponseAssignmentDto } from './dto/response-assignment.dto';
import { ensureFound } from '../../common/utils/ensure-found.util';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

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

type AssignmentRaw = {
  course?: { name: string } | null;
  submissions?: unknown[];
  minPoints?: unknown;
  createdAt: Date;
  updatedAt: Date;
  dueDate: Date;
  [key: string]: unknown;
};

@Injectable()
export class AssignmentsService {
  constructor(private readonly assignmentRepository: AssignmentRepository) {}

  private toResponseDto(assignment: AssignmentRaw): ResponseAssignmentDto {
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
      feedback: submission.feedback ?? null,
      gradedAt: submission.gradedAt ?? null,
    }));

    return responseDto;
  }

  async create(dto: CreateAssignmentDto, currentUser: JwtPayload) {
    if (
      currentUser.role !== UserRole.admin &&
      currentUser.role !== UserRole.instructor
    ) {
      throw new ForbiddenException('You are not allowed to create assignment');
    }

    return this.assignmentRepository.create(dto);
  }

  async findAll(
    query: PaginationQueryDto,
    user: JwtPayload,
  ): Promise<PaginatedResponse<ResponseAssignmentDto>> {
    const params = paginationParams(query);

    const filterUserId = user.role === UserRole.student ? user.sub : undefined;
    const includeSubmissionForUserId =
      user.role === UserRole.student ? user.sub : undefined;

    const [assignments, total] = await this.assignmentRepository.findAll(
      params,
      filterUserId,
      includeSubmissionForUserId,
    );

    return paginatedResponse(
      assignments.map((a) => this.toResponseDto(a as AssignmentRaw)),
      total,
      params,
    );
  }

  async findOne(id: string, user: JwtPayload): Promise<ResponseAssignmentDto> {
    const includeSubmissionForUserId =
      user.role === UserRole.student ? user.sub : undefined;

    const assignment = await this.assignmentRepository.findOne(
      id,
      includeSubmissionForUserId,
    );

    return this.toResponseDto(
      ensureFound(assignment, `Assignment ${id} not found`),
    );
  }

  update(id: string, dto: UpdateAssignmentDto) {
    return this.assignmentRepository.update(id, dto);
  }

  remove(id: string) {
    return this.assignmentRepository.remove(id);
  }
}
