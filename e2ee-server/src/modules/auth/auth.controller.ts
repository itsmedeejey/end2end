import type { Response, Request } from "express"
import { Controller, Post, Body, Res, Req, Get, UseGuards } from '@nestjs/common'
import { RegisterUserDto } from './dto/registerUser.dto'
import { LoginUserDto } from './dto/loginUser.dto'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from "./jwt-auth.guard"

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  async register(
    @Body() dto: RegisterUserDto,
    @Res({ passthrough: true }) res: Response) {

    const result = await this.authService.registerUser(dto)

    res.cookie("accessToken", result.tokens.accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    })

    res.cookie("refreshToken", result.tokens.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })


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

    res.cookie("accessToken", result.tokens.accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    })

    res.cookie("refreshToken", result.tokens.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })

    //eslint-disable-next-line
    const { tokens, ...safeResult } = result;
    return safeResult;
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: Request) {

    const token = req.cookies?.accessToken;

    return {
      user: req.user,
      accessToken: token,
    };
  }





}
