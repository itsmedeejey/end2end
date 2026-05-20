import { Module } from '@nestjs/common';
import { ConversationController } from './conversation.controller';
import { ConversationMessagesController } from './conversation-messages.controller';
import { ConversationService } from './conversation.service';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [AuthModule],
  controllers: [ConversationController, ConversationMessagesController],
  providers: [ConversationService],
  exports: [ConversationService],
})
export class ConversationModule { }
