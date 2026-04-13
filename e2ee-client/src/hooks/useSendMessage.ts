"use client";

import { getSocket } from "@/lib/socket/socket";
import { useChatStore } from "@/store/chat.store";
import { useAuthStore } from "@/store/auth.store";
import { ChatMessage } from "@/types/message.type";

type SendMessagePayload = {
  conversationId: string;
  content: string;
};

export const useSendMessage = () => {
  const appendMessage = useChatStore((s) => s.appendMessage);
  const updateMessage = useChatStore((s) => s.updateMessage);

  const userId = useAuthStore((s) => s.userId);
  const status = useAuthStore((s) => s.status);

  const sendMessage = (payload: SendMessagePayload) => {
    if (status !== "authenticated" || !userId) {
      console.error("Cannot send message: not authenticated");
      return;
    }

    const socket = getSocket();

    //TODO: create the clientTempId from senderid and reciever's id ???
    const tempId = `local-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;

    //  optimistic message
    const optimisticMessage: ChatMessage = {
      id: tempId,
      clientTempId: tempId,
      conversationId: payload.conversationId,
      senderId: userId,
      ciphertext: payload.content,
      createdAt: new Date().toISOString(),
      status: "sending",
    };

    appendMessage(optimisticMessage);

    if (!socket.connected) {
      updateMessage(tempId, { status: "failed" });
      return;
    }

    socket.emit(
      "send_message",
      {
        ...payload,
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

        //  reconcile
        updateMessage(ack.clientTempId, {
          id: ack.messageId,
          createdAt: ack.createdAt,
          clientTempId: ack.clientTempId,
          status: "sent",
        });
      }
    );
  };

  return { sendMessage };
};
