import { MessageStatus } from 'prisma/generated/client';

export type MessageResponse = {
  id: string;
  conversationId: string;
  senderId: string;
  ciphertext: string;
  nonce: string;
  createdAt: string;
  status: MessageStatus;
  clientTempId?: string;
};

export type PaginatedMessagesResponse = {
  messages: MessageResponse[];
  hasMore: boolean;
  nextCursor: string | null;
};

