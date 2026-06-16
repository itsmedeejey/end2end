import { getSocket } from "@/lib/socket/socket";
import { useCallback } from "react";

export const useChatSocket = () => {
    const socket = getSocket();

    const joinConversation = useCallback((id: string) => {
        socket.emit("conversation:join", id);
    }, [socket]);

    return { joinConversation };
};
