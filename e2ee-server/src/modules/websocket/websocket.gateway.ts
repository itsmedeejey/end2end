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
import * as cookie from 'cookie';
import { SendMessageDto } from './dto/sendMessage.dto';
import { v7 as uuidV7 } from 'uuid';
import { ConversationService } from '../conversation/conversation.service';

interface GatewaySocketData {
  user?: JwtPayload;
}

const origins = process.env.CORS_ORIGINS
  ?.split(',')
  .map(o => o.trim()) || [];

@WebSocketGateway({
  cors: {
    origin: origins,
    credentials: true,
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
    private readonly conversationService: ConversationService,
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

  //  CONNECTION HANDLER
  async handleConnection(client: Socket) {
    try {
      //  Extract token

      const raw = client.handshake.headers?.cookie || "";

      const parsed = cookie.parse(raw);

      const token = parsed["accessToken"];

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

  @SubscribeMessage('conversation:join')
  async handleJoinConversation(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.getRequiredSocketUser(client);

    const membership = await this.prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: user.sub,
        },
      },
      select: { id: true },
    });

    if (!membership) {
      throw new WsException('Not a member of this conversation');
    }

    await client.join(conversationId);
  }

  @SubscribeMessage('join:conversation')
  async handleLegacyJoinConversation(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    return this.handleJoinConversation(conversationId, client);
  }

  @SubscribeMessage('conversation:leave')
  async handleLeaveConversation(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    await client.leave(conversationId);
  }

  @SubscribeMessage('leave:conversation')
  async handleLegacyLeaveConversation(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    return this.handleLeaveConversation(conversationId, client);
  }

  // DISCONNECT HANDLER
  handleDisconnect(client: Socket) {
    const user = this.getSocketUser(client);

    if (user) {
      this.logger.log(`User disconnected: ${user.sub}`);
    }
  }

  // SEND MESSAGE
  @SubscribeMessage('message:new')
  async handleNewMessage(
    @MessageBody() data: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.getRequiredSocketUser(client);
    const userId = user.sub;
    const userUniqueId = user.uid;
    const conversationId = data.conversationId;
    const content = data.cipherText;
    const clientTempId = data.clientTempId;
    const nonce = data.nonce;


    //  Check if user is part of conversation
    const isMember = await this.prisma.conversationMember.findFirst({
      where: {
        conversationId,
        userId,
      },
    });

    if (!isMember) {
      throw new WsException('Not a member of this conversation');
    }

    const message = await this.prisma.$transaction(async (tx) => {
      const created = await tx.message.create({
        data: {
          id: uuidV7(), // UUIDv7 keeps message ids chronologically sortable.
          conversationId,
          senderId: userUniqueId,
          messageType: MessageType.TEXT,
          status: MessageStatus.SENT,
          ciphertext: content,
          nonce: nonce,
        },
      });

      await tx.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessageId: created.id,
          lastMessageAt: created.createdAt,
          updatedAt: created.createdAt,
        },
      });

      return created;
    });

    const serverCreatedAt = message.createdAt.toISOString();
    const messagePayload = {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      ciphertext: message.ciphertext,
      nonce: message.nonce,
      createdAt: serverCreatedAt,
      status: 'sent',
      clientTempId,
    };

    const conversationPayload = {
      id: conversationId,
      conversationId,
      lastMessageId: message.id,
      lastMessageAt: serverCreatedAt,
      lastMessageSenderId: message.senderId,
      updatedAt: serverCreatedAt,
    };

    this.server.to(conversationId).emit('message:new', messagePayload);
    this.server.to(conversationId).emit('conversation:update', conversationPayload);
    client.emit('message:ack', {
      status: 'ok',
      messageId: message.id,
      createdAt: serverCreatedAt,
      clientTempId,
    });

    // Legacy event kept temporarily for older clients during rollout.
    client.to(conversationId).emit('receive_message', messagePayload);

    return {
      status: 'ok',
      messageId: message.id,
      createdAt: serverCreatedAt,
      clientTempId,
    };
  }

  @SubscribeMessage('send_message')
  async handleLegacySendMessage(
    @MessageBody() data: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    return this.handleNewMessage(data, client);
  }

  @SubscribeMessage('message:sync')
  async handleMessageSync(
    @MessageBody()
    data: {
      conversationId: string;
      after?: string;
      limit?: number;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.getRequiredSocketUser(client);

    const messages = await this.conversationService.syncMessagesAfter(
      user.sub,
      data.conversationId,
      data.after,
      data.limit ?? 50,
    );

    return { messages };
  }

  @SubscribeMessage('conversation:read')
  async handleConversationRead(
    @MessageBody()
    data: {
      conversationId: string;
      messageId?: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.getRequiredSocketUser(client);

    const latestMessageId = data.messageId ?? (await this.prisma.message.findFirst({
      where: { conversationId: data.conversationId },
      orderBy: { id: 'desc' },
      select: { id: true },
    }))?.id;

    await this.prisma.conversationMember.update({
      where: {
        conversationId_userId: {
          conversationId: data.conversationId,
          userId: user.sub,
        },
      },
      data: {
        lastReadMessageId: latestMessageId,
        lastReadAt: new Date(),
      },
    });

    return { ok: true };
  }

  // TYPING INDICATOR
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
