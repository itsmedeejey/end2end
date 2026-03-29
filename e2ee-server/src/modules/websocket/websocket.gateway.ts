import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  WsException,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/database/prisma.service';
import { MessageStatus, MessageType } from 'prisma/generated/client';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { TokenService } from '../auth/token.service';

interface GatewaySocketData {
  user?: JwtPayload;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger(WebsocketGateway.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) { }

  private getSocketUser(client: Socket): JwtPayload | undefined {
    return (client.data as GatewaySocketData).user;
  }

  private setSocketUser(client: Socket, user: JwtPayload): void {
    (client.data as GatewaySocketData).user = user;
  }

  private getRequiredSocketUser(client: Socket): JwtPayload {
    const user = this.getSocketUser(client);
    if (!user) {
      throw new WsException('Unauthorized');
    }
    return user;
  }

  private normalizePayload(rawData: unknown): Record<string, unknown> {
    const isRecord = (value: unknown): value is Record<string, unknown> =>
      typeof value === 'object' && value !== null && !Array.isArray(value);

    let payload: unknown = rawData;

    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch {
        throw new WsException('Invalid JSON payload');
      }
    }

    if (!isRecord(payload)) {
      throw new WsException('Invalid payload');
    }

    const nestedData = payload.data;

    if (isRecord(nestedData)) {
      return nestedData;
    }

    return payload;
  }

  //  CONNECTION HANDLER
  async handleConnection(client: Socket) {
    try {
      //  Extract token

      const token = client.handshake.auth?.token;


      if (typeof token !== 'string' || token.length === 0) {
        throw new WsException('No token provided');
      }

      //  Verify token
      const payload = await this.tokenService.verifyAccessToken(token);

      //  Attach user to socket
      this.setSocketUser(client, payload);

      const userId = payload.sub;

      //  Fetch all conversations of user
      const memberships = await this.prisma.conversationMember.findMany({
        where: { userId },
        select: { conversationId: true },
      });

      //  Join all conversation rooms
      await Promise.all(
        memberships.map((m) => Promise.resolve(client.join(m.conversationId))),
      );

      this.logger.log(`User connected: ${userId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Connection failed: ${message}`);
      client.disconnect();
    }
  }

  //  DISCONNECT HANDLER
  handleDisconnect(client: Socket) {
    const user = this.getSocketUser(client);

    if (user) {
      this.logger.log(`User disconnected: ${user.sub}`);
    }
  }

  //  SEND MESSAGE
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() rawData: unknown,
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.getRequiredSocketUser(client);
    const userId = user.sub;
    const data = this.normalizePayload(rawData);
    const conversationId = data.conversationId;
    const content = data.content;

    if (
      typeof conversationId !== 'string' ||
      conversationId.trim().length === 0 ||
      typeof content !== 'string' ||
      content.trim().length === 0
    ) {
      throw new WsException('conversationId and content are required');
    }

    // 1. Check if user is part of conversation
    const isMember = await this.prisma.conversationMember.findFirst({
      where: {
        conversationId,
        userId,
      },
    });

    if (!isMember) {
      throw new WsException('Not a member of this conversation');
    }

    // 2. Save message
    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        messageType: MessageType.TEXT,
        status: MessageStatus.SENT,
        protocolVersion: '1.0',
        isPreKeyMessage: false,
        ciphertext: content,
      },
    });

    // 3. Emit to all users in that conversation
    client.to(conversationId).emit('receive_message', message);

    return {
      status: 'sent',
      messageId: message.id,
    };
  }

  //  TYPING INDICATOR
  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody()
    data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.getRequiredSocketUser(client);

    client.to(data.conversationId).emit('typing', {
      userId: user.sub,
    });
  }

  //  MESSAGE READ
  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @MessageBody()
    data: {
      conversationId: string;
      messageId: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.getRequiredSocketUser(client);

    await this.prisma.message.update({
      where: { id: data.messageId },
      data: {
        status: MessageStatus.SEEN,
      },
    });

    this.server.to(data.conversationId).emit('message_read', {
      messageId: data.messageId,
      userId: user.sub,
    });
  }
}
