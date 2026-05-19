import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { PaginateMessagesDto } from './dto/paginateMessages.dto';
import { SyncMessagesAfterDto } from './dto/syncMessagesAfter.dto';
import { ConversationService } from './conversation.service';
import type {
  MessageResponse,
  PaginatedMessagesResponse,
} from './types/messageResponse.type';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class ConversationMessagesController {
  constructor(private readonly conversationService: ConversationService) { }

  @Get(':conversationId')
  async getMessages(
    @Param('conversationId') conversationId: string,
    @Query() query: PaginateMessagesDto,
    @Req() req: Request & { user: JwtPayload },
  ): Promise<PaginatedMessagesResponse> {
    return this.conversationService.paginateOlderMessages(
      req.user.sub,
      conversationId,
      query.before,
      query.limit,
    );
  }

  @Get(':conversationId/sync')
  async syncMessages(
    @Param('conversationId') conversationId: string,
    @Query() query: SyncMessagesAfterDto,
    @Req() req: Request & { user: JwtPayload },
  ): Promise<MessageResponse[]> {
    return this.conversationService.syncMessagesAfter(
      req.user.sub,
      conversationId,
      query.after,
      query.limit,
    );
  }
}
