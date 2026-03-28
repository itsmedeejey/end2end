import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from './ws-jwt-guard';

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
})
export class websocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly jwtService: JwtService) { }

  async handleConnection(client: Socket) {
    try {
      const token = this.extractTokenFromCookie(client);

      if (!token) throw new Error('No token');

      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });

      // attach user to socket
      client.data.user = {
        userId: payload.sub,
      };

      console.log(` Connected: ${payload.sub}`);
    } catch (err) {
      console.error(err)
      console.log(` Connection rejected: ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(` Disconnected: ${client.id}`);
  }

  // Example event

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('send_message')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    const user = client.data.user;

    if (!user) {
      throw new WsException('Unauthorized');
    }

    console.log(` ${user.userId}:`, data);

    return {
      status: 'ok',
    };
  }

  private extractTokenFromCookie(client: Socket): string | undefined {
    const cookieHeader = client.handshake.headers.cookie;
    if (!cookieHeader) return undefined;

    const cookies = Object.fromEntries(
      cookieHeader.split(';').map((c) => {
        const [k, ...v] = c.trim().split('=');
        return [k, decodeURIComponent(v.join('='))];
      }),
    );

    return cookies['access_token'];
  }

}
