import { getSocket } from "@/lib/socket/socket";
import { useCallback } from "react";

export const useChatSocket = () => {
  const socket = getSocket();

  const joinConversation = useCallback((id: string) => {
    socket.emit("conversation:join", id);
  }, [socket]);

  const leaveConversation = useCallback((id: string) => {
    socket.emit("conversation:leave", id);
  }, [socket]);

  return { joinConversation, leaveConversation };
};
