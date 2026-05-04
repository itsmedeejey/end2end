"use client";

import { getSocket } from "@/lib/socket/socket";
import { useChatStore } from "@/store/chat.store";
import { useAuthStore } from "@/store/auth.store";
import { ChatMessage } from "@/types/message.type";
import { ensureSession } from "@/lib/libsignal/services/session.service";
import { encryptMessage } from "@/lib/libsignal/encryptMessage";
import { getSignalStore } from "@/lib/libsignal/storeInstance";

type SendMessagePayload = {
  conversationId: string;
  receiverId: string;
  content: string;
};

export const useSendMessage = () => {
  const appendMessage = useChatStore((s) => s.appendMessage);
  const updateMessage = useChatStore((s) => s.updateMessage);

  const userId = useAuthStore((s) => s.userId);
  const status = useAuthStore((s) => s.status);

  const store = getSignalStore();

  const sendMessage = async (payload: SendMessagePayload) => {
    if (status !== "authenticated" || !userId || !store) {
      console.error("Cannot send message");
      return;
    }

    const socket = getSocket();
    const tempId = `local-${crypto.randomUUID()}`;

    // optimistic UI (still plaintext locally)
    const optimisticMessage: ChatMessage = {
      id: tempId,
      clientTempId: tempId,
      conversationId: payload.conversationId,
      senderId: userId,
      ciphertext: payload.content, // local display
      createdAt: new Date().toISOString(),
      status: "sending",
    };

    appendMessage(optimisticMessage);

    if (!socket.connected) {
      updateMessage(tempId, { status: "failed" });
      return;
    }

    try {
      //   ensure session
      await ensureSession(store, payload.receiverId);

      //   encrypt
      const encrypted = await encryptMessage(
        store,
        payload.receiverId,
        payload.content
      );

      //   send encrypted
      socket.emit(
        "send_message",
        {
          conversationId: payload.conversationId,
          ciphertext: encrypted.body,   //  base64
          messageType: encrypted.type,  //  1 or 3
          clientTempId: tempId,
        },
        (ack?: {
          status: string;
          messageId: string;
          createdAt: string;
          clientTempId: string;
        }) => {
          if (!ack || ack.status !== "ok") {
            updateMessage(tempId, { status: "failed" });
            return;
          }

          updateMessage(ack.clientTempId, {
            id: ack.messageId,
            createdAt: ack.createdAt,
            status: "sent",
          });
        }
      );
    } catch (err) {
      console.error("Encryption/send failed", err);
      updateMessage(tempId, { status: "failed" });
    }
  };

  return { sendMessage };
};
