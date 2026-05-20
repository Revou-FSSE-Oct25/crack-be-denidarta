import { Injectable } from '@nestjs/common';
import { Prisma, SessionStatus, UserRole } from '@prisma/client';
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
import {
  ClassSessionQueryDto,
  ClassSessionSortBy,
} from './dto/class-session-query.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class ClassSessionsService {
  constructor(
    private readonly classSessionRepository: ClassSessionRepository,
    private readonly attendancesService: AttendancesService,
  ) {}

  private toResponseDto(
    data: Record<string, unknown>,
  ): ResponseClassSessionDto {
    const raw = data as {
      course?: {
        instructor?: {
          id: string;
          profile: { fullName: string | null } | null;
        };
      };
      attendances?: { id: string }[];
      _count?: { attendances?: number };
    };
    const transformed = {
      ...data,
      instructor: raw.course?.instructor
        ? {
            userId: raw.course.instructor.id,
            profile: raw.course.instructor.profile,
          }
        : null,
      verifiedAttendanceCount: raw.attendances?.length,
      totalAttendanceCount: raw._count?.attendances,
    };
    return plainToInstance(ResponseClassSessionDto, transformed, {
      excludeExtraneousValues: true,
    });
  }

  async create(dto: CreateClassSessionDto) {
    const result = await this.classSessionRepository.create(dto);
    return this.toResponseDto(result as unknown as Record<string, unknown>);
  }

  private buildOrderBy(
    query: ClassSessionQueryDto,
  ): Prisma.ClassSessionOrderByWithRelationInput | undefined {
    if (!query.sortBy) return undefined;
    const dir = query.sort ?? 'asc';
    switch (query.sortBy) {
      case ClassSessionSortBy.title:
        return { title: dir };
      case ClassSessionSortBy.sessionDate:
        return { sessionDate: dir };
      case ClassSessionSortBy.courseName:
        return { course: { name: dir } };
      case ClassSessionSortBy.instructorName:
        return { course: { instructor: { profile: { fullName: dir } } } };
    }
  }

  async findAll(
    query: ClassSessionQueryDto,
    user: JwtPayload,
  ): Promise<PaginatedResponse<ResponseClassSessionDto>> {
    const params = paginationParams(query);
    const userId = user.role === UserRole.student ? user.sub : undefined;
    const orderBy = this.buildOrderBy(query);
    const search = query.search || undefined;
    const status = query.status || undefined;
    const { data, total } = await this.classSessionRepository.findAll(
      params,
      userId,
      orderBy,
      search,
      status,
    );
    return paginatedResponse(
      data.map((item) =>
        this.toResponseDto(item as unknown as Record<string, unknown>),
      ),
      total,
      params,
    );
  }

  async findOne(id: string): Promise<ResponseClassSessionDto> {
    const result = await this.classSessionRepository.findOne(id);
    return this.toResponseDto(
      ensureFound(result, `Class session ${id} not found`) as unknown as Record<
        string,
        unknown
      >,
    );
  }

  async update(id: string, dto: UpdateClassSessionDto) {
    const updated = await this.classSessionRepository.update(id, dto);

    if (dto.status === SessionStatus.ongoing) {
      await this.attendancesService.generateForSession(id);
    }

    return this.toResponseDto(updated as unknown as Record<string, unknown>);
  }

  async findAllForProgram(
    programId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponse<ResponseClassSessionDto>> {
    const params = paginationParams(query);
    const { data, total } = await this.classSessionRepository.findAllForProgram(
      programId,
      params,
    );
    return paginatedResponse(
      data.map((item) =>
        this.toResponseDto(item as unknown as Record<string, unknown>),
      ),
      total,
      params,
    );
  }

  remove(id: string) {
    return this.classSessionRepository.remove(id);
  }
}
