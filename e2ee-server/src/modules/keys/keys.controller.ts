import { Body, Controller, Post, Get, UseGuards, Req, UsePipes, Param } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { KeysService } from './keys.service';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { ValidationPipe } from '@nestjs/common';
import { IndentityKeyDto } from './dto/storeKeys.dto';

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
        @Body() dto: IndentityKeyDto) {

        return await this.keyService.storePublickey(dto.publicKey, req.user.sub)
    }


    //get preKeys for the user
    @Get(':receiverId')
    @UseGuards(JwtAuthGuard)
    async getKeys(
        @Param('receiverId') receiverId: string,
    ) {
        const keys = await this.keyService.getPublicKeys(receiverId);
        return keys;
    }
}
