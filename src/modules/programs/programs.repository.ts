import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';

@Injectable()
export class ProgramRepository {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateProgramDto) {
    return this.prisma.program.create({
      data: dto,
      include: {
        creator: { include: { profile: true } },
        courses: true,
      },
    });
  }

  findAllPaginated(skip: number, take: number) {
    return Promise.all([
      this.prisma.program.findMany({
        where: { deletedAt: null },
        skip,
        take,
        include: {
          creator: { include: { profile: true } },
          courses: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.program.count({ where: { deletedAt: null } }),
    ]);
  }

  findOne(id: string) {
    return this.prisma.program.findUnique({
      where: { id },
      include: {
        creator: { include: { profile: true } },
        courses: true,
      },
    });
  }

  update(id: string, dto: UpdateProgramDto) {
    return this.prisma.program.update({
      where: { id },
      data: dto,
      include: {
        creator: { include: { profile: true } },
        courses: true,
      },
    });
  }

  remove(id: string) {
    return this.prisma.program.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
