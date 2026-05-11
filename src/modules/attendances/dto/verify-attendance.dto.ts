import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { AttendanceStatus } from '@prisma/client';

export class VerifyAttendanceDto {
  @IsBoolean()
  isVerified: boolean;

  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;
}
