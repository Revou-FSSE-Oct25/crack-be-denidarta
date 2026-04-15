import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { EducationLevel, Gender } from '@prisma/client';

export class CreateProfileDto {
  // Personal info
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fullName?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  // Address
  @IsOptional()
  @IsString()
  @MaxLength(500)
  streetAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  province?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  district?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  subdistrict?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  timezone?: string;

  // Social & web presence
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  linkedinUrl?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  githubUrl?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  personalWebsite?: string;

  // Professional info
  @IsOptional()
  @IsString()
  shortBio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  currentOccupation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  company?: string;

  @IsOptional()
  @IsEnum(EducationLevel)
  highestEducation?: EducationLevel;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  fieldOfStudy?: string;
}
