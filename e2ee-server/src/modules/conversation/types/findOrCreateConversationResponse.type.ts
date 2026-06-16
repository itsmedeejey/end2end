import { userDetails } from './userDetails.type';

export type FindOrCreateConversationResponse = {
    conversationId: string;
    participant: userDetails;
}
