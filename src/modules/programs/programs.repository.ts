import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';

const userSelect = {
  id: true,
  username: true,
  role: true,
  profile: {
    select: {
      fullName: true,
      avatarUrl: true,
    },
  },
} as const;

const programSelect = {
  id: true,
  createdAt: true,
  updatedAt: true,
  name: true,
  createdBy: true,
  headOfProgramId: true,
  creator: { select: userSelect },
  headOfProgram: { select: userSelect },
  courses: {
    select: {
      id: true,
      name: true,
      status: true,
      startedAt: true,
      endedAt: true,
    },
  },
  programs: {
    select: {
      userId: true,
      user: { select: { profile: { select: { fullName: true } } } },
    },
  },
} as const;

@Injectable()
export class ProgramRepository {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateProgramDto) {
    return this.prisma.program.create({
      data: dto,
      select: programSelect,
    });
  }

  findAllPaginated(skip: number, take: number) {
    return Promise.all([
      this.prisma.program.findMany({
        where: { deletedAt: null },
        skip,
        take,
        select: programSelect,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.program.count({ where: { deletedAt: null } }),
    ]);
  }

  findOne(id: string) {
    return this.prisma.program.findUnique({
      where: { id },
      select: programSelect,
    });
  }

  update(id: string, dto: UpdateProgramDto) {
    return this.prisma.program.update({
      where: { id },
      data: dto,
      select: programSelect,
    });
  }

  remove(id: string) {
    return this.prisma.program.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
