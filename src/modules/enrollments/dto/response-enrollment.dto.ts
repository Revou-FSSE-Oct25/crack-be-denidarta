import { Expose, Type } from 'class-transformer';

class EnrolledUserDto {
  @Expose() id: string;
  @Expose() username: string;
}

class EnrolledProgramDto {
  @Expose() id: string;
  @Expose() name: string;
  @Expose()
  @Type(() => HeadOfProgramDto)
  headOfProgram: HeadOfProgramDto | null;
  @Expose()
  @Type(() => CourseSummaryDto)
  courses: CourseSummaryDto[];
}

class CourseSummaryDto {
  @Expose() courseId: string;
  @Expose() courseTitle: string;
  @Expose() startedAt: Date | null;
  @Expose() endedAt: Date | null;
  @Expose() status: string;
  @Expose()
  @Type(() => EnrolledInstructorDto)
  instructor: EnrolledInstructorDto | null;
}

class EnrolledInstructorDto {
  @Expose() userId: string;
  @Expose() fullName: string | null;
}

class HeadOfProgramDto {
  @Expose() userId: string;
  @Expose() fullName: string | null;
}

export class ResponseEnrollmentDto {
  @Expose() id: string;
  @Expose() userId: string;
  @Expose() programId: string;
  @Expose() status: string;
  @Expose() createdAt: Date;
  @Expose() @Type(() => EnrolledUserDto) user: EnrolledUserDto | null;
  @Expose() @Type(() => EnrolledProgramDto) program: EnrolledProgramDto | null;
}
