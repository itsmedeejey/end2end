"use client";

import { getSocket } from "@/lib/socket/socket";
import { useChatStore } from "@/store/chat.store";
import { useAuthStore } from "@/store/auth.store";
import { ensureSession } from "@/lib/libsodium/services/ensureSession";
import { encryptMessage } from "@/lib/libsodium/encrypt";
import { ChatMessage } from "@/types/message.type";


type SendMessagePayload = {
  conversationId: string;
  content: string;
  receiverId: string;
};


export const useSendMessage = () => {
  const appendMessage = useChatStore((s) => s.appendMessage);
  const updateMessage = useChatStore((s) => s.updateMessage);

  const userId = useAuthStore((s) => s.uniqueUserId);
  const status = useAuthStore((s) => s.status);

  const sendMessage = async (payload: SendMessagePayload) => {
    if (status !== "authenticated" || !userId) {
      console.error("Cannot send message: not authenticated");
      return;
    }

    const socket = getSocket();

    const tempId = `local-${crypto.randomUUID()}`;

    //  optimistic message
    const optimisticMessage: ChatMessage = {
      id: tempId,
      clientTempId: tempId,
      conversationId: payload.conversationId,
      senderId: userId,
      content: payload.content,
      createdAt: new Date().toISOString(),
      status: "sending",
    };

    appendMessage(optimisticMessage);

    if (!socket.connected) {
      updateMessage(tempId, { status: "failed" });
      return;
    }

    try {
      const sessionKey = await ensureSession(payload.conversationId, payload.receiverId)
      const encrypted = await encryptMessage(payload.content, sessionKey)

      socket.emit(
        "send_message",
        {
          conversationId: payload.conversationId,
          cipherText: encrypted.ciphertext,
          nonce: encrypted.nonce,
          clientTempId: tempId,
        },
        (ack?: {
          status: string;
          messageId: string;
          createdAt: string;
          clientTempId: string;
        }) => {
          if (
            !ack ||
            ack.status !== "ok" ||
            !ack.messageId ||
            !ack.createdAt ||
            !ack.clientTempId
          ) {
            updateMessage(tempId, { status: "failed" });
            return;
          }

          // reconcile
          updateMessage(ack.clientTempId, {
            id: ack.messageId,
            createdAt: ack.createdAt,
            clientTempId: ack.clientTempId,
            status: "sent",
          });
        }
      );
    } catch (err) { console.log(err) }
  };

  return { sendMessage };
};
