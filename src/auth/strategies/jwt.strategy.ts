import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';

const ACCESS_COOKIE = 'access_token';

function fromCookie(req: Request): string | null {
  const cookies = (req?.cookies ?? {}) as Record<string, string | undefined>;
  return cookies[ACCESS_COOKIE] ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Accept the JWT from either the HttpOnly access cookie (web clients)
      // or the Authorization header (mobile, postman, server-to-server).
      jwtFromRequest: ExtractJwt.fromExtractors([
        fromCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET!,
    });
  }

  validate(payload: { sub: number; email: string; role: string }) {
    return { sub: payload.sub, email: payload.email, role: payload.role };
  }
}
