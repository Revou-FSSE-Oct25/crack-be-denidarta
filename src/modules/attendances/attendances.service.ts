import { Injectable } from '@nestjs/common';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { AttendanceRepository } from './attendances.repository';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { VerifyAttendanceDto } from './dto/verify-attendance.dto';

@Injectable()
export class AttendancesService {
  constructor(private readonly attendanceRepository: AttendanceRepository) {}

  create(dto: CreateAttendanceDto) {
    return this.attendanceRepository.create(dto);
  }

  findAll(user: JwtPayload) {
    return this.attendanceRepository.findAll(user);
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

  /**
   * Triggered automatically when a ClassSession transitions to "ongoing".
   * Creates unverified attendance records for every enrolled student.
   */
  generateForSession(classSessionId: string) {
    return this.attendanceRepository.generateForSession(classSessionId);
  }

  /**
   * Student marks their own attendance as "present".
   */
  studentCheckIn(attendanceId: string, userId: string) {
    return this.attendanceRepository.studentCheckIn(attendanceId, userId);
  }

  /**
   * Admin / instructor verifies an attendance record.
   */
  verifyAttendance(
    attendanceId: string,
    verifierId: string,
    dto: VerifyAttendanceDto,
  ) {
    return this.attendanceRepository.verifyAttendance(
      attendanceId,
      verifierId,
      dto,
    );
  }
}
