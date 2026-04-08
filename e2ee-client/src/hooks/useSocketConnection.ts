"use client";

import { useEffect } from "react";
import { getSocket } from "@/lib/socket/socket";
import { useChatStore } from "@/store/chat.store";
import { useAuthStore } from "@/store/auth.store";
import { ChatMessage } from "@/types/message.type";

export const useSocketConnection = () => {
  const appendMessage = useChatStore((s) => s.appendMessage);
  const updateMessage = useChatStore((s) => s.updateMessage);
  const markSocketConnected = useChatStore((s) => s.markSocketConnected);

  useEffect(() => {
    let isMounted = true;
    const socket = getSocket();

    // CONNECT
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      if (isMounted) markSocketConnected(true);
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      if (isMounted) markSocketConnected(false);
    });

    // RECEIVE MESSAGE
    socket.on("receive_message", (message: ChatMessage) => {
      const normalizedMessage: ChatMessage = {
        ...message,
        status: message.status ?? "sent",
      };

      if (normalizedMessage.clientTempId) {
        updateMessage(normalizedMessage.clientTempId, normalizedMessage);
      }

      appendMessage(normalizedMessage);
    });

    // ERROR HANDLING
    socket.on("connect_error", (err) => {
      console.error("Socket error:", err.message);

      if (err.message === "Unauthorized") {
        if (isMounted) {
          markSocketConnected(false);
        }
        useAuthStore.getState().clearAuth();
      }
    });

    return () => {
      isMounted = false;
      socket.off("connect");
      socket.off("disconnect");
      socket.off("receive_message");
      socket.off("connect_error");
    };
  }, [appendMessage, updateMessage, markSocketConnected]);
};
