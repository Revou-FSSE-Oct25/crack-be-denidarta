import { Injectable } from '@nestjs/common';
import { Prisma, SubmissionStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';

@Injectable()
export class SubmissionsRepository {
  constructor(private prisma: PrismaService) {}

  // ---- Create ----

  create(dto: CreateSubmissionDto) {
    return this.prisma.assignmentSubmission.create({ data: dto });
  }

  // ---- Read ----

  findAll(
    filter: {
      studentId?: string;
      assignmentId?: string;
      courseId?: string;
    } = {},
  ) {
    return this.prisma.assignmentSubmission.findMany({
      where: {
        deletedAt: null,
        ...(filter.studentId && { studentId: filter.studentId }),
        ...(filter.assignmentId && { assignmentId: filter.assignmentId }),
        ...(filter.courseId && { assignment: { courseId: filter.courseId } }),
      },
    });
  }

  findOne(id: string) {
    return this.prisma.assignmentSubmission.findUnique({ where: { id } });
  }

  /** Fetch submission together with the parent assignment — used during grading. */
  findOneWithAssignment(id: string) {
    return this.prisma.assignmentSubmission.findUnique({
      where: { id },
      include: { assignment: true },
    });
  }

  // ---- Update ----

  update(id: string, dto: UpdateSubmissionDto) {
    return this.prisma.assignmentSubmission.update({
      where: { id },
      data: dto,
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
