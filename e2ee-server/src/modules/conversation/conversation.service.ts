import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class ConversationService {
  constructor(private prisma: PrismaService) { }

  async findOrCreateConversationId(
    otherUserUid: string,
    currentUserId: string,
  ): Promise<string> {

    // finding id from user's uniqueUserId  
    const receiver = await this.prisma.user.findUnique({
      where: { uniqueUserId: otherUserUid },
      select: { id: true },
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

    if (existing) return existing.id;

    // Create safely (handle race condition)
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

      return conversation.id;
    } catch (error) {
      // Handle duplicate creation (important)
      const fallback = await this.prisma.conversation.findUnique({
        where: { directConversationKey: directKey },
        select: { id: true },
      });

      if (fallback) return fallback.id;

      throw error;
    }
  }
}
