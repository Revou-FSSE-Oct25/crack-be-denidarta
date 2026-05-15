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

@Injectable()
export class EnrollmentsService {
  constructor(private readonly enrollmentRepository: EnrollmentRepository) {}

  private toDto(data: Record<string, unknown>): ResponseEnrollmentDto {
    return plainToInstance(ResponseEnrollmentDto, data, {
      excludeExtraneousValues: true,
    });
  }

  async create(dto: CreateEnrollmentDto): Promise<ResponseEnrollmentDto> {
    const result = await this.enrollmentRepository.create(dto);
    return this.toDto(result as unknown as Record<string, unknown>);
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
      data.map((e) => this.toDto(e as unknown as Record<string, unknown>)),
      total,
      params,
    );
  }

  async findOne(id: string): Promise<ResponseEnrollmentDto> {
    const result = await this.enrollmentRepository.findOne(id);
    return this.toDto(
      ensureFound(result, `Enrollment ${id} not found`) as unknown as Record<
        string,
        unknown
      >,
    );
  }

  async update(
    id: string,
    dto: UpdateEnrollmentDto,
  ): Promise<ResponseEnrollmentDto> {
    const result = await this.enrollmentRepository.update(id, dto);
    return this.toDto(result as unknown as Record<string, unknown>);
  }

  async remove(id: string) {
    return this.enrollmentRepository.remove(id);
  }

  async findByUserId(userId: string): Promise<ResponseEnrollmentDto[]> {
    const results = await this.enrollmentRepository.findByUserId(userId);
    return results.map((e) =>
      this.toDto(e as unknown as Record<string, unknown>),
    );
  }
}
