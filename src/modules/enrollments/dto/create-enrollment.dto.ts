import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { EnrollmentStatus } from '@prisma/client';

export class CreateEnrollmentDto {
  @IsUUID('4')
  courseId: string;

  @IsUUID('4')
  userId: string;

  @IsOptional()
  @IsEnum(EnrollmentStatus)
  status?: EnrollmentStatus;
}
