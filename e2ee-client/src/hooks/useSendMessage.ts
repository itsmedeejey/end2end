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
  const appendMessage = useChatStore((state) => state.appendMessage);
  const userId = useAuthStore((state) => state.userId);

  const sendMessage = (payload: SendMessagePayload) => {
    const socket = getSocket();

    if (!socket || !socket.connected) {
      console.warn("Socket not connected");
      return;
    }
    socket.emit(
      "send_message",
      payload,
      (ack?: { status?: string; messageId?: string }) => {
        const optimisticMessage: ChatMessage = {
          id: ack?.messageId ?? `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
          conversationId: payload.conversationId,
          senderId: userId ?? "__self__",
          ciphertext: payload.content,
          createdAt: new Date().toISOString(),
          status: "sent",
        };

        appendMessage(optimisticMessage);
      }
    );
  };

  return { sendMessage };
};
