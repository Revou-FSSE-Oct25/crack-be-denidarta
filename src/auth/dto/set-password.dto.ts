import { IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';

export class SetPasswordDto {
  @IsUUID()
  @IsNotEmpty()
  inviteToken: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
