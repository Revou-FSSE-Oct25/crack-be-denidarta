import { Injectable } from '@nestjs/common';
import { SessionStatus, UserRole } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { PaginationParams } from '../../common/utils/pagination.util';
import { AttendancesService } from '../attendances/attendances.service';
import { ClassSessionRepository } from './class-sessions.repository';
import { CreateClassSessionDto } from './dto/create-class-session.dto';
import { UpdateClassSessionDto } from './dto/update-class-session.dto';
import { ResponseClassSessionDto } from './dto/response-class-session.dto';

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

  async findAll(params: PaginationParams, user: JwtPayload) {
    const userId = user.role === UserRole.student ? user.sub : undefined;
    const { data, total } = await this.classSessionRepository.findAll(
      params,
      userId,
    );

    return [data.map((item) => this.toResponseDto(item)), total] as const;
  }

  async findOne(id: string) {
    const result = await this.classSessionRepository.findOne(id);
    return result ? this.toResponseDto(result) : null;
  }

  /**
   * Updates a class session.
   * When status transitions to "ongoing", automatically generates
   * unverified attendance records for all enrolled students.
   */
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
