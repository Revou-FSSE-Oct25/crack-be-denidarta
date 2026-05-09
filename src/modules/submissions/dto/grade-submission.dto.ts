import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CriteriaScoreItemDto } from './criteria-score-item.dto';

export class GradeSubmissionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CriteriaScoreItemDto)
  criteriaScores: CriteriaScoreItemDto[];

  @IsOptional()
  @IsString()
  feedback?: string;
}
