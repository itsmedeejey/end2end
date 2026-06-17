import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './types/jwt-payload.type';
import { PrismaService } from 'src/database/prisma.service';
import { randomUUID } from 'node:crypto';
import { refreshTokenPayload } from './types/jwt-payload.type';
import bcrypt from 'bcrypt'

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService,
    private prisma: PrismaService) { }

  async generateAccessToken(
    userId: string,
    uniqueUserId: string,
    displayName: string,
  ) {
    const payload = {
      sub: userId,
      uid: uniqueUserId,
      name: displayName,
      type: 'access' as const,
    };

    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '1h',
    });
  }

  async generateRefreshToken(
    userId: string,
    uniqueUserId: string,
    displayName: string,
  ) {

    const sessionId = randomUUID() // a randomUUID is takend as sessionId

    const payload = {
      sub: userId,
      uid: uniqueUserId,
      name: displayName,
      type: 'refresh' as const,
      sessionId: sessionId,
    };
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '30d',
    });

    const hashRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.prisma.refreshToken.create({
      data: {
        id: sessionId,
        userId,
        tokenHash: hashRefreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }
    })
    return refreshToken;

  }

  async generateTokens(
    userId: string,
    uniqueUserId: string,
    displayName: string,
  ) {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(userId, uniqueUserId, displayName),
      this.generateRefreshToken(userId, uniqueUserId, displayName),
    ]);

    return { accessToken, refreshToken };
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_ACCESS_SECRET as string,
      });
      if (payload.type !== 'access') {
        throw new UnauthorizedException('Invalid access token type');
      }
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  async verifyRefreshToken(token: string): Promise<refreshTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<refreshTokenPayload>(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token type');
      }
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
