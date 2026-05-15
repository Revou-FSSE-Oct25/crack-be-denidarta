import { Expose, Type } from 'class-transformer';

class EnrolledUserDto {
  @Expose() id: string;
  @Expose() username: string;
}

class EnrolledProgramDto {
  @Expose() id: string;
  @Expose() name: string;
}

export class ResponseEnrollmentDto {
  @Expose() id: string;
  @Expose() userId: string;
  @Expose() programId: string;
  @Expose() status: string;
  @Expose() enrolledAt: Date;
  @Expose() @Type(() => EnrolledUserDto) user: EnrolledUserDto | null;
  @Expose() @Type(() => EnrolledProgramDto) program: EnrolledProgramDto | null;
}
