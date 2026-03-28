import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { Public } from '../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout() {
    return { message: 'Logged out successfully' };
  }

  @Post('invite/:userId')
  @HttpCode(HttpStatus.OK)
  generateInvite(@Param('userId', ParseIntPipe) userId: number) {
    return this.authService.generateInvite(userId);
  }

  @Public()
  @Post('set-password')
  @HttpCode(HttpStatus.OK)
  setPassword(@Body() dto: SetPasswordDto) {
    return this.authService.setPassword(dto);
  }
}
