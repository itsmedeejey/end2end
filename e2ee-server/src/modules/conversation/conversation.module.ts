import { forwardRef, Module } from '@nestjs/common';
import { ConversationController } from './conversation.controller';
import { ConversationMessagesController } from './conversation-messages.controller';
import { ConversationService } from './conversation.service';
import { AuthModule } from '../auth/auth.module';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
    imports: [AuthModule,

        // duck-tape fix for now will be creating a separate service later
        forwardRef(() => WebsocketModule),

    ],
    controllers: [ConversationController, ConversationMessagesController],
    providers: [ConversationService],
    exports: [ConversationService],
})
export class ConversationModule { }
