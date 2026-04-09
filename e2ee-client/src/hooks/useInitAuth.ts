"use client";

import { useEffect } from "react";
import api from "@/config/axios";
import { useAuthStore } from "@/store/auth.store";

export const useInitAuth = () => {
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const res = await api.get("/api/auth/me");
        const userId = res.data?.user?.sub  //NOTE: getting user's DBid from api
        const token = res.data?.accessToken;

        if (!userId) {
          if (!cancelled) {
            useAuthStore.getState().clearAuth();
          }
          return;
        }

        if (!cancelled) {
          useAuthStore.getState().setAuth(userId, token);
        }
      } catch {
        if (!cancelled) {
          useAuthStore.getState().clearAuth();
        }
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, []);
};
