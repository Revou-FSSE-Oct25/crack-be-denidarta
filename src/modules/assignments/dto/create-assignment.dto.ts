import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AssignmentStatus } from '@prisma/client';
import { GradingCriteriaItemDto } from './grading-criteria-item.dto';

export class CreateAssignmentDto {
  @IsUUID('4')
  courseId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  dueDate: string;

  @IsOptional()
  @IsNumber()
  maxPoints?: number;

  @IsOptional()
  @IsEnum(AssignmentStatus)
  status?: AssignmentStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GradingCriteriaItemDto)
  gradingCriteria?: GradingCriteriaItemDto[];
}
