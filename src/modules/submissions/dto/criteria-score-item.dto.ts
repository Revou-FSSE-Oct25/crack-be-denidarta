import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CriteriaScoreItemDto {
  /** Zero-based index referencing the position in `Assignment.gradingCriteria`. */
  @IsInt()
  @Min(0)
  criteriaIndex: number;

  @IsBoolean()
  checked: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
