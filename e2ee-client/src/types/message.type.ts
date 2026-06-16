export type ChatMessage = {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    ciphertext?: string;
    nonce?: string;
    createdAt: string;
    clientTempId?: string;
    status?: "sending" | "sent" | "delivered" | "read" | "failed";

    decryptFailed?: boolean;
}
