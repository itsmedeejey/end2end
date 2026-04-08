export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  ciphertext: string;
  createdAt: string;
  clientTempId?: string;
  status?: "sending" | "sent" | "delivered" | "read" | "failed";
}
