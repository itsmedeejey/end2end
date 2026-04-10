"use client";

import { useEffect } from "react";
import api from "@/config/axios";
import { useAuthStore } from "@/store/auth.store";

export const useInitAuth = () => {
  useEffect(() => {
    let cancelled = false;

    const setAuthSafely = (userId: string, uniqueUserId: string, displayName: string) => {
      if (!cancelled) {
        useAuthStore.getState().setAuth(userId, uniqueUserId, displayName);
      }
    };

    const clearAuthSafely = () => {
      if (!cancelled) {
        useAuthStore.getState().clearAuth();
      }
    };

    const init = async (retry = 0): Promise<void> => {
      try {
        const res = await api.get("api/auth/me");

        const userId = res.data?.user?.sub;
        const uniqueUserId = res.data?.user?.uid;
        const displayName = res.data?.user?.name;

        if (!userId) {
          clearAuthSafely();
          return;
        }

        setAuthSafely(userId, uniqueUserId, displayName);
        return;
        //eslint-disable-next-line
      } catch (err: any) { //TODO:  type safe it????
        if (
          err?.name === "CanceledError" ||
          err?.code === "ERR_CANCELED"
        ) {
          if (retry < 1) {
            return init(retry + 1); // retry once
          }
          return; // don't clear auth on cancel
        }

        clearAuthSafely(); // real error occurs then clear AuthStore
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, []);
};
