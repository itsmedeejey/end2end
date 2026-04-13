import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { MessageService } from './services/message.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [WebsocketGateway, MessageService],
  exports: [WebsocketGateway]
})
export class WebsocketModule { }
