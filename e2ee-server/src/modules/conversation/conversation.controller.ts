import {
    Body,
    Controller,
    Post,
    Patch,
    Get,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ToDto } from './dto/to.dto';
import { syncMessgaesDto } from './dto/syncMessgaes.dto';
import { MarkConversationReadDto } from './dto/markConversationRead.dto';
import { ConversationService } from './conversation.service';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { FindOrCreateConversationResponse } from './types/findOrCreateConversationResponse.type';
import { GetConversationsResponse } from './types/getConversationsResponse.type';
import { GetChatsResponse } from './types/getChatsResponse.type';


@Controller('conversation')
export class ConversationController {
    constructor(private readonly conversationService: ConversationService) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    async getConversations(
        @Req() req: Request & { user: JwtPayload },
    ): Promise<GetConversationsResponse> {
        const conversation = await this.conversationService.GetConversations(req.user.sub)

        return conversation;
    }

    @Get('loadchats')
    @UseGuards(JwtAuthGuard)
    async getChats(
        @Query('conversationId') conversationId: string,
        @Req() req: Request & { user: JwtPayload },
    ): Promise<GetChatsResponse> {
        const messages = await this.conversationService.GetChats(
            req.user.sub,
            conversationId,
        );
        return messages;
    }


    //syncing laest messages
    @Get('sync')
    @UseGuards(JwtAuthGuard)
    async syncMessages(
        @Query() dto: syncMessgaesDto,
        @Req() req: Request & { user: JwtPayload }
    ): Promise<GetChatsResponse> {

        const conversationId = dto.conversationId;
        const after = dto.after;

        return await this.conversationService.syncNewMessage(req.user.sub, conversationId, after)
    }

    @Patch('read')
    @UseGuards(JwtAuthGuard)
    async markConversationRead(
        @Body() dto: MarkConversationReadDto,
        @Req() req: Request & { user: JwtPayload },
    ): Promise<{ ok: true }> {
        await this.conversationService.markConversationRead(
            req.user.sub,
            dto.conversationId,
            dto.messageId,
        );

        return { ok: true };
    }


    // this route is for searching a user returning conversation id if exist or create it ...
    @Post('getid')
    @UseGuards(JwtAuthGuard)
    async findOrCreateConversation(
        @Body() dto: ToDto,
        @Req() req: Request & { user: JwtPayload },
    ): Promise<FindOrCreateConversationResponse> {
        const conversation: Promise<FindOrCreateConversationResponse> =
            this.conversationService.findOrCreateConversationId(dto.to, req.user.sub);
        return conversation;
    }

}
