import { IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsUUID()
  @IsNotEmpty()
  resetToken: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
