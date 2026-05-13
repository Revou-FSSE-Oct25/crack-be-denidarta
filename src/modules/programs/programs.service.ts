import { Injectable } from '@nestjs/common';
import { ProgramRepository } from './programs.repository';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';

@Injectable()
export class ProgramsService {
  constructor(private readonly programRepository: ProgramRepository) {}

  private mapProgram<
    T extends {
      programs: {
        userId: string;
        user: { profile: { fullName: string | null } | null } | null;
      }[];
    },
  >(program: T) {
    const { programs, ...rest } = program;
    return {
      ...rest,
      enrolledStudents: programs.map((e) => ({
        userId: e.userId,
        fullName: e.user?.profile?.fullName ?? null,
      })),
    };
  }

  async create(dto: CreateProgramDto) {
    const result = await this.programRepository.create(dto);
    return this.mapProgram(result);
  }

  async findAllPaginated(skip: number, take: number) {
    const [data, total] = await this.programRepository.findAllPaginated(
      skip,
      take,
    );
    return [data.map((program) => this.mapProgram(program)), total] as const;
  }

  async findOne(id: string) {
    const result = await this.programRepository.findOne(id);
    return result ? this.mapProgram(result) : null;
  }

  async update(id: string, dto: UpdateProgramDto) {
    const result = await this.programRepository.update(id, dto);
    return this.mapProgram(result);
  }

  remove(id: string) {
    return this.programRepository.remove(id);
  }
}
