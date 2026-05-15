import { Injectable } from '@nestjs/common';
import { Prisma, SubmissionStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { PaginationParams } from '../../common/utils/pagination.util';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';

const submissionInclude = {
  assignment: {
    select: {
      id: true,
      title: true,
    },
  },
  student: {
    select: {
      profile: {
        select: { fullName: true },
      },
    },
  },
} as const;

export type SubmissionResult = Prisma.AssignmentSubmissionGetPayload<{
  include: typeof submissionInclude;
}>;

export type SubmissionWithAssignmentResult =
  Prisma.AssignmentSubmissionGetPayload<{
    include: typeof submissionInclude & { assignment: true };
  }>;

@Injectable()
export class SubmissionsRepository {
  constructor(private prisma: PrismaService) {}

  private readonly submissionInclude = submissionInclude;

  // ---- Create ----

  create(dto: CreateSubmissionDto) {
    return this.prisma.$transaction(async (tx) => {
      const submission = await tx.assignmentSubmission.create({
        data: dto,
        include: this.submissionInclude,
      });
      await tx.assignment.update({
        where: { id: dto.assignmentId },
        data: { submitted: { increment: 1 } },
      });
      return submission;
    });
  }

  // ---- Read ----

  findAll(
    filter: {
      studentId?: string;
      assignmentId?: string;
      courseId?: string;
    } = {},
    pagination: PaginationParams,
  ) {
    const where: Prisma.AssignmentSubmissionWhereInput = {
      deletedAt: null,
      ...(filter.studentId && { studentId: filter.studentId }),
      ...(filter.assignmentId && { assignmentId: filter.assignmentId }),
      ...(filter.courseId && { assignment: { courseId: filter.courseId } }),
    };

    return this.prisma.$transaction([
      this.prisma.assignmentSubmission.findMany({
        where,
        include: this.submissionInclude,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.assignmentSubmission.count({ where }),
    ]);
  }

  findOne(id: string) {
    return this.prisma.assignmentSubmission.findUnique({
      where: { id },
      include: this.submissionInclude,
    });
  }

  /** Fetch submission together with the parent assignment — used during grading. */
  findOneWithAssignment(id: string) {
    return this.prisma.assignmentSubmission.findUnique({
      where: { id },
      include: {
        ...this.submissionInclude,
        assignment: true, // Need full assignment data for grading
      },
    });
  }

  /** Student submits their assignment */
  submit(id: string, data: { submissionText?: string; fileUrl?: string }) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.assignmentSubmission.findUniqueOrThrow({
        where: { id },
        select: { status: true, assignmentId: true },
      });

      const submission = await tx.assignmentSubmission.update({
        where: { id },
        data: {
          ...data,
          status: SubmissionStatus.submitted,
          submittedAt: new Date(),
        },
        include: this.submissionInclude,
      });

      // Only increment if it was previously not submitted
      if (current.status === SubmissionStatus.notSubmitted) {
        await tx.assignment.update({
          where: { id: current.assignmentId },
          data: { submitted: { increment: 1 } },
        });
      }

      return submission;
    });
  }

  // ---- Update ----

  update(id: string, dto: UpdateSubmissionDto) {
    return this.prisma.assignmentSubmission.update({
      where: { id },
      data: dto,
      include: this.submissionInclude,
    });
  }

  /**
   * Persist the grading result in a single write.
   * `grade` is pre-computed by the service — no re-query needed afterwards.
   */
  grade(
    id: string,
    data: {
      criteriaScores: Prisma.InputJsonValue;
      grade: number;
      passed: boolean;
      feedback?: string;
      gradedBy: string;
      gradedAt: Date;
    },
  ) {
    return this.prisma.assignmentSubmission.update({
      where: { id },
      data: {
        ...data,
        status: SubmissionStatus.graded,
      },
      include: this.submissionInclude,
    });
  }

  // ---- Delete ----

  softDelete(id: string) {
    return this.prisma.assignmentSubmission.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
