import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class GradingCriteriaItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  label: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  points: number;
}
