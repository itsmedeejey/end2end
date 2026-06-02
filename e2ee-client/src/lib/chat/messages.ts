"use client";

import { decryptMessage } from "@/lib/libsodium/decrypt";
import { ensureSession } from "@/lib/libsodium/services/ensureSession";
import { ChatMessage } from "@/types/message.type";

export type IncomingEncryptedMessage = {
    id: string;
    conversationId: string;
    senderId: string;
    ciphertext: string;
    nonce: string;
    createdAt: string;
    clientTempId?: string;
    status?: "sending" | "sent" | "delivered" | "read" | "failed" | "SENT" | "DELIVERED" | "SEEN";
};

export type PaginatedMessagesResponse = {
    messages: IncomingEncryptedMessage[];
    hasMore: boolean;
    nextCursor: string | null;
};

const normalizeStatus = (
    status: IncomingEncryptedMessage["status"]
): ChatMessage["status"] => {
    if (!status) return "sent";
    if (status === "SEEN") return "read";
    return status.toLowerCase() as ChatMessage["status"];
};

export async function decryptIncomingMessages(
    messages: IncomingEncryptedMessage[],
    peerUserId: string
): Promise<ChatMessage[]> {
    if (messages.length === 0) return [];

    const sessionKey = await ensureSession(
        messages[0].conversationId,
        peerUserId
    );

    return Promise.all(
        messages.map(async (message) => {
            try {
                const plaintext = await decryptMessage(
                    message.ciphertext,
                    message.nonce,
                    sessionKey
                );
                return {
                    id: message.id,
                    conversationId: message.conversationId,
                    senderId: message.senderId,
                    content: plaintext,
                    ciphertext: message.ciphertext,
                    nonce: message.nonce,
                    createdAt: message.createdAt,
                    clientTempId: message.clientTempId,
                    status: normalizeStatus(message.status),
                };
            } catch {
                return {
                    id: message.id,
                    conversationId: message.conversationId,
                    senderId: message.senderId,
                    content: "unable to decrypt this Message",
                    ciphertext: message.ciphertext,
                    nonce: message.nonce,
                    createdAt: message.createdAt,
                    clientTempId: message.clientTempId,
                    status: normalizeStatus(message.status),

                    decryptFailed: true,
                };
            }
        })
    );
}

