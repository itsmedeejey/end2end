import { MessageStatus } from 'prisma/generated/client';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  ciphertext: string;
  createdAt: Date;
  status: MessageStatus;
}

export type GetChatsResponse = ChatMessage[];
