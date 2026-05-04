import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { KeysService } from './keys.service';
import { KeyBundleDto, } from './dto/keybundle.dto';
import { GetKeysDto } from './dto/getKeys.dto';
import { JwtPayload } from '../auth/types/jwt-payload.type';

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
  @Post('getKeys')
  @UseGuards(JwtAuthGuard)
  async getKeys(
    @Body() dto: GetKeysDto) {
    const recieverId = dto.recieverId
    const keys = await this.keyService.getPublicKeys(recieverId)
    return keys;
  }




}
