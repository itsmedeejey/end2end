import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './database/prisma.module';
import { websocketGateway } from './modules/websocket/websocket.gateway';

@Module({
  imports: [AuthModule, PrismaModule,],
  controllers: [AppController],
  providers: [AppService, websocketGateway],
})
export class AppModule { }
