export interface ConversationConnection {
  id: string;
  conversationId: string;
  title: string;
  lastMessageId: string | null;
  lastMessageText: string | null;
  lastMessageAt: string | null;
  lastMessageSenderId: string | null;
  unreadCount: number;
  updatedAt: string;
  participant: {
    uniqueUserId: string;
    displayName: string;
  };
}

export type GetConversationsResponse = ConversationConnection[];
