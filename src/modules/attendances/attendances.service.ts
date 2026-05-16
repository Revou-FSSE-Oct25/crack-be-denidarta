import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { AttendanceRepository } from './attendances.repository';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { VerifyAttendanceDto } from './dto/verify-attendance.dto';
import { ResponseAttendanceDto } from './dto/response-attendance.dto';
import { ensureFound } from '../../common/utils/ensure-found.util';
import {
  paginationParams,
  paginatedResponse,
  PaginatedResponse,
} from '../../common/utils/pagination.util';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class AttendancesService {
  constructor(private readonly attendanceRepository: AttendanceRepository) {}

  private toDto(data: Record<string, unknown>): ResponseAttendanceDto {
    return plainToInstance(ResponseAttendanceDto, data, {
      excludeExtraneousValues: true,
    });
  }

  async create(dto: CreateAttendanceDto): Promise<ResponseAttendanceDto> {
    const result = await this.attendanceRepository.create(dto);
    return this.toDto(result);
  }

  async findAll(
    user: JwtPayload,
    query: PaginationQueryDto & { studentId?: string },
  ): Promise<PaginatedResponse<ResponseAttendanceDto>> {
    const params = paginationParams(query);
    const [data, total] = await this.attendanceRepository.findAllPaginated(
      user,
      params.skip,
      params.take,
      query.studentId,
    );
    return paginatedResponse(
      data.map((a) => this.toDto(a as unknown as Record<string, unknown>)),
      total,
      params,
    );
  }

  async findOne(id: string): Promise<ResponseAttendanceDto> {
    const result = await this.attendanceRepository.findOne(id);
    return this.toDto(ensureFound(result, `Attendance ${id} not found`));
  }

  findBySession(classSessionId: string) {
    return this.attendanceRepository.findBySession(classSessionId);
  }

  async update(
    id: string,
    dto: UpdateAttendanceDto,
  ): Promise<ResponseAttendanceDto> {
    const result = await this.attendanceRepository.update(id, dto);
    return this.toDto(result);
  }

  remove(id: string) {
    return this.attendanceRepository.remove(id);
  }

  generateForSession(classSessionId: string) {
    return this.attendanceRepository.generateForSession(classSessionId);
  }

  async studentCheckIn(
    attendanceId: string,
    userId: string,
  ): Promise<ResponseAttendanceDto> {
    const result = await this.attendanceRepository.studentCheckIn(
      attendanceId,
      userId,
    );
    return this.toDto(result);
  }

  async verifyAttendance(
    attendanceId: string,
    verifierId: string,
    dto: VerifyAttendanceDto,
  ): Promise<ResponseAttendanceDto> {
    const result = await this.attendanceRepository.verifyAttendance(
      attendanceId,
      verifierId,
      dto,
    );
    return this.toDto(result);
  }
}
