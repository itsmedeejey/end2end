import { Body, Controller, Post, Get, UseGuards, Req, UsePipes, Param } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { KeysService } from './keys.service';
import { KeyBundleDto, } from './dto/keybundle.dto';
import { GetKeysDto } from './dto/getKeys.dto';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { ValidationPipe } from '@nestjs/common';

@UsePipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true
}))

@Controller('keys')
export class KeysController {
  constructor(private readonly keyService: KeysService) { };

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  async storeKeys(

    @Req() req: Request & { user: JwtPayload },
    @Body() dto: KeyBundleDto) {
    const keyBundle = {
      identityKey: dto.identityKey,
      registrationId: dto.registrationId,
      signedPreKey: dto.signedPreKey,
      preKeys: dto.preKeys
    }

    return await this.keyService.storePublickey(keyBundle, req.user.sub)
  }


  //get preKeys for the user
  @Get(':receiverId')
  @UseGuards(JwtAuthGuard)
  async getKeys(
    @Param() dto: GetKeysDto) {
    const receiverId = dto.receiverId
    const keys = await this.keyService.getPublicKeys(receiverId)
    return keys;
  }




}
