import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseWithInstructorAndProgram } from './types/course-with-relations.type';

@Injectable()
export class CourseRepository {
  constructor(private prisma: PrismaService) {}

  private readonly courseInclude = {
    instructor: {
      select: {
        id: true,
        profile: { select: { fullName: true } },
      },
    },
    program: { select: { name: true } },
  };

  create(dto: CreateCourseDto) {
    return this.prisma.course.create({
      data: dto,
      include: this.courseInclude,
    });
  }

  async findAll(
    skip: number,
    take: number,
    search?: string,
  ): Promise<[CourseWithInstructorAndProgram[], number]> {
    const where: Prisma.CourseWhereInput = {
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip,
        take,
        include: this.courseInclude,
      }),
      this.prisma.course.count({ where }),
    ]);

    return [data, total];
  }

  async findStudentsCourse(
    userId: string,
    skip: number,
    take: number,
    search?: string,
  ): Promise<[CourseWithInstructorAndProgram[], number]> {
    const where: Prisma.CourseWhereInput = {
      deletedAt: null,
      program: {
        programs: {
          some: {
            userId: userId,
            status: { in: ['enrolled', 'completed'] },
          },
        },
      },
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip,
        take,
        include: this.courseInclude,
      }),
      this.prisma.course.count({ where }),
    ]);

    return [data, total];
  }

  findInstructorCourses(id: string) {
    return this.prisma.course.findMany({
      where: { instructorId: id, deletedAt: null },
      include: this.courseInclude,
    });
  }

  findOne(id: string) {
    return this.prisma.course.findUnique({
      where: { id },
      include: this.courseInclude,
    });
  }

  update(id: string, dto: UpdateCourseDto) {
    return this.prisma.course.update({
      where: { id },
      data: dto,
      include: this.courseInclude,
    });
  }

  remove(id: string) {
    return this.prisma.course.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
