import { Expose, Type } from 'class-transformer';
import { SessionStatus } from '@prisma/client';

class CourseSummaryDto {
  @Expose() id: string;
  @Expose() name: string;
}
class InstructorProfileDto {
  @Expose() fullName: string | null;
}

class InstructorDto {
  @Expose() userId: string;
  @Expose() @Type(() => InstructorProfileDto) profile: InstructorProfileDto;
}

export class ResponseClassSessionDto {
  @Expose() id: string;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;
  @Expose() courseId: string;
  @Expose() title: string;
  @Expose() sessionDate: Date;
  @Expose() startTime: Date;
  @Expose() endTime: Date;
  @Expose() location: string | null;
  @Expose() meetingUrl: string | null;
  @Expose() status: SessionStatus;

  @Expose()
  @Type(() => CourseSummaryDto)
  course: CourseSummaryDto;

  @Expose()
  @Type(() => InstructorDto)
  instructor: InstructorDto;

  @Expose() verifiedAttendanceCount?: number;
  @Expose() totalAttendanceCount?: number;
}
