import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<{ user?: JwtPayload }>();
    if (!request.user) {
      throw new UnauthorizedException('You are not authenticated');
    }
    return request.user;
  },
);
