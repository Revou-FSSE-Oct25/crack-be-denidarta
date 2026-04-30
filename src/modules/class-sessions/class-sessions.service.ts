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

  findOne(id: string) {
    return this.classSessionRepository.findOne(id);
  }

  update(id: string, dto: UpdateClassSessionDto) {
    return this.classSessionRepository.update(id, dto);
  }

  remove(id: string) {
    return this.classSessionRepository.remove(id);
  }
}
