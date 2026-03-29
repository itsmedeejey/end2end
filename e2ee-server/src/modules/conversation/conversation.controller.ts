import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ToDto } from './dto/to.dto';
import { ConversationService } from './conversation.service';
import { JwtPayload } from '../auth/types/jwt-payload.type';


@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  async findOrCreateConversation(
    @Body() dto: ToDto,
    @Req() req: Request & { user: JwtPayload },
  ): Promise<string> {
    const conversationId: Promise<string> =
      this.conversationService.findOrCreateConversationId(dto.to, req.user.sub);

    return conversationId;
  }
}
