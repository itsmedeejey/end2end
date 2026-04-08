export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  ciphertext: string;
  createdAt: string;
  status?: "sending" | "sent" | "delivered" | "read" | "failed";
}
