import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  IsArray,
} from 'class-validator';

import { MaterialType } from '@prisma/client';

export class CreateLearningMaterialDto {
  @IsUUID('4')
  uploadedBy: string;

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

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  courseIds?: string[];

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  programIds?: string[];
}
