import { io, Socket } from "socket.io-client";
import api from "@/config/axios";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SERVER_URL, {
      autoConnect: false,
      transports: ["websocket"],
    });
  }
  return socket;
};

export const connectSocket = async () => {
  const socket = getSocket();

  //fetching token from backend and sending the ws req

  try {
    const { data } = await api.get("/api/auth/me");

    const token = data.accessToken;

    socket.auth = { token };

    socket.connect();
  } catch (err) {
    console.error("Failed to get socket token", err);
  }
};
