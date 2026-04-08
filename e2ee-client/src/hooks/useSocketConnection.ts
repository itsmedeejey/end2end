"use client";

import { useEffect } from "react";
import { getSocket, connectSocket } from "@/lib/socket/socket";
import { useChatStore } from "@/store/chat.store";
import { ChatMessage } from "@/types/message.type";

export const useSocketConnection = () => {
  const appendMessage = useChatStore((s) => s.appendMessage);
  const markSocketConnected = useChatStore((s) => s.markSocketConnected);

  useEffect(() => {
    let isMounted = true;

    const initSocket = async () => {
      try {
        await connectSocket();
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
          appendMessage(message);
        });

        // ERROR HANDLING
        socket.on("connect_error", async (err) => {
          console.error("Socket error:", err.message);

          if (err.message === "Unauthorized") {
            try {
              await connectSocket(); // retry with fresh token
            } catch (e) {
              console.error("Reconnect failed:", e);
            }
          }
        });

      } catch (err) {
        console.error("Socket init failed:", err);
      }
    };

    initSocket();

    return () => {
      isMounted = false;
      const socket = getSocket();

      socket.off("connect");
      socket.off("disconnect");
      socket.off("receive_message");
      socket.off("connect_error");
    };
  }, [appendMessage, markSocketConnected]);
};

