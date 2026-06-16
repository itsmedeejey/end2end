import { forwardRef, Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { MessageService } from './services/message.service';
import { AuthModule } from '../auth/auth.module';
import { ConversationModule } from '../conversation/conversation.module';

@Module({
    imports: [AuthModule,

        // duck-tape fix for now will be creating a separate service later
        forwardRef(() => ConversationModule),
    ],

    providers: [WebsocketGateway, MessageService],
    exports: [WebsocketGateway]
})
export class WebsocketModule { }
