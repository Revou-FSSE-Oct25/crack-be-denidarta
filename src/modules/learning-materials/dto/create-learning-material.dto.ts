import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { MaterialType } from '@prisma/client';

export class CreateLearningMaterialDto {
  @IsUUID('4')
  courseId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  fileUrl?: string;

  @IsEnum(MaterialType)
  materialType: MaterialType;

  @IsOptional()
  @IsNumber()
  orderIndex?: number;
}
