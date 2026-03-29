import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { JwtPayload } from './types/jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request): string | null => {
          const token = req.cookies as Record<string, string | undefined>;
          return token?.accessToken ?? null;
        },]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET as string,
    });
  }

  validate(payload: JwtPayload): { sub: string; uid: string; name: string } {
    return {
      sub: payload.sub,
      uid: payload.uid,
      name: payload.name,
    };
  }
}
