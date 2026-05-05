import { Injectable } from '@nestjs/common';
import { ProgramRepository } from './programs.repository';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';

@Injectable()
export class ProgramsService {
  constructor(private readonly programRepository: ProgramRepository) {}

  create(dto: CreateProgramDto) {
    return this.programRepository.create(dto);
  }

  findAllPaginated(skip: number, take: number) {
    return this.programRepository.findAllPaginated(skip, take);
  }

  findOne(id: string) {
    return this.programRepository.findOne(id);
  }

  update(id: string, dto: UpdateProgramDto) {
    return this.programRepository.update(id, dto);
  }

  remove(id: string) {
    return this.programRepository.remove(id);
  }
}
