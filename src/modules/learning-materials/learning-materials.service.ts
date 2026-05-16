import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreateLearningMaterialDto } from './dto/create-learning-material.dto';
import { UpdateLearningMaterialDto } from './dto/update-learning-material.dto';
import { LearningMaterialRepository } from './learning-materials.repository';
import { ResponseLearningMaterialDto } from './dto/response-learning-material.dto';
import { ensureFound } from '../../common/utils/ensure-found.util';
import {
  paginationParams,
  paginatedResponse,
  PaginatedResponse,
} from '../../common/utils/pagination.util';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class LearningMaterialsService {
  constructor(
    private readonly learningMaterialRepository: LearningMaterialRepository,
  ) {}

  private toDto(data: Record<string, unknown>): ResponseLearningMaterialDto {
    return plainToInstance(ResponseLearningMaterialDto, data, {
      excludeExtraneousValues: true,
    });
  }

  async create(
    dto: CreateLearningMaterialDto,
  ): Promise<ResponseLearningMaterialDto> {
    const result = await this.learningMaterialRepository.create(dto);
    return this.toDto(result as unknown as Record<string, unknown>);
  }

  async findAll(
    query: PaginationQueryDto,
    search?: string,
  ): Promise<PaginatedResponse<ResponseLearningMaterialDto>> {
    const params = paginationParams(query);
    const [data, total] = await this.learningMaterialRepository.findAll(
      params.skip,
      params.take,
      search,
    );
    return paginatedResponse(
      data.map((m) => this.toDto(m as unknown as Record<string, unknown>)),
      total,
      params,
    );
  }

  async findOne(id: string): Promise<ResponseLearningMaterialDto> {
    const result = await this.learningMaterialRepository.findOne(id);
    return this.toDto(ensureFound(result, `Learning material ${id} not found`));
  }

  async update(
    id: string,
    dto: UpdateLearningMaterialDto,
  ): Promise<ResponseLearningMaterialDto> {
    const result = await this.learningMaterialRepository.update(id, dto);
    return this.toDto(result as unknown as Record<string, unknown>);
  }

  findByCourse(courseId: string) {
    return this.learningMaterialRepository.findByCourse(courseId);
  }

  remove(id: string) {
    return this.learningMaterialRepository.remove(id);
  }
}
