import { Expose, Type } from 'class-transformer';

class AttendanceUserDto {
  @Expose() id: string;
  @Expose() username: string;
}

export class ResponseAttendanceDto {
  @Expose() id: string;
  @Expose() userId: string;
  @Expose() classSessionId: string;
  @Expose() status: string;
  @Expose() isVerified: boolean;
  @Expose() verifiedAt: Date | null;
  @Expose() verifiedBy: string | null;
  @Expose() createdAt: Date;
  @Expose() @Type(() => AttendanceUserDto) user: AttendanceUserDto | null;
}
