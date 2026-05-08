import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';

@Injectable()
export class EnrollmentRepository {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateEnrollmentDto) {
    return this.prisma.programEnrollment.create({ data: dto });
  }

  findAll() {
    return this.prisma.programEnrollment.findMany();
  }

  findOne(id: string) {
    return this.prisma.programEnrollment.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdateEnrollmentDto) {
    return this.prisma.programEnrollment.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.programEnrollment.delete({ where: { id } });
  }
}
