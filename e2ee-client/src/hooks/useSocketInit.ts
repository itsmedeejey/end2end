"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { connectSocket, disconnectSocket } from "@/lib/socket/connect";

export const useSocketInit = () => {
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    if (status === "authenticated") {
      connectSocket();
    }

    if (status === "unauthenticated") {
      disconnectSocket();
    }
  }, [status]);
};
