import { PickType } from '@nestjs/mapped-types';
import { IsEnum } from 'class-validator';
import { EnrollmentStatus } from '@prisma/client';
import { CreateEnrollmentDto } from './create-enrollment.dto';

export class UpdateEnrollmentDto extends PickType(CreateEnrollmentDto, [
  'status',
] as const) {
  @IsEnum(EnrollmentStatus)
  status: EnrollmentStatus;
}
