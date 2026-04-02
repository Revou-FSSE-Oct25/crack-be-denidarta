import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';

@Injectable()
export class EnrollmentRepository {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateEnrollmentDto) {
    return this.prisma.courseEnrollment.create({ data: dto });
  }

  findAll() {
    return this.prisma.courseEnrollment.findMany();
  }

  findOne(id: number) {
    return this.prisma.courseEnrollment.findUnique({ where: { id } });
  }

  update(id: number, dto: UpdateEnrollmentDto) {
    return this.prisma.courseEnrollment.update({ where: { id }, data: dto });
  }

  remove(id: number) {
    return this.prisma.courseEnrollment.delete({ where: { id } });
  }
}
