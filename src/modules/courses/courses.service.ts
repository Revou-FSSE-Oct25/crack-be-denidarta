import { Injectable } from '@nestjs/common';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseRepository } from './courses.repository';
import { ResponseCourseDto } from './dto/response-course.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly courseRepository: CourseRepository) {}

  private toResponseDto(data: {
    instructor?: { id: string; profile: unknown };
    [key: string]: unknown;
  }): ResponseCourseDto {
    const transformed = {
      ...data,
      instructor: data.instructor
        ? {
            userId: data.instructor.id,
            profile: data.instructor.profile,
          }
        : null,
    };
    return plainToInstance(ResponseCourseDto, transformed, {
      excludeExtraneousValues: true,
    });
  }

  async create(dto: CreateCourseDto) {
    const result = await this.courseRepository.create(dto);
    return this.toResponseDto(result);
  }

  async findAll(
    skip: number,
    take: number,
    search: string | undefined,
    currentUser: JwtPayload,
  ): Promise<[ResponseCourseDto[], number]> {
    const [data, total] =
      currentUser.role === UserRole.student
        ? await this.courseRepository.findStudentsCourse(
            currentUser.sub,
            skip,
            take,
            search,
          )
        : await this.courseRepository.findAll(skip, take, search);

    return [data.map((item) => this.toResponseDto(item)), total];
  }

  async findOne(id: string) {
    const result = await this.courseRepository.findOne(id);
    return result ? this.toResponseDto(result) : null;
  }

  async update(id: string, dto: UpdateCourseDto) {
    const result = await this.courseRepository.update(id, dto);
    return this.toResponseDto(result);
  }

  remove(id: string) {
    return this.courseRepository.remove(id);
  }
}
