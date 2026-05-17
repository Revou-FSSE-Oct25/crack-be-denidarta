import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ProgramRepository, ProgramResult } from './programs.repository';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { ResponseProgramDto } from './dto/response-program.dto';
import { ensureFound } from '../../common/utils/ensure-found.util';
import {
  paginationParams,
  paginatedResponse,
  PaginatedResponse,
} from '../../common/utils/pagination.util';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class ProgramsService {
  constructor(private readonly programRepository: ProgramRepository) {}

  private toResponseDto(program: ProgramResult): ResponseProgramDto {
    return plainToInstance(
      ResponseProgramDto,
      {
        programId: program.id,
        name: program.name,
        createdAt: program.createdAt,
        createdBy: {
          userId: program.creator.id,
          username: program.creator.username,
          fullName: program.creator.profile?.fullName ?? null,
        },
        headOfProgram: program.headOfProgram
          ? {
              userId: program.headOfProgram.id,
              fullName: program.headOfProgram.profile?.fullName ?? null,
            }
          : null,
        students: program.programs.map((enrollment) => ({
          userId: enrollment.userId,
          fullName: enrollment.user?.profile?.fullName ?? null,
          enrolledAt: enrollment.createdAt,
        })),
        courses: program.courses.map((course) => ({
          courseId: course.id,
          courseTitle: course.name,
          instructor: {
            userId: course.instructor.id,
            profile: {
              fullName: course.instructor.profile?.fullName ?? null,
            },
          },
        })),
      },
      { excludeExtraneousValues: true },
    );
  }

  async create(dto: CreateProgramDto) {
    const result = await this.programRepository.create(dto);
    return this.toResponseDto(result);
  }

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponse<ResponseProgramDto>> {
    const params = paginationParams(query);
    const [data, total] = await this.programRepository.findAllPaginated(
      params.skip,
      params.take,
    );
    return paginatedResponse(
      data.map((p) => this.toResponseDto(p)),
      total,
      params,
    );
  }

  async findOne(id: string): Promise<ResponseProgramDto> {
    const result = await this.programRepository.findOne(id);
    return this.toResponseDto(ensureFound(result, `Program ${id} not found`));
  }

  async update(id: string, dto: UpdateProgramDto) {
    const result = await this.programRepository.update(id, dto);
    return this.toResponseDto(result);
  }

  remove(id: string) {
    return this.programRepository.remove(id);
  }
}
