import {
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class CreateProgramDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsUUID('4')
  createdBy: string;

  @IsUUID('4')
  @IsOptional()
  headOfProgramId?: string;
}
