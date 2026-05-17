import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export enum ClassSessionSortBy {
  title = 'title',
  sessionDate = 'sessionDate',
  courseName = 'courseName',
  instructorName = 'instructorName',
}

export enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}

export class ClassSessionQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(ClassSessionSortBy)
  sortBy?: ClassSessionSortBy;

  @IsOptional()
  @IsEnum(SortOrder)
  sort?: SortOrder = SortOrder.asc;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
