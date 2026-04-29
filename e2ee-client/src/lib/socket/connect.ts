import { getSocket } from "./socket";

export const connectSocket = () => {

  const socket = getSocket();

  // Prevent duplicate connect attempts while already connected or connecting.
  if (socket.active) return;
  socket.connect();
};

export const disconnectSocket = () => {
  const socket = getSocket();

  if (socket.active) {
    socket.disconnect();
  }
};
