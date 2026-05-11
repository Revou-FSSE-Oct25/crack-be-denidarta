import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { SessionStatus } from '@prisma/client';
import { CreateClassSessionDto } from './create-class-session.dto';

export class UpdateClassSessionDto extends PartialType(CreateClassSessionDto) {
  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;
}
