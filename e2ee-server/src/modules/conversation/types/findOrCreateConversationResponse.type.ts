import { userDetails } from './userDetails.type';

export interface FindOrCreateConversationResponse {
  conversationId: string;
  participant: userDetails;
}
