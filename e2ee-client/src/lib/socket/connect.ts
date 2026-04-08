import { getSocket } from "./socket";
import { useAuthStore } from "@/store/auth.store";

export const connectSocket = () => {
  const { accessToken, status } = useAuthStore.getState();

  if (status !== "authenticated" || !accessToken) {
    console.error("Socket connect blocked: no auth");
    return;
  }

  const socket = getSocket();

  // Prevent duplicate connect attempts while already connected or connecting.
  if (socket.connected || socket.active) return;

  socket.auth = { token: accessToken };
  socket.connect();
};

export const disconnectSocket = () => {
  const socket = getSocket();

  if (socket.connected || socket.active) {
    socket.disconnect();
  }
};
