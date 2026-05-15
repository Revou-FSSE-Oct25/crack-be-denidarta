import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ProfilesRepository } from './profiles.repository';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ResponseProfileDto } from './dto/response-profile.dto';
import { ensureFound } from '../../common/utils/ensure-found.util';
import {
  paginationParams,
  paginatedResponse,
  PaginatedResponse,
} from '../../common/utils/pagination.util';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class ProfilesService {
  constructor(private readonly profilesRepository: ProfilesRepository) {}

  private toDto(profile: Record<string, unknown>): ResponseProfileDto {
    return plainToInstance(ResponseProfileDto, profile, {
      excludeExtraneousValues: true,
    });
  }

  // ---- Create ----

  async create(
    userId: string,
    dto: CreateProfileDto,
  ): Promise<ResponseProfileDto> {
    const result = await this.profilesRepository.create(userId, dto);
    return this.toDto(result as unknown as Record<string, unknown>);
  }

  // ---- Read ----

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponse<ResponseProfileDto>> {
    const params = paginationParams(query);
    const [data, total] = await this.profilesRepository.findAllPaginated(
      params.skip,
      params.take,
    );
    return paginatedResponse(
      data.map((p) => this.toDto(p as unknown as Record<string, unknown>)),
      total,
      params,
    );
  }

  async findOne(id: string): Promise<ResponseProfileDto> {
    const profile = await this.profilesRepository.findOne(id);
    return this.toDto(
      ensureFound(profile, `Profile ${id} not found`) as unknown as Record<
        string,
        unknown
      >,
    );
  }

  async findByUserId(userId: string): Promise<ResponseProfileDto> {
    const profile = await this.profilesRepository.findByUserId(userId);
    return this.toDto(
      ensureFound(
        profile,
        `Profile for user ${userId} not found`,
      ) as unknown as Record<string, unknown>,
    );
  }

  // ---- Update ----

  async update(id: string, dto: UpdateProfileDto): Promise<ResponseProfileDto> {
    const result = await this.profilesRepository.update(id, dto);
    return this.toDto(result as unknown as Record<string, unknown>);
  }

  async upsertByUserId(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<ResponseProfileDto> {
    const result = await this.profilesRepository.upsertByUserId(userId, dto);
    return this.toDto(result as unknown as Record<string, unknown>);
  }

  // ---- Delete ----

  remove(id: string) {
    return this.profilesRepository.remove(id);
  }
}
