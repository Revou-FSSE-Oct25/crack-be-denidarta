import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { EnrollmentRepository } from './enrollments.repository';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { ResponseEnrollmentDto } from './dto/response-enrollment.dto';
import { ensureFound } from '../../common/utils/ensure-found.util';
import {
  paginationParams,
  paginatedResponse,
  PaginatedResponse,
} from '../../common/utils/pagination.util';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import {
  EnrollmentWithRelations,
  CourseWithInstructor,
} from './types/enrollment-with-relations.type';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly enrollmentRepository: EnrollmentRepository) {}

  private toDto(data: EnrollmentWithRelations): ResponseEnrollmentDto {
    return plainToInstance(
      ResponseEnrollmentDto,
      {
        id: data.id,
        userId: data.userId,
        programId: data.programId,
        status: data.status,
        createdAt: data.createdAt,
        user: data.user
          ? {
              id: data.user.id,
              username: data.user.username,
            }
          : null,
        program: data.program
          ? {
              id: data.program.id,
              name: data.program.name,
              headOfProgram: data.program.headOfProgram
                ? {
                    userId: data.program.headOfProgram.id,
                    fullName:
                      data.program.headOfProgram.profile?.fullName ?? null,
                  }
                : null,
              courses: (data.program.courses ?? []).map(
                (course: CourseWithInstructor) => ({
                  courseId: course.id,
                  courseTitle: course.name,
                  startedAt: course.startedAt,
                  endedAt: course.endedAt,
                  status: course.status,
                  instructor: course.instructor
                    ? {
                        userId: course.instructor.id,
                        fullName: course.instructor.profile?.fullName ?? null,
                      }
                    : null,
                }),
              ),
            }
          : null,
      },
      { excludeExtraneousValues: true },
    );
  }

  async create(dto: CreateEnrollmentDto): Promise<ResponseEnrollmentDto> {
    const result = await this.enrollmentRepository.create(dto);
    return this.toDto(result);
  }

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponse<ResponseEnrollmentDto>> {
    const params = paginationParams(query);
    const [data, total] = await this.enrollmentRepository.findAllPaginated(
      params.skip,
      params.take,
    );
    return paginatedResponse(
      data.map((e: EnrollmentWithRelations) => this.toDto(e)),
      total,
      params,
    );
  }

  async findOne(id: string): Promise<ResponseEnrollmentDto> {
    const result = await this.enrollmentRepository.findOne(id);
    return this.toDto(ensureFound(result, `Enrollment ${id} not found`));
  }

  async update(
    id: string,
    dto: UpdateEnrollmentDto,
  ): Promise<ResponseEnrollmentDto> {
    const result = await this.enrollmentRepository.update(id, dto);
    return this.toDto(result);
  }

  async remove(id: string) {
    return this.enrollmentRepository.remove(id);
  }

  async findByUserId(userId: string): Promise<ResponseEnrollmentDto[]> {
    const results = await this.enrollmentRepository.findByUserId(userId);
    return results.map((e: EnrollmentWithRelations) => this.toDto(e));
  }
}
