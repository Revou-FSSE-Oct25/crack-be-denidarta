import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export enum CourseSortBy {
  name = 'name',
  createdAt = 'createdAt',
  startedAt = 'startedAt',
  endedAt = 'endedAt',
  instructorName = 'instructorName',
  programName = 'programName',
}

export enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}

export class CourseQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(CourseSortBy)
  sortBy?: CourseSortBy;

  @IsOptional()
  @IsEnum(SortOrder)
  sort?: SortOrder = SortOrder.asc;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  programId?: string;
}
