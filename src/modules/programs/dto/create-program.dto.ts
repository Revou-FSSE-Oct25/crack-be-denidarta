import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateProgramDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsUUID('4')
  createdBy: string;
}
