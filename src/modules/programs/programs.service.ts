import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ProgramRepository, ProgramResult } from './programs.repository';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { ResponseProgramDto } from './dto/response-program.dto';

@Injectable()
export class ProgramsService {
  constructor(private readonly programRepository: ProgramRepository) {}

  private toResponseDto(program: ProgramResult): ResponseProgramDto {
    console.log('creator raw:', JSON.stringify(program.creator));
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

  async findAllPaginated(skip: number, take: number) {
    const [data, total] = await this.programRepository.findAllPaginated(
      skip,
      take,
    );
    return [data.map((program) => this.toResponseDto(program)), total] as const;
  }

  async findOne(id: string) {
    const result = await this.programRepository.findOne(id);
    return result ? this.toResponseDto(result) : null;
  }

  async update(id: string, dto: UpdateProgramDto) {
    const result = await this.programRepository.update(id, dto);
    return this.toResponseDto(result);
  }

  remove(id: string) {
    return this.programRepository.remove(id);
  }
}
