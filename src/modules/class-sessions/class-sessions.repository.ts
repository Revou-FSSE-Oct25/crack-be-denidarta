import { Injectable } from '@nestjs/common';
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

  async findAll(params: PaginationParams, userId?: string) {
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

    const [data, total] = await this.prisma.$transaction([
      this.prisma.classSession.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
        include: this.sessionInclude,
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
