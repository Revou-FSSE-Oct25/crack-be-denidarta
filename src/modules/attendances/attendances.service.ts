import { Injectable } from '@nestjs/common';
import { AttendanceRepository } from './attendances.repository';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendancesService {
  constructor(private readonly attendanceRepository: AttendanceRepository) {}

  create(dto: CreateAttendanceDto) {
    return this.attendanceRepository.create(dto);
  }

  findAll() {
    return this.attendanceRepository.findAll();
  }

  findOne(id: string) {
    return this.attendanceRepository.findOne(id);
  }

  update(id: string, dto: UpdateAttendanceDto) {
    return this.attendanceRepository.update(id, dto);
  }

  remove(id: string) {
    return this.attendanceRepository.remove(id);
  }
}
