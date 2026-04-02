import { Injectable } from '@nestjs/common';
import { CreateClassSessionDto } from './dto/create-class-session.dto';
import { UpdateClassSessionDto } from './dto/update-class-session.dto';
import { ClassSessionRepository } from './class-sessions.repository';

@Injectable()
export class ClassSessionsService {
  constructor(
    private readonly classSessionRepository: ClassSessionRepository,
  ) {}

  create(dto: CreateClassSessionDto) {
    return this.classSessionRepository.create(dto);
  }

  findAll() {
    return this.classSessionRepository.findAll();
  }

  findOne(id: number) {
    return this.classSessionRepository.findOne(id);
  }

  update(id: number, dto: UpdateClassSessionDto) {
    return this.classSessionRepository.update(id, dto);
  }

  remove(id: number) {
    return this.classSessionRepository.remove(id);
  }
}
