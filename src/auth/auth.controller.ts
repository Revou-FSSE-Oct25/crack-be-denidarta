import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response, CookieOptions } from 'express';
import { AuthService } from './auth.service';
import { SetPasswordDto } from './dto/set-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/decorators/current-user.decorator';

const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';
const REFRESH_PATH = '/api/v1/auth';

const isProd = () => process.env.NODE_ENV === 'production';

function accessCookieOptions(): CookieOptions {
  // SameSite=Lax so the cookie is sent on top-level navigations (e.g. SSR
  // route protection) but blocked on cross-site sub-requests.
  return {
    httpOnly: true,
    secure: isProd(),
    sameSite: 'lax',
    path: '/',
    maxAge: 15 * 60 * 1000,
  };
}

function refreshCookieOptions(): CookieOptions {
  // SameSite=Strict on the long-lived refresh cookie. Scoped to /api/v1/auth
  // so it is never sent to any other endpoint.
  return {
    httpOnly: true,
    secure: isProd(),
    sameSite: 'strict',
    path: REFRESH_PATH,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
) {
  res.cookie(ACCESS_COOKIE, tokens.accessToken, accessCookieOptions());
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, refreshCookieOptions());
}

function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_COOKIE, { ...accessCookieOptions(), maxAge: 0 });
  res.clearCookie(REFRESH_COOKIE, { ...refreshCookieOptions(), maxAge: 0 });
}

function extractRefreshToken(req: Request, bodyToken?: string): string {
  const cookies = (req.cookies ?? {}) as Record<string, string | undefined>;
  const token = cookies[REFRESH_COOKIE] ?? bodyToken;
  if (!token) {
    throw new UnauthorizedException('Missing refresh token');
  }
  return token;
}

@Throttle({ short: { ttl: 10000, limit: 5 } })
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.login(
      req.user as { id: string; email: string; role: string },
    );
    setAuthCookies(res, tokens);
    // Access token is also returned in the body so non-cookie clients (mobile,
    // postman, tests) keep working. Web clients should ignore it and rely on
    // the HttpOnly cookie.
    return { accessToken: tokens.accessToken };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: { refreshToken?: string } = {},
  ) {
    const token = extractRefreshToken(req, body.refreshToken);
    const tokens = await this.authService.refresh(token);
    setAuthCookies(res, tokens);
    return { accessToken: tokens.accessToken };
  }

  @Get('me')
  me(@CurrentUser() user: JwtPayload) {
    return user;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: { refreshToken?: string } = {},
  ) {
    const token = extractRefreshToken(req, body.refreshToken);
    const result = await this.authService.logout(token);
    clearAuthCookies(res);
    return result;
  }

  @Public()
  @Post('set-password')
  @HttpCode(HttpStatus.OK)
  setPassword(@Body() dto: SetPasswordDto) {
    return this.authService.setPassword(dto);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
