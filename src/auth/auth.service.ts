import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../modules/users/users.service';
import { PrismaService } from '../database/prisma.service';
import { RefreshDto } from './dto/refresh.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

const BCRYPT_COST = 12;
// Pre-computed bcrypt hash of a random string. Used as a dummy compare target
// to keep validateUser timing constant when the email does not exist.
const DUMMY_HASH =
  '$2b$12$abcdefghijklmnopqrstuuMOH3a9V14HZ12K8mZ0jJZqJ8a3hLPp.O';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    // Always run bcrypt to avoid leaking which emails are registered via
    // timing differences. Compare against a dummy hash when user missing.
    const hashToCompare = user?.passwordHash ?? DUMMY_HASH;
    const passwordMatch = await bcrypt.compare(password, hashToCompare);

    if (!user || user.status !== 'active' || !user.passwordHash) return null;
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

    await this.purgeRefreshToken(refreshToken, payload.exp);
    return { message: 'Logged out successfully' };
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string; exp: number };
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Reject if this refresh token was already purged (logged out or rotated).
    const purged = await this.prismaService.tokenPurge.findUnique({
      where: { token: refreshToken },
    });
    if (purged) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    const user = await this.usersService.findOne(payload.sub);
    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Refresh-token rotation: purge old, issue both new tokens.
    await this.purgeRefreshToken(refreshToken, payload.exp);
    return this.issueTokens(user.id, user.email, user.role);
  }

  async setPassword(dto: SetPasswordDto) {
    const user = await this.usersService.findByInviteToken(dto.inviteToken);

    if (!user) throw new BadRequestException('Invalid invite token');
    if (user.status !== 'invited')
      throw new BadRequestException('User is not in invited state');
    if (!user.inviteTokenExpiresAt || user.inviteTokenExpiresAt < new Date()) {
      throw new BadRequestException('Invite token has expired');
    }

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_COST);
    await this.usersService.activateUser(user.id, hashedPassword);

    return { message: 'Password set successfully. You can now log in.' };
  }

  async forgotPassword(email: string) {
    // Always return the same shape, regardless of whether the email exists or
    // the user is in a state that allows reset. This avoids account enumeration.
    const genericResponse = {
      message:
        'If an account exists for this email, a reset link has been sent.',
    };

    const user = await this.usersService.findByEmail(email);
    if (!user || user.status !== 'active') return genericResponse;

    const resetToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.usersService.setResetToken(user.id, resetToken, expiresAt);

    // TODO: hand off to email service. Never include the token in the API
    // response — it must reach the user only via their verified email.
    this.logger.log(
      `Password reset requested for user ${user.id}. Token would be emailed.`,
    );

    return genericResponse;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersService.findByResetToken(dto.resetToken);
    if (!user) throw new BadRequestException('Invalid reset token');
    if (user.status !== 'active')
      throw new BadRequestException('User account is not active');
    if (!user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_COST);
    await this.usersService.resetUserPassword(user.id, hashedPassword);

    return { message: 'Password reset successfully.' };
  }

  private async purgeRefreshToken(token: string, exp: number) {
    await this.prismaService.tokenPurge.upsert({
      where: { token },
      update: {},
      create: { token, expiresAt: new Date(exp * 1000) },
    });
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

  // Kept for backward compatibility with controller signature that still
  // accepts a RefreshDto body.
  refreshFromDto(dto: RefreshDto) {
    return this.refresh(dto.refreshToken);
  }
}
