import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './database/prisma.module';
import { ConversationModule } from './modules/conversation/conversation.module';
import { WebsocketModule } from './modules/websocket/websocket.module';

@Module({
  imports: [AuthModule, PrismaModule, ConversationModule, WebsocketModule,],
  controllers: [AppController],
  providers: [AppService], //removed WebsocketGateway here
})
export class AppModule { }
