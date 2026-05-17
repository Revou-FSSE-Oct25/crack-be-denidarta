import { Injectable } from '@nestjs/common';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { Prisma, UserRole } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseRepository } from './courses.repository';
import { ResponseCourseDto } from './dto/response-course.dto';
import { ensureFound } from '../../common/utils/ensure-found.util';
import {
  paginationParams,
  paginatedResponse,
  PaginatedResponse,
} from '../../common/utils/pagination.util';
import { CourseQueryDto, CourseSortBy } from './dto/course-query.dto';
import { CourseWithInstructorAndProgram } from './types/course-with-relations.type';

@Injectable()
export class CoursesService {
  constructor(private readonly courseRepository: CourseRepository) {}

  private toResponseDto(
    data: CourseWithInstructorAndProgram,
  ): ResponseCourseDto {
    const transformed = {
      ...data,
      instructor: data.instructor
        ? { userId: data.instructor.id, profile: data.instructor.profile }
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

  private buildOrderBy(
    query: CourseQueryDto,
  ): Prisma.CourseOrderByWithRelationInput | undefined {
    if (!query.sortBy) return undefined;
    const dir = query.sort ?? 'asc';
    switch (query.sortBy) {
      case CourseSortBy.name:
        return { name: dir };
      case CourseSortBy.createdAt:
        return { createdAt: dir };
      case CourseSortBy.startedAt:
        return { startedAt: dir };
      case CourseSortBy.endedAt:
        return { endedAt: dir };
      case CourseSortBy.instructorName:
        return { instructor: { profile: { fullName: dir } } };
      case CourseSortBy.programName:
        return { program: { name: dir } };
    }
  }

  async findAll(
    query: CourseQueryDto,
    currentUser: JwtPayload,
  ): Promise<PaginatedResponse<ResponseCourseDto>> {
    const params = paginationParams(query);
    const orderBy = this.buildOrderBy(query);
    const search = query.search || undefined;
    const status = query.status || undefined;
    const programId = query.programId || undefined;
    const [data, total] =
      currentUser.role === UserRole.student
        ? await this.courseRepository.findStudentsCourse(
            currentUser.sub,
            params.skip,
            params.take,
            search,
            orderBy,
            status,
          )
        : await this.courseRepository.findAll(
            params.skip,
            params.take,
            search,
            orderBy,
            status,
            programId,
          );
    return paginatedResponse(
      data.map((item: CourseWithInstructorAndProgram) =>
        this.toResponseDto(item),
      ),
      total,
      params,
    );
  }

  async findOne(id: string): Promise<ResponseCourseDto> {
    const result = await this.courseRepository.findOne(id);
    return this.toResponseDto(ensureFound(result, `Course ${id} not found`));
  }

  async update(id: string, dto: UpdateCourseDto) {
    const result = await this.courseRepository.update(id, dto);
    return this.toResponseDto(result);
  }

  remove(id: string) {
    return this.courseRepository.remove(id);
  }
}
