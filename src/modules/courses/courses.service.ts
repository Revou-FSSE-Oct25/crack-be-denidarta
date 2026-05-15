import { Injectable } from '@nestjs/common';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
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
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

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

  async findAll(
    query: PaginationQueryDto,
    currentUser: JwtPayload,
  ): Promise<PaginatedResponse<ResponseCourseDto>> {
    const params = paginationParams(query);
    const [data, total] =
      currentUser.role === UserRole.student
        ? await this.courseRepository.findStudentsCourse(
            currentUser.sub,
            params.skip,
            params.take,
            undefined,
          )
        : await this.courseRepository.findAll(
            params.skip,
            params.take,
            undefined,
          );
    return paginatedResponse(
      data.map((item) => this.toResponseDto(item)),
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
