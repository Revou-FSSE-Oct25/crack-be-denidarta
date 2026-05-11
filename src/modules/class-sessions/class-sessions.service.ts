import { Injectable } from '@nestjs/common';
import { SessionStatus } from '@prisma/client';
import { AttendancesService } from '../attendances/attendances.service';
import { ClassSessionRepository } from './class-sessions.repository';
import { CreateClassSessionDto } from './dto/create-class-session.dto';
import { UpdateClassSessionDto } from './dto/update-class-session.dto';

@Injectable()
export class ClassSessionsService {
  constructor(
    private readonly classSessionRepository: ClassSessionRepository,
    private readonly attendancesService: AttendancesService,
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

    return updated;
  }

  remove(id: string) {
    return this.classSessionRepository.remove(id);
  }
}
