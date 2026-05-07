import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CourseRepository {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateCourseDto) {
    return this.prisma.course.create({ data: dto });
  }

  findAll() {
    return this.prisma.course.findMany({
      where: { deletedAt: null },
      include: {
        instructor: { include: { profile: true } },
        enrollments: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.course.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdateCourseDto) {
    return this.prisma.course.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.course.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
