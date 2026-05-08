import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/registerUser.dto';
import { PrismaService } from 'src/database/prisma.service';
import { generateUserId } from 'src/utils/generateUserId.util';
import { generateRecoveryKey } from 'src/utils/generateRecoveryKey.util';
import { createFingerprint } from 'src/utils/createFingerprint.util';
import { hashRecoveryKey } from 'src/utils/hashRecoveryKey.util';
import { TokenService } from './token.service';
import { RegisterUserResponse } from './types/registerUserResponse.type';
import { LoginUserDto } from './dto/loginUser.dto';
import { verifyRecoveryKey } from 'src/utils/verifyRecoveryKey.util';
import { loginUserResponse } from './types/loginUserResponse.type';
import bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) { }

  async registerUser(dto: RegisterUserDto): Promise<RegisterUserResponse> {
    const displayname = dto.displayName;
    const userId: string = generateUserId();
    const recoveryKey: string = generateRecoveryKey();
    const fingerprint: string = createFingerprint(recoveryKey);
    const recoveryKeyHash = await hashRecoveryKey(recoveryKey);

    try {
      const user = await this.prisma.user.create({
        data: {
          uniqueUserId: userId,
          displayName: displayname,
          recoveryKeyHash,
          recoveryKeyFingerprint: fingerprint,
        },
        select: {
          id: true,
          uniqueUserId: true,
          displayName: true,
          createdAt: true,
        },
      });

      const tokens = await this.tokenService.generateTokens(
        user.id,
        user.uniqueUserId,
        user.displayName,
      );

      return { ...user, recoveryKey, tokens };
    } catch (err) {
      if (err.code === 'P2002') {
        this.logger.error('Collision during registration', err.meta?.target);
        throw new InternalServerErrorException(
          'Registration failed, please try again',
        );
      }
      this.logger.error('Unexpected registration error', err.stack);
      throw new InternalServerErrorException();
    }
  }

  async loginUser(dto: LoginUserDto): Promise<loginUserResponse> {
    const fingerprint = createFingerprint(dto.recoveryKey);
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          recoveryKeyFingerprint: fingerprint,
        },
        select: {
          id: true,
          uniqueUserId: true,
          recoveryKeyHash: true,
          displayName: true,
          createdAt: true,
        },
      });
      if (!user) {
        throw new UnauthorizedException('invalid credentials');
      }
      const isValid = await verifyRecoveryKey(
        dto.recoveryKey,
        user.recoveryKeyHash,
      );
      if (!isValid) {
        throw new UnauthorizedException('invalid credentials');
      }

      //eslint-disable-next-line
      const { recoveryKeyHash, ...safeUser } = user;

      const tokens = await this.tokenService.generateTokens(
        user.id,
        user.uniqueUserId,
        user.displayName,
      );
      return { ...safeUser, tokens };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      this.logger.error('Unexpected login error', err.stack);
      throw new InternalServerErrorException();
    }
  }




  // refresh both tokens store the refreshToken
  async getNewTokens(refreshToken: string) {
    try {
      // verify JWT
      const payload = await this.tokenService.verifyRefreshToken(refreshToken);

      if (!payload) {
        throw new UnauthorizedException();
      }

      const sessionId = payload.sessionId;

      if (!sessionId) {
        throw new UnauthorizedException();
      }

      // fetch session
      const session =
        await this.prisma.refreshToken.findUnique({
          where: {
            id: sessionId,
          },
        });

      if (!session) {
        throw new UnauthorizedException();
      }

      // already revoked?
      if (session.revokedAt) {
        throw new UnauthorizedException();
      }

      // expired?
      if (session.expiresAt < new Date()) {
        throw new UnauthorizedException();
      }

      // verifying token hash
      const isValid = await bcrypt.compare(
        refreshToken,
        session.tokenHash
      );

      if (!isValid) {
        throw new UnauthorizedException();
      }

      // NOW revoking  old token
      await this.prisma.refreshToken.update({
        where: {
          id: sessionId,
        },
        data: {
          revokedAt: new Date(),
        },
      });

      // generate new tokens
      const newTokens = await this.tokenService.generateTokens(
        payload.sub,
        payload.uid,
        payload.name
      );
      return newTokens;

    } catch (err) {
      this.logger.error(
        "Tokens rotation failed",
        err.stack
      );

      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new InternalServerErrorException();
    }
  }
}
