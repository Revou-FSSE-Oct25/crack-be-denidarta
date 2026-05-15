import { Expose, Type } from 'class-transformer';
import { CourseStatus } from '@prisma/client';

class InstructorProfileDto {
  @Expose() fullName: string | null;
}

class InstructorDto {
  @Expose() userId: string;
  @Expose() @Type(() => InstructorProfileDto) profile: InstructorProfileDto;
}

class ProgramSummaryDto {
  @Expose() name: string;
}

export class ResponseCourseDto {
  @Expose() id: string;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;
  @Expose() programId: string | null;
  @Expose() instructorId: string;
  @Expose() name: string;
  @Expose() description: string | null;
  @Expose() startedAt: Date | null;
  @Expose() endedAt: Date | null;
  @Expose() status: CourseStatus;

  @Expose()
  @Type(() => InstructorDto)
  instructor: InstructorDto;

  @Expose()
  @Type(() => ProgramSummaryDto)
  program: ProgramSummaryDto | null;
}
