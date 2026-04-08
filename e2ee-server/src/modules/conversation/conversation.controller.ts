import {
  Body,
  Controller,
  Post,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ToDto } from './dto/to.dto';
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
