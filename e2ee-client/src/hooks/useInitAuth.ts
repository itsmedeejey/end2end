"use client";

import { useEffect } from "react";
import api from "@/config/axios";
import { useAuthStore } from "@/store/auth.store";

export const useInitAuth = () => {
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      controller.abort("auth-init-timeout");
    }, 10000);

    const clearAuthSafely = () => {
      if (!cancelled) {
        useAuthStore.getState().clearAuth();
      }
    };

    const init = async () => {
      try {
        const res = await api.get("/api/auth/me", {
          signal: controller.signal,
          timeout: 10000,
        });
        const userId = res.data?.user?.sub; // NOTE: getting user's DBid from api
        const token = res.data?.accessToken;

        if (!userId || !token) {
          clearAuthSafely();
          return;
        }

        if (!cancelled) {
          useAuthStore.getState().setAuth(userId, token);
        }
      } catch {
        clearAuthSafely();
      } finally {
        window.clearTimeout(timeoutId);
      }
    };

    init();

    return () => {
      cancelled = true;
      controller.abort("auth-init-unmount");
      window.clearTimeout(timeoutId);
    };
  }, []);
};
