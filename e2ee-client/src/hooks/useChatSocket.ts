import { getSocket } from "@/lib/socket/socket";
import { useCallback } from "react";

export const useChatSocket = () => {
  const socket = getSocket();

  const joinConversation = useCallback((id: string) => {
    socket.emit("join:conversation", id);
  }, [socket]);

  const leaveConversation = useCallback((id: string) => {
    socket.emit("leave:conversation", id);
  }, [socket]);

  return { joinConversation, leaveConversation };
};

