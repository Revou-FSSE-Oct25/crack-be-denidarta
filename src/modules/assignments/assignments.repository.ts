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

    const toSubmit = course.programId
      ? await this.prisma.programEnrollment.count({
          where: { programId: course.programId, status: 'enrolled' },
        })
      : 0;

    return this.prisma.assignment.create({
      data: {
        ...rest,
        toSubmit,
        ...(gradingCriteria !== undefined && {
          gradingCriteria: gradingCriteria as unknown as Prisma.InputJsonValue,
        }),
      },
    });
  }

  // ---- Read ----

  findAll(params: PaginationParams, userId?: string) {
    const where = {
      deletedAt: null,
      ...(userId && {
        course: {
          program: {
            programs: {
              some: { userId },
            },
          },
        },
      }),
    };

    return this.prisma.$transaction([
      this.prisma.assignment.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        include: {
          course: {
            select: { name: true },
          },
        },
      }),
      this.prisma.assignment.count({ where }),
    ]);
  }

  findOne(id: string) {
    return this.prisma.assignment.findUnique({ where: { id } });
  }

  // ---- Update ----

  update(id: string, dto: UpdateAssignmentDto) {
    const { gradingCriteria, ...rest } = dto;
    return this.prisma.assignment.update({
      where: { id },
      data: {
        ...rest,
        ...(gradingCriteria !== undefined && {
          gradingCriteria: gradingCriteria as unknown as Prisma.InputJsonValue,
        }),
      },
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
