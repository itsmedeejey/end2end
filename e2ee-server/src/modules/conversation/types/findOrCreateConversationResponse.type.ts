import { userDetails } from './userDetails.type';

export interface FindOrCreateConversationResponse {
  conversationId: string;
  user: userDetails;
}
