import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { AttendancesService } from './attendances.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { VerifyAttendanceDto } from './dto/verify-attendance.dto';

@Controller('attendances')
export class AttendancesController {
  constructor(private readonly attendancesService: AttendancesService) {}

  /**
   * Manual attendance creation — admin only.
   * Normal flow: records are auto-generated when session goes "ongoing".
   */
  @Post()
  @Roles(UserRole.admin)
  create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendancesService.create(createAttendanceDto);
  }

  /** List all attendance records. Students only see their own, scoped to enrolled programs/courses. */
  @Get()
  @Roles(UserRole.student, UserRole.instructor, UserRole.admin)
  findAll(@CurrentUser() user: JwtPayload) {
    return this.attendancesService.findAll(user);
  }

  /** Get a single attendance record — any authenticated user. */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attendancesService.findOne(id);
  }

  /**
   * Student marks their own attendance as "present".
   * The service validates that the attendance record belongs to the caller.
   */
  @Patch(':id/check-in')
  studentCheckIn(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.attendancesService.studentCheckIn(id, user.sub);
  }

  /**
   * Admin / instructor verifies an attendance record.
   * Can also override the student's status (e.g., mark as absent
   * if the student falsely claimed to be present).
   */
  @Patch(':id/verify')
  @Roles(UserRole.instructor, UserRole.admin)
  verifyAttendance(
    @Param('id') id: string,
    @Body() dto: VerifyAttendanceDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.attendancesService.verifyAttendance(id, user.sub, dto);
  }

  /** Hard-delete an attendance record — admin only. */
  @Delete(':id')
  @Roles(UserRole.admin)
  remove(@Param('id') id: string) {
    return this.attendancesService.remove(id);
  }
}
