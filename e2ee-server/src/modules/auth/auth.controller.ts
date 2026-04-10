import type { Response, Request } from "express"
import { Controller, Post, Body, Res, Req, Get, UseGuards } from '@nestjs/common'
import { RegisterUserDto } from './dto/registerUser.dto'
import { LoginUserDto } from './dto/loginUser.dto'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from "./jwt-auth.guard"

type Tokens = {
  accessToken: string;
  refreshToken: string;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }
  private setAuthCookies(res: Response, tokens: Tokens) {
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "none" as const,
      domain: process.env.DOMAIN || undefined,
      path: "/",
    };

    res.cookie("accessToken", tokens.accessToken, {
      ...options,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      ...options,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }

  @Post('register')
  async register(
    @Body() dto: RegisterUserDto,
    @Res({ passthrough: true }) res: Response) {

    const result = await this.authService.registerUser(dto)


    this.setAuthCookies(res, result.tokens)

    //eslint-disable-next-line
    const { tokens, ...safeResult } = result;
    return safeResult;
  }

  @Post("login")
  async login(
    @Body() dto: LoginUserDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.loginUser(dto)

    this.setAuthCookies(res, result.tokens)

    //eslint-disable-next-line
    const { tokens, ...safeResult } = result;
    return safeResult;
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: Request) {

    return {
      user: req.user,
    };
  }



}
