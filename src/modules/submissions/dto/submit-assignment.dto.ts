import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SubmitAssignmentDto {
  @ApiProperty({
    description: 'The text content of the submission',
    required: false,
  })
  @IsOptional()
  @IsString()
  submissionText?: string;

  @ApiProperty({
    description: 'The URL of the submitted file',
    required: false,
  })
  @IsOptional()
  @IsString()
  fileUrl?: string;
}
