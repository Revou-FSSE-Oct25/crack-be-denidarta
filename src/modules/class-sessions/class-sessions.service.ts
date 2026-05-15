import { Injectable } from '@nestjs/common';
import { SessionStatus, UserRole } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { AttendancesService } from '../attendances/attendances.service';
import { ClassSessionRepository } from './class-sessions.repository';
import { CreateClassSessionDto } from './dto/create-class-session.dto';
import { UpdateClassSessionDto } from './dto/update-class-session.dto';
import { ResponseClassSessionDto } from './dto/response-class-session.dto';
import { ensureFound } from '../../common/utils/ensure-found.util';
import {
  paginationParams,
  paginatedResponse,
  PaginatedResponse,
} from '../../common/utils/pagination.util';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class ClassSessionsService {
  constructor(
    private readonly classSessionRepository: ClassSessionRepository,
    private readonly attendancesService: AttendancesService,
  ) {}

  private toResponseDto(
    data: NonNullable<Awaited<ReturnType<ClassSessionRepository['findOne']>>>,
  ): ResponseClassSessionDto {
    const transformed = {
      ...data,
      instructor: data.course?.instructor
        ? {
            userId: data.course.instructor.id,
            profile: data.course.instructor.profile,
          }
        : null,
    };
    return plainToInstance(ResponseClassSessionDto, transformed, {
      excludeExtraneousValues: true,
    });
  }

  async create(dto: CreateClassSessionDto) {
    const result = await this.classSessionRepository.create(dto);
    return this.toResponseDto(result);
  }

  async findAll(
    query: PaginationQueryDto,
    user: JwtPayload,
  ): Promise<PaginatedResponse<ResponseClassSessionDto>> {
    const params = paginationParams(query);
    const userId = user.role === UserRole.student ? user.sub : undefined;
    const { data, total } = await this.classSessionRepository.findAll(
      params,
      userId,
    );
    return paginatedResponse(
      data.map((item) => this.toResponseDto(item)),
      total,
      params,
    );
  }

  async findOne(id: string): Promise<ResponseClassSessionDto> {
    const result = await this.classSessionRepository.findOne(id);
    return this.toResponseDto(
      ensureFound(result, `Class session ${id} not found`),
    );
  }

  async update(id: string, dto: UpdateClassSessionDto) {
    const updated = await this.classSessionRepository.update(id, dto);

    if (dto.status === SessionStatus.ongoing) {
      await this.attendancesService.generateForSession(id);
    }

    return this.toResponseDto(updated);
  }

  remove(id: string) {
    return this.classSessionRepository.remove(id);
  }
}
