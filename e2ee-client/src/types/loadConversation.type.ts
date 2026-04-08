export interface ConversationConnection {
  conversationId: string;
  participant: {
    uniqueUserId: string;
    displayName: string;
  };
}

export type GetConversationsResponse = ConversationConnection[];


