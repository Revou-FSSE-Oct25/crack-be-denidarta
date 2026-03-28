import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../modules/users/users.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { SetPasswordDto } from './dto/set-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password!);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(user.id, user.email, user.role);
  }

  async refresh(dto: RefreshDto) {
    let payload: { sub: number };
    try {
      payload = await this.jwtService.verifyAsync(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findOne(payload.sub);
    if (!user || user.status !== 'ACTIVE') {
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

  async generateInvite(userId: number) {
    const user = await this.usersService.findOne(userId);
    if (!user) throw new BadRequestException('User not found');

    const inviteToken = crypto.randomUUID();
    const inviteTokenExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    await this.usersService.setInviteToken(userId, inviteToken, inviteTokenExpiresAt);

    return { inviteToken, expiresAt: inviteTokenExpiresAt };
  }

  async setPassword(dto: SetPasswordDto) {
    const user = await this.usersService.findByInviteToken(dto.inviteToken);

    if (!user) throw new BadRequestException('Invalid invite token');
    if (user.status !== 'INVITED') throw new BadRequestException('User is not in invited state');
    if (!user.inviteTokenExpiresAt || user.inviteTokenExpiresAt < new Date()) {
      throw new BadRequestException('Invite token has expired');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    await this.usersService.activateUser(user.id, hashedPassword);

    return { message: 'Password set successfully. You can now log in.' };
  }

  private async issueTokens(userId: number, email: string, role: string) {
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
