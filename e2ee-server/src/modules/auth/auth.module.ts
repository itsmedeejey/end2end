import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { JwtModule } from '@nestjs/jwt';


@Module({
  imports: [JwtModule],
  controllers: [AuthController],
  providers: [AuthService, TokenService,],
})
export class AuthModule { }
