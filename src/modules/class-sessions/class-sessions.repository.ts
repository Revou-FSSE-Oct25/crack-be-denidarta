import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaginationParams } from '../../common/utils/pagination.util';
import { CreateClassSessionDto } from './dto/create-class-session.dto';
import { UpdateClassSessionDto } from './dto/update-class-session.dto';

@Injectable()
export class ClassSessionRepository {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateClassSessionDto) {
    return this.prisma.classSession.create({ data: dto as never });
  }

  findAll(params: PaginationParams) {
    return this.prisma.classSession.findMany({
      where: { deletedAt: null },
      skip: params.skip,
      take: params.take,
      orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
      include: {
        course: {
          select: { id: true, name: true },
        },
      },
    });
  }

  findOne(id: string) {
    return this.prisma.classSession.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdateClassSessionDto) {
    return this.prisma.classSession.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.classSession.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
