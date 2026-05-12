import { Injectable } from '@nestjs/common';
import { SessionStatus, UserRole } from '@prisma/client';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import {
  PaginationQuery,
  paginationParams,
} from '../../common/utils/pagination.util';
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

  findAll(query: PaginationQuery, user: JwtPayload) {
    const params = paginationParams(query);
    const userId = user.role === UserRole.student ? user.sub : undefined;
    return this.classSessionRepository.findAll(params, userId);
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
