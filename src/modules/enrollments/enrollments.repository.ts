import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';

@Injectable()
export class EnrollmentRepository {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateEnrollmentDto) {
    return this.prisma.programEnrollment.create({
      data: dto,
      include: { user: true, program: true },
    });
  }

  findAllPaginated(skip: number, take: number) {
    return Promise.all([
      this.prisma.programEnrollment.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { user: true, program: true },
      }),
      this.prisma.programEnrollment.count(),
    ]);
  }

  findOne(id: string) {
    return this.prisma.programEnrollment.findUnique({
      where: { id },
      include: { user: true, program: true },
    });
  }

  update(id: string, dto: UpdateEnrollmentDto) {
    return this.prisma.programEnrollment.update({
      where: { id },
      data: dto,
      include: { user: true, program: true },
    });
  }

  remove(id: string) {
    return this.prisma.programEnrollment.delete({ where: { id } });
  }

  findByUserId(userId: string) {
    return this.prisma.programEnrollment.findMany({
      where: { userId },
      include: {
        user: true,
        program: { include: { courses: true } },
      },
    });
  }
}
