"use client";

import { useEffect } from "react";
import { getSocket } from "@/lib/socket/socket";
import { useChatStore } from "@/store/chat.store";
import { useAuthStore } from "@/store/auth.store";
import { useIncomingStore } from "@/store/incoming.msg.store";
import { IncomingMessage } from "@/store/incoming.msg.store";
import { connectSocket } from "@/lib/socket/connect";

export const useSocketConnection = () => {
  const userId = useAuthStore((s) => s.userId);

  const markSocketConnected = useChatStore((s) => s.markSocketConnected);
  const enqueue = useIncomingStore((s) => s.enqueue);

  useEffect(() => {
    if (!userId) return;

    const socket = getSocket();

    const onConnect = () => {
      markSocketConnected(true);
    };

    const onDisconnect = () => {
      markSocketConnected(false);
    };

    const onMessage = (message: IncomingMessage) => {
      enqueue(message);
    };

    const onError = (err: Error) => {
      console.error("Socket error:", err.message);

      if (err.message === "Unauthorized") {
        markSocketConnected(false);
        useAuthStore.getState().clearAuth();
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("receive_message", onMessage);
    socket.on("connect_error", onError);

    connectSocket();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("receive_message", onMessage);
      socket.off("connect_error", onError);
    };
  }, [userId, enqueue, markSocketConnected]);
};
