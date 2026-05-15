import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { AssignmentStatus, SubmissionStatus } from '@prisma/client';

export class SubmissionListItem {
  @Expose()
  @ApiProperty({ description: 'The ID of the assignment submission' })
  @IsString()
  submissionId: string;

  @Expose()
  @ApiProperty({ description: 'The ID of the student' })
  @IsString()
  userId: string;

  @Expose()
  @ApiProperty({ description: 'Full name of the student', required: false })
  @IsOptional()
  @IsString()
  fullName?: string | null;

  @Expose()
  @ApiProperty({ description: 'Submission status', enum: SubmissionStatus })
  @IsEnum(SubmissionStatus)
  status: SubmissionStatus;

  @Expose()
  @ApiProperty({
    description: 'Date when the student submitted',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateSubmitted?: Date | null;

  @Expose()
  @ApiProperty({ description: 'Student submission text', required: false })
  @IsOptional()
  @IsString()
  submissionText?: string | null;

  @Expose()
  @ApiProperty({ description: 'Student submission file URL', required: false })
  @IsOptional()
  @IsString()
  fileUrl?: string | null;

  @Expose()
  @ApiProperty({ description: 'Grade awarded', required: false })
  @IsOptional()
  grade?: number | null;

  @Expose()
  @ApiProperty({ description: 'Whether the student passed', required: false })
  @IsOptional()
  passed?: boolean | null;

  @Expose()
  @ApiProperty({ description: 'Instructor feedback', required: false })
  @IsOptional()
  @IsString()
  feedback?: string | null;

  @Expose()
  @ApiProperty({ description: 'Date when graded', required: false })
  @IsOptional()
  gradedAt?: Date | null;
}

export class ResponseAssignmentDto {
  @Expose()
  @ApiProperty({ description: 'The unique identifier of the assignment' })
  @IsString()
  id: string;

  @Expose()
  @ApiProperty({
    description: 'The date and time when the assignment was created',
  })
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  @ApiProperty({
    description: 'The date and time when the assignment was last updated',
  })
  @IsDate()
  @Type(() => Date)
  updatedAt: Date;

  @Expose()
  @ApiProperty({
    description: 'The ID of the course this assignment belongs to',
  })
  @IsString()
  courseId: string;

  @Expose()
  @ApiProperty({
    description: 'The name of the course this assignment belongs to',
  })
  @IsString()
  courseName: string;

  @Expose()
  @ApiProperty({ description: 'The title of the assignment' })
  @IsString()
  title: string;

  @Expose()
  @ApiProperty({
    description: 'A detailed description of the assignment',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @Expose()
  @ApiProperty({ description: 'The due date and time for the assignment' })
  @IsDate()
  @Type(() => Date)
  dueDate: Date;

  @Expose()
  @ApiProperty({
    description: 'The minimum points required to pass the assignment',
  })
  @IsNumber()
  minPoints: number;

  @Expose()
  @ApiProperty({
    description: 'The current status of the assignment',
    enum: AssignmentStatus,
  })
  @IsEnum(AssignmentStatus)
  status: AssignmentStatus;

  @Expose()
  @ApiProperty({
    description: 'The number of students who have submitted the assignment',
  })
  @IsNumber()
  submitted: number;

  @Expose()
  @ApiProperty({
    description: 'The total number of students expected to submit',
  })
  @IsNumber()
  toSubmit: number;

  @Expose()
  @ApiProperty({
    description: 'Dynamic grading criteria checklist defined by the instructor',
    required: false,
  })
  @IsOptional()
  gradingCriteria?: any;

  @Expose()
  @ApiProperty({
    description: 'List of submissions for this assignment',
    type: [SubmissionListItem],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmissionListItem)
  submissions: SubmissionListItem[];
}
