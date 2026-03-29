import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './database/prisma.module';
import { WebsocketGateway } from './modules/websocket/websocket.gateway';
import { ConversationModule } from './modules/conversation/conversation.module';

@Module({
  imports: [AuthModule, PrismaModule, ConversationModule,],
  controllers: [AppController],
  providers: [AppService, WebsocketGateway],
})
export class AppModule { }
