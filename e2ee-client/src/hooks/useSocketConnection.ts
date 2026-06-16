"use client";

import { useEffect } from "react";
import { getSocket } from "@/lib/socket/socket";
import { useChatStore } from "@/store/chat.store";
import { useAuthStore } from "@/store/auth.store";
import { getLatestSyncedMessage, saveMessages } from "@/lib/idb/chat-db";
import { deriveSessionKey } from "@/lib/libsodium/session";
import { getIdentityKeys, saveSessionKey } from "@/lib/libsodium/store/sodiumStore";
import {
    decryptIncomingMessages,
    IncomingEncryptedMessage,
} from "@/lib/chat/messages";
import api from "@/config/axios";

type SyncAck = {
    messages?: IncomingEncryptedMessage[];
};

type Payload = {
    conversationId: string;
    participant: {
        uniqueUserId: string,
        displayName: string,
    };
}
export const useSocketConnection = () => {
    const activeConversationId = useChatStore((s) => s.activeConversationId);
    const appendMessages = useChatStore((s) => s.appendMessages);
    const conversations = useChatStore((s) => s.conversations);
    const addConversation = useChatStore((s) => s.addConversation);
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

                let [normalizedMessage] = await decryptIncomingMessages(
                    [message],
                    peerUserId
                );
                if (!normalizedMessage) return;

                if (normalizedMessage.decryptFailed) {
                    console.warn("Decrypt failed, refreshing session key");
                    //refetching new identity key if decryptIncomingMessages fails
                    const response = await api.get(`/api/keys/${peerUserId}`);
                    const ReceiverPubKey = response.data.publicKey;
                    const keys = await getIdentityKeys()
                    if (!keys) {
                        throw new Error(
                            "identity keys missing"
                        );
                    }
                    const sessionKey = await deriveSessionKey(keys?.privateKey, ReceiverPubKey);
                    await saveSessionKey(message.conversationId, sessionKey);

                    // now it will retry with new session keys
                    [normalizedMessage] = await decryptIncomingMessages(
                        [message],
                        peerUserId
                    );
                }

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

        //handles new conversation and updates ui in realtime
        const handleConversation = async (payload: Payload) => {
            console.log(payload);
            addConversation(payload);
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
        socket.on("conversation:new", handleConversation)
        socket.on("connect_error", handleConnectError);

        if (socket.connected) {
            handleConnect();
        }

        return () => {
            isMounted = false;
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("message:new", handleIncomingMessage);
            socket.off("connect_error", handleConnectError);
            socket.off("conversation:new", handleConversation);

        };
    }, [
        addConversation,
        activeConversationId,
        appendMessages,
        conversations,
        currentUserId,
        markConversationRead,
        markSocketConnected,
        updateConversationFromMessage,
    ]);
};
