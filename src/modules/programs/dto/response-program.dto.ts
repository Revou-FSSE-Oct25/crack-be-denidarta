import { Expose, Type } from 'class-transformer';

class InstructorProfileDto {
  @Expose() fullName: string | null;
}

class InstructorDto {
  @Expose() userId: string;
  @Expose() @Type(() => InstructorProfileDto) profile: InstructorProfileDto;
}

class CourseSummaryDto {
  @Expose() courseId: string;
  @Expose() courseTitle: string;
  @Expose() @Type(() => InstructorDto) instructor: InstructorDto;
}

class StudentDto {
  @Expose() userId: string;
  @Expose() fullName: string | null;
}

class CreatorDto {
  @Expose() userId: string;
  @Expose() username: string;
  @Expose() fullName: string | null;
}

class HeadOfProgramDto {
  @Expose() userId: string;
  @Expose() fullName: string | null;
}

export class ResponseProgramDto {
  @Expose() programId: string;
  @Expose() name: string;
  @Expose() createdAt: Date;
  @Expose()
  @Type(() => CreatorDto)
  createdBy: CreatorDto;

  @Expose()
  @Type(() => HeadOfProgramDto)
  headOfProgram: HeadOfProgramDto | null;

  @Expose()
  @Type(() => CourseSummaryDto)
  courses: CourseSummaryDto[];

  @Expose()
  @Type(() => StudentDto)
  students: StudentDto[];
}
