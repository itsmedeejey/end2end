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

@Injectable()
export class ConversationService {
  constructor(private prisma: PrismaService) { }

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
    const res = await this.prisma.conversation.findMany({
      where: {
        members: {
          some: {
            userId: currentUserId,
          },
        },
      },
      select: {
        id: true,
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
    });

    const conversations = res
      .map((conv): GetConversationsResponse[number] | null => {
        const participant = conv.members[0]?.user;

        if (!participant) {
          return null;
        }

        return {
          conversationId: conv.id,
          participant,
        };
      })
      .filter(
        (
          conversation,
        ): conversation is GetConversationsResponse[number] =>
          conversation !== null,
      );

    return conversations;
  }

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
        createdAt: true,
        status: true,
      },
    });

    return messages;
  }


}
