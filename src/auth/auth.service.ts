import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../modules/users/users.service';
import { PrismaService } from '../database/prisma.service';
import { RefreshDto } from './dto/refresh.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || user.status !== 'active') return null;

    const passwordMatch = await bcrypt.compare(password, user.passwordHash!);
    if (!passwordMatch) return null;

    const { passwordHash: _passwordHash, ...result } = user;
    return result;
  }

  async login(user: { id: string; email: string; role: string }) {
    return this.issueTokens(user.id, user.email, user.role);
  }

  async logout(refreshToken: string) {
    let payload: { sub: string; exp: number };

    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.prismaService.tokenPurge.upsert({
      where: { token: refreshToken },
      update: {},
      create: {
        token: refreshToken,
        expiresAt: new Date(payload.exp * 1000),
      },
    });

    return { message: 'Logged out successfully' };
  }

  async refresh(dto: RefreshDto) {
    let payload: { sub: string };
    try {
      payload = await this.jwtService.verifyAsync(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findOne(payload.sub);
    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('User not found or inactive');
    }

    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, role: user.role },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ?? '15m') as never,
      },
    );

    return { accessToken };
  }

  async setPassword(dto: SetPasswordDto) {
    const user = await this.usersService.findByInviteToken(dto.inviteToken);

    if (!user) throw new BadRequestException('Invalid invite token');
    if (user.status !== 'invited')
      throw new BadRequestException('User is not in invited state');
    if (!user.inviteTokenExpiresAt || user.inviteTokenExpiresAt < new Date()) {
      throw new BadRequestException('Invite token has expired');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    await this.usersService.activateUser(user.id, hashedPassword);

    return { message: 'Password set successfully. You can now log in.' };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');
    if (user.status !== 'active')
      throw new BadRequestException('User account is not active');

    const resetToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.usersService.setResetToken(user.id, resetToken, expiresAt);

    return { resetToken, expiresAt };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersService.findByInviteToken(dto.resetToken);
    if (!user) throw new BadRequestException('Invalid reset token');
    if (user.status !== 'active')
      throw new BadRequestException('User account is not active');
    if (!user.inviteTokenExpiresAt || user.inviteTokenExpiresAt < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    await this.usersService.activateUser(user.id, hashedPassword);

    return { message: 'Password reset successfully.' };
  }

  private async issueTokens(userId: string, email: string, role: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role },
        {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ?? '15m') as never,
        },
      ),
      this.jwtService.signAsync(
        { sub: userId },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as never,
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }
}
