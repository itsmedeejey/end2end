"use client";

import { useEffect } from "react";
import { getSocket } from "@/lib/socket/socket";
import { useChatStore } from "@/store/chat.store";
import { useAuthStore } from "@/store/auth.store";
import { getLatestSyncedMessage, saveMessages } from "@/lib/idb/chat-db";
import {
    decryptIncomingMessages,
    IncomingEncryptedMessage,
} from "@/lib/chat/messages";

type SyncAck = {
    messages?: IncomingEncryptedMessage[];
};

export const useSocketConnection = () => {
    const activeConversationId = useChatStore((s) => s.activeConversationId);
    const appendMessages = useChatStore((s) => s.appendMessages);
    const conversations = useChatStore((s) => s.conversations);
    const markConversationRead = useChatStore((s) => s.markConversationRead);
    const markSocketConnected = useChatStore((s) => s.markSocketConnected);
    const updateConversationFromMessage = useChatStore(
        (s) => s.updateConversationFromMessage
    );
    const currentUserId = useAuthStore((s) => s.uniqueUserId);

    useEffect(() => {
        let isMounted = true;
        const socket = getSocket();

        const syncConversation = async (conversationId: string) => {
            const conversation = conversations.find(
                (item) => item.conversationId === conversationId
            );
            const peerUserId = conversation?.participant.uniqueUserId;

            if (!peerUserId) return;

            const latest = await getLatestSyncedMessage(conversationId);

            socket.emit(
                "message:sync",
                {
                    conversationId,
                    after: latest?.id,
                    limit: 50,
                },
                async (ack?: SyncAck) => {
                    const encryptedMessages = ack?.messages ?? [];
                    const decryptedMessages = await decryptIncomingMessages(
                        encryptedMessages,
                        peerUserId
                    );

                    if (decryptedMessages.length === 0) return;

                    await saveMessages(decryptedMessages);
                    appendMessages(conversationId, decryptedMessages);

                    for (const message of decryptedMessages) {
                        updateConversationFromMessage(
                            message,
                            currentUserId,
                            message.conversationId === activeConversationId
                        );
                    }
                }
            );
        };

        const handleConnect = () => {
            if (isMounted) {
                markSocketConnected(true);
            }

            for (const conversation of conversations) {
                void syncConversation(conversation.conversationId);
            }
        };

        const handleDisconnect = () => {
            if (isMounted) {
                markSocketConnected(false);
            }
        };

        const handleIncomingMessage = async (
            message: IncomingEncryptedMessage
        ) => {
            if (!currentUserId) return;

            const conversation = conversations.find(
                (item) => item.conversationId === message.conversationId
            );
            const peerUserId = conversation?.participant.uniqueUserId;

            if (!peerUserId) {
                console.error("peer user id missing");
                return;
            }

            try {
                const [normalizedMessage] = await decryptIncomingMessages(
                    [message],
                    peerUserId
                );

                //FIX:  if decryptIncomingMessages fails the identity keys should be refetch  

                if (!normalizedMessage) return;

                await saveMessages([normalizedMessage]);
                appendMessages(message.conversationId, [normalizedMessage]);

                const isActive = message.conversationId === activeConversationId;
                updateConversationFromMessage(
                    normalizedMessage,
                    currentUserId,
                    isActive
                );

                if (isActive) {
                    markConversationRead(message.conversationId);
                    socket.emit("conversation:read", {
                        conversationId: message.conversationId,
                        messageId: message.id,
                    });
                }
            } catch (err) {
                console.error("failed to decrypt incoming message", err);
            }
        };

        const handleConnectError = (err: Error) => {
            console.error("Socket error:", err.message);

            if (err.message === "Unauthorized") {
                if (isMounted) {
                    markSocketConnected(false);
                }
                useAuthStore.getState().clearAuth();
            }
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("message:new", handleIncomingMessage);
        socket.on("receive_message", handleIncomingMessage);
        socket.on("connect_error", handleConnectError);

        if (socket.connected) {
            handleConnect();
        }

        return () => {
            isMounted = false;
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("message:new", handleIncomingMessage);
            socket.off("receive_message", handleIncomingMessage);
            socket.off("connect_error", handleConnectError);
        };
    }, [
        activeConversationId,
        appendMessages,
        conversations,
        currentUserId,
        markConversationRead,
        markSocketConnected,
        updateConversationFromMessage,
    ]);
};
