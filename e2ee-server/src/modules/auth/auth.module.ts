import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy'

@Module({
  imports: [JwtModule, PassportModule],
  controllers: [AuthController],
  providers: [AuthService, TokenService, JwtStrategy],
  exports: [JwtModule, PassportModule, TokenService],
})
export class AuthModule { }
