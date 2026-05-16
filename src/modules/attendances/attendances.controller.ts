import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { AttendancesService } from './attendances.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { VerifyAttendanceDto } from './dto/verify-attendance.dto';
import { singleResponse } from '../../common/utils/pagination.util';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Controller('attendances')
export class AttendancesController {
  constructor(private readonly attendancesService: AttendancesService) {}

  @Post()
  @Roles(UserRole.admin)
  async create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return singleResponse(
      await this.attendancesService.create(createAttendanceDto),
    );
  }

  @Get()
  @Roles(UserRole.student, UserRole.instructor, UserRole.admin)
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query() query: PaginationQueryDto,
    @Query('studentId') studentId?: string,
  ) {
    return this.attendancesService.findAll(user, { ...query, studentId });
  }

  @Get('session/:sessionId')
  @Roles(UserRole.instructor, UserRole.admin)
  async findBySession(@Param('sessionId') sessionId: string) {
    return singleResponse(
      await this.attendancesService.findBySession(sessionId),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return singleResponse(await this.attendancesService.findOne(id));
  }

  @Patch(':id/check-in')
  async studentCheckIn(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return singleResponse(
      await this.attendancesService.studentCheckIn(id, user.sub),
    );
  }

  @Patch(':id/verify')
  @Roles(UserRole.instructor, UserRole.admin)
  async verifyAttendance(
    @Param('id') id: string,
    @Body() dto: VerifyAttendanceDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return singleResponse(
      await this.attendancesService.verifyAttendance(id, user.sub, dto),
    );
  }

  @Delete(':id')
  @Roles(UserRole.admin)
  async remove(@Param('id') id: string) {
    return singleResponse(await this.attendancesService.remove(id));
  }
}
