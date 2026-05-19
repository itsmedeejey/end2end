import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { userDetails } from './types/userDetails.type';
import { FindOrCreateConversationResponse } from './types/findOrCreateConversationResponse.type';
import { GetConversationsResponse } from './types/getConversationsResponse.type';
import { GetChatsResponse } from './types/getChatsResponse.type';
import {
  MessageResponse,
  PaginatedMessagesResponse,
} from './types/messageResponse.type';

@Injectable()
export class ConversationService {
  constructor(private prisma: PrismaService) { }

  private async assertConversationMember(
    userId: string,
    conversationId: string,
  ): Promise<void> {
    if (!conversationId?.trim()) {
      throw new BadRequestException('conversationId is required');
    }

    const membership = await this.prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
      select: { id: true },
    });

    if (!membership) {
      throw new NotFoundException('Conversation not found');
    }
  }

  private toMessageResponse(message: {
    id: string;
    conversationId: string;
    senderId: string;
    ciphertext: string;
    nonce: string;
    createdAt: Date;
    status: MessageResponse['status'];
  }): MessageResponse {
    return {
      ...message,
      createdAt: message.createdAt.toISOString(),
    };
  }

  async findOrCreateConversationId(
    otherUserUid: string,
    currentUserId: string,
  ): Promise<FindOrCreateConversationResponse> {

    // finding id from user's uniqueUserId  
    const receiver = await this.prisma.user.findUnique({
      where: { uniqueUserId: otherUserUid },
      select: { id: true, displayName: true, uniqueUserId: true },
    });

    if (!receiver) {
      throw new NotFoundException('User not found (receiver)');
    }

    if (receiver.id === currentUserId) {
      throw new BadRequestException('Cannot create conversation with yourself');
    }

    //  Create deterministic key
    const [user1, user2] = [currentUserId, receiver.id].sort();
    const directKey = `${user1}_${user2}`;

    //Try find existing
    const existing = await this.prisma.conversation.findUnique({
      where: { directConversationKey: directKey },
      select: { id: true },
    });

    const user: userDetails = {
      displayName: receiver.displayName,
      uniqueUserId: receiver.uniqueUserId,
    };

    if (existing) {
      return {
        conversationId: existing.id,
        participant: user,
      };
    }

    // Create safely
    try {
      const conversation = await this.prisma.conversation.create({
        data: {
          directConversationKey: directKey,
          members: {
            create: [
              { userId: user1 },
              { userId: user2 },
            ],
          },
        },
        select: { id: true },
      });

      return {
        conversationId: conversation.id,
        participant: user,
      };

    } catch (error) {
      // Handle duplicate creation
      const fallback = await this.prisma.conversation.findUnique({
        where: { directConversationKey: directKey },
        select: { id: true },
      });

      if (fallback) {
        return {
          conversationId: fallback.id,
          participant: user,
        };
      }

      throw error;
    }
  }

  //TODO:
  async GetConversations(
    currentUserId: string,
  ): Promise<GetConversationsResponse> {
    const currentUser = await this.prisma.user.findUnique({
      where: { id: currentUserId },
      select: { uniqueUserId: true },
    });

    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    const memberships = await this.prisma.conversationMember.findMany({
      where: { userId: currentUserId },
      orderBy: {
        conversation: {
          updatedAt: 'desc',
        },
      },
      select: {
        lastReadMessageId: true,
        conversation: {
          select: {
            id: true,
            updatedAt: true,
            lastMessageId: true,
            lastMessageAt: true,
            lastMessage: {
              select: {
                senderId: true,
                ciphertext: true,
              },
            },
            members: {
              where: {
                userId: {
                  not: currentUserId,
                },
              },
              take: 1,
              select: {
                user: {
                  select: {
                    uniqueUserId: true,
                    displayName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const conversations = await Promise.all(
      memberships.map(async (membership): Promise<GetConversationsResponse[number] | null> => {
        const conversation = membership.conversation;
        const participant = conversation.members[0]?.user;

        if (!participant) {
          return null;
        }

        const unreadCount = await this.prisma.message.count({
          where: {
            conversationId: conversation.id,
            senderId: {
              not: currentUser.uniqueUserId,
            },
            ...(membership.lastReadMessageId
              ? { id: { gt: membership.lastReadMessageId } }
              : {}),
          },
        });

        return {
          id: conversation.id,
          conversationId: conversation.id,
          title: participant.displayName,
          lastMessageId: conversation.lastMessageId,
          // The server cannot decrypt E2EE content. The client replaces this with plaintext from IndexedDB.
          lastMessageText: conversation.lastMessage?.ciphertext ?? null,
          lastMessageAt: conversation.lastMessageAt?.toISOString() ?? null,
          lastMessageSenderId: conversation.lastMessage?.senderId ?? null,
          unreadCount,
          updatedAt: conversation.updatedAt.toISOString(),
          participant,
        };
      }),
    );

    return conversations.filter(
      (conversation,): conversation is GetConversationsResponse[number] =>
        conversation !== null,
    );
  }

  async markConversationRead(
    currentUserId: string,
    conversationId: string,
    messageId?: string,
  ): Promise<void> {
    const membership = await this.prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: currentUserId,
        },
      },
      select: { id: true },
    });

    if (!membership) {
      throw new NotFoundException('Conversation not found');
    }

    let lastReadMessageId = messageId;

    if (!lastReadMessageId) {
      const latest = await this.prisma.message.findFirst({
        where: { conversationId },
        orderBy: { id: 'desc' },
        select: { id: true },
      });

      lastReadMessageId = latest?.id;
    }

    await this.prisma.conversationMember.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId: currentUserId,
        },
      },
      data: {
        lastReadMessageId,
        lastReadAt: new Date(),
      },
    });
  }

  async paginateOlderMessages(
    userId: string,
    conversationId: string,
    before?: string,
    limit = 30,
  ): Promise<PaginatedMessagesResponse> {
    await this.assertConversationMember(userId, conversationId);

    const rows = await this.prisma.message.findMany({
      where: {
        conversationId,
        ...(before ? { id: { lt: before } } : {}),
      },
      orderBy: { id: 'desc' },
      take: limit + 1,
      select: {
        id: true,
        conversationId: true,
        senderId: true,
        ciphertext: true,
        nonce: true,
        createdAt: true,
        status: true,
      },
    });

    const hasMore = rows.length > limit;
    const page = rows
      .slice(0, limit)
      .reverse()
      .map((message) => this.toMessageResponse(message));

    return {
      messages: page,
      hasMore,
      nextCursor: page[0]?.id ?? null,
    };
  }

  async syncMessagesAfter(
    userId: string,
    conversationId: string,
    after?: string,
    limit = 50,
  ): Promise<MessageResponse[]> {
    await this.assertConversationMember(userId, conversationId);

    const rows = await this.prisma.message.findMany({
      where: {
        conversationId,
        ...(after ? { id: { gt: after } } : {}),
      },
      orderBy: { id: 'asc' },
      take: limit,
      select: {
        id: true,
        conversationId: true,
        senderId: true,
        ciphertext: true,
        nonce: true,
        createdAt: true,
        status: true,
      },
    });

    return rows.map((message) => this.toMessageResponse(message));
  }

  /*
    Deprecated full-history loader kept for existing callers.
    New chat screens should use
    GET /api/messages/:conversationId with before/limit pagination.
  */
  async GetChats(
    currentUserId: string,
    conversationId: string,
  ): Promise<GetChatsResponse> {
    if (!conversationId?.trim()) {
      throw new BadRequestException('conversationId is required');
    }

    const membership = await this.prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: currentUserId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!membership) {
      throw new NotFoundException('Conversation not found');
    }

    const messages = await this.prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        id: true,
        conversationId: true,
        senderId: true,
        ciphertext: true,
        nonce: true,
        createdAt: true,
        status: true,
      },
    });

    return messages;
  }


  // syncing new messages
  async syncNewMessage(
    currentUserId: string,
    conversationId: string,
    msgId: string
  ): Promise<GetChatsResponse> {

    if (!conversationId?.trim()) {
      throw new BadRequestException('conversationId is required');
    }

    const membership = await this.prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: currentUserId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!membership) {
      throw new NotFoundException('Conversation not found');
    }

    const messages = await this.prisma.message.findMany({
      where: {
        conversationId,
        id: {
          gt: msgId
        },
      },
      orderBy: {
        id: 'asc',
      },

      take: 50,

      select: {
        id: true,
        conversationId: true,
        senderId: true,
        ciphertext: true,
        nonce: true,
        createdAt: true,
        status: true,
      },
    });

    return messages
  }

}
