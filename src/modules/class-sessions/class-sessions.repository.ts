import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { PaginationParams } from '../../common/utils/pagination.util';
import { CreateClassSessionDto } from './dto/create-class-session.dto';
import { UpdateClassSessionDto } from './dto/update-class-session.dto';

@Injectable()
export class ClassSessionRepository {
  constructor(private prisma: PrismaService) {}

  private readonly sessionInclude = {
    course: {
      select: {
        id: true,
        name: true,
        instructor: {
          select: {
            id: true,
            profile: { select: { fullName: true } },
          },
        },
      },
    },
  };

  create(dto: CreateClassSessionDto) {
    return this.prisma.classSession.create({
      data: dto as never,
      include: this.sessionInclude,
    });
  }

  async findAll(
    params: PaginationParams,
    userId?: string,
    orderBy?: Prisma.ClassSessionOrderByWithRelationInput,
    search?: string,
    status?: string,
  ) {
    const where: Prisma.ClassSessionWhereInput = {
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
      ...(status && status !== 'all' && { status: status as never }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          {
            course: {
              name: { contains: search, mode: 'insensitive' as const },
            },
          },
        ],
      }),
    };

    const defaultOrder: Prisma.ClassSessionOrderByWithRelationInput[] = [
      { sessionDate: 'asc' },
      { startTime: 'asc' },
    ];

    const [data, total] = await this.prisma.$transaction([
      this.prisma.classSession.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: orderBy ?? defaultOrder,
        include: this.sessionInclude,
      }),
      this.prisma.classSession.count({ where }),
    ]);

    return { data, total };
  }

  async findAllForProgram(programId: string, params: PaginationParams) {
    const where: Prisma.ClassSessionWhereInput = {
      deletedAt: null,
      course: { programId },
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.classSession.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: [{ sessionDate: 'desc' }, { startTime: 'asc' }],
        include: {
          ...this.sessionInclude,
          _count: { select: { attendances: true } },
          attendances: { where: { isVerified: true }, select: { id: true } },
        },
      }),
      this.prisma.classSession.count({ where }),
    ]);

    return { data, total };
  }

  findOne(id: string) {
    return this.prisma.classSession.findUnique({
      where: { id },
      include: this.sessionInclude,
    });
  }

  update(id: string, dto: UpdateClassSessionDto) {
    return this.prisma.classSession.update({
      where: { id },
      data: dto,
      include: this.sessionInclude,
    });
  }

  remove(id: string) {
    return this.prisma.classSession.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
