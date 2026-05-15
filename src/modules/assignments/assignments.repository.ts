import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { PaginationParams } from '../../common/utils/pagination.util';

@Injectable()
export class AssignmentRepository {
  constructor(private prisma: PrismaService) {}

  // ---- Create ----

  async create(dto: CreateAssignmentDto) {
    const { gradingCriteria, ...rest } = dto;

    const course = await this.prisma.course.findUniqueOrThrow({
      where: { id: dto.courseId },
      select: { programId: true },
    });

    const enrollments = course.programId
      ? await this.prisma.programEnrollment.findMany({
          where: { programId: course.programId, status: 'enrolled' },
          select: { userId: true },
        })
      : [];

    const toSubmit = enrollments.length;

    const initialCriteriaScores = gradingCriteria
      ? gradingCriteria.map((c) => ({
          label: c.label,
          points: c.points,
          description: c.description ?? null,
          checked: false,
          pointsAwarded: 0,
        }))
      : null;

    return this.prisma.assignment.create({
      data: {
        ...rest,
        toSubmit,
        ...(gradingCriteria !== undefined && {
          gradingCriteria: gradingCriteria as unknown as Prisma.InputJsonValue,
        }),
        submissions: {
          create: enrollments.map((e) => ({
            studentId: e.userId,
            ...(initialCriteriaScores && {
              criteriaScores: initialCriteriaScores,
            }),
          })),
        },
      },
    });
  }

  // ---- Read ----

  findAll(
    params: PaginationParams,
    filterUserId?: string,
    includeSubmissionForUserId?: string,
  ) {
    const where = {
      deletedAt: null,
      ...(filterUserId && {
        course: {
          program: {
            programs: {
              some: { userId: filterUserId },
            },
          },
        },
      }),
    };

    const includeOptions: Prisma.AssignmentInclude = {
      course: {
        select: { name: true },
      },
    };

    if (includeSubmissionForUserId) {
      includeOptions.submissions = {
        where: { studentId: includeSubmissionForUserId },
        select: {
          id: true,
          studentId: true,
          status: true,
          submittedAt: true,
          grade: true,
          passed: true,
          gradedAt: true,
          student: {
            select: {
              profile: {
                select: { fullName: true },
              },
            },
          },
        },
        take: 1,
      };
    } else {
      includeOptions.submissions = {
        select: {
          id: true,
          studentId: true,
          status: true,
          submittedAt: true,
          grade: true,
          passed: true,
          gradedAt: true,
          student: {
            select: {
              profile: {
                select: { fullName: true },
              },
            },
          },
        },
      };
    }

    return this.prisma.$transaction([
      this.prisma.assignment.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        include: includeOptions,
      }),
      this.prisma.assignment.count({ where }),
    ]);
  }

  findOne(id: string, includeSubmissionForUserId?: string) {
    const includeOptions: Prisma.AssignmentInclude = {
      course: {
        select: { name: true },
      },
    };

    if (includeSubmissionForUserId) {
      includeOptions.submissions = {
        where: { studentId: includeSubmissionForUserId },
        select: {
          id: true,
          studentId: true,
          status: true,
          submittedAt: true,
          submissionText: true,
          fileUrl: true,
          grade: true,
          passed: true,
          feedback: true,
          gradedAt: true,
          student: {
            select: {
              profile: {
                select: { fullName: true },
              },
            },
          },
        },
        take: 1,
      };
    } else {
      includeOptions.submissions = {
        select: {
          id: true,
          studentId: true,
          status: true,
          submittedAt: true,
          submissionText: true,
          fileUrl: true,
          grade: true,
          passed: true,
          feedback: true,
          gradedAt: true,
          student: {
            select: {
              profile: {
                select: { fullName: true },
              },
            },
          },
        },
      };
    }

    return this.prisma.assignment.findUnique({
      where: { id },
      include: includeOptions,
    });
  }

  // ---- Update ----

  update(id: string, dto: UpdateAssignmentDto) {
    const { gradingCriteria, ...rest } = dto;
    return this.prisma.$transaction(async (tx) => {
      const assignment = await tx.assignment.update({
        where: { id },
        data: {
          ...rest,
          ...(gradingCriteria !== undefined && {
            gradingCriteria:
              gradingCriteria as unknown as Prisma.InputJsonValue,
          }),
        },
      });

      if (gradingCriteria !== undefined) {
        const newCriteriaScores = gradingCriteria.map((c) => ({
          label: c.label,
          points: c.points,
          description: c.description ?? null,
          checked: false,
          pointsAwarded: 0,
        }));
        await tx.assignmentSubmission.updateMany({
          where: { assignmentId: id, deletedAt: null },
          data: {
            criteriaScores: newCriteriaScores,
          },
        });
      }

      return assignment;
    });
  }

  // ---- Delete ----

  remove(id: string) {
    return this.prisma.assignment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
